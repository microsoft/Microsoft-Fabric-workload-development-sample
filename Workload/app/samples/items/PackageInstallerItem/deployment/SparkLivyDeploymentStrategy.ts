import { DeploymentStrategy } from "./DeploymentStrategy";
import { Deployment, DeploymentStatus, SparkDeployment, SparkDeploymentItem, SparkDeploymentItemDefinition, PackageItemDefinitionPayloadType, SparkDeploymentReferenceType } from "../PackageInstallerItemModel";
import { getOneLakeFilePath, writeToOneLakeFileAsText } from "../../../controller/OneLakeController";
import { BatchRequest, BatchState } from "../../../models/SparkLivyModel";
import { EnvironmentConstants } from "../../../../constants";
import { FabricPlatformAPIClient } from "../../../controller/FabricPlatformAPIClient";

const defaultDeploymentSparkFile = "/assets/samples/items/PackageInstallerItem/jobs/DefaultPackageInstaller.py";

// Spark Livy Deployment Strategy
export class SparkLivyDeploymentStrategy extends DeploymentStrategy {
  async deploy(): Promise<Deployment> {
    console.log(`Deploying package via Spark Livy for item: ${this.item.id}. Deployment: ${this.deployment.id} with type: ${this.pack.typeId}`);
    
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
    
    const fabricAPI = FabricPlatformAPIClient.create(this.workloadClient);
    const batchResponse = await fabricAPI.sparkLivy.createBatch(
      this.item.workspaceId,
      lakehouseId,
      batchRequest
    );

    // Map BatchState to DeploymentStatus
    const deploymentStatus = this.mapBatchStateToDeploymentStatus(batchResponse.state);
    
    return {
      ...this.deployment,
      jobId: batchResponse.id,
      status: deploymentStatus,
    };
  }

  async updateDeploymentStatus(): Promise<Deployment> {
    if (!this.deployment.jobId) {
      throw new Error("No job ID found for deployment status update");
    }

    const fabricAPI = FabricPlatformAPIClient.create(this.workloadClient);
    const batchState = await fabricAPI.sparkLivy.getBatchState(
      this.deployment.workspace.id, 
      this.item.definition.lakehouseId,
      this.deployment.jobId
    );

    // Map BatchState to DeploymentStatus
    const deploymentStatus = this.mapBatchStateToDeploymentStatus(batchState.state);
    return {
      ...this.deployment,
      status: deploymentStatus
    };
  }

  private async copyPackageContentToItem(): Promise<SparkDeployment> {
    console.log(`Copying package content for item: ${this.item.id} and package type: ${this.pack.typeId}`);
    
    const sparkDeploymentConf: SparkDeployment = {
      workspace: this.deployment.workspace,
      deploymentId: this.deployment.id,
      items: [],
      deploymentScript: ""
    };

    // Process all items
    const itemPromises = this.pack.items.map(async (configItem) => {
      const itemConfig: SparkDeploymentItem = {
        name: configItem.name,
        description: configItem.description,
        itemType: configItem.itemType,
        definitionParts: []
      };
      
      await Promise.all(configItem.itemDefinitions.map(async (itemDefinitionReference) => {
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
    let deploymentFileDestPath;
    if (!this.pack.deploymentFile) {
      deploymentFileDestPath = await this.copyAssetToOneLake(defaultDeploymentSparkFile);
    } else if (this.pack.deploymentFile?.payloadType === PackageItemDefinitionPayloadType.Asset) {
      deploymentFileDestPath = await this.copyAssetToOneLake(this.pack.deploymentFile.payload);
    } else if (this.pack.deploymentFile?.payloadType === PackageItemDefinitionPayloadType.Link) {
      deploymentFileDestPath = await this.copyLinkToOneLake(this.pack.deploymentFile.payload);
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
    await writeToOneLakeFileAsText(this.workloadClient, destinationPath, assetContent);
    return EnvironmentConstants.OneLakeDFSBaseUrl + "/" + destinationPath;
  }

  private async copyLinkToOneLake(path: string): Promise<string> {
    const response = await fetch(path);
    if (response.ok) {
      const destinationSubPath = `Packages/${this.getContentSubPath(path)}`;
      const destinationPath = getOneLakeFilePath(this.item.workspaceId, this.item.id, destinationSubPath);
      await writeToOneLakeFileAsText(this.workloadClient, destinationPath, response.body.toString());
      return EnvironmentConstants.OneLakeDFSBaseUrl + "/" + destinationPath;
    } else {
      console.error('Error fetching content:', path);
      throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
    }
  }

  private getContentSubPath(path: string): string {
    const fileReference = path.substring(path.lastIndexOf("/") + 1);
    return `${this.pack.typeId}/${fileReference}`;
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
