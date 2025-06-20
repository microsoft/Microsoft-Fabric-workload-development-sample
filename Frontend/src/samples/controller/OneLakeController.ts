import { AccessToken, WorkloadClientAPI } from "@ms-fabric/workload-client";
import { callAuthAcquireFrontendAccessToken } from "./../../ItemEditor/ItemEditorController";
import { EnvironmentConstants } from "../../constants";

export const oneLakeScope = "https://storage.azure.com/user_impersonation";


export async function checkIfFileExists(workloadClient: WorkloadClientAPI, filePath: string): Promise<boolean> {
    const url = `${EnvironmentConstants.OneLakeDFSBaseUrl}/${filePath}?resource=file`;
    try {
        const accessToken: AccessToken = await callAuthAcquireFrontendAccessToken(workloadClient, oneLakeScope);
        const response = await fetch(url, {
            method: "HEAD",
            headers: { Authorization: `Bearer ${accessToken.token}` }
        });
        if (response.status === 200) {
            return true;
        } else if (response.status === 404) {
            return false;
        } else {
            console.warn(`checkIfFileExists received unexpected status code: ${response.status}`);
            return false;
        }
    } catch (ex: any) {
        console.error(`checkIfFileExists failed for filePath: ${filePath}. Error: ${ex.message}`);
        return false;
    }
}

export async function getOneLakeFolderNames(workloadClient: WorkloadClientAPI, workspaceId: string, itemId: string): Promise<string[] | null> {
    const url = `${EnvironmentConstants.OneLakeDFSBaseUrl}/${workspaceId}`;
    const appendQuery = buildGetOneLakeFoldersQueryParameters(itemId);
    const appendUrl = `${url}?${appendQuery}`;
    try {
        const accessToken: AccessToken = await callAuthAcquireFrontendAccessToken(workloadClient, oneLakeScope);
        const response = await fetch(appendUrl, {
            headers: { Authorization: `Bearer ${accessToken.token}` }
        });
        if (response.status === 200) {
            const getFoldersResultObj: GetFoldersResult = await response.json();
            return getFoldersResultObj.paths?.filter(f => f.isDirectory).map(f => f.name) ?? [];
        } else if (response.status === 404) {
            return null;
        } else {
            console.warn(`getOneLakeFolderNames received unexpected status code: ${response.status}`);
            return null;
        }
    } catch (ex: any) {
        console.error(`getOneLakeFolderNames failed for workspaceId: ${workspaceId}, itemId: ${itemId}, Error: ${ex.message}`);
        return null;
    }
}


export async function writeToOneLakeFileAsText(workloadClient: WorkloadClientAPI, filePath: string, content: string): Promise<void> {
    const url = `${EnvironmentConstants.OneLakeDFSBaseUrl}/${filePath}?resource=file`;
    let accessToken: AccessToken
    try {
        accessToken = await callAuthAcquireFrontendAccessToken(workloadClient, oneLakeScope);
        const response = await fetch(url, {
            method: "PUT",
            headers: { Authorization: `Bearer ${accessToken.token}` },
            body: "" // Create empty file
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        console.log(`writeToOneLakeFile: Creating a new file succeeded for filePath: ${filePath}`);
    } catch (ex: any) {
        console.error(`writeToOneLakeFile: Creating a new file failed for filePath: ${filePath}. Error: ${ex.message}`);
        return;
    }
    await appendToOneLakeFile(accessToken.token, filePath, content);
}

export async function readOneLakeFileAsText(workloadClient: WorkloadClientAPI, filePath: string): Promise<string> {
    const url = `${EnvironmentConstants.OneLakeDFSBaseUrl}/${filePath}`;
    try {
        const accessToken: AccessToken = await callAuthAcquireFrontendAccessToken(workloadClient, oneLakeScope);
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken.token}` }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const content = await response.text();
        console.log(`getOneLakeFile succeeded for source: ${filePath}`);
        return content;
    } catch (ex: any) {
        console.error(`getOneLakeFile failed for source: ${filePath}. Error: ${ex.message}`);
        return "";
    }
}

export async function deleteOneLakeFile(workloadClient: WorkloadClientAPI, filePath: string): Promise<void> {
    const url = `${EnvironmentConstants.OneLakeDFSBaseUrl}/${filePath}?recursive=true`;
    try {
        const accessToken: AccessToken = await callAuthAcquireFrontendAccessToken(workloadClient, oneLakeScope);
        const response = await fetch(url, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken.token}` }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        console.log(`deleteOneLakeFile succeeded for filePath: ${filePath}`);
    } catch (ex: any) {
        console.error(`deleteOneLakeFile failed for filePath: ${filePath}. Error: ${ex.message}`);
    }
}

export function getOneLakeFilePath(workspaceId: string, itemId: string, fileName: string): string {
    return `${workspaceId}/${itemId}/Files/${fileName}`;
}

async function appendToOneLakeFile(token: string, filePath: string, content: string): Promise<void> {
    const url = `${EnvironmentConstants.OneLakeDFSBaseUrl}/${filePath}`;
    const appendQuery = buildAppendQueryParameters();
    const appendUrl = `${url}?${appendQuery}`;
    try {
        const appendResponse = await fetch(appendUrl, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: content
        });
        if (!appendResponse.ok) throw new Error(`HTTP ${appendResponse.status}`);

        // For Node.js: Buffer.byteLength, for browser: new TextEncoder().encode(content).length
        const contentLength = typeof Buffer !== "undefined"
            ? Buffer.byteLength(content, "utf8")
            : new TextEncoder().encode(content).length;

        const flushQuery = buildFlushQueryParameters(contentLength);
        const flushUrl = `${url}?${flushQuery}`;

        const flushResponse = await fetch(flushUrl, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!flushResponse.ok) throw new Error(`HTTP ${flushResponse.status}`);

        console.log(`appendToOneLakeFile succeeded for filePath: ${filePath}`);
    } catch (ex: any) {
        console.error(`appendToOneLakeFile failed for filePath: ${filePath}. Error: ${ex.message}`);
    }
    console.log(`appendToOneLakeFile completed for filePath: ${filePath}`);
}

function buildAppendQueryParameters(): string {
    return "position=0&action=append";
}

function buildFlushQueryParameters(contentLength: number): string {
    return `position=${contentLength}&action=flush`;
}

function buildGetOneLakeFoldersQueryParameters(itemId: string): string {
    return `directory=${itemId}&resource=filesystem&recursive=false`;
}
