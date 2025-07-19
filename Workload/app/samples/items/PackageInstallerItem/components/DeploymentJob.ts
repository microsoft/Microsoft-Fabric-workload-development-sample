import React, { useEffect, useState } from "react";
import { Body1, Text } from "@fluentui/react-components";
import { PackageInstallerContext } from "../package/PackageInstallerContext";
import { DeploymentJobInfo } from "../PackageInstallerItemModel";

// Component to fetch and display deployment job information
export function DeploymentJobLabel({
  context, 
  jobInfo
}: { 
  jobInfo?: DeploymentJobInfo, 
  context: PackageInstallerContext 
}) {
  const [displayInfo, setDisplayInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchJobInfo() {
      if (!jobInfo?.id || !jobInfo?.item?.workspaceId || !jobInfo?.item?.id) {
        setDisplayInfo("N/A");
        setIsLoading(false);
        return;
      }

      try {
        const job = await context.fabricPlatformAPIClient.scheduler.getItemJobInstance(
          jobInfo.item.workspaceId, 
          jobInfo.item.id, 
          jobInfo.id
        );
        
        // Format job information
        const displayText = `${job.jobType || "Job"} - ${job.status || "Unknown"}`;
        setDisplayInfo(displayText);
      } catch (error) {
        console.warn(`Failed to fetch job info for ${jobInfo.id}:`, error);
        setDisplayInfo(jobInfo.id || "Unknown"); // Fallback to job ID if fetch fails
      } finally {
        setIsLoading(false);
      }
    }

    fetchJobInfo();
  }, [jobInfo, context.fabricPlatformAPIClient]);

  if (isLoading) {
    return React.createElement(Body1, null, "Loading...");
  }

  return React.createElement(Body1, {
    title: `Job ID: ${jobInfo?.id || "N/A"}`
  }, displayInfo);
}

export function DeploymentJobCell({
  context, 
  jobInfo
}: { 
  jobInfo?: DeploymentJobInfo, 
  context: PackageInstallerContext 
}) {
  const [displayInfo, setDisplayInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchJobInfo() {
      if (!jobInfo?.id || !jobInfo?.item?.workspaceId || !jobInfo?.item?.id) {
        setDisplayInfo("N/A");
        setIsLoading(false);
        return;
      }

      try {
        const job = await context.fabricPlatformAPIClient.scheduler.getItemJobInstance(
          jobInfo.item.workspaceId, 
          jobInfo.item.id, 
          jobInfo.id
        );
        
        // Format job information for cell display (more compact)
        const displayText = `${job.status || "Unknown"}`;
        setDisplayInfo(displayText);
      } catch (error) {
        console.warn(`Failed to fetch job info for ${jobInfo.id}:`, error);
        setDisplayInfo(jobInfo.id || "Unknown"); // Fallback to job ID if fetch fails
      } finally {
        setIsLoading(false);
      }
    }

    fetchJobInfo();
  }, [jobInfo, context.fabricPlatformAPIClient]);

  if (isLoading) {
    return React.createElement(Text, null, "Loading...");
  }

  return React.createElement(Text, {
    title: `Job ID: ${jobInfo?.id || "N/A"}`
  }, displayInfo);
}

// Enhanced version with status indicator
export function DeploymentJobLabelWithStatus({
  context, 
  jobInfo,
  showStatusColor = false
}: { 
  jobInfo?: DeploymentJobInfo, 
  context: PackageInstallerContext,
  showStatusColor?: boolean
}) {
  const [displayInfo, setDisplayInfo] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchJobInfo() {
      if (!jobInfo?.id || !jobInfo?.item?.workspaceId || !jobInfo?.item?.id) {
        setDisplayInfo("N/A");
        setJobStatus(null);
        setIsLoading(false);
        return;
      }

      try {
        const job = await context.fabricPlatformAPIClient.scheduler.getItemJobInstance(
          jobInfo.item.workspaceId, 
          jobInfo.item.id, 
          jobInfo.id
        );
        
        setDisplayInfo(`${job.jobType || "Job"} - ${job.status || "Unknown"}`);
        setJobStatus(job.status || "Unknown");
      } catch (error) {
        console.warn(`Failed to fetch job info for ${jobInfo.id}:`, error);
        setDisplayInfo(jobInfo.id || "Unknown");
        setJobStatus(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchJobInfo();
  }, [jobInfo, context.fabricPlatformAPIClient]);

  if (isLoading) {
    return React.createElement(Body1, null, "Loading...");
  }

  // Get status color
  const getStatusColor = (status: string | null) => {
    if (!showStatusColor || !status) return undefined;
    
    switch (status.toLowerCase()) {
      case "completed":
      case "succeeded":
        return "#107C10"; // Green
      case "failed":
      case "error":
        return "#D13438"; // Red
      case "running":
      case "inprogress":
        return "#0078D4"; // Blue
      case "pending":
      case "queued":
        return "#F7630C"; // Orange
      default:
        return "#605E5C"; // Gray
    }
  };

  return React.createElement(Body1, {
    title: `Job ID: ${jobInfo?.id || "N/A"}`,
    style: showStatusColor ? { color: getStatusColor(jobStatus) } : undefined
  }, displayInfo);
}
