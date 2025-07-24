import { EventhouseItemMetadata } from "./SampleEventhouseModel";
import { EnvironmentConstants } from "../../../constants";
import { callAcquireFrontendAccessToken } from "../../../controller/AuthenticationController";
import { AccessToken, WorkloadClientAPI } from "@ms-fabric/workload-client";
import {v4 as uuidv4} from 'uuid';

const eventHouseScope = "https://api.fabric.microsoft.com/Item.Read.All"
const kqlScope = "https://api.fabric.microsoft.com/KQLDatabase.ReadWrite.All";

/**
 * Calls the GetEventhouseDatabases endpoint of the workload API to get the eventhouse item metadata
 * 
 * @param {string} workspaceId - The workspace object ID.
 * @param {string} eventhouseId - The Eventhouse object ID.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @returns {Promise<EventhouseItemMetadata>} A Promise that resolves to an object containing the eventhouse metadata.
 */
export async function getEventhouseItem(workloadClient: WorkloadClientAPI, workspaceId: string, eventhouseId: string): Promise<EventhouseItemMetadata> {
    try {
        const accessToken: AccessToken = await callAcquireFrontendAccessToken(workloadClient, eventHouseScope);
        const response: Response = await fetch(EnvironmentConstants.FabricApiBaseUrl + `/v1/workspaces/${workspaceId}/eventhouses/${eventhouseId}`,
        {
            method: `GET`,
            headers: {
                'Authorization': 'Bearer ' + accessToken.token,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            // Handle non-successful responses here
            const errorMessage: string = await response.text();
            console.error(`Error calling GetEventhouseItem API: ${errorMessage}`);
            //return await handleException(errorMessage, workloadClient, false /* isRetry , true /* isDirectWorkloadCall , callGetEventhouseItem, workloadBEUrl, workspaceObjectId, eventhouseObjectId);
        }

        const result: EventhouseItemMetadata = await response.json();

        console.log('*** Successfully called GetEventhouseItem API');
        return result;
    } catch (error) {
        console.error('Error in GetEventhouseItem:', error);
        return null;
    }
}

/**
 * Calls the CallExecuteQuery endpoint to perform a query on selected Kusto DB.
 * 
 * @param {string} queryUrl - The database url.
 * @param {string} databaseName - The database name.
 * @param {string} query - The query to execute.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @returns {Promise<object[]>} A Promise that resolves to an object containing the queries result.
 */
export async function executeQuery(workloadClient: WorkloadClientAPI, queryUrl: string, databaseName: string, query: string, 
    setClientRequestId: (id: string) => void) : Promise<object[]> {
    try {

        //KqlDatabases/query
        const scopes = kqlScope + " " + queryUrl + "/user_impersonation" 
        const accessToken: AccessToken = await callAcquireFrontendAccessToken(workloadClient, scopes);
        const clientRequestId = 'WS-' + uuidv4();
        setClientRequestId(clientRequestId);
        const response: Response = await fetch(queryUrl + `/v1/rest/mgmt`, 
        {
            method: `POST`,
            headers: {
                'Authorization': 'Bearer ' + accessToken.token,
                'Content-Type': 'application/json',
                'x-ms-client-request-id': clientRequestId,
            },
            body: JSON.stringify({
                'db': databaseName,
                'csl': query
            })
        });
        setClientRequestId(undefined);
        if (!response.ok) {
            // Handle non-successful responses here
            const errorMessage: string = await response.text();
            console.error(`Error calling ExecuteQuery API: ${errorMessage}`);
            //return await handleException(errorMessage, workloadClient, false /* isRetry /, true /* isDirectWorkloadCall /, CallExecuteQuery, workloadBEUrl, queryUrl, databaseName, query, setClientRequestId);
        }

        const result: object[] = await response.json();

        console.log('*** Successfully called ExecuteQuery API');
        return result;
    }
    catch (error) {
        console.error('Error in CallExecuteQuery:', error);
        return null;
    }
}