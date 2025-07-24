import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { RootState } from "../ClientSDKPlaygroundStore/Store";
import {
    initializeApiData,
    setDatahubDialogDescription,
    setDataHubMsgBoxType,
    setWorkspaceExplorerPresented,
    setMultiSelectionEnabled,
    setSelectedLinkedItem,
} from "../ClientSDKPlaygroundStore/apiDataSlice";
import "../../styles.scss";
import { TabContentProps } from "./ClientSDKPlaygroundModel";
import { callDatahubOpen, callDatahubWizardOpen } from "../../controller/DataHubController";

export function ApiData(props: TabContentProps) {
    const { sampleWorkloadName, workloadClient } = props;
    const sampleItemType = sampleWorkloadName + "." + process.env.DEFAULT_ITEM_NAME;
    /* * The sampleItemType is used to filter the items in the Data Hub.
       * It is constructed using the workload name and the default item name from the environment variables.
       * This allows the Data Hub to display only items that match this type, ensuring that the user interacts with relevant data.
       */
    const dataHubMsgBoxTypes = ["Lakehouse", 
        process.env.WORKLOAD_NAME + "." + process.env.DEFAULT_ITEM_NAME];
    const dispatch = useDispatch();

    const {
        datahubDialogDescription,
        dataHubMsgBoxType,
        isWorkspaceExplorerPresented,
        isMultiSelectionEnabled,
        selectedLinkedItem,
    } = useSelector((state: RootState) => state.apiData);

    useEffect(() => {
        if (!dataHubMsgBoxType) {
            dispatch(initializeApiData(sampleItemType));
        }
    }, [dispatch, sampleItemType, dataHubMsgBoxType]);


    async function onCallDatahubFromPlayground() {
        const result = await callDatahubOpen(
            workloadClient,
            [dataHubMsgBoxType],
            datahubDialogDescription,
            isMultiSelectionEnabled,
            isWorkspaceExplorerPresented
        );
        if (result) {
            dispatch(setSelectedLinkedItem(result));
        }
    }

    async function onCallDatahubWizardFromPlayground() {
        const result = await callDatahubWizardOpen(
            workloadClient,
            [dataHubMsgBoxType],
            "Select content",
            datahubDialogDescription,
            isWorkspaceExplorerPresented
        );
        if (result) {
            dispatch(setSelectedLinkedItem(result));
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
                        onChange={(e) => dispatch(setDatahubDialogDescription(e.target.value))}
                        data-testid="api-playground-data-hub-description"
                    />
                </Field>
                <Field label="Supported types" orientation="horizontal" className="field">
                    <Combobox
                        placeholder="Item types"
                        value={dataHubMsgBoxType}
                        data-testid="api-playground-data-hub-supported-types"
                        onOptionSelect={(_, opt) => dispatch(setDataHubMsgBoxType(opt.optionValue))}
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
                    onChange={(e) => dispatch(setWorkspaceExplorerPresented(e.target.checked))}
                />
                <Switch
                    label="Allow multiselection"
                    checked={isMultiSelectionEnabled}
                    onChange={(e) => dispatch(setMultiSelectionEnabled(e.target.checked))}
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
                <Button
                    icon={<Database16Regular />}
                    appearance="primary"
                    onClick={onCallDatahubWizardFromPlayground}
                    data-testid="api-playground-open-data-hub-wizard-btn"
                >
                    Open Data Hub Wizard
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