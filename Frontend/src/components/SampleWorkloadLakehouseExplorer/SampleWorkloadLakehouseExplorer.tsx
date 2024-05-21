import React, { useEffect, useState } from "react";
import { Stack } from "@fluentui/react";
import { Button, Image, Tree, TreeItem, TreeItemLayout, TreeOpenChangeData, TreeOpenChangeEvent, Spinner, Subtitle2, Tooltip } from "@fluentui/react-components";
import { ChevronDoubleLeft20Regular, ChevronDoubleRight20Regular, ArrowSwap20Regular } from "@fluentui/react-icons";

import { callDatahubOpen, callAuthAcquireAccessToken } from "../../controller/SampleWorkloadController";
import { TableMetadata } from "../../models/LakehouseExplorerModel";
import "./../../styles.scss";

import { getTablesInLakehouse, getTablesInLakehousePath } from "../../controller/LakehouseExplorerController";
import { PageProps } from "../../App";
import { GenericItem as LakehouseMetadata } from "src/models/SampleWorkloadModel";
import { TableTreeWithSchema } from "./TableTreeWithSchema";
import { TableTreeWithoutSchema } from "./TableTreeWithoutSchema";

export function LakehouseExplorerComponent({ workloadClient }: PageProps) {
    const sampleWorkloadBEUrl = process.env.WORKLOAD_BE_URL;
    const [selectedLakehouse, setSelectedLakehouse] = useState<LakehouseMetadata>(null);
    const [tablesInLakehouse, setTablesInLakehouse] = useState<TableMetadata[]>(null);
    const [tableSelected, setTableSelected] = useState<TableMetadata>(null);
    const [loadingStatus, setLoadingStatus] = useState<string>("idle");
    const [isExplorerVisible, setIsExplorerVisible] = useState<boolean>(true);
    const [hasSchema, setHasSchema] = useState<boolean>(false);

    useEffect(() => {
        const fetchTables = async () => {
            if (selectedLakehouse) {
                setLoadingStatus("loading");
                try {
                    await setTables(null);
                } catch (exception) {
                    await setTables(".default");
                }
                setLoadingStatus("idle");
            }
        };
        fetchTables();
    }, [selectedLakehouse]);

    async function setTables(additionalScopesToConsent: string) {
        let accessToken = await callAuthAcquireAccessToken(workloadClient, additionalScopesToConsent);
        const tablePath = getTablesInLakehousePath(sampleWorkloadBEUrl, selectedLakehouse.workspaceId, selectedLakehouse.id);
        let tables = await getTablesInLakehouse(tablePath, accessToken.token);
        setTablesInLakehouse(tables);
        setHasSchema(tables[0]?.schema != null);
    }

    async function onDatahubClicked() {
        const result = await callDatahubOpen("Select a Lakehouse to use for Sample Workload", false, workloadClient);
        if (!result) {
            return;
        }
        setSelectedLakehouse(result);
        setTableSelected(null);
    }
    async function updateTableSelection(accessKey: string) {
        setTableSelected(tablesInLakehouse.find((table) => table.path === accessKey));
        // setTablesInLakehouse to rerender the tree
        const updatedTables = tablesInLakehouse.map((table: TableMetadata) => {
            return { ...table, isSelected: table.path === accessKey };
        });
        setTablesInLakehouse(updatedTables);
    }
    const onOpenChange = async (_e: TreeOpenChangeEvent, data: TreeOpenChangeData) => {
        if (data.type === "Click" || data.type === "Enter") {
            if (data.target.accessKey != "") {
                await updateTableSelection(data.target.accessKey);
            }
            return;
        }
    };
    function toggleExplorer() {
        setIsExplorerVisible(!isExplorerVisible);
    }
    return (
        <>
            <Stack className={`lakehouse_explorer ${isExplorerVisible ? "" : "hidden-explorer"}`}>
                <div className={`top ${isExplorerVisible ? "" : "vertical-text"}`}>
                    {!isExplorerVisible && <Button onClick={toggleExplorer} appearance="subtle" icon={<ChevronDoubleRight20Regular />}></Button>}
                    <h1>Lakehouse explorer</h1>
                    {isExplorerVisible && <Button onClick={toggleExplorer} appearance="subtle" icon={<ChevronDoubleLeft20Regular />}></Button>}
                </div>
                <div>
                    {selectedLakehouse == null && isExplorerVisible && (
                        <Stack className="main-body" verticalAlign="center" horizontalAlign="center" tokens={{ childrenGap: 5 }}>
                            <Image src="../../../assets/Page.svg" />
                            <span className="add-lakehouse">Add a Lakehouse</span>
                            <Button className="add-lakehouse-button" size="small" onClick={() => onDatahubClicked()} appearance="primary">
                                Add
                            </Button>
                        </Stack>
                    )}
                    {loadingStatus === "loading" && <Spinner className="main-body" label="Loading Tables" />}
                    {selectedLakehouse && loadingStatus == "idle" && isExplorerVisible && (
                        <Tree
                            onOpenChange={onOpenChange}
                            aria-label="Tables in Lakehouse"
                            className="lakehouse-selector-body"
                            size="medium"
                            defaultOpenItems={["Lakehouse", "Tables", "Schemas"]}>
                            <TreeItem className="lakehouse-selector-tree-item" itemType="branch" value="Lakehouse">
                                <Tooltip
                                relationship='label'
                                content={selectedLakehouse.displayName}>
                                    <TreeItemLayout aside={<Button appearance="subtle" icon={<ArrowSwap20Regular />} onClick={onDatahubClicked}></Button>}>
                                        {selectedLakehouse.displayName}
                                    </TreeItemLayout>
                                </Tooltip>
                                <Tree className="tree" selectionMode="single">
                                    {hasSchema && TableTreeWithSchema(tablesInLakehouse)}
                                    {!hasSchema && TableTreeWithoutSchema(tablesInLakehouse)}
                                </Tree>
                            </TreeItem>
                        </Tree>
                    )}
                </div>
            </Stack>
            <Subtitle2>Table Selected: {tableSelected?.name}</Subtitle2>
        </>
    );
}
