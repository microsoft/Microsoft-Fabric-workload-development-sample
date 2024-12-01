export interface ApiParam {
    key: string;
    label: string;
    type: 'text' | 'checkbox' | 'dropdown' | 'object';
    in: 'path' | 'body' | 'query' | 'header'; // Specify where the parameter should be included
    description?: string;
    required?: boolean;
    options?: string[];
    default?: string;
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
        { key: 'workspaceId', label: 'Workspace ID', type: 'text', in: 'path', description: 'The ID of the workspace' },
        { key: 'displayName', label: 'Display Name', type: 'text', in: 'body', description: 'The lakehouse display name. The display name must follow naming rules according to item type.' },
        { key: 'description', label: 'description', type: 'text', in: 'body', description: 'The lakehouse description. Maximum length is 256 characters.' }
      ],
    },
    {
      name: 'Delete Lakehouse',
      description: 'Delete a lakehouse in the workspace',
      method: 'DELETE',
      endpoint: '/v1/workspaces/{workspaceId}/lakehouses/{lakehouseId}',
      params: [
        { key: 'workspaceId', label: 'Workspace ID', type: 'text', in: 'path', description: 'The ID of the workspace' },
        { key: 'lakehouseId', label: 'Lakehouse ID', type: 'text', in: 'path', description: 'The ID of the Lakehouse'  },
      ],
    },
    {
        name: 'Get Lakehouse',
        description: 'Get a lakehouse in the workspace',
        method: 'GET',
        endpoint: '/v1/workspaces/{workspaceId}/lakehouses/{lakehouseId}',
        params: [
          { key: 'workspaceId', label: 'Workspace ID', type: 'text', in: 'path', description: 'The ID of the workspace' },
          { key: 'lakehouseId', label: 'Lakehouse ID', type: 'text', in: 'path', description: 'The ID of the Lakehouse'  },
        ],
      },
      {
        name: 'List Lakehouses',
        description: 'List all lakehouses in the workspace',
        method: 'GET',
        endpoint: '/v1/workspaces/{workspaceId}/lakehouses',
        params: [
          { key: 'workspaceId', label: 'Workspace ID', type: 'text', in: 'path', description: 'The ID of the workspace' }
        ],
      },
      {
        name: 'Update Lakehouses',
        description: 'Update a lakehouse in the workspace',
        method: 'PATCH',
        endpoint: '/v1/workspaces/{workspaceId}/lakehouses/{lakehouseId}',
        params: [
          { key: 'workspaceId', label: 'Workspace ID', type: 'text', in: 'path', description: 'The ID of the workspace' },
          { key: 'lakehouseId', label: 'Lakehouse ID', type: 'text', in: 'path', description: 'The ID of the Lakehouse'  },
          { key: 'displayName', label: 'Display Name', type: 'text', in: 'body', description: 'The lakehouse display name. The display name must follow naming rules according to item type.' },
          { key: 'description', label: 'Description', type: 'text', in: 'body', description: 'The lakehouse description. Maximum length is 256 characters.' },
        ],
      },
      {
        name: 'List Lakehouse Tables',
        description: 'Returns a list of lakehouse Tables.',
        method: 'GET',
        endpoint: '/v1/workspaces/{workspaceId}/lakehouses/{lakehouseId}/tables',
        params: [
          { key: 'workspaceId', label: 'Workspace ID', type: 'text', in: 'path', description: 'The ID of the workspace' },
          { key: 'lakehouseId', label: 'Lakehouse ID', type: 'text', in: 'path', description: 'The ID of the Lakehouse'  },
          { key: 'continuationToken', label: 'continuation Token', type: 'text', in: 'query', description: 'Token to retrieve the next page of results, if available.' },
          { key: 'maxResults', label: 'Max Results', type: 'text', in: 'query', description: 'The maximum number of results per page to return.'  },
        ],
      }
];

export interface ApiParameters {
  [key: string]: string | boolean;
}