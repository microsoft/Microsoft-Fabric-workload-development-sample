import { DefinitionPath, GenericItem, Item1Operator, WorkloadItem } from "./models/SampleWorkloadModel";
import { GetItemResult, GetItemDefinitionResult, ItemDefinitionPart, UpdateItemDefinitionPayload, PayloadType } from "@ms-fabric/workload-client";

export function convertGetItemResultToWorkloadItem<T>(item: GetItemResult, itemDefinitionResult: GetItemDefinitionResult): WorkloadItem<T> {
    let payload: T;
    let itemPlatformMetadata: GenericItem | undefined;
    if (itemDefinitionResult?.definition?.parts) {
        try {
            const itemMetadata = itemDefinitionResult.definition.parts.find((part) => part.path === DefinitionPath.ItemMetadata);
            payload = itemMetadata ? JSON.parse(atob(itemMetadata?.payload)) : undefined;

            const platformDefinition = itemDefinitionResult.definition.parts.find((part) => part.path === DefinitionPath.Platform);
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
    parts: { payloadPath: DefinitionPath, payloadData: any }[]
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

export function calculateResult(op1: number, op2: number, calculationOperator: Item1Operator): number {
    switch (calculationOperator) {
        case Item1Operator.Add:
            return op1 + op2;
        case Item1Operator.Subtract:
            return op1 - op2;
        case Item1Operator.Multiply:
            return op1 * op2;
        case Item1Operator.Divide:
            if (op2 !== 0) {
                return op1 / op2;
            } else {
                throw new Error("Cannot divide by zero.");
            }
        case Item1Operator.Random:
            // Math.random() returns a float between 0 and 1, so we use Math.floor and scale
            const min = Math.min(op1, op2);
            const max = Math.max(op1, op2);
            const rand = Math.floor(Math.random() * (max - min + 1)) + min;
            return rand;
        default:
            throw new Error(`Unsupported operator: ${calculationOperator}`);
    }
}

export function formatResult(op1: number, op2: number, calculationOperator: Item1Operator, result: number): string {
    return `op1 = ${op1}, op2 = ${op2}, operator = ${calculationOperator}, result = ${result}`;
}
