import { CreateItemParams, CreateItemResult, GetItemDefinitionResult, GetItemResult, ItemDefinitionPart, PayloadType, UpdateItemDefinitionPayload, UpdateItemDefinitionResult, UpdateItemResult, WorkloadClientAPI } from "@ms-fabric/workload-client";
import { ItemDefinitionPath, WorkloadItem, GenericItem } from "../models/ItemCRUDModel";
import { handleException } from "./ErrorHandlingController";


/**
 * This function is used to create a new item in a specified workspace.
 * It constructs the necessary parameters and invokes the createItem method of the WorkloadClientAPI.
 * 
 * It calls the 'itemCrud.createItem' function from the WorkloadClientAPI.
 *
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {string} workspaceId - WorkspaceObjectId where the item will be created
 * @param {string} itemType - Item type, as registered by the BE 
 * @param {string} displayName - Name of the item
 * @param {string} description - Description of the item (can be seen in item's Settings in Fabric)
 * @returns {GetItemResult} - A wrapper for the item's data, after it has already been saved
 */
export async function callCreateItem<T>(
    workloadClient: WorkloadClientAPI,
    workspaceId: string,
    itemType: string,
    displayName: string,
    description: string
    ): Promise<GenericItem> {


    const params: CreateItemParams = {
        workspaceObjectId: workspaceId,
        payload: {
            itemType,
            displayName,
            description,
        }
    };

    try {
        const result: CreateItemResult = await workloadClient.itemCrud.createItem(params);
        console.log(`Created item id: ${result.objectId} with name: ${displayName} in workspace: ${workspaceId}`);
        return {
            id: result.objectId,
            workspaceId: workspaceId,
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
 * This function is used to update an existing item in a specified workspace. 
 * 
 * It calls the 'itemCrud.updateItem' function from the WorkloadClientAPI.
 * 
 * 
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {string} itemId - The ObjectId of the item to update
 * @param {string} displayName - The new display name for the item
 * @param {string} description - The new description for the item
 * @returns {GetItemResult} - A wrapper for the item's data
 */
export async function callUpdateItem<T>(
    workloadClient: WorkloadClientAPI,
    itemId: string,
    displayName: string,
    description: string): Promise<UpdateItemResult> {

    try {
        return await workloadClient.itemCrud.updateItem({
            objectId: itemId,
            etag: undefined,
            payload: { displayName: displayName, description: description }
        });
    } catch (exception) {
        console.error(`Failed updating Item ${itemId}`, exception);
        return await undefined;
    }
}



/**
 * This function is used to delete an item by its ObjectId.
 * It calls the 'itemCrud.deleteItem' function from the WorkloadClientAPI.
 * 
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {string} itemId - The ObjectId of the item to delete
 */
export async function callDeleteItem(
    workloadClient: WorkloadClientAPI,
    itemId: string,
    isRetry?: boolean): Promise<boolean> {
    try {
        const result = await workloadClient.itemCrud.deleteItem({ objectId: itemId });
        console.log(`Delete result for item ${itemId}: ${result.success}`);
        return result.success;
    } catch (exception) {
        console.error(`Failed deleting Item ${itemId}`, exception);
        return await handleException(exception, workloadClient, isRetry, callDeleteItem, itemId);
    }
}

/**
 * This function is used to fetch an item by its ObjectId.
 * It calls the 'itemCrud.getItem' function from the WorkloadClientAPI.
 * 
 * Stored item definition is not fetched by this function, only the item metadata.
 * to retrieve the item definition, use callGetItemDefinition.
 * 
 * @param {string} itemId - The ItemId of the item to fetch
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {boolean} isRetry - Indicates that the call is a retry
 * @returns {GetItemResult} - A wrapper for the item's data
 */
export async function callGetItem(
    workloadClient: WorkloadClientAPI, 
    itemId: string, 
    isRetry?: boolean): Promise<GetItemResult> {
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
 * This method is used to save an item definition for a given item.
 * This method can be used for simplification if the Itemn only has a single Part that needs to be stored as part of the item definition
 * If the item definition has multiple parts, use the callUpdateItemDefinition function instead and parse the parts individually.
 * 
 * It calls the 'itemCrudPublic.updateItemDefinition' function from the WorkloadClientAPI.
 * 
 * It updates the item definition for a given item with the provided definition.
 * 
 * This function is a wrapper around the callUpdateItemDefinition function and returns the result of the update.
 * 
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.        
 * @param {string} itemId - The ID of the item to update.
 * @param {T} definition - The data to save as the item definition.
 * @returns {Promise<UpdateItemDefinitionResult>} - The result of the item definition update.
 */
export async function saveItemDefinition<T>(
    workloadClient: WorkloadClientAPI, 
    itemId: string, 
    definition: T): Promise<UpdateItemDefinitionResult> {

        return callUpdateItemDefinition(workloadClient, itemId, [
        { 
            payloadPath: ItemDefinitionPath.Default, 
            payloadData: definition
        }], false);
}

/** 
 * This function retrieves the item definition for a given item by its ObjectId.
 * This method can be used for simplification if the Item only has a single Part that needs to be retrieved as part of the item definition.
 * If your item contains multiple parts, use the callGetItemDefinition function instead and parse the parts individually.
 * 
 * It calls the 'itemCrudPublic.getItemDefinition' function from the WorkloadClientAPI.
 * 
 * It returns the item definition if available, otherwise undefined.
 * 
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.    
 * @param {string} itemId - The ObjectId of the item to retrieve.
 * @returns {Promise<T>} - The item definition if available, otherwise undefined.
 */ 
export async function getItemDefinition<T>(
    workloadClient: WorkloadClientAPI,
    itemId: string): Promise<T> {
        const workloadITem = await getWorkloadItem<T>(workloadClient, itemId);
        if (workloadITem && workloadITem.definition) {
            return workloadITem.definition;
        }
        return undefined  
}

/** 
 * This function retrieves a WorkloadItem by its ObjectId.
 * It calls the 'itemCrudPublic.getItem' and 'itemCrudPublic.getItemDefinition' functions from the WorkloadClientAPI.
 * It returns a WorkloadItem containing the item metadata and definition.
 * 
 * If the item definition is not available, it will return a WorkloadItem with the default definition provided.
 * 
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.    
 * @param {string} itemObjectId - The ObjectId of the item to retrieve.
 * @returns {Promise<WorkloadItem<T>>} - A promise that resolves to the WorkloadItem.
 */
export async function getWorkloadItem<T>(
    workloadClient: WorkloadClientAPI,
    itemObjectId: string,
    defaultDefinition?: T): Promise<WorkloadItem<T>> {
        const getItemResult = await callGetItem(workloadClient, itemObjectId);
        const getItemDefinitionResult = await callGetItemDefinition(workloadClient, itemObjectId);
        const item = convertGetItemResultToWorkloadItem<T>(getItemResult, getItemDefinitionResult, defaultDefinition);
        return item;
    }


/** 
 * This function is used to update an item definition for a given item. 
 * It calls the 'itemCrudPublic.updateItemDefinition' function from the WorkloadClientAPI.
 * * It updates the item definition for a given item with the provided definition parts.
 * 
 * It constructs the payload using the provided definition parts and calls the updateItemDefinition method.
 * 
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {string} itemId - The ObjectId of the item to update.
 * @param {Array<{ payloadPath: string, payloadData: any }>} definitionParts - An array of parts to update in the item definition.        
 * @param {boolean} updateMetadata - Indicates whether to update metadata.
 * @param {boolean} isRetry - Indicates that the call is a retry.
 * @returns {Promise<UpdateItemDefinitionResult>} - The result of the item definition update.
 */
export async function callUpdateItemDefinition(
    workloadClient: WorkloadClientAPI,
    itemId: string,
    definitionParts: { payloadPath: string, payloadData: any }[],
    updateMetadata: boolean = false): Promise<UpdateItemDefinitionResult> {

    const itemDefinitions: UpdateItemDefinitionPayload = buildPublicAPIPayloadWithParts(definitionParts);
    try {
        return await workloadClient.itemCrudPublic.updateItemDefinition({
            itemId: itemId,
            payload: itemDefinitions,
            updateMetadata: updateMetadata
        });
    } catch (exception) {
        console.error(`Failed updating Item definition ${itemId}`, exception);
        return undefined
    }
}

/**
 * This function retrieves the item definition for a given item by its ObjectId.
 * It calls the 'itemCrudPublic.getItemDefinition' function from the WorkloadClientAPI.
 * 
 * It returns the item definition if available, otherwise undefined.
 * 
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {string} itemId - The ObjectId of the item to retrieve the definition for.
 * @param {string} format - The format of the item definition to retrieve (optional).
 * @param {boolean} isRetry - Indicates that the call is a retry.
 * @returns {Promise<GetItemDefinitionResult>} - The item definition result if successful, otherwise undefined.
 */ 
export async function callGetItemDefinition(
    workloadClient: WorkloadClientAPI,
    itemId: string,
    format?: string): Promise<GetItemDefinitionResult> {
    try {
        const itemDefinition: GetItemDefinitionResult = await workloadClient.itemCrudPublic.getItemDefinition({
            itemId: itemId,
            format: format
        });
        console.log(`Successfully fetched item definition for item ${itemId}: ${itemDefinition}`);
        return itemDefinition;
    } catch (exception) {
        console.error(`Failed getting Item definition ${itemId}`, exception);
        return undefined;
    }
}

/** 
 * This function converts a GetItemResult and GetItemDefinitionResult into a WorkloadItem.  
 * It extracts the necessary metadata and payload from the item definition parts.
 * It handles the parsing of the payload and platform metadata, and returns a WorkloadItem.
 * 
 * If the item definition parts are not available or parsing fails, it will log an error and return a WorkloadItem with undefined payload.
 * 
 * @param {GetItemResult} item - The item result to convert.
 * @param {GetItemDefinitionResult} itemDefinitionResult - The item definition result to convert.
 * @returns {WorkloadItem<T>} - The converted WorkloadItem.
 */
export function convertGetItemResultToWorkloadItem<T>(
        item: GetItemResult, 
        itemDefinitionResult: GetItemDefinitionResult, 
        defaultDefinition?: T): WorkloadItem<T> {            
    let payload: T;
    let itemPlatformMetadata: GenericItem | undefined;
    if (itemDefinitionResult?.definition?.parts) {
        try {
            const itemMetadata = itemDefinitionResult.definition.parts.find((part) => part.path === ItemDefinitionPath.Default);
            payload = itemMetadata ? JSON.parse(atob(itemMetadata?.payload)) : undefined;

            const platformDefinition = itemDefinitionResult.definition.parts.find((part) => part.path === ItemDefinitionPath.Platform);
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
        definition: payload ?? defaultDefinition,
        createdBy: item.createdByUser.name,
        createdDate: item.createdDate,
        lastModifiedBy: item.modifiedByUser.name,
        lastModifiedDate: item.lastUpdatedDate
    };
}


/**
 * This function constructs a payload for the public API to update an item definition.
 * It allows for multiple parts to be included in the payload, each represented by a path and its corresponding payload data.
 * Each part is encoded in Base64 format and marked with the PayloadType of InlineBase64.
 *
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
 * This function converts a JSON response from the getItemDefinition API call
 * into a structured GetItemDefinitionResult object.
 *
 * @param responseBody - The response body from the getItemDefinition API call.
 * @returns {GetItemDefinitionResult} - The structured item definition result.
 * @throws {Error} - If the response format is invalid or if parsing fails.
 * 
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