/**
 * Microsoft Fabric Platform API Scopes
 * Centralized definitions for OAuth scopes used by different clients
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

  // Connection operations
  CONNECTION_READ: "https://api.fabric.microsoft.com/Connection.Read.All",
  CONNECTION_READWRITE: "https://api.fabric.microsoft.com/Connection.ReadWrite.All",

};

// Predefined scope combinations for different clients
export const SCOPES = {
  // Default comprehensive scopes for backward compatibility
  DEFAULT: [
    FABRIC_BASE_SCOPES.ITEM_READWRITE,
    FABRIC_BASE_SCOPES.WORKSPACE_READWRITE,
    FABRIC_BASE_SCOPES.CAPACITY_READWRITE,
    FABRIC_BASE_SCOPES.ONELAKE_READWRITE,
    FABRIC_BASE_SCOPES.CONNECTION_READWRITE
  ].join(" "),
  
  // Item Client - focused on item management
  ITEM: [
    FABRIC_BASE_SCOPES.ITEM_READWRITE,
    FABRIC_BASE_SCOPES.WORKSPACE_READ
  ].join(" "),
  
  // Item Client - read-only operations
  ITEM_READ: [
    FABRIC_BASE_SCOPES.ITEM_READ,
    FABRIC_BASE_SCOPES.WORKSPACE_READ
  ].join(" "),
  
  // Workspace Client - focused on workspace management
  WORKSPACE: [
    FABRIC_BASE_SCOPES.WORKSPACE_READWRITE,
    FABRIC_BASE_SCOPES.CAPACITY_READ
  ].join(" "),
  
  // Workspace Client - read-only operations
  WORKSPACE_READ: [
    FABRIC_BASE_SCOPES.WORKSPACE_READ,
    FABRIC_BASE_SCOPES.CAPACITY_READ
  ].join(" "),
  
  // Folder Client - focused on folder management within workspaces
  FOLDER: [
    FABRIC_BASE_SCOPES.WORKSPACE_READWRITE,
    FABRIC_BASE_SCOPES.ITEM_READ
  ].join(" "),
  
  // Folder Client - read-only operations
  FOLDER_READ: [
    FABRIC_BASE_SCOPES.WORKSPACE_READ,
    FABRIC_BASE_SCOPES.ITEM_READ
  ].join(" "),
  
  // Capacity Client - focused on capacity management
  CAPACITY: [
    FABRIC_BASE_SCOPES.CAPACITY_READWRITE,
    FABRIC_BASE_SCOPES.WORKSPACE_READ
  ].join(" "),
  
  // Capacity Client - read-only operations
  CAPACITY_READ: [
    FABRIC_BASE_SCOPES.CAPACITY_READ,
    FABRIC_BASE_SCOPES.WORKSPACE_READ
  ].join(" "),
  
  // OneLake Shortcut Client - focused on OneLake operations
  ONELAKE: [
    FABRIC_BASE_SCOPES.ONELAKE_READWRITE,
    FABRIC_BASE_SCOPES.ITEM_READ
  ].join(" "),
  
  // OneLake Shortcut Client - read-only operations
  ONELAKE_READ: [
    FABRIC_BASE_SCOPES.ONELAKE_READ,
    FABRIC_BASE_SCOPES.ITEM_READ
  ].join(" "),
  
  // Job Scheduler Client - focused on job execution
  JOB_SCHEDULER: [
    FABRIC_BASE_SCOPES.ITEM_EXECUTE,
    FABRIC_BASE_SCOPES.ITEM_READ
  ].join(" "),
  
  // Job Scheduler Client - read-only operations
  JOB_SCHEDULER_READ: [
    FABRIC_BASE_SCOPES.ITEM_READ,
    FABRIC_BASE_SCOPES.WORKSPACE_READ
  ].join(" "),
  
  // Long Running Operations Client - focused on operation monitoring
  OPERATIONS: [
    FABRIC_BASE_SCOPES.ITEM_READ,
    FABRIC_BASE_SCOPES.WORKSPACE_READ
  ].join(" "),
  
  // Connection Client - focused on connection management
  CONNECTION: [
    FABRIC_BASE_SCOPES.CONNECTION_READ,
    FABRIC_BASE_SCOPES.CONNECTION_READWRITE
  ].join(" "),
  
  // Connection Client - read-only operations
  CONNECTION_READ: [
    FABRIC_BASE_SCOPES.CONNECTION_READ
  ].join(" "),
  
  // Spark Livy Client - focused on Spark batch jobs and interactive sessions
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
  
  // Spark Livy Client - read-only operations
  SPARK_LIVY_READ: [
    FABRIC_BASE_SCOPES.ITEM_READ,
    FABRIC_BASE_SCOPES.WORKSPACE_READ,
    FABRIC_BASE_SCOPES.LAKEHOUSE_READ
  ].join(" "),
  
  // Read-only scopes for monitoring/reporting
  READ_ONLY: [
    FABRIC_BASE_SCOPES.ITEM_READ,
    FABRIC_BASE_SCOPES.WORKSPACE_READ,
    FABRIC_BASE_SCOPES.CAPACITY_READ,
    FABRIC_BASE_SCOPES.ONELAKE_READ,
    FABRIC_BASE_SCOPES.CONNECTION_READ
  ].join(" "),
};

/**
 * Interface for defining separate read and write scopes for a client
 */
export interface ScopePair {
  read: string;
  write: string;
}

/**
 * Scope pairs for clients that support method-based scope selection
 * GET operations will use 'read' scopes, POST/DELETE/etc will use 'write' scopes
 */
export const SCOPE_PAIRS: Record<string, ScopePair> = {
  ITEM: {
    read: SCOPES.ITEM_READ,
    write: SCOPES.ITEM
  },
  WORKSPACE: {
    read: SCOPES.WORKSPACE_READ, 
    write: SCOPES.WORKSPACE
  },
  FOLDER: {
    read: SCOPES.FOLDER_READ,
    write: SCOPES.FOLDER
  },
  CAPACITY: {
    read: SCOPES.CAPACITY_READ,
    write: SCOPES.CAPACITY
  },
  ONELAKE: {
    read: SCOPES.ONELAKE_READ,
    write: SCOPES.ONELAKE
  },
  JOB_SCHEDULER: {
    read: SCOPES.JOB_SCHEDULER_READ,
    write: SCOPES.JOB_SCHEDULER
  },
  CONNECTION: {
    read: SCOPES.CONNECTION_READ,
    write: SCOPES.CONNECTION
  },
  SPARK_LIVY: {
    read: SCOPES.SPARK_LIVY_READ,
    write: SCOPES.SPARK_LIVY
  }
};

/**
 * Helper function to get the appropriate scope based on HTTP method
 * @param scopePair The scope pair containing read and write scopes
 * @param method The HTTP method
 * @returns The appropriate scope string
 */
export function getScopeForMethod(scopePair: ScopePair, method: string): string {
  const upperMethod = method.toUpperCase();
  
  // GET and HEAD operations use read scopes
  if (upperMethod === 'GET' || upperMethod === 'HEAD') {
    return scopePair.read;
  }
  
  // All other operations (POST, PUT, PATCH, DELETE) use write scopes
  return scopePair.write;
}

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
