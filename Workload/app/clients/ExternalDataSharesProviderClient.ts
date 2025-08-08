import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { FabricPlatformClient } from "./FabricPlatformClient";
import { SCOPE_PAIRS } from "./FabricPlatformScopes";
import {
  PaginatedResponse,
  ExternalDataShare,
  CreateExternalDataShareRequest,
  ExternalDataShareRecipient
} from "./FabricPlatformTypes";

/**
 * API wrapper for External Data Shares Provider operations
 * Provides methods for managing external data sharing
 * 
 * Based on the official Fabric REST API:
 * https://learn.microsoft.com/en-us/rest/api/fabric/core/external-data-shares-provider
 * 
 * Uses method-based scope selection:
 * - GET operations use read-only scopes
 * - POST/PUT/PATCH/DELETE operations use read-write scopes
 */
export class ExternalDataSharesProviderClient extends FabricPlatformClient {
  
  constructor(workloadClient: WorkloadClientAPI) {
    // Use scope pairs for method-based scope selection
    super(workloadClient, SCOPE_PAIRS.EXTERNAL_DATA_SHARES); // Using dedicated external data shares scopes
  }

  // ============================
  // External Data Share Management
  // ============================

  /**
   * Returns a list of external data shares that exist for the specified item
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param continuationToken Token for pagination (optional)
   * @returns Promise<PaginatedResponse<ExternalDataShare>>
   */
  async listExternalDataShares(
    workspaceId: string,
    itemId: string,
    continuationToken?: string
  ): Promise<PaginatedResponse<ExternalDataShare>> {
    let endpoint = `/workspaces/${workspaceId}/items/${itemId}/externalDataShares`;
    if (continuationToken) {
      endpoint += `?continuationToken=${encodeURIComponent(continuationToken)}`;
    }
    return this.get<PaginatedResponse<ExternalDataShare>>(endpoint);
  }

  /**
   * Gets all external data shares for an item (handles pagination automatically)
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @returns Promise<ExternalDataShare[]>
   */
  async getAllExternalDataShares(workspaceId: string, itemId: string): Promise<ExternalDataShare[]> {
    return this.getAllPages<ExternalDataShare>(`/workspaces/${workspaceId}/items/${itemId}/externalDataShares`);
  }

  /**
   * Creates an external data share for a given path or list of paths in the specified item
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param request CreateExternalDataShareRequest
   * @returns Promise<ExternalDataShare>
   */
  async createExternalDataShare(workspaceId: string, itemId: string, request: CreateExternalDataShareRequest): Promise<ExternalDataShare> {
    return this.post<ExternalDataShare>(`/workspaces/${workspaceId}/items/${itemId}/externalDataShares`, request);
  }

  /**
   * Returns the details of the specified external data share
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param shareId The external data share ID
   * @returns Promise<ExternalDataShare>
   */
  async getExternalDataShare(workspaceId: string, itemId: string, shareId: string): Promise<ExternalDataShare> {
    return this.get<ExternalDataShare>(`/workspaces/${workspaceId}/items/${itemId}/externalDataShares/${shareId}`);
  }

  /**
   * Deletes the specified external data share
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param shareId The external data share ID
   * @returns Promise<void>
   */
  async deleteExternalDataShare(workspaceId: string, itemId: string, shareId: string): Promise<void> {
    await this.delete<void>(`/workspaces/${workspaceId}/items/${itemId}/externalDataShares/${shareId}`);
  }

  /**
   * Revokes the specified external data share. This action cannot be undone.
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param shareId The external data share ID
   * @returns Promise<void>
   */
  async revokeExternalDataShare(workspaceId: string, itemId: string, shareId: string): Promise<void> {
    await this.post<void>(`/workspaces/${workspaceId}/items/${itemId}/externalDataShares/${shareId}/revoke`, {});
  }

  // ============================
  // Helper Methods
  // ============================

  /**
   * Gets external data shares by share kind
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param shareKind The share kind to filter by
   * @returns Promise<ExternalDataShare[]>
   */
  async getSharesByKind(workspaceId: string, itemId: string, shareKind: string): Promise<ExternalDataShare[]> {
    const allShares = await this.getAllExternalDataShares(workspaceId, itemId);
    return allShares.filter(share => share.shareKind === shareKind);
  }

  /**
   * Gets external data shares by recipient email
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param recipientEmail The recipient email to filter by
   * @returns Promise<ExternalDataShare[]>
   */
  async getSharesByRecipient(workspaceId: string, itemId: string, recipientEmail: string): Promise<ExternalDataShare[]> {
    const allShares = await this.getAllExternalDataShares(workspaceId, itemId);
    return allShares.filter(share => share.recipient?.email === recipientEmail);
  }

  /**
   * Gets external data shares by path (exact match)
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param path The path to filter by
   * @returns Promise<ExternalDataShare[]>
   */
  async getSharesByPath(workspaceId: string, itemId: string, path: string): Promise<ExternalDataShare[]> {
    const allShares = await this.getAllExternalDataShares(workspaceId, itemId);
    return allShares.filter(share => 
      share.paths?.some(pathObj => pathObj.path === path)
    );
  }

  /**
   * Gets external data shares by path pattern (contains match)
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param pathPattern The path pattern to search for
   * @returns Promise<ExternalDataShare[]>
   */
  async getSharesByPathPattern(workspaceId: string, itemId: string, pathPattern: string): Promise<ExternalDataShare[]> {
    const allShares = await this.getAllExternalDataShares(workspaceId, itemId);
    return allShares.filter(share => 
      share.paths?.some(pathObj => pathObj.path.includes(pathPattern))
    );
  }

  /**
   * Gets external data shares by display name (contains match)
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param searchTerm The search term to match against display names
   * @param caseSensitive Whether the search should be case sensitive (default: false)
   * @returns Promise<ExternalDataShare[]>
   */
  async getSharesByDisplayName(workspaceId: string, itemId: string, searchTerm: string, caseSensitive: boolean = false): Promise<ExternalDataShare[]> {
    const allShares = await this.getAllExternalDataShares(workspaceId, itemId);
    const searchPattern = caseSensitive ? searchTerm : searchTerm.toLowerCase();
    
    return allShares.filter(share => {
      const displayName = caseSensitive ? share.displayName : share.displayName.toLowerCase();
      return displayName.includes(searchPattern);
    });
  }

  /**
   * Creates multiple external data shares in batch
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param requests Array of CreateExternalDataShareRequest
   * @returns Promise<ExternalDataShare[]>
   */
  async createSharesBatch(workspaceId: string, itemId: string, requests: CreateExternalDataShareRequest[]): Promise<ExternalDataShare[]> {
    const createdShares: ExternalDataShare[] = [];
    
    for (const request of requests) {
      try {
        const share = await this.createExternalDataShare(workspaceId, itemId, request);
        createdShares.push(share);
      } catch (error) {
        console.error(`Failed to create share for paths ${request.paths.join(', ')}:`, error);
        // Continue with other shares even if one fails
      }
    }
    
    return createdShares;
  }

  /**
   * Creates an external data share for a single path
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param path The path to share
   * @param recipient The recipient information
   * @param shareKind The kind of share (default: "Default")
   * @param displayName The display name for the share
   * @returns Promise<ExternalDataShare>
   */
  async createShareForPath(
    workspaceId: string, 
    itemId: string, 
    path: string, 
    recipient: ExternalDataShareRecipient,
    shareKind: string = "Default",
    displayName: string = `Share for ${path}`
  ): Promise<ExternalDataShare> {
    return this.createExternalDataShare(workspaceId, itemId, {
      displayName,
      shareKind,
      paths: [{ path, kind: "Folder" }],
      recipient
    });
  }

  /**
   * Creates an external data share for multiple paths
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param paths Array of paths to share (max 100)
   * @param recipient The recipient information
   * @param shareKind The kind of share (default: "Default")
   * @param displayName The display name for the share
   * @returns Promise<ExternalDataShare>
   */
  async createShareForPaths(
    workspaceId: string, 
    itemId: string, 
    paths: string[], 
    recipient: ExternalDataShareRecipient,
    shareKind: string = "Default",
    displayName: string = `Share for ${paths.length} paths`
  ): Promise<ExternalDataShare> {
    if (paths.length > 100) {
      throw new Error("Cannot share more than 100 paths in a single share");
    }
    
    return this.createExternalDataShare(workspaceId, itemId, {
      displayName,
      shareKind,
      paths: paths.map(path => ({ path, kind: "Folder" })),
      recipient
    });
  }

  /**
   * Gets shares that were created recently (within specified days)
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param daysFromNow Number of days from now to check for creation (default: 7)
   * @returns Promise<ExternalDataShare[]>
   */
  async getRecentShares(workspaceId: string, itemId: string, daysFromNow: number = 7): Promise<ExternalDataShare[]> {
    const allShares = await this.getAllExternalDataShares(workspaceId, itemId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysFromNow);
    
    return allShares.filter(share => {
      if (!share.createdDate) return false;
      const createdDate = new Date(share.createdDate);
      return createdDate >= cutoffDate;
    });
  }
}
