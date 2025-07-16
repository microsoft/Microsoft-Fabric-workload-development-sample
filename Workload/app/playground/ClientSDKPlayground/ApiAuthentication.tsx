import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Combobox, Input, Option, Card } from '@fluentui/react-components';
import { RootState } from "../ClientSDKPlaygroundStore/Store";
import {
    setServerUrl,
    setServerResponse,
    setHttpMethod,
    setRequestBody
} from "../ClientSDKPlaygroundStore/apiAuthenticationSlice";
import { PageProps } from '../../App';
import "../../styles.scss";

export function ApiAuthentication({ workloadClient }: PageProps) {
    const dispatch = useDispatch();
    const {
        token,
        serverUrl,
        serverResponse,
        httpMethod,
        requestBody,
    } = useSelector((state: RootState) => state.apiAuthentication);
    const httpMethods = ['GET', 'PUT', 'POST'];

    return (
        <div className="api-authentication">
            <Card className="card">
                <h3>Description</h3>
                <div className="card-content">
                    <div className="description">
                        Welcome to the authentication section!&#10;For this to work please make sure to add your AAD application configuration to your workload manifest or localWorkloadManifest.json under "workload" for dev:&#10;
                        <b>devAADAppConfig:&#10;
                            &emsp;&emsp;appId: your app id&#10;
                            &emsp;&emsp;redirectUri: a redirect URI that returns an html containing close() javascript function&#10;
                            &emsp;&emsp;audience: your audience</b>&#10;
                    </div>
                </div>
            </Card>

            <Card className="card">
                <h3>Call your server with the token generated below</h3>
                <div className="card-content">
                    <div className="field-group">
                        <div className="api-authentication-field">
                            <label className="api-authentication-field-label">Server endpoint:</label>
                            <Input
                                className="api-authentication-input"
                                size="medium"
                                placeholder="Your server's endpoint (e.g. https://localhost:5001/getLakehouseFile?source=...)"
                                value={serverUrl}
                                onChange={e => dispatch(setServerUrl(e.target.value))}
                            />
                        </div>
                        <div className="api-authentication-field">
                            <label className="api-authentication-field-label">Http method:</label>
                            <Combobox
                                className="api-authentication-input"
                                placeholder="method"
                                value={httpMethod}
                                onOptionSelect={(_, opt) => dispatch(setHttpMethod(opt.optionValue))}
                            >
                                {httpMethods.map((option) => (
                                    <Option key={option}>
                                        {option}
                                    </Option>
                                ))}
                            </Combobox>
                        </div>
                        <div className="api-authentication-field">
                            <label className="api-authentication-field-label">Request body:</label>
                            <Input
                                className="api-authentication-input"
                                size="medium"
                                placeholder="Content"
                                value={requestBody}
                                onChange={e => dispatch(setRequestBody(e.target.value))}
                            />
                        </div>
                        <div className="api-authentication-field">
                            <label className="api-authentication-field-label"></label>
                            <Button className="authButton" appearance="primary" onClick={
                                () => sendWorkloadServerRequest(serverUrl, token, httpMethod, requestBody).then(result => dispatch(setServerResponse(result)))
                            }>Call server's API</Button>
                        </div>
                        <div className="api-authentication-field">
                            <label className="api-authentication-field-label">Response:</label>
                            <textarea
                                className="api-authentication-textarea"
                                rows={10}
                                readOnly
                                value={serverResponse}
                            />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
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