import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { FabricPlatformClient } from "./FabricPlatformClient";
import { SCOPE_PAIRS } from "./FabricPlatformScopes";
import {
  Shortcut,
  CreateShortcutRequest,
  PaginatedResponse
} from "./FabricPlatformTypes";

/**
 * API wrapper for OneLake Shortcuts operations
 * Provides methods for managing shortcuts to external data sources
 * 
 * Uses method-based scope selection:
 * - GET operations use read-only scopes
 * - POST/PUT/PATCH/DELETE operations use read-write scopes
 */
export class OneLakeShortcutClient extends FabricPlatformClient {
  
  constructor(workloadClient: WorkloadClientAPI) {
    // Use scope pairs for method-based scope selection
    super(workloadClient, SCOPE_PAIRS.ONELAKE);
  }

  // ============================
  // Shortcut Management
  // ============================

  /**
   * Returns a list of shortcuts from the specified folder
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param folderPath The folder path
   * @param continuationToken Token for pagination
   * @returns Promise<PaginatedResponse<Shortcut>>
   */
  async listShortcuts(
    workspaceId: string,
    itemId: string,
    folderPath: string,
    continuationToken?: string
  ): Promise<PaginatedResponse<Shortcut>> {
    const encodedPath = encodeURIComponent(folderPath);
    let endpoint = `/workspaces/${workspaceId}/items/${itemId}/shortcuts?path=${encodedPath}`;
    if (continuationToken) {
      endpoint += `&continuationToken=${encodeURIComponent(continuationToken)}`;
    }
    return this.get<PaginatedResponse<Shortcut>>(endpoint);
  }

  /**
   * Gets all shortcuts from a folder (handles pagination automatically)
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param folderPath The folder path
   * @returns Promise<Shortcut[]>
   */
  async getAllShortcuts(
    workspaceId: string,
    itemId: string,
    folderPath: string
  ): Promise<Shortcut[]> {
    const encodedPath = encodeURIComponent(folderPath);
    return this.getAllPages<Shortcut>(
      `/workspaces/${workspaceId}/items/${itemId}/shortcuts?path=${encodedPath}`
    );
  }

  /**
   * Create a shortcut
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param request CreateShortcutRequest
   * @returns Promise<Shortcut>
   */
  async createShortcut(
    workspaceId: string,
    itemId: string,
    request: CreateShortcutRequest
  ): Promise<Shortcut> {
    return this.post<Shortcut>(
      `/workspaces/${workspaceId}/items/${itemId}/shortcuts`,
      request
    );
  }

  /**
   * Get a specific shortcut
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param shortcutPath The path to the shortcut
   * @returns Promise<Shortcut>
   */
  async getShortcut(
    workspaceId: string,
    itemId: string,
    shortcutPath: string
  ): Promise<Shortcut> {
    const encodedPath = encodeURIComponent(shortcutPath);
    return this.get<Shortcut>(
      `/workspaces/${workspaceId}/items/${itemId}/shortcuts/${encodedPath}`
    );
  }

  /**
   * Delete a shortcut
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param shortcutPath The path to the shortcut
   * @returns Promise<void>
   */
  async deleteShortcut(
    workspaceId: string,
    itemId: string,
    shortcutPath: string
  ): Promise<void> {
    const encodedPath = encodeURIComponent(shortcutPath);
    await this.delete<void>(
      `/workspaces/${workspaceId}/items/${itemId}/shortcuts/${encodedPath}`
    );
  }

  // ============================
  // Helper Methods
  // ============================

  /**
   * Creates an ADLS Gen2 shortcut
   * @param workspaceId The workspace ID
   * @param itemId The item ID (Lakehouse or KQL Database)
   * @param shortcutName The name for the shortcut
   * @param targetPath The target path in the lakehouse/KQL database
   * @param connectionId The connection ID for ADLS Gen2
   * @param location The container/location in ADLS Gen2
   * @param subpath The subpath within the location
   * @returns Promise<Shortcut>
   */
  async createAdlsGen2Shortcut(
    workspaceId: string,
    itemId: string,
    shortcutName: string,
    targetPath: string,
    connectionId: string,
    location: string,
    subpath: string = ''
  ): Promise<Shortcut> {
    const request: CreateShortcutRequest = {
      path: targetPath,
      name: shortcutName,
      target: {
        adlsGen2: {
          connectionId,
          location,
          subpath
        }
      }
    };

    return this.createShortcut(workspaceId, itemId, request);
  }

  /**
   * Creates an S3 shortcut
   * @param workspaceId The workspace ID
   * @param itemId The item ID (Lakehouse or KQL Database)
   * @param shortcutName The name for the shortcut
   * @param targetPath The target path in the lakehouse/KQL database
   * @param connectionId The connection ID for S3
   * @param location The bucket/location in S3
   * @param subpath The subpath within the location
   * @returns Promise<Shortcut>
   */
  async createS3Shortcut(
    workspaceId: string,
    itemId: string,
    shortcutName: string,
    targetPath: string,
    connectionId: string,
    location: string,
    subpath: string = ''
  ): Promise<Shortcut> {
    const request: CreateShortcutRequest = {
      path: targetPath,
      name: shortcutName,
      target: {
        amazonS3: {
          connectionId,
          location,
          subpath
        }
      }
    };

    return this.createShortcut(workspaceId, itemId, request);
  }

  /**
   * Creates a OneLake shortcut (referencing another OneLake location)
   * @param workspaceId The workspace ID
   * @param itemId The item ID (Lakehouse or KQL Database)
   * @param shortcutName The name for the shortcut
   * @param targetPath The target path in the lakehouse/KQL database
   * @param targetWorkspaceId The target workspace ID
   * @param targetItemId The target item ID
   * @param targetSubPath Optional sub-path within the target item
   * @returns Promise<Shortcut>
   */
  async createOneLakeShortcut(
    workspaceId: string,
    itemId: string,
    shortcutName: string,
    targetPath: string,
    targetWorkspaceId: string,
    targetItemId: string,
    targetSubPath?: string
  ): Promise<Shortcut> {
    const request: CreateShortcutRequest = {
      path: targetPath,
      name: shortcutName,
      target: {
        oneLake: {
          workspaceId: targetWorkspaceId,
          itemId: targetItemId,
          path: targetSubPath || ''
        }
      }
    };

    return this.createShortcut(workspaceId, itemId, request);
  }

  /**
   * Gets shortcuts by type
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param folderPath The folder path
   * @param type The shortcut type ('OneLake', 'AdlsGen2', 'S3')
   * @returns Promise<Shortcut[]>
   */
  async getShortcutsByType(
    workspaceId: string,
    itemId: string,
    folderPath: string,
    type: 'OneLake' | 'AdlsGen2' | 'S3'
  ): Promise<Shortcut[]> {
    const allShortcuts = await this.getAllShortcuts(workspaceId, itemId, folderPath);
    
    return allShortcuts.filter(shortcut => {
      if (type === 'OneLake' && shortcut.target.oneLake) return true;
      if (type === 'AdlsGen2' && shortcut.target.adlsGen2) return true;
      if (type === 'S3' && shortcut.target.amazonS3) return true;
      return false;
    });
  }

  /**
   * Gets OneLake shortcuts only
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param folderPath The folder path
   * @returns Promise<Shortcut[]>
   */
  async getOneLakeShortcuts(
    workspaceId: string,
    itemId: string,
    folderPath: string
  ): Promise<Shortcut[]> {
    return this.getShortcutsByType(workspaceId, itemId, folderPath, 'OneLake');
  }

  /**
   * Gets ADLS Gen2 shortcuts only
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param folderPath The folder path
   * @returns Promise<Shortcut[]>
   */
  async getAdlsGen2Shortcuts(
    workspaceId: string,
    itemId: string,
    folderPath: string
  ): Promise<Shortcut[]> {
    return this.getShortcutsByType(workspaceId, itemId, folderPath, 'AdlsGen2');
  }

  /**
   * Gets S3 shortcuts only
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param folderPath The folder path
   * @returns Promise<Shortcut[]>
   */
  async getS3Shortcuts(
    workspaceId: string,
    itemId: string,
    folderPath: string
  ): Promise<Shortcut[]> {
    return this.getShortcutsByType(workspaceId, itemId, folderPath, 'S3');
  }

  /**
   * Searches for shortcuts by name pattern
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param folderPath The folder path
   * @param namePattern The name pattern to search for (case-insensitive)
   * @returns Promise<Shortcut[]>
   */
  async searchShortcutsByName(
    workspaceId: string,
    itemId: string,
    folderPath: string,
    namePattern: string
  ): Promise<Shortcut[]> {
    const allShortcuts = await this.getAllShortcuts(workspaceId, itemId, folderPath);
    const lowerPattern = namePattern.toLowerCase();
    
    return allShortcuts.filter(shortcut => 
      shortcut.name.toLowerCase().includes(lowerPattern)
    );
  }

  /**
   * Gets shortcuts pointing to a specific workspace
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param folderPath The folder path
   * @param targetWorkspaceId The target workspace ID to filter by
   * @returns Promise<Shortcut[]>
   */
  async getShortcutsToWorkspace(
    workspaceId: string,
    itemId: string,
    folderPath: string,
    targetWorkspaceId: string
  ): Promise<Shortcut[]> {
    const oneLakeShortcuts = await this.getOneLakeShortcuts(workspaceId, itemId, folderPath);
    
    return oneLakeShortcuts.filter(shortcut => 
      shortcut.target.oneLake?.workspaceId === targetWorkspaceId
    );
  }

  /**
   * Deletes multiple shortcuts by name pattern
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param folderPath The folder path
   * @param namePattern The name pattern to match for deletion
   * @returns Promise<void>
   */
  async deleteShortcutsByPattern(
    workspaceId: string,
    itemId: string,
    folderPath: string,
    namePattern: string
  ): Promise<void> {
    const shortcuts = await this.searchShortcutsByName(workspaceId, itemId, folderPath, namePattern);
    
    const deletionPromises = shortcuts.map(shortcut => 
      this.deleteShortcut(workspaceId, itemId, `${folderPath}/${shortcut.name}`)
    );

    await Promise.allSettled(deletionPromises);
  }
}