import jwt_decode from "jwt-decode";
import React, { useState } from "react";
import { useParams } from "react-router-dom";

import { Stack } from "@fluentui/react";
import { Button, Combobox, Divider, Field, Input, Option, Checkbox } from '@fluentui/react-components';
import { WorkloadAuthError } from "@ms-fabric/workload-client";

import { ContextProps, PageProps } from 'src/App';
import { callAuthAcquireAccessToken, callNavigationNavigate } from "../../controller/SampleWorkloadController";

export function Authentication({ workloadClient, history }: PageProps) {
    const [claimsForConditionalAccessPolicy, setClaimsForConditionalAccessPolicy] = useState<string>('');
    const [additionalScopesToConsent, setAdditionalScopesToConsent] = useState<string>('');
    const [token, setToken] = useState<string>('');
    const [acquireTokenError, setAcquireTokenError] = useState<string>('');
    const [serverUrl, setServerUrl] = useState<string>('');
    const [serverResponse, setServerResponse] = useState<string>('');
    const [httpMethod, setHttpMethod] = useState<string>('');
    const [requestBody, setRequestBody] = useState<string>('');
    const [requestDefaultConsent, setRequestDefaultConsent] = useState<boolean>(false);
    const httpMethods = ['GET', 'PUT', 'POST'];
    const pageContext = useParams<ContextProps>();
    const itemObjectId = pageContext.itemObjectId;
    return (
        <Stack className="editor">
            <h2>Authentication</h2>
            <Stack className="main">
                <Button onClick={() => callNavigationNavigate("workload", `/sample-workload-editor/${itemObjectId}`, workloadClient)}>Navigate Back</Button>
            </Stack>
            <Stack className="main">
                <div className="description">
                Welcome to the authentication section!&#10;For this to work please make sure to add your AAD application configuration to your workload manifest or localWorkloadManifest.json under "workload" for dev:&#10;
                <b>devAADAppConfig:&#10;
                &emsp;&emsp;appId: your app id&#10;
                &emsp;&emsp;redirectUri: a redirect URI that returns an html containing close() javascript function&#10;
                &emsp;&emsp;audience: your audience</b>&#10;
                </div>
            </Stack>

            <Stack className="main">
                <Divider alignContent="start">Call your server with the token generated below</Divider>
                <Field label="Server endpoint:" orientation="horizontal" className="field">
                    <Input size="medium" placeholder="Your server's endpoint (e.g. https://localhost:5001/getLakehouseFile?source=...)" onChange={e => setServerUrl(e.target.value)} />
                </Field>
                <Field label="Http method" orientation="horizontal" className="field">
                    <Combobox placeholder="method" onOptionSelect={(_, opt) => setHttpMethod(opt.optionValue)}>
                                {httpMethods.map((option) => (
                                    <Option key={option}>
                                        {option}
                                    </Option>
                                ))}
                    </Combobox>
                </Field>
                <Field label="Request body" orientation="horizontal" className="field">
                    <Input size="medium" placeholder="Content" onChange={e => setRequestBody(e.target.value)} />
                </Field>
                <div className="authButton">
                    <Button appearance="primary" onClick={
                        () => sendWorkloadServerRequest(serverUrl, token, httpMethod, requestBody).then(result => setServerResponse(result))
                        }>Call server's API</Button>
                </div>
                <Field label="Response:" orientation="horizontal" className="field"> { serverResponse } </Field>
            </Stack>

            <Stack className="main">
                <Divider alignContent="start">Generate a token</Divider>                
                <Field label="Additional scopes to consent (seperated by a space):" orientation="horizontal" className="field">
                    <Input size="medium" placeholder="Scopes" onChange={e => setAdditionalScopesToConsent(e.target.value)} />
                </Field>
                <Field label="Claims for conditional access:" orientation="horizontal" className="field">
                    <Input size="medium" placeholder="Claims" onChange={e => setClaimsForConditionalAccessPolicy(e.target.value)} />
                </Field>
                <Checkbox label ="Request Initial Consent" onChange={(v) => setRequestDefaultConsent(v.target.checked)}/>
                <div className="authButton">
                    <Button className="authButton" appearance="primary" onClick={
                        () => callAuthAcquireAccessToken(workloadClient, requestDefaultConsent? '.default' : additionalScopesToConsent, claimsForConditionalAccessPolicy)
                        .then(result => setToken(result.token))
                        .catch((errorResult) => {
                            setToken(null);
                            switch(errorResult.error) {
                                case WorkloadAuthError.WorkloadConfigError:
                                    setAcquireTokenError("Workload config error - make sure that you have added the right configuration for your AAD app!");
                                    break;
                                case WorkloadAuthError.UserInteractionFailedError:
                                    setAcquireTokenError("User interaction failed!");
                                    break;
                                case WorkloadAuthError.UnsupportedError:
                                    setAcquireTokenError("Authentication is not supported in this environment!");
                                    break;
                                default:
                                    setAcquireTokenError("Failed to fetch token");
                            }
                        })
                        }>Get access token</Button>
                </div>
                <Field orientation="horizontal" className="description"> { token ? JSON.stringify(jwt_decode(token), null, "\t") : acquireTokenError } </Field>
            </Stack>
        </Stack>
    );
}

function sendWorkloadServerRequest(url: string, token: string, httpMethod: string, requestBody?: string): Promise<string> {
    if (url.length == 0) {
        return Promise.resolve('Please provide a valid url');
    }
    if (httpMethod == 'PUT') {
        return fetch(url, {method: httpMethod, body: requestBody, headers: { 'Content-Type': 'application/json', 'Authorization' : 'Bearer ' + token}}).then(response =>  response.text());
    }

    return fetch(url, {method: httpMethod, headers: { 'Authorization' : 'Bearer ' + token}}).then(response =>  response.text());
}