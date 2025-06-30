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
import { AvailableSolutionConfigurations, Solution, SolutionConfiguration, SolutionDeploymentStatus, SolutionType } from "./SolutionSampleItemModel";
import { GenericItem } from "../../../workload/models/ItemCRUDModel";
import { NotificationType, WorkloadClientAPI } from "@ms-fabric/workload-client";
import { callNotificationOpen } from "../../../workload/controller/NotificationController";
import { getOneLakeFilePath, writeToOneLakeFileAsText } from "src/samples/controller/OneLakeController";

// Props for the SolutionDetailCard component
export interface SolutionDetailCardProps {
  workloadClient: WorkloadClientAPI;
  solution: Solution;
  item: GenericItem;
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
  onBackToHome
}) => {
  const { t } = useTranslation();
  const solutionConfiguration = AvailableSolutionConfigurations[solution.type];

  async function getSolutionContent(soltuionType: SolutionType, fileReference: string): Promise<string> {
  try {
    const response = await fetch(`/assets/samples/items/SolutionSampleItem/SolutionDefinitions/${soltuionType}/${fileReference}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch script: ${response.status} ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error fetching analysis script:', error);
    throw error;
  }
}


async function copySolutionContentToItem(
  workloadClient: WorkloadClientAPI,
  item: GenericItem,
  solutionConfig: SolutionConfiguration,
  solution: Solution) : Promise<void>{


    solution.deploymentStatus = SolutionDeploymentStatus.InProgress;
    solutionConfig.items.forEach((configItem) => {
      configItem.itemDefinition.forEach(async (itemDefinition) => {
        try {
          //writing all the metadata files to the item in OneLake
          const definitionContent = await getSolutionContent(solutionConfig.type, itemDefinition.fileReference);
          const definitionDestPath = getOneLakeFilePath(item.workspaceId, item.id, 
            `SolutionDefinitions/${solutionConfig.type}/${itemDefinition.fileReference}`);
          await writeToOneLakeFileAsText(workloadClient, definitionDestPath, definitionContent);
          console.log(`Successfully uploaded script to OneLake path: ${definitionContent}`);
        }
        catch (error) {
          console.error(`Error uploading script to OneLake: ${error}`);
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
      })
    })


    //TODO: Start a spark session that uses the uplaoded definitions to create the items
    //Check a lakehouse reference is provided to run the spark job later

    solution.deploymentStatus = SolutionDeploymentStatus.Succeeded;
  }

 async function onStartDeployment() {
    // Placeholder for deployment logic
    // Here you would typically call an API to start the deployment
    // For example: workloadClient.startSolutionDeployment(solution.id);
    // TODO needs to be implemented
    console.log(`Starting deployment for solution: ${solution.id}`);

    await copySolutionContentToItem(
                workloadClient,
                item,
                solutionConfiguration,
                solution);

    callNotificationOpen(
                workloadClient,
                "Not implemented",
                "Deployment logic is not implemented yet.",),
                NotificationType.Error,
                undefined

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
          {solution.deploymentStatus === SolutionDeploymentStatus.Pending && (
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