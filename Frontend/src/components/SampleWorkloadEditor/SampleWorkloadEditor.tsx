import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Stack } from "@fluentui/react";
import {
  Button,
  Checkbox,
  Combobox,
  Divider,
  Field,
  Input,
  Label,
  Option,
  Radio,
  RadioGroup,
  SelectTabData,
  Switch,
  Tab,
  TabList,
  TabValue,
  Tooltip,
  useId,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  MessageBarActions
} from "@fluentui/react-components";

import { useTranslation } from "react-i18next";
import { initializeIcons } from "@fluentui/font-icons-mdl2";
import {
  Save24Regular,
  AlertOn24Regular,
  PanelRightExpand20Regular,
  Database16Regular,
  TriangleRight20Regular,
} from "@fluentui/react-icons";
import { AfterNavigateAwayData } from "@ms-fabric/workload-client";
import { ContextProps, PageProps } from "src/App";
import {
  callNotificationOpen,
  callNotificationHide,
  callPanelOpen,
  callDialogOpenMsgBox,
  callErrorHandlingOpenDialog,
  callErrorHandlingRequestFailure,
  callNavigationNavigate,
  callPageOpen,
  callNavigationBeforeNavigateAway,
  callNavigationAfterNavigateAway,
  callThemeGet,
  callThemeOnChange,
  callSettingsGet,
  callLanguageGet,
  callSettingsOnChange,
  themeToView,
  settingsToView,
  callActionExecute,
  callDatahubOpen,
  callItemGet,
  callItemUpdate,
  callItemDelete,
  callGetItem1SupportedOperators,
  callItem1DoubleResult
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
import { LakehouseExplorerComponent } from "../SampleWorkloadLakehouseExplorer/SampleWorkloadLakehouseExplorer";
import { ItemMetadataNotFound} from "../../models/WorkloadExceptionsModel";

export function SampleWorkloadEditor(props: PageProps) {
  const sampleWorkloadName = process.env.WORKLOAD_NAME;
  const sampleItemType = sampleWorkloadName + ".SampleWorkloadItem";
  const sampleWorkloadBEUrl = process.env.WORKLOAD_BE_URL;
  const { workloadClient } = props;
  const pageContext = useParams<ContextProps>();
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();

  // initializing usage of FluentUI icons
  initializeIcons();

  // React state for WorkloadClient APIs
  const [apiNotificationTitle, setNotificationTitle] = useState<string>("");
  const [apiNotificationMessage, setNotificationMessage] = useState<string>("");
  const [notificationId, setNotificationId] = useState<string>("");
  const [notificationValidationMessage, setNotificationValidationMessage] =
    useState<string>("");
  const [operand1ValidationMessage, setOperand1ValidationMessage] =
    useState<string>("");
  const [operand2ValidationMessage, setOperand2ValidationMessage] =
    useState<string>("");
  const [apiPanelIsLightDismiss, setApiPanelIsLightDismiss] =
    useState<boolean>(false);
  const [apiDialogMsgboxTitle, setApiDialogMsgboxTitle] = useState<string>("");
  const [apiDialogMsgboxContent, setApiDialogMsgboxContent] =
    useState<string>("");
  const [apiDialogMsgboxLink, setApiDialogMsgboxLink] =
    useState<string>("");
  const [apiDialogMsgboxButtonCount, setApiDialogMsgboxButtonCount] =
    useState<number>(0);
  const [apiErrorTitle, setApiErrorTitle] = useState<string>("");
  const [apiErrorMessage, setApiErrorMessage] = useState<string>("");
  const [apiErrorFailureMessage, setApiErrorFailureMessage] =
    useState<string>("");
  const [apiErrorFailureCode, setApiErrorFailureCode] = useState<number>(1);
  const [apiErrorStatusCode, setApiErrorStatusCode] = useState<string>("");
  const [apiErrorRequestId, setApiErrorRequestId] = useState<string>("");
  const [apiErrorStackTrace, setApiErrorStackTrace] = useState<string>("");
  const [selectedLakehouse, setSelectedLakehouse] =
    useState<GenericItem>(undefined);
  const [selectedLinkedItem, setSelectedLinkedItem] = useState<GenericItem>(null);
  const [datahubDialogDescription, setDatahubDialogDescription] = useState<string>("Dialog description");
  const [dataHubMsgBoxType, setDataHubMsgBoxType] = useState<string>(sampleItemType);
  const dataHubMsgBoxTypes = ["Lakehouse", sampleItemType];
  const [sampleItem, setSampleItem] =
    useState<WorkloadItem<ItemPayload>>(undefined);
  const [isWorkspaceExplorerPresented, setWorkspaceExplorerPresented] = useState<boolean>(false);
  const [isMultiSelectionEnabled, setMultiSelectionEnabled] = useState<boolean>(false);
  const [operand1, setOperand1] = useState<number>(0);
  const [operand2, setOperand2] = useState<number>(0);
  const [operator, setOperator] = useState<string | null>(null);
  const [isDirty, setDirty] = useState<boolean>(false);
  const [supportedOperators, setSupportedOperators] = useState<string[]>([]);
  const [hasLoadedSupportedOperators, setHasLoadedSupportedOperators] = useState(false);
  
  const [lang, setLang] = useState<string>('en-US');
  const [itemEditorErrorMessage, setItemEditorErrorMessage] = useState<string>("");
  document.body.dir = i18n.dir();

  const msgboxButtonCountOptions = ["0", "1", "2", "3"];
  const INT32_MIN = -2147483648;
  const INT32_MAX = 2147483647;
  const radioName = useId("radio");
  const labelId = useId("label");
  const inputId = useId("input");


  const [selectedTab, setSelectedTab] = useState<TabValue>("home");
  const [selectedApiTab, setSelectedApiTab] =
    useState<TabValue>("apiNotification");




  useEffect(() => {
    callLanguageGet(workloadClient).then((lang) => setLang(lang));

    // Controller callbacks registrations:
    // register Blocking in Navigate.BeforeNavigateAway (for a forbidden url)
    callNavigationBeforeNavigateAway(workloadClient);

    // register a callback in Navigate.AfterNavigateAway
    callNavigationAfterNavigateAway(afterNavigateCallBack, workloadClient);

    // register Theme.onChange
    callThemeOnChange(workloadClient);

    // register Settings.onChange
    callSettingsOnChange(workloadClient, i18n.changeLanguage);
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


  async function loadSupportedOperators(): Promise<void> {
    try {
      const operators = await callGetItem1SupportedOperators(sampleWorkloadBEUrl, workloadClient);
      setSupportedOperators(operators);
      setHasLoadedSupportedOperators(true);
    } catch (error) {
      console.error(`Error loading supported operators: ${error}`);
      setHasLoadedSupportedOperators(false);
    }
  }

  async function afterNavigateCallBack(_event: AfterNavigateAwayData): Promise<void> {
    //clears the data after navigation
    setSelectedLakehouse(undefined);
    setSampleItem(undefined);
    return;
  }

  // callback functions called by UI controls below

  function onCallNotification() {
    if (apiNotificationTitle.trim() == "") {
      setNotificationValidationMessage("Notification title is required");
      return;
    }

    setNotificationValidationMessage("");
    callNotificationOpen(
      apiNotificationTitle,
      apiNotificationMessage,
      undefined,
      undefined,
      workloadClient,
      setNotificationId
    );
  }

  function onCallNotificationHide() {
    callNotificationHide(notificationId, workloadClient, setNotificationId);
  }

  async function onCallOpenPanel() {
    callPanelOpen(
      sampleWorkloadName,
      "/panel",
      apiPanelIsLightDismiss,
      workloadClient
    );
  }

  async function onCallOpenMessageBox() {
    const buttonNames: string[] = [];
    for (let i = 1; i <= apiDialogMsgboxButtonCount; ++i) {
      buttonNames.push(`Button ${i}`);
    }
    callDialogOpenMsgBox(
      apiDialogMsgboxTitle,
      apiDialogMsgboxContent,
      buttonNames,
      workloadClient,
      apiDialogMsgboxLink
    );
  }

  async function onCallOpenError() {
    await callErrorHandlingOpenDialog(
      apiErrorMessage,
      apiErrorTitle,
      apiErrorStatusCode,
      apiErrorStackTrace,
      apiErrorRequestId,
      workloadClient
    );
  }

  async function onCallErrorFailureHandling() {
    await callErrorHandlingRequestFailure(
      apiErrorFailureMessage,
      apiErrorFailureCode,
      workloadClient
    );
  }

  async function onCallNavigate(path: string) {
    await callNavigationNavigate("workload", path, workloadClient);
  }

  async function onCallOpenPage() {
    await callPageOpen(sampleWorkloadName, `/sample-page/${sampleItem.id}`, workloadClient);
  }

  async function onCallThemeGet() {
    const themeString: string = themeToView(await callThemeGet(workloadClient));
    callDialogOpenMsgBox(
      "Theme Configuration",
      themeString,
      ["OK"],
      workloadClient
    );
  }

  async function onCallSettingsGet() {
    const settingsString: string = settingsToView(
      await callSettingsGet(workloadClient)
    );
    callDialogOpenMsgBox(
      "Settings Configuration",
      settingsString,
      ["OK"],
      workloadClient
    );
  }

  async function onCallExecuteAction() {
    callActionExecute("sample.Action", sampleWorkloadName, workloadClient);
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

  async function onCallDatahubFromPlayground() {
    const result = await callDatahubOpen(
      [dataHubMsgBoxType],
      datahubDialogDescription,
      isMultiSelectionEnabled,
      workloadClient,
      isWorkspaceExplorerPresented
    );
    if (result) {
      setSelectedLinkedItem(result);
    }
  }

  async function onOperand1InputChanged(value: number) {
    setOperand1ValidationMessage("");
    setOperand1(value);
    setDirty(true);
  }

  async function onOperand2InputChanged(value: number) {
    setOperand2ValidationMessage("");
    setOperand2(value);
    setDirty(true);
  }

  function onOperatorInputChanged(value: string | null) {
    setOperator(value);
    setDirty(true);
  }

  function validateOperandsBeforeDouble() {
    var valid = true;
    if (operand1 < INT32_MIN/2 || operand1 > INT32_MAX/2) {
      setOperand1ValidationMessage("Operand 1 may lead to overflow if doubled");
      valid = false;
    }
    if (operand2 < INT32_MIN/2 || operand2 > INT32_MAX/2) {
      setOperand2ValidationMessage("Operand 2 may lead to overflow if doubled");
      valid = false;
    }
    return valid;
  }

  async function onDoubleButtonClick() {
    if (sampleItem && validateOperandsBeforeDouble()) {
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
    if (pageContext.itemObjectId) {
      // for Edit scenario we get the itemObjectId and then load the item via the workloadClient SDK
      try {
        const getItemResult = await callItemGet(
          pageContext.itemObjectId,
          workloadClient
        );
        const item =
          convertGetItemResultToWorkloadItem<ItemPayload>(getItemResult);

        setSampleItem(item);

        // load extendedMetadata
        const item1Metadata: Item1ClientMetadata =
          item.extendedMetdata.item1Metadata;
        setSelectedLakehouse(item1Metadata?.lakehouse);
        setOperand1(item1Metadata?.operand1);
        setOperand2(item1Metadata?.operand2);
        
        const loadedOperator = item1Metadata?.operator;
        const isValidOperator = loadedOperator && supportedOperators.includes(loadedOperator);
        setOperator(isValidOperator ? loadedOperator : null);
        
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
    } else {
      console.log(`non-editor context. Current Path: ${pathname}`);
      clearItemData();
    }
  }



  function clearItemData() {
    setSampleItem(undefined);
  }

  async function SaveItem() {
    // call ItemUpdate with the current payload contents
    let payload: UpdateItemPayload = {
      item1Metadata: {
        lakehouse: selectedLakehouse,
        operand1: operand1,
        operand2: operand2,
        operator: operator,
      },
    };

    await callItemUpdate(sampleItem.id, payload, workloadClient);

    setDirty(false);
  }

  async function deleteCurrentItem() {
    if (sampleItem) {
      await deleteItem(sampleItem.id);
      // navigate to workspaces page after delete
      await callNavigationNavigate("host", `/groups/${sampleItem.workspaceId}`, workloadClient);
    }
  }

  async function deleteItem(itemId: string) {
    await callItemDelete(itemId, workloadClient);
  }

  function getItemObjectId() {
    const params = useParams<ContextProps>();
    return sampleItem?.id || params.itemObjectId;
  }

  function isDisabledDoubleResultButton(): boolean {
    return isDirty || operator == "0" || sampleItem == undefined;
  }

  // HTML page contents
  return (
    <Stack className="editor" data-testid="sample-workload-editor-inner">
      <Ribbon
        {...props}
        isLakeHouseSelected={selectedLakehouse != undefined}
        //  disable save when in Frontend-only
        isSaveButtonEnabled={
          sampleItem?.id !== undefined &&
          selectedLakehouse != undefined &&
          isDirty &&
          !!operator
        }
        saveItemCallback={SaveItem}
        isDeleteEnabled={sampleItem?.id !== undefined}
        deleteItemCallback={deleteCurrentItem}
        itemObjectId={getItemObjectId()}
        onTabChange={setSelectedTab}
        isDirty={isDirty}
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
                <Divider alignContent="start">Selected Lakehouse Details</Divider>
                <div className="section">
                  <Stack horizontal>
                    <Field
                      label="Lakehouse"
                      orientation="horizontal"
                      className="field"
                    >
                      <Input
                        size="small"
                        placeholder="Lakehouse Name"
                        style={{ marginLeft: "10px" }}
                        value={
                          selectedLakehouse ? selectedLakehouse.displayName : ""
                        }
                      />
                    </Field>
                    <Button
                      style={{ width: "24px", height: "24px" }}
                      icon={<Database16Regular />}
                      appearance="primary"
                      onClick={() => onCallDatahubLakehouse()}
                      data-testid="item-editor-lakehouse-btn"
                    />
                  </Stack>
                  <Field
                    label="Lakehouse ID"
                    orientation="horizontal"
                    className="field"
                  >
                    <Input
                      size="small"
                      placeholder="Lakehouse ID"
                      value={selectedLakehouse ? selectedLakehouse.id : ""}
                      data-testid="lakehouse-id-input"
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
                <Divider alignContent="start">Authentication</Divider>
                <div className="section">
                  <Button
                    appearance="primary"
                    icon={<PanelRightExpand20Regular />}
                    onClick={() => onCallNavigate(`/Authentication/${sampleItem.id}`)}
                  >
                    Navigate to Authentication Page
                  </Button>
                </div>
              </div>
            )}
          </span>
        )}
        {selectedTab == "api" && (
          <span>
            <TabList
              className="tabListContainer"
              defaultSelectedValue={selectedApiTab}
              data-testid="item-editor-selected-tab-btn"
              onTabSelect={(_, data: SelectTabData) =>
                setSelectedApiTab(data.value)
              }
            >
              <Tab value="apiNotification">Notification</Tab>
              <Tab value="apiActionDialog">Action & Dialog</Tab>
              <Tab value="apiPanelSettings">Panel & Settings</Tab>
              <Tab value="apiNavigation">Navigation</Tab>
              <Tab value="apiDataHub" data-testid="api-data-hub-tab-btn">Data Hub</Tab>
            </TabList>
            {selectedApiTab == "apiNotification" && (
              <span>
                {/* Notification API usage example */}
                <div className="section">
                  <Field
                    label="Title"
                    validationMessage={notificationValidationMessage}
                    orientation="horizontal"
                    className="field"
                  >
                    <Input
                      size="small"
                      placeholder="Notification Title"
                      onChange={(e) => setNotificationTitle(e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Message"
                    orientation="horizontal"
                    className="field"
                  >
                    <Input
                      size="small"
                      placeholder="Notification Message"
                      onChange={(e) => setNotificationMessage(e.target.value)}
                    />
                  </Field>
                  <Stack horizontal tokens={{ childrenGap: 10 }}>
                    <Button
                      icon={<AlertOn24Regular />}
                      appearance="primary"
                      onClick={() => onCallNotification()}
                    >
                      Send Notification
                    </Button>
                    <Button onClick={() => onCallNotificationHide()}>
                      Hide Notification
                    </Button>
                  </Stack>
                </div>
              </span>
            )}
            {selectedApiTab == "apiActionDialog" && (
              <span>
                {/* Action API usage example */}
                <Divider alignContent="start">Action</Divider>
                <div className="section">
                  <Button
                    appearance="primary"
                    icon={<PanelRightExpand20Regular />}
                    onClick={() => onCallExecuteAction()}
                  >
                    Execute an Action
                  </Button>
                </div>
                {/* Dialog MessageBox API usage example */}
                <Divider alignContent="start">Dialog Message Box</Divider>
                <div className="section">
                  <Field
                    label="Message Box Title"
                    orientation="horizontal"
                    className="field"
                  >
                    <Input
                      size="small"
                      placeholder="Title"
                      onChange={(e) => setApiDialogMsgboxTitle(e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Message Box Content"
                    orientation="horizontal"
                    className="field"
                  >
                    <Input
                      size="small"
                      placeholder="Content..."
                      onChange={(e) =>
                        setApiDialogMsgboxContent(e.target.value)
                      }
                    />
                  </Field>
                  <Tooltip
                    content="Link must start with 'https://', and can't be window's origin or belong to one of Fabric's known domains (such as 'powerbi.com', 'fabric.microsoft.com' or 'windows.net')"
                    relationship="label">
                    <Field
                      label="Message Box Link"
                      orientation="horizontal"
                      className="field"
                    >
                      <Input
                        size="small"
                        placeholder="Link"
                        onChange={(e) =>
                          setApiDialogMsgboxLink(e.target.value)
                        }
                      />
                    </Field>
                  </Tooltip>
                  <Combobox
                    placeholder="Buttons count"
                    onOptionSelect={(_, opt) =>
                      setApiDialogMsgboxButtonCount(
                        Number.parseInt(opt.optionValue)
                      )
                    }
                  >
                    {msgboxButtonCountOptions.map((option) => (
                      <Option key={option}>{option}</Option>
                    ))}
                  </Combobox>
                  <Button
                    appearance="primary"
                    icon={<PanelRightExpand20Regular />}
                    onClick={() => onCallOpenMessageBox()}
                  >
                    Open Dialog Message Box
                  </Button>
                </div>
                {/* Error Handling API usage example */}
                <Divider alignContent="start">Error Handling</Divider>
                <div className="section">
                  <Field
                    label="Error Title"
                    orientation="horizontal"
                    className="field"
                  >
                    <Input
                      size="small"
                      placeholder="Error title"
                      onChange={(e) => setApiErrorTitle(e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Error Message"
                    orientation="horizontal"
                    className="field"
                  >
                    <Input
                      size="small"
                      placeholder="Error message"
                      onChange={(e) => setApiErrorMessage(e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Error Request ID"
                    orientation="horizontal"
                    className="field"
                  >
                    <Input
                      size="small"
                      placeholder="Request ID"
                      onChange={(e) => setApiErrorRequestId(e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Error Status Code"
                    orientation="horizontal"
                    className="field"
                  >
                    <Input
                      size="small"
                      placeholder="Status Code"
                      onChange={(e) => setApiErrorStatusCode(e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Error Stack Trace"
                    orientation="horizontal"
                    className="field"
                  >
                    <Input
                      size="small"
                      placeholder="Stack Trace"
                      onChange={(e) => setApiErrorStackTrace(e.target.value)}
                    />
                  </Field>
                  <Button
                    appearance="primary"
                    icon={<PanelRightExpand20Regular />}
                    onClick={() => onCallOpenError()}
                  >
                    Open Error
                  </Button>
                </div>
                <div className="section">
                  <Field
                    label="Error"
                    orientation="horizontal"
                    className="field"
                  >
                    <Input
                      size="small"
                      placeholder="Error message"
                      onChange={(e) =>
                        setApiErrorFailureMessage(e.target.value)
                      }
                    />
                  </Field>
                  <Field
                    label="Error Status Code"
                    orientation="horizontal"
                    className="field"
                  >
                    <Input
                      size="small"
                      type="number"
                      placeholder="Error Status Code"
                      onChange={(e) =>
                        setApiErrorFailureCode(e.target.valueAsNumber)
                      }
                    />
                  </Field>
                  <Button
                    appearance="primary"
                    icon={<PanelRightExpand20Regular />}
                    onClick={() => onCallErrorFailureHandling()}
                  >
                    Call Request Failure Handling{" "}
                  </Button>
                </div>
              </span>
            )}
            {selectedApiTab == "apiPanelSettings" && (
              <span>
                {/* Panel API usage example */}
                <Divider alignContent="start">Panel</Divider>
                <div className="section">
                  <Switch
                    label="Clicking outside of Panel closes it"
                    onChange={(e) =>
                      setApiPanelIsLightDismiss(e.target.checked)
                    }
                  />
                  <Button
                    appearance="primary"
                    icon={<PanelRightExpand20Regular />}
                    onClick={() => onCallOpenPanel()}
                  >
                    Open Panel
                  </Button>
                </div>
                {/* Theme API usage example */}
                <Divider alignContent="start">Theme</Divider>
                <div className="section">
                  <Button
                    appearance="primary"
                    icon={<PanelRightExpand20Regular />}
                    onClick={() => onCallThemeGet()}
                  >
                    Get Theme Settings
                  </Button>
                </div>
                {/* Settings API usage example */}
                <Divider alignContent="start">Settings</Divider>
                <div className="section">
                  <Button
                    appearance="primary"
                    icon={<PanelRightExpand20Regular />}
                    onClick={() => onCallSettingsGet()}
                  >
                    Get Host Settings
                  </Button>
                </div>
              </span>
            )}
            {selectedApiTab == "apiNavigation" && (
              <span>
                {/* Navigation and Page API usage example */}
                <Divider alignContent="start">Navigation</Divider>
                <div className="section">
                  <Button
                    appearance="primary"
                    icon={<PanelRightExpand20Regular />}
                    onClick={() => onCallOpenPage()}
                  >
                    Open Sample Page
                  </Button>
                  <Button
                    appearance="primary"
                    icon={<PanelRightExpand20Regular />}
                    onClick={() => onCallNavigate(`/sample-page/${sampleItem.id}`)}
                  >
                    Navigate to Sample Page
                  </Button>
                  <Label />
                  <Label>
                    BeforeNavigateAway callback has been registerd to block
                    navigation to a 'forbidden-url'. Clicking the below should
                    NOT navigate away"
                  </Label>
                  <Button
                    appearance="primary"
                    icon={<PanelRightExpand20Regular />}
                    onClick={() => onCallNavigate("/sample-forbidden-url-page")}
                  >
                    Attempt to navigate to a Forbidden URL
                  </Button>
                </div>
              </span>
            )}
            {selectedApiTab == "apiDataHub" && (
              <span>
                {/* Link item API usage example */}
                <Divider alignContent="start">Selected item settings</Divider>
                <div className="section">

                  <Field label="Dialog description" orientation="horizontal" className="field">
                    <Input
                      size="small"
                      placeholder="Dialog description"
                      style={{ marginLeft: "10px" }}
                      value={datahubDialogDescription ?? ""}
                      onChange={(e) => setDatahubDialogDescription(e.target.value)}
                      data-testid="api-playground-data-hub-description"
                    />
                  </Field>
                  <Field label="Supported types" orientation="horizontal" className="field">
                    <Combobox
                      placeholder="Item types"
                      data-testid="api-playground-data-hub-supported-types"
                      onOptionSelect={(_, opt) =>
                        setDataHubMsgBoxType(
                          opt.optionValue
                        )
                      }
                    >
                      {dataHubMsgBoxTypes.map((option) => (
                        <Option key={option}>{option}</Option>
                      ))}
                    </Combobox>
                  </Field>
                  <Switch
                    label="Present workspace explorer"
		                data-testid="api-playground-data-hub-workspace-explorer-switch"
                    onChange={(e) =>
                      setWorkspaceExplorerPresented(e.target.checked)
                    }
                  />
                  <Switch
                    label="Allow multiselection"
                    onChange={(e) =>
                      setMultiSelectionEnabled(e.target.checked)
                    }
		                data-testid="api-playground-data-hub-multiselection-switch"
                  />
                  <Button
                    icon={<Database16Regular />}
                    appearance="primary"
                    onClick={onCallDatahubFromPlayground}
                    data-testid="api-playground-open-data-hub-btn"
                  >
                    Open Data Hub
                  </Button>
                </div>
                <div className="section">
                  <Divider alignContent="start">Selected item</Divider>
                  <Field label="Item name" orientation="horizontal" className="field">
                    <Input
                      size="small"
                      placeholder="Item name"
                      value={selectedLinkedItem ? selectedLinkedItem.displayName : ""}
                      data-testid={`api-playground-data-hub-selected-name-${selectedLinkedItem?.displayName}`}
                    />
                  </Field>
                  <Field label="Item ID" orientation="horizontal" className="field">
                    <Input size="small" placeholder="Item ID" value={selectedLinkedItem ? selectedLinkedItem.id : ""} data-testid={`api-playground-data-hub-selected-id-${selectedLinkedItem?.id}`}/>
                  </Field>
                </div>
              </span>
            )}
          </span>
        )}
        {selectedTab == "fluentui" && (
          <span>
            {/* List of common UI Components */}
            {<div className={i18n.dir()}>
              <MessageBar>
                <MessageBarBody>
                  <MessageBarTitle>
                    {(lang != 'en-US') ? t("Language_Changed_Title") :
                      t("Default_Language_Title")}
                  </MessageBarTitle>
                  {t("Language_Changed_Message")} {lang}
                </MessageBarBody>
              </MessageBar>
            </div>}
            <Divider alignContent="start" className="margin-top">Components</Divider>
            <div className="section">
              {/* Label and Input */}
              <Stack
                horizontal
                tokens={{ childrenGap: 10 }}
                style={{ padding: "10px" }}
              >
                <Label htmlFor={inputId}>Sample input</Label>
                <Input id={inputId} size="small" placeholder="hint" />
              </Stack>
              {/* Buttons */}
              <Stack
                horizontal
                tokens={{ childrenGap: 10 }}
                style={{ padding: "10px" }}
              >
                <Button icon={<Save24Regular />} appearance="primary">
                  Primary
                </Button>
                <Button icon={<Save24Regular />} appearance="secondary">
                  Default
                </Button>
                <Button icon={<Save24Regular />} appearance="outline">
                  Outline
                </Button>
                <Button icon={<Save24Regular />} appearance="subtle">
                  Subtle
                </Button>
              </Stack>
              {/* Checkbox, Switch and Radio */}
              <Checkbox title="my title" label="Checkbox sample" />
              <Switch label="Switch sample" />
              <Label id={labelId}>Radio group</Label>
              <RadioGroup aria-labelledby={labelId} defaultValue="option1">
                <Radio name={radioName} value="option1" label="Option 1" />
                <Radio name={radioName} value="option2" label="Option 2" />
                <Radio name={radioName} value="option3" label="Option 3" />
              </RadioGroup>
            </div>
            <Divider alignContent="start">
              Example of Lakehouse Explorer
            </Divider>
            <div className="section">
              <LakehouseExplorerComponent workloadClient={workloadClient} />
            </div>
          </span>
        )}
      </Stack>
    </Stack>
  );
}

// A sample Page for showcasing workloadClient.navigation Navigate/OnNavigate/OnBeforeNavigateAway/OnAfterNavigateAway amd page.Open
export function SamplePage({ workloadClient, history }: PageProps) {
  const pageContext = useParams<ContextProps>();
  const itemObjectId = pageContext.itemObjectId;
  return (
    <Stack className="editor">
      <Stack className="main">
        <Button
          onClick={() =>
            callNavigationNavigate("workload", "/sample-workload-editor/" + itemObjectId, workloadClient)
          }
        >
          Navigate Back
        </Button>
      </Stack>
    </Stack>
  );
}
