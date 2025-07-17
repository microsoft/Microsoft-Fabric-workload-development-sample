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
import { Deployment, PackageInstallerItemDefinition, DeploymentStatus, WorkspaceConfig, PackageDeploymentLocation, SolutionConfigurationsArray } from "./PackageInstallerItemModel";
import { PackageInstallerItemEditorEmpty } from "./PackageInstallerItemEditorEmpty";
import { ItemEditorLoadingProgressBar } from "../../../implementation/controls/ItemEditorLoadingProgressBar";
import { callNotificationOpen } from "../../../implementation/controller/NotificationController";
import { DeploymentDetailView } from "./DeploymentDetailView";
import { callDatahubOpen } from "../../../implementation/controller/DataHubController";
import { handleWorkspaceClick, startDeployment } from "./UXHelper";

export function PackageInstallerItemEditor(props: PageProps) {
  const pageContext = useParams<ContextProps>();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { workloadClient } = props;
  const [isUnsaved, setIsUnsaved] = useState<boolean>(true);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [editorItem, setEditorItem] = useState<WorkloadItem<PackageInstallerItemDefinition>>(undefined);
  const [selectedTab, setSelectedTab] = useState<TabValue>("");
  const [selectedSolution, setSelectedDeployment] = useState<Deployment | undefined>(undefined);

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

  async function SaveItem(definition?: PackageInstallerItemDefinition) {

    var successResult = await saveItemDefinition<PackageInstallerItemDefinition>(
      workloadClient,
      editorItem.id,
      definition || editorItem.definition);
    setIsUnsaved(!successResult);
    callNotificationOpen(
            workloadClient,
            t("ItemEditor_Saved_Notification_Title"),
            t("ItemEditor_Saved_Notification_Text", { itemName: editorItem.displayName }),
            undefined,
            undefined
        );
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
  async function handleStartDeployment(deployment: Deployment, event: React.MouseEvent) {
    event.stopPropagation(); // Prevent row click from triggering
    
    startDeployment(
      workloadClient,      
      editorItem,
      deployment,
      handleDeploymentUpdate);
  }

async function addDeployment(packageId: string) {
  // fint the package configuration that should be used for the deployment
  //TODO: configuration needs to be added to Deployment
  const pack = SolutionConfigurationsArray.find(pack => pack.typeId === packageId);
  if (pack) {
    const id = generateUniqueId();
    let workspaceSetting: WorkspaceConfig | undefined = undefined;
    if(pack.locationType == PackageDeploymentLocation.NewWorkspace) {
      workspaceSetting = {
        createNew: true, // Always create a new workspace for the package
        name: `${packageId} - ${id}`,
        description: `Workspace for package ${packageId} deployment ${id}`,
        //TODO: Fix the capacity issue here!
        capacityId: "4A9D5006-D552-4335-BF0D-7CD5D2FC8B83" // Use the first deployment's capacityId if available
      };    
    } else if (pack.locationType == PackageDeploymentLocation.NewFolder) {
      workspaceSetting = {
        createNew: false, // Always create a new workspace for the package
        id: editorItem?.workspaceId,
        folder: {
          createNew: true, // Always create a new folder for the package
          name: `${packageId} - ${id}`
        }
      };
    }

    const createdSolution: Deployment = {
      id: id,
      status: DeploymentStatus.Pending,
      itemsCreated: [],
      packageId: packageId,
      workspace: {
        ...workspaceSetting,
      }
      //TODO: subfolderId need to be set once avilable in the item definition
      //subfolderId: editorItem?.subfolderObjectId,
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
  async function handleDeploymentUpdate(updatedDeployment: Deployment) {
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
            isSaveButtonEnabled={isUnsaved}
            saveItemCallback={SaveItem}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
        />
        <Stack className="main">
          {["empty"].includes(selectedTab as string) && (
            <span>
              <PackageInstallerItemEditorEmpty
                workloadClient={workloadClient}
                item={editorItem}
                itemDefinition={editorItem?.definition}
                onPackageSelected={addDeployment}
              />
            </span>
          )}
          {["deployment"].includes(selectedTab as string) && (
            <span>
              <DeploymentDetailView
                workloadClient={workloadClient}
                deployment={selectedSolution}
                item={editorItem}
                lakehouseId={editorItem?.definition?.lakehouseId}
                onBackToHome={() => setSelectedTab("home")}
                onDeploymentUpdate={handleDeploymentUpdate}
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
                        <TableHeaderCell>{t('Workspace ID')}</TableHeaderCell>
                        <TableHeaderCell>{t('Folder ID')}</TableHeaderCell>
                        <TableHeaderCell>{t('Actions')}</TableHeaderCell>

                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editorItem.definition.deployments.map((deployment: Deployment) => (
                        <TableRow key={deployment.id} onClick={() => {
                          setSelectedDeployment(deployment);
                          setSelectedTab("deployment");
                        }}>
                          <TableCell>{deployment.id}</TableCell>
                          <TableCell>{deployment.packageId}</TableCell>
                          <TableCell>{DeploymentStatus[deployment.status]}</TableCell>
                          <TableCell>
                            {deployment.workspace?.id ? (
                              <Text 
                                style={{ 
                                  cursor: "pointer", 
                                  color: "#0078d4",
                                  textDecoration: "underline"
                                }}
                                onClick={(e: React.MouseEvent) => handleWorkspaceClick(workloadClient, deployment.workspace.id)}
                                title={`Click to open workspace ${deployment.workspace.id}`}
                              >
                                {deployment.workspace.id}
                              </Text>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell>{deployment.workspace?.folder?.id}</TableCell>
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
                                disabled={deployment.status !== DeploymentStatus.Pending}
                                onClick={(e: any) => {
                                  e.stopPropagation(); // Prevent row click from triggering
                                  handleRemoveDeployment(deployment.id);
                                }}
                                aria-label={t('Remove deployment')}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
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

