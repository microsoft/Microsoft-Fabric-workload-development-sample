import React, { useState, useEffect, useCallback } from "react";
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
  calculateResult,
  saveCalculationResult,
  loadCalculationResult,
  createCalculationShortcut,
} from "./CalculatorSampleItemEditorController";
import { Ribbon } from "./CalculatorSampleItemEditorRibbon";
import {
  CalculatorSampleItemDefinition,
  CalculationOperator,
  Calculation
} from "./CalculatorSampleItemModel";
import "./../../../styles.scss";
import { callGetItem, getWorkloadItem, saveItemDefinition } from "../../../workload/controller/ItemCRUDController";
import { callNavigationAfterNavigateAway, callNavigationBeforeNavigateAway } from "../../../workload/controller/NavigationController";
import { callThemeOnChange } from "../../../workload/controller/ThemeController";
import { callOpenSettings } from "../../../workload/controller/SettingsController";
import { WorkloadItem } from "../../../workload/models/ItemCRUDModel";
import { callDatahubWizardOpen } from "../../../workload/controller/DataHubController";
import { callDialogOpenMsgBox } from "../../../workload/controller/DialogController";
import { defaultCalculatorSampleItemDefinition } from "../../../constants";
import { CalculatorSampleItemEmpty } from "./CalculatorSampleItemEditorEmpty";
import { callNotificationOpen } from "../../../workload/controller/NotificationController";
import { ItemEditorLoadingProgressBar } from "../../../workload/controls/ItemEditorLoadingProgressBar";

export function CalculatorSampleItemEditor(props: PageProps) {
  const { workloadClient } = props;
  const pageContext = useParams<ContextProps>();
  const { pathname } = useLocation();

  // React state for WorkloadClient APIs
  const [operand1ValidationMessage, setOperand1ValidationMessage] = useState<string>("");
  const [operand2ValidationMessage, setOperand2ValidationMessage] = useState<string>("");
  const [editorItem, setEditorItem] = useState<WorkloadItem<CalculatorSampleItemDefinition>>(undefined);
  const [isDirty, setDirty] = useState<boolean>(false);
  const [calculationResult, setCalculationResult] = useState<string>("");
  const [calculationTime, setCalculationTime] = useState<Date>(undefined);
  
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [itemEditorErrorMessage, setItemEditorErrorMessage] = useState<string>("");

  // Computed values from editorItem (single source of truth)
  const operand1 = editorItem?.definition?.operand1 ?? 0;
  const operand2 = editorItem?.definition?.operand2 ?? 0;
  const operator = editorItem?.definition?.operator ?? CalculationOperator.Undefined;

  const INT32_MIN = -2147483648;
  const INT32_MAX = 2147483647;

  // Helper function to update item defintion immutably
  const updateItemDefinition = useCallback((updates: Partial<CalculatorSampleItemDefinition>) => {
    setEditorItem(prevItem => {
      if (!prevItem) return prevItem;
      
      return {
        ...prevItem,
        definition: {
          ...prevItem.definition,
          ...updates
        }
      };
    });
    setDirty(true);
  }, []);

  const [selectedTab, setSelectedTab] = useState<TabValue>("home");

  useEffect(() => {
    // Controller callbacks registrations:
    // register Blocking in Navigate.BeforeNavigateAway (for a forbidden url)
    callNavigationBeforeNavigateAway(workloadClient);

    // register a callback in Navigate.AfterNavigateAway
    callNavigationAfterNavigateAway(workloadClient, afterNavigateCallBack);

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

  async function createShortcut(){
    const result = await callDatahubWizardOpen(
            workloadClient,
            ["Lakehouse"],
            "Select",
            "Select shortcut destination",
            false, 
            false, 
            true
        );
    if (result) {
      const createResult = await createCalculationShortcut(workloadClient, editorItem, result)
      if( createResult) {
        console.log(`Shortcut created successfully: ${createResult.name}`);
        callDialogOpenMsgBox(
          workloadClient,
          `Shortcut created successfully!`,
          `The Shorcut with the name ${createResult.name} was created successfully.`,
          ["OK"],          
          undefined 
        );
      }
    }    
  }

  function isValidOperand(operand: number) {
    return operand > INT32_MIN && operand < INT32_MAX;
  }

  async function onOperand1InputChanged(value: number) {
    updateItemDefinition({ operand1: value });
    
    if (!isValidOperand(value)) {
      setOperand1ValidationMessage("Operand 1 may lead to overflow");
      return;
    }
    setOperand1ValidationMessage("");
  }

  async function onOperand2InputChanged(value: number) {
    updateItemDefinition({ operand2: value });
    
    if (!isValidOperand(value)) {
      setOperand2ValidationMessage("Operand 2 may lead to overflow");
      return;
    }
    setOperand2ValidationMessage("");
  }

  function onOperatorInputChanged(value: string | null) {
    const operatorValue = CalculationOperator[value as keyof typeof CalculationOperator] || CalculationOperator.Undefined;
    updateItemDefinition({ operator: operatorValue });
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
      
      setEditorItem({
        ...editorItem,
        definition: calcSave
      });
      
      setCalculationResult(calcResult.result.toString());
      setCalculationTime(calcResult.calculationTime);
      
      // Save with the updated definition directly to avoid race condition
      await SaveItem(calcSave);
    } catch (error: Error | any) {
      console.error(`Error calculating result: ${error.message}`);
      setCalculationResult("Error in calculation");
      setCalculationTime(undefined);
      return;
    }
  }

  async function handleFinishEmpty(operand1: number, operand2: number, operator: CalculationOperator): Promise<void> {
    onOperand1InputChanged(operand1);
    onOperand2InputChanged(operand2);
    onOperatorInputChanged(CalculationOperator[operator]);
    setSelectedTab("home");
    setDirty(true);
    await onCalculateAndSaveButtonClick();
  }

  async function loadDataFromUrl(
    pageContext: ContextProps,
    pathname: string
  ): Promise<void> {
    setIsLoadingData(true);
    var item: WorkloadItem<CalculatorSampleItemDefinition> = undefined;    
    if (pageContext.itemObjectId) {
      // for Edit scenario we get the itemObjectId and then load the item via the workloadClient SDK
      try {
        setSelectedTab("home");
        item = await getWorkloadItem<CalculatorSampleItemDefinition>(
                  workloadClient,
                  pageContext.itemObjectId,
                  defaultCalculatorSampleItemDefinition          
                );
        // clear validation messages
        setOperand1ValidationMessage("");
        setOperand2ValidationMessage("");
        if (item?.definition?.lastResultFile) {
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

    if(item?.definition?.operand1) {
      setSelectedTab("home");
    } else {
      setSelectedTab("empty");
    }
  }

  function clearItemData() {
    setEditorItem(undefined);
  }

  async function SaveItem(itemDefintion?: CalculatorSampleItemDefinition) {
    var successResult = await saveItemDefinition(workloadClient, editorItem.id, itemDefintion || editorItem.definition);
    setDirty(!successResult);
    callNotificationOpen(
                workloadClient,
                "Item saved",
                "The item " + editorItem.displayName + " has been saved successfully.",
                undefined,
                undefined
            );
  }

  async function openSettings() {
    if (editorItem) {
      const item = await callGetItem(workloadClient, editorItem.id);
      await callOpenSettings(item, workloadClient, 'About');
    }
  }

  function isDisabledCalculateButton(): boolean {
    return operator == CalculationOperator.Undefined || editorItem == undefined;
  }

  // HTML page contents
  if (isLoadingData) {
    return <ItemEditorLoadingProgressBar message="Loading..." />;
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
        openCreateShortcutCallback={createShortcut}
      />

      <Stack className="main">
        {["empty"].includes(selectedTab as string) && (
          <span>
            <CalculatorSampleItemEmpty
              workloadClient={workloadClient}
              item={editorItem}
              itemDefinition={editorItem?.definition}
              onFinishEmpty={handleFinishEmpty}
            />
          </span>
        )}
        {["home"].includes(selectedTab as string) && (
          <span>
            <h2>Calculator Sample</h2>
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
                      value={operator == CalculationOperator.Undefined ? "" : CalculationOperator[operator]}
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
