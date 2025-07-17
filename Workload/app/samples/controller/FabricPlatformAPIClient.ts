import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { WorkspaceController } from "./WorkspaceController";
import { ItemController } from "./ItemController";
import { FolderController } from "./FolderController";
import { CapacityController } from "./CapacityController";
import { JobSchedulerController } from "./JobSchedulerController";
import { OneLakeShortcutController } from "./OneLakeShortcutController";
import { LongRunningOperationsController } from "./LongRunningOperationsController";

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

  constructor(workloadClient: WorkloadClientAPI) {
    this.workspaces = new WorkspaceController(workloadClient);
    this.items = new ItemController(workloadClient);
    this.folders = new FolderController(workloadClient);
    this.capacities = new CapacityController(workloadClient);
    this.scheduler = new JobSchedulerController(workloadClient);
    this.shortcuts = new OneLakeShortcutController(workloadClient);
    this.operations = new LongRunningOperationsController(workloadClient);
  }

  /**
   * Factory method to create a new FabricPlatformAPIClient instance
   * @param workloadClient The WorkloadClientAPI instance
   * @returns FabricPlatformAPIClient
   */
  static create(workloadClient: WorkloadClientAPI): FabricPlatformAPIClient {
    return new FabricPlatformAPIClient(workloadClient);
  }
}

/**
 * Usage Example:
 * 
 * ```typescript
 * import { FabricPlatformAPIClient } from './controller';
 * import { WorkloadClientAPI } from '@ms-fabric/workload-client';
 * 
 * // Initialize the workload client (this is typically done by the Fabric platform)
 * const workloadClient = new WorkloadClientAPI();
 * 
 * // Create the comprehensive API client
 * const fabricAPI = FabricPlatformAPIClient.create(workloadClient);
 * 
 * // Use individual controllers
 * const workspaces = await fabricAPI.workspaces.getAllWorkspaces();
 * const items = await fabricAPI.items.getAllItems(workspaceId);
 * const capacity = await fabricAPI.capacities.getCapacity(capacityId);
 * 
 * // Or use controllers directly for more specific use cases
 * import { WorkspaceController } from './controller';
 * const workspaceController = new WorkspaceController(workloadClient);
 * const workspace = await workspaceController.getWorkspace(workspaceId);
 * ```
 */
