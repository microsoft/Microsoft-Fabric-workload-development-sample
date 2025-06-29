import React, { useState } from "react";
import { Stack } from "@fluentui/react";
import { Text, Button, Input, Field, Option, Combobox } from "@fluentui/react-components";
import "./../../../styles.scss";
import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { GenericItem } from "src/workload/models/ItemCRUDModel";
import { CognitiveSampleAnalysisType, CognitiveSampleItemDefinition, CognitiveSampleAnalysisConfiguration } from "./CognitiveSampleItemModel";
import { callDatahubWizardOpen } from "../../../workload/controller/DataHubController";
import { Database16Regular } from "@fluentui/react-icons";


interface CognitiveSampleItemEditorEmptyProps {
  workloadClient: WorkloadClientAPI,
  item: GenericItem;
  state: CognitiveSampleItemDefinition,
  onFinishEmpty: () => void;
  onCancelEmpty: () => void;
}

export const CognitiveSampleItemEditorEmpty: React.FC<CognitiveSampleItemEditorEmptyProps> = ({
  workloadClient,
  item,
  state,
  onFinishEmpty,
  onCancelEmpty
}) => {
  const [configuration, setConfiguration] = 
    useState<CognitiveSampleAnalysisConfiguration>({
                                    workspaceId: undefined,
                                    id: undefined,
                                    tableName: undefined,
                                    sourceColumnName: "Feedback",
                                    resultColumnName: "sentiment",
                                    analysisType: CognitiveSampleAnalysisType.SentimentAnalysis
                                    });

  async function onCallDatahubLakehouse() {
    try {
      console.log("Opening DatahubWizard for lakehouse selection");
      const result = await callDatahubWizardOpen(
        workloadClient,
        ["Lakehouse"],
        "Select content",
        "Select Lakehouse for the cognitive sample",
        false,
        false,
        true
      );
      console.log("DatahubWizard result:", result);
      
      if (result) {
        // Destructure needed properties with default values for null/undefined cases
        const { id, workspaceId, selectedPath } = result || {};

        // Process tableName to remove 'Table/' prefix if present
        let tableName = selectedPath;
        if (tableName && tableName.startsWith('Tables/')) {
          tableName = tableName.substring(7); // Remove 'Tables/' (7 characters)
          console.log("Removed 'Tables/' prefix from tableName:", tableName);
        }

        // Create new configuration with proper typing and validation
        const newConfig: CognitiveSampleAnalysisConfiguration = {
          ...configuration,
          id: id || configuration.id,
          workspaceId: workspaceId || configuration.workspaceId,
          tableName: tableName || configuration.tableName,
        };

        // Validate critical properties before proceeding
        if (!newConfig.id || !newConfig.workspaceId || !newConfig.tableName) {
          console.warn("Incomplete configuration data received from DatahubWizard");
          // Optionally: workloadClient.notification.showWarningMessage("Incomplete data selection");
        }
        console.log("Setting new configuration:", newConfig);
        
        setConfiguration(newConfig);
        
        // Force update by setting state directly in the parent's item state
        if (state) {
          // Make sure configurations array exists
          if (!state.configurations) {
            state.configurations = [];
          }
          
          // Add as first configuration or update existing if configurations exist
          if (state.configurations.length === 0) {
            state.configurations.push(newConfig);
          } else {
            // Update the first configuration
            state.configurations[0] = newConfig;
          }
        }
      }
    } catch (error) {
      console.error("Error in DatahubWizard selection:", error);
    }
  }

  function saveItem() {
    // Make sure we have all required fields before saving
    if (!configuration.id || !configuration.workspaceId || !configuration.tableName) {
      alert("Please select a lakehouse and table before saving.");
      return;
    }
    
    // Ensure column names are set
    if (!configuration.sourceColumnName) {
      configuration.sourceColumnName = "Feedback";
    }
    
    if (!configuration.resultColumnName) {
      configuration.resultColumnName = "sentiment";
    }
    
    console.log("Saving configuration:", configuration);
    
    // Update state with the latest configuration
    if (!state.configurations) {
      state.configurations = [];
    }
    
    // Add the new configuration to the array
    state.configurations.push({ ...configuration });
    
    // Call parent's callback to finalize
    onFinishEmpty();
  }
  
  return (
    <Stack className="empty-definition-container" horizontalAlign="center" tokens={{ childrenGap: 16 }}>
      <Stack.Item>
        <img
          src="/assets/samples/items/CognitiveSampleItem/EditorEmpty.jpg"
          alt="Empty state illustration"
          className="empty-state-image"
        />
      </Stack.Item>
      <Stack.Item>
        <Text as="h2" size={800} weight="semibold">
          Add a new analysis configuration!
        </Text>
      </Stack.Item>
      <Stack.Item>
        <div className="section" data-testid='item-editor-metadata' >
          <Field
            label="Lakehouse"
            orientation="horizontal"
            className="field"
            data-testid="lakehouse-field"
          >
            <Stack horizontal>
              <Input
                size="small"
                placeholder="Select a lakehouse"
                style={{ marginLeft: "10px", minWidth: "250px" }}
                value={configuration?.id || ""}
                readOnly={true}
                data-testid="lakehouse-input"
              />
              <Button
                style={{ width: "32px", height: "32px", marginLeft: "5px" }}
                icon={<Database16Regular />}
                appearance="primary"
                onClick={() => onCallDatahubLakehouse()}
                data-testid="item-editor-lakehouse-btn"
                title="Select Lakehouse"
              />
            </Stack>
          </Field>
          <Field
            label="Table"
            orientation="horizontal"
            className="field"
            data-testid="table-field"
          >
            <Input
              size="small"
              type="text"
              placeholder="Selected with lakehouse"
              disabled={true}
              value={configuration?.tableName || ""}
              data-testid="table-input"
            />
          </Field>
          <Field
            label="Analysis type"
            orientation="horizontal"
            className="field"
            data-testid="analysis-type-field"
          >
          <Combobox
              size="small"
              value={configuration?.analysisType || CognitiveSampleAnalysisType.SentimentAnalysis}
              onOptionSelect={(_, data) => {
                setConfiguration({
                  ...configuration,
                  analysisType: data.optionValue as CognitiveSampleAnalysisType
                });
              }}
              data-testid="analysis-type-select"
            >
              {/* Using Object.values to get enum values directly */}
              {Object.values(CognitiveSampleAnalysisType).map((value) => (
                <Option key={value} value={value}>{value}</Option>
              ))}
            </Combobox>
          </Field>
          <Field
            label="Source column"
            orientation="horizontal"
            className="field"
            data-testid="source-column-field"
          >
            <Input
              size="small"
              type="text"
              placeholder="Enter source column name (e.g., feedback)"
              value={configuration?.sourceColumnName || ""}
              onChange={(e) => {
                setConfiguration({
                  ...configuration,
                  sourceColumnName: e.target.value
                });
              }}
              data-testid="source-column-input"
            />
          </Field>
          <Field
            label="Result column"
            orientation="horizontal"
            className="field"
            data-testid="result-column-field"
          >
            <Input
              size="small"
              type="text"
              placeholder="Enter result column name (e.g., sentiment)"
              value={configuration?.resultColumnName || ""}
              onChange={(e) => {
                setConfiguration({
                  ...configuration,
                  resultColumnName: e.target.value
                });
              }}
              data-testid="resultColumnName-column-input"
            />
          </Field>          
        </div>
    </Stack.Item>

      <Stack.Item style={{ marginTop: '16px' }}>
        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <Button appearance="primary" onClick={saveItem}>
            Save
          </Button>
          {/* Show Cancel button only if there are existing configurations */}
          {state?.configurations?.length > 0 && (
            <Button appearance="secondary" onClick={onCancelEmpty}>
              Cancel
            </Button>
          )}
        </Stack>
      </Stack.Item>
    </Stack>
  );
};
