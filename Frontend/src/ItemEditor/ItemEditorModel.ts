import { ItemLikeV2 } from "@ms-fabric/workload-client";

// Represents an item as defined in the frontend manifest.
export interface ItemManifest {
    name: string;
    displayName: string;
    editor: {
        path: string;
    };
}

// Represents a reference to a fabric item.
export interface ItemReference {
    workspaceId: string;
    id: string;
}

// Represents a generic fabric item with common properties.
export interface GenericItem extends ItemReference {
    type: string;
    displayName: string;
    description: string;
    createdBy?: string;
    createdDate?: Date;
    lastModifiedBy?: string;
    lastModifiedDate?: Date;
}

// Represents a workload item with extended metadata.
export interface WorkloadItem<T> extends GenericItem {
    itemState?: T;
}

export interface ItemPlatformMetadata {
    metadata: GenericItem;
}

export interface ItemCreationFailureData {
    errorCode?: string;
    resultCode?: string;
}

export interface ItemCreationSuccessData {
    item: ItemLikeV2;
}



export enum ItemPayloadPath {
    ItemMetadata = "Item/metadata.json",
    Platform = ".platform",
}

