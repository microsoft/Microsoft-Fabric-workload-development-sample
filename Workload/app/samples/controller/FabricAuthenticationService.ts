import { AccessToken, WorkloadClientAPI } from "@ms-fabric/workload-client";
import { AuthenticationConfig, ServicePrincipalConfig } from "./FabricPlatformTypes";

/**
 * Service for handling authentication in Fabric Platform APIs
 * Supports both user token and service principal authentication
 */
export class FabricAuthenticationService {
  private workloadClient?: WorkloadClientAPI;
  private authConfig?: AuthenticationConfig;

  constructor(workloadClient?: WorkloadClientAPI, authConfig?: AuthenticationConfig) {
    this.workloadClient = workloadClient;
    this.authConfig = authConfig;
  }

  /**
   * Acquire an access token based on the authentication configuration
   * @param scopes The required scopes for the token
   * @returns Promise<AccessToken>
   */
  async acquireAccessToken(scopes: string): Promise<AccessToken> {
    // If custom token is provided, use it directly
    if (this.authConfig?.customToken) {
      return {
        token: this.authConfig.customToken
      };
    }

    // If service principal config is provided, use service principal authentication
    if (this.authConfig?.type === 'ServicePrincipal' && this.authConfig.servicePrincipal) {
      return this.acquireServicePrincipalToken(this.authConfig.servicePrincipal, scopes);
    }

    // Default to user token authentication via WorkloadClient
    if (this.workloadClient) {
      return this.acquireUserToken(scopes);
    }

    throw new Error('No valid authentication configuration provided. Please provide either WorkloadClientAPI, service principal config, or custom token.');
  }

  /**
   * Acquire user token using WorkloadClientAPI
   * @param scopes The required scopes
   * @returns Promise<AccessToken>
   */
  private async acquireUserToken(scopes: string): Promise<AccessToken> {
    if (!this.workloadClient) {
      throw new Error('WorkloadClientAPI is required for user token authentication');
    }
    
    return this.workloadClient.auth.acquireFrontendAccessToken({ 
      scopes: scopes?.length ? scopes.split(' ') : [] 
    });
  }

  /**
   * Acquire service principal token using client credentials flow
   * @param config Service principal configuration
   * @param scopes The required scopes
   * @returns Promise<AccessToken>
   */
  private async acquireServicePrincipalToken(
    config: ServicePrincipalConfig, 
    scopes: string
  ): Promise<AccessToken> {
    const authority = config.authority || `https://login.microsoftonline.com/${config.tenantId}`;
    const tokenUrl = `${authority}/oauth2/v2.0/token`;

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      scope: scopes || 'https://api.fabric.microsoft.com/.default'
    });

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Service principal authentication failed: ${response.status} ${errorText}`);
      }

      const tokenResponse = await response.json();
      
      return {
        token: tokenResponse.access_token
      };
    } catch (error: any) {
      throw new Error(`Failed to acquire service principal token: ${error.message}`);
    }
  }

  /**
   * Update authentication configuration
   * @param authConfig New authentication configuration
   */
  updateAuthConfig(authConfig: AuthenticationConfig): void {
    this.authConfig = authConfig;
  }

  /**
   * Update WorkloadClient (for user token authentication)
   * @param workloadClient New WorkloadClientAPI instance
   */
  updateWorkloadClient(workloadClient: WorkloadClientAPI): void {
    this.workloadClient = workloadClient;
  }

  /**
   * Check if the service is configured for service principal authentication
   * @returns boolean
   */
  isServicePrincipalAuth(): boolean {
    return this.authConfig?.type === 'ServicePrincipal' && !!this.authConfig.servicePrincipal;
  }

  /**
   * Check if the service is configured for user token authentication
   * @returns boolean
   */
  isUserTokenAuth(): boolean {
    return this.authConfig?.type === 'UserToken' || (!this.authConfig && !!this.workloadClient);
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use FabricAuthenticationService instead
 */
export async function callAcquireFrontendAccessToken(
  workloadClient: WorkloadClientAPI, 
  scopes: string
): Promise<AccessToken> {
  const authService = new FabricAuthenticationService(workloadClient);
  return authService.acquireAccessToken(scopes);
}
