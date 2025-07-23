/**
 * Microsoft Fabric Platform API Scopes
<<<<<<< HEAD:Workload/app/samples/controller/FabricPlatformScopes.ts
 * Centralized definitions for OAuth scopes used by different controllers
=======
 * Centralized definitions for OAuth scopes used by different clients
>>>>>>> origin/dev/preview/wdkv2:Workload/app/implementation/clients/FabricPlatformScopes.ts
 */

// Base Fabric API scopes
export const FABRIC_BASE_SCOPES = {
  // Item operations
  ITEM_READ: "https://api.fabric.microsoft.com/Item.Read.All",
  ITEM_READWRITE: "https://api.fabric.microsoft.com/Item.ReadWrite.All",
  ITEM_EXECUTE: "https://api.fabric.microsoft.com/Item.Execute.All",
  
  // Workspace operations
  WORKSPACE_READ: "https://api.fabric.microsoft.com/Workspace.Read.All",
  WORKSPACE_READWRITE: "https://api.fabric.microsoft.com/Workspace.ReadWrite.All",
  
  // Capacity operations
  CAPACITY_READ: "https://api.fabric.microsoft.com/Capacity.Read.All",
  CAPACITY_READWRITE: "https://api.fabric.microsoft.com/Capacity.ReadWrite.All",
  
  // OneLake operations
  ONELAKE_READ: "https://api.fabric.microsoft.com/OneLake.Read.All",
  ONELAKE_READWRITE: "https://api.fabric.microsoft.com/OneLake.ReadWrite.All",
  ONELAKE_STORAGE: "https://storage.azure.com/user_impersonation",

  
  // Lakehouse operations
  LAKEHOUSE_EXECUTE: "https://api.fabric.microsoft.com/Lakehouse.Execute.All",
  LAKEHOUSE_READ: "https://api.fabric.microsoft.com/Lakehouse.Read.All",
  
  // Code operations for Spark and compute scenarios
  CODE_ACCESS_STORAGE: "https://api.fabric.microsoft.com/Code.AccessStorage.All",
  CODE_ACCESS_KEYVAULT: "https://api.fabric.microsoft.com/Code.AccessAzureKeyvault.All",
  CODE_ACCESS_DATA_EXPLORER: "https://api.fabric.microsoft.com/Code.AccessAzureDataExplorer.All",
  CODE_ACCESS_DATA_LAKE: "https://api.fabric.microsoft.com/Code.AccessAzureDataLake.All",
  CODE_ACCESS_FABRIC: "https://api.fabric.microsoft.com/Code.AccessFabric.All",

};

<<<<<<< HEAD:Workload/app/samples/controller/FabricPlatformScopes.ts
// Predefined scope combinations for different controllers
export const CONTROLLER_SCOPES = {
=======
// Predefined scope combinations for different clients
export const SCOPES = {
>>>>>>> origin/dev/preview/wdkv2:Workload/app/implementation/clients/FabricPlatformScopes.ts
  // Default comprehensive scopes for backward compatibility
  DEFAULT: [
    FABRIC_BASE_SCOPES.ITEM_READWRITE,
    FABRIC_BASE_SCOPES.WORKSPACE_READWRITE,
    FABRIC_BASE_SCOPES.CAPACITY_READWRITE,
    FABRIC_BASE_SCOPES.ONELAKE_READWRITE
  ].join(" "),
  
<<<<<<< HEAD:Workload/app/samples/controller/FabricPlatformScopes.ts
  // Item Controller - focused on item management
=======
  // Item Client - focused on item management
>>>>>>> origin/dev/preview/wdkv2:Workload/app/implementation/clients/FabricPlatformScopes.ts
  ITEM: [
    FABRIC_BASE_SCOPES.ITEM_READWRITE,
    FABRIC_BASE_SCOPES.WORKSPACE_READ
  ].join(" "),
  
<<<<<<< HEAD:Workload/app/samples/controller/FabricPlatformScopes.ts
  // Workspace Controller - focused on workspace management
=======
  // Workspace Client - focused on workspace management
>>>>>>> origin/dev/preview/wdkv2:Workload/app/implementation/clients/FabricPlatformScopes.ts
  WORKSPACE: [
    FABRIC_BASE_SCOPES.WORKSPACE_READWRITE,
    FABRIC_BASE_SCOPES.CAPACITY_READ
  ].join(" "),
  
<<<<<<< HEAD:Workload/app/samples/controller/FabricPlatformScopes.ts
  // Folder Controller - focused on folder management within workspaces
=======
  // Folder Client - focused on folder management within workspaces
>>>>>>> origin/dev/preview/wdkv2:Workload/app/implementation/clients/FabricPlatformScopes.ts
  FOLDER: [
    FABRIC_BASE_SCOPES.WORKSPACE_READWRITE,
    FABRIC_BASE_SCOPES.ITEM_READ
  ].join(" "),
  
<<<<<<< HEAD:Workload/app/samples/controller/FabricPlatformScopes.ts
  // Capacity Controller - focused on capacity management
=======
  // Capacity Client - focused on capacity management
>>>>>>> origin/dev/preview/wdkv2:Workload/app/implementation/clients/FabricPlatformScopes.ts
  CAPACITY: [
    FABRIC_BASE_SCOPES.CAPACITY_READWRITE,
    FABRIC_BASE_SCOPES.WORKSPACE_READ
  ].join(" "),
  
<<<<<<< HEAD:Workload/app/samples/controller/FabricPlatformScopes.ts
  // OneLake Shortcut Controller - focused on OneLake operations
=======
  // OneLake Shortcut Client - focused on OneLake operations
>>>>>>> origin/dev/preview/wdkv2:Workload/app/implementation/clients/FabricPlatformScopes.ts
  ONELAKE: [
    FABRIC_BASE_SCOPES.ONELAKE_READWRITE,
    FABRIC_BASE_SCOPES.ITEM_READ
  ].join(" "),
  
<<<<<<< HEAD:Workload/app/samples/controller/FabricPlatformScopes.ts
  // Job Scheduler Controller - focused on job execution
=======
  // Job Scheduler Client - focused on job execution
>>>>>>> origin/dev/preview/wdkv2:Workload/app/implementation/clients/FabricPlatformScopes.ts
  JOB_SCHEDULER: [
    FABRIC_BASE_SCOPES.ITEM_EXECUTE,
    FABRIC_BASE_SCOPES.ITEM_READ
  ].join(" "),
  
<<<<<<< HEAD:Workload/app/samples/controller/FabricPlatformScopes.ts
  // Long Running Operations Controller - focused on operation monitoring
=======
  // Long Running Operations Client - focused on operation monitoring
>>>>>>> origin/dev/preview/wdkv2:Workload/app/implementation/clients/FabricPlatformScopes.ts
  OPERATIONS: [
    FABRIC_BASE_SCOPES.ITEM_READ,
    FABRIC_BASE_SCOPES.WORKSPACE_READ
  ].join(" "),
  
<<<<<<< HEAD:Workload/app/samples/controller/FabricPlatformScopes.ts
  // Spark Livy Controller - focused on Spark batch jobs and interactive sessions
=======
  // Spark Livy Client - focused on Spark batch jobs and interactive sessions
>>>>>>> origin/dev/preview/wdkv2:Workload/app/implementation/clients/FabricPlatformScopes.ts
  SPARK_LIVY: [
    FABRIC_BASE_SCOPES.ITEM_EXECUTE,
    FABRIC_BASE_SCOPES.ITEM_READWRITE,
    FABRIC_BASE_SCOPES.WORKSPACE_READWRITE,
    FABRIC_BASE_SCOPES.LAKEHOUSE_EXECUTE,
    FABRIC_BASE_SCOPES.LAKEHOUSE_READ,
    FABRIC_BASE_SCOPES.CODE_ACCESS_STORAGE,
    FABRIC_BASE_SCOPES.CODE_ACCESS_KEYVAULT,
    FABRIC_BASE_SCOPES.CODE_ACCESS_DATA_EXPLORER,
    FABRIC_BASE_SCOPES.CODE_ACCESS_DATA_LAKE,
    FABRIC_BASE_SCOPES.CODE_ACCESS_FABRIC
  ].join(" "),
  
  // Read-only scopes for monitoring/reporting
  READ_ONLY: [
    FABRIC_BASE_SCOPES.ITEM_READ,
    FABRIC_BASE_SCOPES.WORKSPACE_READ,
    FABRIC_BASE_SCOPES.CAPACITY_READ,
    FABRIC_BASE_SCOPES.ONELAKE_READ
  ].join(" "),
};

/**
 * Helper function to combine multiple scope sets
 * @param scopeSets Array of scope strings to combine
 * @returns Combined unique scopes as a space-separated string
 */
export function combineScopes(...scopeSets: string[]): string {
  const allScopes = scopeSets.flatMap(scopeSet => scopeSet.split(' '));
  const uniqueScopes = [...new Set(allScopes)];
  return uniqueScopes.join(' ');
}

/**
 * Helper function to create custom scope combinations
 * @param baseScopes Array of base scope strings
 * @returns Combined scopes as a space-separated string
 */
export function createCustomScopes(baseScopes: string[]): string {
  return [...new Set(baseScopes)].join(' ');
}
