import {
    createWorkloadClient,
    InitParams,
    NotificationToastDuration,
    NotificationType
} from '@ms-fabric/workload-client';

import * as Controller from './controller/SampleItemEditorController';
import { ItemCreationFailureData, ItemCreationSuccessData } from './models/SampleWorkloadModel';

export async function initialize(params: InitParams) {
    const workloadClient = createWorkloadClient();
    const sampleItemEditorPath = "/sample-workload-editor";
    const sampleWorkloadName = process.env.WORKLOAD_NAME;

    workloadClient.action.onAction(async function ({ action, data }) {
        switch (action) {
            case 'item.onCreationSuccess':
                const { item: createdItem } = data as ItemCreationSuccessData;
                await Controller.callPageOpen(sampleWorkloadName, `${sampleItemEditorPath}/${createdItem.objectId}`, workloadClient);

                return Promise.resolve({ succeeded: true });

            case 'item.onCreationFailure':
                const failureData = data as ItemCreationFailureData;
                await workloadClient.notification.open(
                    {
                        title: 'Error creating item',
                        notificationType: NotificationType.Error,
                        message: `Failed to create item, error code: ${failureData.errorCode}, result code: ${failureData.resultCode}`
                    });
                return;

            /**
             * This opens the Frontend-only experience, allowing to experiment with the UI without the need for CRUD operations.
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
                        displayName: 'Item settings',
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
