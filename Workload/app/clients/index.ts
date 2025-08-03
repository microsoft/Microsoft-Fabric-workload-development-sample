// Main API Client Infrastructure
export { FabricPlatformClient } from './FabricPlatformClient';
export { FabricPlatformAPIClient } from './FabricPlatformAPIClient';
export { FabricAuthenticationService } from './FabricAuthenticationService';
export * from './FabricPlatformTypes';

// API Controllers
export { WorkspaceClient as WorkspaceController } from './WorkspaceClient';
export { ItemClient as ItemController } from './ItemClient';
export { FolderClient } from './FolderClient';
export { CapacityClient } from './CapacityClient';
export { JobSchedulerClient } from './JobSchedulerClient';
export { OneLakeShortcutClient } from './OneLakeShortcutClient';
export { LongRunningOperationsClient } from './LongRunningOperationsClient';
export { SparkLivyClient } from './SparkLivyClient';

// Re-export WorkloadClientAPI for convenience
export { WorkloadClientAPI } from '@ms-fabric/workload-client';
