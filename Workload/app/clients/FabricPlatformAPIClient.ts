import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { WorkspaceClient } from "./WorkspaceClient";
import { ItemClient } from "./ItemClient";
import { FolderClient } from "./FolderClient";
import { CapacityClient } from "./CapacityClient";
import { ConnectionClient } from "./ConnectionClient";
import { JobSchedulerClient } from "./JobSchedulerClient";
import { OneLakeShortcutClient } from "./OneLakeShortcutClient";
import { LongRunningOperationsClient } from "./LongRunningOperationsClient";
import { SparkLivyClient } from "./SparkLivyClient";
import { SparkClient } from "./SparkClient";
import { FabricPlatformClient } from "./FabricPlatformClient";
import { OneLakeClient } from "./OneLakeClient";
import { ExternalDataSharesProviderClient } from "./ExternalDataSharesProviderClient";
import { ExternalDataSharesRecipientClient } from "./ExternalDataSharesRecipientClient";
import { TagsClient } from "./TagsClient";
import { OneLakeDataAccessSecurityClient } from "./OneLakeDataAccessSecurityClient";

/**
 * Comprehensive Fabric Platform API Client
 * Provides unified access to all Fabric platform APIs through individual clients
 */
export class FabricPlatformAPIClient {
  public readonly workspaces: WorkspaceClient;
  public readonly items: ItemClient;
  public readonly folders: FolderClient;
  public readonly capacities: CapacityClient;
  public readonly connections: ConnectionClient;
  public readonly scheduler: JobSchedulerClient;
  public readonly shortcuts: OneLakeShortcutClient;
  public readonly operations: LongRunningOperationsClient;
  public readonly sparkLivy: SparkLivyClient;
  public readonly spark: SparkClient;
  public readonly oneLake: OneLakeClient;
  public readonly externalDataShares: ExternalDataSharesProviderClient;
  public readonly externalDataSharesRecipient: ExternalDataSharesRecipientClient;
  public readonly tags: TagsClient;
  public readonly oneLakeDataAccessSecurity: OneLakeDataAccessSecurityClient;

  constructor(workloadClient: WorkloadClientAPI) {
    this.workspaces = new WorkspaceClient(workloadClient);
    this.items = new ItemClient(workloadClient);
    this.folders = new FolderClient(workloadClient);
    this.capacities = new CapacityClient(workloadClient);
    this.connections = new ConnectionClient(workloadClient);
    this.scheduler = new JobSchedulerClient(workloadClient);
    this.shortcuts = new OneLakeShortcutClient(workloadClient);
    this.operations = new LongRunningOperationsClient(workloadClient);
    this.spark = new SparkClient(workloadClient);    
    this.sparkLivy = new SparkLivyClient(workloadClient);
    this.oneLake = new OneLakeClient(workloadClient);
    this.externalDataShares = new ExternalDataSharesProviderClient(workloadClient);
    this.externalDataSharesRecipient = new ExternalDataSharesRecipientClient(workloadClient);
    this.tags = new TagsClient(workloadClient);
    this.oneLakeDataAccessSecurity = new OneLakeDataAccessSecurityClient(workloadClient);
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
    // Create a mock WorkloadClientAPI since the clients expect it
    const mockWorkloadClient = {} as WorkloadClientAPI;
    const client = new FabricPlatformAPIClient(mockWorkloadClient);

    // Configure all clients with service principal authentication
    const authConfig = FabricPlatformClient.createServicePrincipalAuth(clientId, clientSecret, tenantId, authority);
    
    // Update authentication config for all Clients
    client.workspaces.updateAuthenticationConfig(authConfig);
    client.items.updateAuthenticationConfig(authConfig);
    client.folders.updateAuthenticationConfig(authConfig);
    client.capacities.updateAuthenticationConfig(authConfig);
    client.connections.updateAuthenticationConfig(authConfig);
    client.scheduler.updateAuthenticationConfig(authConfig);
    client.shortcuts.updateAuthenticationConfig(authConfig);
    client.operations.updateAuthenticationConfig(authConfig);
    client.sparkLivy.updateAuthenticationConfig(authConfig);
    client.spark.updateAuthenticationConfig(authConfig);
    client.oneLake.updateAuthenticationConfig(authConfig);
    client.externalDataShares.updateAuthenticationConfig(authConfig);
    client.externalDataSharesRecipient.updateAuthenticationConfig(authConfig);
    client.tags.updateAuthenticationConfig(authConfig);
    client.oneLakeDataAccessSecurity.updateAuthenticationConfig(authConfig);
    
    return client;
  }

  /**
   * Factory method to create a new FabricPlatformAPIClient instance with custom token authentication
   * @param token Pre-acquired access token
   * @returns FabricPlatformAPIClient configured for custom token authentication
   */
  static createWithCustomToken(token: string): FabricPlatformAPIClient {
    // Create a mock WorkloadClientAPI since the clients expect it
    const mockWorkloadClient = {} as WorkloadClientAPI;
    const client = new FabricPlatformAPIClient(mockWorkloadClient);

    // Configure all clients with custom token authentication
    const authConfig = FabricPlatformClient.createCustomTokenAuth(token);

    // Update authentication config for all clients
    client.workspaces.updateAuthenticationConfig(authConfig);
    client.items.updateAuthenticationConfig(authConfig);
    client.folders.updateAuthenticationConfig(authConfig);
    client.capacities.updateAuthenticationConfig(authConfig);
    client.connections.updateAuthenticationConfig(authConfig);
    client.scheduler.updateAuthenticationConfig(authConfig);
    client.shortcuts.updateAuthenticationConfig(authConfig);
    client.operations.updateAuthenticationConfig(authConfig);
    client.sparkLivy.updateAuthenticationConfig(authConfig);
    client.spark.updateAuthenticationConfig(authConfig);
    client.oneLake.updateAuthenticationConfig(authConfig);
    client.externalDataShares.updateAuthenticationConfig(authConfig);
    client.externalDataSharesRecipient.updateAuthenticationConfig(authConfig);
    client.tags.updateAuthenticationConfig(authConfig);
    client.oneLakeDataAccessSecurity.updateAuthenticationConfig(authConfig);
    
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
 * const workspaces = await fabricAPI.workspaces.getAllWorkspaces();
 * const items = await fabricAPI.items.getAllItems(workspaceId);
 * const capacity = await fabricAPI.capacities.getCapacity(capacityId);
 * 
 * // Connection operations
 * const connections = await fabricAPI.connections.getAllConnections();
 * const connection = await fabricAPI.connections.getConnection(connectionId);
 * const adlsConnections = await fabricAPI.connections.getConnectionsByType('AdlsGen2');
 * const newConnection = await fabricAPI.connections.createConnection({
 *   displayName: 'My ADLS Connection',
 *   connectionType: 'AdlsGen2',
 *   description: 'Connection to Azure Data Lake Storage Gen2'
 * });
 * 
 * // External Data Shares operations
 * const providers = await fabricAPI.externalDataShares.getAllProviders(workspaceId);
 * const shares = await fabricAPI.externalDataShares.getAllExternalDataShares(workspaceId, itemId);
 * await fabricAPI.externalDataSharesRecipient.acceptInvitation(invitationToken, {
 *   shortcutCreation: { name: 'MyShortcut', path: '/Files' }
 * });
 * 
 * // Tags operations
 * const allTags = await fabricAPI.tags.getAllTags();
 * await fabricAPI.tags.applyTagsByName(workspaceId, itemId, ['Important', 'Production']);
 * const productionTags = await fabricAPI.tags.findTagsByName('production');
 * 
 * // OneLake Data Access Security operations
 * const dataAccessRoles = await fabricAPI.oneLakeDataAccessSecurity.getAllDataAccessRoles(workspaceId, itemId);
 * const readRole = fabricAPI.oneLakeDataAccessSecurity.createReadRole('TableReaders', ['/Tables/SalesData'], members);
 * await fabricAPI.oneLakeDataAccessSecurity.createOrUpdateDataAccessRoles(workspaceId, itemId, [readRole]);
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
 * const workspaceClient = new WorkspaceClient(workloadClient);
 * import { WorkspaceClient, SparkClient, SparkLivyClient, FabricPlatformClient } from './client';
 * 
 * // User token authentication (legacy)
 * const workspaceClient = new WorkspaceClient(workloadClient);
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
 * const sparkController = new SparkController(authConfig);
 * const sparkLivyController = new SparkLivyController(authConfig);
 * 
 * const workspace = await workspaceController.getWorkspace(workspaceId);
 * const sparkSettings = await sparkController.getWorkspaceSparkSettings(workspaceId);
 * const batch = await sparkLivyController.getBatch(workspaceId, lakehouseId, batchId);
 * ```
 */
