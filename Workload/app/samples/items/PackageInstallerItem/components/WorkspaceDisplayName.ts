import React, { useEffect, useState } from "react";
import { Body1, Text } from "@fluentui/react-components";
import { navigateToWorkspace } from "../../../../implementation/controller/NavigationController";
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
    onClick: () => navigateToWorkspace(context.workloadClientAPI, workspaceId),
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
      navigateToWorkspace(context.workloadClientAPI, workspaceId);
    },
    title: `Click to open workspace ${workspaceId}`
  }, workspaceName);
}

