import { NotificationType, WorkloadClientAPI } from "@ms-fabric/workload-client";
import { callNavigationNavigate } from "../../../implementation/controller/NavigationController";
import { callNotificationOpen } from "../../../implementation/controller/NotificationController";
import { GenericItem, WorkloadItem } from "../../../implementation/models/ItemCRUDModel";
import { Deployment, DeploymentStatus, PackageDeploymentType, PackageInstallerItemDefinition, SolutionConfigurationsArray } from "./PackageInstallerItemModel";
import { deployPackage } from "./DeploymentController";

// Function to navigate to a created item
  export async function handleItemClick(workloadClient: WorkloadClientAPI, item: GenericItem) {
    try {
      // Navigate to the item in Fabric using the host navigation
      // The path format for Fabric items is typically: /groups/{workspaceId}/items/{itemId}
      const itemPath = `/groups/${item.workspaceId}/${item.type}/${item.id}`;
      await callNavigationNavigate(workloadClient, 'host', itemPath);
    } catch (error) {
      console.error(`Error navigating to item ${item.id}:`, error);
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
      // Navigate to the workspace in Fabric using the host navigation
      // The path format for Fabric workspaces is typically: /groups/{workspaceId}
      const workspacePath = `/groups/${workspaceId}`;
      await callNavigationNavigate(workloadClient, 'host', workspacePath);
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
    // Placeholder for deployment logic
    // Here you would typically call an API to start the deployment
    // For example: workloadClient.deploy(package.id);
    // TODO needs to be implemented
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
      const updatedSolution = await deployPackage(
                workloadClient,
                item,
                pack,
                deployment,
                item.definition?.lakehouseId);
      
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