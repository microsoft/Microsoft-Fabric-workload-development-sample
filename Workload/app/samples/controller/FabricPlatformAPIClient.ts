import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { WorkspaceController } from "./WorkspaceController";
import { ItemController } from "./ItemController";
import { FolderController } from "./FolderController";
import { CapacityController } from "./CapacityController";
import { JobSchedulerController } from "./JobSchedulerController";
import { OneLakeShortcutController } from "./OneLakeShortcutController";
import { LongRunningOperationsController } from "./LongRunningOperationsController";
import { SparkLivyController } from "./SparkLivyController";
import { SparkController } from "./SparkController";
import { FabricPlatformClient } from "./FabricPlatformClient";

/**
 * Comprehensive Fabric Platform API Client
 * Provides unified access to all Fabric platform APIs through individual controllers
 */
export class FabricPlatformAPIClient {
  public readonly workspaces: WorkspaceController;
  public readonly items: ItemController;
  public readonly folders: FolderController;
  public readonly capacities: CapacityController;
  public readonly scheduler: JobSchedulerController;
  public readonly shortcuts: OneLakeShortcutController;
  public readonly operations: LongRunningOperationsController;
  public readonly sparkLivy: SparkLivyController;
  public readonly spark: SparkController;

  constructor(workloadClient: WorkloadClientAPI) {
    this.workspaces = new WorkspaceController(workloadClient);
    this.items = new ItemController(workloadClient);
    this.folders = new FolderController(workloadClient);
    this.capacities = new CapacityController(workloadClient);
    this.scheduler = new JobSchedulerController(workloadClient);
    this.shortcuts = new OneLakeShortcutController(workloadClient);
    this.operations = new LongRunningOperationsController(workloadClient);
    this.spark = new SparkController(workloadClient);    
    this.sparkLivy = new SparkLivyController(workloadClient);

  }  
  
  /**
   * Factory method to create a new FabricPlatformAPIClient instance
   * @param workloadClient The WorkloadClientAPI instance
   * @returns FabricPlatformAPIClient
   */
  static create(workloadClient: WorkloadClientAPI): FabricPlatformAPIClient {
    return new FabricPlatformAPIClient(workloadClient);
  }

  /**
   * Factory method to create a new FabricPlatformAPIClient instance with service principal authentication
   * Note: This creates a mock WorkloadClientAPI that uses the authentication service under the hood
   * @param clientId Service principal client ID
   * @param clientSecret Service principal client secret
   * @param tenantId Azure tenant ID
   * @param authority Optional custom authority URL
   * @returns FabricPlatformAPIClient configured for service principal authentication
   */
  static createWithServicePrincipal(
    clientId: string,
    clientSecret: string,
    tenantId: string,
    authority?: string
  ): FabricPlatformAPIClient {
    // Create a mock WorkloadClientAPI since the controllers expect it
    const mockWorkloadClient = {} as WorkloadClientAPI;
    const client = new FabricPlatformAPIClient(mockWorkloadClient);
    
    // Configure all controllers with service principal authentication
    const authConfig = FabricPlatformClient.createServicePrincipalAuth(clientId, clientSecret, tenantId, authority);
    
    // Update authentication config for all controllers
    client.workspaces.updateAuthenticationConfig(authConfig);
    client.items.updateAuthenticationConfig(authConfig);
    client.folders.updateAuthenticationConfig(authConfig);
    client.capacities.updateAuthenticationConfig(authConfig);
    client.scheduler.updateAuthenticationConfig(authConfig);
    client.shortcuts.updateAuthenticationConfig(authConfig);
    client.operations.updateAuthenticationConfig(authConfig);
    client.sparkLivy.updateAuthenticationConfig(authConfig);
    client.spark.updateAuthenticationConfig(authConfig);
    
    return client;
  }

  /**
   * Factory method to create a new FabricPlatformAPIClient instance with custom token authentication
   * @param token Pre-acquired access token
   * @returns FabricPlatformAPIClient configured for custom token authentication
   */
  static createWithCustomToken(token: string): FabricPlatformAPIClient {
    // Create a mock WorkloadClientAPI since the controllers expect it
    const mockWorkloadClient = {} as WorkloadClientAPI;
    const client = new FabricPlatformAPIClient(mockWorkloadClient);
    
    // Configure all controllers with custom token authentication
    const authConfig = FabricPlatformClient.createCustomTokenAuth(token);
    
    // Update authentication config for all controllers
    client.workspaces.updateAuthenticationConfig(authConfig);
    client.items.updateAuthenticationConfig(authConfig);
    client.folders.updateAuthenticationConfig(authConfig);
    client.capacities.updateAuthenticationConfig(authConfig);
    client.scheduler.updateAuthenticationConfig(authConfig);
    client.shortcuts.updateAuthenticationConfig(authConfig);
    client.operations.updateAuthenticationConfig(authConfig);
    client.sparkLivy.updateAuthenticationConfig(authConfig);
    client.spark.updateAuthenticationConfig(authConfig);
    
    return client;
  }
}

/**
 * Usage Examples:
 * 
 * ```typescript
 * import { FabricPlatformAPIClient } from './controller';
 * import { WorkloadClientAPI } from '@ms-fabric/workload-client';
 * 
 * // Method 1: User Token Authentication (default)
 * // Initialize the workload client (this is typically done by the Fabric platform)
 * const workloadClient = new WorkloadClientAPI();
 * const fabricAPI = FabricPlatformAPIClient.create(workloadClient);
 * 
 * // Method 2: Service Principal Authentication
 * const fabricAPIWithServicePrincipal = FabricPlatformAPIClient.createWithServicePrincipal(
 *   'your-client-id',
 *   'your-client-secret',
 *   'your-tenant-id'
 * );
 * 
 * // Method 3: Custom Token Authentication
 * const fabricAPIWithCustomToken = FabricPlatformAPIClient.createWithCustomToken('your-access-token');
 * 
 * // Use individual controllers (works the same regardless of authentication method)
 * const workspaces = await fabricAPI.workspaces.getAllWorkspaces();
 * const items = await fabricAPI.items.getAllItems(workspaceId);
 * const capacity = await fabricAPI.capacities.getCapacity(capacityId);
 * 
 * // Spark operations
 * const sparkSettings = await fabricAPI.spark.getWorkspaceSparkSettings(workspaceId);
 * const customPools = await fabricAPI.spark.getAllCustomPools(workspaceId);
 * const livySessions = await fabricAPI.spark.getAllLivySessions(workspaceId);
 * 
 * // Spark Livy operations (lower-level API)
 * const batchResponse = await fabricAPI.sparkLivy.createBatch(workspaceId, lakehouseId, batchRequest);
 * const sessions = await fabricAPI.sparkLivy.listSessions(workspaceId, lakehouseId);
 * 
 * // Or use controllers directly for more specific use cases
 * import { WorkspaceController, SparkController, SparkLivyController, FabricPlatformClient } from './controller';
 * 
 * // User token authentication (legacy)
 * const workspaceController = new WorkspaceController(workloadClient);
 * 
 * // Service principal authentication
 * const authConfig = FabricPlatformClient.createServicePrincipalAuth(
 *   'client-id', 'client-secret', 'tenant-id'
 * );
 * const sparkController = new SparkController(authConfig);
 * const sparkLivyController = new SparkLivyController(authConfig);
 * 
 * const workspace = await workspaceController.getWorkspace(workspaceId);
 * const sparkSettings = await sparkController.getWorkspaceSparkSettings(workspaceId);
 * const batch = await sparkLivyController.getBatch(workspaceId, lakehouseId, batchId);
 * ```
 */
