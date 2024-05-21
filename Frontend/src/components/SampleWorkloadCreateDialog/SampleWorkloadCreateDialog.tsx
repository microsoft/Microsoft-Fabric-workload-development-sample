import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Stack } from "@fluentui/react";
import { Field, Input, Button, Checkbox } from "@fluentui/react-components";
import { PageProps, ContextProps } from "../../App";
import { callAuthAcquireAccessToken, callDialogClose, callItemCreate, callPageOpen } from "../../controller/SampleWorkloadController";
import { GenericItem, CreateItemPayload } from "../../models/SampleWorkloadModel";
import { WorkloadAuthError } from "@ms-fabric/workload-client";

interface SaveAsDialogProps extends PageProps {
    isImmediateSave?: boolean;
}

export function SaveAsDialog({ workloadClient, isImmediateSave }: SaveAsDialogProps) {
    const sampleWorkloadName = process.env.WORKLOAD_NAME;
    // The type of the item in fabric is {workloadName}/{itemName}
    const sampleItemType = sampleWorkloadName + ".SampleWorkloadItem";
    const sampleItemDisplayName = "Sample Workload Item";
    const sampleItemEditorPath = "/sample-workload-editor";
    const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';

    const [displayName, setDisplayName] = useState<string>("Copy of item");
    const [description, setDescription] = useState<string>("description of item");
    const [isSaveDisabled, setIsSaveDisabled] = useState<boolean>(false);
    const [isSaveInProgress, setIsSaveInProgress] = useState<boolean>(false);
    const [validationMessage, setValidationMessage] = useState<string>(null);
    const [requestDefaultConsent, setRequestDefaultConsent] = useState<boolean>(false);

    const pageContext = useParams<ContextProps>();

    async function onSaveClicked() {
        let createResult: boolean;
        if (isImmediateSave) {
            try {
                setIsSaveInProgress(true);
                setIsSaveDisabled(true);
                 // raise consent dialog for the user
                 await callAuthAcquireAccessToken(workloadClient,  requestDefaultConsent ? '.default' : null);
                 createResult = await handleCreateSampleItem(pageContext.workspaceObjectId, displayName, description);
            } catch(error) {
                switch(error?.error) {
                    case WorkloadAuthError.WorkloadConfigError:
                        setValidationMessage("Workload config error - make sure that you have added the right configurations for your AAD app to the manifest!");
                        break;
                    case WorkloadAuthError.UnsupportedError:
                        setValidationMessage("Authentication is not supported in this environment!");
                        break;
                    default:
                        setValidationMessage("Failed to fetch token for your AAD app, please make sure you have configured your application correctly");
                }
            } finally {
                setIsSaveInProgress(false);
                setIsSaveDisabled(false);
            }
        }

        if (createResult || !isImmediateSave) {
            callDialogClose(workloadClient);
        }
    }

    async function onCancelClicked() {
        callDialogClose(workloadClient);
    }

    function onDisplayNameChanged(newValue: string) {
        setDisplayName(newValue);
        setIsSaveDisabled(newValue.trim() == "" || isSaveInProgress);
    }

    function onDescriptionChanged(newValue: string) {
        setDescription(newValue);
    }

    const handleCreateSampleItem = async (
        workspaceObjectId: string,
        displayName: string,
        description?: string): Promise<boolean> => {

        try {
            const createItemPayload: CreateItemPayload = {
                 item1Metadata: {
                     lakehouse: { id: EMPTY_GUID, workspaceId: EMPTY_GUID } 
                }
            };

            const createdItem: GenericItem = await callItemCreate(
                workspaceObjectId,
                sampleItemType,
                displayName,
                description,
                createItemPayload,
                workloadClient);

            // open editor for the new item
            await callPageOpen(sampleWorkloadName, `${sampleItemEditorPath}/${createdItem.id}`, workloadClient);
        } catch (createError) {
            // name is already in use
            if (createError.error?.message?.code === "PowerBIMetadataArtifactDisplayNameInUseException") {
                setValidationMessage(`${sampleItemDisplayName} name is already in use.`);
            }
            // capacity does not support this item type 
            else if (createError.error?.message?.code === "UnknownArtifactType") {
                setValidationMessage(`Workspace capacity does not allow ${sampleItemDisplayName} creation`);
            }
            else {
                setValidationMessage(`There was an error while trying to create a new ${sampleItemDisplayName}`);
            }
            console.error(createError);
            return false;
        }
        return true;
    };

    return (
        <Stack className="create-dialog">
            <Stack className="section">
                <h2>Create {sampleItemDisplayName}</h2>
                <Field label="Name:" validationMessage={validationMessage}>
                    <Input onChange={e => onDisplayNameChanged(e.target.value)} defaultValue={displayName} disabled={isSaveInProgress} />
                </Field>
                <Field label="Sample description:">
                    <Input onChange={e => onDescriptionChanged(e.target.value)} defaultValue={description} disabled={isSaveInProgress} />
                </Field>
                <Checkbox label ="Request Initial Consent (Mark this if this is the first time you're working with this workload)" onChange={(v) => setRequestDefaultConsent(v.target.checked)}/>
                <Stack className="create-buttons" horizontal tokens={{ childrenGap: 10 }}>
                    <Button appearance="primary" onClick={() => onSaveClicked()} disabled={isSaveDisabled}>Create</Button>
                    <Button appearance="secondary" onClick={() => onCancelClicked()}>Cancel</Button>
                </Stack>
            </Stack>
        </Stack>
    );
}
