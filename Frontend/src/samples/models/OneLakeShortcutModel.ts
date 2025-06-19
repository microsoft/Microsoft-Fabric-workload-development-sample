export interface OneLakeShortcutCreateResponse  {
    path: string;
    name: string;
    target: OneLakeShortcutTarget;
}

export interface OneLakeShortcutCreateRequest {
    path: string;
    name: string;
    target: OneLakeShortcutTarget;
}

export interface OneLakeShortcutTarget  {
}

export interface OneLakeShortcutTargetOneLake extends OneLakeShortcutTarget {
    oneLake: {
        workspaceId: string;
        itemId: string;
        path: string;
    };
}

export interface OneLakeShortcutTargetAdlsGen2 extends OneLakeShortcutTarget {
    adlsGen2Path: {
        location: string;
        bucket: string;
        subpath: string;
        connectionId: string;
    };
}

export interface OneLakeShortcutTargetAmazonS3 extends OneLakeShortcutTarget {
    amazonS3: {
        location: string;
        subpath: string;
        connectionId: string;
    }
}


export interface OneLakeShortcutTargetAzureBlobStorage extends OneLakeShortcutTarget {
    azureBlobStorage: { 
        location: string;
        subpath: string;
        connectionId: string;
    }
}

export interface OneLakeShortcutTargetGoogleCloudStorage extends OneLakeShortcutTarget {
    googleCloudStorage: {
        location: string;
        subpath: string;
        connectionId: string;
    }
}


export interface OneLakeShortcutTargetS3Compatible extends OneLakeShortcutTarget {
    s3Compatible: {
        location: string;
        bucket: string;
        subpath: string;
        connectionId: string;
    }
}

/*export enum OneLakeTargetType {
    AdlsGen2 = "AdlsGen2",
    AmazonS3 = "AmazonS3",
    AzureBlobStorage = "AzureBlobStorage",
    Dataverse = "Dataverse",	
    ExternalDataShare = "ExternalDataShare",
    GoogleCloudStorage = "GoogleCloudStorage",
    OneLake = "OneLake",
    S3Compatible = "S3Compatible"
}*/

export interface OneLakeShorcutListResponse {
    value: OneLakeShortcutCreateResponse[];
}