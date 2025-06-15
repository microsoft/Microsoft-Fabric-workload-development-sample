import { ItemLikeV2, WorkloadClientAPI } from '@ms-fabric/workload-client';

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
    extendedMetdata?: T;
}

// Represents the core metadata for Item1 stored within the system's storage.
export interface Item1Metadata {
    operand1?: number;
    operand2?: number;
    operator?: string;
    lakehouse: ItemReference;
    useOneLake: boolean;
    hasLastResult: boolean;
}

// Represents extended metadata for item1, including additional information
// about the associated lakehouse, tailored for client-side usage.
export interface Item1ClientMetadata extends Item1Metadata {
    lakehouse: GenericItem;
}

// Represents the item-specific payload passed with the  CreateItem request
export interface CreateItemPayload {
    item1Metadata?: Item1Metadata;
}

// Represents the item-specific payload passed with the  UpdateItem request
export interface UpdateItemPayload {
    item1Metadata?: Item1Metadata;
}

// Represents the item-specific payload returned by the GetItemPayload  request
export interface ItemPayload {
    item1Metadata?: Item1ClientMetadata;
}

export interface TabContentProps {
    workloadClient: WorkloadClientAPI;
    sampleWorkloadName?: string;
    sampleItem?: WorkloadItem<ItemPayload>;
}

export interface ItemCreationFailureData {
    errorCode?: string;
    resultCode?: string;
}

export interface ItemCreationSuccessData {
    item: ItemLikeV2;
}

export enum DefinitionPath {
    ItemMetadata = "Item/metadata.json",
    ItemInfo = "Item/info.json",
}

export enum Item1Operator {
    Undefined = 0,
    Add = 1,
    Subtract = 2,
    Multiply = 3,
    Divide = 4,
    Random = 5,
}