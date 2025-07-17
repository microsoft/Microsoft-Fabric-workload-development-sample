import { WorkloadClientAPI, AccessToken } from "@ms-fabric/workload-client";
import { EnvironmentConstants } from "../../constants";
import { callAcquireFrontendAccessToken } from "../../implementation/controller/AuthenticationController";

// Define comprehensive Fabric API scopes for platform operations
const FABRIC_PLATFORM_SCOPES = [
  "https://api.fabric.microsoft.com/Item.ReadWrite.All",
  "https://api.fabric.microsoft.com/Workspace.ReadWrite.All", 
  "https://api.fabric.microsoft.com/Capacity.ReadWrite.All",
  "https://api.fabric.microsoft.com/OneLake.ReadWrite.All"
].join(" ");

/**
 * Abstract base class for Fabric Platform API controllers
 * Provides common HTTP client functionality with authentication
 */
export abstract class FabricPlatformClient {
  protected workloadClient: WorkloadClientAPI;
  protected baseUrl: string = EnvironmentConstants.FabricApiBaseUrl;

  constructor(workloadClient: WorkloadClientAPI) {
    this.workloadClient = workloadClient;
  }

  /**
   * Get an authenticated access token for Fabric API calls
   * @returns Promise<AccessToken>
   */
  protected async getAccessToken(): Promise<AccessToken> {
    return callAcquireFrontendAccessToken(this.workloadClient, FABRIC_PLATFORM_SCOPES);
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
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText}. ${errorText}`);
      }

      // Handle empty responses (like 204 No Content)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return undefined as unknown as T;
      }

      const result = await response.json();
      return result;
    } catch (error) {
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
}
