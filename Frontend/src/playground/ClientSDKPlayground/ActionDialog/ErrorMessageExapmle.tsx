import React, { useState } from 'react';
import { Field, Input, Button } from '@fluentui/react-components';
import { PanelRightExpand20Regular } from '@fluentui/react-icons';
import { TabContentProps } from '../../../samples/models/SampleWorkloadModel';
import {
    callErrorHandlingOpenDialog,
    callErrorHandlingRequestFailure,
} from "../../../samples/controller/SampleItemEditorController";
import "../../../styles.scss";


export function ErrorMessageExapmle(props: TabContentProps) {
    const { workloadClient } = props;
    const [apiErrorTitle, setApiErrorTitle] = useState<string>("");
    const [apiErrorMessage, setApiErrorMessage] = useState<string>("");
    const [apiErrorFailureMessage, setApiErrorFailureMessage] = useState<string>("");
    const [apiErrorFailureCode, setApiErrorFailureCode] = useState<number>(1);
    const [apiErrorStatusCode, setApiErrorStatusCode] = useState<string>("");
    const [apiErrorRequestId, setApiErrorRequestId] = useState<string>("");
    const [apiErrorStackTrace, setApiErrorStackTrace] = useState<string>("");

    async function onCallOpenError() {
        await callErrorHandlingOpenDialog(
            apiErrorMessage,
            apiErrorTitle,
            apiErrorStatusCode,
            apiErrorStackTrace,
            apiErrorRequestId,
            workloadClient
        );
    }
    async function onCallErrorFailureHandling() {
        await callErrorHandlingRequestFailure(
            apiErrorFailureMessage,
            apiErrorFailureCode,
            workloadClient
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
                        onChange={(e) => setApiErrorTitle(e.target.value)}
                    />
                </Field>
                <Field label="Error Message" orientation="horizontal" className="field">
                    <Input
                        size="small"
                        placeholder="Error message"
                        value={apiErrorMessage}
                        onChange={(e) => setApiErrorMessage(e.target.value)}
                    />
                </Field>
                <Field label="Error Request ID" orientation="horizontal" className="field">
                    <Input
                        size="small"
                        placeholder="Request ID"
                        value={apiErrorRequestId}
                        onChange={(e) => setApiErrorRequestId(e.target.value)}
                    />
                </Field>
                <Field label="Error Status Code" orientation="horizontal" className="field">
                    <Input
                        size="small"
                        placeholder="Status Code"
                        value={apiErrorStatusCode}
                        onChange={(e) => setApiErrorStatusCode(e.target.value)}
                    />
                </Field>
                <Field label="Error Stack Trace" orientation="horizontal" className="field">
                    <Input
                        size="small"
                        placeholder="Stack Trace"
                        value={apiErrorStackTrace}
                        onChange={(e) => setApiErrorStackTrace(e.target.value)}
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
                        onChange={(e) => setApiErrorFailureMessage(e.target.value)}
                    />
                </Field>
                <Field label="Error Status Code" orientation="horizontal" className="field">
                    <Input
                        size="small"
                        type="number"
                        placeholder="Error Status Code"
                        value={apiErrorFailureCode.toString()}
                        onChange={(e) => setApiErrorFailureCode(e.target.valueAsNumber)}
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