import { Stack } from "@fluentui/react";
import { TabValue, Button, Table, TableBody, TableCell, TableRow, TableHeader, TableHeaderCell } from "@fluentui/react-components";
import React, { useEffect, useState } from "react";
import { ContextProps, PageProps } from "src/App";
import { CognitiveSampleItemEditorRibbon } from "./CognitiveSampleItemEditorRibbon";
import { getWorkloadItem, saveItemDefinition } from "../../../workload/controller/ItemCRUDController";
import { WorkloadItem } from "../../../workload/models/ItemCRUDModel";
import { writeToOneLakeFileAsText, getOneLakeFilePath } from "../../controller/OneLakeController";
import { useLocation, useParams } from "react-router-dom";
import "./../../../styles.scss";
import { CognitiveSampleItemDefinition } from "./CognitiveSampleItemModel";
import { CognitiveSampleItemEditorEmpty } from "./CognitiveSampleItemEditorEmpty";
import { BatchRequest } from "../../models/SparkLivyModel";
import { createBatch } from "../../controller/SparkLivyController";
import { Delete24Regular, PlayCircle24Regular } from "@fluentui/react-icons";
import { EnvironmentConstants } from "../../../constants";
import { callNotificationOpen } from "../../../workload/controller/NotificationController";
import { NotificationToastDuration, NotificationType } from "@ms-fabric/workload-client";
import ItemEditorLoadingProgressBar from "../../../workload/controls/ItemEditorLoadingProgressBar";
import { t } from "i18next";

export function CognitiveSampleItemEditor(props: PageProps) {
  const pageContext = useParams<ContextProps>();
  const { pathname } = useLocation();
  const { workloadClient } = props;
  const [selectedConfig, setSelectedConfig] = useState<number>(-1);
  const [isUnsaved, setIsUnsaved] = useState<boolean>(true);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [editorItem, setEditorItem] = useState<WorkloadItem<CognitiveSampleItemDefinition>>(undefined);
  const [selectedTab, setSelectedTab] = useState<TabValue>("");

  useEffect(() => {
      loadDataFromUrl(pageContext, pathname);
    }, [pageContext, pathname]);

  async function SaveItem() {
    var successResult = await saveItemDefinition<CognitiveSampleItemDefinition>(
      workloadClient,
      editorItem.id,
      editorItem.definition);
    setIsUnsaved(!successResult);
    callNotificationOpen(
            workloadClient,
            t("ItemEditor_Saved_Notification_Title"),
            t("ItemEditor_Saved_Notification_Text", { itemName: editorItem.displayName }),
            undefined,
            undefined
        );
  }

  /**
   * Starts a analysis batch job for the selected configuration
   */
  /**
   * Fetches the content of the CognitiveSample-Analysis.py script from the assets folder
   */
  async function getAnalysisScriptContent(file: string): Promise<string> {
    try {
      const response = await fetch(`/assets/samples/items/CognitiveSampleItem/jobs/${file}`);
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
      if (editorItem?.definition?.configurations?.length < configIndex) {
        throw new Error("No configuration selected");
      }

      const analysisFileName = "CognitiveSample-Analysis-textblob.py";
      const config = editorItem.definition.configurations[configIndex];

      // Upload the CognitiveSample-Analysis.py file to OneLake
      console.log(`Fetching and uploading ${analysisFileName} to OneLake...`);
      const scriptContent = await getAnalysisScriptContent(analysisFileName);
      const scriptFilePath = getOneLakeFilePath(config.workspaceId, config.id, analysisFileName);
      await writeToOneLakeFileAsText(workloadClient, scriptFilePath, scriptContent);
      console.log(`Successfully uploaded script to OneLake path: ${scriptFilePath}`);
      
      // Create the OneLake file path URL for the batch job
      const adfssBaseURL = EnvironmentConstants.OneLakeDFSBaseUrl.replace("https://", `abfss://${config.workspaceId}@`);
      const oneLakeScriptUrl = `${adfssBaseURL}/${config.id}/Files/${analysisFileName}`;
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
          // Using the default environment with added librar textblob
          //"spark.fabric.environmentDetails" : "{\"id\" : \"<ID>\"}"
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
      
      const updateConfigurations = [...editorItem.definition.configurations];
      updateConfigurations[configIndex] = updatedConfig;

      // Update item state
      const updatedItemDefinition = {
        ...editorItem.definition,
        configurations: updateConfigurations
      };
      
      // Set the updated state
      setEditorItem({
        ...editorItem,
        definition: updatedItemDefinition
      });
      
      // Save the updated state
      await saveItemDefinition(workloadClient, editorItem.id, updatedItemDefinition);

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
    setSelectedTab("empty");
  }
  
  /**
   * Delete a configuration from the list
   */
  function deleteConfiguration(index: number) {
    if (editorItem?.definition?.configurations?.length > index) {
      
      const UpdatedConfigs = [...editorItem.definition.configurations];
      UpdatedConfigs.splice(index, 1);
      
      // Update the state
      const updatedDefinition = {
        ...editorItem.definition,
        configurations: UpdatedConfigs
      };
      
      setEditorItem({
        ...editorItem,
        definition: updatedDefinition
      });
      
      setIsUnsaved(true);
    }
  }

  async function loadDataFromUrl(pageContext: ContextProps, pathname: string): Promise<void> {
      setIsLoadingData(true);
      var item: WorkloadItem<CognitiveSampleItemDefinition> = undefined;    
      if (pageContext.itemObjectId) {
        // for Edit scenario we get the itemObjectId and then load the item via the workloadClient SDK
        try {
          item = await getWorkloadItem<CognitiveSampleItemDefinition>(
            workloadClient,
            pageContext.itemObjectId,          
          );
          
          // Ensure item defintion is properly initialized without mutation
          if (!item.definition) {
            item = {
              ...item,
              definition: {
                configurations: [],
              }
            };
          }
          setEditorItem(item);        
        } catch (error) {
          setEditorItem(undefined);        
        } 
      } else {
        console.log(`non-editor context. Current Path: ${pathname}`);
      }
      setIsUnsaved(false);
      if(item?.definition?.configurations?.length > 0) {
        setSelectedTab("home");
      } else {
        setSelectedTab("empty");
      }
      setIsLoadingData(false);
    }

  function handleFinishEmptyDialog() {
    setIsUnsaved(true)
    SaveItem()
    setSelectedTab("home");
  }

  function handleCancelEmptyDialog() {
    // Just switch back to the home tab without saving changes
    setSelectedTab("home");
  }

  if (isLoadingData) {
    return <ItemEditorLoadingProgressBar message="Loading ...." />;
  }
  return (
    <Stack className="editor" data-testid="item-editor-inner">
      <CognitiveSampleItemEditorRibbon
        {...props}
        isSaveButtonEnabled={isUnsaved}
        saveItemCallback={SaveItem}
        addConfigurationCallback={addConfiguration}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
      />
      <Stack className="main">
        {["empty"].includes(selectedTab as string) && (
          <span>
            <CognitiveSampleItemEditorEmpty
              workloadClient={workloadClient}
              item={editorItem}
              state={editorItem?.definition}
              onFinishEmpty={handleFinishEmptyDialog}
              onCancelEmpty={handleCancelEmptyDialog}
            />
          </span>
        )}
        {["home"].includes(selectedTab as string) && (
        <span>
          <Stack horizontal horizontalAlign="space-between" style={{ marginBottom: '16px' }}>
            <h2>Analysis Configurations</h2>
          </Stack>
          
          <div style={{
            padding: '10px 15px',
            marginBottom: '16px',
            backgroundColor: '#FFF4CE',
            border: '1px solid #FFB900',
            borderRadius: '4px'
          }}>
            <strong>Important:</strong> You need to add the <code>textblob</code> library to your default Spark runtime environment for this Workspace
            in order to make the text analysis work properly. Without this library, the analysis job will fail.
          </div>
          
          {editorItem?.definition?.configurations?.length > 0 ? (
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
                {editorItem?.definition?.configurations?.map((config, index) => (
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
