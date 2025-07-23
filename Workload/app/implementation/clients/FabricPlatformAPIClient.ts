import { WorkloadClientAPI } from "@ms-fabric/workload-client";
<<<<<<< HEAD:Workload/app/samples/controller/FabricPlatformAPIClient.ts
import { WorkspaceController } from "./WorkspaceController";
import { ItemController } from "./ItemController";
import { FolderController } from "./FolderController";
import { CapacityController } from "./CapacityController";
import { JobSchedulerController } from "./JobSchedulerController";
import { OneLakeShortcutController } from "./OneLakeShortcutController";
import { LongRunningOperationsController } from "./LongRunningOperationsController";
import { SparkLivyController } from "./SparkLivyController";
import { SparkController } from "./SparkController";
=======
import { WorkspaceClient } from "./WorkspaceClient";
import { ItemClient } from "./ItemClient";
import { FolderClient } from "./FolderClient";
import { CapacityClient } from "./CapacityClient";
import { JobSchedulerClient } from "./JobSchedulerClient";
import { OneLakeShortcutClient } from "./OneLakeShortcutClient";
import { LongRunningOperationsClient } from "./LongRunningOperationsClient";
import { SparkLivyClient } from "./SparkLivyClient";
import { SparkClient } from "./SparkClient";
>>>>>>> origin/dev/preview/wdkv2:Workload/app/implementation/clients/FabricPlatformAPIClient.ts
import { FabricPlatformClient } from "./FabricPlatformClient";

/**
 * Comprehensive Fabric Platform API Client
<<<<<<< HEAD:Workload/app/samples/controller/FabricPlatformAPIClient.ts
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
=======
 * Provides unified access to all Fabric platform APIs through individual clients
 */
export class FabricPlatformAPIClient {
  public readonly workspaces: WorkspaceClient;
  public readonly items: ItemClient;
  public readonly folders: FolderClient;
  public readonly capacities: CapacityClient;
  public readonly scheduler: JobSchedulerClient;
  public readonly shortcuts: OneLakeShortcutClient;
  public readonly operations: LongRunningOperationsClient;
  public readonly sparkLivy: SparkLivyClient;
  public readonly spark: SparkClient;

  constructor(workloadClient: WorkloadClientAPI) {
    this.workspaces = new WorkspaceClient(workloadClient);
    this.items = new ItemClient(workloadClient);
    this.folders = new FolderClient(workloadClient);
    this.capacities = new CapacityClient(workloadClient);
    this.scheduler = new JobSchedulerClient(workloadClient);
    this.shortcuts = new OneLakeShortcutClient(workloadClient);
    this.operations = new LongRunningOperationsClient(workloadClient);
    this.spark = new SparkClient(workloadClient);    
    this.sparkLivy = new SparkLivyClient(workloadClient);
>>>>>>> origin/dev/preview/wdkv2:Workload/app/implementation/clients/FabricPlatformAPIClient.ts

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
<<<<<<< HEAD:Workload/app/samples/controller/FabricPlatformAPIClient.ts
    // Create a mock WorkloadClientAPI since the controllers expect it
    const mockWorkloadClient = {} as WorkloadClientAPI;
    const client = new FabricPlatformAPIClient(mockWorkloadClient);
    
    // Configure all controllers with service principal authentication
    const authConfig = FabricPlatformClient.createServicePrincipalAuth(clientId, clientSecret, tenantId, authority);
    
    // Update authentication config for all controllers
=======
    // Create a mock WorkloadClientAPI since the clients expect it
    const mockWorkloadClient = {} as WorkloadClientAPI;
    const client = new FabricPlatformAPIClient(mockWorkloadClient);

    // Configure all clients with service principal authentication
    const authConfig = FabricPlatformClient.createServicePrincipalAuth(clientId, clientSecret, tenantId, authority);
    
    // Update authentication config for all Clients
>>>>>>> origin/dev/preview/wdkv2:Workload/app/implementation/clients/FabricPlatformAPIClient.ts
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
<<<<<<< HEAD:Workload/app/samples/controller/FabricPlatformAPIClient.ts
    // Create a mock WorkloadClientAPI since the controllers expect it
    const mockWorkloadClient = {} as WorkloadClientAPI;
    const client = new FabricPlatformAPIClient(mockWorkloadClient);
    
    // Configure all controllers with custom token authentication
    const authConfig = FabricPlatformClient.createCustomTokenAuth(token);
    
    // Update authentication config for all controllers
=======
    // Create a mock WorkloadClientAPI since the clients expect it
    const mockWorkloadClient = {} as WorkloadClientAPI;
    const client = new FabricPlatformAPIClient(mockWorkloadClient);

    // Configure all clients with custom token authentication
    const authConfig = FabricPlatformClient.createCustomTokenAuth(token);

    // Update authentication config for all clients
>>>>>>> origin/dev/preview/wdkv2:Workload/app/implementation/clients/FabricPlatformAPIClient.ts
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
<<<<<<< HEAD:Workload/app/samples/controller/FabricPlatformAPIClient.ts
 * import { FabricPlatformAPIClient } from './controller';
=======
 * import { FabricPlatformAPIClient } from './APIC';
>>>>>>> origin/dev/preview/wdkv2:Workload/app/implementation/clients/FabricPlatformAPIClient.ts
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
<<<<<<< HEAD:Workload/app/samples/controller/FabricPlatformAPIClient.ts
 * // Use individual controllers (works the same regardless of authentication method)
=======
 * // Use individual clients (works the same regardless of authentication method)
>>>>>>> origin/dev/preview/wdkv2:Workload/app/implementation/clients/FabricPlatformAPIClient.ts
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
<<<<<<< HEAD:Workload/app/samples/controller/FabricPlatformAPIClient.ts
 * // Or use controllers directly for more specific use cases
 * import { WorkspaceController, SparkController, SparkLivyController, FabricPlatformClient } from './controller';
 * 
 * // User token authentication (legacy)
 * const workspaceController = new WorkspaceController(workloadClient);
=======
 * // Or use clients directly for more specific use cases
 * import { WorkspaceClient, SparkClient, SparkLivyClient, FabricPlatformClient } from './client';
 * 
 * // User token authentication (legacy)
 * const workspaceClient = new WorkspaceClient(workloadClient);
>>>>>>> origin/dev/preview/wdkv2:Workload/app/implementation/clients/FabricPlatformAPIClient.ts
 * 
 * // Service principal authentication
 * const authConfig = FabricPlatformClient.createServicePrincipalAuth(
 *   'client-id', 'client-secret', 'tenant-id'
 * );
<<<<<<< HEAD:Workload/app/samples/controller/FabricPlatformAPIClient.ts
 * const sparkController = new SparkController(authConfig);
 * const sparkLivyController = new SparkLivyController(authConfig);
 * 
 * const workspace = await workspaceController.getWorkspace(workspaceId);
 * const sparkSettings = await sparkController.getWorkspaceSparkSettings(workspaceId);
 * const batch = await sparkLivyController.getBatch(workspaceId, lakehouseId, batchId);
=======
 * const sparkClient = new SparkClient(authConfig);
 * const sparkLivyClient = new SparkLivyClient(authConfig);
 * 
 * const workspace = await workspaceClient.getWorkspace(workspaceId);
 * const sparkSettings = await sparkClient.getWorkspaceSparkSettings(workspaceId);
 * const batch = await sparkLivyClient.getBatch(workspaceId, lakehouseId, batchId);
>>>>>>> origin/dev/preview/wdkv2:Workload/app/implementation/clients/FabricPlatformAPIClient.ts
 * ```
 */
