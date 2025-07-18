import { DeploymentStrategy } from "./DeploymentStrategy";
import { DeployedItem, Deployment, DeploymentStatus, PackageItemDefinitionPayloadType } from "../PackageInstallerItemModel";
import { FabricPlatformAPIClient } from "../../../controller/FabricPlatformAPIClient";

// Spark Notebook Deployment Strategy
export class SparkNotebookDeploymentStrategy extends DeploymentStrategy {


  async deploy(): Promise<Deployment> {
    console.log(`Deploying package via Spark Notebook for item: ${this.item.id}. Deployment: ${this.deployment.id} with type: ${this.pack.typeId}`);
    
    if (!this.pack.deploymentFile) {
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
      const displayName = this.pack.suffixItemNames ? 
        `${this.pack.name || 'SparkNotebook'}_${this.deployment.id}` : 
        (this.pack.name || 'SparkNotebook');
      
      const notebookItem = await fabricAPI.items.createItem(
        targetWorkspaceId,
        {
          displayName: displayName,
          type: "Notebook", // Spark Notebook item type
          description: this.pack.description || 'Deployed Spark Notebook',
          definition: {
            parts: [{
              path: "notebook-content.ipynb",
              payload: notebookContent,
              payloadType: "InlineBase64"
            }]
          },
          folderId: this.deployment.workspace?.folder?.id || undefined
        }
      );
      
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
            deploymentId: this.deployment.id,
            packageId: this.deployment.packageId,
            packageName: this.pack.name,
            deployedBy: 'PackageInstaller'
          }
        }
      );
      console.log(`Successfully started RunNotebook job for notebook: ${notebookItem.id}, Job ID: ${jobInstanceId}`);
      
      return {
        ...this.deployment,
        jobId: jobInstanceId,
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

  async updateDeploymentStatus(): Promise<Deployment> {
    // Check status of the job
    const fabricAPI = FabricPlatformAPIClient.create(this.workloadClient);
    const jobInstanceId = this.deployment.jobId;
    const jobId = jobInstanceId.substring(jobInstanceId.lastIndexOf("/") + 1); // Extract just the job ID
    const itemId = jobInstanceId.substring(jobInstanceId.lastIndexOf("items/") + 1, 
          jobInstanceId.lastIndexOf("/jobs")); // Extract just the item ID
    const job = await fabricAPI.scheduler.getItemJobInstance(this.deployment.workspace.id, itemId, jobId);
    
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

  private async getDeploymentFileContent(): Promise<string> {
    if (!this.pack.deploymentFile) {
      throw new Error("No deployment file specified");
    }

    let content: string;
    
    switch (this.pack.deploymentFile.payloadType) {
      case PackageItemDefinitionPayloadType.Asset:
        // Fetch content from asset and encode as base64
        content = await this.getAssetContent(this.pack.deploymentFile.payload);
        return btoa(content);
        
      case PackageItemDefinitionPayloadType.Link:
        // Download content from HTTP link and encode as base64
        try {
          const response = await fetch(this.pack.deploymentFile.payload);
          if (!response.ok) {
            throw new Error(`Failed to fetch deployment file from link: ${response.status} ${response.statusText}`);
          }
          content = await response.text();
          return btoa(content);
        } catch (error) {
          console.error(`Error fetching deployment file from link ${this.pack.deploymentFile.payload}:`, error);
          throw new Error(`Failed to process deployment file link: ${error.message}`);
        }
        
      case PackageItemDefinitionPayloadType.InlineBase64:
        // Use base64 payload directly
        return this.pack.deploymentFile.payload;
        
      default:
        throw new Error(`Unsupported deployment file payload type: ${this.pack.deploymentFile.payloadType}`);
    }
  }
}
