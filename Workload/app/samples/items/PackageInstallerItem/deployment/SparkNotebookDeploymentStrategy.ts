import { DeploymentStrategy } from "./DeploymentStrategy";
import { DeployedItem, PackageDeployment, DeploymentStatus, PackageItem } from "../PackageInstallerItemModel";

// Spark Notebook Deployment Strategy
export class SparkNotebookDeploymentStrategy extends DeploymentStrategy {


  async deploy(): Promise<PackageDeployment> {
    console.log(`Deploying package via Spark Notebook for item: ${this.item.id}. Deployment: ${this.deployment.id} with type: ${this.pack.id}`);
    
    if (!this.pack.deploymentConfig.deploymentFile) {
      throw new Error("No deployment file specified in package for Spark Notebook deployment.");
    }

    const createdItems: DeployedItem[] = [];
    
    try {
      // Create workspace and folder if needed
      await this.createWorkspaceAndFolder();
      
      const depConfig = this.pack.deploymentConfig;
      const fabricAPI = this.context.fabricPlatformAPIClient;
      const targetWorkspaceId = this.deployment.workspace.id;
      
      const nbItemDef:PackageItem = {
          displayName: `Deploy_${this.pack.id}`,
          type: "Notebook", // Spark Notebook item type
          description: this.pack.description || 'Deployment Notebook',
          definition: {
            format: "ipynb",
            parts: [
              {
                path: "notebook-content.ipynb",
                payload: depConfig.deploymentFile.payload,
                payloadType: depConfig.deploymentFile.payloadType
              }
            ]
          }
      }
      const notebookItem = await this.createItemUX(nbItemDef, targetWorkspaceId, 
        this.deployment.workspace?.folder?.id || undefined, undefined);
      console.log(`Successfully updated notebook definition for: ${notebookItem.id}`);
      
      createdItems.push({
         ...notebookItem,
          itemDefenitionName: "<Spark Notebook Deployment file>"
        });
      
      // Start a RunNotebook job on the created notebook
      console.log(`Starting RunNotebook job for notebook: ${notebookItem.id}`);
      const jobInstanceId = await fabricAPI.scheduler.runOnDemandItemJob(
        targetWorkspaceId,
        notebookItem.id,
        "RunNotebook",
        {
          executionData: {
            parameters: {
              deploymentId: this.deployment.id,
            },
            configuration: {
            //TODO: Run notebook payload is not well formatted.
            //  "conf": {
            //      "spark.conf1": "value"
            //  },
            //  "environment": {
            //      "id": "<environment_id>",
            //      "name": "<environment_name>"
            //  },
            //  "defaultLakehouse": {
            //      "name": "<lakehouse-name>",
            //      "id": "<lakehouse-id>",
            //      "workspaceId": "<(optional) workspace-id-that-contains-the-lakehouse>"
            //  },
            //  "useStarterPool": false,
            //  "useWorkspacePool": "<workspace-pool-name>"
            }
          }
        }
      );
      console.log(`Successfully started RunNotebook job for notebook: ${notebookItem.id}, Job ID: ${jobInstanceId}`);
      
      const jobId = jobInstanceId.substring(jobInstanceId.lastIndexOf("/") + 1); // Extract just the job ID
      return {
        ...this.deployment,
        job: {
          id: jobId,
          item: {
            ...notebookItem
          }
        },
        deployedItems: createdItems,
        status: DeploymentStatus.InProgress
      };
      
    } catch (error) {
      console.error(`Error in Spark Notebook deployment: ${error}`);
      return { 
        ...this.deployment, 
        status: DeploymentStatus.Failed 
      };
    }
  }

  async updateDeploymentStatus(): Promise<PackageDeployment> {
    // Check status of the job
    const fabricAPI = this.context.fabricPlatformAPIClient;
    const depJob = this.deployment.job;

    const job = await fabricAPI.scheduler.getItemJobInstance(depJob.item.workspaceId, 
                                                            depJob.item.id,
                                                            depJob.id);
    
    // Map the job status to deployment status
    const deploymentStatus = this.mapJobStatusToDeploymentStatus(job.status);
    
    // Create updated job info with converted dates
    const updatedJob = {
      ...depJob,
      startTime: job.startTimeUtc ? new Date(job.startTimeUtc) : undefined,
      endTime: job.endTimeUtc ? new Date(job.endTimeUtc) : undefined,
      ...(job.failureReason && { failureReason: job.failureReason })
    };

    return {
      ...this.deployment,
      status: deploymentStatus,
      job: updatedJob
    };
  }

  /**
   * Maps job status from the API to deployment status
   * @param jobStatus The job status from the API
   * @returns The corresponding deployment status
   */
  private mapJobStatusToDeploymentStatus(jobStatus: string): DeploymentStatus {
    switch (jobStatus) {
      case "Completed":
        return DeploymentStatus.Succeeded;
      case "Failed":
        return DeploymentStatus.Failed;
      case "Cancelled":
        return DeploymentStatus.Cancelled;
      default:
        console.log(`Job status ${jobStatus} is still in progress or pending.`);
        return DeploymentStatus.InProgress;
    }
  }

}
