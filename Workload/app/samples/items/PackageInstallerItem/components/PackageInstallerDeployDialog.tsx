import React, { } from "react";
import { PageProps } from "../../../../App";
import { Stack } from "@fluentui/react";
import { Button, Text } from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import { callDialogClose } from "../../../../implementation/controller/DialogController";
import { CloseMode } from "@ms-fabric/workload-client";


export interface PackageInstallerDeployResult {
    state: 'deploy' | 'cancel';
}

export function PackageInstallerDeployDialog(props: PageProps) {
    const { t } = useTranslation();
    const { workloadClient } = props;

    const handleCancel = () => {
      // Close the dialog with a cancelled result
      var result = { state: 'cancel' } as PackageInstallerDeployResult;
      callDialogClose(workloadClient, CloseMode.PopOne, result);
    };

    const handleStartDeployment = () => {
      // Close the dialog with a success result
      var result = { state: 'deploy' } as PackageInstallerDeployResult;      
      callDialogClose(workloadClient, CloseMode.PopOne, result);
    };

    return (
        <Stack tokens={{ childrenGap: 20 }} style={{ padding: '20px', minWidth: '400px' }}>
            <Text size={500} weight="semibold">
                {t('Deploy Package')}
            </Text>
            
            <Text>
                {t('Are you ready to start the deployment? This will deploy the package to your selected workspace.')}
            </Text>
            
            <Stack horizontal tokens={{ childrenGap: 10 }} style={{ justifyContent: 'flex-end', marginTop: '20px' }}>
                <Button 
                    appearance="secondary" 
                    onClick={handleCancel}
                >
                    {t('Cancel')}
                </Button>
                <Button 
                    appearance="primary" 
                    onClick={handleStartDeployment}
                >
                    {t('Start Deployment')}
                </Button>
            </Stack>
        </Stack>
    );
}

export default PackageInstallerDeployDialog;