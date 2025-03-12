import React, { useState } from "react";
import {
    Divider,
    Field,
    Input,
    Combobox,
    Option,
    Switch,
    Button,
} from "@fluentui/react-components";
import { Database16Regular } from "@fluentui/react-icons";
import { callDatahubOpen } from "../../controller/SampleWorkloadController";
import { GenericItem, TabContentProps } from "../../models/SampleWorkloadModel";
import "./../../styles.scss";

export function ApiData(props: TabContentProps) {
    const { sampleWorkloadName, workloadClient } = props;
    const sampleItemType = sampleWorkloadName + ".SampleWorkloadItem";
    const [datahubDialogDescription, setDatahubDialogDescription] = useState<string>("Dialog description");
    const [dataHubMsgBoxType, setDataHubMsgBoxType] = useState<string>(sampleItemType);
    const dataHubMsgBoxTypes = ["Lakehouse", sampleItemType];
    const [isWorkspaceExplorerPresented, setWorkspaceExplorerPresented] = useState<boolean>(false);
    const [isMultiSelectionEnabled, setMultiSelectionEnabled] = useState<boolean>(false);
    const [selectedLinkedItem, setSelectedLinkedItem] = useState<GenericItem>(null);

    async function onCallDatahubFromPlayground() {
        const result = await callDatahubOpen(
            [dataHubMsgBoxType],
            datahubDialogDescription,
            isMultiSelectionEnabled,
            workloadClient,
            isWorkspaceExplorerPresented
        );
        if (result) {
            setSelectedLinkedItem(result);
        }
    }

    return (
        <span>
            <Divider alignContent="start">Selected item settings</Divider>
            <div className="section">
                <Field label="Dialog description" orientation="horizontal" className="field">
                    <Input
                        size="small"
                        placeholder="Dialog description"
                        style={{ marginLeft: "10px" }}
                        value={datahubDialogDescription ?? ""}
                        onChange={(e) => setDatahubDialogDescription(e.target.value)}
                        data-testid="api-playground-data-hub-description"
                    />
                </Field>
                <Field label="Supported types" orientation="horizontal" className="field">
                    <Combobox
                        placeholder="Item types"
                        value={dataHubMsgBoxType}
                        data-testid="api-playground-data-hub-supported-types"
                        onOptionSelect={(_, opt) => setDataHubMsgBoxType(opt.optionValue)}
                    >
                        {dataHubMsgBoxTypes.map((option) => (
                            <Option key={option}>{option}</Option>
                        ))}
                    </Combobox>
                </Field>
                <Switch
                    label="Present workspace explorer"
                    data-testid="api-playground-data-hub-workspace-explorer-switch"
                    checked={isWorkspaceExplorerPresented}
                    onChange={(e) => setWorkspaceExplorerPresented(e.target.checked)}
                />
                <Switch
                    label="Allow multiselection"
                    checked={isMultiSelectionEnabled}
                    onChange={(e) => setMultiSelectionEnabled(e.target.checked)}
                    data-testid="api-playground-data-hub-multiselection-switch"
                />
                <Button
                    icon={<Database16Regular />}
                    appearance="primary"
                    onClick={onCallDatahubFromPlayground}
                    data-testid="api-playground-open-data-hub-btn"
                >
                    Open Data Hub
                </Button>
            </div>
            <div className="section">
                <Divider alignContent="start">Selected item</Divider>
                <Field label="Item name" orientation="horizontal" className="field">
                    <Input
                        size="small"
                        placeholder="Item name"
                        value={selectedLinkedItem ? selectedLinkedItem.displayName : ""}
                        data-testid={`api-playground-data-hub-selected-name-${selectedLinkedItem?.displayName}`}
                    />
                </Field>
                <Field label="Item ID" orientation="horizontal" className="field">
                    <Input
                        size="small"
                        placeholder="Item ID"
                        value={selectedLinkedItem ? selectedLinkedItem.id : ""}
                        data-testid={`api-playground-data-hub-selected-id-${selectedLinkedItem?.id}`}
                    />
                </Field>
            </div>
        </span>
    );
};