import React, { useState } from 'react';
import { Button, Textarea, Combobox, Option, Label } from '@fluentui/react-components';
import { Stack, TextField } from '@fluentui/react';
import { ApiCategories, ApiDefinition, ApiParameters, LakehouseApi } from './LakehouseDefintion';
import { NotebookApis } from './NotbookDefintion';
import { SparkJobApis } from './SparkJobDefintion';

const apiCategories: ApiCategories = {
    Lakehouse: LakehouseApi,
    Notebook: NotebookApis,
    SparkJob: SparkJobApis,
  // ... other categories
};

export function FabricOneLakeTester() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Lakehouse');
  const [selectedApi, setSelectedApi] = useState<ApiDefinition | null>(apiCategories.Lakehouse[0]);
  const [parameters, setParameters] = useState<ApiParameters>({});
  const [apiResponse, setApiResponse] = useState<string>('');
  const [jsonBody, setJsonBody] = useState<string>(JSON.stringify(apiCategories.Lakehouse[0].bodySchema, null, 2) ); // State to manage the JSON body

  const callApi = () => {
    if (selectedApi) {
        let endpoint = selectedApi.endpoint;
        let body: any;
  
        try {
          body = JSON.parse(jsonBody); // Parse the user-provided JSON body
        } catch (error) {
          setApiResponse('Invalid JSON body.');
          return;
        }
  
        // Replace path parameters
        selectedApi.params.forEach((param) => {
          if (param.in === 'path') {
            const value = parameters[param.key];
            endpoint = endpoint.replace(`{${param.key}}`, encodeURIComponent(String(value)));
          }
        });
  
        const payload = {
          method: selectedApi.method,
          endpoint: endpoint,
          ...(body && { body: JSON.stringify(body) }), // Include the parsed JSON body
        };
  
        window.parent.postMessage(
          {
            type: 'generic-fabric-request',
            payload,
          },
          '*' // Replace with the actual origin for security
        );

      setApiResponse('Calling API...');

              // Listener for Host Response
              const listener = (event: MessageEvent) => {
                debugger;
                const { type, payload } = event.data;
                if (type === "generic-fabric-response") {
                    setApiResponse(payload.success ? JSON.stringify(payload.data, null, 2) : payload.error);
                    window.removeEventListener("message", listener);
                }
            };
    
            window.addEventListener("message", listener);
    }
  };

  const updateParameter = (paramName: string, value: string | boolean) => {
    setParameters((prevParams) => ({ ...prevParams, [paramName]: value }));
  };

  const updateSelectedApi = (opt: any) => {
    var selectedApi = apiCategories[selectedCategory].find((api) => api.name === opt.optionValue);
    setSelectedApi(selectedApi);
    if (selectedApi.bodySchema){
        setJsonBody(JSON.stringify(selectedApi.bodySchema, null, 2) || '')
    }else {
        setJsonBody('{}') 
    }
  };

  const updateSelectedCategory = (opt: any) => {
    setSelectedCategory(opt.optionValue);
    setSelectedApi(apiCategories[opt.optionValue][0]);
  };

  return (
    <Stack tokens={{ childrenGap: 20 }}>
      <h2>Fabric API Tester</h2>
    /* Comboboxes for selecting API category and specific API */
    <Combobox
                                    placeholder="Select API Category"
                                    value={selectedCategory}
                                    onOptionSelect={(_, opt) =>
                                        updateSelectedCategory(opt)
                                    }>
                                    {Object.keys(apiCategories).map((key) => (
                                        <Option key={key}>{key}</Option>
                                    ))}
                                </Combobox>

                                <Combobox
                                    placeholder="Select API"
                                    value={selectedApi?.name}
                                    onOptionSelect={(_, opt) => 
                                        updateSelectedApi(opt)
                                    }>
                                    {apiCategories[selectedCategory].map((category) => (
                                        <Option key={category.name}>{category.name}</Option>
                                    ))}
                                </Combobox>
                                    {/* Show description of API*/}
                                    {selectedApi?.description && (
                                        <Label>descirption: {selectedApi?.description}</Label>

      )}
    {/* Input fields for required parameters */}
      {selectedApi?.params.map((param) => (
        <TextField
          key={param.key}
          label={param.label}
          type={param.type === 'checkbox' ? 'checkbox' : 'text'}
          onChange={(e, newValue) => updateParameter(param.key, param.type === 'checkbox' ? (e.target as HTMLInputElement).checked : newValue)}
        />
      ))}
            {selectedApi?.bodySchema && (
        <Textarea
          value={jsonBody}
          onChange={(e, data) => {setJsonBody(data.value || '')}}
          rows={10}
        />
      )}
      {/* Call API button */}
      <Button onClick={callApi}>Call API</Button>
      {/* Display API response */}
      <Textarea
        readOnly
        value={apiResponse}
        placeholder="Response will be displayed here"
        rows={10}
      />
    </Stack>
  );
}