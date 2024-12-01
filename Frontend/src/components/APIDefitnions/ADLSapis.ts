import { ApiDefinition } from "../SampleWorkloadAuthEditor/LakehouseDefintion";

export const styles = {
    card: {
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: '#f9f9f9',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '16px',
    },
    method: {
      fontSize: '12px',
      fontWeight: 'bold',
      color: '#fff',
      backgroundColor: '#4caf50',
      padding: '4px 8px',
      borderRadius: '4px',
      marginRight: '8px',
      textTransform: 'uppercase' as 'uppercase',
    },
    name: {
      fontSize: '20px',
      margin: '0',
      color: '#333',
    },
    description: {
      fontSize: '16px',
      color: '#666',
      lineHeight: '1.5',
    },
    accordion: {
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      marginBottom: '16px',
    },
    button: {
      width: '350px',
      marginTop: '20px',
    },
    responseField: {
      width: '1000px',
      marginTop: '16px',
    },
  };
  
  export const Path_Update: ApiDefinition = {
    name: 'Path Update (Upload file)',
    description: 'Uploads data to be appended to a file, flushes (writes) previously uploaded data to a file, sets properties for a file or directory, or sets access control for a file or directory. Data can only be appended to a file. This operation supports conditional HTTP requests. For more information, see Specifying Conditional Headers for Blob Service Operations: (https://docs.microsoft.com/en-us/rest/api/storageservices/specifying-conditional-headers-for-blob-service-operations).',
    method: 'PATCH',
    endpoint: '/{workspaceId}/{artifactId}/{path}',
    params: [
        {
          key: 'workspaceId',
          label: 'Workspace ID',
          type: 'text',
          in: 'path',
          description: 'The workspace identifier',
        },
        {
          key: 'artifactId',
          label: 'Artifact ID',
          type: 'text',
          in: 'path',
          description: 'The artifact identifier',
        },
        {
          key: 'path',
          label: 'Path',
          type: 'text',
          in: 'path',
          description: 'The file or directory path',
        },
        {
          key: 'action',
          label: 'Action',
          type: 'dropdown',
          in: 'query',
          options: ['append', 'flush', 'setProperties', 'setAccessControl'],
          description: 'The action to perform on the resource',
        },
        {
          key: 'position',
          label: 'Position',
          type: 'text',
          in: 'query',
          description: 'The position where the data is to be appended',
        },
        {
          key: 'retainUncommittedData',
          label: 'Retain Uncommitted Data',
          type: 'checkbox',
          in: 'query',
          description: 'Whether to retain uncommitted data after the flush operation',
        },
        {
          key: 'close',
          label: 'Close',
          type: 'checkbox',
          in: 'query',
          description: 'Whether to close the file stream after the flush operation',
        },    
        {
          key: 'contentLength',
          label: 'Content-Length',
          type: 'text',
          in: 'header',
          description: 'The length of the request content in bytes',
        },
        {
          key: 'contentMD5',
          label: 'Content-MD5',
          type: 'text',
          in: 'header',
          description: 'An MD5 hash of the request content',
        },
        {
          key: 'leaseId',
          label: 'Lease ID',
          type: 'text',
          in: 'header',
          description: 'The lease ID if there is an active lease',
        },
        {
          key: 'cacheControl',
          label: 'Cache-Control',
          type: 'text',
          in: 'header',
          description: 'The cache control directives for the resource',
        },
        {
          key: 'contentType',
          label: 'Content-Type',
          type: 'text',
          in: 'header',
          description: 'The content type of the resource',
        },
        {
          key: 'contentDisposition',
          label: 'Content-Disposition',
          type: 'text',
          in: 'header',
          description: 'The content disposition of the resource',
        },
        {
          key: 'contentEncoding',
          label: 'Content-Encoding',
          type: 'text',
          in: 'header',
          description: 'The content encoding of the resource',
        },
        {
          key: 'contentLanguage',
          label: 'Content-Language',
          type: 'text',
          in: 'header',
          description: 'The content language of the resource',
        },
        {
          key: 'contentMd5Header',
          label: 'Content-MD5 Header',
          type: 'text',
          in: 'header',
          description: 'The MD5 hash of the resource content',
        },
        {
          key: 'properties',
          label: 'Properties',
          type: 'text',
          in: 'header',
          description: 'User-defined properties in the format of a comma-separated list',
        },
        {
          key: 'owner',
          label: 'Owner',
          type: 'text',
          in: 'header',
          description: 'The owner of the file or directory',
        },
        {
          key: 'group',
          label: 'Group',
          type: 'text',
          in: 'header',
          description: 'The owning group of the file or directory',
        },
        {
          key: 'permissions',
          label: 'Permissions',
          type: 'text',
          in: 'header',
          description: 'POSIX access permissions for the resource',
        },
        {
          key: 'acl',
          label: 'ACL',
          type: 'text',
          in: 'header',
          description: 'POSIX access control list for the resource',
        },
        {
          key: 'ifMatch',
          label: 'If-Match',
          type: 'text',
          in: 'header',
          description: 'Perform the operation only if the resource\'s ETag matches',
        },
        {
          key: 'ifNoneMatch',
          label: 'If-None-Match',
          type: 'text',
          in: 'header',
          description: 'Perform the operation only if the resource\'s ETag does not match',
        },
        {
          key: 'ifModifiedSince',
          label: 'If-Modified-Since',
          type: 'text',
          in: 'header',
          description: 'Perform the operation only if the resource has been modified since the specified date',
        },
        {
          key: 'ifUnmodifiedSince',
          label: 'If-Unmodified-Since',
          type: 'text',
          in: 'header',
          description: 'Perform the operation only if the resource has not been modified since the specified date',
        },
        {
          key: 'requestBody',
          label: 'Request Body',
          type: 'text',
          in: 'body',
          description: 'The data to be uploaded and appended to the file',
        },
      // Add other parameters as needed
    ],
    bodySchema: {}, // Define the schema if needed
  };


  export const Path_Create: ApiDefinition = {
    name: 'Path Create (Create or rename file or directory)',
    description: 'Create or rename a file or directory. By default, the destination is overwritten and if the destination already exists and has a lease the lease is broken. This operation supports conditional HTTP requests. For more information, see Specifying Conditional Headers for Blob Service Operations: (https://docs.microsoft.com/en-us/rest/api/storageservices/specifying-conditional-headers-for-blob-service-operations). To fail if the destination already exists, use a conditional request with If-None-Match: "*".',
    method: 'PUT',
    endpoint: '/{workspaceId}/{artifactId}/{path}',
    params: [
      {
        key: 'workspaceId',
        label: 'Workspace ID',
        type: 'text',
        in: 'path',
        description: 'The workspace identifier',
      },
      {
        key: 'artifactId',
        label: 'Artifact ID',
        type: 'text',
        in: 'path',
        description: 'The artifact identifier',
      },
      {
        key: 'path',
        label: 'Path',
        type: 'text',
        in: 'path',
        description: 'The file or directory path',
      },
      {
        key: 'resource',
        label: 'Resource',
        type: 'dropdown',
        in: 'query',
        options: ['directory', 'file'],
        description: 'The resource type (file or directory)',
      },
      {
        key: 'continuation',
        label: 'Continuation',
        type: 'text',
        in: 'query',
        description: 'Continuation token for renaming directories',
      },
      {
        key: 'mode',
        label: 'Mode',
        type: 'dropdown',
        in: 'query',
        options: ['legacy', 'posix'],
        description: 'The behavior of the rename operation',
      },
      // Headers
      {
        key: 'cacheControl',
        label: 'Cache-Control',
        type: 'text',
        in: 'header',
        description: 'The cache control directives for the resource',
      },
      {
        key: 'contentEncoding',
        label: 'Content-Encoding',
        type: 'text',
        in: 'header',
        description: 'Specifies which content encodings have been applied to the file',
      },
      {
        key: 'contentLanguage',
        label: 'Content-Language',
        type: 'text',
        in: 'header',
        description: 'Specifies the natural language used by the intended audience for the file',
      }
      // Additional headers as needed
    ],
    bodySchema: {},
  };


  export const Path_Lease: ApiDefinition = {
    name: 'Path Lease (Create or manage a lease)',
    description: 'Create and manage a lease to restrict write and delete access to the path. This operation supports conditional HTTP requests. For more information, see Specifying Conditional Headers for Blob Service Operations: (https://docs.microsoft.com/en-us/rest/api/storageservices/specifying-conditional-headers-for-blob-service-operations).',
    method: 'POST',
    endpoint: '/{workspaceId}/{artifactId}/{path}',
    params: [
      {
        key: 'workspaceId',
        label: 'Workspace ID',
        type: 'text',
        in: 'path',
        description: 'The workspace identifier',
      },
      {
        key: 'artifactId',
        label: 'Artifact ID',
        type: 'text',
        in: 'path',
        description: 'The artifact identifier',
      },
      {
        key: 'path',
        label: 'Path',
        type: 'text',
        in: 'path',
        description: 'The file or directory path',
      },
      {
        key: 'leaseAction',
        label: 'Lease Action',
        type: 'dropdown',
        in: 'header',
        options: ['acquire', 'break', 'change', 'renew', 'release'],
        description: 'The lease action to perform',
      },
      {
        key: 'leaseId',
        label: 'Lease ID',
        type: 'text',
        in: 'header',
        description: 'The lease ID for renew, change, or release actions',
      },
      {
        key: 'proposedLeaseId',
        label: 'Proposed Lease ID',
        type: 'text',
        in: 'header',
        description: 'The proposed lease ID for acquire or change actions',
      },
      {
        key: 'ifMatch',
        label: 'If-Match',
        type: 'text',
        in: 'header',
        description: 'Perform the operation only if the resource\'s ETag matches',
      },
      {
        key: 'ifNoneMatch',
        label: 'If-None-Match',
        type: 'text',
        in: 'header',
        description: 'Perform the operation only if the resource\'s ETag does not match',
      },
      {
        key: 'ifModifiedSince',
        label: 'If-Modified-Since',
        type: 'text',
        in: 'header',
        description: 'Perform the operation only if the resource has been modified since the specified date',
      },
      {
        key: 'ifUnmodifiedSince',
        label: 'If-Unmodified-Since',
        type: 'text',
        in: 'header',
        description: 'Perform the operation only if the resource has not been modified since the specified date',
      },
    ],
    bodySchema: {},
  };

  export const Path_Read: ApiDefinition = {
    name: 'Path Read (Read file)',
    description: 'Read the contents of a file. For read operations, range requests are supported. This operation supports conditional HTTP requests. For more information, see Specifying Conditional Headers for Blob Service Operations: (https://docs.microsoft.com/en-us/rest/api/storageservices/specifying-conditional-headers-for-blob-service-operations).',
    method: 'GET',
    endpoint: '/{workspaceId}/{artifactId}/{path}',
    params: [
      {
        key: 'workspaceId',
        label: 'Workspace ID',
        type: 'text',
        in: 'path',
        description: 'The workspace identifier',
      },
      {
        key: 'artifactId',
        label: 'Artifact ID',
        type: 'text',
        in: 'path',
        description: 'The artifact identifier',
      },
      {
        key: 'path',
        label: 'Path',
        type: 'text',
        in: 'path',
        description: 'The file or directory path',
      },
      {
        key: 'range',
        label: 'Range',
        type: 'text',
        in: 'header',
        description: 'The HTTP Range request header specifies one or more byte ranges of the resource to be retrieved',
      },
      {
        key: 'leaseId',
        label: 'Lease ID',
        type: 'text',
        in: 'header',
        description: 'The lease ID if the path has an active lease',
      },
      {
        key: 'rangeGetContentMd5',
        label: 'Range Get Content MD5',
        type: 'checkbox',
        in: 'header',
        description: 'When set to true, returns the MD5 hash for the range if the range is less than or equal to 4MB in size',
      },
      {
        key: 'ifMatch',
        label: 'If-Match',
        type: 'text',
        in: 'header',
        description: 'Perform the operation only if the resource\'s ETag matches',
      },
      {
        key: 'ifNoneMatch',
        label: 'If-None-Match',
        type: 'text',
        in: 'header',
        description: 'Perform the operation only if the resource\'s ETag does not match',
      },
      {
        key: 'ifModifiedSince',
        label: 'If-Modified-Since',
        type: 'text',
        in: 'header',
        description: 'Perform the operation only if the resource has been modified since the specified date',
      },
      {
        key: 'ifUnmodifiedSince',
        label: 'If-Unmodified-Since',
        type: 'text',
        in: 'header',
        description: 'Perform the operation only if the resource has not been modified since the specified date',
      },
    ],
    bodySchema: {}, // Define the schema if needed, but it's not specified for this GET operation
  };

  export const Path_GetProperties: ApiDefinition = {
    name: 'Path GetProperties (Get properties or status)',
    description: 'Get Properties returns all system and user defined properties for a path. Get Status returns all system defined properties for a path. Get Access Control List returns the access control list for a path. This operation supports conditional HTTP requests. For more information, see Specifying Conditional Headers for Blob Service Operations: (https://docs.microsoft.com/en-us/rest/api/storageservices/specifying-conditional-headers-for-blob-service-operations).',
    method: 'HEAD',
    endpoint: '/{workspaceId}/{artifactId}/{path}',
    params: [
      {
        key: 'workspaceId',
        label: 'Workspace ID',
        type: 'text',
        in: 'path',
        description: 'The workspace identifier',
      },
      {
        key: 'artifactId',
        label: 'Artifact ID',
        type: 'text',
        in: 'path',
        description: 'The artifact identifier',
      },
      {
        key: 'path',
        label: 'Path',
        type: 'text',
        in: 'path',
        description: 'The file or directory path',
      },
      {
        key: 'action',
        label: 'Action',
        type: 'dropdown',
        in: 'query',
        options: ['getAccessControl', 'getStatus', 'checkAccess'],
        description: 'The action to perform',
      },
      {
        key: 'upn',
        label: 'User Principal Name',
        type: 'checkbox',
        in: 'query',
        description: 'Transforms Azure Active Directory Object IDs to User Principal Names if true',
      },
      {
        key: 'fsAction',
        label: 'File System Action',
        type: 'text',
        in: 'query',
        description: 'File system operation read/write/execute in string form',
      },
      {
        key: 'leaseId',
        label: 'Lease ID',
        type: 'text',
        in: 'header',
        description: 'The lease ID if the path has an active lease',
      },
      {
        key: 'ifMatch',
        label: 'If-Match',
        type: 'text',
        in: 'header',
        description: 'Perform the operation only if the resource\'s ETag matches',
      },
      {
        key: 'ifNoneMatch',
        label: 'If-None-Match',
        type: 'text',
        in: 'header',
        description: 'Perform the operation only if the resource\'s ETag does not match',
      },
      {
        key: 'ifModifiedSince',
        label: 'If-Modified-Since',
        type: 'text',
        in: 'header',
        description: 'Perform the operation only if the resource has been modified since the specified date',
      },
      {
        key: 'ifUnmodifiedSince',
        label: 'If-Unmodified-Since',
        type: 'text',
        in: 'header',
        description: 'Perform the operation only if the resource has not been modified since the specified date',
      },
    ],
    bodySchema: {}, // No body for HEAD requests
  };

  
export const Path_Delete: ApiDefinition = {
    name: 'Path Delete (Delete file or directory)',
    description: 'Delete the file or directory. This operation supports conditional HTTP requests. For more information, see Specifying Conditional Headers for Blob Service Operations: (https://docs.microsoft.com/en-us/rest/api/storageservices/specifying-conditional-headers-for-blob-service-operations).',
    method: 'DELETE',
    endpoint: '/{workspaceId}/{artifactId}/{path}',
    params: [
      {
        key: 'workspaceId',
        label: 'Workspace ID',
        type: 'text',
        in: 'path',
        description: 'The workspace identifier',
      },
      {
        key: 'artifactId',
        label: 'Artifact ID',
        type: 'text',
        in: 'path',
        description: 'The artifact identifier',
      },
      {
        key: 'path',
        label: 'Path',
        type: 'text',
        in: 'path',
        description: 'The file or directory path',
      },
      {
        key: 'recursive',
        label: 'Recursive',
        type: 'checkbox',
        in: 'query',
        description: 'If true, all paths beneath the directory will be deleted',
      },
      {
        key: 'continuation',
        label: 'Continuation',
        type: 'text',
        in: 'query',
        description: 'Continuation token for deleting directories',
      },
      {
        key: 'leaseId',
        label: 'Lease ID',
        type: 'text',
        in: 'header',
        description: 'The lease ID if there is an active lease',
      },
      {
        key: 'ifMatch',
        label: 'If-Match',
        type: 'text',
        in: 'header',
        description: 'Perform the operation only if the resource\'s ETag matches',
      },
      {
        key: 'ifNoneMatch',
        label: 'If-None-Match',
        type: 'text',
        in: 'header',
        description: 'Perform the operation only if the resource\'s ETag does not match',
      },
      {
        key: 'ifModifiedSince',
        label: 'If-Modified-Since',
        type: 'text',
        in: 'header',
        description: 'Perform the operation only if the resource has been modified since the specified date',
      },
      {
        key: 'ifUnmodifiedSince',
        label: 'If-Unmodified-Since',
        type: 'text',
        in: 'header',
        description: 'Perform the operation only if the resource has not been modified since the specified date',
      },
    ],
    bodySchema: {}, // No body for DELETE requests
  };

  export const Path_List: ApiDefinition = {
    name: 'Path List (List filesystem paths)',
    description: 'List filesystem paths and their properties.',
    method: 'GET',
    endpoint: '/{workspaceId}',
    params: [
      {
        key: 'workspaceId',
        label: 'Workspace ID',
        type: 'text',
        in: 'path',
        description: 'The filesystem identifier. The value must start and end with a letter or number and must contain only letters, numbers, and the dash (-) character. Consecutive dashes are not permitted. All letters must be lowercase. The value must have between 3 and 63 characters.',
      },
      {
        key: 'resource',
        label: 'Resource',
        type: 'text',
        in: 'query',
        description: 'The value must be "filesystem" for all filesystem operations.',
      },
      {
        key: 'directory',
        label: 'Directory',
        type: 'text',
        in: 'query',
        description: 'Filters results to paths within the specified directory. An error occurs if the directory does not exist. Note: directory should start with artifactId',
      },
      {
        key: 'getShortcutMetadata',
        label: 'GetShortcutMetadata',
        type: 'checkbox',
        in: 'query',
        description: 'Get the metadata of the specified path',
      },
      {
        key: 'recursive',
        label: 'Recursive',
        type: 'checkbox',
        in: 'query',
        description: 'If "true", all paths are listed; otherwise, only paths at the root of the filesystem are listed. If "directory" is specified, the list will only include paths that share the same root.',
      },
      {
        key: 'continuation',
        label: 'Continuation',
        type: 'text',
        in: 'query',
        description: 'The number of paths returned with each invocation is limited. If the number of paths to be returned exceeds this limit, a continuation token is returned in the response header x-ms-continuation.',
      }
    ],
    bodySchema: {}, // No body for GET requests
  };
