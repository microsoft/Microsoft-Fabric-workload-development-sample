import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { FabricPlatformClient } from "./FabricPlatformClient";
import { AuthenticationConfig, PaginatedResponse } from "./FabricPlatformTypes";
import { SCOPE_PAIRS } from "./FabricPlatformScopes";

/**
 * Node family types for Spark pools
 */
export type NodeFamily = 'MemoryOptimized';

/**
 * Node size types for Spark pools
 */
export type NodeSize = 'Small' | 'Medium' | 'Large' | 'XLarge' | 'XXLarge';

/**
 * Custom pool types
 */
export type CustomPoolType = 'Workspace' | 'Capacity';

/**
 * Livy Session States
 */
export type LivySessionState = 'InProgress' | 'Cancelled' | 'NotStarted' | 'Succeeded' | 'Failed' | 'Unknown';

/**
 * Livy Session Origins
 */
export type LivySessionOrigin = 'SubmittedJob' | 'PendingJob';

/**
 * Livy Session Item Types
 */
export type LivySessionItemType = 'Lakehouse' | 'SparkJobDefinition' | 'Notebook';

/**
 * Livy Session Job Types
 */
export type LivySessionJobType = 'Unknown' | 'SparkSession' | 'SparkBatch' | 'JupyterSession';

/**
 * Automatic log properties
 */
export interface AutomaticLogProperties {
  enabled: boolean;
}

/**
 * High concurrency properties
 */
export interface HighConcurrencyProperties {
  notebookInteractiveRunEnabled?: boolean;
  notebookPipelineRunEnabled?: boolean;
}

/**
 * Instance pool reference
 */
export interface InstancePool {
  name?: string;
  type?: CustomPoolType;
  id?: string;
}

/**
 * Starter pool properties
 */
export interface StarterPoolProperties {
  maxNodeCount?: number;
  maxExecutors?: number;
}

/**
 * Pool properties for workspace settings
 */
export interface PoolProperties {
  customizeComputeEnabled?: boolean;
  defaultPool?: InstancePool;
  starterPool?: StarterPoolProperties;
}

/**
 * Environment properties for workspace settings
 */
export interface EnvironmentProperties {
  name?: string;
  runtimeVersion?: string;
}

/**
 * Spark jobs properties
 */
export interface SparkJobsProperties {
  conservativeJobAdmissionEnabled?: boolean;
  sessionTimeoutInMinutes?: number;
}

/**
 * Workspace Spark Settings
 */
export interface WorkspaceSparkSettings {
  automaticLog?: AutomaticLogProperties;
  highConcurrency?: HighConcurrencyProperties;
  pool?: PoolProperties;
  environment?: EnvironmentProperties;
  job?: SparkJobsProperties;
}

/**
 * Update workspace Spark settings request
 */
export interface UpdateWorkspaceSparkSettingsRequest {
  automaticLog?: AutomaticLogProperties;
  highConcurrency?: HighConcurrencyProperties;
  pool?: PoolProperties;
  environment?: EnvironmentProperties;
  job?: SparkJobsProperties;
}

/**
 * Autoscale properties for custom pools
 */
export interface AutoScaleProperties {
  enabled: boolean;
  minNodeCount: number;
  maxNodeCount: number;
}

/**
 * Dynamic executor allocation properties
 */
export interface DynamicExecutorAllocationProperties {
  enabled: boolean;
  minExecutors: number;
  maxExecutors: number;
}

/**
 * Create custom pool request
 */
export interface CreateCustomPoolRequest {
  name: string;
  nodeFamily: NodeFamily;
  nodeSize: NodeSize;
  autoScale: AutoScaleProperties;
  dynamicExecutorAllocation: DynamicExecutorAllocationProperties;
}

/**
 * Update custom pool request
 */
export interface UpdateCustomPoolRequest {
  name?: string;
  nodeFamily?: NodeFamily;
  nodeSize?: NodeSize;
  autoScale?: AutoScaleProperties;
  dynamicExecutorAllocation?: DynamicExecutorAllocationProperties;
}

/**
 * Custom pool definition
 */
export interface CustomPool {
  id?: string;
  name?: string;
  type?: CustomPoolType;
  nodeFamily?: NodeFamily;
  nodeSize?: NodeSize;
  autoScale?: AutoScaleProperties;
  dynamicExecutorAllocation?: DynamicExecutorAllocationProperties;
}

/**
 * Custom pools list response
 */
export interface CustomPools extends PaginatedResponse<CustomPool> {
  value: CustomPool[];
}

/**
 * Principal reference for Livy sessions
 */
export interface Principal {
  id: string;
  type: 'User' | 'Group' | 'ServicePrincipal' | 'ManagedIdentity';
  profile?: {
    displayName?: string;
    email?: string;
  };
}

/**
 * Item reference by ID
 */
export interface ItemReferenceById {
  id: string;
  workspaceId?: string;
}

/**
 * Duration representation
 */
export interface Duration {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

/**
 * Livy Session information
 */
export interface LivySession {
  sparkApplicationId?: string;
  state?: LivySessionState;
  livyId?: string;
  origin?: LivySessionOrigin;
  attemptNumber?: number;
  maxNumberOfAttempts?: number;
  livyName?: string;
  submitter?: Principal;
  item?: ItemReferenceById;
  itemType?: LivySessionItemType;
  itemName?: string;
  jobType?: LivySessionJobType;
  submittedDateTime?: string;
  startDateTime?: string;
  endDateTime?: string;
  queuedDuration?: Duration;
  runningDuration?: Duration;
  totalDuration?: Duration;
  jobInstanceId?: string;
  creatorItem?: ItemReferenceById;
  isHighConcurrency?: boolean;
  cancellationReason?: string;
  capacityId?: string;
  operationName?: string;
  consumerId?: Principal;
  runtimeVersion?: string;
  livySessionItemResourceUri?: string;
}

/**
 * Livy Sessions list response
 */
export interface LivySessions extends PaginatedResponse<LivySession> {
  value: LivySession[];
}

/**
 * Spark Client for Microsoft Fabric
 * Provides comprehensive management of Spark settings, custom pools, and Livy sessions
 * Based on the Fabric Spark REST API specification
 * 
 * Uses method-based scope selection:
 * - GET operations use read-only scopes
 * - POST/PUT/PATCH/DELETE operations use read-write scopes
 */
export class SparkClient extends FabricPlatformClient {

  constructor(
    workloadClientOrAuthConfig?: WorkloadClientAPI | AuthenticationConfig,
    authConfig?: AuthenticationConfig
  ) {
    // Use scope pairs for method-based scope selection
    super(workloadClientOrAuthConfig, SCOPE_PAIRS.SPARK_LIVY, authConfig);
  }

  // ============================
  // Workspace Spark Settings Management
  // ============================

  /**
   * Get workspace Spark settings
   * @param workspaceId The workspace ID
   * @returns Promise<WorkspaceSparkSettings>
   * 
   * @example
   * ```typescript
   * const sparkClient = new SparkClient(workloadClient);
   * const settings = await sparkClient.getWorkspaceSparkSettings('workspace-id');
   * console.log('Automatic logging enabled:', settings.automaticLog?.enabled);
   * ```
   */
  async getWorkspaceSparkSettings(workspaceId: string): Promise<WorkspaceSparkSettings> {
    if (!workspaceId) {
      throw new Error('Workspace ID is required');
    }

    const endpoint = `/workspaces/${workspaceId}/spark/settings`;
    return this.get<WorkspaceSparkSettings>(endpoint);
  }

  /**
   * Update workspace Spark settings
   * @param workspaceId The workspace ID
   * @param settings The settings to update
   * @returns Promise<WorkspaceSparkSettings>
   * 
   * @example
   * ```typescript
   * const sparkClient = new SparkClient(workloadClient);
   * const updatedSettings = await sparkClient.updateWorkspaceSparkSettings('workspace-id', {
   *   automaticLog: { enabled: true },
   *   highConcurrency: {
   *     notebookInteractiveRunEnabled: true,
   *     notebookPipelineRunEnabled: false
   *   },
   *   job: {
   *     sessionTimeoutInMinutes: 480,
   *     conservativeJobAdmissionEnabled: true
   *   }
   * });
   * ```
   */
  async updateWorkspaceSparkSettings(
    workspaceId: string, 
    settings: UpdateWorkspaceSparkSettingsRequest
  ): Promise<WorkspaceSparkSettings> {
    if (!workspaceId) {
      throw new Error('Workspace ID is required');
    }

    if (!settings || Object.keys(settings).length === 0) {
      throw new Error('Settings object cannot be empty');
    }

    const endpoint = `/workspaces/${workspaceId}/spark/settings`;
    return this.patch<WorkspaceSparkSettings>(endpoint, settings);
  }

  // ============================
  // Custom Pools Management
  // ============================

  /**
   * List custom pools in a workspace
   * @param workspaceId The workspace ID
   * @param continuationToken Optional continuation token for pagination
   * @returns Promise<CustomPools>
   * 
   * @example
   * ```typescript
   * const sparkClient = new SparkClient(workloadClient);
   * const pools = await sparkClient.listCustomPools('workspace-id');
   * console.log('Found pools:', pools.value.length);
   * ```
   */
  async listCustomPools(workspaceId: string, continuationToken?: string): Promise<CustomPools> {
    if (!workspaceId) {
      throw new Error('Workspace ID is required');
    }

    let endpoint = `/workspaces/${workspaceId}/spark/pools`;
    if (continuationToken) {
      endpoint += `?continuationToken=${encodeURIComponent(continuationToken)}`;
    }

    return this.get<CustomPools>(endpoint);
  }

  /**
   * Get all custom pools in a workspace (handles pagination automatically)
   * @param workspaceId The workspace ID
   * @returns Promise<CustomPool[]>
   */
  async getAllCustomPools(workspaceId: string): Promise<CustomPool[]> {
    return this.getAllPages<CustomPool>(`/workspaces/${workspaceId}/spark/pools`);
  }

  /**
   * Get a specific custom pool
   * @param workspaceId The workspace ID
   * @param poolId The custom pool ID
   * @returns Promise<CustomPool>
   * 
   * @example
   * ```typescript
   * const sparkClient = new SparkClient(workloadClient);
   * const pool = await sparkClient.getCustomPool('workspace-id', 'pool-id');
   * console.log('Pool name:', pool.name);
   * console.log('Node size:', pool.nodeSize);
   * ```
   */
  async getCustomPool(workspaceId: string, poolId: string): Promise<CustomPool> {
    if (!workspaceId) {
      throw new Error('Workspace ID is required');
    }

    if (!poolId) {
      throw new Error('Pool ID is required');
    }

    const endpoint = `/workspaces/${workspaceId}/spark/pools/${poolId}`;
    return this.get<CustomPool>(endpoint);
  }

  /**
   * Create a new custom pool
   * @param workspaceId The workspace ID
   * @param poolRequest The pool creation request
   * @returns Promise<CustomPool>
   * 
   * @example
   * ```typescript
   * const sparkClient = new SparkClient(workloadClient);
   * const newPool = await sparkClient.createCustomPool('workspace-id', {
   *   name: 'My Analytics Pool',
   *   nodeFamily: 'MemoryOptimized',
   *   nodeSize: 'Large',
   *   autoScale: {
   *     enabled: true,
   *     minNodeCount: 2,
   *     maxNodeCount: 10
   *   },
   *   dynamicExecutorAllocation: {
   *     enabled: true,
   *     minExecutors: 1,
   *     maxExecutors: 20
   *   }
   * });
   * ```
   */
  async createCustomPool(workspaceId: string, poolRequest: CreateCustomPoolRequest): Promise<CustomPool> {
    if (!workspaceId) {
      throw new Error('Workspace ID is required');
    }

    if (!poolRequest) {
      throw new Error('Pool request is required');
    }

    // Validate required fields
    if (!poolRequest.name || poolRequest.name.trim().length === 0) {
      throw new Error('Pool name is required');
    }

    if (!poolRequest.nodeFamily) {
      throw new Error('Node family is required');
    }

    if (!poolRequest.nodeSize) {
      throw new Error('Node size is required');
    }

    if (!poolRequest.autoScale) {
      throw new Error('Auto scale configuration is required');
    }

    if (!poolRequest.dynamicExecutorAllocation) {
      throw new Error('Dynamic executor allocation configuration is required');
    }

    const endpoint = `/workspaces/${workspaceId}/spark/pools`;
    return this.post<CustomPool>(endpoint, poolRequest);
  }

  /**
   * Update an existing custom pool
   * @param workspaceId The workspace ID
   * @param poolId The custom pool ID
   * @param poolRequest The pool update request
   * @returns Promise<CustomPool>
   * 
   * @example
   * ```typescript
   * const sparkClient = new SparkClient(workloadClient);
   * const updatedPool = await sparkClient.updateCustomPool('workspace-id', 'pool-id', {
   *   name: 'Updated Pool Name',
   *   autoScale: {
   *     enabled: true,
   *     minNodeCount: 3,
   *     maxNodeCount: 15
   *   }
   * });
   * ```
   */
  async updateCustomPool(
    workspaceId: string, 
    poolId: string, 
    poolRequest: UpdateCustomPoolRequest
  ): Promise<CustomPool> {
    if (!workspaceId) {
      throw new Error('Workspace ID is required');
    }

    if (!poolId) {
      throw new Error('Pool ID is required');
    }

    if (!poolRequest || Object.keys(poolRequest).length === 0) {
      throw new Error('Pool update request cannot be empty');
    }

    const endpoint = `/workspaces/${workspaceId}/spark/pools/${poolId}`;
    return this.patch<CustomPool>(endpoint, poolRequest);
  }

  /**
   * Delete a custom pool
   * @param workspaceId The workspace ID
   * @param poolId The custom pool ID
   * @returns Promise<void>
   * 
   * @example
   * ```typescript
   * const sparkClient = new SparkClient(workloadClient);
   * await sparkClient.deleteCustomPool('workspace-id', 'pool-id');
   * console.log('Pool deleted successfully');
   * ```
   */
  async deleteCustomPool(workspaceId: string, poolId: string): Promise<void> {
    if (!workspaceId) {
      throw new Error('Workspace ID is required');
    }

    if (!poolId) {
      throw new Error('Pool ID is required');
    }

    const endpoint = `/workspaces/${workspaceId}/spark/pools/${poolId}`;
    return this.delete<void>(endpoint);
  }

  // ============================
  // Livy Sessions Management
  // ============================

  /**
   * List Livy sessions in a workspace
   * @param workspaceId The workspace ID
   * @param continuationToken Optional continuation token for pagination
   * @returns Promise<LivySessions>
   * 
   * @example
   * ```typescript
   * const sparkClient = new SparkClient(workloadClient);
   * const sessions = await sparkClient.listLivySessions('workspace-id');
   * sessions.value.forEach(session => {
   *   console.log(`Session ${session.livyName}: ${session.state}`);
   * });
   * ```
   */
  async listLivySessions(workspaceId: string, continuationToken?: string): Promise<LivySessions> {
    if (!workspaceId) {
      throw new Error('Workspace ID is required');
    }

    let endpoint = `/workspaces/${workspaceId}/spark/livySessions`;
    if (continuationToken) {
      endpoint += `?continuationToken=${encodeURIComponent(continuationToken)}`;
    }

    return this.get<LivySessions>(endpoint);
  }

  /**
   * Get all Livy sessions in a workspace (handles pagination automatically)
   * @param workspaceId The workspace ID
   * @returns Promise<LivySession[]>
   */
  async getAllLivySessions(workspaceId: string): Promise<LivySession[]> {
    return this.getAllPages<LivySession>(`/workspaces/${workspaceId}/spark/livySessions`);
  }

  // ============================
  // Utility Methods
  // ============================

  /**
   * Check if a custom pool name is valid
   * @param name The pool name to validate
   * @returns boolean
   */
  static isValidPoolName(name: string): boolean {
    if (!name || name.trim().length === 0) {
      return false;
    }

    // Name must be between 1 and 64 characters long
    if (name.length < 1 || name.length > 64) {
      return false;
    }

    // Must contain only letters, numbers, dashes, underscores and spaces
    const validPattern = /^[a-zA-Z0-9\-_ ]+$/;
    if (!validPattern.test(name)) {
      return false;
    }

    // "Starter Pool" is reserved
    if (name.toLowerCase().trim() === 'starter pool') {
      return false;
    }

    return true;
  }

  /**
   * Validate autoscale configuration
   * @param autoScale The autoscale configuration to validate
   * @returns string[] Array of validation errors (empty if valid)
   */
  static validateAutoScale(autoScale: AutoScaleProperties): string[] {
    const errors: string[] = [];

    if (autoScale.minNodeCount < 1) {
      errors.push('Minimum node count must be at least 1');
    }

    if (autoScale.maxNodeCount < 1) {
      errors.push('Maximum node count must be at least 1');
    }

    if (autoScale.minNodeCount > autoScale.maxNodeCount) {
      errors.push('Minimum node count cannot be greater than maximum node count');
    }

    return errors;
  }

  /**
   * Validate dynamic executor allocation configuration
   * @param allocation The dynamic executor allocation configuration to validate
   * @returns string[] Array of validation errors (empty if valid)
   */
  static validateDynamicExecutorAllocation(allocation: DynamicExecutorAllocationProperties): string[] {
    const errors: string[] = [];

    if (allocation.minExecutors < 1) {
      errors.push('Minimum executors must be at least 1');
    }

    if (allocation.maxExecutors < 1) {
      errors.push('Maximum executors must be at least 1');
    }

    if (allocation.minExecutors > allocation.maxExecutors) {
      errors.push('Minimum executors cannot be greater than maximum executors');
    }

    return errors;
  }

  /**
   * Get the display name for a node size
   * @param nodeSize The node size
   * @returns string The display name
   */
  static getNodeSizeDisplayName(nodeSize: NodeSize): string {
    const displayNames: Record<NodeSize, string> = {
      'Small': 'Small (4 cores, 28 GB RAM)',
      'Medium': 'Medium (8 cores, 56 GB RAM)',
      'Large': 'Large (16 cores, 112 GB RAM)',
      'XLarge': 'XLarge (32 cores, 224 GB RAM)',
      'XXLarge': 'XXLarge (64 cores, 448 GB RAM)'
    };

    return displayNames[nodeSize] || nodeSize;
  }

  /**
   * Get the display name for a Livy session state
   * @param state The session state
   * @returns string The display name
   */
  static getLivySessionStateDisplayName(state: LivySessionState): string {
    const displayNames: Record<LivySessionState, string> = {
      'InProgress': 'In Progress',
      'Cancelled': 'Cancelled',
      'NotStarted': 'Not Started',
      'Succeeded': 'Succeeded',
      'Failed': 'Failed',
      'Unknown': 'Unknown'
    };

    return displayNames[state] || state;
  }

  /**
   * Format duration object to human-readable string
   * @param duration The duration object
   * @returns string The formatted duration
   */
  static formatDuration(duration: Duration): string {
    const parts: string[] = [];

    if (duration.days && duration.days > 0) {
      parts.push(`${duration.days}d`);
    }
    if (duration.hours && duration.hours > 0) {
      parts.push(`${duration.hours}h`);
    }
    if (duration.minutes && duration.minutes > 0) {
      parts.push(`${duration.minutes}m`);
    }
    if (duration.seconds && duration.seconds > 0) {
      parts.push(`${duration.seconds}s`);
    }

    return parts.length > 0 ? parts.join(' ') : '0s';
  }
}
