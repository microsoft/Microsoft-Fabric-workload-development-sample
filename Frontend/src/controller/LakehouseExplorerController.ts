import { TableMetadata, FileMetadata } from "../models/LakehouseExplorerModel";

export const getTablesInLakehousePath = (baseUrl: string, workspaceObjectId: string, itemObjectId: string) => {
    return `${baseUrl}/onelake/${workspaceObjectId}/${itemObjectId}/tables`;
}

export async function getTablesInLakehouse(
    tablesPath: string,
    token: string): Promise<TableMetadata[]> {
    try {
        const response: Response = await fetch(tablesPath, { method: `GET`, headers: { 'Authorization': 'Bearer ' + token } });
        const responseBody: string = await response.text();
        const data = JSON.parse(responseBody);
        if (!data.ErrorCode) {
            return data;
        } else {
            return null;
        }
    }
    catch (error) {
        console.error(`Error fetching tables: ${error}`);
        return null;
    }
}


export const getFilesInLakehousePath = (baseUrl: string, workspaceObjectId: string, itemObjectId: string) => {
    return `${baseUrl}/onelake/${workspaceObjectId}/${itemObjectId}/files`;
}

export async function getFilesInLakehouse(
    filesPath: string,
    token: string): Promise<FileMetadata[]> {
    try {
        const response: Response = await fetch(filesPath, { method: `GET`, headers: { 'Authorization': 'Bearer ' + token } });
        const responseBody: string = await response.text();
        const data = JSON.parse(responseBody);
        if (!data.ErrorCode) {
            return data;
        } else {
            return null;
        }
    }
    catch (error) {
        console.error(`Error fetching files: ${error}`);
        return null;
    }
}