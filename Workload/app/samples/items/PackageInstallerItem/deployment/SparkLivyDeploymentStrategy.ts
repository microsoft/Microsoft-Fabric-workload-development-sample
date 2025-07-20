import { DeploymentStrategy } from "./DeploymentStrategy";
import { PackageDeployment, DeploymentStatus, PackageItemDefinitionPayloadType } from "../PackageInstallerItemModel";
import { SparkDeployment, SparkDeploymentItem, SparkDeploymentItemDefinition, SparkDeploymentReferenceType } from "./DeploymentModel";
import { getOneLakeFilePath, writeToOneLakeFileAsText } from "../../../controller/OneLakeController";
import { BatchRequest, BatchState } from "../../../models/SparkLivyModel";
import { EnvironmentConstants } from "../../../../constants";

const defaultDeploymentSparkFile = "/assets/samples/items/PackageInstallerItem/jobs/DefaultPackageInstaller.py";

// Spark Livy Deployment Strategy
export class SparkLivyDeploymentStrategy extends DeploymentStrategy {
  async deploy(): Promise<PackageDeployment> {
    console.log(`Deploying package via Spark Livy for item: ${this.item.id}. Deployment: ${this.deployment.id} with type: ${this.pack.id}`);
    
    const sparkDeployment = await this.copyPackageContentToItem();
    const lakehouseId = this.item.definition.lakehouseId;
    if (!lakehouseId) {
      throw new Error("Lakehouse ID is not defined for the package deployment.");
    }
  
    const batchRequest: BatchRequest = {
      name: `${this.item.displayName} - Deployment - ${this.deployment.packageId} - ${this.deployment.id}`,
      file: sparkDeployment.deploymentScript,
      args: [],
      conf: {          
        "spark.itemId": this.item.id,
        "spark.itemWorkspaceId": this.item.workspaceId,
        "spark.packageType": this.deployment.packageId,
        "spark.deployment": JSON.stringify(sparkDeployment),
      },
      tags: {
        source: "Solution Deployment",
        analysisType: this.deployment.packageId
      }
    };
    
    console.log("Starting the analysis with batch request:", batchRequest);
    
    const fabricAPI = this.context.fabricPlatformAPIClient;
    const batchResponse = await fabricAPI.sparkLivy.createBatch(
      this.item.workspaceId,
      lakehouseId,
      batchRequest
    );

    // Map BatchState to DeploymentStatus
    const deploymentStatus = this.mapBatchStateToDeploymentStatus(batchResponse.state);
    
    return {
      ...this.deployment,
      job: {
        id: batchResponse.id,
        item: {
          id: lakehouseId, 
          workspaceId: this.item.workspaceId,
        }
      },
      status: deploymentStatus,
    };
  }

  async updateDeploymentStatus(): Promise<PackageDeployment> {
    if (!this.deployment.job || !this.deployment.job.id) {
      throw new Error("No job ID found for deployment status update");
    }

    const fabricAPI = this.context.fabricPlatformAPIClient;
    const batch = await fabricAPI.sparkLivy.getBatch(
      this.deployment.workspace.id, 
      this.item.definition.lakehouseId,
      this.deployment.job.id
    );

    // Map BatchState to DeploymentStatus
    const deploymentStatus = this.mapBatchStateToDeploymentStatus(batch.state);
    
    // Create updated job info with converted dates from livyInfo
    const updatedJob = {
      ...this.deployment.job,
      startTime: batch.livyInfo?.startedAt ? new Date(batch.livyInfo.startedAt) : undefined,
      endTime: batch.livyInfo?.endedAt ? new Date(batch.livyInfo.endedAt) : undefined,
    };

    return {
      ...this.deployment,
      status: deploymentStatus,
      job: updatedJob
    };
  }

  private async copyPackageContentToItem(): Promise<SparkDeployment> {
    console.log(`Copying package content for item: ${this.item.id} and package type: ${this.pack.id}`);
    
    const sparkDeploymentConf: SparkDeployment = {
      workspace: this.deployment.workspace,
      deploymentId: this.deployment.id,
      items: [],
      deploymentScript: ""
    };

    // Process all items
    const itemPromises = this.pack.items.map(async (configItem) => {
      const itemConfig: SparkDeploymentItem = {
        name: configItem.displayName,
        description: configItem.description,
        itemType: configItem.type,
        definitionParts: []
      };
      
      await Promise.all(configItem.definition.parts.map(async (itemDefinitionReference) => {
        const definitionPart: SparkDeploymentItemDefinition = {
          path: itemDefinitionReference.path,
          payload: undefined,
          payloadType: undefined
        };
        
        switch (itemDefinitionReference.payloadType) {
          case PackageItemDefinitionPayloadType.Asset:
            definitionPart.payload = await this.copyAssetToOneLake(itemDefinitionReference.payload);
            definitionPart.payloadType = SparkDeploymentReferenceType.OneLake;
            break;
          case PackageItemDefinitionPayloadType.Link:
            definitionPart.payload = itemDefinitionReference.payload;
            definitionPart.payloadType = SparkDeploymentReferenceType.Link;
            break;
          case PackageItemDefinitionPayloadType.InlineBase64:
            definitionPart.payload = itemDefinitionReference.payload;
            definitionPart.payloadType = SparkDeploymentReferenceType.InlineBase64;
            break;
          default:
            throw new Error(`Unsupported item definition reference type: ${itemDefinitionReference.payloadType}`);  
        }
        
        itemConfig.definitionParts.push(definitionPart);
        console.log(`Successfully uploaded definition in OneLake: ${definitionPart.path}`);
      }));
      
      return itemConfig;
    });
    
    sparkDeploymentConf.items = await Promise.all(itemPromises);

    // Handle deployment file
    const deploymentConfig = this.pack.deploymentConfig;
    let deploymentFileDestPath;
    if (!deploymentConfig.deploymentFile) {
      deploymentFileDestPath = await this.copyAssetToOneLake(defaultDeploymentSparkFile);
    } else if (deploymentConfig.deploymentFile?.payloadType === PackageItemDefinitionPayloadType.Asset) {
      deploymentFileDestPath = await this.copyAssetToOneLake(deploymentConfig.deploymentFile.payload);
    } else if (deploymentConfig.deploymentFile?.payloadType === PackageItemDefinitionPayloadType.Link) {
      deploymentFileDestPath = await this.copyLinkToOneLake(deploymentConfig.deploymentFile.payload);
    }

    console.log(`Successfully uploaded deployment script to OneLake: ${deploymentFileDestPath}`);
    const oneLakeScriptDeploymentUrl = this.convertOneLakeLinktoABFSSLink(deploymentFileDestPath, this.item.workspaceId);
    console.log("Deployment script URL:", oneLakeScriptDeploymentUrl);

    return {
      ...sparkDeploymentConf,
      deploymentScript: oneLakeScriptDeploymentUrl
    };
  }

  private async copyAssetToOneLake(path: string): Promise<string> {
    const assetContent = await this.getAssetContent(path);
    const destinationSubPath = `Packages/${this.getContentSubPath(path)}`;
    const destinationPath = getOneLakeFilePath(this.item.workspaceId, this.item.id, destinationSubPath);
    await writeToOneLakeFileAsText(this.context.workloadClientAPI, destinationPath, assetContent);
    return EnvironmentConstants.OneLakeDFSBaseUrl + "/" + destinationPath;
  }

  private async copyLinkToOneLake(path: string): Promise<string> {
    const response = await fetch(path);
    if (response.ok) {
      const destinationSubPath = `Packages/${this.getContentSubPath(path)}`;
      const destinationPath = getOneLakeFilePath(this.item.workspaceId, this.item.id, destinationSubPath);
      await writeToOneLakeFileAsText(this.context.workloadClientAPI, destinationPath, response.body.toString());
      return EnvironmentConstants.OneLakeDFSBaseUrl + "/" + destinationPath;
    } else {
      console.error('Error fetching content:', path);
      throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
    }
  }

  private getContentSubPath(path: string): string {
    const fileReference = path.substring(path.lastIndexOf("/") + 1);
    return `${this.pack.id}/${fileReference}`;
  }

  private convertOneLakeLinktoABFSSLink(oneLakeLink: string, workspaceId: string): string {
    let retVal = oneLakeLink.replace(`${workspaceId}/`, "");
    retVal = retVal.replace("https://", `abfss://${workspaceId}@`);
    return retVal;
  }

  /**
   * Maps a BatchState to the corresponding DeploymentStatus
   * @param batchState The Spark Livy batch state
   * @returns The corresponding deployment status
   */
  private mapBatchStateToDeploymentStatus(batchState: BatchState): DeploymentStatus {
    switch (batchState) {
      case BatchState.SUCCESS:
        return DeploymentStatus.Succeeded;
      case BatchState.ERROR:
      case BatchState.DEAD:
        return DeploymentStatus.Failed;
      case BatchState.KILLED:
        return DeploymentStatus.Cancelled;
      case BatchState.STARTING:
      case BatchState.RUNNING:
      case BatchState.SUBMITTING:
        return DeploymentStatus.InProgress;
      case BatchState.NOT_STARTED:
      case BatchState.NOT_SUBMITTED:
        return DeploymentStatus.Pending;
      default:
        return DeploymentStatus.InProgress;
    }
  }
}
