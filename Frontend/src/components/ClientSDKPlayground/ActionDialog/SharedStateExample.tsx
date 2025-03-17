import React, { useState } from 'react';
import { Field, Input, Button } from '@fluentui/react-components';
import { PanelRightExpand20Regular } from '@fluentui/react-icons';
import { callDialogOpen } from "../../../controller/SampleWorkloadController";
import { TabContentProps } from '../../../models/SampleWorkloadModel';
import { SharedState } from "src/App";
import "../../../styles.scss";


export function SharedStateExample(props: TabContentProps) {
    const { workloadClient, sampleWorkloadName } = props;
    const [localSharedStateMessage, setLocalSharedStateMessage] = useState<string>("");
    const sharedState = workloadClient.state.sharedState as SharedState;
    sharedState.message = "";

    async function onCallSharedStatePage() {
        sharedState.message = localSharedStateMessage;

        await callDialogOpen(
            sampleWorkloadName,
            '/shared-state-page',
            360 /* width */,
            165 /* height */,
            false /* hasCloseButton */,
            workloadClient);

        if (localSharedStateMessage != sharedState.message) {
            setLocalSharedStateMessage(sharedState.message);
        }
    }

    return (
        <div className="section">
            <Field
                label="Shared State"
                orientation="horizontal"
                className="field"
            >
                <Input
                    size="small"
                    placeholder="Message"
                    value={localSharedStateMessage}
                    onChange={(e) => setLocalSharedStateMessage(e.target.value)}
                    data-testid="shared-state-input"
                />
            </Field>
            <Button
                appearance="primary"
                icon={<PanelRightExpand20Regular />}
                onClick={onCallSharedStatePage}
            >
                Open Shared State Page
            </Button>
        </div>
    );
};