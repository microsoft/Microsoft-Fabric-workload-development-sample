import { ItemJobStatus, ItemLikeV2 } from '@ms-fabric/workload-client';

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

// Represents the generic action context recieved from fabric host
export interface ItemActionContext {
    item: ItemLikeV2;
}

// Represents the job action context recieved from fabric host
export interface ItemJobActionContext {
    itemJobInstanceId: string;
    jobEndTimeUtc: string;
    jobStartTimeUtc: string
    status: ItemJobStatus;
    isSuccessful: boolean;
    itemJobType: string;
    itemName: string;
    itemObjectId: string;
    workspaceName: string;  
    workspaceObjectId: string;
}

// Represents data to be displayed in the job details pane.
export interface ItemJobDetailData {
    /**
     * We are currently rendering data in key/value format which is default type.
     * In the future we may support data in table format.
     */
    type: 'default';
    sections: ItemJobDetailSection[];
}

// Represents a section in the job details pane
export interface ItemJobDetailSection {
    title: string;
    data: ItemJobDetailActionMetadataAttrs[];
}

// Represents metadata attributes in the job details pane data
export interface ItemJobDetailActionMetadataAttrs {
    /**
     *  label of the metadata
     */
    label: string;
    /**
     *  value of the metadata
     */
    value: string;
    /**
     *  type of the metadata
     */
    type: string // 'text' | 'link';
    /**
     *  url need to be set when type is link
     */
    url?: string;
}

// Represents the result of an item job action.
export interface ItemJobActionResult {
    /**
     * whether the action is successful or not.
     */
    isSuccess: boolean;
    /**
     * error code
     */
    errorCode?: number;
    /**
     * error message
     */
    errorMessage?: string;
    /**
     * hold data to be rendered in panel for the detail action
     */
    data?: ItemJobDetailData;
}