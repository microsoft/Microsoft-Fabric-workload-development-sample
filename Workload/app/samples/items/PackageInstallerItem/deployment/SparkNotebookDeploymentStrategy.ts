import { DeploymentStrategy } from "./DeploymentStrategy";
import { DeployedItem, PackageDeployment, DeploymentStatus, PackageItemDefinitionPayloadType } from "../PackageInstallerItemModel";
import { FabricPlatformAPIClient } from "../../../controller/FabricPlatformAPIClient";

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
      
      const fabricAPI = FabricPlatformAPIClient.create(this.workloadClient);
      const targetWorkspaceId = this.deployment.workspace.id;
      
      // Get the deployment file content
      const notebookContent = await this.getDeploymentFileContent();
      
      // Create the Spark Notebook
      const displayName = `Deploy_${this.pack.id}`;
      
      const notebookItem = await fabricAPI.items.createItem(
        targetWorkspaceId,
        {
          displayName: displayName,
          type: "Notebook", // Spark Notebook item type
          description: this.pack.description || 'Deployment Notebook',
          folderId: this.deployment.workspace?.folder?.id || undefined,
          definition: {
              format: "ipynb",
              parts: [{
                path: "notebook-content.ipynb",
                payload: notebookContent,
                payloadType: "InlineBase64"
              }]
            },
        
        }
      );
      if(!notebookItem) {
        throw new Error("Failed to create Spark Notebook item.");
      }
      console.log(`Successfully created Spark Notebook: ${notebookItem.id}`);
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
              spark: {
                "useStarterPool": true
              }
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
    const fabricAPI = FabricPlatformAPIClient.create(this.workloadClient);
    const depJob = this.deployment.job;

    const job = await fabricAPI.scheduler.getItemJobInstance(depJob.item.workspaceId, 
                                                            depJob.item.id,
                                                            depJob.id);
    
    //map the job status to deployment status
    switch (job.status) {
      case "Completed": 
        return {          
          ...this.deployment,
          status: DeploymentStatus.Succeeded
        };  
      case "Failed":
        return { 
          ...this.deployment,
          status: DeploymentStatus.Failed
        };
      case "Cancelled":
        return {
          ...this.deployment,
          status: DeploymentStatus.Cancelled
        };  
      default:
        // If job is still running or pending, return InProgress
        console.log(`Job ${job.id} is still in progress or pending.`);
        return {
            ...this.deployment, 
            status: DeploymentStatus.InProgress
          };
    }
  }

  /** 
   * Retrieves the content of the deployment file based on its payload type
   * @returns Promise<string> Base64 encoded content of the deployment file
   */
  private async getDeploymentFileContent(): Promise<string> {

    const deplyomentConfig = this.pack.deploymentConfig;
    if (!deplyomentConfig.deploymentFile) {
      throw new Error("No deployment file specified");
    }

    let content: string;
    

    switch (deplyomentConfig.deploymentFile.payloadType) {
      case PackageItemDefinitionPayloadType.Asset:
        // Fetch content from asset and encode as base64
        content = await this.getAssetContent(deplyomentConfig.deploymentFile.payload);
        return btoa(content);
        
      case PackageItemDefinitionPayloadType.Link:
        // Download content from HTTP link and encode as base64
        try {
          const url = deplyomentConfig.deploymentFile.payload;
          console.log(`Fetching deployment file from URL: ${url}`);
          
          // Validate that the URL is absolute
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            throw new Error(`Invalid URL format. Expected absolute URL starting with http:// or https://, got: ${url}`);
          }
          
          // Create a proper URL object to ensure it's valid
          const validatedUrl = new URL(url);
          console.log(`Validated URL: ${validatedUrl.toString()}`);
          
          const response = await fetch(validatedUrl.toString());
          if (!response.ok) {
            throw new Error(`Failed to fetch deployment file from link: ${response.status} ${response.statusText}`);
          }
          content = await response.text();
          return btoa(content);
        } catch (error) {
          console.error(`Error fetching deployment file from link ${deplyomentConfig.deploymentFile.payload}:`, error);
          throw new Error(`Failed to process deployment file link: ${error.message}`);
        }
        
      case PackageItemDefinitionPayloadType.InlineBase64:
        // Use base64 payload directly
        return deplyomentConfig.deploymentFile.payload;
        
      default:
        throw new Error(`Unsupported deployment file payload type: ${deplyomentConfig.deploymentFile.payloadType}`);
    }
  }
}
