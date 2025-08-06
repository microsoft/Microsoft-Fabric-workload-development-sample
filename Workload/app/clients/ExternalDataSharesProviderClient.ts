import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { FabricPlatformClient } from "./FabricPlatformClient";
import { SCOPE_PAIRS } from "./FabricPlatformScopes";
import {
  PaginatedResponse,
  ExternalDataShare,
  CreateExternalDataShareRequest,
  UpdateExternalDataShareRequest,
  ExternalDataShareProvider,
  CreateExternalDataShareProviderRequest,
  UpdateExternalDataShareProviderRequest
} from "./FabricPlatformTypes";

/**
 * API wrapper for External Data Shares Provider operations
 * Provides methods for managing external data sharing providers and shares
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
  // External Data Share Provider Management
  // ============================

  /**
   * Returns a list of external data share providers for a workspace item
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param continuationToken Token for pagination
   * @returns Promise<PaginatedResponse<ExternalDataShareProvider>>
   */
  async listProviders(
    workspaceId: string,
    itemId: string,
    continuationToken?: string
  ): Promise<PaginatedResponse<ExternalDataShareProvider>> {
    let endpoint = `/workspaces/${workspaceId}/items/${itemId}/externalDataShares/providers`;
    if (continuationToken) {
      endpoint += `?continuationToken=${encodeURIComponent(continuationToken)}`;
    }
    return this.get<PaginatedResponse<ExternalDataShareProvider>>(endpoint);
  }

  /**
   * Gets all external data share providers for a workspace item (handles pagination automatically)
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @returns Promise<ExternalDataShareProvider[]>
   */
  async getAllProviders(workspaceId: string, itemId: string): Promise<ExternalDataShareProvider[]> {
    return this.getAllPages<ExternalDataShareProvider>(`/workspaces/${workspaceId}/items/${itemId}/externalDataShares/providers`);
  }

  /**
   * Creates a new external data share provider for a workspace item
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param request CreateExternalDataShareProviderRequest
   * @returns Promise<ExternalDataShareProvider>
   */
  async createProvider(workspaceId: string, itemId: string, request: CreateExternalDataShareProviderRequest): Promise<ExternalDataShareProvider> {
    return this.post<ExternalDataShareProvider>(`/workspaces/${workspaceId}/items/${itemId}/externalDataShares/providers`, request);
  }

  /**
   * Returns properties of the specified external data share provider
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param providerId The provider ID
   * @returns Promise<ExternalDataShareProvider>
   */
  async getProvider(workspaceId: string, itemId: string, providerId: string): Promise<ExternalDataShareProvider> {
    return this.get<ExternalDataShareProvider>(`/workspaces/${workspaceId}/items/${itemId}/externalDataShares/providers/${providerId}`);
  }

  /**
   * Updates the properties of the specified external data share provider
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param providerId The provider ID
   * @param request UpdateExternalDataShareProviderRequest
   * @returns Promise<ExternalDataShareProvider>
   */
  async updateProvider(workspaceId: string, itemId: string, providerId: string, request: UpdateExternalDataShareProviderRequest): Promise<ExternalDataShareProvider> {
    return this.patch<ExternalDataShareProvider>(`/workspaces/${workspaceId}/items/${itemId}/externalDataShares/providers/${providerId}`, request);
  }

  /**
   * Deletes the specified external data share provider
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param providerId The provider ID
   * @returns Promise<void>
   */
  async deleteProvider(workspaceId: string, itemId: string, providerId: string): Promise<void> {
    await this.delete<void>(`/workspaces/${workspaceId}/items/${itemId}/externalDataShares/providers/${providerId}`);
  }

  // ============================
  // External Data Share Management
  // ============================

  /**
   * Returns a list of external data shares for a provider
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param providerId The provider ID
   * @param continuationToken Token for pagination
   * @returns Promise<PaginatedResponse<ExternalDataShare>>
   */
  async listShares(
    workspaceId: string,
    itemId: string,
    providerId: string,
    continuationToken?: string
  ): Promise<PaginatedResponse<ExternalDataShare>> {
    let endpoint = `/workspaces/${workspaceId}/items/${itemId}/externalDataShares/providers/${providerId}/shares`;
    if (continuationToken) {
      endpoint += `?continuationToken=${encodeURIComponent(continuationToken)}`;
    }
    return this.get<PaginatedResponse<ExternalDataShare>>(endpoint);
  }

  /**
   * Gets all external data shares for a provider (handles pagination automatically)
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param providerId The provider ID
   * @returns Promise<ExternalDataShare[]>
   */
  async getAllShares(workspaceId: string, itemId: string, providerId: string): Promise<ExternalDataShare[]> {
    return this.getAllPages<ExternalDataShare>(`/workspaces/${workspaceId}/items/${itemId}/externalDataShares/providers/${providerId}/shares`);
  }

  /**
   * Creates a new external data share
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param providerId The provider ID
   * @param request CreateExternalDataShareRequest
   * @returns Promise<ExternalDataShare>
   */
  async createShare(workspaceId: string, itemId: string, providerId: string, request: CreateExternalDataShareRequest): Promise<ExternalDataShare> {
    return this.post<ExternalDataShare>(`/workspaces/${workspaceId}/items/${itemId}/externalDataShares/providers/${providerId}/shares`, request);
  }

  /**
   * Returns properties of the specified external data share
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param providerId The provider ID
   * @param shareId The share ID
   * @returns Promise<ExternalDataShare>
   */
  async getShare(workspaceId: string, itemId: string, providerId: string, shareId: string): Promise<ExternalDataShare> {
    return this.get<ExternalDataShare>(`/workspaces/${workspaceId}/items/${itemId}/externalDataShares/providers/${providerId}/shares/${shareId}`);
  }

  /**
   * Updates the properties of the specified external data share
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param providerId The provider ID
   * @param shareId The share ID
   * @param request UpdateExternalDataShareRequest
   * @returns Promise<ExternalDataShare>
   */
  async updateShare(workspaceId: string, itemId: string, providerId: string, shareId: string, request: UpdateExternalDataShareRequest): Promise<ExternalDataShare> {
    return this.patch<ExternalDataShare>(`/workspaces/${workspaceId}/items/${itemId}/externalDataShares/providers/${providerId}/shares/${shareId}`, request);
  }

  /**
   * Deletes the specified external data share
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param providerId The provider ID
   * @param shareId The share ID
   * @returns Promise<void>
   */
  async deleteShare(workspaceId: string, itemId: string, providerId: string, shareId: string): Promise<void> {
    await this.delete<void>(`/workspaces/${workspaceId}/items/${itemId}/externalDataShares/providers/${providerId}/shares/${shareId}`);
  }

  // ============================
  // Helper Methods
  // ============================

  /**
   * Gets external data shares by share kind
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param providerId The provider ID
   * @param shareKind The share kind to filter by
   * @returns Promise<ExternalDataShare[]>
   */
  async getSharesByKind(workspaceId: string, itemId: string, providerId: string, shareKind: string): Promise<ExternalDataShare[]> {
    const allShares = await this.getAllShares(workspaceId, itemId, providerId);
    return allShares.filter(share => share.shareKind === shareKind);
  }

  /**
   * Gets external data shares by recipient email
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param providerId The provider ID
   * @param recipientEmail The recipient email to filter by
   * @returns Promise<ExternalDataShare[]>
   */
  async getSharesByRecipient(workspaceId: string, itemId: string, providerId: string, recipientEmail: string): Promise<ExternalDataShare[]> {
    const allShares = await this.getAllShares(workspaceId, itemId, providerId);
    return allShares.filter(share => share.recipient?.email === recipientEmail);
  }

  /**
   * Searches for external data shares by display name
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param providerId The provider ID
   * @param searchTerm The search term to match against display names
   * @param caseSensitive Whether the search should be case sensitive (default: false)
   * @returns Promise<ExternalDataShare[]>
   */
  async searchSharesByName(
    workspaceId: string,
    itemId: string,
    providerId: string,
    searchTerm: string,
    caseSensitive: boolean = false
  ): Promise<ExternalDataShare[]> {
    const allShares = await this.getAllShares(workspaceId, itemId, providerId);
    const searchPattern = caseSensitive ? searchTerm : searchTerm.toLowerCase();
    
    return allShares.filter(share => {
      const shareName = caseSensitive ? share.displayName : share.displayName.toLowerCase();
      return shareName.includes(searchPattern);
    });
  }

  /**
   * Gets providers by data source type
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param dataSourceType The data source type to filter by
   * @returns Promise<ExternalDataShareProvider[]>
   */
  async getProvidersByType(workspaceId: string, itemId: string, dataSourceType: string): Promise<ExternalDataShareProvider[]> {
    const allProviders = await this.getAllProviders(workspaceId, itemId);
    return allProviders.filter(provider => provider.dataSourceType === dataSourceType);
  }

  /**
   * Creates multiple external data shares in batch
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param providerId The provider ID
   * @param requests Array of CreateExternalDataShareRequest
   * @returns Promise<ExternalDataShare[]>
   */
  async createSharesBatch(workspaceId: string, itemId: string, providerId: string, requests: CreateExternalDataShareRequest[]): Promise<ExternalDataShare[]> {
    const createdShares: ExternalDataShare[] = [];
    
    for (const request of requests) {
      try {
        const share = await this.createShare(workspaceId, itemId, providerId, request);
        createdShares.push(share);
      } catch (error) {
        console.error(`Failed to create share ${request.displayName}:`, error);
        // Continue with other shares even if one fails
      }
    }
    
    return createdShares;
  }

  // ============================
  // Convenience Methods
  // ============================

  /**
   * Gets all external data shares across all providers for a workspace item
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @returns Promise<{ provider: ExternalDataShareProvider; shares: ExternalDataShare[] }[]>
   */
  async getAllSharesForItem(workspaceId: string, itemId: string): Promise<{ provider: ExternalDataShareProvider; shares: ExternalDataShare[] }[]> {
    const providers = await this.getAllProviders(workspaceId, itemId);
    const result: { provider: ExternalDataShareProvider; shares: ExternalDataShare[] }[] = [];
    
    for (const provider of providers) {
      try {
        const shares = await this.getAllShares(workspaceId, itemId, provider.id);
        result.push({ provider, shares });
      } catch (error) {
        console.error(`Failed to get shares for provider ${provider.displayName}:`, error);
        result.push({ provider, shares: [] });
      }
    }
    
    return result;
  }

  /**
   * Searches for external data shares across all providers by display name
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param searchTerm The search term to match against display names
   * @param caseSensitive Whether the search should be case sensitive (default: false)
   * @returns Promise<{ provider: ExternalDataShareProvider; share: ExternalDataShare }[]>
   */
  async searchAllSharesByName(
    workspaceId: string,
    itemId: string,
    searchTerm: string,
    caseSensitive: boolean = false
  ): Promise<{ provider: ExternalDataShareProvider; share: ExternalDataShare }[]> {
    const allData = await this.getAllSharesForItem(workspaceId, itemId);
    const results: { provider: ExternalDataShareProvider; share: ExternalDataShare }[] = [];
    const searchPattern = caseSensitive ? searchTerm : searchTerm.toLowerCase();
    
    for (const { provider, shares } of allData) {
      for (const share of shares) {
        const shareName = caseSensitive ? share.displayName : share.displayName.toLowerCase();
        if (shareName.includes(searchPattern)) {
          results.push({ provider, share });
        }
      }
    }
    
    return results;
  }

  /**
   * Gets external data shares by recipient across all providers
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param recipientEmail The recipient email to filter by
   * @returns Promise<{ provider: ExternalDataShareProvider; share: ExternalDataShare }[]>
   */
  async getAllSharesByRecipient(
    workspaceId: string,
    itemId: string,
    recipientEmail: string
  ): Promise<{ provider: ExternalDataShareProvider; share: ExternalDataShare }[]> {
    const allData = await this.getAllSharesForItem(workspaceId, itemId);
    const results: { provider: ExternalDataShareProvider; share: ExternalDataShare }[] = [];
    
    for (const { provider, shares } of allData) {
      for (const share of shares) {
        if (share.recipient?.email === recipientEmail) {
          results.push({ provider, share });
        }
      }
    }
    
    return results;
  }
}
