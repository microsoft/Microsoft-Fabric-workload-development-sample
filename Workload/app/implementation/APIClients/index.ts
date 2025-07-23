// Main API Client Infrastructure
export { FabricPlatformClient } from './FabricPlatformClient';
export { FabricPlatformAPIClient } from './FabricPlatformAPIClient';
export { FabricAuthenticationService } from './FabricAuthenticationService';
export * from './FabricPlatformTypes';

// API Controllers
export { WorkspaceClient as WorkspaceController } from './WorkspaceClient';
export { ItemClient as ItemController } from './ItemClient';
export { FolderController } from './FolderClient';
export { CapacityController } from './CapacityController';
export { JobSchedulerClient as JobSchedulerController } from './JobSchedulerClient';
export { OneLakeShortcutClient as OneLakeShortcutController } from './OneLakeShortcutClient';
export { LongRunningOperationsClient as LongRunningOperationsController } from './LongRunningOperationsClient';
export { SparkLivyClient as SparkLivyController } from './SparkLivyClient';

// Re-export WorkloadClientAPI for convenience
export { WorkloadClientAPI } from '@ms-fabric/workload-client';
