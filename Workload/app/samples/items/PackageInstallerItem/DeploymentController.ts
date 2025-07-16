import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { Deployment, Package, SparkDeployment, SparkDeploymentItem, SparkDeploymentItemDefinition, DeploymentStatus, PackageDeploymentType, PackageItemDefinitionPayloadType, SparkDeploymentItemDefinitionType } from "./PackageInstallerItemModel";
import { GenericItem } from "../../../implementation/models/ItemCRUDModel";
import { getOneLakeFilePath, writeToOneLakeFileAsText } from "../../controller/OneLakeController";
import { BatchRequest } from "../../models/SparkLivyModel";
import { createBatch } from "../../controller/SparkLivyController";
import { EnvironmentConstants } from "../../../constants";
import { callCreateItem, callUpdateItemDefinition } from "../../../implementation/controller/ItemCRUDController";


export async function deployPackage(
  workloadClient: WorkloadClientAPI,
  item: GenericItem,
  pack: Package,
  deployment: Deployment,
  lakehouseId: string): Promise<Deployment> {
    switch (pack.deploymentType) {
        case PackageDeploymentType.UX:
            // For UX deployment, we just copy the package content to the item
            return await deployPackageUX(workloadClient, item, pack, deployment);
        case PackageDeploymentType.SparkLivy:
            // For Spark Livy deployment, we need to start a batch job
            return await deployPackageSparkLivy(workloadClient, item, pack, deployment, lakehouseId);
        default:
            throw new Error(`Unsupported deployment type: ${pack.deploymentType}`);
    }
}

async function deployPackageUX(
  workloadClient: WorkloadClientAPI,
  item: GenericItem,
  pack: Package,
  deployment: Deployment): Promise<Deployment> {
    console.log(`Deploying package via UX for item: ${item.id}. Deployment: ${deployment.id} with type: ${pack.typeId}`);
    
    // Check if items are defined in the package
    if (!pack.items || pack.items.length === 0) {
      console.log("No items defined in package");
      deployment.status = DeploymentStatus.Succeeded;
      return deployment;
    }

    // Initialize array to store created items
    const createdItems: GenericItem[] = [];
    
    try {
      // Get target workspace ID, default to the current item's workspace if not specified
      const targetWorkspaceId = deployment.workspaceId ? deployment.workspaceId : item.workspaceId;
      
      // Create each item defined in the package
      for (const itemDef of pack.items) {
        console.log(`Creating item: ${itemDef.name} of type: ${itemDef.itemType}`);
        
        // Create the item using ItemCRUDController
        const newItem = await callCreateItem(
          workloadClient,
          targetWorkspaceId,
          itemDef.itemType,
          itemDef.name,
          itemDef.description || ''
        );
        
        console.log(`Successfully created item: ${newItem.id}`);
        
        // If there are item definitions, add them to the newly created item
        if (itemDef.itemDefinitions && itemDef.itemDefinitions.length > 0) {
          // Process each definition part
          const definitionParts = [];
          
          for (const defPart of itemDef.itemDefinitions) {
            let payloadData;
            
            // Handle different payload types
            switch (defPart.payloadType) {
              case PackageItemDefinitionPayloadType.Asset:
                // Fetch content from the asset and encode as base64
                const assetContent = await getAssetContent(defPart.payload);
                payloadData = btoa(assetContent); // Convert to base64 string
                break;
              case PackageItemDefinitionPayloadType.Link:
                // Download content from the link via HTTP and encode as base64
                try {
                  const response = await fetch(defPart.payload);
                  if (!response.ok) {
                    throw new Error(`Failed to fetch content from link: ${response.status} ${response.statusText}`);
                  }
                  const linkContent = await response.text();
                  payloadData = btoa(linkContent); // Convert to base64 string
                } catch (error) {
                  console.error(`Error fetching content from link ${defPart.payload}:`, error);
                  throw new Error(`Failed to process link: ${error.message}`);
                }
                break;
              case PackageItemDefinitionPayloadType.InlineBase64:
                // Use base64 payload directly
                payloadData = defPart.payload;
                break;
              default:
                throw new Error(`Unsupported payload type: ${defPart.payloadType}`);
            }
            
            definitionParts.push({
              payloadPath: defPart.path,
              payloadData: payloadData,
              payloadType: "InlineBase64"
            });
          }
          
          // Update the item definition with all parts
          if (definitionParts.length > 0) {
            await callUpdateItemDefinition(
              workloadClient,
              newItem.id,
              definitionParts,
              false
            );
            console.log(`Updated item definition for item: ${newItem.id}`);
          }
        }
        
        // Add the created item to our list
        createdItems.push(newItem);
      }
      
      // Create a copy of the deployment with updated status and created items
      const updatedDeployment: Deployment = {
        ...deployment,
        itemsCreated: createdItems,
        status: DeploymentStatus.Succeeded
      };
      
      return updatedDeployment;
      
    } catch (error) {
      console.error(`Error in UX deployment: ${error}`);
      
      // Return a copy of the deployment with failed status
      const failedDeployment: Deployment = {
        ...deployment,
        status: DeploymentStatus.Failed
      };
      
      return failedDeployment;
    }
}


async function deployPackageSparkLivy(
  workloadClient: WorkloadClientAPI,
  item: GenericItem,
  pack: Package,
  deployment: Deployment,
  lakehouseId: string): Promise<Deployment> {
    console.log(`Deploying package via Spark Livy for item: ${item.id}. Deployment: ${deployment.id} with type: ${pack.typeId}`);
    const sparkDeploymentConf = await copyPackageContentToItem(workloadClient, item, pack, deployment);
    const retVal = await startDeploymentJob(workloadClient, item, deployment, sparkDeploymentConf, lakehouseId);
    return retVal;
}


function getContentSubPath(packageType: string, path: string): string {
  const fileReference = path.substring(path.lastIndexOf("/") + 1)
  const contentSubPath = `${packageType}/${fileReference}`
  return contentSubPath;
}

function convertOneLakeLinktoABFSSLink(oneLakeLink: string, workspaceId: string): string {
  // Convert OneLake link to ABFSS link format
  var retVal = oneLakeLink.replace(`${workspaceId}/`, "")
  retVal = retVal.replace("https://", `abfss://${workspaceId}@`);
  return retVal;
} 

async function getAssetContent(path: string): Promise<string> {
  const response = await fetch(path);
  if (!response.ok) {
    console.error('Error fetching content:', path);
    throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
  }
  return await response.text();
}

async function copyAssetToOneLake(
  workloadClient: WorkloadClientAPI,
  item: GenericItem,
  packageType: string,
  path: string): Promise<string> {
    const assetContent = await getAssetContent(path);
    const destinationSubPath = `Packages/${getContentSubPath(packageType, path)}`;
    const destionationPath = getOneLakeFilePath(item.workspaceId, item.id, destinationSubPath);
    await writeToOneLakeFileAsText(workloadClient, destionationPath, assetContent);
    const fullPath = EnvironmentConstants.OneLakeDFSBaseUrl + "/"+ destionationPath;
    return fullPath
}


async function copyPackageContentToItem(
  workloadClient: WorkloadClientAPI,
  item: GenericItem,
  pack: Package,
  deployment: Deployment) : Promise<SparkDeployment>{
 
    console.log(`Copying package content for item: ${item.id} and package type: ${pack.typeId}`);
    const sparkDeploymentConf: SparkDeployment = {
      targetWorkspaceId: deployment.workspaceId ? deployment.workspaceId : item.workspaceId,
      targetFolderId: deployment.folderId,
      deploymentId: deployment.id,
      items: [],
      deploymentScript: ""
    }

    //copying all the package item definitions to the a onelake folder in the item
    deployment.itemsCreated = [];
    deployment.status = DeploymentStatus.InProgress;
    
    // Use Promise.all to wait for all async operations to complete
    const itemPromises = pack.items.map(async (configItem) => {
      const itemConfig: SparkDeploymentItem = {
          name: configItem.name,
          description: configItem.description,
          itemType: configItem.itemType,
          definitionParts: []
      };
      
      // Process all item definitions in parallel and wait for them all to complete
      await Promise.all(configItem.itemDefinitions.map(async (itemDefinitionReference) => {
          const definitionPart: SparkDeploymentItemDefinition = {
            path: itemDefinitionReference.path,
            payload: undefined,
            payloadType: undefined
          }
          switch (itemDefinitionReference.payloadType) {
            case PackageItemDefinitionPayloadType.Asset:
            //writing all the metadata files to the item in OneLake
              definitionPart.payload = await copyAssetToOneLake(
                  workloadClient,
                  item,
                  pack.typeId,
                  itemDefinitionReference.payload
              );
              //var itemAbfssReference = convertOneLakeLinktoABFSSLink(definitionDestPath, item.workspaceId);
              definitionPart.payloadType = SparkDeploymentItemDefinitionType.OneLake;
              break;
            case PackageItemDefinitionPayloadType.Link:
              // If the reference is a link, we just use the fileReference as the path
              definitionPart.payload = itemDefinitionReference.payload;
              definitionPart.payloadType = SparkDeploymentItemDefinitionType.Link;
              break;
            case PackageItemDefinitionPayloadType.InlineBase64:
              definitionPart.payload = itemDefinitionReference.payload;
              definitionPart.payloadType = SparkDeploymentItemDefinitionType.InlineBase64;
              break;
            default:
              throw new Error(`Unsupported item definition reference type: ${itemDefinitionReference.payloadType}`);  
          }
          itemConfig.definitionParts.push(definitionPart);
          console.log(`Successfully uploaded definition in OneLake: ${definitionPart.path}`);
      }));
      return itemConfig;
    });
    
    // Wait for all items to be processed and add them to the config
    sparkDeploymentConf.items = await Promise.all(itemPromises);

    //copying the deployment file to the item in OneLake
    const deploymentFileDestPath = await copyAssetToOneLake(
                  workloadClient,
                  item,
                  pack.typeId,
                  pack.deploymentFile
              );
    console.log(`Successfully uploaded deployment script to OneLake: ${deploymentFileDestPath}`);
    // Create the OneLake file path URL for the batch job
    const oneLakeScriptDeploymentUrl = convertOneLakeLinktoABFSSLink(deploymentFileDestPath, item.workspaceId);
    console.log("Deployment script URL:", oneLakeScriptDeploymentUrl);

    const retVal = {
      ...sparkDeploymentConf,
      deploymentScript: oneLakeScriptDeploymentUrl
    }

    return retVal
  }


export async function startDeploymentJob(
  workloadClient: WorkloadClientAPI,
  item: GenericItem,
  deployment: Deployment,
  sparkDeployment: SparkDeployment,
  lakehouseId: string) : Promise<Deployment>{

    if(lakehouseId === undefined || lakehouseId === null || lakehouseId === "") {
        throw new Error("Lakehouse ID is not defined for the package deployment.");
    }
  
     // Construct batch request with proper parameters
    const batchRequest: BatchRequest = {
        name: `${item.displayName} - Deployment - ${deployment.packageId} - ${deployment.id}`,
        file: sparkDeployment.deploymentScript,
        args: [],
        conf: {          
        "spark.itemId": item.id,
        "spark.itemWorkspaceId": item.workspaceId,
        "spark.packageType": deployment.packageId,
        "spark.deployment": JSON.stringify(sparkDeployment),
        //TODO: add the deployment configuration
        // Using the default environment with added librar textblob
        //"spark.fabric.environmentDetails" : "{\"id\" : \"<ID>\"}"
        },
        tags: {
            source: "Solution Deployment",
            analysisType: deployment.packageId
        }
    };
    
    console.log("Starting the analysis with batch request:", batchRequest);
    
    // Start the batch job session using createBatch
    const batchResponse = await createBatch(
        workloadClient,
        item.workspaceId,
        lakehouseId,
        batchRequest
    );
    
    // Update the configuration with batch information
    const retVal  = {
        ...deployment,
        deploymentJobId: batchResponse.id,
        deploymentStatus: DeploymentStatus.InProgress,
    };

    return retVal;

  }