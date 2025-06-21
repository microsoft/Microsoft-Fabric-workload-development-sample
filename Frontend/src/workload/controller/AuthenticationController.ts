import { AccessToken, WorkloadClientAPI } from "@ms-fabric/workload-client";

/**
 * Calls acquire frontend access token from the WorkloadClientAPI.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {string} scopes - The scopes for which the access token is requested.
 * @returns {AccessToken}
 */
export async function callAcquireFrontendAccessToken(workloadClient: WorkloadClientAPI, scopes: string): Promise<AccessToken> {
    return workloadClient.auth.acquireFrontendAccessToken({ scopes: scopes?.length ? scopes.split(' ') : [] });
}
