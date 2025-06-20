import { ItemLikeV2 } from "@ms-fabric/workload-client";


/*
* Represents a reference to a fabric item.
* This interface extends ItemLikeV2 to include additional metadata.
*/
export interface ItemReference {
    workspaceId: string;
    id: string;
}

/*
* Represents a fabric item with additional metadata.
* This interface extends ItemReference and includes properties for item type, display name, description, and metadata.
*/
export interface GenericItem extends ItemReference {
    type: string;
    displayName: string;
    description: string;
    createdBy?: string;
    createdDate?: Date;
    lastModifiedBy?: string;
    lastModifiedDate?: Date;
}

/*
* Represents a fabric item with additional metadata and a payload.  
* This interface extends GenericItem and includes a payload property.
*/
export interface WorkloadItem<T> extends GenericItem {
    itemState?: T;
}

/*
* Represents a fabric item with additional metadata and a payload.
* This interface extends WorkloadItem and includes a payload property.
*/
export interface ItemCreationFailureData {
    errorCode?: string;
    resultCode?: string;
}

/**
* Represents a fabric item with additional metadata and a payload.
* This interface extends WorkloadItem and includes a payload property.
*/
export interface ItemCreationSuccessData {
    item: ItemLikeV2;
}

/**
* Enum representing the paths for item payloads.
* This enum is used to define the paths for item metadata and platform files.
* If you have more files that need to be stored in the item payload, you can add them here.
* The paths are relative to the item payload root. 
* The platform file is used to store platform-specific information about the item and needs to be present in the item payload.
* The item metadata file is used to store metadata about the item and needs to be present in the item payload.
* The paths are used to read and write files in the item payload.
*/
export enum ItemPayloadPath {
    ItemMetadata = "Item/metadata.json",
    Platform = ".platform",
}

