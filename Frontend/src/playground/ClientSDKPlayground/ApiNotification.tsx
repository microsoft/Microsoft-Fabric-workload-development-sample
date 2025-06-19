import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Stack } from "@fluentui/react";
import {
    Button,
    Field,
    Input,
} from "@fluentui/react-components";
import { AlertOn24Regular } from "@fluentui/react-icons";
import { RootState } from "../ClientSDKPlaygroundStore/Store";
import {
    setTitle,
    setMessage
} from "../ClientSDKPlaygroundStore/notificationSlice";
import {
    callNotificationOpen,
    callNotificationHide,
} from "../../samples/controller/SampleItemEditorController";
import { TabContentProps } from '../../samples/models/SampleWorkloadModel';
import "./../../styles.scss";

export function ApiNotification(props: TabContentProps) {
    const workloadClient = props.workloadClient;
    const dispatch = useDispatch();
    const [notificationValidationMessage, setNotificationValidationMessage] = useState<string>("");
    const [notificationId, setNotificationId] = useState<string>("");
    const {
        apiNotificationTitle,
        apiNotificationMessage,
    } = useSelector((state: RootState) => state.notification);

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
                        onChange={(e) => dispatch(setTitle(e.target.value))}
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
                        onChange={(e) => dispatch(setMessage(e.target.value))}
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

