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
import { TableMetadata, FileMetadata } from "./SampleOneLakeItemExplorerModel";
import "./../../../styles.scss";
import { getTables, getFiles } from "./SampleOneLakeItemExplorerController";
import { PageProps } from "../../../App";
import { GenericItem as ItemMetadata } from "../../../workload/models/ItemCRUDModel";
import { TableTreeWithSchema } from "./TableTreeWithSchema";
import { TableTreeWithoutSchema } from "./TableTreeWithoutSchema";
import { FileTree } from "./FileTree";
import { readOneLakeFileAsText, getOneLakeFilePath } from "../../controller/OneLakeController";
import { callDatahubOpen } from "../../../workload/controller/DataHubController";

export function OneLakeItemExplorerComponent({ workloadClient }: PageProps) {
  const [selectedItem, setSelectedItem] = useState<ItemMetadata>(null);
  const [tablesInItem, setTablesInItem] = useState<TableMetadata[]>(null);
  const [tableSelected, setTableSelected] = useState<TableMetadata>(null);
  const [filesInItem, setFilesInItem] = useState<FileMetadata[]>(null);
  const [fileSelected, setFileSelected] = useState<TableMetadata>(null);
  const [loadingStatus, setLoadingStatus] = useState<string>("idle");
  const [isExplorerVisible, setIsExplorerVisible] = useState<boolean>(true);
  const [hasSchema, setHasSchema] = useState<boolean>(false);
  const [selectedFileContent, setSelectedFileContent] = useState<string>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedItem) {
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
  }, [selectedItem]);


  async function setTablesAndFiles(additionalScopesToConsent: string): Promise<boolean> {
    let tables = await getTables(workloadClient, selectedItem.workspaceId, selectedItem.id);
    let files = await getFiles(workloadClient, selectedItem.workspaceId, selectedItem.id);

    if (tables && files) {
      setTablesInItem(tables);
      setFilesInItem(files);
      setHasSchema(tables[0]?.schema != null);
      return true;
    }
    return false;
  }

  async function onDatahubClicked() {
    const result = await callDatahubOpen(
      workloadClient,
      ["Lakehouse",  
        process.env.WORKLOAD_NAME + "." + process.env.DEFAULT_ITEM_NAME, 
        process.env.WORKLOAD_NAME + ".CalculatorSample"],
      "Select an item to use for Frontend Sample Workload",
      false
    );

    if (!result) {
      return;
    }
    setSelectedItem(result);
    setTableSelected(null);
    setFileSelected(null);
  }

  function toggleExplorer() {
    setIsExplorerVisible(!isExplorerVisible);
  }

  function tableSelectedCallback(tableSelected: TableMetadata) {
    setTableSelected(tableSelected);
    // setTablesInItem to rerender the tree
    const updatedTables = tablesInItem.map((table: TableMetadata) => {
      return { ...table, isSelected: table.path === tableSelected.path };
    });
    setTablesInItem(updatedTables);
  }

  async function fileSelectedCallback(fileSelected: FileMetadata) {
    const fullFilePath = getOneLakeFilePath(selectedItem.workspaceId, selectedItem.id, fileSelected.path);
    const fileContent = await readOneLakeFileAsText(workloadClient, fullFilePath);
    setFileSelected(fileSelected);
    setSelectedFileContent(fileContent);
    // setFilesInItem to rerender the tree
    const updatedFiles = filesInItem.map((file: FileMetadata) => {
      return { ...file, isSelected: file.path === fileSelected.path };
    });
    setFilesInItem(updatedFiles);
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
        {selectedItem == null && isExplorerVisible && (
          <Stack className="main-body" verticalAlign="center" horizontalAlign="center" tokens={{ childrenGap: 5 }}>
            <Image src="/assets/samples/views/SampleOneLakeItemExplorer/EmptyIcon.svg" />
            <span className="add">Add an item</span>
            <Tooltip content={"Open Datahub Explorer"} relationship="label">
              <Button className="add-button" size="small" onClick={() => onDatahubClicked()} appearance="primary">
                Add
              </Button>
            </Tooltip>
          </Stack>
        )}
        {loadingStatus === "loading" && <Spinner className="main-body" label="Loading Data" />}
        {selectedItem && loadingStatus == "idle" && isExplorerVisible && (
          <Tree
            aria-label="Tables in Item"
            className="selector-body"
            size="medium"
            defaultOpenItems={["Lakehouse", "Tables", "Files", "Schemas"]}
          >
            <div className="tree-container">
              <TreeItem className="selector-tree-item" itemType="branch" value="Lakehouse">
                <Tooltip relationship="label" content={selectedItem.displayName}>
                  <TreeItemLayout
                    aside={
                      <Button appearance="subtle" icon={<ArrowSwap20Regular />} onClick={onDatahubClicked}></Button>
                    }
                  >
                    {selectedItem.displayName}
                  </TreeItemLayout>
                </Tooltip>
                <Tree className="tree" selectionMode="single">
                  <TreeItem itemType="branch" value="Tables">
                    <TreeItemLayout>Tables</TreeItemLayout>
                    <Tree className="tree" selectionMode="single">
                      {hasSchema &&
                        <TableTreeWithSchema
                          allTablesInItem={tablesInItem}
                          onSelectTableCallback={tableSelectedCallback} />
                      }
                      {!hasSchema &&
                        <TableTreeWithoutSchema
                          allTablesInItem={tablesInItem}
                          onSelectTableCallback={tableSelectedCallback} />
                      }
                    </Tree>
                  </TreeItem>
                  <TreeItem itemType="branch" value="Files">
                    <TreeItemLayout>Files</TreeItemLayout>
                    <Tree className="tree" selectionMode="single">
                      <FileTree
                        allFilesInItem={filesInItem}
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
          <p>Do you have permission to view this Item?</p>
        </div>}
      </Stack>
      <Subtitle2>Table Selected: {tableSelected?.name}</Subtitle2>
      <Subtitle2>File Selected: {fileSelected?.name}</Subtitle2>
      <Subtitle2>Selected File Content: {selectedFileContent}</Subtitle2>
    </>
  );
}
