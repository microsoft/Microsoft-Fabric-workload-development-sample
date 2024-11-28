import { ApiDefinition } from "./LakehouseDefintion";


export const dfs: ApiDefinition[] = [
    {
      name: 'List Paths',
      description: 'List filesystem paths and their properties.',
      method: 'GET',
      endpoint: '/{workspaceId}',
      params: [
        { key: 'workspaceId', label: 'The filesystem identifier', type: 'text', in: 'path' },
        { key: 'directory', label: 'Filters results to paths within the specified directory. An error occurs if the directory does not exist. Note: directory should start with artifactId', type: 'text', in: 'query' },
        { key: 'recursive', label: 'If "true", all paths are listed; otherwise, only paths at the root of the filesystem are listed.', type: 'checkbox', in: 'query' },
        { key: 'continuation', label: 'The number of paths returned with each invocation is limited.', type: 'text', in: 'query' },
        { key: 'maxResults', label: 'An optional value that specifies the maximum number of items to return.', type: 'text', in: 'query' },
        { key: 'upn', label: 'Optional. If "true", the user identity values returned in the owner and group fields of each list entry will be transformed from Azure Active Directory Object IDs to User Principal Names.', type: 'checkbox', in: 'query' },
        { key: 'resource', label: 'The value must be "filesystem" for all filesystem operations.', type: 'text', in: 'query' },
        { key: 'timeout', label: 'An optional operation timeout value in seconds. The period begins when the request is received by the service. If the timeout value elapses before the operation completes, the operation fails.', type: 'text', in: 'query' },
      ],
      bodySchema: undefined,
    },
    {
      name: 'Create File | Create Directory | Rename File | Rename Directory',
      description: 'Create or rename a file or directory.',
      method: 'PUT',
      endpoint: '/{workspaceId}/{artifactId}/{path}',
      params: [
        { key: 'workspaceId', label: 'The workspace identifier', type: 'text', in: 'path' },
        { key: 'artifactId', label: 'The artifact identifier.', type: 'text', in: 'path' },
        { key: 'path', label: 'The file or directory path.', type: 'text', in: 'path' },
        { key: 'resource', label: 'Required only for Create File and Create Directory. The value must be "file" or "directory"..', type: 'text', in: 'query' },
        { key: 'continuation', label: 'Optional.  When renaming a directory, the number of paths that are renamed with each invocation is limited.  If the number of paths to be renamed exceeds this limit, a continuation token is returned in this response header.  When a continuation token is returned in the response, it must be specified in a subsequent invocation of the rename operation to continue renaming the directory.', type: 'text', in: 'query' },
        { key: 'mode', label: 'Optional. Valid only when namespace is enabled. This parameter determines the behavior of the rename operation. The value must be "legacy" or "posix", and the default value will be "posix".', type: 'text', in: 'query' },
        // ... other parameters specific to this endpoint ...
      ],
      bodySchema: undefined, // Include schema if applicable
    },
    {
      name: 'Append Data | Flush Data | Set Properties | Set Access Control',
      description: 'Uploads data to be appended to a file, flushes (writes) previously uploaded data to a file, sets properties for a file or directory, or sets access control for a file or directory.',
      method: 'PATCH',
      endpoint: '/{workspaceId}/{artifactId}/{path}',
      params: [
        { key: 'workspaceId', label: 'The workspace identifier', type: 'text', in: 'path' },
        { key: 'artifactId', label: 'The artifact identifier.', type: 'text', in: 'path' },
        { key: 'path', label: 'The file or directory path.', type: 'text', in: 'path' },
        { key: 'action', label: 'The action must be \"append\" to upload data to be appended to a file, \"flush\" to flush previously uploaded data to a file, \"setProperties\" to set the properties of a file or directory, or \"setAccessControl\" to set the owner, group, permissions, or access control list for a file or directory.  Note that Hierarchical Namespace must be enabled for the account in order to use access control.  Also note that the Access Control List (ACL) includes permissions for the owner, owning group, and others, so the x-ms-permissions and x-ms-acl request headers are mutually exclusive.', type: 'text', in: 'query' },
        { key: 'position', label: 'This parameter allows the caller to upload data in parallel and control the order in which it is appended to the file.  It is required when uploading data to be appended to the file and when flushing previously uploaded data to the file.  The value must be the position where the data is to be appended.  Uploaded data is not immediately flushed, or written, to the file.  To flush, the previously uploaded data must be contiguous, the position parameter must be specified and equal to the length of the file after all data has been written, and there must not be a request entity body included with the request.', type: 'text', in: 'query' },
        { key: 'retainUncommittedData', label: 'Valid only for flush operations.  If \"true\", uncommitted data is retained after the flush operation completes; otherwise, the uncommitted data is deleted after the flush operation.  The default is false.  Data at offsets less than the specified position are written to the file when flush succeeds, but this optional parameter allows data after the flush position to be retained for a future flush operation.', type: 'text', in: 'query' },
        { key: 'close', label: 'Azure Storage Events allow applications to receive notifications when files change. When Azure Storage Events are enabled, a file changed event is raised. This event has a property indicating whether this is the final change to distinguish the difference between an intermediate flush to a file stream and the final close of a file stream. The close query parameter is valid only when the action is \"flush\" and change notifications are enabled. If the value of close is \"true\" and the flush operation completes successfully, the service raises a file change notification with a property indicating that this is the final update (the file stream has been closed). If \"false\" a change notification is raised indicating the file has changed. The default is false. This query parameter is set to true by the Hadoop ABFS driver to indicate that the file stream has been closed.\"', type: 'text', in: 'query' },
        { key: 'Content-Length', label: 'Required for \"Append Data\" and \"Flush Data\".  Must be 0 for \"Flush Data\".  Must be the length of the request content in bytes for \"Append Data\".', type: 'text', in: 'header' },
        { key: 'Content-Type', label: 'application/json in this test', type: 'text', in: 'header' }, // Add more headers!
        // ... other parameters specific to this endpoint ...
      ],
      bodySchema: {
        "dataToAppend": "Lakehouse_1",
        }
    },
    {
      name: 'Read File',
      description: 'Read the contents of a file.',
      method: 'GET',
      endpoint: '/{workspaceId}/{artifactId}/{path}',
      params: [
        { key: 'workspaceId', label: 'The workspace identifier', type: 'text', in: 'path' },
        { key: 'artifactId', label: 'The artifact identifier.', type: 'text', in: 'path' },
        { key: 'path', label: 'The file or directory path.', type: 'text', in: 'path' },
        // ... other parameters specific to this endpoint ...
      ],
      bodySchema: undefined, // Include schema if applicable
    },
    {
      name: 'Get Properties | Get Status | Get Access Control List | Check Access',
      description: 'Get Properties returns all system and user defined properties for a path. Get Status returns all system defined properties for a path. Get Access Control List returns the access control list for a path.',
      method: 'HEAD',
      endpoint: '/{workspaceId}/{artifactId}/{path}',
      params: [
        { key: 'workspaceId', label: 'The workspace identifier', type: 'text', in: 'path' },
        { key: 'artifactId', label: 'The artifact identifier.', type: 'text', in: 'path' },
        { key: 'path', label: 'The file or directory path.', type: 'text', in: 'path' },
        // ... other parameters specific to this endpoint ...
      ],
      bodySchema: undefined, // Include schema if applicable
    },
    {
      name: 'Delete File | Delete Directory',
      description: 'Delete the file or directory.',
      method: 'DELETE',
      endpoint: '/{workspaceId}/{artifactId}/{path}',
      params: [
        { key: 'workspaceId', label: 'The workspace identifier', type: 'text', in: 'path' },
        { key: 'artifactId', label: 'The artifact identifier.', type: 'text', in: 'path' },
        { key: 'path', label: 'The file or directory path.', type: 'text', in: 'path' },
        // ... other parameters specific to this endpoint ...
      ],
      bodySchema: undefined, // Include schema if applicable
    },
  ];