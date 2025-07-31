import { Item } from "../../../clients/FabricPlatformTypes";
import { EnvironmentConstants } from "../../../constants";
import { callAcquireFrontendAccessToken } from "../../../controller/AuthenticationController";
import { AccessToken, WorkloadClientAPI } from "@ms-fabric/workload-client";
import { FileMetadata, OneLakePathContainer, TableMetadata } from "./SampleOneLakeItemExplorerModel";
import { SCOPES } from "../../../clients/FabricPlatformScopes";

/**
 * Retrieves a list of tables from the specified Fabric Item.
 */
export async function getTables(
    workloadClient: WorkloadClientAPI,
    workspaceId: string,
    itemId: string
): Promise<TableMetadata[]> {
    const directory = `${itemId}/Tables/`;
    const oneLakeContainer = await getPathList(workloadClient, workspaceId, directory, true);
    const deltaLogDirectory = "/_delta_log";
    const tables = (oneLakeContainer.paths || [])
        .filter(path =>
            path.name.endsWith(deltaLogDirectory) ||
            (path.isShortcut && 
                (path.accountType === "ADLS" || path.accountType === "ExternalADLS"))
        )
        .map(path => {

            let pathName = path.name;
            let parts = pathName.split('/');
            let tableName: string;
            let schemaName: string | null = null;

            // Remove '_delta_log' if present
            if (pathName.endsWith(deltaLogDirectory)) {
                pathName = parts.slice(0, -1).join('/');
                parts = pathName.split('/');
            }

            tableName = parts[parts.length - 1];
            if (parts.length === 4) {
                schemaName = parts[2];
            }

            return {
                name: tableName,
                path: pathName + '/',
                isSelected: false,
                schema: schemaName,
            };
        });

    return tables;
}

/**
 * Retrieves a Fabric item.
 */
export async function getItem(
    token: string,
    workspaceId: string,
    itemId: string
): Promise<Item | null> {
    const url = `${EnvironmentConstants.FabricApiBaseUrl}/v1/workspaces/${workspaceId}/items/${itemId}`;
    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const item: Item = await response.json();
        return item;
    } catch (ex: any) {
        console.error(`Failed to retrieve Fabric item for id: ${itemId} in workspace: ${workspaceId}. Error: ${ex.message}`);
        return null;
    }
}

export async function getFiles(
    workloadClient: WorkloadClientAPI,
    workspaceId: string,
    itemId: string
): Promise<FileMetadata[]> {
    const directory = `${itemId}/Files/`;
    const oneLakeContainer = await getPathList(workloadClient, workspaceId, directory, true);
    const files = (oneLakeContainer.paths || []).map(path => {
        const pathName = path.name;
        const parts = pathName.split('/');

        // Path structure: <itemId>/Files/...<Subdirectories>.../<fileName>
        const fileName = parts[parts.length - 1];

        // Remove the prefix (itemId/Files/) from the path
        const relativePath = pathName.length > directory.length ? pathName.substring(directory.length) : "";

        return {
            name: fileName,
            path: relativePath,
            isDirectory: path.isDirectory
        } as FileMetadata;
    });

    return files;
}

/**
 * Retrieves a list of paths available in the selected directory using the provided bearer token.
 */
export async function getPathList(
    workloadClient: WorkloadClientAPI,
    workspaceId: string,
    directory: string,
    recursive = false
): Promise<OneLakePathContainer> {
    const url = `${EnvironmentConstants.OneLakeDFSBaseUrl}/${workspaceId}/?recursive=${recursive}&resource=filesystem&directory=${encodeURIComponent(directory)}&getShortcutMetadata=true`;
    const accessToken: AccessToken = await callAcquireFrontendAccessToken(workloadClient, SCOPES.ONELAKE);
    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken.token}` }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const paths: OneLakePathContainer = await response.json();
        return paths;
    } catch (ex: any) {
        console.error(`getPathList failed: ${ex.message}`);
        throw ex;
    }
}