
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