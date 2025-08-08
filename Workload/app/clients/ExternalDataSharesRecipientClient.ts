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

}
