import React, { useState } from 'react';
import { Stack, TextField, Dropdown, PrimaryButton, Toggle } from '@fluentui/react';
import { ApiCategories, ApiDefinition, ApiParam, LakehouseApi } from './LakehouseDefintion';
import { Accordion, AccordionItem, AccordionHeader, AccordionPanel } from '@fluentui/react-components';

import {styles } from '../APIDefitnions/ADLSapis';

const apiCategories: ApiCategories = {
  Lakehouse: LakehouseApi,
// ... other categories
};

export function FabricApiPlayground(){
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [apiResponse, setApiResponse] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('Lakehouse');
  const [selectedApi, setSelectedApi] = useState<ApiDefinition | null>(apiCategories.Lakehouse[0]);

  const handleInputChange = (key: string, value: any) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const sendApiRequestToHost = () => {
    debugger;
    let endpoint = selectedApi.endpoint;
    const headers: Record<string, string> = {};
    let body: any = null;

    selectedApi.params.forEach((param) => {
      const value = formState[param.key];
      switch (param.in) {
        case 'path':
          endpoint = endpoint.replace(`{${param.key}}`, encodeURIComponent(value));
          break;
        case 'query':
          if (value !== undefined && value !== '') {
            endpoint += endpoint.includes('?') ? '&' : '?';
            endpoint += `${param.key}=${encodeURIComponent(value)}`;
          }
          break;
        case 'header':
          if (value !== undefined && value !== '') {
            headers[param.key] = value;
          }
          break;
        case 'body':
          if (body === null) {
            body = {};
          }
          body[param.key] = value;
          break;
        default:
          break;
      }
    });

    const payload = {
      method: selectedApi.method,
      endpoint: endpoint,
      headers: headers,
      body: body,
    };

    window.parent.postMessage(
      {
          type: "generic-fabric-request",
          payload,
      },
      "*"
    );

    setApiResponse('Calling API 2...');

    const listener = (event: MessageEvent) => {
      debugger;
      const { type, payload } = event.data;
      if (type === "generic-fabric-response") {
          setApiResponse(payload.success ? JSON.stringify(payload.data, null, 2) : payload.error);
          window.removeEventListener("message", listener);
      }
    };

    window.addEventListener("message", listener);

  };

  const renderInputField = (param: ApiParam) => {
    switch (param.type) {
      case 'text':
        return (
          <TextField
            label={param.label}
            value={formState[param.key] || ''}
            onChange={(_, newValue) => handleInputChange(param.key, newValue)}
            placeholder={param.description}
          />
        );
      case 'checkbox':
        return (
          <Toggle
            label={param.label}
            checked={!!formState[param.key]}
            onChange={(_, checked) => handleInputChange(param.key, checked)}
            onText="Yes"
            offText="No"
          />
        );
      case 'dropdown':
        return (
          <Dropdown
            label={param.label}
            selectedKey={formState[param.key] || undefined}
            onChange={(_, option) => handleInputChange(param.key, option?.key)}
            options={param.options?.map((opt: any) => ({ key: opt, text: opt })) || []}
            placeholder={param.description}
          />
        );
      default:
        return null;
    }
  };


  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const renderSection = (sectionLabel: string, params: ApiParam[]) => {
    const isExpanded = expandedSections[sectionLabel] || false;
    return (
      <Accordion>
        <AccordionItem value={sectionLabel}>
          <AccordionHeader onClick={() => toggleSection(sectionLabel)}>
            {sectionLabel}
          </AccordionHeader>
          <AccordionPanel>
            {isExpanded && params.map((param) => renderInputField(param))}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  };

  const handleApiSelection = (event: React.FormEvent<HTMLDivElement>, option?: any) => {
    const newApi = apiCategories[selectedCategory].find((api) => api.name === option.key);
    if (newApi) {
      setSelectedApi(newApi);
      setFormState({}); // Reset the form state for the new API
    }
  };

  const updateSelectedCategory = (opt: any) => {
    setSelectedCategory(opt.optionValue);
    setSelectedApi(apiCategories[opt.optionValue][0]);
  };

  return (
    <Stack tokens={{ childrenGap: 20, padding: 16 }}>
      {/* API Selection Dropdown */}
       <Dropdown
        label="Select Category"
        selectedKey={selectedCategory}
        onChange={updateSelectedCategory}
        options={Object.keys(apiCategories).map((category) => ({ key: category, text: category }))}
        placeholder="Choose a Category"
      />

      {/* API Selection Dropdown */}
      <Dropdown
        label="Select API"
        selectedKey={selectedApi.name}
        onChange={handleApiSelection}
        options={apiCategories[selectedCategory].map((api) => ({ key: api.name, text: api.name }))}
        placeholder="Choose an API"
      />

      {/* API Definition Card */}
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.method}>{selectedApi.method}</span>
          <h2 style={styles.name}>{selectedApi.name}</h2>
        </div>
        <p style={styles.description}>{selectedApi.description}</p>
      </div>

      {/* Dynamic Parameter Sections */}
      {renderSection('Path Parameters', selectedApi.params.filter((p) => p.in === 'path'))}
      {renderSection('Query Parameters', selectedApi.params.filter((p) => p.in === 'query'))}
      {renderSection('Header Parameters', selectedApi.params.filter((p) => p.in === 'header'))}
      {renderSection('Body Parameters', selectedApi.params.filter((p) => p.in === 'body'))}

      {/* Send Request Button */}
      <PrimaryButton text="Send Request" onClick={sendApiRequestToHost} style={styles.button} />

      {/* API Response */}
      <TextField
        label="API Response"
        multiline
        readOnly
        value={apiResponse}
        rows={10}
        style={styles.responseField}
      />
    </Stack>
  );
};