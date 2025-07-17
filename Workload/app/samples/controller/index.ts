// Main API Client Infrastructure
export { FabricPlatformClient } from './FabricPlatformClient';
export { FabricPlatformAPIClient } from './FabricPlatformAPIClient';
export * from './FabricPlatformTypes';

// API Controllers
export { WorkspaceController } from './WorkspaceController';
export { ItemController } from './ItemController';
export { FolderController } from './FolderController';
export { CapacityController } from './CapacityController';
export { JobSchedulerController } from './JobSchedulerController';
export { OneLakeShortcutController } from './OneLakeShortcutController';
export { LongRunningOperationsController } from './LongRunningOperationsController';
//TODO: add other controllers as well

// Re-export WorkloadClientAPI for convenience
export { WorkloadClientAPI } from '@ms-fabric/workload-client';
