import { AccessToken, 
    GetItemDefinitionResult, 
    GetItemResult, 
    ItemDefinitionPart, 
    PayloadType, 
    UpdateItemDefinitionPayload, 
    UpdateItemDefinitionResult, 
    WorkloadClientAPI } 
from "@ms-fabric/workload-client";
import { GenericItem, WorkloadItem, ItemPayloadPath } from "./ItemEditorModel";


/**
 * Calls the 'itemCrud.getItem function from the WorkloadClientAPI
 * The result contains data both from Fabric
 * 
 * @param {string} objectId - The ObjectId of the item to fetch
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {boolean} isRetry - Indicates that the call is a retry
 * @returns {GetItemResult} - A wrapper for the item's data
 */
export async function callItemGet(objectId: string, workloadClient: WorkloadClientAPI, isRetry?: boolean): Promise<GetItemResult> {
    try {
        const item: GetItemResult = await workloadClient.itemCrud.getItem({ objectId });
        console.log(`Successfully fetched item ${objectId}: ${item}`)

        return item;
    } catch (exception) {
        console.error(`Failed locating item with ObjectID ${objectId}`, exception);
        return undefined;
    }
}

/**
 * Calls acquire frontend access token from the WorkloadClientAPI.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {string} scopes - The scopes for which the access token is requested.
 * @returns {AccessToken}
 */
export async function callAuthAcquireFrontendAccessToken(workloadClient: WorkloadClientAPI, scopes: string): Promise<AccessToken> {
    return workloadClient.auth.acquireFrontendAccessToken({ scopes: scopes?.length ? scopes.split(' ') : [] });
}

export async function callPublicItemUpdateDefinition(
    itemObjectId: string,
    parts: { payloadPath: string, payloadData: any }[],
    workloadClient: WorkloadClientAPI,
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

export async function callPublicItemGetDefinition(
    itemObjectId: string,
    workloadClient: WorkloadClientAPI,
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
        extendedMetdata: payload,
        createdBy: item.createdByUser.name,
        createdDate: item.createdDate,
        lastModifiedBy: item.modifiedByUser.name,
        lastModifiedDate: item.lastUpdatedDate
    };
}

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


