import React, { useState, useEffect, FormEvent } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Stack } from "@fluentui/react";
import {
  Button,
  Combobox,
  Divider,
  Field,
  Input,
  Label,
  Option,
  Radio,
  RadioGroup,
  TabValue,
  Tooltip,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  MessageBarActions,
  RadioGroupOnChangeData
} from "@fluentui/react-components";
import { initializeIcons } from "@fluentui/font-icons-mdl2";
import {
  Database16Regular,
  TriangleRight20Regular,
} from "@fluentui/react-icons";
import { AfterNavigateAwayData } from "@ms-fabric/workload-client";
import { ContextProps, PageProps } from "src/App";
import {
  callNavigationBeforeNavigateAway,
  callNavigationAfterNavigateAway,
  callThemeOnChange,
  callDatahubOpen,
  callItemGet,
  callItemUpdate,
  callItemDelete,
  callGetItem1SupportedOperators,
  callItem1DoubleResult,
  isOneLakeSupported,
  getLastResult,
  callOpenSettings
} from "../../controller/SampleWorkloadController";
import { Ribbon } from "../SampleWorkloadRibbon/SampleWorkloadRibbon";
import { convertGetItemResultToWorkloadItem } from "../../utils";
import {
  Item1ClientMetadata,
  GenericItem,
  ItemPayload,
  UpdateItemPayload,
  WorkloadItem,
} from "../../models/SampleWorkloadModel";
import "./../../styles.scss";
import { ItemMetadataNotFound } from "../../models/WorkloadExceptionsModel";
import { LoadingProgressBar } from "../LoadingIndicator/LoadingProgressBar";


export function SampleWorkloadEditor(props: PageProps) {
  const sampleWorkloadBEUrl = process.env.WORKLOAD_BE_URL;
  const { workloadClient } = props;
  const pageContext = useParams<ContextProps>();
  const { pathname } = useLocation();

  // initializing usage of FluentUI icons
  initializeIcons();

  // React state for WorkloadClient APIs
  const [operand1ValidationMessage, setOperand1ValidationMessage] =
    useState<string>("");
  const [operand2ValidationMessage, setOperand2ValidationMessage] =
    useState<string>("");
  const [selectedLakehouse, setSelectedLakehouse] = useState<GenericItem>(undefined);
  const [sampleItem, setSampleItem] =
    useState<WorkloadItem<ItemPayload>>(undefined);
  const [operand1, setOperand1] = useState<number>(0);
  const [operand2, setOperand2] = useState<number>(0);
  const [operator, setOperator] = useState<string | null>(null);
  const [isDirty, setDirty] = useState<boolean>(false);
  const [invalidOperands, setInvalidOperands] = useState<boolean>(false);
  const [supportedOperators, setSupportedOperators] = useState<string[]>([]);
  const [hasLoadedSupportedOperators, setHasLoadedSupportedOperators] = useState(false);
  const [canUseOneLake, setCanUseOneLake] = useState<boolean>(false);
  const [storageName, setStorageName] = useState<string>("Lakehouse");
  const [calculationResult, setCalculationResult] = useState<string>("");
  const [isLoadingOperators, setIsLoadingOperators] = useState<boolean>(true);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const isLoading = isLoadingOperators || isLoadingData;
  const [itemEditorErrorMessage, setItemEditorErrorMessage] = useState<string>("");

  const INT32_MIN = -2147483648;
  const INT32_MAX = 2147483647;

  const [selectedTab, setSelectedTab] = useState<TabValue>("home");

  useEffect(() => {
    // Controller callbacks registrations:
    // register Blocking in Navigate.BeforeNavigateAway (for a forbidden url)
    callNavigationBeforeNavigateAway(workloadClient);

    // register a callback in Navigate.AfterNavigateAway
    callNavigationAfterNavigateAway(afterNavigateCallBack, workloadClient);

    // register Theme.onChange
    callThemeOnChange(workloadClient);
  }, []);

  // Effect to load supported operators once on component mount
  useEffect(() => {
    loadSupportedOperators();
  }, []);

  useEffect(() => {
    if (hasLoadedSupportedOperators) {
      loadDataFromUrl(pageContext, pathname);
    }
  }, [hasLoadedSupportedOperators, pageContext, pathname]);

  async function loadCanUseOneLake(workspaceId: string, itemId: string): Promise<void> {
    try {
      const oneLakeSupported = await isOneLakeSupported(sampleWorkloadBEUrl, workloadClient, workspaceId, itemId);
      setCanUseOneLake(oneLakeSupported);
    } catch (error) {
      console.error(`Error loading oneLakeSupported: ${error}`);
    }
  }

  async function loadCalculationResult(itemId: string): Promise<void> {
    try {
      const calcaulationResult = await getLastResult(sampleWorkloadBEUrl, workloadClient, itemId);
      setCalculationResult(calcaulationResult);
    } catch (error) {
      console.error(`Error loading loadCalculationResult: ${error}`);
    }
  }

  async function loadSupportedOperators(): Promise<void> {
    setIsLoadingOperators(true);
    try {
      const operators = await callGetItem1SupportedOperators(sampleWorkloadBEUrl, workloadClient);
      setSupportedOperators(operators);
      setHasLoadedSupportedOperators(true);
    } catch (error) {
      console.error(`Error loading supported operators: ${error}`);
      setHasLoadedSupportedOperators(false);
    }
    finally {
      setIsLoadingOperators(false);
    }
  }

  async function afterNavigateCallBack(_event: AfterNavigateAwayData): Promise<void> {
    //clears the data after navigation
    setSelectedLakehouse(undefined);
    setSampleItem(undefined);
    return;
  }

  async function onCallDatahubLakehouse() {
    const result = await callDatahubOpen(
      ["Lakehouse"],
      "Select a Lakehouse to use for Sample Workload",
      false,
      workloadClient
    );
    if (result) {
      setSelectedLakehouse(result);
      setDirty(true);
    }
  }

  function isValidOperand(operand: number) {
    return operand > INT32_MIN && operand < INT32_MAX;
  }

  async function onOperand1InputChanged(value: number) {
    setOperand1(value);
    setDirty(true);
    if (!isValidOperand(value)) {
      setOperand1ValidationMessage("Operand 1 may lead to overflow");
      setInvalidOperands(true);
      return;
    }
    setOperand1ValidationMessage("");
    setInvalidOperands(!isValidOperand(operand2));
  }

  async function onOperand2InputChanged(value: number) {
    setOperand2(value);
    setDirty(true);
    if (!isValidOperand(value)) {
      setOperand2ValidationMessage("Operand 2 may lead to overflow");
      setInvalidOperands(true);
      return;
    }
    setOperand2ValidationMessage("");
    setInvalidOperands(!isValidOperand(operand1));
  }

  function onOperatorInputChanged(value: string | null) {
    setOperator(value);
    setDirty(true);
  }

  function canDoubleOperands(operand1: number, operand2: number) {
    const isOperand1Valid = isValidOperand(operand1);
    const isOperand2Valid = isValidOperand(operand2);
    if (!isOperand1Valid) {
      setOperand1ValidationMessage("Operand 1 may lead to overflow if doubled");
    }
    if (!isOperand2Valid) {
      setOperand2ValidationMessage("Operand 2 may lead to overflow if doubled");
    }
    return isOperand1Valid && isOperand2Valid;
  }

  async function onDoubleButtonClick() {
    if (sampleItem && canDoubleOperands(operand1*2, operand2*2)) {
      const result = await callItem1DoubleResult(
        sampleWorkloadBEUrl,
        workloadClient,
        sampleItem.workspaceId,
        sampleItem.id
      );
      if (result) {
        // Update both operands
        setOperand1(result.Operand1);
        setOperand2(result.Operand2);
      }
    }
  }

  async function loadDataFromUrl(
    pageContext: ContextProps,
    pathname: string
  ): Promise<void> {
    setIsLoadingData(true);
    if (pageContext.itemObjectId) {
      // for Edit scenario we get the itemObjectId and then load the item via the workloadClient SDK
      try {
        const getItemResult = await callItemGet(
          pageContext.itemObjectId,
          workloadClient
        );
        const item = convertGetItemResultToWorkloadItem<ItemPayload>(getItemResult);
        setSampleItem(item);
        setSelectedTab("home");

        // load extendedMetadata
        const item1Metadata: Item1ClientMetadata =
          item.extendedMetdata.item1Metadata;
        setSelectedLakehouse(item1Metadata?.lakehouse);
        setOperand1(item1Metadata?.operand1);
        setOperand2(item1Metadata?.operand2);
        setOperand1ValidationMessage("");
        setOperand2ValidationMessage("");
        setInvalidOperands(false);
        setStorageName(item1Metadata?.useOneLake ? "OneLake" : "Lakehouse");
        const loadedOperator = item1Metadata?.operator;
        const isValidOperator = loadedOperator && supportedOperators.includes(loadedOperator);
        setOperator(isValidOperator ? loadedOperator : null);
        await loadCanUseOneLake(item.workspaceId, item.id);
        await loadCalculationResult(item.id);
        setItemEditorErrorMessage("");
      } catch (error) {
        clearItemData();
        if (error?.ErrorCode === ItemMetadataNotFound) {
          setItemEditorErrorMessage(error?.Message);
          return;
        }
        console.error(
          `Error loading the Item (object ID:${pageContext.itemObjectId}`,
          error
        );
      }
      finally {
        setIsLoadingData(false);
      }
    } else {
      console.log(`non-editor context. Current Path: ${pathname}`);
      clearItemData();
      setIsLoadingData(false);
    }
  }

  function clearItemData() {
    setSampleItem(undefined);
  }

  async function SaveItem() {
    let payload: UpdateItemPayload = {
      item1Metadata: {
        lakehouse: selectedLakehouse,
        operand1: operand1,
        operand2: operand2,
        operator: operator,
        useOneLake: storageName === "OneLake"
      },
    };

    var successResult = await callItemUpdate(sampleItem.id, payload, workloadClient);
    setDirty(!successResult);
  }

  async function openSettings() {
    if (sampleItem) {
      const item = await callItemGet(sampleItem.id, workloadClient);
      await callOpenSettings(item, workloadClient, 'About');
    }
  }

  async function deleteItem(itemId: string) {
    await callItemDelete(itemId, workloadClient);
  }

  function getItemObjectId() {
    return sampleItem?.id || pageContext.itemObjectId;
  }

  function isDisabledDoubleResultButton(): boolean {
    return isDirty || operator == "0" || sampleItem == undefined;
  }

  const selectedStorageChanged = (ev: FormEvent<HTMLDivElement>, data: RadioGroupOnChangeData) => {
    setStorageName(data.value);
    setDirty(true);
  };

  function getOneLakeTooltipText(regularTooltipMessage: string, canUseOneLake: boolean): string {
    return !canUseOneLake
      ? 'OneLake is not supported for this item type. CreateOneLakeFoldersOnArtifactCreation attribute must be set in the item manifest.'
      : regularTooltipMessage;
  }

  // HTML page contents
  if (isLoading) {
    return <LoadingProgressBar message="Loading..." />;
  }
  return (
    <Stack className="editor" data-testid="sample-workload-editor-inner">
      <Ribbon
        {...props}
        isStorageSelected={selectedLakehouse != undefined || storageName === "OneLake"}
        //  disable save when in Frontend-only
        isSaveButtonEnabled={
          sampleItem?.id !== undefined &&
          (selectedLakehouse != undefined || storageName === "OneLake") &&
          isDirty &&
          !invalidOperands &&
          !!operator
        }
        saveItemCallback={SaveItem}
        isFEOnly={sampleItem?.id !== undefined}
        openSettingsCallback={openSettings}
        itemObjectId={getItemObjectId()}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        isDirty={isDirty}
        invalidOperands={invalidOperands}
      />

      <Stack className="main">
        {["jobs", "home"].includes(selectedTab as string) && (
          <span>
            <h2>Sample Item Editor</h2>
            {/* Crud item API usage example */}
            {itemEditorErrorMessage && (
              <MessageBar intent="error">
                <MessageBarBody className="message-bar-body">
                  <MessageBarTitle>
                    You cannot edit this item.
                  </MessageBarTitle>
                  {itemEditorErrorMessage}
                  <MessageBarActions>
                    <Button onClick={() => deleteItem(pageContext.itemObjectId)}>
                      Delete Item
                    </Button>
                  </MessageBarActions>
                </MessageBarBody>
              </MessageBar>
            )}
            {!itemEditorErrorMessage && (
              <div>
                <Divider alignContent="start">
                  {sampleItem ? "" : "New "}Item Details
                </Divider>
                <div className="section" data-testid='item-editor-metadata' >
                  {sampleItem && (
                    <Label>WorkspaceId Id: {sampleItem?.workspaceId}</Label>
                  )}
                  {sampleItem && <Label>Item Id: {sampleItem?.id}</Label>}
                  {sampleItem && (
                    <Label>Item Display Name: {sampleItem?.displayName}</Label>
                  )}
                  {sampleItem && (
                    <Label>Item Description: {sampleItem?.description}</Label>
                  )}
                </div>
                <Divider alignContent="start">Calculation result storage</Divider>
                <div className="section">
                  <Label>Store calculation result to {storageName}</Label>
                  <RadioGroup onChange={selectedStorageChanged} value={storageName}>
                    <Radio value="Lakehouse" label="Lakehouse" />
                    {storageName === "Lakehouse" && (
                      <div style={{ marginLeft: "32px", padding: "4px" }}>
                        <Stack>
                          <Field
                            label="Name"
                            orientation="horizontal"
                            className="field"
                          >
                            <Stack horizontal>
                              <Input
                                size="small"
                                placeholder="Lakehouse Name"
                                style={{ marginLeft: "10px" }}
                                value={
                                  selectedLakehouse ? selectedLakehouse.displayName : ""
                                }
                              />
                              <Button
                                style={{ width: "24px", height: "24px" }}
                                icon={<Database16Regular />}
                                appearance="primary"
                                onClick={() => onCallDatahubLakehouse()}
                                data-testid="item-editor-lakehouse-btn"
                              />
                            </Stack>
                          </Field>
                          <Field
                            label="ID"
                            orientation="horizontal"
                            className="field"
                          >
                            <Input
                              size="small"
                              placeholder="Lakehouse ID"
                              style={{ marginLeft: "10px" }}
                              value={selectedLakehouse ? selectedLakehouse.id : ""}
                              data-testid="lakehouse-id-input"
                            />
                          </Field>
                        </Stack>
                      </div>)}
                    <Tooltip
                      content={getOneLakeTooltipText("Item folder in OneLake", canUseOneLake)}
                      relationship="label">
                      <Radio 
                        value="OneLake" 
                        label="Item folder in OneLake" 
                        disabled={!canUseOneLake} 
                        data-testid="onelake-radiobutton-tooltip" />
                    </Tooltip>
                  </RadioGroup>
                  <Field
                    label="Last result"
                    orientation="horizontal"
                    className="field"
                  >
                    <Input
                      size="small"
                      placeholder="Last calculation result"
                      data-testid="lastresult-input"
                      value={calculationResult}
                    />
                  </Field>
                </div>
                <Divider alignContent="start">Calculation definition</Divider>
                <div className="section">
                  <Field
                    label="Operand 1"
                    validationMessage={operand1ValidationMessage}
                    orientation="horizontal"
                    className="field"
                  >
                    <Input
                      size="small"
                      type="number"
                      placeholder="Value of the 1st operand"
                      value={operand1.toString()}
                      onChange={(e) =>
                        onOperand1InputChanged(parseInt(e.target.value))
                      }
                      data-testid="operand1-input"
                    />
                  </Field>
                  <Field
                    label="Operand 2"
                    validationMessage={operand2ValidationMessage}
                    orientation="horizontal"
                    className="field"
                  >
                    <Input
                      size="small"
                      type="number"
                      placeholder="value of the 2nd operand"
                      value={operand2.toString()}
                      onChange={(e) =>
                        onOperand2InputChanged(parseInt(e.target.value))
                      }
                      data-testid="operand2-input"
                    />
                  </Field>
                  <Field
                    label="Operator"
                    orientation="horizontal"
                    className="field"
                  >
                    <Combobox
                      key={pageContext.itemObjectId}
                      data-testid="operator-combobox"
                      placeholder="Operator"
                      value={operator ?? ''}
                      onOptionSelect={(_, opt) =>
                        onOperatorInputChanged(opt.optionValue)
                      }
                    >
                      {supportedOperators.map((option) => (
                        <Option key={option} data-testid={option} value={option}>{option}</Option>
                      ))}
                    </Combobox>
                  </Field>
                  <Button
                    appearance="primary"
                    icon={<TriangleRight20Regular />}
                    disabled={isDisabledDoubleResultButton()}
                    onClick={() => onDoubleButtonClick()}
                  >
                    Double the operands
                  </Button>
                </div>
              </div>
            )}
          </span>
        )}
      </Stack>
    </Stack>
  );
}

