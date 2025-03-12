import { WorkloadItem, ItemJobActionContext, ItemJobActionResult } from "./models/SampleWorkloadModel";
import { ItemJobStatus, GetItemResult } from "@ms-fabric/workload-client";
import i18n from 'i18next';

export function convertGetItemResultToWorkloadItem<T>(item: GetItemResult): WorkloadItem<T> {
    let payload: T;
    if (item.workloadPayload) {
        try {
            payload = JSON.parse(item.workloadPayload);
            console.log(`Parsed payload of item ${item.objectId} is ${payload}`);
        } catch (payloadParseError) {
            console.error(`Failed parsing payload for item ${item.objectId}, payloadString: ${item.workloadPayload}`, payloadParseError);
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

export function getJobDetailsPane(jobContext: ItemJobActionContext, hostUrl: string): ItemJobActionResult {
    const jobDetailsSection = 
    {
        title: 'Job Details',
        data: [
            {
                label: i18n.t("Job_Type"),
                value: jobTypeDisplayNames[jobContext.itemJobType],
                type: 'text',
            },
            {
                label: i18n.t("Job_Status"),
                value: ItemJobStatus[jobContext.status],
                type: 'text',
            },
            {
                label: i18n.t("Job_Start_Time_UTC"),
                value: jobContext.jobStartTimeUtc,
                type: 'text',
            },
            {
                label: i18n.t("Job_End_Time_UTC"),
                value: jobContext.jobEndTimeUtc,
                type: 'text',
            },
            {
                label: i18n.t("Job_Instance_ID"),
                value: jobContext.itemJobInstanceId,
                type: 'text',
            }                    
        ]
    }

    const itemDetailsSection = 
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
                value: jobContext.itemName,
                type: 'text',
            },
            {
                label: i18n.t("Item_ID"),
                value: jobContext.itemObjectId,
                type: 'text',
            },
            {
                label: i18n.t("Workspace_Name"),
                value: jobContext.workspaceName,
                type: 'text',
            },
            {
                label: i18n.t("Workspace_ID"),
                value: jobContext.workspaceObjectId,
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