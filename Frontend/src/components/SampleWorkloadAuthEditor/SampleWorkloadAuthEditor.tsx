import React, { useState } from "react";
import { Stack } from "@fluentui/react";
import { Button, Combobox, Divider, Field, Input, Option, Textarea } from '@fluentui/react-components';


export function AdlsApiTester() {
    const [adlsUrl, setAdlsUrl] = useState<string>('');
    const [httpMethod, setHttpMethod] = useState<string>('GET');
    const [jsonContent, setJsonContent] = useState<string>('');
    const [headersContent, setHeadersContent] = useState<string>('');
    const [apiResponse, setApiResponse] = useState<string>('');
    const httpMethods = ['GET', 'PUT', 'POST', 'DELETE'];

    // Send API Request as a Post Message to Host
    const sendApiRequestToHost = () => {
        if (!adlsUrl) {
            setApiResponse('Please provide a valid URL.');
            return;
        }

        const payload = {
            method: httpMethod,
            endpoint: adlsUrl,
            headers: headersContent,
            body: jsonContent || null,
        };

        window.parent.postMessage(
            {
                type: "generic-api-request",
                payload,
            },
            "*"
        );

        // Listener for Host Response
        const listener = (event: MessageEvent) => {
            debugger;
            const { type, payload } = event.data;
            if (type === "generic-api-response") {
                setApiResponse(payload.success ? JSON.stringify(payload.data, null, 2) : payload.error);
                window.removeEventListener("message", listener);
            }
        };

        window.addEventListener("message", listener);
    };

    return (
        <Stack tokens={{ childrenGap: 20 }}>
            <h2>ADLS API Tester</h2>

            <Divider alignContent="start">API Configuration</Divider>

            {/* URL Input Section */}
            <Field label="ADLS URL:" orientation="vertical">
                <Input
                    placeholder="Enter ADLS API endpoint (e.g., https://<storage-account>.dfs.core.windows.net/<filesystem>)"
                    value={adlsUrl}
                    onChange={(e) => setAdlsUrl(e.target.value)}
                />
            </Field>

            {/* HTTP Method Selection */}
            <Field label="HTTP Method:" orientation="vertical">
                <Combobox
                    placeholder="Select HTTP method"
                    value={httpMethod}
                    onOptionSelect={(_, option) => setHttpMethod(option.optionValue)}
                >
                    {httpMethods.map((method) => (
                        <Option key={method} value={method}>
                            {method}
                        </Option>
                    ))}
                </Combobox>
            </Field>

            {/* JSON Content Input */}
            <Field label="Headers Content:" orientation="vertical">
                <Textarea
                    placeholder="Enter headers content for the request body (optional)"
                    value={headersContent}
                    onChange={(e) => setHeadersContent(e.target.value)}
                    rows={10}
                />
            </Field>

            {/* JSON Content Input */}
            <Field label="JSON Content:" orientation="vertical">
                <Textarea
                    placeholder="Enter JSON content for the request body (optional)"
                    value={jsonContent}
                    onChange={(e) => setJsonContent(e.target.value)}
                    rows={10}
                />
            </Field>

            {/* Send API Request Button */}
            <Button appearance="primary" onClick={sendApiRequestToHost}>
                Send Request
            </Button>

            <Divider alignContent="start">Response</Divider>

            {/* Response Display */}
            <Field label="API Response:" orientation="vertical">
                <Textarea
                    readOnly
                    value={apiResponse}
                    placeholder="Response will be displayed here"
                    rows={10}
                />
            </Field>
        </Stack>
    );
}
