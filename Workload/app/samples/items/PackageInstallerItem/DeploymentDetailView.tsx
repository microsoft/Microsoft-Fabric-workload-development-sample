import React, { useEffect, useState } from "react";
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
import { GenericItem } from "../../../implementation/models/ItemCRUDModel";
import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { startDeployment, getItemTypeIcon, handleWorkspaceClick, handleItemClick } from "./UXHelper";
import { FabricPlatformAPIClient } from "../../controller/FabricPlatformAPIClient";

// Component to fetch and display workspace name
function WorkspaceNameDisplay({ workspaceId, workloadClient }: { workspaceId: string, workloadClient: WorkloadClientAPI }) {
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchWorkspaceName() {
      if (!workspaceId) {
        setWorkspaceName("N/A");
        setIsLoading(false);
        return;
      }

      try {
        const fabricAPI = FabricPlatformAPIClient.create(workloadClient);
        const workspace = await fabricAPI.workspaces.getWorkspace(workspaceId);
        setWorkspaceName(workspace.displayName || workspaceId);
      } catch (error) {
        console.warn(`Failed to fetch workspace name for ${workspaceId}:`, error);
        setWorkspaceName(workspaceId); // Fallback to ID if name fetch fails
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkspaceName();
  }, [workspaceId, workloadClient]);

  if (isLoading) {
    return <Body1>Loading...</Body1>;
  }

  return (
    <Body1 
      style={{ 
        cursor: "pointer", 
        color: "#0078d4",
        textDecoration: "underline"
      }}
      onClick={() => handleWorkspaceClick(workloadClient, workspaceId)}
      title={`Click to open workspace ${workspaceId}`}
    >
      {workspaceName}
    </Body1>
  );
}

// Component to fetch and display folder name
function FolderNameDisplay({ workspaceId, folderId, workloadClient }: { workspaceId: string, folderId: string, workloadClient: WorkloadClientAPI }) {
  const [folderName, setFolderName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchFolderName() {
      if (!folderId || !workspaceId) {
        setFolderName("N/A");
        setIsLoading(false);
        return;
      }

      try {
        const fabricAPI = FabricPlatformAPIClient.create(workloadClient);
        const folder = await fabricAPI.folders.getFolder(workspaceId, folderId);
        setFolderName(folder.displayName || folderId);
      } catch (error) {
        console.warn(`Failed to fetch folder name for ${folderId}:`, error);
        setFolderName(folderId); // Fallback to ID if name fetch fails
      } finally {
        setIsLoading(false);
      }
    }

    fetchFolderName();
  }, [workspaceId, folderId, workloadClient]);

  if (isLoading) {
    return <Body1>Loading...</Body1>;
  }

  return (
    <Body1 title={`Folder ID: ${folderId}`}>
      {folderName}
    </Body1>
  );
}

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
          <Caption1>{t("Package Name")}:</Caption1>
          <Body1>{pack?.name}</Body1>
        </div>    
        <div className="deployment-detail-row">
          <Caption1>{t("Deployment Type")}:</Caption1>
          <Body1>{pack.locationType}</Body1>
        </div>  

        <div className="deployment-detail-row">
          <Caption1>{t("Workspace Name")}:</Caption1>
          {deployment.workspace?.id ? (
            <WorkspaceNameDisplay 
              workspaceId={deployment.workspace.id} 
              workloadClient={workloadClient}
            />
          ) : (
            <Body1>{t("N/A")}</Body1>
          )}
        </div>
        <div className="deployment-detail-row">
          <Caption1>{t("Folder Name")}:</Caption1>
          {deployment.workspace?.folder?.id ? (
            <FolderNameDisplay 
              workspaceId={deployment.workspace.id}
              folderId={deployment.workspace.folder.id} 
              workloadClient={workloadClient}
            />
          ) : (
            <Body1>{t("N/A")}</Body1>
          )}
        </div>
   
  
        <Divider style={{ margin: "12px 0" }} />
        
        {deployment.status !== DeploymentStatus.Succeeded && (
          <div className="deployment-items">
            <h2>{t("Configured Items")}:</h2>
            <Caption1>{t("Shows a list of all items that will be create as part of the deployment.")}</Caption1>
            {pack?.items && pack.items.length > 0 ? (
              <ul className="items-list" style={{ margin: "8px 0", paddingLeft: "20px" }}>
                {pack.items.map((item, index) => (
                  <li key={index} style={{ display: "flex", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div style={{ marginRight: "8px", marginTop: "2px" }}>
                      {getItemTypeIcon(item.itemType)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <Body1>{item.name}</Body1>
                      <div style={{ marginLeft: "0px" }}>
                        <Caption1>{item.description}</Caption1>
                      </div>
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
        )}
        
        {deployment.status !== DeploymentStatus.Succeeded && <Divider style={{ margin: "12px 0" }} />}
        
        {deployment.status === DeploymentStatus.Succeeded && (
          <div className="created-items">
            <h2>{t("Created Items")}:</h2>
            <Caption1>{t("Shows a list of all items that have been created by this deployment.")}</Caption1>
            {deployment.deployedItems && deployment.deployedItems.length > 0 ? (
              <ul className="items-list" style={{ margin: "8px 0", paddingLeft: "20px" }}>
                {deployment.deployedItems.map((item: GenericItem) => (
                  <li key={item.id} style={{ display: "flex", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div style={{ marginRight: "8px", marginTop: "2px" }}>
                      {getItemTypeIcon(item.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <Body1 
                        style={{ 
                          cursor: "pointer", 
                          color: "#0078d4",
                          textDecoration: "underline"
                        }}
                        onClick={() => handleItemClick(workloadClient, item)}
                        title={`Click to open ${item.displayName || item.id}`}
                      >
                        {item.displayName || item.id}
                      </Body1>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ marginLeft: "8px" }}>
                <Body1 italic>{t("No items created yet")}</Body1>
              </div>
            )}
          </div>
        )}
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
              onClick={() => startDeployment(workloadClient, item, deployment, onDeploymentUpdate)}
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

.items-list li {
  margin: 4px 0;
}

.items-list li span[style*="cursor: pointer"]:hover {
  color: #106ebe !important;
  text-decoration: underline !important;
}
`;