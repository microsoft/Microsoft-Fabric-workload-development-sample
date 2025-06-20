import React from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Field, Input, Button } from '@fluentui/react-components';
import { PanelRightExpand20Regular } from '@fluentui/react-icons';
import { RootState } from "../../ClientSDKPlaygroundStore/Store";
import { setLocalSharedStateMessage } from "../../ClientSDKPlaygroundStore/actionDialogSlice";
import { callDialogOpen } from "../../../workload/controller/DialogController";
import { SharedState } from "src/App";
import "../../../styles.scss";
import { TabContentProps } from '../ClientSDKPlaygroundModel';


export function SharedStateExample(props: TabContentProps) {
    const { workloadClient, sampleWorkloadName } = props;
    const dispatch = useDispatch();
    const sharedState = workloadClient.state.sharedState as SharedState;
    const localSharedStateMessage = useSelector(
        (state: RootState) => state.actionDialog.sharedStateMessage
    );

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
            dispatch(setLocalSharedStateMessage(localSharedStateMessage));
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
                    onChange={(e) => dispatch(setLocalSharedStateMessage(e.target.value))}
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