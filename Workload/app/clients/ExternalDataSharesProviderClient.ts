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
    super(workloadClient, SCOPE_PAIRS.EXTERNAL_DATA_SHARES);
  }

  // ============================
  // External Data Share Management
  // ============================

  /**
   * Returns a list of external data shares that exist for the specified item
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param continuationToken Token for pagination (optional)
   * @returns Promise<ExternalDataShare[]>
   */
  async getAllExternalDataShares(
    workspaceId: string, 
    itemId: string, 
    continuationToken?: string
  ): Promise<ExternalDataShare[]> {
    let url = `/workspaces/${workspaceId}/items/${itemId}/externalDataShares`;
    
    if (continuationToken) {
      url += `?continuationToken=${encodeURIComponent(continuationToken)}`;
    }
    
    const response = await this.get<PaginatedResponse<ExternalDataShare>>(url);
    return response.value || [];
  }

  /**
   * Creates an external data share for a specific OneLake path
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param request The create request
   * @returns Promise<ExternalDataShare>
   */
  async createExternalDataShare(
    workspaceId: string, 
    itemId: string, 
    request: CreateExternalDataShareRequest
  ): Promise<ExternalDataShare> {
    const url = `/workspaces/${workspaceId}/items/${itemId}/externalDataShares`;
    return await this.post<ExternalDataShare>(url, request);
  }

  /**
   * Gets an external data share by its unique identifier
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param externalDataShareId The external data share ID
   * @returns Promise<ExternalDataShare>
   */
  async getExternalDataShare(
    workspaceId: string, 
    itemId: string, 
    externalDataShareId: string
  ): Promise<ExternalDataShare> {
    const url = `/workspaces/${workspaceId}/items/${itemId}/externalDataShares/${externalDataShareId}`;
    return await this.get<ExternalDataShare>(url);
  }

  /**
   * Revokes an external data share
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param externalDataShareId The external data share ID
   * @returns Promise<void>
   */
  async revokeExternalDataShare(
    workspaceId: string, 
    itemId: string, 
    externalDataShareId: string
  ): Promise<void> {
    const url = `/workspaces/${workspaceId}/items/${itemId}/externalDataShares/${externalDataShareId}/revoke`;
    await this.post<void>(url, {});
  }

  // ============================
  // Helper Methods for Filtering
  // ============================

  /**
   * Gets external data shares by status
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param status The status to filter by (Pending, Active, Revoked, InvitationExpired)
   * @returns Promise<ExternalDataShare[]>
   */
  async getSharesByStatus(workspaceId: string, itemId: string, status: string): Promise<ExternalDataShare[]> {
    const allShares = await this.getAllExternalDataShares(workspaceId, itemId);
    return allShares.filter(share => share.status === status);
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
    return allShares.filter(share => share.recipient?.userPrincipalName === recipientEmail);
  }

  /**
   * Gets external data shares by path
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param path The path to filter by
   * @returns Promise<ExternalDataShare[]>
   */
  async getSharesByPath(workspaceId: string, itemId: string, path: string): Promise<ExternalDataShare[]> {
    const allShares = await this.getAllExternalDataShares(workspaceId, itemId);
    return allShares.filter(share => 
      share.paths?.some(pathString => pathString === path)
    );
  }

  /**
   * Gets external data shares by path pattern (partial match)
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param pathPattern The path pattern to match
   * @returns Promise<ExternalDataShare[]>
   */
  async getSharesByPathPattern(workspaceId: string, itemId: string, pathPattern: string): Promise<ExternalDataShare[]> {
    const allShares = await this.getAllExternalDataShares(workspaceId, itemId);
    return allShares.filter(share => 
      share.paths?.some(pathString => pathString.includes(pathPattern))
    );
  }

  /**
   * Gets external data shares by workspace
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param targetWorkspaceId The target workspace ID to filter by
   * @returns Promise<ExternalDataShare[]>
   */
  async getSharesByWorkspace(workspaceId: string, itemId: string, targetWorkspaceId: string): Promise<ExternalDataShare[]> {
    const allShares = await this.getAllExternalDataShares(workspaceId, itemId);
    return allShares.filter(share => share.workspaceId === targetWorkspaceId);
  }

  // ============================
  // Convenience Methods
  // ============================

  /**
   * Creates a share for a single path
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param path The OneLake path to share
   * @param recipient The recipient information
   * @returns Promise<ExternalDataShare>
   */
  async createShareForPath(
    workspaceId: string, 
    itemId: string, 
    path: string, 
    recipient: ExternalDataShareRecipient
  ): Promise<ExternalDataShare> {
    const request: CreateExternalDataShareRequest = {
      paths: [path],
      recipient
    };
    return await this.createExternalDataShare(workspaceId, itemId, request);
  }

  /**
   * Creates a share for multiple paths
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param paths Array of OneLake paths to share
   * @param recipient The recipient information
   * @returns Promise<ExternalDataShare>
   */
  async createShareForPaths(
    workspaceId: string, 
    itemId: string, 
    paths: string[], 
    recipient: ExternalDataShareRecipient
  ): Promise<ExternalDataShare> {
    const request: CreateExternalDataShareRequest = {
      paths: paths,
      recipient
    };
    return await this.createExternalDataShare(workspaceId, itemId, request);
  }

  /**
   * Gets shares that have expired
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @returns Promise<ExternalDataShare[]>
   */
  async getExpiredShares(workspaceId: string, itemId: string): Promise<ExternalDataShare[]> {
    const allShares = await this.getAllExternalDataShares(workspaceId, itemId);
    const now = new Date();
    return allShares.filter(share => {
      if (!share.expirationTimeUtc) return false;
      const expirationDate = new Date(share.expirationTimeUtc);
      return expirationDate < now;
    });
  }

  /**
   * Gets active (non-expired, non-revoked) shares
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @returns Promise<ExternalDataShare[]>
   */
  async getActiveShares(workspaceId: string, itemId: string): Promise<ExternalDataShare[]> {
    const allShares = await this.getAllExternalDataShares(workspaceId, itemId);
    return allShares.filter(share => share.status === 'Active');
  }

  /**
   * Gets pending shares (invitations not yet accepted)
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @returns Promise<ExternalDataShare[]>
   */
  async getPendingShares(workspaceId: string, itemId: string): Promise<ExternalDataShare[]> {
    const allShares = await this.getAllExternalDataShares(workspaceId, itemId);
    return allShares.filter(share => share.status === 'Pending');
  }

  /**
   * Gets revoked shares
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @returns Promise<ExternalDataShare[]>
   */
  async getRevokedShares(workspaceId: string, itemId: string): Promise<ExternalDataShare[]> {
    const allShares = await this.getAllExternalDataShares(workspaceId, itemId);
    return allShares.filter(share => share.status === 'Revoked');
  }

  /**
   * Checks if a specific path is already shared
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param path The path to check
   * @returns Promise<boolean>
   */
  async isPathShared(workspaceId: string, itemId: string, path: string): Promise<boolean> {
    const shares = await this.getSharesByPath(workspaceId, itemId, path);
    return shares.some(share => share.status === 'Active' || share.status === 'Pending');
  }

  /**
   * Gets all shares for a specific recipient
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param recipientEmail The recipient's email
   * @returns Promise<ExternalDataShare[]>
   */
  async getSharesForRecipient(workspaceId: string, itemId: string, recipientEmail: string): Promise<ExternalDataShare[]> {
    return await this.getSharesByRecipient(workspaceId, itemId, recipientEmail);
  }

  /**
   * Bulk revoke multiple shares
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param shareIds Array of share IDs to revoke
   * @returns Promise<void>
   */
  async revokeMultipleShares(workspaceId: string, itemId: string, shareIds: string[]): Promise<void> {
    const revokePromises = shareIds.map(shareId => 
      this.revokeExternalDataShare(workspaceId, itemId, shareId)
    );
    await Promise.all(revokePromises);
  }
}