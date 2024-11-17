import { TableMetadata } from "../models/LakehouseExplorerModel";

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