import { AccessToken, WorkloadClientAPI } from "@ms-fabric/workload-client";
import { callAcquireFrontendAccessToken } from "../../../controller/AuthenticationController";
import { EnvironmentConstants } from "../../../constants";
import {OneLakeShorcutListResponse, OneLakeShortcutCreateRequest, OneLakeShortcutCreateResponse } from "./SampleOneLakeShortcutModel";

const oneLakeShortcutScope = "https://api.fabric.microsoft.com/OneLake.ReadWrite.All";

/**
 * Creates a new OneLake shortcut.
 * @param workloadClient - An instance of the WorkloadClientAPI
 * @param workspaceId - The ID of the workspace where to create the shortcut
 * @param shortcut - The shortcut creation request details
 * @returns The created shortcut object
 */
export async function createOneLakeShortcut(
    workloadClient: WorkloadClientAPI, 
    workspaceId: string, 
    itemId: string,
    shortcut: OneLakeShortcutCreateRequest
): Promise<OneLakeShortcutCreateResponse> {
    try {
        const accessToken: AccessToken = await callAcquireFrontendAccessToken(workloadClient, oneLakeShortcutScope);
        const url = `${EnvironmentConstants.FabricApiBaseUrl}/v1/workspaces/${workspaceId}/items/${itemId}/shortcuts`;
        
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(shortcut)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to create OneLake shortcut: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }

        const result = await response.json();
        console.log(`Successfully created OneLake shortcut with ID: ${result.id}`);
        return result;
    } catch (error: any) {
        console.error(`Error creating OneLake shortcut: ${error.message}`);
        throw error;
    }
}

/**
 * Gets a list of OneLake shortcuts in a workspace.
 * @param workloadClient - An instance of the WorkloadClientAPI
 * @param workspaceId - The ID of the workspace
 * @returns Array of OneLake shortcuts
 */
export async function listOneLakeShortcuts(
    workloadClient: WorkloadClientAPI, 
    workspaceId: string,
    itemId: string
): Promise<OneLakeShorcutListResponse> {
    try {
        const accessToken: AccessToken = await callAcquireFrontendAccessToken(workloadClient, oneLakeShortcutScope);
        const url = `${EnvironmentConstants.FabricApiBaseUrl}/v1/workspaces/${workspaceId}/items/${itemId}/shortcuts`;
        
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken.token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to list OneLake shortcuts: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }

        const result = await response.json();
        console.log(`Successfully retrieved ${result.value?.length || 0} OneLake shortcuts`);
        return result.value || [];
    } catch (error: any) {
        console.error(`Error listing OneLake shortcuts: ${error.message}`);
        throw error;
    }
}

/**
 * Gets a specific OneLake shortcut by ID.
 * @param workloadClient - An instance of the WorkloadClientAPI
 * @param workspaceId - The ID of the workspace
 * @param itemId - The ID of the item containing the shortcut
 * @param shortcutPath - The path of the shortcut  
 * @param shortcutName - The name of the shortcut
 * @returns The requested OneLake shortcut
 */
export async function getOneLakeShortcut(
    workloadClient: WorkloadClientAPI, 
    workspaceId: string,
    itemId: string,
    shortcutPath: string,
    shortcutName: string,
): Promise<OneLakeShortcutCreateResponse> {
    try {
        const accessToken: AccessToken = await callAcquireFrontendAccessToken(workloadClient, oneLakeShortcutScope);
        const url = `${EnvironmentConstants.FabricApiBaseUrl}/v1/workspaces/${workspaceId}/items/${itemId}/shortcuts/${shortcutPath}/${shortcutName}`;
        
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken.token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to get OneLake shortcut: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }

        const result = await response.json();
        console.log(`Successfully retrieved OneLake shortcut with Name: ${shortcutName}`);
        return result;
    } catch (error: any) {
        console.error(`Error getting OneLake shortcut: ${error.message}`);
        throw error;
    }
}

/**
 * Deletes an OneLake shortcut.
 * @param workloadClient - An instance of the WorkloadClientAPI
 * @param workspaceId - The ID of the workspace
 * @param itemId - The ID of the item containing the shortcut
 * @param shortcutPath - The path of the shortcut  
 * @param shortcutName - The name of the shortcut
 */
export async function deleteOneLakeShortcut(
    workloadClient: WorkloadClientAPI, 
    workspaceId: string,
    itemId: string,
    shortcutPath: string,
    shortcutName: string,
): Promise<void> {
    try {
        const accessToken: AccessToken = await callAcquireFrontendAccessToken(workloadClient, oneLakeShortcutScope);
        const url = `${EnvironmentConstants.FabricApiBaseUrl}/v1/workspaces/${workspaceId}/items/${itemId}/shortcuts/${shortcutPath}/${shortcutName}`;
        
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${accessToken.token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to delete OneLake shortcut: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }

        console.log(`Successfully deleted OneLake shortcut with Name: ${shortcutName}`);
    } catch (error: any) {
        console.error(`Error deleting OneLake shortcut: ${error.message}`);
        throw error;
    }
}
