import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { FabricPlatformClient } from "./FabricPlatformClient";
import { SCOPE_PAIRS } from "./FabricPlatformScopes";
import { 
  Connection, 
  CreateConnectionRequest, 
  UpdateConnectionRequest, 
  ListConnectionsResponse,
  AuthenticationConfig
} from "./FabricPlatformTypes";

/**
 * Fabric Connections API Client
 * Provides methods to interact with Fabric connections
 * 
 * Based on the official Fabric REST API:
 * https://learn.microsoft.com/en-us/rest/api/fabric/core/connections
 * 
 * Uses method-based scope selection:
 * - GET operations use read-only scopes
 * - POST/PUT/PATCH/DELETE operations use read-write scopes
 */
export class ConnectionClient extends FabricPlatformClient {
  constructor(workloadClientOrAuth: WorkloadClientAPI | AuthenticationConfig) {
    // Use scope pairs for method-based scope selection
    // GET operations will use CONNECTION_READ scopes, other operations will use CONNECTION scopes
    super(workloadClientOrAuth, SCOPE_PAIRS.CONNECTION);
  }

  /**
   * Get a specific connection by ID
   * @param connectionId The connection ID
   * @returns Promise resolving to the connection details
   */
  async getConnection(connectionId: string): Promise<Connection> {
    return this.get<Connection>(`/connections/${connectionId}`);
  }

  /**
   * List all connections
   * @param continuationToken Optional continuation token for pagination
   * @returns Promise resolving to the list of connections
   */
  async listConnections(continuationToken?: string): Promise<ListConnectionsResponse> {
    let endpoint = '/connections';
    
    if (continuationToken) {
      endpoint += `?continuationToken=${encodeURIComponent(continuationToken)}`;
    }
    
    return this.get<ListConnectionsResponse>(endpoint);
  }

  /**
   * Get all connections (handles pagination automatically)
   * @returns Promise resolving to all connections
   */
  async getAllConnections(): Promise<Connection[]> {
    return this.getAllPages<Connection>('/connections');
  }

  /**
   * Create a new connection
   * @param connectionRequest The connection creation request
   * @returns Promise resolving to the created connection
   */
  async createConnection(connectionRequest: CreateConnectionRequest): Promise<Connection> {
    return this.post<Connection>('/connections', connectionRequest);
  }

  /**
   * Update an existing connection
   * @param connectionId The connection ID to update
   * @param updateRequest The update request payload
   * @returns Promise resolving to the updated connection
   */
  async updateConnection(connectionId: string, updateRequest: UpdateConnectionRequest): Promise<Connection> {
    return this.patch<Connection>(`/connections/${connectionId}`, updateRequest);
  }

  /**
   * Delete a connection
   * @param connectionId The connection ID to delete
   * @returns Promise resolving when the connection is deleted
   */
  async deleteConnection(connectionId: string): Promise<void> {
    return this.delete<void>(`/connections/${connectionId}`);
  }

  /**
   * Get connections by type
   * @param connectionType The type of connections to filter by
   * @returns Promise resolving to connections of the specified type
   */
  async getConnectionsByType(connectionType: string): Promise<Connection[]> {
    const allConnections = await this.getAllConnections();
    return allConnections.filter(conn => conn.connectionDetails.type === connectionType);
  }

  /**
   * Search connections by display name
   * @param searchTerm The search term to match against display names
   * @returns Promise resolving to matching connections
   */
  async searchConnectionsByName(searchTerm: string): Promise<Connection[]> {
    const allConnections = await this.getAllConnections();
    return allConnections.filter(conn => 
      conn.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}
