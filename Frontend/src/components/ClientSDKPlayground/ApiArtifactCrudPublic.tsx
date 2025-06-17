import { Button, Divider, Field, Input } from '@fluentui/react-components';
import React, { useState } from "react";
 
import { PageProps } from 'src/App';
//import { ca, callUpdateItemDefinition } from "../../controller/SampleWorkloadController";
 
import { GetItemDefinitionResult, UpdateItemDefinitionResult } from '@ms-fabric/workload-client';
import "./../../styles.scss";
import { callPublicItemGetDefinition, callPublicItemUpdateDefinition } from 'src/controller/SampleWorkloadController';
 
 
export function ApiArtifactCrudPublic({ workloadClient }: PageProps) {
    const [itemId, setItemId] = useState<string>('');
    const [format, setFormat] = useState<string>(null);
    const [updateMetadata, setUpdateMetadata] = useState<boolean>(null);
    const [payload, setPayload] = useState<string>(null);
    const [getItemDefinition, setGetItemDefinition] = useState<GetItemDefinitionResult>(null);
    const [updateItemDefinition, setUpdateItemDefinition] = useState<UpdateItemDefinitionResult>(null);
 
    return (
        <span>
            <Divider alignContent="start">Call Public CRUD API</Divider>
            <Field label="ItemId:" orientation="horizontal" className="field">
                <Input size="medium" placeholder="ItemId" onChange={e => setItemId(e.target.value)} />
            </Field>
            <Field label="Format:" orientation="horizontal" className="field">
                <Input size="medium" placeholder="Format" onChange={e => setFormat(e.target.value)} />
            </Field>
            <Field orientation="horizontal" className="description"> {getItemDefinition ? JSON.stringify(getItemDefinition, null, "\t") : "Get Item Definition Error"} </Field>
            <div className="crudButton">
                <Button className="crudButton" appearance="primary" onClick={
                    () => callPublicItemGetDefinition(itemId, workloadClient, format)
                        .then(result => {
                            setGetItemDefinition(result);
                        })
                        .catch((error) => {
                            setGetItemDefinition(error);
                        })
                }>Get Item Definition</Button>
            </div>
 
            <Divider alignContent="start">Call Public CRUD API</Divider>
            <Field label="ItemId:" orientation="horizontal" className="field">
                <Input size="medium" placeholder="ItemId" onChange={e => setItemId(e.target.value)} />
            </Field>
            <Field label="UpdateMetadata:" orientation="horizontal" className="field">
                <Input size="medium" placeholder="UpdateMetadata" onChange={e => setUpdateMetadata(e.target.value && (e.target.value.toLowerCase() == 'true' || e.target.value.toLowerCase() == 'false') ? e.target.value.toLowerCase() == 'true' : null)} />
            </Field>
            <Field label="Payload:" orientation="horizontal" className="field">
                <Input size="medium" placeholder="Payload" onChange={e => setPayload(e.target.value)} />
            </Field>
            <div className="crudButton">
                <Button className="crudButton" appearance="primary" onClick={
                    () => callPublicItemUpdateDefinition(itemId, JSON.parse(payload), workloadClient, updateMetadata)
                        .then((result) => {
                            setUpdateItemDefinition(result);
                        })
                        .catch((error) => {
                            setUpdateItemDefinition(error);
                        })
                }>Update Item Definition</Button>
            </div>
            <Field orientation="horizontal" className="description"> {updateItemDefinition ? "Item definition has been updated" : "Update Item Definition Error"} </Field>
 
        </span >
    );
}