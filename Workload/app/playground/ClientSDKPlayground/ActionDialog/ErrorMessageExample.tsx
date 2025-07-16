import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Field, Input, Button } from '@fluentui/react-components';
import { PanelRightExpand20Regular } from '@fluentui/react-icons';
import { RootState } from '../../ClientSDKPlaygroundStore/Store';
import {
    updateApiErrorTitle,
    updateApiErrorStatusCode,
    updateApiErrorMessage,
    updateApiErrorFailureMessage,
    updateApiErrorFailureCode,
    updateApiErrorRequestId,
    updateApiErrorStackTrace,
} from '../../ClientSDKPlaygroundStore/actionDialogSlice';
import {
    callErrorHandlingOpenDialog,
    callErrorHandlingRequestFailure,
} from "../../../workload/controller/ErrorHandlingController";
import "../../../styles.scss";
import { TabContentProps } from '../ClientSDKPlaygroundModel';


export function ErrorMessageExample(props: TabContentProps) {
    const { workloadClient } = props;
    const dispatch = useDispatch();
    const {
        apiErrorTitle,
        apiErrorMessage,
        apiErrorRequestId,
        apiErrorStatusCode,
        apiErrorStackTrace,
        apiErrorFailureMessage,
        apiErrorFailureCode,
    } = useSelector((state: RootState) => state.actionDialog);
    

    async function onCallOpenError() {
        await callErrorHandlingOpenDialog(
            workloadClient,
            apiErrorMessage,
            apiErrorTitle,
            apiErrorStatusCode,
            apiErrorStackTrace,
            apiErrorRequestId,            
        );
    }
    async function onCallErrorFailureHandling() {
        await callErrorHandlingRequestFailure(
            workloadClient,
            apiErrorFailureMessage,
            apiErrorFailureCode
        );
    }

    return (
        <>
            <div className="section">
                <Field label="Error Title" orientation="horizontal" className="field">
                    <Input
                        size="small"
                        placeholder="Error title"
                        value={apiErrorTitle}
                        onChange={(e) => dispatch(updateApiErrorTitle(e.target.value))}
                    />
                </Field>
                <Field label="Error Message" orientation="horizontal" className="field">
                    <Input
                        size="small"
                        placeholder="Error message"
                        value={apiErrorMessage}
                        onChange={(e) => dispatch(updateApiErrorMessage(e.target.value))}
                    />
                </Field>
                <Field label="Error Request ID" orientation="horizontal" className="field">
                    <Input
                        size="small"
                        placeholder="Request ID"
                        value={apiErrorRequestId}
                        onChange={(e) => dispatch(updateApiErrorRequestId(e.target.value))}
                    />
                </Field>
                <Field label="Error Status Code" orientation="horizontal" className="field">
                    <Input
                        size="small"
                        placeholder="Status Code"
                        value={apiErrorStatusCode}
                        onChange={(e) => dispatch(updateApiErrorStatusCode(e.target.value))}
                    />
                </Field>
                <Field label="Error Stack Trace" orientation="horizontal" className="field">
                    <Input
                        size="small"
                        placeholder="Stack Trace"
                        value={apiErrorStackTrace}
                        onChange={(e) => dispatch(updateApiErrorStackTrace(e.target.value))}
                    />
                </Field>
                <Button
                    appearance="primary"
                    icon={<PanelRightExpand20Regular />}
                    onClick={onCallOpenError}
                >
                    Open Error
                </Button>
            </div>
            <div className="section">
                <Field label="Error" orientation="horizontal" className="field">
                    <Input
                        size="small"
                        placeholder="Error message"
                        value={apiErrorFailureMessage}
                        onChange={(e) => dispatch(updateApiErrorFailureMessage(e.target.value))}
                    />
                </Field>
                <Field label="Error Status Code" orientation="horizontal" className="field">
                    <Input
                        size="small"
                        type="number"
                        placeholder="Error Status Code"
                        value={apiErrorFailureCode.toString()}
                        onChange={(e) => dispatch(updateApiErrorFailureCode(e.target.valueAsNumber))}
                    />
                </Field>
                <Button
                    appearance="primary"
                    icon={<PanelRightExpand20Regular />}
                    onClick={onCallErrorFailureHandling}
                >
                    Call Request Failure Handling
                </Button>
            </div>
        </>
    );
};