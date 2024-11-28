import React, { useState } from 'react';
import { Stack, TextField, Dropdown, PrimaryButton, Toggle } from '@fluentui/react';
import { ApiDefinition, ApiParam } from './LakehouseDefintion';
import { Accordion, AccordionItem, AccordionHeader, AccordionPanel } from '@fluentui/react-components';


const adlsApiDefinition: ApiDefinition = {
  name: 'ADLS API',
  description: 'ADLS API for various operations',
  method: 'PATCH',
  endpoint: '/{workspaceId}/{artifactId}/{path}',
  params: [
      {
        key: 'workspaceId',
        label: 'Workspace ID',
        type: 'text',
        in: 'path',
        description: 'The workspace identifier',
      },
      {
        key: 'artifactId',
        label: 'Artifact ID',
        type: 'text',
        in: 'path',
        description: 'The artifact identifier',
      },
      {
        key: 'path',
        label: 'Path',
        type: 'text',
        in: 'path',
        description: 'The file or directory path',
      },
      {
        key: 'action',
        label: 'Action',
        type: 'dropdown',
        in: 'query',
        options: ['append', 'flush', 'setProperties', 'setAccessControl'],
        description: 'The action to perform on the resource',
      },
      {
        key: 'position',
        label: 'Position',
        type: 'text',
        in: 'query',
        description: 'The position where the data is to be appended',
      },
      {
        key: 'retainUncommittedData',
        label: 'Retain Uncommitted Data',
        type: 'checkbox',
        in: 'query',
        description: 'Whether to retain uncommitted data after the flush operation',
      },
      {
        key: 'close',
        label: 'Close',
        type: 'checkbox',
        in: 'query',
        description: 'Whether to close the file stream after the flush operation',
      },
      {
        key: 'contentLength',
        label: 'Content-Length',
        type: 'text',
        in: 'header',
        description: 'The length of the request content in bytes',
      },
      {
        key: 'contentMD5',
        label: 'Content-MD5',
        type: 'text',
        in: 'header',
        description: 'An MD5 hash of the request content',
      },
      {
        key: 'leaseId',
        label: 'Lease ID',
        type: 'text',
        in: 'header',
        description: 'The lease ID if there is an active lease',
      },
      {
        key: 'cacheControl',
        label: 'Cache-Control',
        type: 'text',
        in: 'header',
        description: 'The cache control directives for the resource',
      },
      {
        key: 'contentType',
        label: 'Content-Type',
        type: 'text',
        in: 'header',
        description: 'The content type of the resource',
      },
      {
        key: 'contentDisposition',
        label: 'Content-Disposition',
        type: 'text',
        in: 'header',
        description: 'The content disposition of the resource',
      },
      {
        key: 'contentEncoding',
        label: 'Content-Encoding',
        type: 'text',
        in: 'header',
        description: 'The content encoding of the resource',
      },
      {
        key: 'contentLanguage',
        label: 'Content-Language',
        type: 'text',
        in: 'header',
        description: 'The content language of the resource',
      },
      {
        key: 'contentMd5Header',
        label: 'Content-MD5 Header',
        type: 'text',
        in: 'header',
        description: 'The MD5 hash of the resource content',
      },
      {
        key: 'properties',
        label: 'Properties',
        type: 'text',
        in: 'header',
        description: 'User-defined properties in the format of a comma-separated list',
      },
      {
        key: 'owner',
        label: 'Owner',
        type: 'text',
        in: 'header',
        description: 'The owner of the file or directory',
      },
      {
        key: 'group',
        label: 'Group',
        type: 'text',
        in: 'header',
        description: 'The owning group of the file or directory',
      },
      {
        key: 'permissions',
        label: 'Permissions',
        type: 'text',
        in: 'header',
        description: 'POSIX access permissions for the resource',
      },
      {
        key: 'acl',
        label: 'ACL',
        type: 'text',
        in: 'header',
        description: 'POSIX access control list for the resource',
      },
      {
        key: 'ifMatch',
        label: 'If-Match',
        type: 'text',
        in: 'header',
        description: 'Perform the operation only if the resource\'s ETag matches',
      },
      {
        key: 'ifNoneMatch',
        label: 'If-None-Match',
        type: 'text',
        in: 'header',
        description: 'Perform the operation only if the resource\'s ETag does not match',
      },
      {
        key: 'ifModifiedSince',
        label: 'If-Modified-Since',
        type: 'text',
        in: 'header',
        description: 'Perform the operation only if the resource has been modified since the specified date',
      },
      {
        key: 'ifUnmodifiedSince',
        label: 'If-Unmodified-Since',
        type: 'text',
        in: 'header',
        description: 'Perform the operation only if the resource has not been modified since the specified date',
      },
      {
        key: 'requestBody',
        label: 'Request Body',
        type: 'text',
        in: 'body',
        description: 'The data to be uploaded and appended to the file',
      },
    // Add other parameters as needed
  ],
  bodySchema: {}, // Define the schema if needed
};

export function AdlsApiPlayground(){
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [apiResponse, setApiResponse] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const handleInputChange = (key: string, value: any) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const sendApiRequestToHost = () => {
    let endpoint = adlsApiDefinition.endpoint;
    const headers: Record<string, string> = {};
    let body: any = null;

    adlsApiDefinition.params.forEach((param) => {
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
          body = value;
          break;
        default:
          break;
      }
    });

    const payload = {
      method: adlsApiDefinition.method,
      endpoint: endpoint,
      headers: headers,
      body: body,
    };

    window.parent.postMessage(
      {
          type: "generic-api-request",
          payload,
      },
      "*"
    );

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

  return (
    <Stack tokens={{ childrenGap: 20 }}>
      <h2>{adlsApiDefinition.name}</h2>
      <p>{adlsApiDefinition.description}</p>
      {renderSection('Path Parameters', adlsApiDefinition.params.filter((p) => p.in === 'path'))}
      {renderSection('Query Parameters', adlsApiDefinition.params.filter((p) => p.in === 'query'))}
      {renderSection('Header Parameters', adlsApiDefinition.params.filter((p) => p.in === 'header'))}
      {renderSection('Body Parameters', adlsApiDefinition.params.filter((p) => p.in === 'body'))}
      <PrimaryButton text="Send Request" onClick={sendApiRequestToHost} />
      <TextField
        label="API Response"
        multiline
        readOnly
        value={apiResponse}
        rows={10}
      />
    </Stack>
  );
};