import React, { useEffect, useState } from "react";
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
import { callDatahubOpen } from "../../controller/SampleWorkloadController";
import { TableMetadata, FileMetadata } from "../../models/LakehouseExplorerModel";
import "./../../styles.scss";
import { getTables, getFiles } from "../../controller/OneLakeExplorerController";
import { PageProps } from "../../App";
import { GenericItem as LakehouseMetadata } from "src/models/SampleWorkloadModel";
import { TableTreeWithSchema } from "./TableTreeWithSchema";
import { TableTreeWithoutSchema } from "./TableTreeWithoutSchema";
import { FileTree } from "./FileTree";
import { getOneLakeFile, getOneLakeFilePath } from "../../controller/OneLakeController";

export function LakehouseExplorerComponent({ workloadClient }: PageProps) {
  const [selectedLakehouse, setSelectedLakehouse] = useState<LakehouseMetadata>(null);
  const [tablesInLakehouse, setTablesInLakehouse] = useState<TableMetadata[]>(null);
  const [tableSelected, setTableSelected] = useState<TableMetadata>(null);
  const [filesInLakehouse, setFilesInLakehouse] = useState<FileMetadata[]>(null);
  const [fileSelected, setFileSelected] = useState<TableMetadata>(null);
  const [loadingStatus, setLoadingStatus] = useState<string>("idle");
  const [isExplorerVisible, setIsExplorerVisible] = useState<boolean>(true);
  const [hasSchema, setHasSchema] = useState<boolean>(false);
  const [selectedFileContent, setSelectedFileContent] = useState<string>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedLakehouse) {
        setLoadingStatus("loading");
        let success = false;
        try {
          success = await setTablesAndFiles(null);
        } catch (exception) {
          success = await setTablesAndFiles(".default");
        }
        setLoadingStatus(success ? "idle" : "error");
      }
    };
    fetchData();
  }, [selectedLakehouse]);


  async function setTablesAndFiles(additionalScopesToConsent: string): Promise<boolean> {
    let tables = await getTables(workloadClient, selectedLakehouse.workspaceId, selectedLakehouse.id);
    let files = await getFiles(workloadClient, selectedLakehouse.workspaceId, selectedLakehouse.id);

    // Valid response from backend
    if (tables && files) {
      setTablesInLakehouse(tables);
      setFilesInLakehouse(files);
      setHasSchema(tables[0]?.schema != null);
      return true;
    }
    return false;
  }

  async function onDatahubClicked() {
    const result = await callDatahubOpen(
      ["Lakehouse", "Fabric.ClientSideAuthFERemote1.SampleWorkloadItem"],
      "Select an item to use for Lightweight Sample Workload",
      false,
      workloadClient
    );

    if (!result) {
      return;
    }
    setSelectedLakehouse(result);
    setTableSelected(null);
    setFileSelected(null);
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

  async function fileSelectedCallback(fileSelected: FileMetadata) {
    const fullFilePath = getOneLakeFilePath(selectedLakehouse.workspaceId, selectedLakehouse.id, fileSelected.path);
    const fileContent = await getOneLakeFile(workloadClient, fullFilePath);
    setFileSelected(fileSelected);
    setSelectedFileContent(fileContent);
    // setFilesInLakehouse to rerender the tree
    const updatedFiles = filesInLakehouse.map((file: FileMetadata) => {
      return { ...file, isSelected: file.path === fileSelected.path };
    });
    setFilesInLakehouse(updatedFiles);
  }

  return (
    <>
      <Stack className={`explorer ${isExplorerVisible ? "" : "hidden-explorer"}`}>
        <div className={`top ${isExplorerVisible ? "" : "vertical-text"}`}>
          {!isExplorerVisible && (
            <Button onClick={toggleExplorer} appearance="subtle" icon={<ChevronDoubleRight20Regular />}></Button>
          )}
          <h1>OneLake Explorer</h1>
          {isExplorerVisible && (
            <Button onClick={toggleExplorer} appearance="subtle" icon={<ChevronDoubleLeft20Regular />}></Button>
          )}
        </div>
        {selectedLakehouse == null && isExplorerVisible && (
          <Stack className="main-body" verticalAlign="center" horizontalAlign="center" tokens={{ childrenGap: 5 }}>
            <Image src="../../../internalAssets/Page.svg" />
            <span className="add">Add an item</span>
            <Tooltip content={"Open Datahub Explorer"} relationship="label">
              <Button className="add-button" size="small" onClick={() => onDatahubClicked()} appearance="primary">
                Add
              </Button>
            </Tooltip>
          </Stack>
        )}
        {loadingStatus === "loading" && <Spinner className="main-body" label="Loading Data" />}
        {selectedLakehouse && loadingStatus == "idle" && isExplorerVisible && (
          <Tree
            aria-label="Tables in Lakehouse"
            className="selector-body"
            size="medium"
            defaultOpenItems={["Lakehouse", "Tables", "Files", "Schemas"]}
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
                  <TreeItem itemType="branch" value="Tables">
                    <TreeItemLayout>Tables</TreeItemLayout>
                    <Tree className="tree" selectionMode="single">
                      {hasSchema &&
                        <TableTreeWithSchema
                          allTablesInLakehouse={tablesInLakehouse}
                          onSelectTableCallback={tableSelectedCallback} />
                      }
                      {!hasSchema &&
                        <TableTreeWithoutSchema
                          allTablesInLakehouse={tablesInLakehouse}
                          onSelectTableCallback={tableSelectedCallback} />
                      }
                    </Tree>
                  </TreeItem>
                  <TreeItem itemType="branch" value="Files">
                    <TreeItemLayout>Files</TreeItemLayout>
                    <Tree className="tree" selectionMode="single">
                      <FileTree
                        allFilesInLakehouse={filesInLakehouse}
                        onSelectFileCallback={fileSelectedCallback} />
                    </Tree>
                  </TreeItem>
                </Tree>
              </TreeItem>
            </div>
          </Tree>
        )}
        {loadingStatus === "error" && isExplorerVisible && <div className="main-body">
          <Subtitle2>Error loading data</Subtitle2>
          <p>Do you have permission to view this lakehouse?</p>
        </div>}
      </Stack>
      <Subtitle2>Table Selected: {tableSelected?.name}</Subtitle2>
      <Subtitle2>File Selected: {fileSelected?.name}</Subtitle2>
      <Subtitle2>Selected File Content: {selectedFileContent}</Subtitle2>
    </>
  );
}
