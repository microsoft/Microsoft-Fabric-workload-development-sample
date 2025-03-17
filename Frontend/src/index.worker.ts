import {
    ItemCreateContext,
    createWorkloadClient,
    DialogType,
    InitParams,
    NotificationToastDuration,
    NotificationType,
} from '@ms-fabric/workload-client';

import * as Controller from './controller/SampleWorkloadController';
import { ItemActionContext, ItemJobActionContext } from './models/SampleWorkloadModel';
import { getJobDetailsPane } from './utils';
import i18next from 'i18next';

export async function initialize(params: InitParams) {
    const workloadClient = createWorkloadClient();
    const sampleWorkloadName = process.env.WORKLOAD_NAME;
    const sampleItemType = sampleWorkloadName + ".SampleWorkloadItem";
    const calculateAsText = sampleItemType + ".CalculateAsText";
    const instantJob = sampleItemType + ".InstantJob";

    workloadClient.action.onAction(async function ({ action, data }) {
        switch (action) {
            /* This is the entry point for the Sample Workload Create experience, 
            as referenced by the Product->CreateExperience->Cards->onClick->action 'open.createSampleWorkload' in the localWorkloadManifest.json manifest.
             This will open a Save dialog, and after a successful creation, the editor experience of the saved sampleWorkload item will open
            */
            case 'open.createSampleWorkload':
                const { workspaceObjectId } = data as ItemCreateContext;
                return workloadClient.dialog.open({
                    workloadName: sampleWorkloadName,
                    dialogType: DialogType.IFrame,
                    route: {
                        path: `/sample-workload-create-dialog/${workspaceObjectId}`,
                    },
                    options: {
                        width: 360,
                        height: 340,
                        hasCloseButton: false
                    },
                });

            /**
             * This opens the Frontend-only experience, allowing to experiment with the UI without the need for CRUD operations.
             * This experience still allows saving the item, if the Backend is connected and registered
             */
            case 'open.createSampleWorkloadFrontendOnly':
                return workloadClient.page.open({
                    workloadName: sampleWorkloadName,
                    route: {
                        path: `/sample-workload-frontend-only`,
                    },
                });

            case 'sample.Action':
                return Controller.callNotificationOpen(
                    'Action executed',
                    'Action executed via API',
                    NotificationType.Success,
                    NotificationToastDuration.Medium,
                    workloadClient);

            case 'run.calculate.job':
                {
                    const { item } = data as ItemActionContext;
                    return await Controller.callRunItemJob(
                        item.objectId,
                        calculateAsText,
                        JSON.stringify({ metadata: 'JobMetadata' }),
                        true /* showNotification */,
                        workloadClient);
                }
               
            case 'run.instant.job':
                {
                    const { item } = data as ItemActionContext;
                    return await Controller.callRunItemJob(
                        item.objectId,
                        instantJob,
                        JSON.stringify({ metadata: 'JobMetadata' }),
                        true /* showNotification */,
                        workloadClient);
                }

            case 'item.job.retry':
                const retryJobContext = data as ItemJobActionContext;
                return await Controller.callRunItemJob(
                    retryJobContext.itemObjectId,
                    retryJobContext.itemJobType,
                    JSON.stringify({ metadata: 'JobMetadata' }),
                    true /* showNotification */,
                    workloadClient);

            case 'item.job.cancel':
                const cancelJobDetails = data as ItemJobActionContext;
                return await Controller.callCancelItemJob(cancelJobDetails.itemObjectId, cancelJobDetails.itemJobInstanceId, true, workloadClient);

            case 'item.job.detail':
                const jobDetailsContext = data as ItemJobActionContext;
                const settings = await Controller.callSettingsGet(workloadClient);
                const hostUrl = settings.workloadHostOrigin;
                const language = settings.currentFormatLocale;
                await i18next.changeLanguage(language);
                return getJobDetailsPane(jobDetailsContext, hostUrl);

            case 'getItemSettings': {
                return [
                    {
                        name: 'about',
                        displayName: 'About',
                        workloadSettingLocation: {
                            workloadName: sampleWorkloadName,
                            route: 'custom-about',
                        },
                        workloadIframeHeight: '1000px'
                    },
                    {
                        name: 'itemCustomSettings',
                        displayName: 'Item custom settings',
                        icon: {
                            name: 'apps_20_regular',
                        },
                        workloadSettingLocation: {
                            workloadName: sampleWorkloadName,
                            route: 'custom-item-settings',
                        },
                        workloadIframeHeight: '1000px'
                    }
                ];
            }
            case 'open.ClientSDKPlaygroundPage':
                return workloadClient.page.open({
                    workloadName: sampleWorkloadName,
                    route: {
                        path: `/client-sdk-playground`,
                    },
                });
            case 'open.DataApiSamplePage':
                return workloadClient.page.open({
                    workloadName: sampleWorkloadName,
                    route: {
                        path: `/data-playground`,
                    },
                });
            default:
                throw new Error('Unknown action received');
        }
    });
}
