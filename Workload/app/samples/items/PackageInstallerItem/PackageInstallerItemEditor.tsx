import { Stack } from "@fluentui/react";
import {
  TabValue,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Text,
  Button,
} from "@fluentui/react-components";
import { DeleteRegular, PlayRegular } from "@fluentui/react-icons";
import React, { useEffect, useState, useCallback } from "react";
import { ContextProps, PageProps } from "src/App";
import { PackageInstallerItemEditorRibbon } from "./PackageInstallerItemEditorRibbon";
import { getWorkloadItem, saveItemDefinition } from "../../../implementation/controller/ItemCRUDController";
import { WorkloadItem } from "../../../implementation/models/ItemCRUDModel";
import { useLocation, useParams } from "react-router-dom";
import "./../../../styles.scss";
import { useTranslation } from "react-i18next";
import { PackageDeployment, PackageInstallerItemDefinition, DeploymentStatus, DeploymentType } from "./PackageInstallerItemModel";
import { PackageInstallerItemEditorEmpty } from "./PackageInstallerItemEditorEmpty";
import { ItemEditorLoadingProgressBar } from "../../../implementation/controls/ItemEditorLoadingProgressBar";
import { callNotificationOpen } from "../../../implementation/controller/NotificationController";
import { DeploymentDetailView } from "./DeploymentDetailView";
import { callDatahubOpen } from "../../../implementation/controller/DataHubController";
import { DeploymentStrategyFactory } from "./deployment/DeploymentStrategyFactory";
import { WorkspaceDisplayNameCell } from "./components/WorkspaceDisplayName";
import { FolderDisplayNameCell } from "./components/FolderDisplayName";
import { PackageInstallerContext } from "./package/PackageInstallerContext";
import { PackageDisplayNameCell } from "./components/PackageDisplayName";
import { PackageInstallerDeployResult } from "./components/PackageInstallerDeployDialog";
import { callDialogOpen } from "../../../implementation/controller/DialogController";
import { NotificationType } from "@ms-fabric/workload-client";
import { t } from "i18next";

// Component to fetch and display folder name


export function PackageInstallerItemEditor(props: PageProps) {
  const pageContext = useParams<ContextProps>();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { workloadClient } = props;
  const [isUnsaved, setIsUnsaved] = useState<boolean>(true);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [editorItem, setEditorItem] = useState<WorkloadItem<PackageInstallerItemDefinition>>(undefined);
  const [selectedTab, setSelectedTab] = useState<TabValue>("");
  const [selectedSolution, setSelectedDeployment] = useState<PackageDeployment | undefined>(undefined);
  const [context, setContext] = useState<PackageInstallerContext>(new PackageInstallerContext(workloadClient));

  // Helper function to update item definition immutably
  const updateItemDefinition = useCallback((updates: Partial<PackageInstallerItemDefinition>) => {
    setEditorItem(prevItem => {
      if (!prevItem) return prevItem;
      
      return {
        ...prevItem,
        definition: {
          ...prevItem.definition,
          ...updates
        }
      };
    });
    setIsUnsaved(true);
  }, []);

  useEffect(() => {
      loadDataFromUrl(pageContext, pathname);
    }, [pageContext, pathname]);

  async function saveItemWithSuccessDialog(definition?: PackageInstallerItemDefinition) {
    const successResult = await SaveItem(definition);
    if (successResult) {
       callNotificationOpen(
            workloadClient,
            t("ItemEditor_Saved_Notification_Title"),
            t("ItemEditor_Saved_Notification_Text", { itemName: editorItem.displayName }),
            undefined,
            undefined
        );
      }
  }

  async function SaveItem(definition?: PackageInstallerItemDefinition) {
    var successResult = await saveItemDefinition<PackageInstallerItemDefinition>(
      workloadClient,
      editorItem.id,
      definition || editorItem.definition);
    setIsUnsaved(!successResult); 
    return successResult;  
  }

  async function loadDataFromUrl(pageContext: ContextProps, pathname: string): Promise<void> {
    setIsLoadingData(true);
    var item: WorkloadItem<PackageInstallerItemDefinition> = undefined;    
    if (pageContext.itemObjectId) {
      // for Edit scenario we get the itemObjectId and then load the item via the workloadClient SDK
      try {
        item = await getWorkloadItem<PackageInstallerItemDefinition>(
          workloadClient,
          pageContext.itemObjectId,          
        );
        
        // Ensure item definition is properly initialized without mutation
        if (!item.definition) {
          item = {
            ...item,
            definition: {
              deployments: []
            }
          };
        }
        const context = new PackageInstallerContext(workloadClient);
        await context.packageRegistry.loadFromAssets();
        if(item.definition?.additionalPackages) {
          item.definition.additionalPackages.forEach(url => {
            context.packageRegistry.addPackageFromUrl(url);
          });
        }
        setContext(context);
        setEditorItem(item);        
      } catch (error) {
        setEditorItem(undefined);        
      } 
    } else {
      console.log(`non-editor context. Current Path: ${pathname}`);
    }
    setIsUnsaved(false);
    if(item?.definition?.deployments?.length > 0) {
      setSelectedTab("home");
    } else {
      setSelectedTab("empty");
    }
    setIsLoadingData(false);
  }

  /**
   * Add a new configuration to the list
   */
  function addSolution() {
    setSelectedTab("empty");
  }

  async function connectLakehouse(){
    const lakehouse = await callDatahubOpen(workloadClient,
        ["Lakehouse"],
        "Select a lakehouse",
        false,
        true);
    if( lakehouse) {
      const newItemDefinition: PackageInstallerItemDefinition = {
        ...editorItem?.definition,
        lakehouseId: lakehouse.id,
      };
      updateItemDefinition(newItemDefinition);
      SaveItem(newItemDefinition);
    }
  }
  

  /**
   * Refresh deployment statuses for all deployments
   */
  async function handleRefreshDeployments() {
    if (!editorItem?.definition?.deployments || !workloadClient) {
      return;
    }

    try {
      // Process all deployments that have job IDs (indicating they have been started)
      const deploymentsToUpdate = editorItem.definition.deployments.filter(
        deployment => deployment.job && deployment.status !== DeploymentStatus.Succeeded && deployment.status !== DeploymentStatus.Failed && deployment.status !== DeploymentStatus.Cancelled
      );

      if (deploymentsToUpdate.length === 0) {
        callNotificationOpen(
          workloadClient,
          "No Updates Available",
          "No deployments require status updates.",
          undefined,
          undefined
        );
        return;
      }

      // Process all deployments that need status updates
      const updatePromises = deploymentsToUpdate.map(async (deployment) => {
        try {
          const pack = context.getPackage(deployment.packageId);
          if (!pack) {
            console.warn(`Package with typeId ${deployment.packageId} not found`);
            return null;
          }

          // Create the deployment strategy and update status
          const strategy = DeploymentStrategyFactory.createStrategy(
            context,
            editorItem,
            pack,
            deployment
          );

          const updatedDeployment = await strategy.updateDeploymentStatus();
          return updatedDeployment;
        } catch (error) {
          console.error(`Error updating deployment status for ${deployment.id}:`, error);
          return null;
        }
      });

      const updatedDeployments = await Promise.all(updatePromises);
      
      // Filter out null results and check if any deployments were actually updated
      const validUpdates = updatedDeployments.filter(
        (deployment): deployment is PackageDeployment => deployment !== null
      );

      if (validUpdates.length > 0) {
        // Update the deployments array with the new statuses
        const updatedDeploymentsArray = editorItem.definition.deployments.map(deployment => {
          const updatedDeployment = validUpdates.find(updated => updated.id === deployment.id);
          return updatedDeployment || deployment;
        });

        const newItemDefinition: PackageInstallerItemDefinition = {
          ...editorItem.definition,
          deployments: updatedDeploymentsArray
        };

        // Update the item definition and save changes
        updateItemDefinition(newItemDefinition);
        await SaveItem(newItemDefinition);

        // Update selectedSolution if it was one of the updated deployments
        if (selectedSolution) {
          const updatedSelectedSolution = validUpdates.find(
            updated => updated.id === selectedSolution.id
          );
          if (updatedSelectedSolution) {
            setSelectedDeployment(updatedSelectedSolution);
          }
        }

        callNotificationOpen(
          workloadClient,
          "Deployments Refreshed",
          `Successfully updated ${validUpdates.length} deployment(s).`,
          undefined,
          undefined
        );
      } else {
        callNotificationOpen(
          workloadClient,
          "No Changes",
          "All deployments are up to date.",
          undefined,
          undefined
        );
      }
    } catch (error) {
      console.error('Error during deployment status refresh:', error);
      callNotificationOpen(
        workloadClient,
        "Refresh Error",
        `Failed to refresh deployment statuses: ${error.message || error}`,
        undefined,
        undefined
      );
    }
  }

  /**
   * Remove a deployment from the list
   */
  function handleRemoveDeployment(deploymentId: string) {
    if (editorItem?.definition?.deployments) {
      const filteredDeployments = editorItem.definition.deployments.filter(
        (deployment) => deployment.id !== deploymentId
      );
      
      updateItemDefinition({ deployments: filteredDeployments });
    }
  }

  /**
   * Start deployment for a pending deployment
   */
  async function handleStartDeployment(deployment: PackageDeployment, event: React.MouseEvent) {
    if(event){
      event.stopPropagation(); // Prevent row click from triggering
    }
    
    // Get the package to determine deployment location
    const pack = context.getPackage(deployment.packageId);
    const deploymentLocation = pack?.deploymentConfig.location;
    
    const dialogResult = await callDialogOpen(
      workloadClient,
      process.env.WORKLOAD_NAME,
      `/PackageInstallerItem-deploy-dialog/${editorItem.id}?packageId=${deployment.packageId}&deploymentId=${deployment.id}&deploymentLocation=${deploymentLocation}`,
      500, 500,
      true)
    const result = dialogResult.value as PackageInstallerDeployResult;

    if (result && result.state === 'deploy') {
      // If a capacity was selected, update the deployment with the capacity info
      if (result.workspaceConfig) {
        deployment.workspace = {
          ...result.workspaceConfig          
        };
      }
    
      // Start the specific deployment strategy
      startDeployment(context, editorItem, deployment, handleDeploymentUpdate)
    } else {
      console.log("Deployment dialog was cancelled");
    }
  }

async function addDeployment(packageId: string) {
  // fint the package configuration that should be used for the deployment
  //TODO: configuration needs to be added to Deployment
  const pack = context.getPackage(packageId);
  if (pack) {
    const id = generateUniqueId();

    const createdSolution: PackageDeployment = {
      id: id,
      status: DeploymentStatus.Pending,
      deployedItems: [],
      packageId: packageId,
    };

    const newItemDefinition: PackageInstallerItemDefinition = {
      ...editorItem?.definition,
        deployments: Array.isArray(editorItem?.definition?.deployments) 
          ? [...editorItem.definition.deployments, createdSolution]
          : [createdSolution]
    };
    updateItemDefinition(newItemDefinition);
    
    // Save with the updated definition directly to avoid race condition
    await SaveItem(newItemDefinition);
    
    setSelectedDeployment(createdSolution);
    setSelectedTab("deployment");        
  } else {      
    console.error(`Package with typeId ${packageId} not found`);
    return;
  }
  }

  /**
   * Handle deployment update from the DeploymentDetailView component
   * Updates the deployment in the editor item and saves the changes
   */
  async function handleDeploymentUpdate(updatedDeployment: PackageDeployment) {
    // Update the selectedSolution state
    setSelectedDeployment(updatedDeployment);

    // Update the deplyoments in the editorItem.definition.deployments array
    if (editorItem?.definition?.deployments) {
      const updatedSolutions = editorItem.definition.deployments.map(deployment =>
        deployment.id === updatedDeployment.id ? updatedDeployment : deployment
      );
      
      const newItemDefinition: PackageInstallerItemDefinition = {
        ...editorItem.definition,
        deployments: updatedSolutions
      };
      
      // Update the item definition and save changes
      updateItemDefinition(newItemDefinition);
      await SaveItem(newItemDefinition);
    }
  }

  if (isLoadingData) {
    //making sure we show a loding indicator while the itme is loading
    return (<ItemEditorLoadingProgressBar 
      message={`Loading Solution Sample item ...`} />);
  }
  else {
    return (
      <Stack className="editor" data-testid="item-editor-inner">
        <PackageInstallerItemEditorRibbon
            {...props}      
            isLakehouseConnectEnabled={!editorItem?.definition?.lakehouseId}
            connectLakehouseCallback={connectLakehouse}  
            addSolutionCallback={addSolution}
            refreshDeploymentsCallback={handleRefreshDeployments}
            isSaveButtonEnabled={isUnsaved}
            saveItemCallback={saveItemWithSuccessDialog}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
        />
        <Stack className="main">
          {["empty"].includes(selectedTab as string) && (
            <span>
              <PackageInstallerItemEditorEmpty
                context={context}
                item={editorItem}
                itemDefinition={editorItem?.definition}
                onPackageSelected={addDeployment}
              />
            </span>
          )}
          {["deployment"].includes(selectedTab as string) && (
            <span>
              <DeploymentDetailView
                context={context}
                deployment={selectedSolution}
                item={editorItem}
                onBackToHome={() => setSelectedTab("home")}
                onStartDeployment={() => handleStartDeployment(selectedSolution, undefined)}
              />
            </span>
          )}

          {["home"].includes(selectedTab as string) && (
          <span>
              <h2>{t('Deployed packages')}</h2>
              {editorItem?.definition?.deployments?.length > 0 ? (
                <div className="deployment-container">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell>{t('Deployment Id')}</TableHeaderCell>
                        <TableHeaderCell>{t('Package Type')}</TableHeaderCell>
                        <TableHeaderCell>{t('Deployment Status')}</TableHeaderCell>
                        <TableHeaderCell>{t('Deployment Triggerd')}</TableHeaderCell>
                        <TableHeaderCell>{t('Workspace Name')}</TableHeaderCell>
                        <TableHeaderCell>{t('Folder Name')}</TableHeaderCell>
                        <TableHeaderCell>{t('Actions')}</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editorItem.definition.deployments.map((deployment: PackageDeployment) => {
                        return (
                          <TableRow key={deployment.id} onClick={() => {
                            setSelectedDeployment(deployment);
                            setSelectedTab("deployment");
                          }}>
                            <TableCell>{deployment.id}</TableCell>
                            <TableCell>
                              <PackageDisplayNameCell
                                context={context}
                                packageId={deployment.packageId}
                                showIcon={true} />
                            </TableCell>
                            <TableCell>{DeploymentStatus[deployment.status]}</TableCell>
                            <TableCell>
                              {deployment.triggeredTime 
                                ? new Date(deployment.triggeredTime).toLocaleString() 
                                : t('Not started yet')}
                            </TableCell>
                            <TableCell>
                              <WorkspaceDisplayNameCell
                                context={context}
                                workspaceId={deployment.workspace?.id} />
                            </TableCell>
                            <TableCell>
                              <FolderDisplayNameCell
                                  context={context}
                                  workspaceId={deployment.workspace?.id} 
                                  folderId={deployment.workspace?.folder?.id} />
                            </TableCell>
                            <TableCell>
                              <div style={{ display: "flex", gap: "4px" }}>
                                {deployment.status === DeploymentStatus.Pending && (
                                  <Button
                                    icon={<PlayRegular />}
                                    appearance="subtle"
                                    onClick={(e: React.MouseEvent) => handleStartDeployment(deployment, e)}
                                    aria-label={t('Start deployment')}
                                    title={t('Start deployment')}
                                  />
                                )}
                                <Button
                                  icon={<DeleteRegular />}
                                  appearance="subtle"
                                  disabled={deployment.status !== DeploymentStatus.Pending 
                                    && deployment.status !== DeploymentStatus.Failed}                                   
                                  onClick={(e: any) => {
                                    e.stopPropagation(); // Prevent row click from triggering
                                    handleRemoveDeployment(deployment.id);
                                  }}
                                  aria-label={t('Remove deployment')}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="no-deployments">
                  <Text size={300} italic>
                    {t('No Packages have been deployed yet')}
                  </Text>
                </div>
              )}
          </span>
          )}
        </Stack>
      </Stack>
    );
  }
}

function generateUniqueId(): string {
  // Generate a random unique ID for deployment
  return '' + Math.random().toString(36).substring(2, 9);
}

async function startDeployment( context: PackageInstallerContext, 
                                        item: WorkloadItem<PackageInstallerItemDefinition>,  
                                        deployment: PackageDeployment, 
                                        onDeploymentUpdate?: (updatedPackage: PackageDeployment) => void) {
  console.log(`Starting deployment for package: ${deployment.id}`);

  // Create a new deployment object to avoid modifying the original
  var newDeployment:PackageDeployment = {
    ...deployment,
    triggeredTime: new Date(),
    triggeredBy: "TODO",
    workspace: {
      ...deployment.workspace,
    }
  }; 

  try {
    
    // This allows us to track the deployment status without affecting the original deployment object
    if (!newDeployment.workspace) {
      throw new Error("Deployment workspace is not defined");
    }

    //Get the package from the context
    const pack = context.getPackage(newDeployment.packageId);
    if (!pack) {
      throw new Error(`Package with typeId ${newDeployment.packageId} not found`);
    }


    // Check if lakehouseId is required for SparkLivy deployment
    if (pack.deploymentConfig.type === DeploymentType.SparkLivy && 
        !item.definition?.lakehouseId) {
      throw new Error("Lakehouse ID is required for SparkLivy deployment but not provided in item definition.");
    }

    // Create the deployment strategy based on the package type
    const strategy = DeploymentStrategyFactory.createStrategy(
              context,
              item,
              pack,
              newDeployment,
    );
    //set the updated deployment object
    newDeployment = await strategy.deploy();

    switch (newDeployment.status) {
      case DeploymentStatus.Succeeded:
        callNotificationOpen(
            context.workloadClientAPI,
            t("Deployment finished"),
            t(`Deployment has successfully started ${newDeployment.job.id}.`),
            NotificationType.Success,
            undefined
          );
        break;
      case DeploymentStatus.Failed:
          callNotificationOpen(
            context.workloadClientAPI,
            t("Deployment failed"),
            t(`Deployment has failed.`),
            NotificationType.Error,
            undefined
          );
        break;
      case DeploymentStatus.InProgress:
          callNotificationOpen(
            context.workloadClientAPI,
            t("Deployment started"),
            t(`Deployment has successfully started ${newDeployment.job.id}.`),
            NotificationType.Info,
            undefined
          );
        break;
      case DeploymentStatus.Pending:
        break;
      case DeploymentStatus.Cancelled:
        break;
      default:
        console.warn(`Unknown deployment status: ${newDeployment.status}`);
        break;
    }
  }
  catch (error) {
    console.error(`Error on Deployment: ${error}`);
    callNotificationOpen(
      context.workloadClientAPI,
      "Deployment failed",
      `Failed to deploy the package: ${error.message || error}`,
      NotificationType.Error,
      undefined
    );
    // Create a failed deployment copy and update via callback
    newDeployment.status = DeploymentStatus.Failed
  }
  finally {
    if (onDeploymentUpdate) {
      onDeploymentUpdate(newDeployment);
    }
  }
}

