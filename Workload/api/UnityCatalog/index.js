// Types for Unity Catalog API responses (matching the client types)
// These are just for documentation - no actual TypeScript enforcement

/**
 * Unity Catalog API Proxy Service
 * 
 * This service acts as a proxy between the frontend and Databricks Unity Catalog API,
 * solving CORS issues by making the API calls from the backend.
 */
// Types for Unity Catalog API responses (matching the client types)
// These are just for documentation - no actual TypeScript enforcement

/**
 * Unity Catalog API Proxy Service
 * 
 * This service acts as a proxy between the frontend and Databricks Unity Catalog API,
 * solving CORS issues by making the API calls from the backend.
 */
class UnityCatalogProxyService {
  async makeRequest(baseUrl, token, endpoint, method = 'GET', body) {
    const url = `${baseUrl}${endpoint}`;
    
    console.log(`[Unity Catalog] Making ${method} request to: ${url}`);
    if (body) {
      console.log(`[Unity Catalog] Request body:`, JSON.stringify(body, null, 2));
    }
    
    const headers = {
      'Authorization': `Bearer ${token.substring(0, 10)}...`, // Log partial token for security
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const requestOptions = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`, // Use full token for actual request
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    const startTime = Date.now();
    
    try {
      const response = await fetch(url, requestOptions);
      const duration = Date.now() - startTime;
      
      console.log(`[Unity Catalog] Response status: ${response.status} (${duration}ms)`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Unity Catalog] Error response:`, errorText);
        
        let errorData;
        
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
      const result = responseText ? JSON.parse(responseText) : {};
      
      console.log(`[Unity Catalog] Successful response received (${duration}ms):`, {
        endpoint,
        method,
        itemCount: result.items?.length || 'N/A',
        hasNextPageToken: !!result.next_page_token
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[Unity Catalog] Request failed after ${duration}ms:`, {
        url,
        method,
        error: error.message
      });
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Network error: ${String(error)}`);
    }
  }

  // Catalog operations
  async listCatalogs(baseUrl, token, maxResults, pageToken) {
    console.log(`[Unity Catalog] Listing catalogs - maxResults: ${maxResults}, pageToken: ${pageToken ? 'yes' : 'no'}`);
    
    const params = new URLSearchParams();
    if (maxResults) params.append('max_results', maxResults.toString());
    if (pageToken) params.append('page_token', pageToken);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.makeRequest(baseUrl, token, `/catalogs${query}`);
  }

  async getCatalog(baseUrl, token, catalogName) {
    console.log(`[Unity Catalog] Getting catalog: ${catalogName}`);
    return this.makeRequest(baseUrl, token, `/catalogs/${encodeURIComponent(catalogName)}`);
  }

  // Schema operations
  async listSchemas(baseUrl, token, catalogName, maxResults, pageToken) {
    console.log(`[Unity Catalog] Listing schemas in catalog: ${catalogName} - maxResults: ${maxResults}, pageToken: ${pageToken ? 'yes' : 'no'}`);
    
    const params = new URLSearchParams();
    params.append('catalog_name', catalogName);
    if (maxResults) params.append('max_results', maxResults.toString());
    if (pageToken) params.append('page_token', pageToken);
    
    return this.makeRequest(baseUrl, token, `/schemas?${params.toString()}`);
  }

  // Table operations
  async listTables(baseUrl, token, catalogName, schemaName, maxResults, pageToken) {
    console.log(`[Unity Catalog] Listing tables in ${catalogName}.${schemaName} - maxResults: ${maxResults}, pageToken: ${pageToken ? 'yes' : 'no'}`);
    
    const params = new URLSearchParams();
    params.append('catalog_name', catalogName);
    params.append('schema_name', schemaName);
    if (maxResults) params.append('max_results', maxResults.toString());
    if (pageToken) params.append('page_token', pageToken);
    
    return this.makeRequest(baseUrl, token, `/tables?${params.toString()}`);
  }

  // Helper method to get external tables
  async getExternalTables(baseUrl, token, catalogName, schemaNames) {
    console.log(`[Unity Catalog] Getting external tables from ${catalogName} - schemas: [${schemaNames.join(', ')}]`);
    
    const allTables = [];
    
    for (const schemaName of schemaNames) {
      console.log(`[Unity Catalog] Processing schema: ${catalogName}.${schemaName}`);
      
      try {
        let pageToken;
        let pageCount = 0;
        
        do {
          pageCount++;
          console.log(`[Unity Catalog] Fetching page ${pageCount} from ${catalogName}.${schemaName}`);
          
          const response = await this.listTables(baseUrl, token, catalogName, schemaName, 100, pageToken);
          if (response.items) {
            console.log(`[Unity Catalog] Found ${response.items.length} tables in ${catalogName}.${schemaName} (page ${pageCount})`);
            allTables.push(...response.items);
          }
          pageToken = response.next_page_token;
        } while (pageToken);
        
        console.log(`[Unity Catalog] Completed processing ${catalogName}.${schemaName} - total pages: ${pageCount}`);
        
      } catch (error) {
        console.warn(`[Unity Catalog] Failed to fetch tables from schema ${catalogName}.${schemaName}:`, error.message);
      }
    }
    
    const externalTables = allTables.filter(table => 
      table.table_type === 'EXTERNAL' && 
      table.data_source_format === 'DELTA' &&
      table.storage_location
    );
    
    console.log(`[Unity Catalog] External tables summary:`, {
      totalTables: allTables.length,
      externalDeltaTables: externalTables.length,
      schemas: schemaNames.length
    });
    
    return externalTables;
  }

  // Test connection
  async testConnection(baseUrl, token) {
    console.log(`[Unity Catalog] Testing connection to: ${baseUrl}`);
    
    try {
      await this.listCatalogs(baseUrl, token, 1);
      console.log(`[Unity Catalog] Connection test successful`);
      return true;
    } catch (error) {
      console.error(`[Unity Catalog] Connection test failed:`, error.message);
      return false;
    }
  }
}

const proxyService = new UnityCatalogProxyService();

// Configuration - you can set default values here
const DEFAULT_DATABRICKS_WORKSPACE = process.env.DATABRICKS_WORKSPACE_URL || '';

// Express route handlers
const testConnection = async (req, res) => {
  console.log(`[Unity Catalog API] POST /test-connection - Testing connection`);
  
  try {
    const { databricksWorkspace, databricksToken } = req.body;
    
    // Use provided workspace URL or fall back to default
    const workspaceUrl = databricksWorkspace || DEFAULT_DATABRICKS_WORKSPACE;
    
    console.log(`[Unity Catalog API] Workspace URL: ${workspaceUrl}`);
    console.log(`[Unity Catalog API] Token provided: ${databricksToken ? 'yes' : 'no'}`);
    
    if (!workspaceUrl || !databricksToken) {
      console.warn(`[Unity Catalog API] Missing required fields`);
      return res.status(400).json({
        error: 'Missing required fields: databricksWorkspace (or default) and databricksToken'
      });
    }

    const baseUrl = `${workspaceUrl.replace(/\/$/, '')}/api/2.1/unity-catalog`;
    const isConnected = await proxyService.testConnection(baseUrl, databricksToken);
    
    console.log(`[Unity Catalog API] Connection test result: ${isConnected ? 'SUCCESS' : 'FAILED'}`);
    res.json({ connected: isConnected });
  } catch (error) {
    console.error('[Unity Catalog API] Test connection error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

const listCatalogs = async (req, res) => {
  console.log(`[Unity Catalog API] POST /catalogs - Listing catalogs`);
  
  try {
    const { databricksWorkspace, databricksToken } = req.body;
    const { maxResults, pageToken } = req.query;
    
    console.log(`[Unity Catalog API] Request params - maxResults: ${maxResults}, pageToken: ${pageToken ? 'yes' : 'no'}`);
    
    if (!databricksWorkspace || !databricksToken) {
      console.warn(`[Unity Catalog API] Missing required fields for list catalogs`);
      return res.status(400).json({
        error: 'Missing required fields: databricksWorkspace and databricksToken'
      });
    }

    const baseUrl = `${databricksWorkspace.replace(/\/$/, '')}/api/2.1/unity-catalog`;
    const catalogs = await proxyService.listCatalogs(
      baseUrl, 
      databricksToken, 
      maxResults ? parseInt(maxResults) : undefined,
      pageToken
    );
    
    console.log(`[Unity Catalog API] Successfully retrieved ${catalogs.items?.length || 0} catalogs`);
    res.json(catalogs);
  } catch (error) {
    console.error('[Unity Catalog API] List catalogs error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

const listSchemas = async (req, res) => {
  console.log(`[Unity Catalog API] POST /schemas - Listing schemas`);
  
  try {
    const { databricksWorkspace, databricksToken, catalogName } = req.body;
    const { maxResults, pageToken } = req.query;
    
    console.log(`[Unity Catalog API] Request params - catalog: ${catalogName}, maxResults: ${maxResults}, pageToken: ${pageToken ? 'yes' : 'no'}`);
    
    if (!databricksWorkspace || !databricksToken || !catalogName) {
      console.warn(`[Unity Catalog API] Missing required fields for list schemas`);
      return res.status(400).json({
        error: 'Missing required fields: databricksWorkspace, databricksToken, and catalogName'
      });
    }

    const baseUrl = `${databricksWorkspace.replace(/\/$/, '')}/api/2.1/unity-catalog`;
    const schemas = await proxyService.listSchemas(
      baseUrl, 
      databricksToken, 
      catalogName,
      maxResults ? parseInt(maxResults) : undefined,
      pageToken
    );
    
    console.log(`[Unity Catalog API] Successfully retrieved ${schemas.items?.length || 0} schemas from catalog: ${catalogName}`);
    res.json(schemas);
  } catch (error) {
    console.error('[Unity Catalog API] List schemas error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

const listTables = async (req, res) => {
  console.log(`[Unity Catalog API] POST /tables - Listing tables`);
  
  try {
    const { databricksWorkspace, databricksToken, catalogName, schemaName } = req.body;
    const { maxResults, pageToken } = req.query;
    
    console.log(`[Unity Catalog API] Request params - catalog: ${catalogName}, schema: ${schemaName}, maxResults: ${maxResults}, pageToken: ${pageToken ? 'yes' : 'no'}`);
    
    if (!databricksWorkspace || !databricksToken || !catalogName || !schemaName) {
      console.warn(`[Unity Catalog API] Missing required fields for list tables`);
      return res.status(400).json({
        error: 'Missing required fields: databricksWorkspace, databricksToken, catalogName, and schemaName'
      });
    }

    const baseUrl = `${databricksWorkspace.replace(/\/$/, '')}/api/2.1/unity-catalog`;
    const tables = await proxyService.listTables(
      baseUrl, 
      databricksToken, 
      catalogName,
      schemaName,
      maxResults ? parseInt(maxResults) : undefined,
      pageToken
    );
    
    console.log(`[Unity Catalog API] Successfully retrieved ${tables.items?.length || 0} tables from ${catalogName}.${schemaName}`);
    res.json(tables);
  } catch (error) {
    console.error('[Unity Catalog API] List tables error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

const getExternalTables = async (req, res) => {
  console.log(`[Unity Catalog API] POST /external-tables - Getting external tables`);
  
  try {
    const { databricksWorkspace, databricksToken, catalogName, schemaNames } = req.body;
    
    console.log(`[Unity Catalog API] Request params - catalog: ${catalogName}, schemas: [${schemaNames?.join(', ') || 'none'}]`);
    
    if (!databricksWorkspace || !databricksToken || !catalogName || !schemaNames || !Array.isArray(schemaNames)) {
      console.warn(`[Unity Catalog API] Missing required fields for get external tables`);
      return res.status(400).json({
        error: 'Missing required fields: databricksWorkspace, databricksToken, catalogName, and schemaNames (array)'
      });
    }

    const baseUrl = `${databricksWorkspace.replace(/\/$/, '')}/api/2.1/unity-catalog`;
    const tables = await proxyService.getExternalTables(baseUrl, databricksToken, catalogName, schemaNames);
    
    console.log(`[Unity Catalog API] Successfully retrieved ${tables.length} external tables from ${schemaNames.length} schemas`);
    res.json({ items: tables });
  } catch (error) {
    console.error('[Unity Catalog API] Get external tables error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

module.exports = {
  testConnection,
  listCatalogs,
  listSchemas,
  listTables,
  getExternalTables
};
