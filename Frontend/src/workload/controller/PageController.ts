// --- Page API

import { OpenMode, WorkloadClientAPI } from "@ms-fabric/workload-client";


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