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
import "../../../styles.scss";
import { getTables, getFiles } from "./SampleOneLakeItemExplorerController";
import { PageProps } from "../../../App";
import { Item } from "../../../clients/FabricPlatformTypes";
import { TableTreeWithSchema } from "./TableTreeWithSchema";
import { TableTreeWithoutSchema } from "./TableTreeWithoutSchema";
import { FileTree } from "./FileTree";
import { getOneLakeFilePath } from "../../../clients/OneLakeClient";
import { callDatahubOpen } from "../../../controller/DataHubController";
import { ItemReference } from "../../../controller/ItemCRUDController";

export interface OneLakeItemExplorerItem extends ItemReference {
  displayName: string;
}

export interface OneLakeItemExplorerComponentProps extends PageProps {
  onFileSelected(fileName: string, oneLakeLink: string): Promise<void>;
  onTableSelected(tableName: string, oneLakeLink: string): Promise<void>;
  onItemChanged(item: Item): Promise<void>,
  config: {
    // Configuration options for the component
    initialItem?: OneLakeItemExplorerItem;
    allowedItemTypes?: string[];
    allowItemSelection: boolean;
    refreshTrigger?: number; // Timestamp to trigger refresh
  };
}

export function OneLakeItemExplorerComponent(props: OneLakeItemExplorerComponentProps) {
  const [selectedItem, setSelectedItem] = useState<OneLakeItemExplorerItem>(null);

  const [tablesInItem, setTablesInItem] = useState<TableMetadata[]>(null);
  const [filesInItem, setFilesInItem] = useState<FileMetadata[]>(null);
  const [loadingStatus, setLoadingStatus] = useState<string>("idle");
  const [isExplorerVisible, setIsExplorerVisible] = useState<boolean>(true);
  const [hasSchema, setHasSchema] = useState<boolean>(false);

  // Initialize selectedItem from props.initialItem
  useEffect(() => {
    if (props.config.initialItem && 
        props.config.initialItem.id && 
        props.config.initialItem.workspaceId) {
        setSelectedItem(props.config.initialItem);
    } else {
      // No initial item provided, show empty state
      setLoadingStatus("idle");
    }
  }, [props.config.initialItem]);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedItem && selectedItem.id && selectedItem.workspaceId) {
        setLoadingStatus("loading");
        let success = false;
        try {
          success = await setTablesAndFiles(null);
        } catch (exception) {
          try {
            success = await setTablesAndFiles(".default");
          } catch (secondException) {
            console.error("SampleOneLakeItemExplorer: Failed to load data for item:", selectedItem, secondException);
            success = false;
          }
        }
        setLoadingStatus(success ? "idle" : "error");
      } else if (selectedItem) {
        // selectedItem exists but is missing required properties
        console.error("SampleOneLakeItemExplorer: selectedItem is missing required properties:", selectedItem);
        setLoadingStatus("error");
      }
    };
    fetchData();
  }, [selectedItem]);

  // Watch for refresh trigger changes to re-fetch data
  useEffect(() => {
    if (props.config.refreshTrigger && selectedItem && selectedItem.id && selectedItem.workspaceId) {
      const fetchData = async () => {
        setLoadingStatus("loading");
        let success = false;
        try {
          success = await setTablesAndFiles(null);
        } catch (exception) {
          try {
            success = await setTablesAndFiles(".default");
          } catch (secondException) {
            console.error("SampleOneLakeItemExplorer: Failed to refresh data for item:", selectedItem, secondException);
            success = false;
          }
        }
        setLoadingStatus(success ? "idle" : "error");
      };
      fetchData();
    }
  }, [props.config.refreshTrigger, selectedItem]);


  async function setTablesAndFiles(additionalScopesToConsent: string): Promise<boolean> {
    try {
      if (!selectedItem || !selectedItem.workspaceId || !selectedItem.id) {
        console.error("SampleOneLakeItemExplorer: Cannot fetch data - selectedItem is invalid:", selectedItem);
        return false;
      }

      let tables = await getTables(props.workloadClient, selectedItem.workspaceId, selectedItem.id);
      let files = await getFiles(props.workloadClient, selectedItem.workspaceId, selectedItem.id);

      if (tables && files) {
        setTablesInItem(tables);
        setFilesInItem(files);
        setHasSchema(tables[0]?.schema != null);
        return true;
      }
    } catch (error) {
      console.error("SampleOneLakeItemExplorer: Error fetching tables and files:", error);
    }
    return false;
  }

  async function onDatahubClicked() {
    const result = await callDatahubOpen(
<<<<<<< HEAD
      workloadClient,
      ["Lakehouse",  
        process.env.WORKLOAD_NAME + "." + process.env.DEFAULT_ITEM_NAME, 
        process.env.WORKLOAD_NAME + ".CalculatorSample",
        process.env.WORKLOAD_NAME + ".CognitiveSample",
        process.env.WORKLOAD_NAME + ".PackageInstaller"],
=======
      props.workloadClient,
      [ ...props.config.allowedItemTypes || ["Lakehouse"] ],
>>>>>>> origin/dev/preview/wdkv2
      "Select an item to use for Frontend Sample Workload",
      false
    );

    if (!result) {
      return;
    }
    updateExplorerItem(result);
  }

  function updateExplorerItem(item: Item){
    // Validate the item has required properties
    if (item && item.id && item.workspaceId) {
      setSelectedItem(item);
      // Call the callback to notify parent of item change
      if (props.onItemChanged) {
        props.onItemChanged(item);
      }
    } else {
      console.error("SampleOneLakeItemExplorer: Cannot update explorer with invalid item:", item);
      setLoadingStatus("error");
    }
  }

  function toggleExplorer() {
    setIsExplorerVisible(!isExplorerVisible);
  }

  function tableSelectedCallback(tableSelected: TableMetadata) {
    const tableFilePath = getOneLakeFilePath(selectedItem.workspaceId, selectedItem.id, tableSelected.path);
    // setTablesInItem to rerender the tree
    const updatedTables = tablesInItem.map((table: TableMetadata) => {
      return { ...table, isSelected: table.path === tableSelected.path };
    });
    setTablesInItem(updatedTables);
    if (props.onTableSelected && tableSelected.name) {
      props.onTableSelected(tableSelected.name, tableFilePath);
    }
  }

  async function fileSelectedCallback(fileSelected: FileMetadata) {
    const fullFilePath = getOneLakeFilePath(selectedItem.workspaceId, selectedItem.id, fileSelected.path);
    const updatedFiles = filesInItem.map((file: FileMetadata) => {
      return { ...file, isSelected: file.path === fileSelected.path };
    });
    setFilesInItem(updatedFiles);
    if (props.onFileSelected && fileSelected.name) {
      await props.onFileSelected(fileSelected.name, fullFilePath);
    }
  }

  return (
    <>
      <Stack className={`explorer ${isExplorerVisible ? "" : "hidden-explorer"}`} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div className={`top ${isExplorerVisible ? "" : "vertical-text"}`}>
          {!isExplorerVisible && (
            <Button onClick={toggleExplorer} appearance="subtle" icon={<ChevronDoubleRight20Regular />}></Button>
          )}
          <h1>OneLake Item Explorer</h1>
          {isExplorerVisible && (
            <Button onClick={toggleExplorer} appearance="subtle" icon={<ChevronDoubleLeft20Regular />}></Button>
          )}
        </div>
        {selectedItem == null && isExplorerVisible && (
          <Stack className="main-body" verticalAlign="center" horizontalAlign="center" tokens={{ childrenGap: 5 }} style={{ flex: 1 }}>
            <Image src="/assets/samples/views/SampleOneLakeItemExplorer/EmptyIcon.svg" />
            <span className="add">Add an item</span>
            {props.config?.allowItemSelection && (
            <Tooltip content={"Open Datahub Explorer"} relationship="label">
              <Button className="add-button" size="small" onClick={() => onDatahubClicked()} appearance="primary">
                Add
              </Button>
            </Tooltip>
            )}
          </Stack>
        )}
        {loadingStatus === "loading" && <Spinner className="main-body" label="Loading Data" style={{ flex: 1 }} />}
        {selectedItem && loadingStatus == "idle" && isExplorerVisible && (
          <Tree
            aria-label="Tables in Item"
            className="selector-body"
            size="medium"
            defaultOpenItems={["Lakehouse", "Tables", "Files", "Schemas"]}
            style={{ flex: 1, overflow: "auto" }}
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
        {loadingStatus === "error" && isExplorerVisible && <div className="main-body" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <Subtitle2>Error loading data</Subtitle2>
          <p>Do you have permission to view this Item?</p>
        </div>}
      </Stack>
    </>
  );
}
