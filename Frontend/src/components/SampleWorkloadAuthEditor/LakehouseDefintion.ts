export interface ApiParam {
    key: string;
    label: string;
    type: 'text' | 'checkbox';
    in: 'path' | 'body' | 'query' | 'header'; // Specify where the parameter should be included
    description?: string;
  }

export interface ApiDefinition {
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';
  endpoint: string;
  params: ApiParam[];
  bodySchema?: any; // Optional schema for the request body
}

export interface ApiCategories {
  [category: string]: ApiDefinition[];
}

export const LakehouseApi: ApiDefinition[] = [
    {
      name: 'Create Lakehouse',
      description: 'Create a new lakehouse in the workspace',
      method: 'POST',
      endpoint: '/v1/workspaces/{workspaceId}/lakehouses',
      params: [
        { key: 'workspaceId', label: 'Workspace ID', type: 'text', in: 'path' },
      ],
      bodySchema: {
            "displayName": "Lakehouse_1",
            "description": "A lakehouse description"
      },
    },
    {
      name: 'Delete Lakehouse',
      description: 'Delete a lakehouse in the workspace',
      method: 'DELETE',
      endpoint: '/v1/workspaces/{workspaceId}/lakehouses/{lakehouseId}',
      params: [
        { key: 'workspaceId', label: 'Workspace ID', type: 'text', in: 'path' },
        { key: 'lakehouseId', label: 'Lakehouse ID', type: 'text', in: 'path' },
      ],
    },
    {
        name: 'Get Lakehouse',
        description: 'Get a lakehouse in the workspace',
        method: 'GET',
        endpoint: '/v1/workspaces/{workspaceId}/lakehouses/{lakehouseId}',
        params: [
          { key: 'workspaceId', label: 'Workspace ID', type: 'text', in: 'path' },
          { key: 'lakehouseId', label: 'Lakehouse ID', type: 'text', in: 'path' },
        ],
      },
      {
        name: 'List Lakehouses',
        description: 'List all lakehouses in the workspace',
        method: 'GET',
        endpoint: '/v1/workspaces/{workspaceId}/lakehouses',
        params: [
          { key: 'workspaceId', label: 'Workspace ID', type: 'text', in: 'path' }
        ],
      },
      {
        name: 'Update Lakehouses',
        description: 'Update a lakehouse in the workspace',
        method: 'PATCH',
        endpoint: '/v1/workspaces/{workspaceId}/lakehouses',
        params: [
          { key: 'workspaceId', label: 'Workspace ID', type: 'text', in: 'path' },
          { key: 'lakehouseId', label: 'Lakehouse ID', type: 'text', in: 'path' },
        ],
        bodySchema: {
            "displayName": "Lakehouse_1",
            "description": "A lakehouse description"
        }
      },
      {
        name: 'List Lakehouse Tables',
        description: 'Returns a list of lakehouse Tables.',
        method: 'GET',
        endpoint: '/v1/workspaces/{workspaceId}/lakehouses/{lakehouseId}/tables',
        params: [
          {
            key: 'workspaceId',
            label: 'Workspace ID',
            type: 'text',
            in: 'path',
          },
          {
            key: 'lakehouseId',
            label: 'Lakehouse ID',
            type: 'text',
            in: 'path',
          }
        ],
      },
      {
        name: 'Load Table',
        description: 'Starts a load table operation and returns the operation status URL in the response location header.',
        method: 'POST',
        endpoint: '/v1/workspaces/{workspaceId}/lakehouses/{lakehouseId}/tables/{tableName}/load',
        params: [
          {
            key: 'workspaceId',
            label: 'Workspace ID',
            type: 'text',
            in: 'path',
          },
          {
            key: 'lakehouseId',
            label: 'Lakehouse ID',
            type: 'text',
            in: 'path',
          },
          {
            key: 'tableName',
            label: 'Table Name',
            type: 'text',
            in: 'path',
          },
        ],
        bodySchema: {
            "relativePath": "Files/abc/abc123.csv",
            "pathType": "File",
            "mode": "Overwrite",
            "recursive": false,
            "formatOptions": {
              "format": "Csv",
              "header": true,
              "delimiter": ","
            }
          }
      }
];

export interface ApiParameters {
  [key: string]: string | boolean;
}