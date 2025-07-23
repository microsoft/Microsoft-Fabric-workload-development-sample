import { DatahubCompactViewConfig, DatahubCompactViewPageConfig, DatahubHeaderDialogConfig, DatahubSelectorDialogConfig, 
    DatahubSelectorDialogResult, 
    DatahubWizardDialogConfig, 
    DatahubWizardDialogResult, 
    ExtendedItemTypeV2, 
    OnelakeExplorerConfig, 
    OneLakeExplorerPageConfig, 
    OnelakeExplorerType, 
    WorkloadClientAPI } from "@ms-fabric/workload-client";
import { Item } from "../clients/FabricPlatformTypes";

export interface ItemAndPath extends Item {
    selectedPath: string;
}

export async function callDatahubWizardOpen(    
    workloadClient: WorkloadClientAPI,
    supportedTypes: ExtendedItemTypeV2[],
    dialogSubmittButtonName: string,
    dialogDescription: string,    
    multiSelectionEnabled: boolean = false,
    showFilesFolder: boolean = true,
    workspaceNavigationEnabled: boolean = true): Promise<ItemAndPath> {

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
                showFilesFolder: showFilesFolder,
            } as OnelakeExplorerConfig,
        } as OneLakeExplorerPageConfig,
        submitButtonName: dialogSubmittButtonName,
    }
 
    const result: DatahubWizardDialogResult = await workloadClient.datahub.openDatahubWizardDialog(datahubWizardConfig);
    if (!result.onelakeExplorerResult) {
        return null;
    }

    const selectedItem = result.onelakeExplorerResult;
    const { itemObjectId, workspaceObjectId } = selectedItem;
    //TODO: Update this when the type is available in the result
    const { displayName, description } = { displayName: "", description: "" };
    return {
        id: itemObjectId,
        workspaceId: workspaceObjectId,
        type: "TODO", // selectedItem.datahubItemUI.itemType, // TODO: Update this when the type is available in the result
        displayName,
        description,
        selectedPath: selectedItem.selectedPath.split('/').slice(2).join('/') // Remove the first two segments (workspace and item)
    };
}


/**
 * Calls the 'datahub.openDialog' function from the WorkloadClientAPI to open a OneLake data hub dialog to select Lakehouse item(s).
 * TODO: needs to change TypeV2
 * @param {ExtendedItemTypeV2[]} supportedTypes - The item types supported by the datahub dialog.
 * @param {string} dialogDescription - The sub-title of the datahub dialog
 * @param {boolean} multiSelectionEnabled - Whether the datahub dialog supports multi selection of datahub items
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {boolean} workspaceNavigationEnabled - Whether the datahub dialog supports workspace navigation bar or not.
 */
export async function callDatahubOpen(
    workloadClient: WorkloadClientAPI,
    supportedTypes: ExtendedItemTypeV2[],
    dialogDescription: string,
    multiSelectionEnabled: boolean,
    
    workspaceNavigationEnabled: boolean = true): Promise<Item> {

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