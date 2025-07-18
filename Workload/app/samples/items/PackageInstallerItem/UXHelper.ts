import React from "react";
import { NotificationType, WorkloadClientAPI } from "@ms-fabric/workload-client";
import { callNotificationOpen } from "../../../implementation/controller/NotificationController";
import { callNavigationNavigate } from "../../../implementation/controller/NavigationController";
import { GenericItem, WorkloadItem } from "../../../implementation/models/ItemCRUDModel";
import { Deployment, DeploymentStatus, PackageDeploymentType, PackageInstallerItemDefinition, SolutionConfigurationsArray } from "./PackageInstallerItemModel";
import { DeploymentStrategyFactory } from "./deployment/DeploymentStrategyFactory";
import {
  Notebook24Regular,
  DocumentTable24Regular,
  DatabaseSearch24Regular,
  ChartMultiple24Regular,
  Code24Regular,
  DocumentDatabase24Regular,
  DataTrending24Regular,
  Beaker24Regular,
  BrainCircuit24Regular,
  Stream24Regular,
  Database24Regular,
  Question24Regular,
} from "@fluentui/react-icons";

// Function to navigate to a created item
  export async function handleItemClick(workloadClient: WorkloadClientAPI, item: GenericItem) {
    console.log('handleItemClick called with item:', item);
    
    try {
      // Validate required fields to prevent undefined values in URL
      if (!item || !item.workspaceId || !item.type || !item.id) {
        console.warn('Invalid item data:', item);
        callNotificationOpen(
          workloadClient,
          "Navigation Error",
          "Cannot open item: Missing required information (workspace, type, or ID)",
          NotificationType.Error,
          undefined
        );
        return;
      }

      await callNavigationNavigate(workloadClient, 
        "host",
        `/groups/${item.workspaceId}/${item.type}/${item.id}`);
      console.log('Successfully called CallOpenInNewBrowserTab for item');
    } catch (error) {
      console.error(`Error navigating to item ${item?.id}:`, error);
      callNotificationOpen(
        workloadClient,
        "Navigation Error",
        `Failed to open item: ${error.message || error}`,
        NotificationType.Error,
        undefined
      );
    }
  };

  // Function to navigate to a workspace
  export async function handleWorkspaceClick(workloadClient: WorkloadClientAPI, workspaceId: string) {
    try {
      // Validate workspace ID to prevent undefined values in URL
      if (!workspaceId || workspaceId === 'undefined' || workspaceId.trim() === '') {
        console.warn('Invalid workspace ID:', workspaceId);
        callNotificationOpen(
          workloadClient,
          "Navigation Error",
          "Cannot open workspace: Invalid or missing workspace ID",
          NotificationType.Error,
          undefined
        );
        return;
      }
      
      await callNavigationNavigate(workloadClient, 
        "host",
        `/groups/${workspaceId}`);
    } catch (error) {
      console.error(`Error navigating to workspace ${workspaceId}:`, error);
      callNotificationOpen(
        workloadClient,
        "Navigation Error",
        `Failed to open workspace: ${error.message || error}`,
        NotificationType.Error,
        undefined
      );
    }
  };



  export async function startDeployment( workloadClient: WorkloadClientAPI, 
                                          item: WorkloadItem<PackageInstallerItemDefinition>,  
                                          deployment: Deployment, 
                                          onDeploymentUpdate?: (updatedPackage: Deployment) => void) {
    console.log(`Starting deployment for package: ${deployment.id}`);

    try {

      const pack = SolutionConfigurationsArray.find(pack => pack.typeId === deployment.packageId);
      if (!pack) {
        throw new Error(`Package with typeId ${deployment.packageId} not found`);
      }
      if (pack.deploymentType === PackageDeploymentType.SparkLivy && 
          !item.definition?.lakehouseId) {
        callNotificationOpen(
          workloadClient,
          "Lakehouse Required",
          "Please connect a lakehouse before starting deployment.",
          undefined,
          undefined
        );
        return;
      }

      // Create the deployment strategy based on the package type
      const strategy = DeploymentStrategyFactory.createStrategy(
                workloadClient,
                item,
                pack,
                deployment,
      );
      var updatedSolution = await strategy.deploy();
      
      // Call the onDeploymentUpdate callback with the updated deployment
      if (onDeploymentUpdate) {
        onDeploymentUpdate(updatedSolution);
      }

      callNotificationOpen(
                workloadClient,
                "Deployment Started",
                `Deployment has successfully started ${updatedSolution.jobId}.`,
                undefined,
                undefined
      );
    }
    catch (error) {
      console.error(`Error on Deployment: ${error}`);
      callNotificationOpen(
        workloadClient,
        "Error",
        `Failed to upload script: ${error.message || error}`,
        NotificationType.Error,
        undefined
      );
      
      // Create a failed deployment copy and update via callback
      const failedDeployment = {
        ...deployment,
        deploymentStatus: DeploymentStatus.Failed
      };
      
      if (onDeploymentUpdate) {
        onDeploymentUpdate(failedDeployment);
      }
      return;
    }
  }

  // Function to get icon component for a given item type
  export function getItemTypeIcon(itemType: string): React.JSX.Element {
    switch (itemType.toLowerCase()) {
      case "notebook":
        return React.createElement(Notebook24Regular);
      case "report":
        return React.createElement(ChartMultiple24Regular);
      case "semanticmodel":
      case "semantic model":
        return React.createElement(DocumentDatabase24Regular);
      case "lakehouse":
        return React.createElement(Database24Regular);
      case "warehouse":
        return React.createElement(DocumentTable24Regular);
      case "kqldatabase":
      case "kql database":
        return React.createElement(DatabaseSearch24Regular);
      case "kqlqueryset":
      case "kql queryset":
        return React.createElement(Code24Regular);
      case "datapipeline":
      case "data pipeline":
        return React.createElement(DataTrending24Regular);
      case "dataflow":
      case "dataflow gen2":
        return React.createElement(Stream24Regular);
      case "mlmodel":
      case "ml model":
        return React.createElement(BrainCircuit24Regular);
      case "mlexperiment":
      case "ml experiment":
        return React.createElement(Beaker24Regular);
      case "sparkjobdefinition":
      case "spark job definition":
        return React.createElement(Code24Regular);
      case "environment":
        return React.createElement(DocumentDatabase24Regular);
      case "eventstream":
      case "event stream":
        return React.createElement(Stream24Regular);
      case "dashboard":
        return React.createElement(ChartMultiple24Regular);
      default:
        return React.createElement(Question24Regular);
    }
  }

