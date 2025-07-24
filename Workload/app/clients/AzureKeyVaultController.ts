import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { FabricPlatformClient } from "./FabricPlatformClient";
import { AuthenticationConfig } from "./FabricPlatformTypes";
import { FABRIC_BASE_SCOPES } from "./FabricPlatformScopes";

/**
 * Azure Key Vault Secret Bundle
 * Represents a secret retrieved from Azure Key Vault
 */
export interface KeyVaultSecretBundle {
  value: string;
  id: string;
  attributes: KeyVaultSecretAttributes;
  contentType?: string;
  kid?: string;
  managed?: boolean;
  tags?: { [key: string]: string };
}

/**
 * Azure Key Vault Secret Attributes
 * Management attributes for a Key Vault secret
 */
export interface KeyVaultSecretAttributes {
  enabled: boolean;
  created: number; // Unix timestamp
  updated: number; // Unix timestamp
  exp?: number; // Unix timestamp - expiry date
  nbf?: number; // Unix timestamp - not before date
  recoverableDays?: number; // Soft delete retention days
  recoveryLevel?: DeletionRecoveryLevel;
}

/**
 * Azure Key Vault Deletion Recovery Level
 * Enum representing the deletion recovery level for secrets
 */
export type DeletionRecoveryLevel = 
  | 'Purgeable'
  | 'Recoverable+Purgeable'
  | 'Recoverable'
  | 'Recoverable+ProtectedSubscription'
  | 'CustomizedRecoverable+Purgeable'
  | 'CustomizedRecoverable'
  | 'CustomizedRecoverable+ProtectedSubscription';

/**
 * Azure Key Vault Error Response
 */
export interface KeyVaultErrorResponse {
  error: {
    code: string;
    message: string;
    innererror?: KeyVaultErrorResponse;
  };
}

/**
 * Custom error class for Azure Key Vault API errors
 */
export class KeyVaultError extends Error {
  public readonly statusCode: number;
  public readonly statusText: string;
  public readonly keyVaultError?: KeyVaultErrorResponse;

  constructor(
    statusCode: number,
    statusText: string,
    keyVaultError?: KeyVaultErrorResponse
  ) {
    const message = keyVaultError?.error?.message || `Key Vault API Error: ${statusCode} ${statusText}`;
    super(message);
    
    this.name = 'KeyVaultError';
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.keyVaultError = keyVaultError;
  }

  get errorCode(): string | undefined {
    return this.keyVaultError?.error?.code;
  }
}

/**
 * Azure Key Vault Controller
 * Provides methods to interact with Azure Key Vault APIs
 * Uses Fabric's Code.AccessAzureKeyvault.All scope for authentication
 */
export class AzureKeyVaultController extends FabricPlatformClient {
  private keyVaultBaseUrl: string = '';

  constructor(
    workloadClientOrAuthConfig?: WorkloadClientAPI | AuthenticationConfig,
    keyVaultUrl?: string,
    authConfig?: AuthenticationConfig
  ) {
    // Use Key Vault specific scopes
    const keyVaultScopes = FABRIC_BASE_SCOPES.CODE_ACCESS_KEYVAULT;
    
    super(workloadClientOrAuthConfig, keyVaultScopes, authConfig);
    
    if (keyVaultUrl) {
      this.setKeyVaultUrl(keyVaultUrl);
    }
  }

  /**
   * Set the Key Vault base URL
   * @param keyVaultUrl The Key Vault URL (e.g., https://myvault.vault.azure.net)
   */
  setKeyVaultUrl(keyVaultUrl: string): void {
    // Ensure the URL doesn't end with a slash
    this.keyVaultBaseUrl = keyVaultUrl.replace(/\/$/, '');
  }

  /**
   * Get the Key Vault base URL
   * @returns The configured Key Vault URL
   */
  getKeyVaultUrl(): string {
    return this.keyVaultBaseUrl;
  }

  /**
   * Get a secret from Azure Key Vault
   * @param secretName The name of the secret to retrieve
   * @param secretVersion Optional version of the secret. If not specified, gets the latest version
   * @returns Promise<KeyVaultSecretBundle> The secret bundle containing the secret value and metadata
   * 
   * @example
   * ```typescript
   * const controller = new AzureKeyVaultController(workloadClient, 'https://myvault.vault.azure.net');
   * 
   * // Get latest version of a secret
   * const secret = await controller.getSecret('my-secret-name');
   * console.log(secret.value); // The secret value
   * 
   * // Get specific version of a secret
   * const specificSecret = await controller.getSecret('my-secret-name', 'abc123version');
   * ```
   */
  async getSecret(secretName: string, secretVersion?: string): Promise<KeyVaultSecretBundle> {
    if (!this.keyVaultBaseUrl) {
      throw new Error('Key Vault URL must be set before making API calls. Use setKeyVaultUrl() method.');
    }

    if (!secretName) {
      throw new Error('Secret name is required');
    }

    // Construct the URL based on whether version is provided
    const versionPath = secretVersion ? `/${secretVersion}` : '';
    const url = `${this.keyVaultBaseUrl}/secrets/${encodeURIComponent(secretName)}${versionPath}`;
    
    try {
      const result = await this.makeKeyVaultRequest<KeyVaultSecretBundle>(url);
      return result;
    } catch (error) {
      if (error instanceof KeyVaultError) {
        throw error;
      }
      throw new KeyVaultError(500, 'Internal Error', { 
        error: { 
          code: 'InternalError', 
          message: `Failed to retrieve secret '${secretName}': ${(error as Error).message}` 
        } 
      });
    }
  }

  /**
   * Get the latest version of a secret (convenience method)
   * @param secretName The name of the secret to retrieve
   * @returns Promise<KeyVaultSecretBundle> The secret bundle
   */
  async getLatestSecret(secretName: string): Promise<KeyVaultSecretBundle> {
    return this.getSecret(secretName);
  }

  /**
   * Get just the secret value (convenience method)
   * @param secretName The name of the secret to retrieve
   * @param secretVersion Optional version of the secret
   * @returns Promise<string> The secret value
   */
  async getSecretValue(secretName: string, secretVersion?: string): Promise<string> {
    const secretBundle = await this.getSecret(secretName, secretVersion);
    return secretBundle.value;
  }

  /**
   * Check if a secret exists and is enabled
   * @param secretName The name of the secret to check
   * @param secretVersion Optional version of the secret
   * @returns Promise<boolean> True if the secret exists and is enabled
   */
  async secretExists(secretName: string, secretVersion?: string): Promise<boolean> {
    try {
      const secret = await this.getSecret(secretName, secretVersion);
      return secret.attributes.enabled;
    } catch (error) {
      if (error instanceof KeyVaultError && error.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Make an authenticated request to Azure Key Vault
   * Overrides the base makeRequest to work with Key Vault URLs and API version
   * @param url The full Key Vault URL
   * @param options RequestInit options
   * @returns Promise<T>
   */
  private async makeKeyVaultRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const accessToken = await this.getAccessToken();
      
      // Add API version query parameter if not already present
      const separator = url.includes('?') ? '&' : '?';
      const urlWithApiVersion = url.includes('api-version=') 
        ? url 
        : `${url}${separator}api-version=7.4`;
      
      const response = await fetch(urlWithApiVersion, {
        ...options,
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        let keyVaultError: KeyVaultErrorResponse | undefined;
        
        try {
          const errorText = await response.text();
          if (errorText) {
            const parsedError = JSON.parse(errorText) as KeyVaultErrorResponse;
            keyVaultError = parsedError;
          }
        } catch (parseError) {
          console.warn('Failed to parse Key Vault error response as JSON:', parseError);
        }
        
        throw new KeyVaultError(response.status, response.statusText, keyVaultError);
      }

      // Handle empty responses
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return undefined as unknown as T;
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof KeyVaultError) {
        console.error(`Key Vault API request failed for ${url}:`, {
          statusCode: error.statusCode,
          statusText: error.statusText,
          errorCode: error.errorCode,
          message: error.message
        });
        throw error;
      }
      
      console.error(`Key Vault API request failed for ${url}:`, error);
      throw error;
    }
  }

  /**
   * Helper method to validate Key Vault URL format
   * @param url The URL to validate
   * @returns boolean True if valid Key Vault URL format
   */
  static isValidKeyVaultUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname.endsWith('.vault.azure.net') || 
             parsedUrl.hostname.endsWith('.vault.usgovcloudapi.net') ||
             parsedUrl.hostname.endsWith('.vault.azure.cn');
    } catch {
      return false;
    }
  }

  /**
   * Extract vault name from Key Vault URL
   * @param url The Key Vault URL
   * @returns string The vault name
   */
  static extractVaultName(url: string): string {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname.split('.')[0];
    } catch {
      throw new Error('Invalid Key Vault URL format');
    }
  }
}
