import { WorkloadClientAPI, AccessToken } from "@ms-fabric/workload-client";
import { EnvironmentConstants } from "../../constants";
import { SCOPES } from "./FabricPlatformScopes";
import { FabricAuthenticationService } from "./FabricAuthenticationService";
import { AuthenticationConfig, ErrorResponse } from "./FabricPlatformTypes";

/**
 * Custom error class for Fabric Platform API errors
 * Includes structured error information from the API response
 */
export class FabricPlatformError extends Error {
  public readonly statusCode: number;
  public readonly statusText: string;
  public readonly errorResponse?: ErrorResponse;
  public readonly requestId?: string;

  constructor(
    statusCode: number,
    statusText: string,
    errorResponse?: ErrorResponse,
    requestId?: string,
    originalError?: Error
  ) {
    const message = errorResponse?.error?.message || `HTTP ${statusCode}: ${statusText}`;
    super(message);
    
    this.name = 'FabricPlatformError';
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.errorResponse = errorResponse;
    this.requestId = requestId;
    
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FabricPlatformError);
    }
    
    // Include original error stack if available
    if (originalError?.stack) {
      this.stack += '\nCaused by: ' + originalError.stack;
    }
  }

  /**
   * Get the error code from the error response
   */
  get errorCode(): string | undefined {
    return this.errorResponse?.error?.code;
  }

  /**
   * Get the error details from the error response
   */
  get errorDetails(): any[] | undefined {
    return this.errorResponse?.error?.details;
  }

  /**
   * Convert to a plain object for logging/serialization
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      statusText: this.statusText,
      errorCode: this.errorCode,
      errorResponse: this.errorResponse,
      requestId: this.requestId,
      stack: this.stack
    };
  }
}

/**
 * Abstract base class for Fabric Platform API Clients
 * Provides common HTTP client functionality with authentication
 */
export abstract class FabricPlatformClient {
  protected workloadClient?: WorkloadClientAPI;
  protected baseUrl: string = EnvironmentConstants.FabricApiBaseUrl;
  protected scopes: string;
  protected authService: FabricAuthenticationService;

  constructor(
    workloadClientOrAuthConfig?: WorkloadClientAPI | AuthenticationConfig, 
    customScopes?: string,
    authConfig?: AuthenticationConfig
  ) {
    // Handle different constructor signatures
    if (workloadClientOrAuthConfig && 'type' in workloadClientOrAuthConfig) {
      // First parameter is AuthenticationConfig
      this.authService = new FabricAuthenticationService(undefined, workloadClientOrAuthConfig);
      this.scopes = customScopes || SCOPES.DEFAULT;
    } else {
      // First parameter is WorkloadClientAPI (legacy behavior)
      this.workloadClient = workloadClientOrAuthConfig as WorkloadClientAPI;
      this.scopes = customScopes || SCOPES.DEFAULT;
      this.authService = new FabricAuthenticationService(this.workloadClient, authConfig);
    }
  }

  /**
   * Get an authenticated access token for Fabric API calls
   * @returns Promise<AccessToken>
   */
  protected async getAccessToken(): Promise<AccessToken> {
    return this.authService.acquireAccessToken(this.scopes);
  }

  /**
   * Make an authenticated HTTP request to the Fabric API
   * @param url The endpoint URL (can be relative or absolute)
   * @param options RequestInit options
   * @returns Promise<T>
   */
  protected async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const accessToken = await this.getAccessToken();
      
      // Construct full URL if relative path provided
      const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}/v1${url}`;
      
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorResponse: ErrorResponse | undefined;
        let requestId: string | undefined;
        
        try {
          // Try to parse the error response as JSON
          const errorText = await response.text();
          if (errorText) {
            errorResponse = JSON.parse(errorText) as ErrorResponse;
          }
        } catch (parseError) {
          // If parsing fails, we'll just use the status text
          console.warn('Failed to parse error response as JSON:', parseError);
        }
        
        // Extract request ID from headers if available
        requestId = response.headers.get('x-ms-request-id') || 
                   response.headers.get('request-id') || 
                   response.headers.get('x-request-id') ||
                   undefined;
        
        throw new FabricPlatformError(
          response.status,
          response.statusText,
          errorResponse,
          requestId
        );
      }

      // Handle empty responses (like 204 No Content)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return undefined as unknown as T;
      }

      const result = await response.json();
      return result;
    } catch (error) {
      // If it's already a FabricPlatformError, re-throw it
      if (error instanceof FabricPlatformError) {
        console.error(`Fabric API request failed for ${url}:`, error.toJSON());
        throw error;
      }
      
      // For other errors (network issues, etc.), wrap them
      console.error(`API request failed for ${url}:`, error);
      throw error;
    }
  }

  /**
   * GET request helper
   * @param endpoint The API endpoint
   * @returns Promise<T>
   */
  protected get<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request helper
   * @param endpoint The API endpoint
   * @param data The request body
   * @returns Promise<T>
   */
  protected post<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request helper
   * @param endpoint The API endpoint
   * @param data The request body
   * @returns Promise<T>
   */
  protected patch<T>(endpoint: string, data: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request helper
   * @param endpoint The API endpoint
   * @param data The request body
   * @returns Promise<T>
   */
  protected put<T>(endpoint: string, data: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request helper
   * @param endpoint The API endpoint
   * @returns Promise<T>
   */
  protected delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Helper to handle paginated responses automatically
   * @param endpoint The API endpoint
   * @returns Promise<T[]>
   */
  protected async getAllPages<T>(endpoint: string): Promise<T[]> {
    const allItems: T[] = [];
    let continuationToken: string | undefined;
    
    do {
      const url = continuationToken 
        ? `${endpoint}${endpoint.includes('?') ? '&' : '?'}continuationToken=${encodeURIComponent(continuationToken)}`
        : endpoint;
        
      const response: any = await this.get(url);
      
      if (response.value && Array.isArray(response.value)) {
        allItems.push(...response.value);
        continuationToken = response.continuationToken;
      } else if (Array.isArray(response)) {
        // Some endpoints return arrays directly
        allItems.push(...response);
        break;
      } else {
        // Single item response
        allItems.push(response);
        break;
      }
    } while (continuationToken);
    
    return allItems;
  }

  // ============================
  // Scope Management Utilities
  // ============================

  /**
   * Get the current scopes being used by this client
   * @returns string The current scopes
   */
  protected getCurrentScopes(): string {
    return this.scopes;
  }

  /**
   * Create a new client instance with additional scopes
   * @param additionalScopes Additional scopes to include
   * @returns string Combined scopes
   */
  protected combineScopes(additionalScopes: string): string {
    const currentScopesArray = this.scopes.split(' ');
    const additionalScopesArray = additionalScopes.split(' ');
    const combinedScopes = [...new Set([...currentScopesArray, ...additionalScopesArray])];
    return combinedScopes.join(' ');
  }

  // ============================
  // Authentication Configuration Utilities
  // ============================

  /**
   * Update the authentication configuration at runtime
   * @param authConfig New authentication configuration
   */
  updateAuthenticationConfig(authConfig: AuthenticationConfig): void {
    this.authService.updateAuthConfig(authConfig);
  }

  /**
   * Update the WorkloadClient (for user token authentication)
   * @param workloadClient New WorkloadClientAPI instance
   */
  updateWorkloadClient(workloadClient: WorkloadClientAPI): void {
    this.workloadClient = workloadClient;
    this.authService.updateWorkloadClient(workloadClient);
  }

  /**
   * Check if the client is configured for service principal authentication
   * @returns boolean
   */
  isServicePrincipalAuth(): boolean {
    return this.authService.isServicePrincipalAuth();
  }

  /**
   * Check if the client is configured for user token authentication
   * @returns boolean
   */
  isUserTokenAuth(): boolean {
    return this.authService.isUserTokenAuth();
  }

  // ============================
  // Factory Methods
  // ============================

  /**
   * Create a client instance with service principal authentication
   * @param servicePrincipalConfig Service principal configuration
   * @param customScopes Optional custom scopes
   * @returns Configured authentication config
   */
  static createServicePrincipalAuth(
    clientId: string,
    clientSecret: string,
    tenantId: string,
    authority?: string
  ): AuthenticationConfig {
    return {
      type: 'ServicePrincipal',
      servicePrincipal: {
        clientId,
        clientSecret,
        tenantId,
        authority
      }
    };
  }

  /**
   * Create a client instance with user token authentication
   * @returns Configured authentication config
   */
  static createUserTokenAuth(): AuthenticationConfig {
    return {
      type: 'UserToken'
    };
  }

  /**
   * Create a client instance with custom token authentication
   * @param token Pre-acquired access token
   * @returns Configured authentication config
   */
  static createCustomTokenAuth(token: string): AuthenticationConfig {
    return {
      type: 'UserToken',
      customToken: token
    };
  }
}
