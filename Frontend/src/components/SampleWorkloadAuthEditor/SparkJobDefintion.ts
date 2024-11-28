import { ApiDefinition } from "./LakehouseDefintion";

export const SparkJobApis: ApiDefinition[] = [
    {
      name: 'List Spark Job Definitions',
      description: 'Returns a list of spark job definitions from the specified workspace.',
      method: 'GET',
      endpoint: '/workspaces/{workspaceId}/sparkJobDefinitions',
      params: [
        { key: 'workspaceId', label: 'Workspace ID', type: 'text', in: 'path' },
        // Add additional query parameters here if needed
      ],
    },
    {
      name: 'Create Spark Job Definition',
      description: 'Creates a spark job definition in the specified workspace.',
      method: 'POST',
      endpoint: '/workspaces/{workspaceId}/sparkJobDefinitions',
      params: [
        { key: 'workspaceId', label: 'Workspace ID', type: 'text', in: 'path' },
      ],
      bodySchema: {
        "displayName": "SparkJobDefinition 1",
        "description": "A spark job definition description.",
        // Add the definition structure here
      }
    },
    {
      name: 'Get Spark Job Definition',
      description: 'Returns properties of the specified spark job definition.',
      method: 'GET',
      endpoint: '/workspaces/{workspaceId}/sparkJobDefinitions/{sparkJobDefinitionId}',
      params: [
        { key: 'workspaceId', label: 'Workspace ID', type: 'text', in: 'path' },
        { key: 'sparkJobDefinitionId', label: 'Spark Job Definition ID', type: 'text', in: 'path' },
      ],
    },
    {
      name: 'Update Spark Job Definition',
      description: 'Updates the properties of the specified spark job definition.',
      method: 'PATCH',
      endpoint: '/workspaces/{workspaceId}/sparkJobDefinitions/{sparkJobDefinitionId}',
      params: [
        { key: 'workspaceId', label: 'Workspace ID', type: 'text', in: 'path' },
        { key: 'sparkJobDefinitionId', label: 'Spark Job Definition ID', type: 'text', in: 'path' },
      ],
      bodySchema: {
        "displayName": "SparkJobDefinition's New name",
        "description": "SparkJobDefinition's New description",
        // Add the definition structure here if needed
      }
    },
    {
      name: 'Delete Spark Job Definition',
      description: 'Deletes the specified spark job definition.',
      method: 'DELETE',
      endpoint: '/workspaces/{workspaceId}/sparkJobDefinitions/{sparkJobDefinitionId}',
      params: [
        { key: 'workspaceId', label: 'Workspace ID', type: 'text', in: 'path' },
        { key: 'sparkJobDefinitionId', label: 'Spark Job Definition ID', type: 'text', in: 'path' },
      ],
    },
    // Add other endpoints here following the same structure
  ];