import { Stack } from "@fluentui/react";
import { TabValue, Button, Table, TableBody, TableCell, TableRow, TableHeader, TableHeaderCell } from "@fluentui/react-components";
import React, { useEffect, useState } from "react";
import { ContextProps, PageProps } from "src/App";
import { Ribbon } from "./CognitiveSampleItemRibbon";
import { getWorkloadItem, saveItemState } from "../../../workload/controller/ItemCRUDController";
import { WorkloadItem } from "../../../workload/models/ItemCRUDModel";
import { writeToOneLakeFileAsText, getOneLakeFilePath } from "../../controller/OneLakeController";
import { useLocation, useParams } from "react-router-dom";
import "./../../../styles.scss";
import { CognitiveSampleItemModelState, CognitiveSampleAnalysisConfiguration } from "./CognitiveSampleItemModel";
import { CognitiveSampleItemEmptyState } from "./CognitiveSampleItemEditorEmptyState";
import CognitiveSampleItemEditorLoadingProgressBar from "./CognitiveSampleItemEditorLoadingProgressBar";
import { BatchRequest } from "../../models/SparkLivyModel";
import { createBatch } from "../../controller/SparkLivyController";
import { Delete24Regular, PlayCircle24Regular } from "@fluentui/react-icons";
import { EnvironmentConstants } from "../../../constants";
import { callNotificationOpen } from "../../../workload/controller/NotificationController";
import { NotificationToastDuration, NotificationType } from "@ms-fabric/workload-client";

export function CognitiveSampleItemEditor(props: PageProps) {
  const pageContext = useParams<ContextProps>();
  const { pathname } = useLocation();
  const { workloadClient } = props;
  const [payload, setPayload] = useState<CognitiveSampleAnalysisConfiguration[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<number>(-1);
  const [isUnsafed, setIsUnsafed] = useState<boolean>(true);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [editorItem, setEditorItem] = useState<WorkloadItem<CognitiveSampleItemModelState>>(undefined);
  const [selectedTab, setSelectedTab] = useState<TabValue>("");

  useEffect(() => {
      loadDataFromUrl(pageContext, pathname);
    }, [pageContext, pathname]);

  async function SaveItem() {
    var successResult = await saveItemState<CognitiveSampleItemModelState>(
      workloadClient,
      editorItem.id,
      editorItem.itemState);
    setIsUnsafed(!successResult);
  }

  /**
   * Starts a analysis batch job for the selected configuration
   */
  /**
   * Fetches the content of the CognitiveSample-Analysis.py script from the assets folder
   */
  async function getAnalysisScriptContent(): Promise<string> {
    try {
      const response = await fetch('/assets/jobs/CognitiveSample-Analysis.py');
      if (!response.ok) {
        throw new Error(`Failed to fetch script: ${response.status} ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Error fetching analysis script:', error);
      throw error;
    }
  }

  async function startAnalysis(configIndex: number = selectedConfig) {
    try {
      // Check if we have configurations
      if (!payload || payload.length === 0 || configIndex < 0 || configIndex >= payload.length) {
        throw new Error("No configuration selected");
      }
      
      const config = payload[configIndex];

      
      // Upload the CognitiveSample-Analysis.py file to OneLake
      console.log("Fetching and uploading CognitiveSample-Analysis.py to OneLake...");
      
      // Get the script content from assets folder
      const scriptContent = await getAnalysisScriptContent();
      
      const filePath = "CognitiveSample-Analysis.py"

      // Define the path for the script file in OneLake
      const scriptFilePath = getOneLakeFilePath(config.workspaceId, config.id, filePath);
      
      // Upload the script to OneLake
      await writeToOneLakeFileAsText(workloadClient, scriptFilePath, scriptContent);
      console.log(`Successfully uploaded script to OneLake path: ${scriptFilePath}`);
      
      // Create the OneLake file path URL for the batch job
      const adfssBaseURL = EnvironmentConstants.OneLakeDFSBaseUrl.replace("https://", `abfss://${config.workspaceId}@`);
      const oneLakeScriptUrl = `${adfssBaseURL}/${config.id}/Files/${filePath}`;
      console.log("OneLake script URL:", oneLakeScriptUrl);

      // Construct batch request with proper parameters
      const batchRequest: BatchRequest = {
        name: `${editorItem.displayName} - ${config.analysisType} - ${config.tableName}`,
        file: oneLakeScriptUrl,
        args: [config.tableName, config.sourceColumnName, config.resultColumnName],
        conf: {          
          "spark.itemId": config.id,
          "spark.itemWorkspaceId": config.workspaceId,
          "spark.itemTableName": config.tableName,
          "spark.itemTableSourceColumnName": config.sourceColumnName,
          "spark.itemTableResultColumnName": config.resultColumnName,
          "spark.analysisType": config.analysisType,
        },
        tags: {
          source: "Cognitive Sample Item",
          analysisType: config.analysisType
        }
      };
      
      console.log("Starting the analysis with batch request:", batchRequest);
      
      // Start the batch job session using createBatch
      const batchResponse = await createBatch(
        workloadClient,
        config.workspaceId,
        config.id,
        batchRequest
      );
      
      // Update the configuration with batch information
      const updatedConfig = {
        ...config,
        lastBatchId: batchResponse.id
      };
      
      // Update the payload array with the updated configuration
      const updatedPayload = [...payload];
      updatedPayload[configIndex] = updatedConfig;
      setPayload(updatedPayload);
      
      // Update item state
      const updatedState = {
        ...editorItem.itemState,
        configurations: updatedPayload
      };
      
      // Set the updated state
      setEditorItem({
        ...editorItem,
        itemState: updatedState
      });
      
      // Save the updated state
      await saveItemState(workloadClient, editorItem.id, updatedState);
      
      callNotificationOpen(
            workloadClient,
            "Analysis started",
            `${config.analysisType} started successfully for ${config.tableName}. Please check the monitor hub for details.`,
            undefined,
            undefined
        );
      
    } catch (error) {
      console.error("Failed to start analysis:", error);

      // Show error message to user
      callNotificationOpen(
        workloadClient,
        "Analysis Error",
        `Failed to start analysis: ${error.message}`, 
        NotificationType.Error,
        NotificationToastDuration.Long
      );
    }
  }
    
  /**
   * Add a new configuration to the list
   */
  function addConfiguration() {
    setSelectedTab("add-config");
  }
  
  /**
   * Delete a configuration from the list
   */
  function deleteConfiguration(index: number) {
    if (index >= 0 && index < payload.length) {
      const updatedPayload = [...payload];
      updatedPayload.splice(index, 1);
      setPayload(updatedPayload);
      
      // Update the state
      const updatedState = {
        ...editorItem.itemState,
        configurations: updatedPayload
      };
      
      setEditorItem({
        ...editorItem,
        itemState: updatedState
      });
      
      setIsUnsafed(true);
    }
  }

  async function loadDataFromUrl(pageContext: ContextProps, pathname: string): Promise<void> {
    setIsLoadingData(true);
    if (pageContext.itemObjectId) {
      // for Edit scenario we get the itemObjectId and then load the item via the workloadClient SDK
      try {
        const item = await getWorkloadItem<CognitiveSampleItemModelState>(
          workloadClient,
          pageContext.itemObjectId,          
        );
        setEditorItem(item);
        if(!item.itemState) {
          item.itemState = {
            configurations: []
          };
        } 
        setPayload(item.itemState.configurations || []);        
      } catch (error) {
        setEditorItem(undefined);        
      }
    } else {
      console.log(`non-editor context. Current Path: ${pathname}`);
      setIsLoadingData(false);
    }
    setIsUnsafed(false);
    if(payload && payload.length > 0) {
      setSelectedTab("home");
    } else {
      setSelectedTab("add-config");
    }
    setIsLoadingData(false);
  }

  function handleFinishEmptyState() {
    setIsUnsafed(true)
    // If we're coming from the empty state, we need to add the configuration
    // to our array of configurations
    if (editorItem.itemState.configurations) {
      setPayload([...editorItem.itemState.configurations]);
    }
    SaveItem()
    setSelectedTab("home");
  }

  if (isLoadingData) {
    return <CognitiveSampleItemEditorLoadingProgressBar message="Loading ...." />;
  }
  return (
    <Stack className="editor" data-testid="item-editor-inner">
      <Ribbon
        {...props}
        isSaveButtonEnabled={isUnsafed}
        saveItemCallback={SaveItem}
        addConfigurationCallback={addConfiguration}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
      />
      <Stack className="main">
        {["add-config"].includes(selectedTab as string) && (
          <span>
            <CognitiveSampleItemEmptyState
              workloadClient={workloadClient}
              item={editorItem}
              state={editorItem?.itemState}
              onFinishEmptyState={handleFinishEmptyState}
            />
          </span>
        )}
        {["home"].includes(selectedTab as string) && (
        <span>
          <Stack horizontal horizontalAlign="space-between" style={{ marginBottom: '16px' }}>
            <h2>Analysis Configurations</h2>
          </Stack>
          
          {payload && payload.length > 0 ? (
            <Table aria-label="Analysis Configurations Table">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Workspace ID</TableHeaderCell>
                  <TableHeaderCell>Lakehouse ID</TableHeaderCell>
                  <TableHeaderCell>Analysis type</TableHeaderCell>
                  <TableHeaderCell>Table Name</TableHeaderCell>
                  <TableHeaderCell>Source Column</TableHeaderCell>
                  <TableHeaderCell>Result Column</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payload.map((config, index) => (
                  <TableRow 
                    key={index}
                    onClick={() => setSelectedConfig(index)}
                    style={{ 
                      backgroundColor: selectedConfig === index ? '#f0f0f0' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <TableCell>{config.workspaceId}</TableCell>
                    <TableCell>{config.id}</TableCell>
                    <TableCell>{config.analysisType}</TableCell>
                    <TableCell>{config.tableName}</TableCell>                    
                    <TableCell>{config.sourceColumnName}</TableCell>
                    <TableCell>{config.resultColumnName}</TableCell>
                    <TableCell>
                      <Button
                        icon={<PlayCircle24Regular />}
                        title="Run Analysis"
                        appearance="subtle"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          startAnalysis(index);
                        }}
                      />
                      <Button
                        icon={<Delete24Regular />}
                        title="Delete Configuration"
                        appearance="subtle"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          deleteConfiguration(index);
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>No configurations available. Click "Add Configuration" to create one.</p>
            </div>
          )}
        </span>
        )}       
      </Stack>
    </Stack>
  );
}
