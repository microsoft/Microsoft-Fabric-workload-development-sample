import React, { useState } from "react";
import { PageProps } from "../../../../App";
import { Button, Text, Input } from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import { useParams, useLocation } from "react-router-dom";
import { callDialogClose } from "../../../../implementation/controller/DialogController";
import { CloseMode } from "@ms-fabric/workload-client";
import { DeploymentLocation, WorkspaceConfig } from "../PackageInstallerItemModel";
import { CapacityDropdown } from "./CapacityDropdown";
import { WorkspaceDropdown } from "./WorkspaceDropdown";


export interface PackageInstallerDeployProps extends PageProps {
    packageId: string;
    deploymentId: string;
    itemObjectId: string;
    deploymentLocation?: DeploymentLocation; // Optional deployment location
}

export interface PackageInstallerDeployResult {
    state: 'deploy' | 'cancel';
    workspaceConfig?: WorkspaceConfig; // Optional workspace configuration if selected
}

export function PackageInstallerDeployDialog(props: PackageInstallerDeployProps) {
    const { t } = useTranslation();
    const { workloadClient, deploymentLocation, packageId, deploymentId } = props;
    
    const [selectedCapacityId, setSelectedCapacityId] = useState<string>("");
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");
    const [workspaceName, setWorkspaceName] = useState<string>(`${packageId} - ${deploymentId}`);
    const [folderName, setFolderName] = useState<string>(`${packageId} - ${deploymentId}`);

    // Check what kind of selection we need to show
    const needsCapacitySelection = deploymentLocation === DeploymentLocation.NewWorkspace;
    const needsWorkspaceSelection = deploymentLocation === DeploymentLocation.ExistingWorkspace || 
                                    deploymentLocation === DeploymentLocation.NewFolder;
    const needsFolderName = deploymentLocation === DeploymentLocation.NewFolder;

    const handleCancel = () => {
      // Close the dialog with a cancelled result
      var result = { state: 'cancel' } as PackageInstallerDeployResult;
      callDialogClose(workloadClient, CloseMode.PopOne, result);
    };

    const handleStartDeployment = () => {
      // Close the dialog with a success result
      var result = { 
        state: 'deploy',
        workspaceConfig: {
          id: needsWorkspaceSelection ? selectedWorkspaceId : undefined,
          name: needsCapacitySelection ? workspaceName : undefined, // Set workspace name for new workspaces
          capacityId: needsCapacitySelection ? selectedCapacityId : undefined,
          createNew: !needsWorkspaceSelection,
          folder: {
            createNew: deploymentLocation === DeploymentLocation.NewFolder,
            //TODO: Add parent folder selection
            parentFolderId: undefined,
            name: needsFolderName ? folderName : undefined
          }
        } as WorkspaceConfig,
      } as PackageInstallerDeployResult;      
      callDialogClose(workloadClient, CloseMode.PopOne, result);
    };

    const isStartButtonDisabled = 
        (needsCapacitySelection && !selectedCapacityId) || 
        (needsWorkspaceSelection && !selectedWorkspaceId) ||
        (needsCapacitySelection && !workspaceName.trim()) || // Require workspace name for new workspaces
        (needsFolderName && !folderName.trim()); // Require folder name for new folders

    return (
        <div style={{ padding: '20px', minWidth: '400px' }}>
            <div style={{ marginBottom: '20px' }}>
                <Text size={500} weight="semibold">
                    {t('Configure the installation')}
                </Text>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
                <Text>
                    {needsCapacitySelection 
                        ? t('Select a capacity for the new workspace and start the deployment.')
                        : needsWorkspaceSelection && needsFolderName
                        ? t('Select an existing workspace and specify the folder name for deployment.')
                        : needsWorkspaceSelection
                        ? t('Select an existing workspace and start the deployment.')
                        : t('This will deploy the package to your selected workspace.')
                    }
                </Text>
            </div>
            
            {/* Show capacity selection if needed */}
            {needsCapacitySelection && (
                <div style={{ marginBottom: '20px' }}>
                    <Text weight="semibold" style={{ display: 'block', marginBottom: '8px' }}>
                        {t('Capacity')}
                    </Text>
                    <CapacityDropdown
                        workloadClient={workloadClient}
                        selectedCapacityId={selectedCapacityId}
                        onCapacitySelect={setSelectedCapacityId}
                        placeholder={t('Select a capacity')}
                    />
                </div>
            )}

            {/* Show workspace name input for new workspaces */}
            {needsCapacitySelection && (
                <div style={{ marginBottom: '20px' }}>
                    <Text weight="semibold" style={{ display: 'block', marginBottom: '8px' }}>
                        {t('Workspace Name')}
                    </Text>
                    <Input
                        value={workspaceName}
                        onChange={(ev, data) => setWorkspaceName(data.value)}
                        placeholder={t('Enter workspace name')}
                        style={{ width: '100%' }}
                    />
                </div>
            )}

            {/* Show workspace selection if needed */}
            {needsWorkspaceSelection && (
                <div style={{ marginBottom: '20px' }}>
                    <Text weight="semibold" style={{ display: 'block', marginBottom: '8px' }}>
                        {t('Workspace')}
                    </Text>
                    <WorkspaceDropdown
                        workloadClient={workloadClient}
                        selectedWorkspaceId={selectedWorkspaceId}
                        onWorkspaceSelect={setSelectedWorkspaceId}
                        placeholder={t('Select a workspace')}
                    />
                </div>
            )}

            {/* Show folder name input for new folders */}
            {needsFolderName && (
                <div style={{ marginBottom: '20px' }}>
                    <Text weight="semibold" style={{ display: 'block', marginBottom: '8px' }}>
                        {t('Folder Name')}
                    </Text>
                    <Input
                        value={folderName}
                        onChange={(ev, data) => setFolderName(data.value)}
                        placeholder={t('Enter folder name')}
                        style={{ width: '100%' }}
                    />
                </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <Button 
                    appearance="secondary" 
                    onClick={handleCancel}
                >
                    {t('Cancel')}
                </Button>
                <Button 
                    appearance="primary" 
                    onClick={handleStartDeployment}
                    disabled={isStartButtonDisabled}
                >
                    {t('Start Installation')}
                </Button>
            </div>
        </div>
    );
}

// Wrapper component to handle URL parameters for PackageInstallerDeployDialog
export function PackageInstallerDeployDialogWrapper({ workloadClient }: PageProps) {
    const { itemObjectId } = useParams<{ itemObjectId: string }>();
    const location = useLocation();
    
    // Parse URL parameters
    const urlParams = new URLSearchParams(location.search);
    const packageId = urlParams.get('packageId') || '';
    const deploymentId = urlParams.get('deploymentId') || '';
    const deploymentLocationStr = urlParams.get('deploymentLocation') || 'NewWorkspace';
    
    // Convert string to enum
    const deploymentLocation = DeploymentLocation[deploymentLocationStr as keyof typeof DeploymentLocation] || DeploymentLocation.NewWorkspace;
    
    const props: PackageInstallerDeployProps = {
        workloadClient,
        packageId,
        deploymentId,
        itemObjectId: itemObjectId || '',
        deploymentLocation
    };
    
    return <PackageInstallerDeployDialog {...props} />;
}

export default PackageInstallerDeployDialog;