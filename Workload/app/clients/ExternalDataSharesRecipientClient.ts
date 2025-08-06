import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { FabricPlatformClient } from "./FabricPlatformClient";
import { SCOPE_PAIRS } from "./FabricPlatformScopes";
import {
  ExternalDataShareInvitationDetails,
  AcceptExternalDataShareInvitationRequest,
  AcceptExternalDataShareInvitationResponse,
  ShortcutCreationPayload,
  CreateExternalDataShareShortcutRequest
} from "./FabricPlatformTypes";

/**
 * API wrapper for External Data Shares Recipient operations
 * Provides methods for managing external data share invitations from the recipient perspective
 * 
 * This client handles:
 * - Getting invitation details
 * - Accepting external data share invitations
 * 
 * Required permissions: ExternalDataShare.Accept.All
 * 
 * Uses method-based scope selection:
 * - Both GET and POST operations use the same scopes for recipient operations
 */
export class ExternalDataSharesRecipientClient extends FabricPlatformClient {
  
  constructor(workloadClient: WorkloadClientAPI) {
    // Use scope pairs for method-based scope selection
    super(workloadClient, SCOPE_PAIRS.EXTERNAL_DATA_SHARES_RECIPIENT); // Using dedicated external data shares recipient scopes
  }

  // ============================
  // External Data Share Invitation Management
  // ============================

  /**
   * Returns information about an external data share invitation
   * @param invitationId The external data share invitation ID
   * @param providerTenantId The external data share provider tenant ID
   * @returns Promise<ExternalDataShareInvitationDetails>
   */
  async getInvitationDetails(
    invitationId: string,
    providerTenantId: string
  ): Promise<ExternalDataShareInvitationDetails> {
    const endpoint = `/externalDataShares/invitations/${invitationId}?providerTenantId=${encodeURIComponent(providerTenantId)}`;
    return this.get<ExternalDataShareInvitationDetails>(endpoint);
  }

  /**
   * Accepts an external data share invitation into a specified data item
   * @param invitationId The external data share invitation ID
   * @param request The request payload for accepting the invitation
   * @returns Promise<AcceptExternalDataShareInvitationResponse>
   */
  async acceptInvitation(
    invitationId: string,
    request: AcceptExternalDataShareInvitationRequest
  ): Promise<AcceptExternalDataShareInvitationResponse> {
    const endpoint = `/externalDataShares/invitations/${invitationId}/accept`;
    return this.post<AcceptExternalDataShareInvitationResponse>(endpoint, request);
  }

  // ============================
  // Helper Methods
  // ============================

  /**
   * Creates a shortcut creation payload for accepting an invitation
   * @param path A full path in a data item where shortcuts will be created (e.g., "Files/" or "Tables/MyFolder")
   * @param shortcutRequests Array of shortcut creation requests
   * @returns ShortcutCreationPayload
   */
  createShortcutPayload(
    path: string,
    shortcutRequests: CreateExternalDataShareShortcutRequest[]
  ): ShortcutCreationPayload {
    return {
      payloadType: 'ShortcutCreation',
      path,
      createShortcutRequests: shortcutRequests
    };
  }

  /**
   * Creates a shortcut creation request
   * @param pathId Unique identifier of the target path (from invitation details)
   * @param shortcutName Name of the shortcut
   * @returns CreateExternalDataShareShortcutRequest
   */
  createShortcutRequest(
    pathId: string,
    shortcutName: string
  ): CreateExternalDataShareShortcutRequest {
    return {
      pathId,
      shortcutName
    };
  }

  /**
   * Validates that a path is suitable for accepting external data shares
   * @param path The path to validate
   * @returns boolean - true if valid, false otherwise
   */
  validateAcceptancePath(path: string): boolean {
    // Valid paths must start with "Files/" or "Tables/"
    return path.startsWith('Files/') || path.startsWith('Tables/');
  }

  /**
   * Convenience method to accept an invitation with automatically generated shortcut names
   * @param invitationId The external data share invitation ID
   * @param providerTenantId The external data share provider tenant ID
   * @param workspaceId The workspace ID where shortcuts will be created
   * @param itemId The item ID where shortcuts will be created
   * @param destinationPath The path where shortcuts will be created (e.g., "Files/SharedData")
   * @param shortcutNamePrefix Optional prefix for shortcut names (defaults to "ExternalShare_")
   * @returns Promise<AcceptExternalDataShareInvitationResponse>
   */
  async acceptInvitationWithAutoNames(
    invitationId: string,
    providerTenantId: string,
    workspaceId: string,
    itemId: string,
    destinationPath: string,
    shortcutNamePrefix: string = 'ExternalShare_'
  ): Promise<AcceptExternalDataShareInvitationResponse> {
    // First, get the invitation details to know what paths are available
    const invitationDetails = await this.getInvitationDetails(invitationId, providerTenantId);
    
    // Validate the destination path
    if (!this.validateAcceptancePath(destinationPath)) {
      throw new Error(`Invalid destination path: ${destinationPath}. Path must start with "Files/" or "Tables/"`);
    }
    
    // Create shortcut requests for all available paths
    const shortcutRequests: CreateExternalDataShareShortcutRequest[] = invitationDetails.pathsDetails.map(
      (pathDetail, index) => ({
        pathId: pathDetail.pathId,
        shortcutName: `${shortcutNamePrefix}${pathDetail.name}`
      })
    );
    
    // Create the payload
    const payload = this.createShortcutPayload(destinationPath, shortcutRequests);
    
    // Create the request
    const request: AcceptExternalDataShareInvitationRequest = {
      providerTenantId,
      workspaceId,
      itemId,
      payload
    };
    
    // Accept the invitation
    return this.acceptInvitation(invitationId, request);
  }

  /**
   * Convenience method to accept only specific paths from an invitation
   * @param invitationId The external data share invitation ID
   * @param providerTenantId The external data share provider tenant ID
   * @param workspaceId The workspace ID where shortcuts will be created
   * @param itemId The item ID where shortcuts will be created
   * @param destinationPath The path where shortcuts will be created
   * @param pathSelections Array of objects specifying which paths to accept and their shortcut names
   * @returns Promise<AcceptExternalDataShareInvitationResponse>
   */
  async acceptInvitationWithSelectedPaths(
    invitationId: string,
    providerTenantId: string,
    workspaceId: string,
    itemId: string,
    destinationPath: string,
    pathSelections: { pathName: string; shortcutName: string }[]
  ): Promise<AcceptExternalDataShareInvitationResponse> {
    // First, get the invitation details
    const invitationDetails = await this.getInvitationDetails(invitationId, providerTenantId);
    
    // Validate the destination path
    if (!this.validateAcceptancePath(destinationPath)) {
      throw new Error(`Invalid destination path: ${destinationPath}. Path must start with "Files/" or "Tables/"`);
    }
    
    // Create shortcut requests for selected paths only
    const shortcutRequests: CreateExternalDataShareShortcutRequest[] = [];
    
    for (const selection of pathSelections) {
      const pathDetail = invitationDetails.pathsDetails.find(p => p.name === selection.pathName);
      if (!pathDetail) {
        throw new Error(`Path "${selection.pathName}" not found in invitation`);
      }
      
      shortcutRequests.push({
        pathId: pathDetail.pathId,
        shortcutName: selection.shortcutName
      });
    }
    
    // Create the payload
    const payload = this.createShortcutPayload(destinationPath, shortcutRequests);
    
    // Create the request
    const request: AcceptExternalDataShareInvitationRequest = {
      providerTenantId,
      workspaceId,
      itemId,
      payload
    };
    
    // Accept the invitation
    return this.acceptInvitation(invitationId, request);
  }

  /**
   * Gets summary information about an invitation without accepting it
   * @param invitationId The external data share invitation ID
   * @param providerTenantId The external data share provider tenant ID
   * @returns Promise with summary information
   */
  async getInvitationSummary(
    invitationId: string,
    providerTenantId: string
  ): Promise<{
    providerTenant: string;
    providerDomain: string;
    pathCount: number;
    folderCount: number;
    tableCount: number;
    pathNames: string[];
  }> {
    const details = await this.getInvitationDetails(invitationId, providerTenantId);
    
    const folderCount = details.pathsDetails.filter(p => p.type === 'Folder').length;
    const tableCount = details.pathsDetails.filter(p => p.type === 'Table').length;
    
    return {
      providerTenant: details.providerTenantDetails.displayName,
      providerDomain: details.providerTenantDetails.verifiedDomainName,
      pathCount: details.pathsDetails.length,
      folderCount,
      tableCount,
      pathNames: details.pathsDetails.map(p => p.name)
    };
  }
}
