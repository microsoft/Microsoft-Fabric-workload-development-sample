import React from "react";
import { 
  Card,
  CardHeader,
  CardFooter,
  Text,
  Button,
  Badge,
  Divider,
  Body1,
  Caption1
} from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import { AvailablePackages, Deployment, DeploymentStatus } from "./PackageInstallerItemModel";
import { GenericItem } from "../../../workload/models/ItemCRUDModel";
import { NotificationType, WorkloadClientAPI } from "@ms-fabric/workload-client";
import { callNotificationOpen } from "../../../workload/controller/NotificationController";
import { deployPackage } from "./PackageInstallerController";

// Props for the PackageDetailCard component
export interface DeploymentDetailViewProps {
  workloadClient: WorkloadClientAPI;
  deployment: Deployment;
  item: GenericItem;
  lakehouseId: string; // The lakehouse id that is used for the package deployment
  onBackToHome: () => void;
  onDeploymentUpdate?: (updatedPackage: Deployment) => void; // Callback when package is updated
}

/**
 * Component that displays details of a package and provides 
 * a button to start deployment if the package is in Pending status.
 */
export const DeploymentDetailView: React.FC<DeploymentDetailViewProps> = ({ 
  workloadClient,
  deployment: deployment,
  item,
  lakehouseId,
  onBackToHome,
  onDeploymentUpdate: onDeploymentUpdate
}) => {
  const { t } = useTranslation();
  const pack = AvailablePackages[deployment.packageId];

 async function onStartDeployment() {
    // Placeholder for deployment logic
    // Here you would typically call an API to start the deployment
    // For example: workloadClient.deploy(package.id);
    // TODO needs to be implemented
    console.log(`Starting deployment for package: ${deployment.id}`);

    try {
      const updatedSolution = await deployPackage(
                workloadClient,
                item,
                pack,
                deployment,
                lakehouseId);
      
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

  // Function to get status badge color based on deployment status
  const getStatusBadgeColor = (status: DeploymentStatus) => {
    switch (status) {
      case DeploymentStatus.Succeeded:
        return "success";
      case DeploymentStatus.Failed:
        return "danger";
      case DeploymentStatus.InProgress:
        return "informative";
      case DeploymentStatus.Pending:
      default:
        return "subtle";
    }
  };

  return (
    <Card className="package-detail-card">
      <CardHeader
        image={
          pack?.icon && (
            <img 
              src={pack?.icon} 
              alt={pack?.name}
              style={{ width: "32px", height: "32px", objectFit: "contain" }}
            />
          )
        }
        header={
          <Text weight="semibold" size={500}>
            {pack?.name}
          </Text>
        }
        description={
          <Badge 
            appearance="filled"
            color={getStatusBadgeColor(deployment.status)}
            style={{ marginTop: "4px" }}
          >
            {DeploymentStatus[deployment.status]}
          </Badge>
        }
      />

      <div className="deployment-info" style={{ padding: "0 16px" }}>
        <div className="deployment-detail-row">
          <Caption1>{t("Deployment ID")}:</Caption1>
          <Body1>{deployment.id}</Body1>
        </div>

        <div className="deployment-detail-row">
          <Caption1>{t("Workspace ID")}:</Caption1>
          <Body1>{deployment.workspaceId || item.workspaceId || t("N/A")}</Body1>
        </div>
        <div className="deployment-detail-row">
          <Caption1>{t("Folder ID")}:</Caption1>
          <Body1>{deployment.folderId || t("N/A")}</Body1>
        </div>
        <div className="deployment-detail-row">
          <Caption1>{t("Package Type")}:</Caption1>
          <Body1>{AvailablePackages[deployment.packageId]?.name}</Body1>
        </div>       
  
        <Divider style={{ margin: "12px 0" }} />
        
        <div className="deployment-items">
          <h2>{t("Deployment Items")}:</h2>
          <Caption1>{t("Shows a list of all items that will be create as part of the deployment.")}</Caption1>
          {pack?.items && pack.items.length > 0 ? (
            <ul className="items-list" style={{ margin: "8px 0", paddingLeft: "20px" }}>
              {pack.items.map((item, index) => (
                <li key={index}>
                  <Body1>{item.name}</Body1>
                  <div style={{ marginLeft: "8px" }}>
                    <Caption1>{item.description}</Caption1>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ marginLeft: "8px" }}>
              <Body1 italic>{t("No items defined for this deployment")}</Body1>
            </div>
          )}
        </div>
        
        <Divider style={{ margin: "12px 0" }} />
        
        <div className="created-items">
          <h2>{t("Created Items")}:</h2>
          <Caption1>{t("Shows a list of all items that have been created by this deployment.")}</Caption1>
          {deployment.itemsCreated && deployment.itemsCreated.length > 0 ? (
            <ul className="items-list" style={{ margin: "8px 0", paddingLeft: "20px" }}>
              {deployment.itemsCreated.map((item: GenericItem) => (
                <li key={item.id}>
                  <Body1>{item.displayName || item.id}</Body1>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ marginLeft: "8px" }}>
              <Body1 italic>{t("No items created yet")}</Body1>
            </div>
          )}
        </div>
      </div>
        <CardFooter>
          <Button 
            appearance="secondary"
            onClick={() => onBackToHome()}
            style={{ marginRight: "8px" }}
          >
            {t("Back to Home")}
          </Button>
          {(deployment.status === DeploymentStatus.Pending  || 
            deployment.status === DeploymentStatus.Failed ) && (
            <Button 
              appearance="primary"
              onClick={() => onStartDeployment()}
              style={{ marginLeft: "8px" }}
            >
              {t("Start Deployment")}
            </Button>
          )}

        </CardFooter>

    </Card>
  );
};

// Add some basic styles to improve the component's appearance
export const styles = `
.deplyoment-detail-card {
  margin-bottom: 16px;
  width: 100%;
  max-width: 600px;
}

.deplyoment-info {
  padding: 0 16px 16px;
}

.deplyoment-detail-row {
  display: flex;
  justify-content: space-between;
  margin: 6px 0;
}

.created-items {
  margin-top: 8px;
}

.items-list {
  margin: 8px 0;
  padding-left: 20px;
}
`;