import {
    createWorkloadClient,
    InitParams,
    NotificationToastDuration,
    NotificationType
} from '@ms-fabric/workload-client';

import { ItemCreationFailureData, ItemCreationSuccessData } from './workload/models/ItemCRUDModel';
import { callPageOpen } from './workload/controller/PageController';
import { callNotificationOpen } from './workload/controller/NotificationController';

export async function initialize(params: InitParams) {
    const workloadClient = createWorkloadClient();
    const sampleWorkloadName = process.env.WORKLOAD_NAME;

    workloadClient.action.onAction(async function ({ action, data }) {
        switch (action) {
            case 'item.onCreationSuccess':
                const { item: createdItem } = data as ItemCreationSuccessData;
                var path = "/item-editor";
                //TODO: check if calculator and then set correct path
                if(createdItem.itemType.indexOf('Calculator') > -1) {
                    path = "/calculator-sample-item-editor"
                }
                createdItem.itemType
                await callPageOpen(workloadClient, sampleWorkloadName, `${path}/${createdItem.objectId}`);
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


            case 'sample.Action':
                return callNotificationOpen(
                    workloadClient,
                    'Action executed',
                    'Action executed via API',
                    NotificationType.Success,
                    NotificationToastDuration.Medium);

            case 'getItemSettings': {
                return [
                    {
                        name: 'about',
                        displayName: 'About',
                        workloadSettingLocation: {
                            workloadName: sampleWorkloadName,
                            route: 'calculator-sample-item-about-dialog',
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
                            route: 'calculator-sample-item-settings-dialog',
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
