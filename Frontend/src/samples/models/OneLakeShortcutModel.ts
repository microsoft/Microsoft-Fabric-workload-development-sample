

/**
 * OneLakeShortcutModel.ts
 * This file defines the data structures for creating and managing shortcuts in OneLake.
 */
export interface OneLakeShortcutCreateResponse  {
    path: string;
    name: string;
    target: OneLakeShortcutTarget;
}

/**
 * OneLakeShortcutCreateRequest
 * This interface defines the structure for creating a shortcut in OneLake.
 * It includes the path, name, and target of the shortcut.
*/
export interface OneLakeShortcutCreateRequest {
    path: string;
    name: string;
    target: OneLakeShortcutTarget;
}

/**
 * OneLakeShortcutTarget
 * This interface defines the structure for the target of a OneLake shortcut.
 * It can be one of several types, each representing a different storage location.
 */
export interface OneLakeShortcutTarget  {
}

/**
 * OneLakeShortcutTargetOneLake
 * This interface extends OneLakeShortcutTarget to represent a shortcut target in OneLake.
 */
export interface OneLakeShortcutTargetOneLake extends OneLakeShortcutTarget {
    oneLake: {
        workspaceId: string;
        itemId: string;
        path: string;
    };
}

/**
 * OneLakeShortcutTargetDataverse
 * This interface extends OneLakeShortcutTarget to represent a shortcut target in Dataverse.
 */
export interface OneLakeShortcutTargetAdlsGen2 extends OneLakeShortcutTarget {
    adlsGen2Path: {
        location: string;
        bucket: string;
        subpath: string;
        connectionId: string;
    };
}

/**
 * OneLakeShortcutTargetAmazonS3
 * This interface extends OneLakeShortcutTarget to represent a shortcut target in Amazon S3.
 */
export interface OneLakeShortcutTargetAmazonS3 extends OneLakeShortcutTarget {
    amazonS3: {
        location: string;
        subpath: string;
        connectionId: string;
    }
}

/**
 * OneLakeShortcutTargetAzureBlobStorage    
 * This interface extends OneLakeShortcutTarget to represent a shortcut target in Azure Blob Storage.
 */
export interface OneLakeShortcutTargetAzureBlobStorage extends OneLakeShortcutTarget {
    azureBlobStorage: { 
        location: string;
        subpath: string;
        connectionId: string;
    }
}

/**
 * OneLakeShortcutTargetGoogleCloudStorage
 * This interface extends OneLakeShortcutTarget to represent a shortcut target in Google Cloud Storage.
 */
export interface OneLakeShortcutTargetGoogleCloudStorage extends OneLakeShortcutTarget {
    googleCloudStorage: {
        location: string;
        subpath: string;
        connectionId: string;
    }
}

/**
 * OneLakeShortcutTargetDataverse 
 * This interface extends OneLakeShortcutTarget to represent a shortcut target in Dataverse.
 */
export interface OneLakeShortcutTargetS3Compatible extends OneLakeShortcutTarget {
    s3Compatible: {
        location: string;
        bucket: string;
        subpath: string;
        connectionId: string;
    }
}

/**
 * OneLakeShorcutListResponse
 * This interface defines the structure of the response for a list of OneLake shortcuts.
 * It contains an array of OneLakeShortcutCreateResponse objects.
 */
export interface OneLakeShorcutListResponse {
    value: OneLakeShortcutCreateResponse[];
}