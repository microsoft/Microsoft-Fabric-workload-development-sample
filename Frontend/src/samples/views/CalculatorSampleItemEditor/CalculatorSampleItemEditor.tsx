import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Stack } from "@fluentui/react";
import {
  Button,
  Combobox,
  Divider,
  Field,
  Input,
  Option,
  TabValue,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
} from "@fluentui/react-components";
import {
  TriangleRight20Regular,
} from "@fluentui/react-icons";
import { AfterNavigateAwayData } from "@ms-fabric/workload-client";
import { ContextProps, PageProps } from "src/App";
import {
  callNavigationBeforeNavigateAway,
  callNavigationAfterNavigateAway,
  callThemeOnChange,
  callOpenSettings,
  calculateResult,
  saveCalculationResult,
  loadCalculationResult,
} from "../../controller/CalculatorSampleItemEditorController";
import { Ribbon } from "./CalculatorSampleItemEditorRibbon";
import {
  CalculatorSampleItemState,
  CalculationOperator,
  Calculation
} from "../../models/CalculatorSampleWorkloadModel";
import "./../../../styles.scss";
import { LoadingProgressBar } from "../../../ItemEditor/ItemEditorLoadingProgressBar";
import { callItemGet, getWorkloadItem, saveItemState } from "../../../ItemEditor/ItemEditorController";
import { WorkloadItem } from "../../../ItemEditor/ItemEditorModel";

export function SampleItemEditor(props: PageProps) {
  const { workloadClient } = props;
  const pageContext = useParams<ContextProps>();
  const { pathname } = useLocation();

  // React state for WorkloadClient APIs
  const [operand1ValidationMessage, setOperand1ValidationMessage] = useState<string>("");
  const [operand2ValidationMessage, setOperand2ValidationMessage] = useState<string>("");
  const [editorItem, setEditorItem] =useState<WorkloadItem<CalculatorSampleItemState>>(undefined);
  const [operand1, setOperand1] = useState<number>(0);
  const [operand2, setOperand2] = useState<number>(0);
  const [operator, setOperator] = useState<CalculationOperator>(null);
  const [isDirty, setDirty] = useState<boolean>(false);
  const [calculationResult, setCalculationResult] = useState<string>("");
  const [calculationTime, setCalculationTime] = useState<Date>(undefined);
  
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
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

  useEffect(() => {
    loadDataFromUrl(pageContext, pathname);
  }, [pageContext, pathname]);


  async function afterNavigateCallBack(_event: AfterNavigateAwayData): Promise<void> {
    //clears the data after navigation
    setEditorItem(undefined);
    setCalculationResult("");
    setCalculationTime(undefined);
    return;
  }

  function isValidOperand(operand: number) {
    return operand > INT32_MIN && operand < INT32_MAX;
  }

  async function onOperand1InputChanged(value: number) {
    setOperand1(value);
    setDirty(true);
    if (!isValidOperand(value)) {
      setOperand1ValidationMessage("Operand 1 may lead to overflow");
      return;
    }
    setOperand1ValidationMessage("");
  }

  async function onOperand2InputChanged(value: number) {
    setOperand2(value);
    setDirty(true);
    if (!isValidOperand(value)) {
      setOperand2ValidationMessage("Operand 2 may lead to overflow");
      return;
    }
    setOperand2ValidationMessage("");
  }

  function onOperatorInputChanged(value: string | null) {
    setOperator(CalculationOperator[value as keyof typeof CalculationOperator] || CalculationOperator.Undefined);
    setDirty(true);
  }

  function canCalculateOperands(operand1: number, operand2: number) {
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

  async function onCalculateAndSaveButtonClick() {
    if (!canCalculateOperands(operand1, operand2)) {
      return;
    }
    try {
      var calculation = {
        operand1: operand1,
        operand2: operand2,
        operator: operator, 

      }as Calculation

      const calcResult = calculateResult(calculation);
      const calcSave = await saveCalculationResult(workloadClient, editorItem, calcResult)
      editorItem.itemState = calcSave;           
      setCalculationResult(calcResult.result.toString());
      setCalculationTime(calcResult.calculationTime);
      await SaveItem();
    } catch (error: Error | any) {
      console.error(`Error calculating result: ${error.message}`);
      setCalculationResult("Error in calculation");
      setCalculationTime(undefined);
      return;
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
        setSelectedTab("home");
        const item = await getWorkloadItem<CalculatorSampleItemState>(
                  workloadClient,
                  pageContext.itemObjectId,          
                );
        // set the metadata
        setOperand1(item?.itemState?.operand1 ?? 0);
        setOperand2(item?.itemState?.operand2 ?? 0);
        setOperand1ValidationMessage("");
        setOperand2ValidationMessage("");
        setOperator(item?.itemState?.operator ?? CalculationOperator.Undefined);
        if (item?.itemState?.lastResultFile) {
          const lastResult  = await loadCalculationResult(workloadClient, item);
          setCalculationResult(lastResult?.result.toString() ?? "");          
          setCalculationTime(lastResult?.calculationTime ?? undefined);
        }
        setEditorItem(item);
        setDirty(false);
        // clear error message
        setItemEditorErrorMessage("");
      } catch (error) {
        clearItemData();
        if (error?.ErrorCode === "ItemMetadataNotFound") {
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
    setEditorItem(undefined);
  }

  async function SaveItem() {
    var successResult = await saveItemState(workloadClient, editorItem.id, editorItem.itemState)    
    setDirty(!successResult);
  }

  async function openSettings() {
    if (editorItem) {
      const item = await callItemGet(editorItem.id, workloadClient);
      await callOpenSettings(item, workloadClient, 'About');
    }
  }

  function isDisabledCalculateButton(): boolean {
    return operator == CalculationOperator.Undefined || editorItem == undefined;
  }

  // HTML page contents
  if (isLoadingData) {
    return <LoadingProgressBar message="Loading..." />;
  }
  return (
    <Stack className="editor" data-testid="sample-workload-editor-inner">
      <Ribbon
        {...props}        
        isSaveButtonEnabled={isDirty && editorItem !== undefined}
        saveItemCallback={SaveItem}
        openSettingsCallback={openSettings}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
      />

      <Stack className="main">
        {["home"].includes(selectedTab as string) && (
          <span>
            <h2>Frontend Sample Item Editor</h2>
            {/* Crud item API usage example */}
            {itemEditorErrorMessage && (
              <MessageBar intent="error">
                <MessageBarBody className="message-bar-body">
                  <MessageBarTitle>
                    You cannot edit this item.
                  </MessageBarTitle>
                  {itemEditorErrorMessage}
                </MessageBarBody>
              </MessageBar>
            )}
            {!itemEditorErrorMessage && (
              <div>                
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
                      value={CalculationOperator[operator]}
                      onOptionSelect={(_, opt) =>
                        onOperatorInputChanged(opt.optionValue)
                      }
                    >
                      { 
                        Object.keys(CalculationOperator).filter(key => isNaN(Number(key))).map(
                          (option) => (
                            <Option key={option} text={option} value={option}>{option}</Option>
                          ))}
                    </Combobox>
                  </Field>
                  <Button
                    appearance="primary"
                    icon={<TriangleRight20Regular />}
                    disabled={isDisabledCalculateButton()}
                    onClick={() => onCalculateAndSaveButtonClick()}
                  >
                    Calculate & Save Result
                  </Button>
                </div>
                <Divider alignContent="start">Calculation result from storage</Divider>
                <div className="section">
                  <Field
                    label="Last result"
                    orientation="horizontal"
                    className="field"
                  >
                    <Input
                      size="small"
                      readOnly={true}
                      placeholder="Last calculation result"                      
                      data-testid="lastresult-input"
                      value={calculationResult}
                    />
                  </Field>
                  <Field
                    label="Last run"
                    orientation="horizontal"
                    className="field"
                  >
                    <Input
                      size="small"
                      readOnly={true}
                      type="text"
                      placeholder="Calculation Time"
                      data-testid="lastCalculationTime-input"
                      value={calculationTime ? calculationTime.toString() : ""}
                    />
                  </Field>
                </div>
              </div>
            )}
          </span>
        )}
      </Stack>
    </Stack>
  );
}

