import { CreateItemParams, CreateItemResult, GetItemDefinitionResult, GetItemResult, ItemDefinitionPart, PayloadType, UpdateItemDefinitionPayload, UpdateItemDefinitionResult, UpdateItemResult, WorkloadClientAPI } from "@ms-fabric/workload-client";
import { ItemPayloadPath, WorkloadItem, GenericItem } from "../models/ItemCRUDModel";
import { handleException } from "./ErrorHandlingController";

// --- Item CRUD Api

/**
 * Calls the 'itemCrud.createItem function from the WorkloadClientAPI, creating an Item in Fabric
 *
 * @param {string} workspaceObjectId - WorkspaceObjectId where the item will be created
 * @param {string} itemType - Item type, as registered by the BE 
 * @param {string} displayName - Name of the item
 * @param {string} description - Description of the item (can be seen in item's Settings in Fabric)
 * @param {T} workloadPayload - Additional metadata payload for the item (e.g., selected Lakehouse details).
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @returns {GetItemResult} - A wrapper for the item's data, after it has already been saved
 */
export async function callCreateItem<T>(
    workspaceObjectId: string,
    itemType: string,
    displayName: string,
    description: string,
    workloadPayload: T,
    workloadClient: WorkloadClientAPI): Promise<GenericItem> {
    console.log(`passing payloadString: ${workloadPayload}`);

    const params: CreateItemParams = {
        workspaceObjectId,
        payload: {
            itemType,
            displayName,
            description,
            workloadPayload: JSON.stringify(workloadPayload),
            payloadContentType: "InlineJson",
        }
    };

    try {
        const result: CreateItemResult = await workloadClient.itemCrud.createItem(params);
        console.log(`Created item id: ${result.objectId} with name: ${displayName} and payload: ${workloadPayload}`);
        return {
            id: result.objectId,
            workspaceId: workspaceObjectId,
            type: itemType,
            displayName,
            description,
            createdBy: result.createdByUser.name,
            createdDate: result.createdDate,
            lastModifiedBy: result.modifiedByUser.name,
            lastModifiedDate: result.lastUpdatedDate
        };
    }
    catch (exception) {
        console.error(`Failed to create item: ${exception}`);
        throw exception;
    }
}


/**
 * Calls the 'itemCrud.updateItem function from the WorkloadClientAPI
 * 
 * @param {string} objectId - The ObjectId of the item to update
 * @param {T|undefined} - Additional metadata payload for the item (e.g., selected Lakehouse details).
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {boolean} isRetry - Indicates that the call is a retry
 * @returns {GetItemResult} - A wrapper for the item's data
 */
export async function callUpdateItem<T>(
    objectId: string,
    payloadData: T | undefined,
    workloadClient: WorkloadClientAPI,
    isRetry?: boolean): Promise<UpdateItemResult> {

    let payloadString: string;
    if (payloadData) {
        payloadString = JSON.stringify(payloadData);
        console.log(`Updating item ${objectId} with payload: ${payloadString}`)
    } else {
        console.log(`Sending an update for item ${objectId} without updating the payload`);
    }
 
    try {
        return await workloadClient.itemCrud.updateItem({
            objectId,
            etag: undefined,
            payload: { workloadPayload: payloadString, payloadContentType: "InlineJson" }
        });
    } catch (exception) {
        console.error(`Failed updating Item ${objectId}`, exception);
        return await undefined;
    }
}



/**
 * Calls the 'itemCrud.deleteItem function from the WorkloadClientAPI
 * 
 * @param {string} objectId - The ObjectId of the item to delete
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {boolean} isRetry - Indicates that the call is a retry
 */
export async function callDeleteItem(
    objectId: string,
    workloadClient: WorkloadClientAPI,
    isRetry?: boolean): Promise<boolean> {
    try {
        const result = await workloadClient.itemCrud.deleteItem({ objectId });
        console.log(`Delete result for item ${objectId}: ${result.success}`);
        return result.success;
    } catch (exception) {
        console.error(`Failed deleting Item ${objectId}`, exception);
        return await handleException(exception, workloadClient, isRetry, callDeleteItem, objectId);
    }
}

/**
 * Calls the 'itemCrud.getItem function from the WorkloadClientAPI
 * The result contains data both from Fabric
 * 
 * @param {string} itemId - The ItemId of the item to fetch
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {boolean} isRetry - Indicates that the call is a retry
 * @returns {GetItemResult} - A wrapper for the item's data
 */
export async function callGetItem(workloadClient: WorkloadClientAPI, itemId: string, isRetry?: boolean): Promise<GetItemResult> {
    try {
        const item: GetItemResult = await workloadClient.itemCrud.getItem({ objectId: itemId });
        console.log(`Successfully fetched item ${itemId}: ${item}`)

        return item;
    } catch (exception) {
        console.error(`Failed locating item with ObjectID ${itemId}`, exception);
        return undefined;
    }
}


/** 
 * Saves the item state by updating the item definition with the provided data.
 * 
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.        
 * @param {string} itemId - The ID of the item to update.
 * @param {T} data - The data to save as the item state.
 * @returns {Promise<UpdateItemDefinitionResult>} - The result of the item definition update.
 */
export async function saveItemState<T>(
    workloadClient: WorkloadClientAPI, 
    itemId: string, 
    data: T): Promise<UpdateItemDefinitionResult> {

        return callUpdateItemDefinition(workloadClient, itemId, [
        { 
            payloadPath: ItemPayloadPath.ItemMetadata, 
            payloadData: data
        }], false);
}

/** 
 * Retrieves the item state from the workload client by fetching the item and its definition.
 * 
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.    
 * @param {string} itemObjectId - The ObjectId of the item to retrieve.
 * @returns {Promise<T>} - The item state if available, otherwise undefined.
 */ 
export async function getItemState<T>(
    workloadClient: WorkloadClientAPI,
    itemObjectId: string): Promise<T> {
        const workloadITem = await getWorkloadItem<T>(workloadClient, itemObjectId);
        if (workloadITem && workloadITem.itemState) {
            return workloadITem.itemState;
        }
        return undefined  
}

/** 
 * Retrieves a WorkloadItem by its ObjectId from the WorkloadClientAPI.
 * 
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.    
 * @param {string} itemObjectId - The ObjectId of the item to retrieve.
 * @returns {Promise<WorkloadItem<T>>} - A promise that resolves to the WorkloadItem.
 */
export async function getWorkloadItem<T>(
    workloadClient: WorkloadClientAPI,
    itemObjectId: string): Promise<WorkloadItem<T>> {
        const getItemResult = await callGetItem(workloadClient, itemObjectId);
        const getItemDefinitionResult = await callGetItemDefinition(workloadClient, itemObjectId);
        const item = convertGetItemResultToWorkloadItem<T>(getItemResult, getItemDefinitionResult);
        return item;
    }


/** 
 * Calls the 'itemCrudPublic.updateItemDefinition' function from the WorkloadClientAPI
 * to update the item definition with the provided payload.
 * 
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {string} itemObjectId - The ObjectId of the item to update.
 * @param {Array<{ payloadPath: string, payloadData: any }>} parts - An array of parts to update in the item definition.        
 * @param {boolean} updateMetadata - Indicates whether to update metadata.
 * @param {boolean} isRetry - Indicates that the call is a retry.
 * @returns {Promise<UpdateItemDefinitionResult>} - The result of the item definition update.
 */
export async function callUpdateItemDefinition(
    workloadClient: WorkloadClientAPI,
    itemObjectId: string,
    parts: { payloadPath: string, payloadData: any }[],
    updateMetadata: boolean = false,
    isRetry?: boolean): Promise<UpdateItemDefinitionResult> {

    const itemDefinitions: UpdateItemDefinitionPayload = buildPublicAPIPayloadWithParts(parts);
    try {
        return await workloadClient.itemCrudPublic.updateItemDefinition({
            itemId: itemObjectId,
            payload: itemDefinitions,
            updateMetadata: updateMetadata
        });
    } catch (exception) {
        console.error(`Failed updating Item definition ${itemObjectId}`, exception);
        return undefined
    }
}

/**
 * Calls the 'itemCrudPublic.getItemDefinition' function from the WorkloadClientAPI 
 * to retrieve the item definition for a given item.
 * 
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {string} itemObjectId - The ObjectId of the item to retrieve the definition for.
 * @param {string} format - The format of the item definition to retrieve (optional).
 * @param {boolean} isRetry - Indicates that the call is a retry.
 * @returns {Promise<GetItemDefinitionResult>} - The item definition result if successful, otherwise undefined.
 */ 
export async function callGetItemDefinition(
    workloadClient: WorkloadClientAPI,
    itemObjectId: string,
    format?: string,
    isRetry?: boolean): Promise<GetItemDefinitionResult> {
    try {
        const itemDefinition: GetItemDefinitionResult = await workloadClient.itemCrudPublic.getItemDefinition({
            itemId: itemObjectId,
            format: format
        });
        console.log(`Successfully fetched item definition for item ${itemObjectId}: ${itemDefinition}`);
        return itemDefinition;
    } catch (exception) {
        console.error(`Failed getting Item definition ${itemObjectId}`, exception);
        return undefined;
    }
}

/** 
 * Converts a GetItemResult and GetItemDefinitionResult into a WorkloadItem.
 * 
 * @param {GetItemResult} item - The item result to convert.
 * @param {GetItemDefinitionResult} itemDefinitionResult - The item definition result to convert.
 * @returns {WorkloadItem<T>} - The converted WorkloadItem.
 */
export function convertGetItemResultToWorkloadItem<T>(item: GetItemResult, itemDefinitionResult: GetItemDefinitionResult): WorkloadItem<T> {
    let payload: T;
    let itemPlatformMetadata: GenericItem | undefined;
    if (itemDefinitionResult?.definition?.parts) {
        try {
            const itemMetadata = itemDefinitionResult.definition.parts.find((part) => part.path === ItemPayloadPath.ItemMetadata);
            payload = itemMetadata ? JSON.parse(atob(itemMetadata?.payload)) : undefined;

            const platformDefinition = itemDefinitionResult.definition.parts.find((part) => part.path === ItemPayloadPath.Platform);
            const itemPlatformPayload= platformDefinition ? JSON.parse(atob(platformDefinition?.payload)) : undefined;
            itemPlatformMetadata = itemPlatformPayload ? itemPlatformPayload.metadata : undefined;
        } catch (payloadParseError) {
            console.error(`Failed parsing payload for item ${item.objectId}, itemDefinitionResult: ${itemDefinitionResult}`, payloadParseError);
        }
    }

    return {
        id: item.objectId,
        workspaceId: item.folderObjectId,
        type: itemPlatformMetadata?.type ?? item.itemType,
        displayName: itemPlatformMetadata?.displayName ?? item.displayName,
        description: itemPlatformMetadata?.description ?? item.description,
        itemState: payload,
        createdBy: item.createdByUser.name,
        createdDate: item.createdDate,
        lastModifiedBy: item.modifiedByUser.name,
        lastModifiedDate: item.lastUpdatedDate
    };
}


/*
* Builds a payload for the public API to update an item definition with multiple parts.
* Each part is represented by a path and its corresponding payload data.    
* @param {Array<{ payloadPath: string, payloadData: any }>} parts - An array of parts to include in the payload.
* @returns {UpdateItemDefinitionPayload} - The constructed payload for the item definition update.
*/
export function buildPublicAPIPayloadWithParts(
    parts: { payloadPath: string, payloadData: any }[]
): UpdateItemDefinitionPayload {
    const itemDefinitionParts: ItemDefinitionPart[] = parts.map(({ payloadPath, payloadData }) => ({
        path: payloadPath,
        payload: btoa(JSON.stringify(payloadData)),
        payloadType: PayloadType.InlineBase64
    }));
    return {
        definition: {
            format: undefined,
            parts: itemDefinitionParts
        }
    };
}

/**
 * 
 * @param responseBody - The response body from the getItemDefinition API call.
 * @returns 
 */
export function convertGetDefinitionResponseToItemDefinition(responseBody: string): GetItemDefinitionResult {
    let itemDefinition: GetItemDefinitionResult;
    try {
        const responseItemDefinition = JSON.parse((responseBody));
        if (!responseItemDefinition?.definition?.parts || !Array.isArray(responseItemDefinition.definition.parts)) {
            throw new Error("Invalid response format: missing definition.parts array");
        }
        itemDefinition = {
            definition: {
                format: undefined,
                parts: responseItemDefinition.definition.parts.map((part: ItemDefinitionPart) => ({
                    path: part.path,
                    payload: part.payload,
                    payloadType: part.payloadType ?? "InlineBase64"
                }))
            }
        };
        console.log(`Parsed item definition is ${itemDefinition}`);
    } catch (itemDefParseError) {
        console.error(`Failed parsing item definition, responseBody: ${responseBody}`, itemDefParseError);
    }
    return itemDefinition;
}