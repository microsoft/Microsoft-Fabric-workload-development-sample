import { UnityCatalogConfig } from './UnityCatalogItemModel';

// Types for Unity Catalog API responses
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

export interface VolumeInfo {
  name: string;
  catalog_name: string;
  schema_name: string;
  volume_type: 'MANAGED' | 'EXTERNAL';
  storage_location?: string;
  comment?: string;
  created_at?: number;
  updated_at?: number;
  created_by?: string;
  updated_by?: string;
  volume_id?: string;
}

export interface FunctionInfo {
  name: string;
  catalog_name: string;
  schema_name: string;
  input_params: FunctionParameterInfo[];
  data_type: string;
  full_data_type: string;
  return_params?: FunctionParameterInfo[];
  routine_body: 'SQL' | 'EXTERNAL';
  routine_definition?: string;
  routine_dependencies?: DependencyInfo[];
  parameter_style: 'S';
  is_deterministic: boolean;
  sql_data_access: 'CONTAINS_SQL' | 'READS_SQL_DATA' | 'NO_SQL';
  is_null_call: boolean;
  security_type: 'DEFINER';
  specific_name: string;
  comment?: string;
  properties?: Record<string, string>;
  created_at?: number;
  updated_at?: number;
  created_by?: string;
  updated_by?: string;
  function_id?: string;
}

export interface FunctionParameterInfo {
  name: string;
  type_name: string;
  type_text: string;
  type_json: string;
  type_precision?: number;
  type_scale?: number;
  type_interval_type?: string;
  position: number;
  parameter_mode: 'IN';
  parameter_type: 'PARAM' | 'COLUMN';
  parameter_default?: string;
  comment?: string;
}

export interface DependencyInfo {
  table?: TableDependency;
  function?: FunctionDependency;
}

export interface TableDependency {
  table_full_name: string;
}

export interface FunctionDependency {
  function_full_name: string;
}

// API Response wrappers
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

export interface ApiError {
  error_code: string;
  message: string;
  details?: Array<{
    '@type': string;
    [key: string]: any;
  }>;
}

/**
 * Unity Catalog API Client
 * 
 * This client provides methods to interact with Unity Catalog API endpoints
 * for managing catalogs, schemas, tables, volumes, and functions.
 */
export class UnityCatalogAPIClient {
  private baseUrl: string;
  private token: string;
  private headers: Record<string, string>;

  constructor(config: UnityCatalogConfig) {
    // Extract the base URL from the workspace URL
    // Format: https://workspace.cloud.databricks.com -> https://workspace.cloud.databricks.com/api/2.1/unity-catalog
    this.baseUrl = `${config.databrickURL.replace(/\/$/, '')}/api/2.1/unity-catalog`;
    this.token = config.databricksToken;
    this.headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Make HTTP request to Unity Catalog API
   */
  private async makeRequest<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const requestOptions: RequestInit = {
      method,
      headers: this.headers,
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData: ApiError;
        
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = {
            error_code: `HTTP_${response.status}`,
            message: errorText || response.statusText
          };
        }
        
        throw new Error(`Unity Catalog API Error: ${errorData.error_code} - ${errorData.message}`);
      }

      const responseText = await response.text();
      return responseText ? JSON.parse(responseText) : ({} as T);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Network error: ${String(error)}`);
    }
  }

  // Catalog Operations
  
  /**
   * List all catalogs
   */
  async listCatalogs(maxResults?: number, pageToken?: string): Promise<CatalogListResponse> {
    const params = new URLSearchParams();
    if (maxResults) params.append('max_results', maxResults.toString());
    if (pageToken) params.append('page_token', pageToken);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.makeRequest<ListResponse<CatalogInfo>>(`/catalogs${query}`);
  }

  /**
   * Get catalog by name
   */
  async getCatalog(catalogName: string): Promise<CatalogInfo> {
    return this.makeRequest<CatalogInfo>(`/catalogs/${encodeURIComponent(catalogName)}`);
  }

  /**
   * Create a new catalog
   */
  async createCatalog(catalog: Partial<CatalogInfo>): Promise<CatalogInfo> {
    return this.makeRequest<CatalogInfo>('/catalogs', 'POST', catalog);
  }

  /**
   * Update catalog
   */
  async updateCatalog(catalogName: string, catalog: Partial<CatalogInfo>): Promise<CatalogInfo> {
    return this.makeRequest<CatalogInfo>(`/catalogs/${encodeURIComponent(catalogName)}`, 'PATCH', catalog);
  }

  /**
   * Delete catalog
   */
  async deleteCatalog(catalogName: string, force?: boolean): Promise<void> {
    const params = force ? '?force=true' : '';
    return this.makeRequest<void>(`/catalogs/${encodeURIComponent(catalogName)}${params}`, 'DELETE');
  }

  // Schema Operations

  /**
   * List schemas in a catalog
   */
  async listSchemas(catalogName: string, maxResults?: number, pageToken?: string): Promise<SchemaListResponse> {
    const params = new URLSearchParams();
    params.append('catalog_name', catalogName);
    if (maxResults) params.append('max_results', maxResults.toString());
    if (pageToken) params.append('page_token', pageToken);
    
    return this.makeRequest<ListResponse<SchemaInfo>>(`/schemas?${params.toString()}`);
  }

  /**
   * Get schema by name
   */
  async getSchema(fullName: string): Promise<SchemaInfo> {
    return this.makeRequest<SchemaInfo>(`/schemas/${encodeURIComponent(fullName)}`);
  }

  /**
   * Create a new schema
   */
  async createSchema(schema: Partial<SchemaInfo>): Promise<SchemaInfo> {
    return this.makeRequest<SchemaInfo>('/schemas', 'POST', schema);
  }

  /**
   * Update schema
   */
  async updateSchema(fullName: string, schema: Partial<SchemaInfo>): Promise<SchemaInfo> {
    return this.makeRequest<SchemaInfo>(`/schemas/${encodeURIComponent(fullName)}`, 'PATCH', schema);
  }

  /**
   * Delete schema
   */
  async deleteSchema(fullName: string, force?: boolean): Promise<void> {
    const params = force ? '?force=true' : '';
    return this.makeRequest<void>(`/schemas/${encodeURIComponent(fullName)}${params}`, 'DELETE');
  }

  // Table Operations

  /**
   * List tables in a schema
   */
  async listTables(catalogName: string, schemaName: string, maxResults?: number, pageToken?: string): Promise<TableListResponse> {
    const params = new URLSearchParams();
    params.append('catalog_name', catalogName);
    params.append('schema_name', schemaName);
    if (maxResults) params.append('max_results', maxResults.toString());
    if (pageToken) params.append('page_token', pageToken);
    
    return this.makeRequest<ListResponse<TableInfo>>(`/tables?${params.toString()}`);
  }

  /**
   * Get table by name
   */
  async getTable(fullName: string): Promise<TableInfo> {
    return this.makeRequest<TableInfo>(`/tables/${encodeURIComponent(fullName)}`);
  }

  /**
   * Create a new table
   */
  async createTable(table: Partial<TableInfo>): Promise<TableInfo> {
    return this.makeRequest<TableInfo>('/tables', 'POST', table);
  }

  /**
   * Delete table
   */
  async deleteTable(fullName: string): Promise<void> {
    return this.makeRequest<void>(`/tables/${encodeURIComponent(fullName)}`, 'DELETE');
  }

  // Volume Operations

  /**
   * List volumes in a schema
   */
  async listVolumes(catalogName: string, schemaName: string, maxResults?: number, pageToken?: string): Promise<ListResponse<VolumeInfo>> {
    const params = new URLSearchParams();
    params.append('catalog_name', catalogName);
    params.append('schema_name', schemaName);
    if (maxResults) params.append('max_results', maxResults.toString());
    if (pageToken) params.append('page_token', pageToken);
    
    return this.makeRequest<ListResponse<VolumeInfo>>(`/volumes?${params.toString()}`);
  }

  /**
   * Get volume by name
   */
  async getVolume(fullName: string): Promise<VolumeInfo> {
    return this.makeRequest<VolumeInfo>(`/volumes/${encodeURIComponent(fullName)}`);
  }

  /**
   * Create a new volume
   */
  async createVolume(volume: Partial<VolumeInfo>): Promise<VolumeInfo> {
    return this.makeRequest<VolumeInfo>('/volumes', 'POST', volume);
  }

  /**
   * Update volume
   */
  async updateVolume(fullName: string, volume: Partial<VolumeInfo>): Promise<VolumeInfo> {
    return this.makeRequest<VolumeInfo>(`/volumes/${encodeURIComponent(fullName)}`, 'PATCH', volume);
  }

  /**
   * Delete volume
   */
  async deleteVolume(fullName: string): Promise<void> {
    return this.makeRequest<void>(`/volumes/${encodeURIComponent(fullName)}`, 'DELETE');
  }

  // Function Operations

  /**
   * List functions in a schema
   */
  async listFunctions(catalogName: string, schemaName: string, maxResults?: number, pageToken?: string): Promise<ListResponse<FunctionInfo>> {
    const params = new URLSearchParams();
    params.append('catalog_name', catalogName);
    params.append('schema_name', schemaName);
    if (maxResults) params.append('max_results', maxResults.toString());
    if (pageToken) params.append('page_token', pageToken);
    
    return this.makeRequest<ListResponse<FunctionInfo>>(`/functions?${params.toString()}`);
  }

  /**
   * Get function by name
   */
  async getFunction(fullName: string): Promise<FunctionInfo> {
    return this.makeRequest<FunctionInfo>(`/functions/${encodeURIComponent(fullName)}`);
  }

  /**
   * Create a new function
   */
  async createFunction(func: Partial<FunctionInfo>): Promise<FunctionInfo> {
    return this.makeRequest<FunctionInfo>('/functions', 'POST', func);
  }

  /**
   * Update function
   */
  async updateFunction(fullName: string, func: Partial<FunctionInfo>): Promise<FunctionInfo> {
    return this.makeRequest<FunctionInfo>(`/functions/${encodeURIComponent(fullName)}`, 'PATCH', func);
  }

  /**
   * Delete function
   */
  async deleteFunction(fullName: string, force?: boolean): Promise<void> {
    const params = force ? '?force=true' : '';
    return this.makeRequest<void>(`/functions/${encodeURIComponent(fullName)}${params}`, 'DELETE');
  }

  // Helper Methods

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

  /**
   * Get external tables only (for creating shortcuts)
   */
  async getExternalTables(catalogName: string, schemaNames: string[]): Promise<TableInfo[]> {
    const allTables = await this.getAllTables(catalogName, schemaNames);
    return allTables.filter(table => 
      table.table_type === 'EXTERNAL' && 
      table.data_source_format === 'DELTA' &&
      table.storage_location
    );
  }

  /**
   * Test connection to Unity Catalog
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.listCatalogs(1);
      return true;
    } catch (error) {
      console.error('Unity Catalog connection test failed:', error);
      return false;
    }
  }

  /**
   * Get catalog metadata including schemas and table counts
   */
  async getCatalogMetadata(catalogName: string): Promise<{
    catalog: CatalogInfo;
    schemas: SchemaInfo[];
    tableCount: number;
  }> {
    const [catalog, schemasResponse] = await Promise.all([
      this.getCatalog(catalogName),
      this.listSchemas(catalogName)
    ]);

    const schemas = schemasResponse.schemas || [];
    
    // Get table count across all schemas
    let tableCount = 0;
    for (const schema of schemas) {
      try {
        const tablesResponse = await this.listTables(catalogName, schema.name, 1);
        // This is a rough estimate - in a real implementation you might want to paginate through all
        tableCount += tablesResponse.tables?.length || 0;
      } catch (error) {
        console.warn(`Failed to count tables in schema ${schema.name}:`, error);
      }
    }

    return {
      catalog,
      schemas,
      tableCount
    };
  }
}