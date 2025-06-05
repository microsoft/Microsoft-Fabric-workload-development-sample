import { DefinitionPath, Item1Operator, WorkloadItem } from "./models/SampleWorkloadModel";
import { ItemJobStatus, GetItemResult, ItemJobActionResult, ItemJobDetailSection, ItemJobData, GetItemDefinitionResult, ItemDefinitionPart, UpdateItemDefinitionPayload, PayloadType } from "@ms-fabric/workload-client";
import i18n from 'i18next';

export function convertGetItemResultToWorkloadItem<T>(item: GetItemResult, itemDefinitionResult: GetItemDefinitionResult): WorkloadItem<T> {
    let payload: T;
    if (itemDefinitionResult?.definition?.parts) {
        try {
            const itemMetadata = itemDefinitionResult.definition.parts.find((part) => part.path === DefinitionPath.ItemMetadata);
            payload = itemMetadata ? JSON.parse(atob(itemMetadata?.payload)) : undefined;
        } catch (payloadParseError) {
            console.error(`Failed parsing payload for item ${item.objectId}, itemDefinitionResult: ${itemDefinitionResult}`, payloadParseError);
        }
    }

    return {
        id: item.objectId,
        workspaceId: item.folderObjectId,
        type: item.itemType,
        displayName: item.displayName,
        description: item.description,
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

const sampleWorkloadName = process.env.WORKLOAD_NAME;
const sampleItemType = sampleWorkloadName + ".SampleWorkloadItem";
const calculateAsText = sampleItemType + ".CalculateAsText";
const longRunningCalculateAsText = sampleItemType + ".LongRunningCalculateAsText";
const scheduledJob = sampleItemType + ".ScheduledJob";
const calculateAsParquet = sampleItemType + ".CalculateAsParquet";
const instantJob = sampleItemType + ".InstantJob";

export const jobTypeDisplayNames: Record<string, string> = {
    [scheduledJob]: 'Scheduled Job',
    [calculateAsText]: 'Calculate as Text',
    [longRunningCalculateAsText]: 'Long Running Calculate as Text',
    [calculateAsParquet]: 'Calculate as Parquet',
    [instantJob]: 'Instant Job'
};

export function getJobDetailsPane(jobData: ItemJobData): ItemJobActionResult {
    const jobDetailsSection: ItemJobDetailSection = 
    {
        title: 'Job Details',
        data: [
            {
                label: i18n.t("Job_Type"),
                value: jobTypeDisplayNames[jobData.itemJobType],
                type: 'text',
            },
            {
                label: i18n.t("Job_Status"),
                value: ItemJobStatus[jobData.status],
                type: 'text',
            },
            {
                label: i18n.t("Job_Start_Time_UTC"),
                value: jobData.jobStartTimeUtc?.toString(),
                type: 'text',
            },
            {
                label: i18n.t("Job_End_Time_UTC"),
                value: jobData.jobEndTimeUtc?.toString(),
                type: 'text',
            },
            {
                label: i18n.t("Job_Instance_ID"),
                value: jobData.itemJobInstanceId,
                type: 'text',
            }                    
        ]
    }

    const itemDetailsSection: ItemJobDetailSection = 
    {
        title: 'Item Details',
        data: [
            {
                label: i18n.t("Item_Type"),
                value: 'Sample Workload Item',
                type: 'text',
            },
            {
                label: i18n.t("Item_Name"),
                value: jobData.itemName,
                type: 'text',
            },
            {
                label: i18n.t("Item_ID"),
                value: jobData.itemObjectId,
                type: 'text',
            },
            {
                label: i18n.t("Workspace_Name"),
                value: jobData.workspaceName,
                type: 'text',
            },
            {
                label: i18n.t("Workspace_ID"),
                value: jobData.workspaceObjectId,
                type: 'text',
            },
            // IMPORTANT: Use the following item(as is, keeping the label and type) to show the item editor link
            {
                label: 'Item Editor',
                value: 'Open',
                type: 'link',
            },                
        ]
    }

    return {
        isSuccess: true,
        data: {
            type: 'default',
            sections: [jobDetailsSection, itemDetailsSection],
        },
    }; 
}