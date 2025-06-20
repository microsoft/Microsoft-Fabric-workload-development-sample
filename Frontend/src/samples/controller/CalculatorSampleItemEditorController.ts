import {
    ActionButton,
    AfterNavigateAwayData,
    ItemLikeV2,
    BeforeNavigateAwayData,
    BeforeNavigateAwayResult,
    CloseMode,
    CreateItemParams,
    CreateItemResult,
    DatahubSelectorDialogConfig,
    DatahubSelectorDialogResult,
    DialogType,
    WorkloadAction,
    WorkloadClientAPI,
    WorkloadSettings,
    HandleRequestFailureResult,
    NotificationToastDuration,
    NotificationType,
    OpenItemSettingsConfig,
    OpenMode,
    OpenUIResult,
    ThemeConfiguration,
    Tokens,
    ExtendedItemTypeV2,
    WorkloadErrorDetails,
    ErrorKind,
    UpdateItemResult,
    OpenBrowserTabParams,
} from "@ms-fabric/workload-client";

import { Dispatch, SetStateAction } from "react";
import { GenericItem, WorkloadItem } from '../../ItemEditor/ItemEditorModel';
import { Calculation, CalculationOperator, CalculationResult, CalculatorSampleItemState } from "../models/CalculatorSampleWorkloadModel";
import { readOneLakeFileAsText, getOneLakeFilePath, writeToOneLakeFileAsText } from "./OneLakeController";

/**
 * Calls the 'notification.open' function from the WorkloadClientAPI to display a notification.
 *
 * @param {string} title - The title of the notification.
 * @param {string} message - The message content of the notification.
 * @param {NotificationType} type - The type of the notification (default: NotificationType.Success).
 * @param {NotificationToastDuration} duration - The duration for which the notification should be displayed (default: NotificationToastDuration.Medium).
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {Dispatch<SetStateAction<string>>} setNotificationId - (Optional) A state setter function to update the notification ID.
 */
export async function callNotificationOpen(
    title: string,
    message: string,
    type: NotificationType = NotificationType.Success,
    duration: NotificationToastDuration = NotificationToastDuration.Medium,
    workloadClient: WorkloadClientAPI,
    setNotificationId?: Dispatch<SetStateAction<string>>) {

    const result = await workloadClient.notification.open({
        notificationType: type,
        title,
        duration,
        message
    });
    if (type == NotificationType.Success && setNotificationId) {
        setNotificationId(result?.notificationId);
    }
}

/**
 * Calls the 'notification.hide' function from the WorkloadClientAPI to hide a specific notification.
 *
 * @param {string} notificationId - The ID of the notification to hide.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {Dispatch<SetStateAction<string>>} setNotificationId - A state setter function to update the notification ID after hiding.
 */
export async function callNotificationHide(
    notificationId: string,
    workloadClient: WorkloadClientAPI,
    setNotificationId: Dispatch<SetStateAction<string>>) {

    await workloadClient.notification.hide({ notificationId });

    // Clear the notification ID from the state to reflect the hidden notification
    setNotificationId('');
}

// --- Panel API

/**
 * Calls the 'panel.open' function from the WorkloadClientAPI to open a panel.
 *
 * @param {string} workloadName - The name of the workload responsible for the panel.
 * @param {string} path - The path or route within the workload to open.
 * @param {boolean} isLightDismiss - Whether the panel can be dismissed by clicking outside (light dismiss).
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function callPanelOpen(
    workloadName: string,
    path: string,
    isLightDismiss: boolean,
    workloadClient: WorkloadClientAPI) {

    await workloadClient.panel.open({
        workloadName,
        route: { path },
        options: {
            width: window.innerWidth / 3,
            isLightDismiss
        }
    });
}

/**
 * Calls the 'panel.close' function from the WorkloadClientAPI to close a panel.
 *
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function callPanelClose(workloadClient: WorkloadClientAPI) {
    await workloadClient.panel.close({ mode: CloseMode.PopOne });
}

// --- Page API


/**
 * Calls the 'page.open' function from the WorkloadClientAPI to open a new page.
 *
 * @param {string} workloadName - The name of the workload responsible for the page.
 * @param {string} path - The path or route within the workload to open.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function callPageOpen(
    workloadName: string,
    path: string,
    workloadClient: WorkloadClientAPI) {

    await workloadClient.page.open({ workloadName, route: { path }, mode: OpenMode.ReplaceAll });
}

// --- Navigation API

/**
 * Calls the 'navigation.navigate' function from the WorkloadClientAPI to navigate to a target (host or workload) and path.
 *
 * @param {T} target - The target location to navigate to ('host' or 'workload').
 * @param {string} path - The path or route to navigate to.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function callNavigationNavigate<T extends 'host' | 'workload'>(
    target: T,
    path: string,
    workloadClient: WorkloadClientAPI) {

    await workloadClient.navigation.navigate(target, { path });
}

/**
 * Calls the 'navigation.onBeforeNavigateAway' function from the WorkloadClientAPI
 * to register a callback preventing navigation to a specific URL.
 *
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function callNavigationBeforeNavigateAway(workloadClient: WorkloadClientAPI) {
    // Define a callback function to prevent navigation to URLs containing 'forbidden-url'
    const callback: (event: BeforeNavigateAwayData) => Promise<BeforeNavigateAwayResult> =
        async (event: BeforeNavigateAwayData): Promise<BeforeNavigateAwayResult> => {
            // Return a result indicating whether the navigation can proceed
            return { canLeave: !event.nextUrl?.includes("forbidden-url") };
        };

    // Register the callback using the 'navigation.onBeforeNavigateAway' function
    await workloadClient.navigation.onBeforeNavigateAway(callback);
}

/**
 * Registers a callback to trigger after navigating away from page
 * using the 'navigation.onAfterNavigateAway' function.
 *
 * @param {(event: AfterNavigateAwayData) => Promise<void>} callback - A call back function that executes after navigation away.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function callNavigationAfterNavigateAway(
    callback: (event: AfterNavigateAwayData) => Promise<void>,
    workloadClient: WorkloadClientAPI) {
    // Register the callback using the 'navigation.onAfterNavigateAway' function
    await workloadClient.navigation.onAfterNavigateAway(callback);
}

/**
 * Calls the 'navigation.openBrowserTab' function from the WorkloadClientAPI to navigate to a url in a new tab.
 *
 * @param {string} path - The path or route to navigate to.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function CallOpenInNewBrowserTab(
    path: string,
    workloadClient: WorkloadClientAPI) {
    try {
        var params: OpenBrowserTabParams = {
            url: path,
            queryParams: {
                key1: "value1",
            }
        }
        await workloadClient.navigation.openBrowserTab(params);
    } catch (err) {
        console.error(err);
    }
}

// --- Action API

/**
 * Registers a callback to be invoked when a workload action is triggered
 * using the 'action.onAction' function.
 *
 * @param {(action: WorkloadAction<unknown>) => Promise<unknown>} callback - The callback function to handle the action.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function callActionOnAction(
    callback: (action: WorkloadAction<unknown>) => Promise<unknown>,
    workloadClient: WorkloadClientAPI) {

    await workloadClient.action.onAction(callback);
}


/**
 * Calls the 'action.execute' function from the WorkloadClientAPI to execute a specific action in a workload.
 *
 * @param {string} actionName - The name of the action to execute.
 * @param {string} workloadName - The name of the workload where the action should be executed.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function callActionExecute(
    actionName: string,
    workloadName: string,
    workloadClient: WorkloadClientAPI) {

    await workloadClient.action.execute({ action: actionName, workloadName })
}

// --- Dialog API

/**
 * Calls the 'dialog.open' function from the WorkloadClientAPI to open a dialog.
 *
 * @param {string} workloadName - The name of the workload responsible for the dialog.
 * @param {string} path - The path or route within the workload to open.
 * @param {number} width - The width of the dialog.
 * @param {number} height - The height of the dialog.
 * @param {boolean} hasCloseButton - Whether the dialog should have a close button.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * 
 * @returns
 * @param {OpenUIResult} result of the dialog
 */
export async function callDialogOpen(
    workloadName: string,
    path: string,
    width: number,
    height: number,
    hasCloseButton: boolean,
    workloadClient: WorkloadClientAPI) {

    return await workloadClient.dialog.open({
        dialogType: DialogType.IFrame,
        route: { path },  // Specify the path within the workload and queryParams
        workloadName,
        options: {
            width,
            height,
            hasCloseButton
        }
    });
}

// --- Datahub API

/**
 * Calls the 'datahub.openDialog' function from the WorkloadClientAPI to open a OneLake data hub dialog to select Lakehouse item(s).
 * 
 * @param {ExtendedItemTypeV2[]} supportedTypes - The item types supported by the datahub dialog.
 * @param {string} dialogDescription - The sub-title of the datahub dialog
 * @param {boolean} multiSelectionEnabled - Whether the datahub dialog supports multi selection of datahub items
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {boolean} workspaceNavigationEnabled - Whether the datahub dialog supports workspace navigation bar or not.
 */
export async function callDatahubOpen(
    supportedTypes: ExtendedItemTypeV2[],
    dialogDescription: string,
    multiSelectionEnabled: boolean,
    workloadClient: WorkloadClientAPI,
    workspaceNavigationEnabled: boolean = true): Promise<GenericItem> {

    const datahubConfig: DatahubSelectorDialogConfig = {
        supportedTypes: supportedTypes,
        multiSelectionEnabled: multiSelectionEnabled,
        dialogDescription: dialogDescription,
        workspaceNavigationEnabled: workspaceNavigationEnabled,
        // not in use in the regular selector, but required to be non-empty for validation
        hostDetails: {
            experience: 'sample experience 3rd party', // Change this to reflect your team's process, e.g., "Build notebook" 
            scenario: 'sample scenario 3rd party', // Adjust this to the specific action, e.g., "Select Lakehouse" 
        }
    };

    const result: DatahubSelectorDialogResult = await workloadClient.datahub.openDialog(datahubConfig);
    if (!result.selectedDatahubItem) {
        return null;
    }

    const selectedItem = result.selectedDatahubItem[0];
    const { itemObjectId, workspaceObjectId } = selectedItem;
    const { displayName, description } = selectedItem.datahubItemUI;
    return {
        id: itemObjectId,
        workspaceId: workspaceObjectId,
        type: selectedItem.datahubItemUI.itemType,
        displayName,
        description
    };
}

/**
 * Calls the 'dialog.open' function from the WorkloadClientAPI to open a message box dialog.
 *
 * @param {string} title - The title of the message box.
 * @param {string} content - The content or message of the message box.
 * @param {string[]} actionButtonsNames - Names of the action buttons to display in the message box.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @returns {string} - Name of the clicked button
 */
export async function callDialogOpenMsgBox(
    title: string,
    content: string,
    actionButtonsNames: string[],
    workloadClient: WorkloadClientAPI,
    link?: string): Promise<string> {

    // Create an array of ActionButton objects based on the provided action button names
    const actionButtons: ActionButton[] = actionButtonsNames.map(name => ({ name, label: name }));
    const result = await workloadClient.dialog.open({
        dialogType: DialogType.MessageBox,
        messageBoxOptions: {
            title,
            content,
            link: link ? {
                    url: link,
                    label: link
                }
            : undefined,
            actionButtons
        }
    });
    return result.value?.clickedButton;
}

/**
 * Calls the 'dialog.close' function from the WorkloadClientAPI to close a dialog.
 *
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {CloseMode} mode - (Optional) The mode specifying how the dialog should be closed.
 */
export async function callDialogClose(
    workloadClient: WorkloadClientAPI,
    mode?: CloseMode,
    data?: unknown) {

    await workloadClient.dialog.close({ mode, data });
}

// --- Error Handling API

/**
 * Calls the 'errorHandling.openErrorDialog' function from the WorkloadClientAPI to open an error dialog.
 *
 * @param {string} errorMessage - The error message to display in the error dialog.
 * @param {string} title - The title of the error dialog.
 * @param {string} statusCode - The status code associated with the error.
 * @param {string} stackTrace - The stack trace information of the error.
 * @param {string} requestId - The unique request ID related to the error.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function callErrorHandlingOpenDialog(
    errorMessage: string,
    title: string,
    statusCode: string,
    stackTrace: string,
    requestId: string,
    workloadClient: WorkloadClientAPI) {

    await workloadClient.errorHandling.openErrorDialog({
        errorMsg: errorMessage,
        errorOptions: {
            title,
            statusCode,
            stackTrace,
            requestId,
            errorTime: Date().toString() // Set the timestamp of the error
        },
        kind: ErrorKind.Error
    });
}

/**
 * Calls the 'errorHandling.handleRequestFailure' function from the WorkloadClientAPI to handle request failures.
 *
 * @param {string} errorMessage - The error message associated with the request failure.
 * @param {number} statusCode - The status code of the failed request.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function callErrorHandlingRequestFailure(
    errorMessage: string,
    statusCode: number,
    workloadClient: WorkloadClientAPI) {

    // the handleRequestFailure API handles MFA errors coming from Fabric. 
    // Such errors are identified by the inclusion of the below text inside the 'body'.
    const errorCodeMFA = "AdalMultiFactorAuthRequiredErrorCode";

    const result: HandleRequestFailureResult = await workloadClient.errorHandling.handleRequestFailure({ status: statusCode, body: errorMessage + errorCodeMFA });
    callDialogOpenMsgBox("Request Failure handling", `Failure has ${result.handled ? "" : "NOT"} been handled by Fabric`, [], workloadClient);
}

// --- Item CRUD Api

/**
 * Calls the 'itemCrud.createItem function from the WorkloadClientAPI, creating an Item in Fabric
 *
 * @param {string} workspaceObjectId - WorkspaceObjectId where the item will be created
 * @param {string} itemType - Item type, as registered by the BE 
 * @param {string} displayName - Name of the item
 * @param {string} description - Description of the item (can be seen in item's Settings in Fabric)
 * @param {T} workloadPayload - Additional metadata payload for the item (e.g., selected Lakehouse details).
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @returns {GetItemResult} - A wrapper for the item's data, after it has already been saved
 */
export async function callItemCreate<T>(
    workspaceObjectId: string,
    itemType: string,
    displayName: string,
    description: string,
    workloadPayload: T,
    workloadClient: WorkloadClientAPI): Promise<GenericItem> {
    console.log(`passing payloadString: ${workloadPayload}`);

    const params: CreateItemParams = {
        workspaceObjectId,
        payload: {
            itemType,
            displayName,
            description,
            workloadPayload: JSON.stringify(workloadPayload),
            payloadContentType: "InlineJson",
        }
    };

    try {
        const result: CreateItemResult = await workloadClient.itemCrud.createItem(params);
        console.log(`Created item id: ${result.objectId} with name: ${displayName} and payload: ${workloadPayload}`);
        return {
            id: result.objectId,
            workspaceId: workspaceObjectId,
            type: itemType,
            displayName,
            description,
            createdBy: result.createdByUser.name,
            createdDate: result.createdDate,
            lastModifiedBy: result.modifiedByUser.name,
            lastModifiedDate: result.lastUpdatedDate
        };
    }
    catch (exception) {
        console.error(`Failed to create item: ${exception}`);
        throw exception;
    }
}


/**
 * Calls the 'itemCrud.updateItem function from the WorkloadClientAPI
 * 
 * @param {string} objectId - The ObjectId of the item to update
 * @param {T|undefined} - Additional metadata payload for the item (e.g., selected Lakehouse details).
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {boolean} isRetry - Indicates that the call is a retry
 * @returns {GetItemResult} - A wrapper for the item's data
 */
export async function callItemUpdate<T>(
    objectId: string,
    payloadData: T | undefined,
    workloadClient: WorkloadClientAPI,
    isRetry?: boolean): Promise<UpdateItemResult> {

    let payloadString: string;
    if (payloadData) {
        payloadString = JSON.stringify(payloadData);
        console.log(`Updating item ${objectId} with payload: ${payloadString}`)
    } else {
        console.log(`Sending an update for item ${objectId} without updating the payload`);
    }
 
    try {
        return await workloadClient.itemCrud.updateItem({
            objectId,
            etag: undefined,
            payload: { workloadPayload: payloadString, payloadContentType: "InlineJson" }
        });
    } catch (exception) {
        console.error(`Failed updating Item ${objectId}`, exception);
        return await undefined;
    }
}


/**
 * Calls the 'itemCrud.deleteItem function from the WorkloadClientAPI
 * 
 * @param {string} objectId - The ObjectId of the item to delete
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {boolean} isRetry - Indicates that the call is a retry
 */
export async function callItemDelete(
    objectId: string,
    workloadClient: WorkloadClientAPI,
    isRetry?: boolean): Promise<boolean> {
    try {
        const result = await workloadClient.itemCrud.deleteItem({ objectId });
        console.log(`Delete result for item ${objectId}: ${result.success}`);
        return result.success;
    } catch (exception) {
        console.error(`Failed deleting Item ${objectId}`, exception);
        return await handleException(exception, workloadClient, isRetry, callItemDelete, objectId);
    }
}

/**
 * Calls the 'theme.get' function from the WorkloadClientAPI to retrieve the current Fabric Theme configuration.
 *
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @returns {Promise<ThemeConfiguration>} - The retrieved theme configuration.
 */
export async function callThemeGet(workloadClient: WorkloadClientAPI): Promise<ThemeConfiguration> {
    return await workloadClient.theme.get();
}

function tokensToFormattedString(tokens: Tokens): string {
    return Object.entries(tokens)
        .map(([tokenName, tokenValue]) => `${tokenName}: ${tokenValue}`)
        .join(',\r\n');
}

export function themeToView(theme: ThemeConfiguration): string {
    return `Theme name: ${theme.name},\r\n Tokens: ${tokensToFormattedString(theme.tokens)}`;
}


/**
 * Calls the 'theme.onChange' function from the WorkloadClientAPI to register a callback for theme change events.
 *
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function callThemeOnChange(workloadClient: WorkloadClientAPI) {
    // Define a callback function to be invoked when the theme changes
    const callback: (theme: ThemeConfiguration) => void =
        (_: ThemeConfiguration): void => {
            {
                // Since this callback is invoked multiple times, log a message to the console
                console.log("Theme On Change invoked");
            };
        };
    await workloadClient.theme.onChange(callback);
}


// --- Settings API

/**
 * Calls the 'settings.get' function from the WorkloadClientAPI to retrieve the current workload settings.
 *
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @returns {Promise<WorkloadSettings>} - The retrieved workload settings.
 */
export async function callSettingsGet(workloadClient: WorkloadClientAPI): Promise<WorkloadSettings> {
    return await workloadClient.settings.get();
}

export async function callLanguageGet(workloadClient: WorkloadClientAPI): Promise<string> {
    const settings = await callSettingsGet(workloadClient);
    return settings.currentLanguageLocale;
}

export function settingsToView(settings: WorkloadSettings): string {
    return [`Instance ID: ${settings.instanceId}`, `Host Origin: ${settings.workloadHostOrigin}`, `Current Language Locale: ${settings.currentLanguageLocale}`, `API URI: ${settings.apiUri}`].join('\r\n');
}

/**
 * Calls the 'settings.onChange' function from the WorkloadClientAPI to register a callback for settings change events.
 *
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function callSettingsOnChange(workloadClient: WorkloadClientAPI, changeLang: (language: string) => void) {
    // Define a callback function to be invoked when workload settings change
    const callback: (settings: WorkloadSettings) => void =
        (ws: WorkloadSettings): void => {
            {
                // Since this callback is invoked multiple times, log a message to the console
                console.log("Settings On Change invoked");
                console.log("CurrentLanguage", ws.currentLanguageLocale);
                changeLang(ws.currentLanguageLocale);
            };
        };
    await workloadClient.settings.onChange(callback);
}

/**
 * Calls the 'itemSettings.open' function from the WorkloadClientAPI, opening the settings pane shared UI component for the item.
 *
 * @param {ItemLikeV2} item - The item for which we want to show the settings pane.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {string} selectedSettingId - The ID of the tab we want to show. If no ID is passed, the item settings panel will open in the 'About' Tab.
 * @returns {OpenUIResult} - The result of the UI operation.
 */
export async function callOpenSettings(
    item: ItemLikeV2,
    workloadClient: WorkloadClientAPI,
    selectedSettingId?: string): Promise<OpenUIResult> {

    const config: OpenItemSettingsConfig = {
        item,
        selectedSettingId
    };

    console.log(`Call open item settings. request: ${config}`);

    try {
        const result: OpenUIResult = await workloadClient.itemSettings.open(config)
        console.log(`OpenItemSettings: ${result}`);
        return result;
    }
    catch (exception) {
        console.error(`Failed to open settings for item: ${item}`);
        console.log(exception);
    }

    return null;
}


/**
 * Saves the calculation result to OneLake and updates the item state.
 *
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {WorkloadItem<CalculatorSampleItemState>} item - The workload item to update.
 * @param {CalculationResult} calculation - The calculation result to save.
 * @returns {Promise<CalculatorSampleItemState>} - The updated item state after saving the calculation result.
 */
export async function saveCalculationResult(workloadClient: WorkloadClientAPI, item: WorkloadItem<CalculatorSampleItemState>, calculation: CalculationResult): Promise<CalculatorSampleItemState> {    
    const result = calculateResult(calculation);
    const fileName = `CalcResults/Calculation-${result.calculationTime.toUTCString() + ""}.txt`;
    const filePath = getOneLakeFilePath(item.workspaceId, item.id, fileName)
    await writeToOneLakeFileAsText(workloadClient, filePath, JSON.stringify(result));
    const newItemState: CalculatorSampleItemState = {
        operand1: calculation.operand1,
        operand2: calculation.operand2,
        operator: calculation.operator,        
        lastResultFile: fileName,
    }
    saveCalculationToHistory(workloadClient, item, result);
    return newItemState
}

/**
 * Loads the calculation result from OneLake for a given workload item
 * 
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {WorkloadItem<CalculatorSampleItemState>} item - The workload item from which to load the calculation result.
 * @returns {Promise<CalculationResult>} - The loaded calculation result.
 */
export async function loadCalculationResult(workloadClient: WorkloadClientAPI, item: WorkloadItem<CalculatorSampleItemState>): Promise<CalculationResult> {
    const fileName = item.itemState?.lastResultFile;
    const filePath = getOneLakeFilePath(item.workspaceId, item.id, fileName);
    const result = await readOneLakeFileAsText(workloadClient, filePath);
    return JSON.parse(result)
}

/** 
 * Saves the calculation result to the history file in OneLake.
 *
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {WorkloadItem<CalculatorSampleItemState>} item - The workload item to update.
 * @param {CalculationResult} calculationResult - The calculation result to save.
 * @returns {Promise<void>} - A promise that resolves when the calculation result is saved.
 */
export async function saveCalculationToHistory(workloadClient: WorkloadClientAPI, item: WorkloadItem<CalculatorSampleItemState>, calculationResult: CalculationResult): Promise<void> {
   const fileName = "CalculationHistory.csv";
   const filePath = getOneLakeFilePath(item.workspaceId, item.id, fileName);
   const data = `${calculationResult.operand1};${calculationResult.operand2};${calculationResult.operator};${calculationResult.result};${calculationResult.calculationTime}\n`;
   await writeToOneLakeFileAsText(workloadClient, filePath, data);
}

/** 
 * Loads the calculation history from OneLake for a given workload item.
 *
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.    
 * @param {WorkloadItem<CalculatorSampleItemState>} item - The workload item from which to load the calculation history.
 * @returns {Promise<CalculationResult[]>} - A promise that resolves to an array of calculation results.
 */
export async function loadCalculationHistory(workloadClient: WorkloadClientAPI, item: WorkloadItem<CalculatorSampleItemState>): Promise<CalculationResult[]> {
    var retVal: CalculationResult[];
    const fileName = "CalculationHistory.csv";
    const filePath = getOneLakeFilePath(item.workspaceId, item.id, fileName);
    const result = await readOneLakeFileAsText(workloadClient, filePath);
    const lines = result.split(/\r\n|\n|\r/);
    lines.map(line => {
        const parts = line.split(";");
        if (parts.length < 5) {
            console.warn(`Skipping invalid line in calculation history: ${line}`);
            return;
        } else {
            const calculation: CalculationResult = {
                operand1: parseFloat(parts[0]),
                operand2: parseFloat(parts[1]),
                operator: CalculationOperator[parts[2] as keyof typeof CalculationOperator],
                result: parseFloat(parts[3]),
                calculationTime: new Date(parts[4])
            };
            retVal.push(calculation);
        }
    });
    return retVal;
}


export function calculateResult(calculation: Calculation): CalculationResult {
    const result: number = calculateResultInt(calculation);
    return {    
        operand1: calculation.operand1,
        operand2: calculation.operand2,
        operator: calculation.operator,
        result: result,
        calculationTime: new Date(),
    }
}

function calculateResultInt(data: Calculation): number {
    switch (data?.operator) {
        case CalculationOperator.Add:
            return data?.operand1 + data?.operand2;
        case CalculationOperator.Subtract:
            return data?.operand1 - data?.operand2;
        case CalculationOperator.Multiply:
            return data?.operand1 * data?.operand2;
        case CalculationOperator.Divide:
            if (data?.operand2 !== 0) {
                return data?.operand1 / data?.operand2;
            } else {
                throw new Error("Cannot divide by zero.");
            }
        case CalculationOperator.Random:
            // Math.random() returns a float between 0 and 1, so we use Math.floor and scale
            const min = Math.min(data?.operand1, data?.operand2);
            const max = Math.max(data?.operand1, data?.operand2);
            const rand = Math.floor(Math.random() * (max - min + 1)) + min;
            return  rand;
        default:
            throw new Error(`Unsupported operator: ${data?.operator}`);
    }
}

/**
 * Handles errors propagated.
 *
 * @param {any} exception - The exception that we need to handle
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {boolean} isRetry - Indicates that the call is a retry
 * @param {Function} action - The action to retry if the error was handled.
 * @param {...any[]} actionArgs - The arguments to pass to the action.
 * @returns {Promise<any>} - Whether the exception was handled or not.
 */
async function handleException(
    exception: any,
    workloadClient: any,
    isRetry: boolean = false,
    action: (...args: any[]) => Promise<any>,
    ...actionArgs: any[]
): Promise<any> {
    var parsedException: WorkloadErrorDetails = parseExceptionErrorResponse(exception);
    
    // error could not be handled, show the error dialog
    let message = parsedException?.Message || "Unknown error occurred";
    const errorCode = parsedException?.ErrorCode ?? exception.error?.message?.code;
    let title = getAdditionalParameterValue(parsedException, "title") ?? `Could not handle exception: ${errorCode}`;

    if (exception.error?.message?.code === "PowerBICapacityValidationFailed") { 
        message = `Your workspace is assigned to invalid capacity.\n` +
                  `Please verify that the workspace has a valid and active capacity assigned, and try again.`;
        title = "Power BI Capacity Validation Failed";
    }
    await callErrorHandlingOpenDialog(
        message,
        title,
        exception.error?.statusCode,
        exception.response?.stackTrace,
        exception.response?.headers?.requestId,
        workloadClient
    );
    return null;
}

function getAdditionalParameterValue(parsedException: WorkloadErrorDetails, parameterName: string): string {
    return parsedException?.MoreDetails?.[0]?.AdditionalParameters?.find(ap => ap.Name == parameterName)?.Value;
}

function parseExceptionErrorResponse(exception: any): WorkloadErrorDetails {
    const errorResponse = exception?.error?.message?.["pbi.error"]?.parameters?.ErrorResponse;
    if (!errorResponse) {
        return null;
    }
    return JSON.parse(errorResponse);
}
