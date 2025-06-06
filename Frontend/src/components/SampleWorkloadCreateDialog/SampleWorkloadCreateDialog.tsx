import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Stack } from "@fluentui/react";
import { Field, Input, Button, Checkbox } from "@fluentui/react-components";
import { PageProps, ContextProps } from "../../App";
import { callDialogClose, callItemCreate, callPageOpen } from "../../controller/SampleWorkloadController";
import { GenericItem, CreateItemPayload } from "../../models/SampleWorkloadModel";

interface SaveAsDialogProps extends PageProps {
    isImmediateSave?: boolean;
}

export function SaveAsDialog({ workloadClient, isImmediateSave }: SaveAsDialogProps) {
    const sampleWorkloadName = process.env.WORKLOAD_NAME;
    // The type of the item in fabric is {workloadName}/{itemName}
    const sampleItemType = sampleWorkloadName + ".SampleItem";
    const sampleItemDisplayName = "Sample Workload Item";
    const sampleItemEditorPath = "/sample-workload-editor";
    const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';

    const [displayName, setDisplayName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [isSaveDisabled, setIsSaveDisabled] = useState<boolean>(true);
    const [isSaveInProgress, setIsSaveInProgress] = useState<boolean>(false);
    const [validationMessage, setValidationMessage] = useState<string>(null);
    const [promptFullConsent, setPromptFullConsent] = useState<boolean>(false);

    const pageContext = useParams<ContextProps>();

    async function onSaveClicked() {
        let createResult: boolean;
        if (isImmediateSave) {
            try {
                setIsSaveInProgress(true);
                setIsSaveDisabled(true);
                console.log(promptFullConsent);
                // raise consent dialog for the user
                //await callAuthAcquireAccessToken(workloadClient, null /*additionalScopesToConsent*/, null /*claimsForConditionalAccessPolicy*/, promptFullConsent);

                createResult = await handleCreateSampleItem(pageContext.workspaceObjectId, displayName, description);
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
                     lakehouse: { id: EMPTY_GUID, workspaceId: EMPTY_GUID }, 
                     useOneLake: false
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
            else if (createError.error?.message?.code === "PowerBICapacityValidationFailed") { 
                setValidationMessage(
                    `Your workspace is assigned to invalid capacity.\n` +
                    `Please verify that the workspace has a valid and active capacity assigned, and try again.`);
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
        <Stack className="create-dialog" data-testid="create-item-dialog">
            <Stack className="section">
                <h2>Create {sampleItemDisplayName}</h2>
                <Field label="Name:" validationMessage={validationMessage}>
                    <Input data-testid="create-dialog-name-input" onChange={e => onDisplayNameChanged(e.target.value)} defaultValue={displayName} disabled={isSaveInProgress} />
                </Field>
                <Field label="Sample description:">
                    <Input onChange={e => onDescriptionChanged(e.target.value)} defaultValue={description} disabled={isSaveInProgress} />
                </Field>
                <Checkbox label ="Request Initial Consent (Mark this if this is the first time you're working with this workload)" onChange={(v) => setPromptFullConsent(v.target.checked)}/>
                <Stack className="create-buttons" horizontal tokens={{ childrenGap: 10 }}>
                    <Button appearance="primary" onClick={() => onSaveClicked()} data-testid="create-3p-item-button" disabled={isSaveDisabled}>Create</Button>
                    <Button appearance="secondary" onClick={() => onCancelClicked()}>Cancel</Button>
                </Stack>
            </Stack>
        </Stack>
    );
}
