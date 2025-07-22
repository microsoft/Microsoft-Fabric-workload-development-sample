// Main API Client Infrastructure
export { FabricPlatformClient } from './FabricPlatformClient';
export { FabricPlatformAPIClient } from './FabricPlatformAPIClient';
export { FabricAuthenticationService } from './FabricAuthenticationService';
export * from './FabricPlatformTypes';

// API Controllers
export { WorkspaceController } from './WorkspaceController';
export { ItemController } from './ItemController';
export { FolderController } from './FolderController';
export { CapacityController } from './CapacityController';
export { JobSchedulerController } from './JobSchedulerController';
export { OneLakeShortcutController } from './OneLakeShortcutController';
export { LongRunningOperationsController } from './LongRunningOperationsController';
export { SparkLivyController } from './SparkLivyController';
export { SparkController } from './SparkController';
export { AzureKeyVaultController } from './AzureKeyVaultController';

// Re-export WorkloadClientAPI for convenience
export { WorkloadClientAPI } from '@ms-fabric/workload-client';
