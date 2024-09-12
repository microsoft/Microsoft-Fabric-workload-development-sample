import {
    AccessToken,
    ActionButton,
    AfterNavigateAwayData,
    ItemJobInstance,
    ItemLikeV2,
    BeforeNavigateAwayData,
    BeforeNavigateAwayResult,
    CancelItemJobParams,
    CancelItemJobResult,
    CloseMode,
    CreateItemParams,
    CreateItemResult,
    DatahubSelectorDialogConfig,
    DatahubSelectorDialogResult,
    DialogType,
    WorkloadAction,
    WorkloadClientAPI,
    WorkloadSettings,
    GetItemResult,
    HandleRequestFailureResult,
    NotificationToastDuration,
    NotificationType,
    OpenItemRecentRunsConfig,
    OpenItemSettingsConfig,
    OpenMode,
    OpenUIResult,
    RunItemJobParams,
    ThemeConfiguration,
    Tokens,
    WorkloadErrorDetails,
} from "@ms-fabric/workload-client";

import { Dispatch, SetStateAction } from "react";
import { GenericItem } from '../models/SampleWorkloadModel';
import { jobTypeDisplayNames } from "../utils";
import { AuthenticationUIRequiredException, AuthUIRequired, FabricExternalWorkloadError } from "../models/WorkloadExceptionsModel";
// --- Notification API


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
 * Calls acquire access token from the WorkloadClientAPI.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {string} additionalScopesToConsent - Extra scopes to consent (only provide if you are sure the user is missing a consent)
 * @param {string} claimsForConditionalAccessPolicy - Claims returned from the server indicating that token conversion failed because of some conditional access policy - see https://learn.microsoft.com/en-us/entra/msal/dotnet/acquiring-tokens/web-apps-apis/on-behalf-of-flow#handling-multi-factor-auth-mfa-conditional-access-and-incremental-consent
 * @returns {AccessToken}
 */
export async function callAuthAcquireAccessToken(workloadClient: WorkloadClientAPI, additionalScopesToConsent?: string, claimsForConditionalAccessPolicy?: string): Promise<AccessToken> {
    return workloadClient.auth.acquireAccessToken({
        additionalScopesToConsent: additionalScopesToConsent?.length > 0 ? additionalScopesToConsent.split(' ') : null,
        claimsForConditionalAccessPolicy: claimsForConditionalAccessPolicy?.length > 0 ? claimsForConditionalAccessPolicy : null
    });
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
 * Registers a callback to show a notification after navigating to a URL containing 'page'
 * using the 'navigation.onAfterNavigateAway' function.
 *
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function callNavigationAfterNavigateAway(workloadClient: WorkloadClientAPI) {
    // Define a callback function to show a notification after navigating to URLs containing 'page'
    const callback: (event: AfterNavigateAwayData) => Promise<unknown> =
        async (event: AfterNavigateAwayData): Promise<unknown> => {
            if (event.nextUrl?.includes("page")) {
                callNotificationOpen(
                    "After Navigate Away",
                    "Callback invocation - onAfterNavigateAway",
                    NotificationType.Success,
                    NotificationToastDuration.Medium,
                    workloadClient);
            }
            return;
        }

    // Register the callback using the 'navigation.onAfterNavigateAway' function
    await workloadClient.navigation.onAfterNavigateAway(callback);
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
 * @param {string} dialogDescription - The sub-title of the datahub dialog
 * @param {boolean} multiSelectionEnabled - Whether the datahub dialog supports multi selection of datahub items
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function callDatahubOpen(
    dialogDescription: string,
    multiSelectionEnabled: boolean,
    workloadClient: WorkloadClientAPI): Promise<GenericItem> {

    const datahubConfig: DatahubSelectorDialogConfig = {
        supportedTypes: ['Lakehouse'],
        multiSelectionEnabled: multiSelectionEnabled,
        dialogDescription: dialogDescription,
        // not in use in the regular selector, but required to be non-empty for validation
        hostDetails: {
            experience: 'experience',
            scenario: 'scenario',
        }
    };

    const result: DatahubSelectorDialogResult = await workloadClient.datahub.openDialog(datahubConfig);
    if (!result.selectedDatahubItem){
        return null;
    }
    
    const selectedItem = result.selectedDatahubItem[0];
    const { itemObjectId, workspaceObjectId } = selectedItem;
    const { displayName, description } = selectedItem.datahubItemUI;
    return {
        id: itemObjectId,
        workspaceId: workspaceObjectId,
        type: 'Lakehouse',
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
    workloadClient: WorkloadClientAPI): Promise<string> {

    // Create an array of ActionButton objects based on the provided action button names
    const actionButtons: ActionButton[] = actionButtonsNames.map(name => ({ name, label: name }));

    const result = await workloadClient.dialog.open({
        dialogType: DialogType.MessageBox,
        messageBoxOptions: {
            title,
            content,
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
        }
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

    // the handleRequestFailure API handles MFA errors coming from Fabric Backend. 
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
        console.error(exception);

        if (exception.error?.message?.code === "PowerBIMetadataArtifactDisplayNameInUseException") {
            console.log(`Name ${displayName} is taken...`);
        }
         // Indicates that the error was returned from the workload
         if (exception.error?.message?.code === FabricExternalWorkloadError) {
            await handleWorkloadError(exception, workloadClient);
        }
        throw exception;
    }
}

/**
 * Calls the 'itemCrud.getItem function from the WorkloadClientAPI
 * The result contains data both from Fabric and from the ISV's backend, if configured
 * 
 * @param {string} objectId - The ObjectId of the item to fetch
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {boolean} isRetry - Indicates that the call is a retry
 * @returns {GetItemResult} - A wrapper for the item's data
 */
export async function callItemGet(objectId: string, workloadClient: WorkloadClientAPI, isRetry?: boolean): Promise<GetItemResult> {
    try {
        const item: GetItemResult = await workloadClient.itemCrud.getItem({ objectId });
        console.log(`Successfully fetched item ${objectId}: ${item}`)

        return item;
    } catch (exception) {
        // Indicates that the error was returned from the workload
        if (exception.error?.message?.code === FabricExternalWorkloadError) {
            if (!isRetry && await handleWorkloadError(exception, workloadClient)) {
                return callItemGet(objectId, workloadClient, true);
            }
        }
        console.error(`Failed locating item with ObjectID ${objectId}`, exception);
        return null;
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
    isRetry?: boolean) {

    let payloadString: string;
    if (payloadData) {
        payloadString = JSON.stringify(payloadData);
        console.log(`Updating item ${objectId} with payload: ${payloadString}`)
    } else {
        console.log(`Sending an update for item ${objectId} without updating the payload`);
    }

    try {
        await workloadClient.itemCrud.updateItem({
            objectId,
            etag: undefined,
            payload: { workloadPayload: payloadString, payloadContentType: "InlineJson" }
        });
    } catch (exception) {
        // Indicates that the error was returned from the workload
        if (exception.error?.message?.code === FabricExternalWorkloadError) {
            if (!isRetry && await handleWorkloadError(exception, workloadClient)) {
                callItemUpdate(objectId, payloadData, workloadClient, true /*isRetry*/);
            }
        }
        console.error(`Failed updating Item ${objectId}`, exception);
    }
}

/**
 * Calls the 'itemCrud.deleteItem function from the WorkloadClientAPI
 * 
 * @param {string} objectId - The ObjectId of the item to delete
 * @param {boolean} isRetry - Indicates that the call is a retry
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
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
        // Indicates that the error was returned from the workload
        if (exception.error?.message?.code === FabricExternalWorkloadError) {
            if (!isRetry && await handleWorkloadError(exception, workloadClient)) {
                return callItemDelete(objectId, workloadClient, true /*isRetry*/);
            }        
        }
        console.error(`Failed deleting Item ${objectId}`, exception);
        return false;
    }
}

// --- Item Jobs related Api

/**
 * Calls the 'itemSchedule.runItemJob' function from the WorkloadClientAPI, starting item job execution
 *
 * @param {string} objectId - The ObjectId of the item which will run the job.
 * @param {string} jobType - The job type to run.
 * @param {string} jobPayload - Payload to be sent as part of the job
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {boolean} showNotification - show pop-up notification.
 * @param {boolean} isRetry - Indicates that the call is a retry
 * @returns {ItemJobInstance} - The executed job instance metadata.
 */
export async function callRunItemJob(
    objectId: string,
    jobType: string,
    jobPayload: string,
    workloadClient: WorkloadClientAPI,
    showNotification: boolean = false,
    isRetry?: boolean): Promise<ItemJobInstance> {

    const params: RunItemJobParams = {
        itemObjectId: objectId,
        itemJobType: jobType,
        payload: { jobPayloadJson: jobPayload }
    };

    console.log(`Call Run Item Job. request: ${params}`);

    try {
        const result: ItemJobInstance = await workloadClient.itemSchedule.runItemJob(params);
        console.log(`Executed job id: ${result.itemJobInstanceId}`);
        if (showNotification) {
            callNotificationOpen(
                `${jobTypeDisplayNames[result.itemJobType]} execution has begun.`,
                `Job instance ID: ${result.itemJobInstanceId}.`,
                NotificationType.Success,
                NotificationToastDuration.Medium,
                workloadClient);
        }

        return result;
    }
    catch (exception) {
        // Indicates that the error was returned from the workload
        if (exception.error?.message?.code === FabricExternalWorkloadError) {
            if (!isRetry && await handleWorkloadError(exception, workloadClient)) {
                return callRunItemJob(objectId, jobType, jobPayload, workloadClient, showNotification, true /*isRetry*/);
            }         
        }
        console.error(`Failed running item job ${jobType} for item ${objectId}`);
        console.log(exception);
    }

    return null;
}

/**
 * Calls the 'itemSchedule.cancelItemJob' function from the WorkloadClientAPI, canceling item job execution
 *
 * @param {string} objectId - The ObjectId of the item which will run the job.
 * @param {string} jobInstanceObjectId - The Id of the job instance
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {boolean} showNotification - show pop-up notification.
 * @param {boolean} isRetry - Indicates that the call is a retry
 * @returns {CancelItemJobParams} - The executed job instance metadata.
 */
export async function callCancelItemJob(
    objectId: string,
    jobInstanceObjectId: string,
    workloadClient: WorkloadClientAPI,
    showNotification: boolean = false,
    isRetry?: boolean): Promise<CancelItemJobResult> {

    const params: CancelItemJobParams = {
        itemObjectId: objectId,
        jobInstanceId: jobInstanceObjectId,
    };

    console.log(`Call cancel Item Job. request: ${params}`);

    try {
        const result: CancelItemJobResult = await workloadClient.itemSchedule.cancelItemJob(params);
        console.log(`CancelItemJobResult: ${result}`);
        if (showNotification) {
            const success = result.success;
            const notificationMessage = success
                ? `Job instance ID: ${jobInstanceObjectId} for item: ${objectId} was canceled successfully`
                : `Failed to cancel job instance ID: ${jobInstanceObjectId} for item: ${objectId} `;

            callNotificationOpen(
                'Cancel Job result',
                notificationMessage,
                success ? NotificationType.Success : NotificationType.Error,
                NotificationToastDuration.Medium,
                workloadClient);
        }

        return result;
    }
    catch (exception) {
        // Indicates that the error was returned from the workload
        if (exception.error?.message?.code === FabricExternalWorkloadError) {
            if (!isRetry && await handleWorkloadError(exception, workloadClient)) {
                return callCancelItemJob(objectId, jobInstanceObjectId, workloadClient, showNotification, true /*isRetry*/);
            }         
        }
        console.error(`Failed to cancel job instance ID: ${jobInstanceObjectId} for item: ${objectId}`);
        console.log(exception);
    }

    return null;
}

/**
 * Calls the 'itemRecentRuns.open' function from the WorkloadClientAPI, opening the shared UI component displaying recent runs of item jobs.
 *
 * @param {ItemLikeV2} item - The item for which we want to display recent job runs.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @returns {OpenUIResult} - The result of the UI operation.
 */
export async function callOpenRecentRuns(
    item: ItemLikeV2,
    workloadClient: WorkloadClientAPI): Promise<OpenUIResult> {

    const config: OpenItemRecentRunsConfig = {
        item: item
    };

    console.log(`Call OpenRecentRuns. request: ${item}`);

    try {
        const result: OpenUIResult = await workloadClient.itemRecentRuns.open(config);
        console.log(`OpenRecentRuns: ${result}`);
        return result;
    }
    catch (exception) {
        console.error(`Failed to open recent run for item: ${item}`);
        console.log(exception);
    }

    return null;
}

// --- Workload data plane API

/**
 * Calls workload API GetItem1SupportedOperators
 * 
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function callGetItem1SupportedOperators(workloadBEUrl: string, workloadClient: WorkloadClientAPI): Promise<string[]> {
    const accessToken: AccessToken = await callAuthAcquireAccessToken(workloadClient);
    const response: Response = await fetch(`${workloadBEUrl}/item1SupportedOperators`, { method: `GET`, headers: { 'Authorization': 'Bearer ' + accessToken.token } });
    const responseBody: string = await response.text();
    const operators: string[] = JSON.parse(responseBody);
    console.log(`*** Successfully fetched operators supported for Item1: ${operators}`);
    return operators;
}

/**
 * Calls the Item1DoubleResult endpoint of the workload API to double the result.
 * 
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {string} workspaceObjectId - The workspace object ID.
 * @param {string} itemObjectId - The item object ID.
 * @returns {Promise<{ Operand1: number, Operand2: number }>} A Promise that resolves to an object containing the updated operands.
 */
export async function callItem1DoubleResult(workloadBEUrl: string, workloadClient: WorkloadClientAPI, workspaceObjectId: string, itemObjectId: string): Promise<{ Operand1: number, Operand2: number }> {
    try {
        const accessToken: AccessToken = await callAuthAcquireAccessToken(workloadClient);
        const response: Response = await fetch(`${workloadBEUrl}/${workspaceObjectId}/${itemObjectId}/item1DoubleResult`, {
            method: `POST`,
            headers: {
                'Authorization': 'Bearer ' + accessToken.token,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            // Handle non-successful responses here
            const errorMessage: string = await response.text();
            console.error(`Error calling Double API: ${errorMessage}`);
            throw new Error(`Error calling Double API: ${errorMessage}`);
        }

        const result: { Operand1: number, Operand2: number } = await response.json();

        console.log('*** Successfully called Double API');
        return result;
    } catch (error) {
        console.error('Error in callItem1DoubleResult:', error);
        throw error; // Propagate the error to the caller
    }
}

// --- Theme API

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


export function settingsToView(settings: WorkloadSettings): string {
    return [`Instance ID: ${settings.instanceId}`, `Host Origin: ${settings.workloadHostOrigin}`, `Product Name: ${settings.productName}`, `API URI: ${settings.apiUri}`].join('\r\n');
}

/**
 * Calls the 'settings.onChange' function from the WorkloadClientAPI to register a callback for settings change events.
 *
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function callSettingsOnChange(workloadClient: WorkloadClientAPI) {
    // Define a callback function to be invoked when workload settings change
    const callback: (settings: WorkloadSettings) => void =
        (_: WorkloadSettings): void => {
            {
                // Since this callback is invoked multiple times, log a message to the console
                console.log("Settings On Change invoked");
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
 * Handles errors propagated from workload backend.
 *
 * @param {any} exception - The exception that we need to handle
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @returns {Promise<boolean>} - Whether the exception was handled or not.
 */
export async function handleWorkloadError(exception: any, workloadClient: WorkloadClientAPI): Promise<boolean> {
    var errorResponse = exception?.error?.message?.["pbi.error"]?.parameters?.ErrorResponse;
    if (!errorResponse) {
        return false;
    }
    var parsedException: WorkloadErrorDetails = JSON.parse(errorResponse);
    // handle codes from your choice, the codes are returned from the workload backend.
    switch (parsedException.ErrorCode) {
        case AuthUIRequired: {
            let authenticationUIRequiredException: AuthenticationUIRequiredException = {
                ClaimsForConditionalAccessPolicy: parsedException.MoreDetails?.[0].AdditionalParameters?.find(ap => ap.Name == "claimsForCondtionalAccessPolicy")?.Value,
                ErrorMessage: parsedException.Message,
                ScopesToConsent:  parsedException?.MoreDetails?.[0].AdditionalParameters?.find(ap => ap.Name == "additionalScopesToConsent")?.Value?.split(", ")
            };
            if (authenticationUIRequiredException?.ErrorMessage?.includes("AADSTS65001")) { // consent
                await workloadClient.auth.acquireAccessToken({additionalScopesToConsent: authenticationUIRequiredException.ScopesToConsent});
                return true;
            } else { // conditional access policy
                await workloadClient.auth.acquireAccessToken({claimsForConditionalAccessPolicy: authenticationUIRequiredException.ClaimsForConditionalAccessPolicy});
                return true;
            }
        }
    }
    return false;
}