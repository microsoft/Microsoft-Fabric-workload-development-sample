import { DatahubCompactViewConfig, DatahubCompactViewPageConfig, DatahubHeaderDialogConfig, DatahubSelectorDialogConfig, 
    DatahubSelectorDialogResult, 
    DatahubWizardDialogConfig, 
    DatahubWizardDialogResult, 
    ExtendedItemTypeV2, 
    OnelakeExplorerConfig, 
    OneLakeExplorerPageConfig, 
    OnelakeExplorerType, 
    WorkloadClientAPI } from "@ms-fabric/workload-client";
import { GenericItem } from "../models/ItemCRUDModel";
import { SelectedItemAndPath } from "../models/DataHubModel";


export async function callDatahubWizardOpen(
    supportedTypes: ExtendedItemTypeV2[],
    dialogDescription: string,
    multiSelectionEnabled: boolean,
    workloadClient: WorkloadClientAPI,
    workspaceNavigationEnabled: boolean = true): Promise<SelectedItemAndPath> {

   const datahubWizardConfig: DatahubWizardDialogConfig = {
        datahubCompactViewPageConfig: {
            datahubCompactViewConfig: {
                supportedTypes: supportedTypes,
                multiSelectionEnabled: multiSelectionEnabled,
                workspaceNavigationEnabled: workspaceNavigationEnabled
            } as DatahubCompactViewConfig
        } as DatahubCompactViewPageConfig,
        oneLakeExplorerPageConfig: {
            headerDialogConfig: {
                dialogTitle: 'Select Item',
                dialogDescription: dialogDescription,
            } as DatahubHeaderDialogConfig,
            onelakeExplorerConfig: {
                onelakeExplorerTypes: Object.values(OnelakeExplorerType),
                showFilesFolder: true,
            } as OnelakeExplorerConfig,
        } as OneLakeExplorerPageConfig,
        submitButtonName: 'Select',
    }
 
    const result: DatahubWizardDialogResult = await workloadClient.datahub.openDatahubWizardDialog(datahubWizardConfig);
    if (!result.onelakeExplorerResult) {
        return null;
    }

    const selectedItem = result.onelakeExplorerResult;
    return {
        id: selectedItem.itemObjectId,
        workspaceId: selectedItem.workspaceObjectId,
        selectedPath: selectedItem.selectedPath
    }
}


/**
 * Calls the 'datahub.openDialog' function from the WorkloadClientAPI to open a OneLake data hub dialog to select Lakehouse item(s).
 * 
 * @param {ExtendedItemTypeV2[]} supportedTypes - The item types supported by the datahub dialog.
 * @param {string} dialogDescription - The sub-title of the datahub dialog
 * @param {boolean} multiSelectionEnabled - Whether the datahub dialog supports multi selection of datahub items
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {boolean} workspaceNavigationEnabled - Whether the datahub dialog supports workspace navigation bar or not.
 */
export async function callDatahubOpen(
    supportedTypes: ExtendedItemTypeV2[],
    dialogDescription: string,
    multiSelectionEnabled: boolean,
    workloadClient: WorkloadClientAPI,
    workspaceNavigationEnabled: boolean = true): Promise<GenericItem> {

    const datahubConfig: DatahubSelectorDialogConfig = {
        supportedTypes: supportedTypes,
        multiSelectionEnabled: multiSelectionEnabled,
        dialogDescription: dialogDescription,
        workspaceNavigationEnabled: workspaceNavigationEnabled,
        // not in use in the regular selector, but required to be non-empty for validation
        hostDetails: {
            experience: 'sample experience 3rd party', // Change this to reflect your team's process, e.g., "Build notebook" 
            scenario: 'sample scenario 3rd party', // Adjust this to the specific action, e.g., "Select Lakehouse" 
        }
    };

    const result: DatahubSelectorDialogResult = await workloadClient.datahub.openDialog(datahubConfig);
    if (!result.selectedDatahubItem) {
        return null;
    }

    const selectedItem = result.selectedDatahubItem[0];
    const { itemObjectId, workspaceObjectId } = selectedItem;
    const { displayName, description } = selectedItem.datahubItemUI;
    return {
        id: itemObjectId,
        workspaceId: workspaceObjectId,
        type: selectedItem.datahubItemUI.itemType,
        displayName,
        description
    };
}