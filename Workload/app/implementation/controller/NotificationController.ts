import { NotificationToastDuration, NotificationType, WorkloadClientAPI } from "@ms-fabric/workload-client";
import { Dispatch, SetStateAction } from "react";

/**
 * Calls the 'notification.open' function from the WorkloadClientAPI to display a notification.
 *
 * @param {string} title - The title of the notification.
 * @param {string} message - The message content of the notification.
 * @param {NotificationType} type - The type of the notification (default: NotificationType.Success).
 * @param {NotificationToastDuration} duration - The duration for which the notification should be displayed (default: NotificationToastDuration.Medium).
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {Dispatch<SetStateAction<string>>} setNotificationId - (Optional) A state setter function to update the notification ID.
 */
export async function callNotificationOpen(
    workloadClient: WorkloadClientAPI,
    title: string,
    message: string,
    type: NotificationType = NotificationType.Success,
    duration: NotificationToastDuration = NotificationToastDuration.Medium,
    setNotificationId?: Dispatch<SetStateAction<string>>) {

    const result = await workloadClient.notification.open({
        notificationType: type,
        title,
        duration,
        message
    });
    if (type == NotificationType.Success && setNotificationId) {
        setNotificationId(result?.notificationId);
    }
}

/**
 * Calls the 'notification.hide' function from the WorkloadClientAPI to hide a specific notification.
 *
 * @param {string} notificationId - The ID of the notification to hide.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {Dispatch<SetStateAction<string>>} setNotificationId - A state setter function to update the notification ID after hiding.
 */
export async function callNotificationHide(
    workloadClient: WorkloadClientAPI,
    notificationId: string,
    setNotificationId: Dispatch<SetStateAction<string>>) {

    await workloadClient.notification.hide({ notificationId });

    // Clear the notification ID from the state to reflect the hidden notification
    setNotificationId('');
}