// --- Panel API

import { CloseMode, WorkloadClientAPI } from "@ms-fabric/workload-client";

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