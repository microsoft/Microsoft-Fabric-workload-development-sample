import React, { useEffect, useState } from "react";
import { PageProps } from "../../../App";
import { Stack } from "@fluentui/react";
import {
    Button,
    Combobox,
    Divider,
    Field,
    Input,
    Option
  } from "@fluentui/react-components";
  import {
    Database16Regular,
    TriangleRight20Regular,
  } from "@fluentui/react-icons";

import { EventhouseItemMetadata } from "src/samples/models/EventhouseModel";
import { CallExecuteQuery, callGetEventhouseItem } from "../../controller/EventHouseController";
import { GenericItem } from "../../../ItemEditor/ItemEditorModel";
import { callDatahubOpen } from "../../controller/CalculatorSampleItemEditorController";

export function EventhouseExplorerComponent({ workloadClient }: PageProps) {
    const [selectedEventhouse, setSelectedEventhouse] = useState<GenericItem>(undefined);
    const [selectedEventhouseItemMetadata, setSelectedEventhouseItemMetadata] = useState<EventhouseItemMetadata>(undefined);
     const [isDirtyEventhouse, setDirtyEventhouse] = useState<boolean>(false);
    const [selectedDatabaseForQuery, setSelectedDatabaseForQuery] = useState<string>(undefined);
    const [selectedQueryToExecute, setSelectedQueryToExecute] = useState<string>(undefined);
    const [queryClientRequestId, setQueryClientRequestId] = useState<string | undefined>(undefined);
    const [queryResult, setQueryResult] = useState<string>("");

    useEffect(() => {
    if (selectedEventhouse) {
        loadKqlDatabasesWhenEventhouseSelected();
    }
    }, [selectedEventhouse]);

    async function onLoadDatahubForEventhouse() {
        const result = await callDatahubOpen(
        ["KustoEventHouse"],
        "Select an Eventhouse to use for Sample Workload",
        false,
        workloadClient
        );
        if (result) {
        setSelectedEventhouse(result);
        }
    }

    async function loadKqlDatabasesWhenEventhouseSelected() {
      console.log(`loadKqlDatabasesWhenEventhouseSelected: ${selectedEventhouse}`);
      if (selectedEventhouse) {
          const result = await callGetEventhouseItem(
              workloadClient,
              selectedEventhouse.workspaceId,
              selectedEventhouse.id,              
          );
    
          if (result) {
              setSelectedEventhouseItemMetadata(result);
              setSelectedDatabaseForQuery(result.properties.databasesItemIds[0])
              setDirtyEventhouse(true);
          }
      }
    }

    function isDisabledExecuteQueryButton(): boolean {
        if(queryClientRequestId !== undefined) {
            return true;
        }

        if(isDirtyEventhouse === false) {
            return true;
        }

        if(selectedDatabaseForQuery === undefined) {
            return true;
        }

        if(!selectedQueryToExecute) {
            return true;
        }

        return false;
    }

    function isDisabledCancelButton(): boolean {
        return queryClientRequestId === undefined;
    }
    
    async function onExecuteQueryButtonClick() {
      if (selectedEventhouse) {
          const result = await CallExecuteQuery(
              workloadClient,
              selectedEventhouseItemMetadata?.properties.queryServiceUri,
              selectedDatabaseForQuery,
              selectedQueryToExecute,
              setQueryClientRequestId,
              
          );
          
          if (result) {
              setQueryResult(JSON.stringify(result));
          }
      }
    }

    async function onCancelQueryButtonClick() {
        if (queryClientRequestId) {
            console.log(`Cancelling query with requestId: ${queryClientRequestId}`);
            
            const query = `.cancel query '${queryClientRequestId}'`;
            const result = await CallExecuteQuery(
              workloadClient,
              selectedEventhouseItemMetadata?.properties.queryServiceUri,
              selectedDatabaseForQuery,
              query,
              setQueryClientRequestId              
          );
          if (result) {
            setQueryResult(JSON.stringify(result));
            console.log(`Query cancelled with result: ${result}`);
          }
        }
      }

    return(
    <span>
        <Divider alignContent="start">Selected Eventhouse Details</Divider>
        <div className="section">
            <Stack horizontal>
                <Field label="Eventhouse" orientation="horizontal" className="field">
                    <Input
                        size="small"
                        placeholder="Eventhouse Name"
                        style={{ marginLeft: "10px" }}
                        value={selectedEventhouse ? selectedEventhouse.displayName : ""}
                    />
                </Field>
                <Button
                    style={{ width: "24px", height: "24px" }}
                    icon={<Database16Regular />}
                    appearance="primary"
                    onClick={onLoadDatahubForEventhouse}
                />
            </Stack>
            <Field label="Eventhouse ID" orientation="horizontal" className="field">
                <Input size="small" placeholder="Eventhouse ID" value={selectedEventhouse ? selectedEventhouse.id : ""} />
            </Field>
        </div>

        <Divider alignContent="start">Query</Divider>
        <div className="section">
            <div style={{ marginTop: '10px' }}>
                <Field label="Database" orientation="horizontal" className="field">
                    <Combobox placeholder="" value={selectedDatabaseForQuery ?? ''} onOptionSelect={(_, opt) => setSelectedDatabaseForQuery(opt.optionValue)} size="small">
                    {(selectedEventhouseItemMetadata?.properties?.databasesItemIds || []).map((item, index) => (
                        <Option key={index} value={item}>{item}</Option>
                    ))}
                    </Combobox>
                </Field>
            </div>
            <Field label="Query Uri" orientation="horizontal" className="field">
                <Input
                    size="small"
                    placeholder="Query Uri"
                    value={selectedEventhouseItemMetadata?.properties ? selectedEventhouseItemMetadata?.properties.queryServiceUri : ""}
                    style={{ width: '400px' }}
                    disabled
                />
            </Field>
            <Field label="Query" orientation="horizontal" className="field">
                <textarea
                    placeholder="Enter your query here"
                    style={{ minWidth: '400px', minHeight: '100px', textAlign: 'left'}}
                    onChange={(e) => setSelectedQueryToExecute(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <Button
                    appearance="primary"
                    style={{ marginTop: "10px" }}
                    icon={<TriangleRight20Regular />}
                    disabled= {isDisabledExecuteQueryButton()}
                    onClick={onExecuteQueryButtonClick}>
                    Execute Query
                </Button>
                <Button
                    appearance="primary"
                    style={{ marginTop: "10px" }}
                    icon={<TriangleRight20Regular />}
                    disabled= {isDisabledCancelButton()}
                    onClick={onCancelQueryButtonClick}>
                    Cancel Query
                </Button>
                </div>
                
            </Field>
            
            <Field label="Result" orientation="horizontal" className="field">
                <textarea
                    value={queryResult}
                    style={{ minWidth: '400px', minHeight: '100px', textAlign: 'left' }}
                    readOnly
                />
            </Field>
        </div>
    </span>
    )
    
}