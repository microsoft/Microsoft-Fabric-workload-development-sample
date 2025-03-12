import React, { useState } from "react";
import { Stack } from "@fluentui/react";
import {
    Button,
    Field,
    Input,
} from "@fluentui/react-components";
import { AlertOn24Regular } from "@fluentui/react-icons";
import {
    callNotificationOpen,
    callNotificationHide,
} from "../../controller/SampleWorkloadController";
import { TabContentProps } from '../../models/SampleWorkloadModel';
import "./../../styles.scss";

export function ApiNotification(props: TabContentProps) {
    const workloadClient = props.workloadClient;
    const [notificationValidationMessage, setNotificationValidationMessage] = useState<string>("");
    const [apiNotificationTitle, setNotificationTitle] = useState<string>("");
    const [apiNotificationMessage, setNotificationMessage] = useState<string>("");  
    const [notificationId, setNotificationId] = useState<string>("");
    
    function onCallNotification() {
        if (apiNotificationTitle.trim() == "") {
            setNotificationValidationMessage("Notification title is required");
            return;
        }
        setNotificationValidationMessage("");
        callNotificationOpen(
            apiNotificationTitle,
            apiNotificationMessage,
            undefined,
            undefined,
            workloadClient,
            setNotificationId
        );
    }

    function onCallNotificationHide() {
        callNotificationHide(notificationId, workloadClient, setNotificationId);
    }

    return (
        <span>
            {/* Notification API usage example */}
            <div className="section">
                <Field
                    label="Title"
                    validationMessage={notificationValidationMessage}
                    orientation="horizontal"
                    className="field"
                >
                    <Input
                        size="small"
                        placeholder="Notification Title"
                        value={apiNotificationTitle}
                        onChange={(e) => setNotificationTitle(e.target.value)}
                    />
                </Field>
                <Field
                    label="Message"
                    orientation="horizontal"
                    className="field"
                >
                    <Input
                        size="small"
                        placeholder="Notification Message"
                        value={apiNotificationMessage}
                        onChange={(e) => setNotificationMessage(e.target.value)}
                    />
                </Field>
                <Stack horizontal tokens={{ childrenGap: 10 }}>
                    <Button
                        icon={<AlertOn24Regular />}
                        appearance="primary"
                        onClick={() => onCallNotification()}
                    >
                        Send Notification
                    </Button>
                    <Button onClick={() => onCallNotificationHide()}>
                        Hide Notification
                    </Button>
                </Stack>
            </div>
        </span>
    );
}

