import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Stack } from "@fluentui/react";
import {
  Button,
  Image,
  Tree,
  TreeItem,
  TreeItemLayout,
  Spinner,
  Subtitle2,
  Tooltip,
} from "@fluentui/react-components";
import { ChevronDoubleLeft20Regular, ChevronDoubleRight20Regular, ArrowSwap20Regular } from "@fluentui/react-icons";

import { callDatahubOpen, callAuthAcquireAccessToken } from "../../controller/SampleWorkloadController";
import { TableMetadata } from "../../models/LakehouseExplorerModel";
import "./../../styles.scss";

import { getTablesInLakehouse, getTablesInLakehousePath } from "../../controller/LakehouseExplorerController";
import {  PageProps } from "../../App";
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
  const [isFrontendOnly, setIsFrontendOnly] = useState<boolean>(true);
  const pageContext = useParams<ContextProps>();

  useEffect(() => {
    const fetchTables = async () => {
      if (selectedLakehouse) {
        setLoadingStatus("loading");
        let success = false;
        try {
          success = await setTables(null);
        } catch (exception) {
          success = await setTables(".default");
        }
          setLoadingStatus( success ? "idle" : "error");
      }
    };
    fetchTables();
  }, [selectedLakehouse]);

  useEffect(() => {
    if (pageContext.itemObjectId) {
      setIsFrontendOnly(false);
    }
  }, []);

  async function setTables(additionalScopesToConsent: string) : Promise<boolean> {
    let accessToken = await callAuthAcquireAccessToken(workloadClient, additionalScopesToConsent);
    const tablePath = getTablesInLakehousePath(
      sampleWorkloadBEUrl,
      selectedLakehouse.workspaceId,
      selectedLakehouse.id
    );
    let tables = await getTablesInLakehouse(tablePath, accessToken.token);
    if (tables) {
      setTablesInLakehouse(tables);
      setHasSchema(tables[0]?.schema != null);
      return true;
    }
    return false;
  }

  async function onDatahubClicked() {
    const result = await callDatahubOpen(
      ["Lakehouse"],
      "Select a Lakehouse to use for Sample Workload",
      false,
      workloadClient
    );

    if (!result) {
      return;
    }
    setSelectedLakehouse(result);
    setTableSelected(null);
  }

  function toggleExplorer() {
    setIsExplorerVisible(!isExplorerVisible);
  }

  function tableSelectedCallback(tableSelected: TableMetadata) {
    setTableSelected(tableSelected);
    // setTablesInLakehouse to rerender the tree
    const updatedTables = tablesInLakehouse.map((table: TableMetadata) => {
      return { ...table, isSelected: table.path === tableSelected.path };
    });
    setTablesInLakehouse(updatedTables);
  }

  return (
    <>
      <Stack className={`explorer ${isExplorerVisible ? "" : "hidden-explorer"}`}>
        <div className={`top ${isExplorerVisible ? "" : "vertical-text"}`}>
          {!isExplorerVisible && (
            <Button onClick={toggleExplorer} appearance="subtle" icon={<ChevronDoubleRight20Regular />}></Button>
          )}
          <h1>Lakehouse explorer</h1>
          {isExplorerVisible && (
            <Button onClick={toggleExplorer} appearance="subtle" icon={<ChevronDoubleLeft20Regular />}></Button>
          )}
        </div>
        {selectedLakehouse == null && isExplorerVisible && (
          <Stack className="main-body" verticalAlign="center" horizontalAlign="center" tokens={{ childrenGap: 5 }}>
            <Image src="../../../internalAssets/Page.svg" />
            <span className="add">Add a Lakehouse</span>
              <Tooltip content={"Open Datahub Explorer"} relationship="label">
                <Button className="add-button" size="small" onClick={() => onDatahubClicked()} appearance="primary">
                  Add
                </Button>
              </Tooltip>
          </Stack>
        )}
        {loadingStatus === "loading" && <Spinner className="main-body" label="Loading Tables" />}
        {selectedLakehouse && loadingStatus == "idle" && isExplorerVisible && (
          <Tree
            aria-label="Tables in Lakehouse"
            className="selector-body"
            size="medium"
            defaultOpenItems={["Lakehouse", "Tables", "Schemas"]}
          >
            <div className="tree-container">
              <TreeItem className="selector-tree-item" itemType="branch" value="Lakehouse">
                <Tooltip relationship="label" content={selectedLakehouse.displayName}>
                  <TreeItemLayout
                    aside={
                      <Button appearance="subtle" icon={<ArrowSwap20Regular />} onClick={onDatahubClicked}></Button>
                    }
                  >
                    {selectedLakehouse.displayName}
                  </TreeItemLayout>
                </Tooltip>
                <Tree className="tree" selectionMode="single">
                  {hasSchema && 
                  <TableTreeWithSchema 
                    allTablesInLakehouse={tablesInLakehouse}
                    onSelectTableCallback= {tableSelectedCallback}/>
                  }
                  {!hasSchema && 
                  <TableTreeWithoutSchema
                    allTablesInLakehouse={tablesInLakehouse}
                    onSelectTableCallback= {tableSelectedCallback}/>
                  }
                </Tree>
              </TreeItem>
            </div>
          </Tree>
        )}
        {loadingStatus === "error" && isExplorerVisible && <div className="main-body">
          <Subtitle2>Error loading tables</Subtitle2>
          <p>Do you have permission to view this lakehouse?</p>
          </div>}
      </Stack>
      <Subtitle2>Table Selected: {tableSelected?.name}</Subtitle2>
    </>
  );
}
