import { ApiDefinition } from "./LakehouseDefintion";

export const NotebookApis: ApiDefinition[] = [
    {
      name: 'List Notebooks',
      description: 'Returns a list of notebooks from the specified workspace.',
      method: 'GET',
      endpoint: '/workspaces/{workspaceId}/notebooks',
      params: [
        { key: 'workspaceId', label: 'Workspace ID', type: 'text', in: 'path' },
        { key: 'continuationToken', label: 'Continuation Token', type: 'text', in: 'query' },
      ],
    },
    {
      name: 'Create Notebook',
      description: 'Creates a notebook in the specified workspace.',
      method: 'POST',
      endpoint: '/workspaces/{workspaceId}/notebooks',
      params: [
        { key: 'workspaceId', label: 'Workspace ID', type: 'text', in: 'path' },
      ],
      bodySchema: {
        "displayName": "Notebook 1",
        "description": "A notebook description",
        "definition": {
          "format": "ipynb",
          "parts": [
            {
              "path": "notebook-content.py",
              "payload": "eyJuYmZvcm1hdCI6N..5ndWUiOiJweXRob24ifX19",
              "payloadType": "InlineBase64"
            },
            {
              "path": ".platform",
              "payload": "ZG90UGxhdGZvcm1CYXNlNjRTdHJpbmc=",
              "payloadType": "InlineBase64"
            }
          ]
        }
      }
    },
    {
      name: 'Get Notebook',
      description: 'Returns properties of the specified notebook.',
      method: 'GET',
      endpoint: '/workspaces/{workspaceId}/notebooks/{notebookId}',
      params: [
        { key: 'workspaceId', label: 'Workspace ID', type: 'text', in: 'path' },
        { key: 'notebookId', label: 'Notebook ID', type: 'text', in: 'path' },
      ],
    },
    {
      name: 'Update Notebook',
      description: 'Updates the properties of the specified notebook.',
      method: 'PATCH',
      endpoint: '/workspaces/{workspaceId}/notebooks/{notebookId}',
      params: [
        { key: 'workspaceId', label: 'Workspace ID', type: 'text', in: 'path' },
        { key: 'notebookId', label: 'Notebook ID', type: 'text', in: 'path' },
      ],
      bodySchema: {
        "displayName": "Notebook's New name",
        "description": "A new description for notebook."
      }
    },
    {
      name: 'Delete Notebook',
      description: 'Deletes the specified notebook.',
      method: 'DELETE',
      endpoint: '/workspaces/{workspaceId}/notebooks/{notebookId}',
      params: [
        { key: 'workspaceId', label: 'Workspace ID', type: 'text', in: 'path' },
        { key: 'notebookId', label: 'Notebook ID', type: 'text', in: 'path' },
      ],
    },
    {
      name: 'Get Notebook Definition',
      description: 'Returns the specified notebook public definition.',
      method: 'POST',
      endpoint: '/workspaces/{workspaceId}/notebooks/{notebookId}/getDefinition',
      params: [
        { key: 'workspaceId', label: 'Workspace ID', type: 'text', in: 'path' },
        { key: 'notebookId', label: 'Notebook ID', type: 'text', in: 'path' },
        { key: 'format', label: 'Format', type: 'text', in: 'query' },
      ],
    },
    {
      name: 'Update Notebook Definition',
      description: 'Overrides the definition for the specified notebook.',
      method: 'POST',
      endpoint: '/workspaces/{workspaceId}/notebooks/{notebookId}/updateDefinition',
      params: [
        { key: 'workspaceId', label: 'Workspace ID', type: 'text', in: 'path' },
        { key: 'notebookId', label: 'Notebook ID', type: 'text', in: 'path' },
        { key: 'updateMetadata', label: 'Update Metadata', type: 'checkbox', in: 'query' },
      ],
      bodySchema: {
        "definition": {
          "parts": [
            {
              "path": "notebook-content.py",
              "payload": "IyBGYWJyaWMgbm90ZWJv...",
              "payloadType": "InlineBase64"
            },
            {
              "path": ".platform",
              "payload": "ZG90UGxhdGZvcm1CYXNlNjRTdHJpbmc=",
              "payloadType": "InlineBase64"
            }
          ]
        }
      }
    },
    // ... other notebook endpoints
  ];