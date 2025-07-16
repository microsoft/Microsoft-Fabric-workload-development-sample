// --- Action API

import { WorkloadAction, WorkloadClientAPI } from "@ms-fabric/workload-client";

/**
 * Registers a callback to be invoked when a workload action is triggered
 * using the 'action.onAction' function.
 *
 * @param {(action: WorkloadAction<unknown>) => Promise<unknown>} callback - The callback function to handle the action.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function callActionOnAction(
    workloadClient: WorkloadClientAPI,
    callback: (action: WorkloadAction<unknown>) => Promise<unknown>
    ) {

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
    workloadClient: WorkloadClientAPI,
    actionName: string,
    workloadName: string) {

    await workloadClient.action.execute({ action: actionName, workloadName })
}