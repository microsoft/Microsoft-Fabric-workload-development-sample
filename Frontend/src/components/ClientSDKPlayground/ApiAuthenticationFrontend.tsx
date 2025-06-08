import { Button, Combobox, Divider, Field, Input, Option } from '@fluentui/react-components';
import { WorkloadAuthError } from "@ms-fabric/workload-client";
import jwt_decode from "jwt-decode";
import React, { useState } from "react";

import { callAuthAcquireFrontendAccessToken } from "../../controller/SampleWorkloadController";
import { PageProps } from 'src/App';

import "./../../styles.scss";

export function ApiAuthenticationFrontend({ workloadClient }: PageProps) {
    const [acquireTokenError, setAcquireTokenError] = useState<string>('');
    const [httpMethod, setHttpMethod] = useState<string>('');
    const [requestBody, setRequestBody] = useState<string>('');
    const [scopes, setScopes] = useState<string>('');
    const [serverResponse, setServerResponse] = useState<string>('');
    const [serverUrl, setServerUrl] = useState<string>('');
    const [token, setToken] = useState<string>('');
    const httpMethods = ['GET', 'PUT', 'POST'];

    return (
        <span>
            <Divider alignContent="start">Description</Divider>
            <div className="description">
                Welcome to the frontend authentication section!&#10;For this to work please make sure to add your AAD frontend application configuration to your workload manifest or configure the DEV_AAD_CONFIG_FE_APPID property in the .env.dev file for dev mode:&#10;
            </div>

            <Divider alignContent="start">Generate a token</Divider>
            <Field label="Scopes:" orientation="horizontal" className="field">
                <Input size="medium" placeholder="Scopes" onChange={e => setScopes(e.target.value)} />
            </Field>
            <div className="authButton">
                <Button className="authButton" appearance="primary" onClick={
                    () => callAuthAcquireFrontendAccessToken(workloadClient, scopes)
                        .then(result => setToken(result.token))
                        .catch((errorResult) => {
                            setToken(null);
                            console.error("Error acquiring token:", errorResult);
                            switch (errorResult.error) {
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
            <Field orientation="horizontal" className="description"> {token ? JSON.stringify(jwt_decode(token), null, "\t") : acquireTokenError} </Field>

            <Divider alignContent="start">Call an API with the token generated below</Divider>
            <Field label="API endpoint:" orientation="horizontal" className="field">
                <Input size="medium" placeholder="An API endpoint (e.g. https://onelake.dfs.fabric.microsoft.com/<workspace>...)" onChange={e => setServerUrl(e.target.value)} />
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
            <Field label="Response:" orientation="horizontal" className="field"> {serverResponse} </Field>
        </span>
    );
}

function sendWorkloadServerRequest(url: string, token: string, httpMethod: string, requestBody?: string): Promise<string> {
    if (url.length == 0) {
        return Promise.resolve('Please provide a valid url');
    }
    if (httpMethod == 'PUT') {
        return fetch(url, { method: httpMethod, body: requestBody, headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token } }).then(response => response.text());
    }
    return fetch(url, { method: httpMethod, headers: { 'Authorization': 'Bearer ' + token } }).then(response => response.text());
}