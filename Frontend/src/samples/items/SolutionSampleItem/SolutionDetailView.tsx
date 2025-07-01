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
import { AvailableSolutionConfigurations, Solution, SolutionDeploymentStatus } from "./SolutionSampleItemModel";
import { GenericItem } from "../../../workload/models/ItemCRUDModel";
import { NotificationType, WorkloadClientAPI } from "@ms-fabric/workload-client";
import { callNotificationOpen } from "../../../workload/controller/NotificationController";
import { deploySolution } from "./SolutionDeploymentController";

// Props for the SolutionDetailCard component
export interface SolutionDetailCardProps {
  workloadClient: WorkloadClientAPI;
  solution: Solution;
  item: GenericItem;
  lakehouseId: string; // The lakehouse id that is used for the solution deployment
  onBackToHome: () => void;
}

/**
 * Component that displays details of a solution and provides 
 * a button to start deployment if the solution is in Pending status.
 */
export const SolutionDetailView: React.FC<SolutionDetailCardProps> = ({ 
  workloadClient,
  solution,
  item,
  lakehouseId,
  onBackToHome
}) => {
  const { t } = useTranslation();
  const solutionConfiguration = AvailableSolutionConfigurations[solution.type];

 async function onStartDeployment() {
    // Placeholder for deployment logic
    // Here you would typically call an API to start the deployment
    // For example: workloadClient.startSolutionDeployment(solution.id);
    // TODO needs to be implemented
    console.log(`Starting deployment for solution: ${solution.id}`);

    try {
      const soltuion = await deploySolution(
                workloadClient,
                item,
                solutionConfiguration,
                solution,
                lakehouseId);

      callNotificationOpen(
                workloadClient,
                "Deplyment Started",
                `Deployment job has successfully started ${soltuion.deplyomentJobId}.`,),
                undefined
      //TODO the soltuion object needs to be updated in the editor with deplyoment status
      
    }
    catch (error) {
      console.error(`Error on Deployment: ${error}`);
      callNotificationOpen(
        workloadClient,
        "Error",
        `Failed to upload script: ${error.message}`,
        NotificationType.Error,
        undefined
      );
      solution.deploymentStatus = SolutionDeploymentStatus.Failed;
      return;
    }

  }

  // Function to get status badge color based on deployment status
  const getStatusBadgeColor = (status: SolutionDeploymentStatus) => {
    switch (status) {
      case SolutionDeploymentStatus.Succeeded:
        return "success";
      case SolutionDeploymentStatus.Failed:
        return "danger";
      case SolutionDeploymentStatus.InProgress:
        return "informative";
      case SolutionDeploymentStatus.Pending:
      default:
        return "subtle";
    }
  };

  return (
    <Card className="solution-detail-card">
      <CardHeader
        image={
          solutionConfiguration?.icon && (
            <img 
              src={solutionConfiguration?.icon} 
              alt={solutionConfiguration?.name}
              style={{ width: "32px", height: "32px", objectFit: "contain" }}
            />
          )
        }
        header={
          <Text weight="semibold" size={500}>
            {solutionConfiguration?.name}
          </Text>
        }
        description={
          <Badge 
            appearance="filled"
            color={getStatusBadgeColor(solution.deploymentStatus)}
            style={{ marginTop: "4px" }}
          >
            {SolutionDeploymentStatus[solution.deploymentStatus]}
          </Badge>
        }
      />

      <div className="solution-info" style={{ padding: "0 16px" }}>
        <div className="solution-detail-row">
          <Caption1>{t("Solution ID")}:</Caption1>
          <Body1>{solution.id}</Body1>
        </div>

        <div className="solution-detail-row">
          <Caption1>{t("Workspace ID")}:</Caption1>
          <Body1>{solution.workspaceId || t("N/A")}</Body1>
        </div>
        <div className="folder-detail-row">
          <Caption1>{t("Folder ID")}:</Caption1>
          <Body1>{solution.subfolderId || t("N/A")}</Body1>
        </div>
        <div className="solution-detail-row">
          <Caption1>{t("Solution Type")}:</Caption1>
          <Body1>{AvailableSolutionConfigurations[solution.type]?.name}</Body1>
        </div>       
  
        <Divider style={{ margin: "12px 0" }} />
        
        <div className="solution-items">
          <h2>{t("Solution Items")}:</h2>
          <Caption1>{t("Shows a list of all items that this soltuion will create as part of the deplyoment.")}</Caption1>
          {solutionConfiguration?.items && solutionConfiguration.items.length > 0 ? (
            <ul className="items-list" style={{ margin: "8px 0", paddingLeft: "20px" }}>
              {solutionConfiguration.items.map((item, index) => (
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
              <Body1 italic>{t("No items defined for this solution")}</Body1>
            </div>
          )}
        </div>
        
        <Divider style={{ margin: "12px 0" }} />
        
        <div className="created-items">
          <h2>{t("Created Items")}:</h2>
          <Caption1>{t("Shows a list of all items that have been created by this solution.")}</Caption1>
          {solution.itemsCreated && solution.itemsCreated.length > 0 ? (
            <ul className="items-list" style={{ margin: "8px 0", paddingLeft: "20px" }}>
              {solution.itemsCreated.map((item: GenericItem) => (
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
            appearance="primary"
            onClick={() => onBackToHome()}
            style={{ width: "100%" }}
          >
            {t("Back to Home")}
          </Button>
          {(solution.deploymentStatus === SolutionDeploymentStatus.Pending  || 
            solution.deploymentStatus === SolutionDeploymentStatus.Failed ) && (
            <Button 
              appearance="primary"
              onClick={() => onStartDeployment()}
              style={{ width: "100%" }}
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
.solution-detail-card {
  margin-bottom: 16px;
  width: 100%;
  max-width: 600px;
}

.solution-info {
  padding: 0 16px 16px;
}

.solution-detail-row {
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