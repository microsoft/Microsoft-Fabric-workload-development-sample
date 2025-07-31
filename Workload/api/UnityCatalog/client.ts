import { UnityCatalogConfig } from '../../app/items/UnityCatalogItem/UnityCatalogItemModel';

// Types (matching the original client types)
export interface CatalogInfo {
  name: string;
  comment?: string;
  properties?: Record<string, string>;
  created_at?: number;
  updated_at?: number;
  created_by?: string;
  updated_by?: string;
}

export interface SchemaInfo {
  name: string;
  catalog_name: string;
  comment?: string;
  properties?: Record<string, string>;
  full_name: string;
  created_at?: number;
  updated_at?: number;
  created_by?: string;
  updated_by?: string;
}

export interface TableInfo {
  name: string;
  catalog_name: string;
  schema_name: string;
  table_type: 'MANAGED' | 'EXTERNAL';
  data_source_format?: 'DELTA' | 'CSV' | 'JSON' | 'AVRO' | 'PARQUET' | 'ORC' | 'TEXT';
  columns?: ColumnInfo[];
  storage_location?: string;
  comment?: string;
  properties?: Record<string, string>;
  owner?: string;
  created_at?: number;
  updated_at?: number;
  created_by?: string;
  updated_by?: string;
  table_id?: string;
}

export interface ColumnInfo {
  name: string;
  type_name: string;
  type_text: string;
  type_json: string;
  type_precision?: number;
  type_scale?: number;
  type_interval_type?: string;
  position: number;
  comment?: string;
  nullable?: boolean;
  partition_index?: number;
}

export interface ListResponse<T> {
  items?: T[];
  next_page_token?: string;
}

export interface CatalogListResponse {
  catalogs?: CatalogInfo[];
  next_page_token?: string;
}

export interface SchemaListResponse {
  schemas?: SchemaInfo[];
  next_page_token?: string;
}

export interface TableListResponse {
  tables?: TableInfo[];
  next_page_token?: string;
}

/**
 * Unity Catalog Proxy Client
 * 
 * This client uses the backend proxy API to avoid CORS issues when calling Databricks Unity Catalog API.
 */
export class UnityCatalogProxyClient {
  private config: UnityCatalogConfig;
  private baseProxyUrl: string;

  constructor(config: UnityCatalogConfig, baseProxyUrl: string) {
    this.config = config;
    this.baseProxyUrl = baseProxyUrl;
  }

  private async makeProxyRequest<T>(endpoint: string, body: any, params?: URLSearchParams): Promise<T> {
    const url = params ? `${this.baseProxyUrl}${endpoint}?${params.toString()}` : `${this.baseProxyUrl}${endpoint}`;
    
    const requestBody = {
      databricksWorkspace: this.config.databrickURL,
      databricksToken: this.config.databricksToken,
      ...body
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || response.statusText };
        }
        
        throw new Error(`Proxy API Error: ${errorData.error || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Network error: ${String(error)}`);
    }
  }

  /**
   * Test connection to Unity Catalog
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.makeProxyRequest<{ connected: boolean }>('/test-connection', {});
      return result.connected;
    } catch (error) {
      console.error('Unity Catalog connection test failed:', error);
      return false;
    }
  }

  /**
   * List all catalogs
   */
  async listCatalogs(maxResults?: number, pageToken?: string): Promise<CatalogListResponse> {
    const params = new URLSearchParams();
    if (maxResults) params.append('maxResults', maxResults.toString());
    if (pageToken) params.append('pageToken', pageToken);

    return this.makeProxyRequest<CatalogListResponse>('/catalogs', {}, params.toString() ? params : undefined);
  }

  /**
   * List schemas in a catalog
   */
  async listSchemas(catalogName: string, maxResults?: number, pageToken?: string): Promise<SchemaListResponse> {
    const params = new URLSearchParams();
    if (maxResults) params.append('maxResults', maxResults.toString());
    if (pageToken) params.append('pageToken', pageToken);

    return this.makeProxyRequest<SchemaListResponse>('/schemas', { catalogName }, params.toString() ? params : undefined);
  }

  /**
   * List tables in a schema
   */
  async listTables(catalogName: string, schemaName: string, maxResults?: number, pageToken?: string): Promise<TableListResponse> {
    const params = new URLSearchParams();
    if (maxResults) params.append('maxResults', maxResults.toString());
    if (pageToken) params.append('pageToken', pageToken);

    return this.makeProxyRequest<TableListResponse>('/tables', { catalogName, schemaName }, params.toString() ? params : undefined);
  }

  /**
   * Get external tables only (for creating shortcuts)
   */
  async getExternalTables(catalogName: string, schemaNames: string[]): Promise<TableInfo[]> {
    const result = await this.makeProxyRequest<{ items: TableInfo[] }>('/external-tables', { catalogName, schemaNames });
    return result.items || [];
  }

  /**
   * Get all tables across multiple schemas
   */
  async getAllTables(catalogName: string, schemaNames: string[]): Promise<TableInfo[]> {
    const allTables: TableInfo[] = [];
    
    for (const schemaName of schemaNames) {
      try {
        let pageToken: string | undefined;
        
        do {
          const response = await this.listTables(catalogName, schemaName, 100, pageToken);
          if (response.tables) {
            allTables.push(...response.tables);
          }
          pageToken = response.next_page_token;
        } while (pageToken);
        
      } catch (error) {
        console.warn(`Failed to fetch tables from schema ${catalogName}.${schemaName}:`, error);
      }
    }
    
    return allTables;
  }
}
