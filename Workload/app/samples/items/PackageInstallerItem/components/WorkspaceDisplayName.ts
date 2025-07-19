import React, { useEffect, useState } from "react";
import { Body1, Text } from "@fluentui/react-components";
import { NotificationType, WorkloadClientAPI } from "@ms-fabric/workload-client";
import { callNotificationOpen } from "../../../../implementation/controller/NotificationController";
import { callNavigationNavigate } from "../../../../implementation/controller/NavigationController";
import { PackageInstallerContext } from "../package/PackageInstallerContext";

// Component to fetch and display workspace name
export function WorkspaceDisplayNameLabel({context , workspaceId }: { context: PackageInstallerContext, workspaceId: string }) {
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchWorkspaceName() {
      if (!workspaceId) {
        setWorkspaceName("N/A");
        setIsLoading(false);
        return;
      }

      try {
        const workspace = await context.fabricPlatformAPIClient.workspaces.getWorkspace(workspaceId);
        setWorkspaceName(workspace.displayName || workspaceId);
      } catch (error) {
        console.warn(`Failed to fetch workspace name for ${workspaceId}:`, error);
        setWorkspaceName(workspaceId); // Fallback to ID if name fetch fails
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkspaceName();
  }, [workspaceId, context.workloadClientAPI]);

  if (isLoading) {
    return React.createElement(Body1, null, "Loading...");
  }

  return React.createElement(Body1, {
    style: { 
      cursor: "pointer", 
      color: "#0078d4",
      textDecoration: "underline"
    },
    onClick: () => handleWorkspaceClick(context.workloadClientAPI, workspaceId),
    title: `Click to open workspace ${workspaceId}`
  }, workspaceName);
}

// Component to fetch and display workspace name in table cell format
export function WorkspaceDisplayNameCell({context, workspaceId }: { workspaceId: string, context: PackageInstallerContext }) {
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchWorkspaceName() {
      if (!workspaceId) {
        setWorkspaceName("N/A");
        setIsLoading(false);
        return;
      }

      try {
        const workspace = await context.fabricPlatformAPIClient.workspaces.getWorkspace(workspaceId);
        setWorkspaceName(workspace.displayName || workspaceId);
      } catch (error) {
        console.warn(`Failed to fetch workspace name for ${workspaceId}:`, error);
        setWorkspaceName(workspaceId); // Fallback to ID if name fetch fails
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkspaceName();
  }, [workspaceId, context.workloadClientAPI]);

  if (isLoading) {
    return React.createElement(Text, null, "Loading...");
  }

  return React.createElement(Text, {
    style: { 
      cursor: "pointer", 
      color: "#0078d4",
      textDecoration: "underline"
    },
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      handleWorkspaceClick(context.workloadClientAPI, workspaceId);
    },
    title: `Click to open workspace ${workspaceId}`
  }, workspaceName);
}

 // Function to navigate to a workspace
  export async function handleWorkspaceClick(workloadClient: WorkloadClientAPI, workspaceId: string) {
    try {
      // Validate workspace ID to prevent undefined values in URL
      if (!workspaceId || workspaceId === 'undefined' || workspaceId.trim() === '') {
        console.warn('Invalid workspace ID:', workspaceId);
        callNotificationOpen(
          workloadClient,
          "Navigation Error",
          "Cannot open workspace: Invalid or missing workspace ID",
          NotificationType.Error,
          undefined
        );
        return;
      }
      
      await callNavigationNavigate(workloadClient, 
        "host",
        `/groups/${workspaceId}`);
    } catch (error) {
      console.error(`Error navigating to workspace ${workspaceId}:`, error);
      callNotificationOpen(
        workloadClient,
        "Navigation Error",
        `Failed to open workspace: ${error.message || error}`,
        NotificationType.Error,
        undefined
      );
    }
  };
