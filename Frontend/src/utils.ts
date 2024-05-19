import { WorkloadItem, ItemJobActionContext, ItemJobActionResult } from "./models/SampleWorkloadModel";
import { ItemJobStatus, GetItemResult } from "@ms-fabric/workload-client";


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

export function getItemEditorUrl(hostUrl: string, workspaceId: string, itemId: string): string {
    return `${hostUrl}/groups/${workspaceId}/samples/${itemId}`;
}

const sampleWorkloadName = process.env.WORKLOAD_NAME;
const sampleItemType = sampleWorkloadName + ".SampleWorkloadItem";
const calculateAsText = sampleItemType + ".CalculateAsText";
const scheduledJob = sampleItemType + ".ScheduledJob";
const calculateAsParquet = sampleItemType + ".CalculateAsParquet";

export const jobTypeDisplayNames: Record<string, string> = {
    [scheduledJob]: 'Scheduled Job',
    [calculateAsText]: 'Calculate as Text',
    [calculateAsParquet]: 'Calculate as Parquet'
};

export function getJobDetailsPane(jobContext: ItemJobActionContext, hostUrl: string): ItemJobActionResult {
    const jobDetailsSection = 
    {
        title: 'Job Details',
        data: [
            {
                label: 'job type',
                value: jobTypeDisplayNames[jobContext.itemJobType],
                type: 'text',
            },
            {
                label: 'job status',
                value: ItemJobStatus[jobContext.status],
                type: 'text',
            },
            {
                label: 'job start time UTC',
                value: jobContext.jobStartTimeUtc,
                type: 'text',
            },
            {
                label: 'job end time UTC',
                value: jobContext.jobEndTimeUtc,
                type: 'text',
            },
            {
                label: 'job intstance id',
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
                label: 'Item Type',
                value: 'Sample Workload Item',
                type: 'text',
            },
            {
                label: 'Item Name',
                value: jobContext.itemName,
                type: 'text',
            },
            {
                label: 'Item Id',
                value: jobContext.itemObjectId,
                type: 'text',
            },
            {
                label: 'Workspace Name',
                value: jobContext.workspaceName,
                type: 'text',
            },
            {
                label: 'Workspace Id',
                value: jobContext.workspaceObjectId,
                type: 'text',
            },
            {
                label: 'Item Editor',
                value: 'Open',
                type: 'link',
                url: getItemEditorUrl(hostUrl, jobContext.workspaceObjectId, jobContext.itemObjectId)
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