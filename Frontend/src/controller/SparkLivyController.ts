import { AccessToken, WorkloadClientAPI } from "@ms-fabric/workload-client";
import { callAuthAcquireFrontendAccessToken } from "./SampleWorkloadController";
import { EnvironmentConstants, livyScope } from "../constants";

// Base URL for Livy API
const livyBaseUrl = EnvironmentConstants.LivyApiBaseUrl;

// Livy API version
const LIVY_API_VERSION = "2024-07-30";

// Enum for batch job states
export enum BatchState {
    STARTING = "starting",
    RUNNING = "running",
    DEAD = "dead",
    SUCCESS = "success",
    KILLED = "killed",
    ERROR = "error",
    NOT_STARTED = "not_started",
    SUBMITTING = "submitting",
    NOT_SUBMITTED = "not_submitted"
}

// Enum for session states
export enum SessionState {
    STARTING = "starting",
    RUNNING = "running",
    IDLE = "idle",
    DEAD = "dead",
    SUCCESS = "success",
    KILLED = "killed",
    ERROR = "error", 
    SHUTTING_DOWN = "shutting_down",
    BUSY = "busy",
    RECOVERING = "recovering",
    NOT_STARTED = "not_started",
    SUBMITTING = "submitting",
    NOT_SUBMITTED = "not_submitted"
}

// Enum for job types
export enum JobType {
    SPARK_BATCH = "SparkBatch",
    SPARK_SESSION = "SparkSession",
    SCOPE_BATCH = "ScopeBatch",
    JUPYTER_ENVIRONMENT = "JupyterEnvironment"
}

// Enum for job results
export enum JobResult {
    UNCERTAIN = "Uncertain",
    SUCCEEDED = "Succeeded",
    FAILED = "Failed",
    CANCELLED = "Cancelled"
}

// Enum for error sources
export enum ErrorSource {
    SYSTEM = "System",
    USER = "User",
    UNKNOWN = "Unknown",
    DEPENDENCY = "Dependency"
}

// Interfaces for batch operations
export interface BatchRequest {
    name?: string;
    file?: string;
    proxyUser?: string;
    className?: string;
    args?: string[];
    jars?: string[];
    pyFiles?: string[];
    files?: string[];
    driverMemory?: string;
    driverCores?: number;
    executorMemory?: string;
    executorCores?: number;
    numExecutors?: number;
    archives?: string[];
    queue?: string;
    conf?: { [key: string]: string };
    maxRetries?: number;
    tags?: { [key: string]: string };
}

export interface BatchStateInformation {
    id?: string;
    appId?: string;
    name?: string;
    workspaceId?: string;
    submitterId?: string;
    submitterName?: string;
    artifactId?: string;
    cancellationReason?: string;
    result?: JobResult;
    submittedAt?: string;
    startedAt?: string;
    endedAt?: string;
    errorSource?: ErrorSource;
    errorCode?: string;
    tags?: { [key: string]: string };
    schedulerState?: string;
    pluginState?: string;
    livyState?: string;
    isJobTimedOut?: boolean;
}

export interface BatchStateInfo {
    state?: string;
    errorMessage?: string;
}

export interface ErrorInformation {
    message?: string;
    errorCode?: string;
    source?: ErrorSource;
}

export interface SparkServicePluginInformation {
    state?: string;
}

export interface SchedulerInformation {
    state?: string;
}

export interface BatchResponse {
    livyInfo?: BatchStateInformation;
    fabricBatchStateInfo?: BatchStateInfo;
    name?: string;
    id?: string;
    appId?: string;
    appInfo?: { [key: string]: string };
    artifactId?: string;
    errorInfo?: ErrorInformation[];
    jobType?: JobType;
    submitterId?: string;
    submitterName?: string;
    log?: string[];
    pluginInfo?: SparkServicePluginInformation;
    schedulerInfo?: SchedulerInformation;
    state?: BatchState;
    tags?: { [key: string]: string };
    result?: JobResult;
    cancellationReason?: string;
}

// Interfaces for session operations
export interface SessionRequest {
    name?: string;
    kind?: string; // e.g., "pyspark", "sparksql", "sparkR"
    proxyUser?: string;
    jars?: string[];
    pyFiles?: string[];
    files?: string[];
    driverMemory?: string;
    driverCores?: number;
    executorMemory?: string;
    executorCores?: number;
    numExecutors?: number;
    archives?: string[];
    queue?: string;
    conf?: { [key: string]: string };
    heartbeatTimeoutInSeconds?: number;
    tags?: { [key: string]: string };
}

export interface LivySessionStateInformation {
    id?: string;
    appId?: string;
    name?: string;
    workspaceId?: string;
    submitterId?: string;
    submitterName?: string;
    artifactId?: string;
    cancellationReason?: string;
    result?: JobResult;
    submittedAt?: string;
    startedAt?: string;
    endedAt?: string;
    errorSource?: ErrorSource;
    errorCode?: string;
    tags?: { [key: string]: string };
    schedulerState?: string;
    pluginState?: string;
    livyState?: string;
    isJobTimedOut?: boolean;
}

export interface SessionStateInfo {
    state?: string;
    errorMessage?: string;
}

export interface SessionResponse {
    fabricSessionStateInfo?: SessionStateInfo;
    livyInfo?: LivySessionStateInformation;
    name?: string;
    id?: string;
    appId?: string;
    appInfo?: { [key: string]: string };
    artifactId?: string;
    errorInfo?: ErrorInformation[];
    jobType?: JobType;
    submitterId?: string;
    submitterName?: string;
    log?: string[];
    pluginInfo?: SparkServicePluginInformation;
    schedulerInfo?: SchedulerInformation;
    state?: SessionState;
    tags?: { [key: string]: string };
    result?: JobResult;
    cancellationReason?: string;
}

// Interfaces for statement operations
export interface StatementRequest {
    code: string;
    kind?: string;
}

export interface StatementOutput {
    status: string;
    execution_count: number;
    data?: any;
}

export interface StatementResponse {
    id: number;
    code: string;
    state: string;
    output?: StatementOutput;
    progress?: number;
    started?: number;
    completed?: number;
}

export interface ErrorResponse {
    error: {
        message: string;
        type?: string;
    };
}

// Helper function to handle HTTP errors
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorText = await response.text();
        let errorObj: ErrorResponse;
        
        try {
            errorObj = JSON.parse(errorText);
            throw new Error(`${response.status}: ${errorObj.error.message || errorText}`);
        } catch (e) {
            throw new Error(`${response.status}: ${errorText || response.statusText}`);
        }
    }
    
    return await response.json() as T;
}

/**
 * Create a new batch job in a Fabric lakehouse
 * @param workloadClient The WorkloadClientAPI instance
 * @param workspaceId The workspace ID
 * @param lakehouseId The lakehouse ID
 * @param batchRequest The batch request parameters
 * @returns A promise resolving to the batch response
 */
export async function createBatch(
    workloadClient: WorkloadClientAPI,
    workspaceId: string,
    lakehouseId: string,
    batchRequest: BatchRequest
): Promise<BatchResponse> {
    try {
        const accessToken: AccessToken = await callAuthAcquireFrontendAccessToken(workloadClient, livyScope);
        const url = `${livyBaseUrl}/workspaces/${workspaceId}/lakehouses/${lakehouseId}/livyApi/versions/${LIVY_API_VERSION}/batches`;
        
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(batchRequest)
        });
        
        return handleResponse<BatchResponse>(response);
    } catch (error: any) {
        console.error(`Error creating batch job: ${error.message}`);
        throw error;
    }
}

/**
 * List all batch jobs in a Fabric lakehouse
 * @param workloadClient The WorkloadClientAPI instance
 * @param workspaceId The workspace ID
 * @param lakehouseId The lakehouse ID
 * @returns A promise resolving to an array of batch responses
 */
export async function listBatches(
    workloadClient: WorkloadClientAPI,
    workspaceId: string,
    lakehouseId: string
): Promise<BatchResponse[]> {
    try {
        const accessToken: AccessToken = await callAuthAcquireFrontendAccessToken(workloadClient, livyScope);
        const url = `${livyBaseUrl}/workspaces/${workspaceId}/lakehouses/${lakehouseId}/livyApi/versions/${LIVY_API_VERSION}/batches`;
        
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken.token}`
            }
        });
        
        return handleResponse<BatchResponse[]>(response);
    } catch (error: any) {
        console.error(`Error listing batch jobs: ${error.message}`);
        throw error;
    }
}

/**
 * Get a specific batch job by ID
 * @param workloadClient The WorkloadClientAPI instance
 * @param workspaceId The workspace ID
 * @param lakehouseId The lakehouse ID
 * @param batchId The batch job ID
 * @returns A promise resolving to the batch response
 */
export async function getBatch(
    workloadClient: WorkloadClientAPI,
    workspaceId: string,
    lakehouseId: string,
    batchId: string
): Promise<BatchResponse> {
    try {
        const accessToken: AccessToken = await callAuthAcquireFrontendAccessToken(workloadClient, livyScope);
        const url = `${livyBaseUrl}/workspaces/${workspaceId}/lakehouses/${lakehouseId}/livyApi/versions/${LIVY_API_VERSION}/batches/${batchId}`;
        
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken.token}`
            }
        });
        
        return handleResponse<BatchResponse>(response);
    } catch (error: any) {
        console.error(`Error getting batch job ${batchId}: ${error.message}`);
        throw error;
    }
}

/**
 * Delete a specific batch job by ID
 * @param workloadClient The WorkloadClientAPI instance
 * @param workspaceId The workspace ID
 * @param lakehouseId The lakehouse ID
 * @param batchId The batch job ID
 * @returns A promise resolving when the batch job is deleted
 */
export async function deleteBatch(
    workloadClient: WorkloadClientAPI,
    workspaceId: string,
    lakehouseId: string,
    batchId: string
): Promise<void> {
    try {
        const accessToken: AccessToken = await callAuthAcquireFrontendAccessToken(workloadClient, livyScope);
        const url = `${livyBaseUrl}/workspaces/${workspaceId}/lakehouses/${lakehouseId}/livyApi/versions/${LIVY_API_VERSION}/batches/${batchId}`;
        
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${accessToken.token}`
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to delete batch job ${batchId}: ${response.status} ${errorText}`);
        }
    } catch (error: any) {
        console.error(`Error deleting batch job ${batchId}: ${error.message}`);
        throw error;
    }
}

/**
 * Cancel a specific batch job by ID
 * @param workloadClient The WorkloadClientAPI instance
 * @param workspaceId The workspace ID
 * @param lakehouseId The lakehouse ID
 * @param batchId The batch job ID
 * @returns A promise resolving to the batch response
 */
export async function cancelBatch(
    workloadClient: WorkloadClientAPI,
    workspaceId: string,
    lakehouseId: string,
    batchId: string
): Promise<BatchResponse> {
    try {
        const accessToken: AccessToken = await callAuthAcquireFrontendAccessToken(workloadClient, livyScope);
        const url = `${livyBaseUrl}/workspaces/${workspaceId}/lakehouses/${lakehouseId}/livyApi/versions/${LIVY_API_VERSION}/batches/${batchId}/state`;
        
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${accessToken.token}`
            }
        });
        
        return handleResponse<BatchResponse>(response);
    } catch (error: any) {
        console.error(`Error cancelling batch job ${batchId}: ${error.message}`);
        throw error;
    }
}

/**
 * Get the logs for a specific batch job
 * @param workloadClient The WorkloadClientAPI instance
 * @param workspaceId The workspace ID
 * @param lakehouseId The lakehouse ID
 * @param batchId The batch job ID
 * @param from Optional starting line for logs
 * @param size Optional number of lines to retrieve
 * @returns A promise resolving to an object containing log lines
 */
export async function getBatchLogs(
    workloadClient: WorkloadClientAPI,
    workspaceId: string,
    lakehouseId: string,
    batchId: string,
    from?: number,
    size?: number
): Promise<{ id: string, log: string[] }> {
    try {
        const accessToken: AccessToken = await callAuthAcquireFrontendAccessToken(workloadClient, livyScope);
        let url = `${livyBaseUrl}/workspaces/${workspaceId}/lakehouses/${lakehouseId}/livyApi/versions/${LIVY_API_VERSION}/batches/${batchId}/log`;
        
        // Add optional query parameters if provided
        const params = new URLSearchParams();
        if (from !== undefined) params.append("from", from.toString());
        if (size !== undefined) params.append("size", size.toString());
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken.token}`
            }
        });
        
        return handleResponse<{ id: string, log: string[] }>(response);
    } catch (error: any) {
        console.error(`Error getting logs for batch job ${batchId}: ${error.message}`);
        throw error;
    }
}

/**
 * Get the state of a specific batch job
 * @param workloadClient The WorkloadClientAPI instance
 * @param workspaceId The workspace ID
 * @param lakehouseId The lakehouse ID
 * @param batchId The batch job ID
 * @returns A promise resolving to the batch state
 */
export async function getBatchState(
    workloadClient: WorkloadClientAPI,
    workspaceId: string,
    lakehouseId: string,
    batchId: string
): Promise<{ id: string, state: BatchState }> {
    try {
        const accessToken: AccessToken = await callAuthAcquireFrontendAccessToken(workloadClient, livyScope);
        const url = `${livyBaseUrl}/workspaces/${workspaceId}/lakehouses/${lakehouseId}/livyApi/versions/${LIVY_API_VERSION}/batches/${batchId}/state`;
        
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken.token}`
            }
        });
        
        return handleResponse<{ id: string, state: BatchState }>(response);
    } catch (error: any) {
        console.error(`Error getting state for batch job ${batchId}: ${error.message}`);
        throw error;
    }
}

/**
 * Create a new Livy session
 * @param workloadClient The WorkloadClientAPI instance
 * @param workspaceId The workspace ID
 * @param lakehouseId The lakehouse ID
 * @param sessionRequest The session request parameters
 * @returns A promise resolving to the session response
 */
export async function createSession(
    workloadClient: WorkloadClientAPI,
    workspaceId: string,
    lakehouseId: string,
    sessionRequest: SessionRequest
): Promise<SessionResponse> {
    try {
        const accessToken: AccessToken = await callAuthAcquireFrontendAccessToken(workloadClient, livyScope);
        const url = `${livyBaseUrl}/workspaces/${workspaceId}/lakehouses/${lakehouseId}/livyApi/versions/${LIVY_API_VERSION}/sessions`;
        
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(sessionRequest)
        });
        
        return handleResponse<SessionResponse>(response);
    } catch (error: any) {
        console.error(`Error creating session: ${error.message}`);
        throw error;
    }
}

/**
 * List all Livy sessions
 * @param workloadClient The WorkloadClientAPI instance
 * @param workspaceId The workspace ID
 * @param lakehouseId The lakehouse ID
 * @returns A promise resolving to an array of session responses
 */
export async function listSessions(
    workloadClient: WorkloadClientAPI,
    workspaceId: string,
    lakehouseId: string
): Promise<SessionResponse[]> {
    try {
        const accessToken: AccessToken = await callAuthAcquireFrontendAccessToken(workloadClient, livyScope);
        const url = `${livyBaseUrl}/workspaces/${workspaceId}/lakehouses/${lakehouseId}/livyApi/versions/${LIVY_API_VERSION}/sessions`;
        
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken.token}`
            }
        });
        
        return handleResponse<SessionResponse[]>(response);
    } catch (error: any) {
        console.error(`Error listing sessions: ${error.message}`);
        throw error;
    }
}

/**
 * Get a specific session by ID
 * @param workloadClient The WorkloadClientAPI instance
 * @param workspaceId The workspace ID
 * @param lakehouseId The lakehouse ID
 * @param sessionId The session ID
 * @returns A promise resolving to the session response
 */
export async function getSession(
    workloadClient: WorkloadClientAPI,
    workspaceId: string,
    lakehouseId: string,
    sessionId: string
): Promise<SessionResponse> {
    try {
        const accessToken: AccessToken = await callAuthAcquireFrontendAccessToken(workloadClient, livyScope);
        const url = `${livyBaseUrl}/workspaces/${workspaceId}/lakehouses/${lakehouseId}/livyApi/versions/${LIVY_API_VERSION}/sessions/${sessionId}`;
        
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken.token}`
            }
        });
        
        return handleResponse<SessionResponse>(response);
    } catch (error: any) {
        console.error(`Error getting session ${sessionId}: ${error.message}`);
        throw error;
    }
}

/**
 * Delete a specific session by ID
 * @param workloadClient The WorkloadClientAPI instance
 * @param workspaceId The workspace ID
 * @param lakehouseId The lakehouse ID
 * @param sessionId The session ID
 * @returns A promise resolving when the session is deleted
 */
export async function deleteSession(
    workloadClient: WorkloadClientAPI,
    workspaceId: string,
    lakehouseId: string,
    sessionId: string
): Promise<void> {
    try {
        const accessToken: AccessToken = await callAuthAcquireFrontendAccessToken(workloadClient, livyScope);
        const url = `${livyBaseUrl}/workspaces/${workspaceId}/lakehouses/${lakehouseId}/livyApi/versions/${LIVY_API_VERSION}/sessions/${sessionId}`;
        
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${accessToken.token}`
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to delete session ${sessionId}: ${response.status} ${errorText}`);
        }
    } catch (error: any) {
        console.error(`Error deleting session ${sessionId}: ${error.message}`);
        throw error;
    }
}

/**
 * Submit a statement to a specific session
 * @param workloadClient The WorkloadClientAPI instance
 * @param workspaceId The workspace ID
 * @param lakehouseId The lakehouse ID
 * @param sessionId The session ID
 * @param statementRequest The statement request containing code to execute
 * @returns A promise resolving to the statement response
 */
export async function submitStatement(
    workloadClient: WorkloadClientAPI,
    workspaceId: string,
    lakehouseId: string,
    sessionId: string,
    statementRequest: StatementRequest
): Promise<StatementResponse> {
    try {
        const accessToken: AccessToken = await callAuthAcquireFrontendAccessToken(workloadClient, livyScope);
        const url = `${livyBaseUrl}/workspaces/${workspaceId}/lakehouses/${lakehouseId}/livyApi/versions/${LIVY_API_VERSION}/sessions/${sessionId}/statements`;
        
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(statementRequest)
        });
        
        return handleResponse<StatementResponse>(response);
    } catch (error: any) {
        console.error(`Error submitting statement to session ${sessionId}: ${error.message}`);
        throw error;
    }
}

/**
 * Get a specific statement by ID within a session
 * @param workloadClient The WorkloadClientAPI instance
 * @param workspaceId The workspace ID
 * @param lakehouseId The lakehouse ID
 * @param sessionId The session ID
 * @param statementId The statement ID
 * @returns A promise resolving to the statement response
 */
export async function getStatement(
    workloadClient: WorkloadClientAPI,
    workspaceId: string,
    lakehouseId: string,
    sessionId: string,
    statementId: string
): Promise<StatementResponse> {
    try {
        const accessToken: AccessToken = await callAuthAcquireFrontendAccessToken(workloadClient, livyScope);
        const url = `${livyBaseUrl}/workspaces/${workspaceId}/lakehouses/${lakehouseId}/livyApi/versions/${LIVY_API_VERSION}/sessions/${sessionId}/statements/${statementId}`;
        
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken.token}`
            }
        });
        
        return handleResponse<StatementResponse>(response);
    } catch (error: any) {
        console.error(`Error getting statement ${statementId} in session ${sessionId}: ${error.message}`);
        throw error;
    }
}

/**
 * List all statements in a specific session
 * @param workloadClient The WorkloadClientAPI instance
 * @param workspaceId The workspace ID
 * @param lakehouseId The lakehouse ID
 * @param sessionId The session ID
 * @returns A promise resolving to an array of statement responses
 */
export async function listStatements(
    workloadClient: WorkloadClientAPI,
    workspaceId: string,
    lakehouseId: string,
    sessionId: string
): Promise<StatementResponse[]> {
    try {
        const accessToken: AccessToken = await callAuthAcquireFrontendAccessToken(workloadClient, livyScope);
        const url = `${livyBaseUrl}/workspaces/${workspaceId}/lakehouses/${lakehouseId}/livyApi/versions/${LIVY_API_VERSION}/sessions/${sessionId}/statements`;
        
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken.token}`
            }
        });
        
        return handleResponse<StatementResponse[]>(response);
    } catch (error: any) {
        console.error(`Error listing statements in session ${sessionId}: ${error.message}`);
        throw error;
    }
}

/**
 * Cancel a session by ID
 * @param workloadClient The WorkloadClientAPI instance
 * @param workspaceId The workspace ID
 * @param lakehouseId The lakehouse ID
 * @param sessionId The session ID
 * @returns A promise resolving to the session response
 */
export async function cancelSession(
    workloadClient: WorkloadClientAPI,
    workspaceId: string,
    lakehouseId: string,
    sessionId: string
): Promise<SessionResponse> {
    try {
        const accessToken: AccessToken = await callAuthAcquireFrontendAccessToken(workloadClient, livyScope);
        const url = `${livyBaseUrl}/workspaces/${workspaceId}/lakehouses/${lakehouseId}/livyApi/versions/${LIVY_API_VERSION}/sessions/${sessionId}/state`;
        
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${accessToken.token}`
            }
        });
        
        return handleResponse<SessionResponse>(response);
    } catch (error: any) {
        console.error(`Error cancelling session ${sessionId}: ${error.message}`);
        throw error;
    }
}