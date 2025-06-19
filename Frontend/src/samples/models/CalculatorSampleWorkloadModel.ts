import { WorkloadClientAPI } from '@ms-fabric/workload-client';
import { ItemReference, GenericItem, WorkloadItem } from '../../ItemEditor/ItemEditorModel';


// Represents the core metadata for Item1 stored within the system's storage.
export interface SampleItemMetadata {
    operand1?: number;
    operand2?: number;
    operator?: string;
    lakehouse: ItemReference;
    useOneLake: boolean;
    hasLastResult: boolean;
}

export enum DefinitionPath {
    ItemMetadata = "Item/metadata.json",
    Platform = ".platform",
}


// Represents extended metadata for the sample item, including additional information
// about the associated lakehouse, tailored for client-side usage.
export interface SampleItemClientMetadata extends SampleItemMetadata {
    lakehouse: GenericItem;
}

// Represents the item-specific payload passed with the CreateItem request
export interface SampleItemCreatePayload {
    item1Metadata?: SampleItemMetadata;
}

// Represents the item-specific payload passed with the UpdateItem request
export interface SampleItemUpdatePayload {
    item1Metadata?: SampleItemMetadata;
}

// Represents the item-specific payload returned by the GetItemPayload  request
export interface SampleItemPayload {
    item1Metadata?: SampleItemClientMetadata;
}

export interface TabContentProps {
    workloadClient: WorkloadClientAPI;
    sampleWorkloadName?: string;
    sampleItem?: WorkloadItem<SampleItemPayload>;
}



export enum Item1Operator {
    Undefined = 0,
    Add = 1,
    Subtract = 2,
    Multiply = 3,
    Divide = 4,
    Random = 5,
}