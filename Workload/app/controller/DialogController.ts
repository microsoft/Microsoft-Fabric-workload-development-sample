/**
 * DialogController.ts
 * This module provides functions to interact with the WorkloadClientAPI for dialog and notification operations.
 */

import { ActionButton, CloseMode, DialogType, WorkloadClientAPI } from "@ms-fabric/workload-client";


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
    workloadClient: WorkloadClientAPI,
    workloadName: string,
    path: string,
    width: number,
    height: number,
    hasCloseButton: boolean) {

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
    workloadClient: WorkloadClientAPI,
    title: string,
    content: string,
    actionButtonsNames: string[],
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

