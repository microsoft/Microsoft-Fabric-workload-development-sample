import {  WorkloadClientAPI } from "@ms-fabric/workload-client";
import { Solution, SolutionConfiguration, SparkDeployConfig, SparkDeployConfigItem, SparkDeployConfigItemDefinition, SolutionDeploymentStatus, SolutionType, SolutionDeploymentType, ItemDefinitionPayloadType, SparkDeployConfigItemDefinitionType } from "./SolutionSampleItemModel";
import { GenericItem } from "src/workload/models/ItemCRUDModel";
import { getOneLakeFilePath, writeToOneLakeFileAsText } from "../../controller/OneLakeController";
import { BatchRequest } from "../../models/SparkLivyModel";
import { createBatch } from "../../controller/SparkLivyController";
import { EnvironmentConstants } from "../../../constants";


export async function deploySolution(
  workloadClient: WorkloadClientAPI,
  item: GenericItem,
  solutionConfig: SolutionConfiguration,
  solution: Solution,
  lakehouseId: string): Promise<Solution> {
    switch (solutionConfig.deploymentType) {
        case SolutionDeploymentType.UX:
            // For UX deployment, we just copy the solution content to the item
            return await deploySolutionUX(workloadClient, item, solutionConfig, solution);
        case SolutionDeploymentType.SparkLivy:
            // For Spark Livy deployment, we need to start a batch job
            return await deploySolutionSparkLivy(workloadClient, item, solutionConfig, solution, lakehouseId);
        default:
            throw new Error(`Unsupported deployment type: ${solutionConfig.deploymentType}`);
    }
}

async function deploySolutionUX(
  workloadClient: WorkloadClientAPI,
  item: GenericItem,
  solutionConfig: SolutionConfiguration,
  solution: Solution): Promise<Solution> {
    console.log(`Deploying solution UX for item: ${item.id} with type: ${solutionConfig.type}`);
    //TODO: Implement the UX deployment logic
    throw new Error("UX deployment is not implemented yet.");
}


async function deploySolutionSparkLivy(
  workloadClient: WorkloadClientAPI,
  item: GenericItem,
  solutionConfig: SolutionConfiguration,
  solution: Solution,
  lakehouseId: string): Promise<Solution> {
    console.log(`Deploying solution Spark Livy for item: ${item.id} with type: ${solutionConfig.type}`);
    const sparkDeploymentConf = await copySolutionContentToItem(workloadClient, item, solutionConfig, solution);
    const retVal = await startDeploymentJob(workloadClient, item, solution, sparkDeploymentConf, lakehouseId);
    return retVal;
}


function getContentSubPath(soltuionType: SolutionType, path: string): string {
  const typeName = SolutionType[soltuionType];
  const fileReference = path.substring(path.lastIndexOf("/") + 1)
  const contentSubPath = `${typeName}/${fileReference}`
  return contentSubPath;
}

function convertOneLakeLinktoABFSSLink(oneLakeLink: string, workspaceId: string): string {
  // Convert OneLake link to ABFSS link format
  var retVal = oneLakeLink.replace(`${workspaceId}/`, "")
  retVal = retVal.replace("https://", `abfss://${workspaceId}@`);
  return retVal;
} 

async function getSolutionContent(soltuionType: SolutionType, path: string): Promise<string> {
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
  type: SolutionType,
  path: string): Promise<string> {
    const assetContent = await getSolutionContent(type, path);
    const destinationSubPath = `Solutions/${getContentSubPath(type, path)}`;
    const destionationPath = getOneLakeFilePath(item.workspaceId, item.id, destinationSubPath);
    await writeToOneLakeFileAsText(workloadClient, destionationPath, assetContent);
    const fullPath = EnvironmentConstants.OneLakeDFSBaseUrl + "/"+ destionationPath;
    return fullPath
}


async function copySolutionContentToItem(
  workloadClient: WorkloadClientAPI,
  item: GenericItem,
  solutionConfig: SolutionConfiguration,
  solution: Solution) : Promise<SparkDeployConfig>{
 
    console.log(`Copying solution content for item: ${item.id} with type: ${solutionConfig.type}`);
    const sparkDeploymentConf: SparkDeployConfig = {
      targetWorkspaceId: solution.workspaceId ? solution.workspaceId : item.workspaceId,
      targetSubfolderId: solution.subfolderId,
      soltuionId: solution.id,
      items: [],
      deplyomentScript: ""
    }

    //copying all the soltuion item definitions to the a onelake folder in the item
    solution.itemsCreated = [];
    solution.deploymentStatus = SolutionDeploymentStatus.InProgress;
    
    // Use Promise.all to wait for all async operations to complete
    const itemPromises = solutionConfig.items.map(async (configItem) => {
      const itemConfig: SparkDeployConfigItem = {
          name: configItem.name,
          description: configItem.description,
          itemType: configItem.itemType,
          defintionParts: []
      };
      
      // Process all item definitions in parallel and wait for them all to complete
      await Promise.all(configItem.itemDefinitions.map(async (itemDefinitionReference) => {
          const definitionPart: SparkDeployConfigItemDefinition = {
            path: itemDefinitionReference.path,
            payload: undefined,
            payloadType: undefined
          }
          switch (itemDefinitionReference.payloadType) {
            case ItemDefinitionPayloadType.Asset:
            //writing all the metadata files to the item in OneLake
              definitionPart.payload = await copyAssetToOneLake(
                  workloadClient,
                  item,
                  solutionConfig.type,
                  itemDefinitionReference.payload
              );
              //var itemAbfssReference = convertOneLakeLinktoABFSSLink(definitionDestPath, item.workspaceId);
              definitionPart.payloadType = SparkDeployConfigItemDefinitionType.OneLake;
              break;
            case ItemDefinitionPayloadType.Link:
              // If the reference is a link, we just use the fileReference as the path
              definitionPart.payload = itemDefinitionReference.payload;
              definitionPart.payloadType = SparkDeployConfigItemDefinitionType.Link;
              break;
            case ItemDefinitionPayloadType.InlineBase64:
              definitionPart.payload = itemDefinitionReference.payload;
              definitionPart.payloadType = SparkDeployConfigItemDefinitionType.InlineBase64;
              break;
            default:
              throw new Error(`Unsupported item definition reference type: ${itemDefinitionReference.payloadType}`);  
          }
          itemConfig.defintionParts.push(definitionPart);
          console.log(`Successfully uploaded defintion in OneLake: ${definitionPart.path}`);
      }));
      return itemConfig;
    });
    
    // Wait for all items to be processed and add them to the config
    sparkDeploymentConf.items = await Promise.all(itemPromises);

    //copying the deployment file to the item in OneLake
    const deploymentFileDestPath = await copyAssetToOneLake(
                  workloadClient,
                  item,
                  solutionConfig.type,
                  solutionConfig.deploymentFile
              );
    console.log(`Successfully uploaded deployment script to OneLake: ${deploymentFileDestPath}`);
    // Create the OneLake file path URL for the batch job
    const oneLakeScriptDeploymentUrl = convertOneLakeLinktoABFSSLink(deploymentFileDestPath, item.workspaceId);
    console.log("Deplyoment script URL:", oneLakeScriptDeploymentUrl);

    const retVal = {
      ...sparkDeploymentConf,
      deplyomentScript: oneLakeScriptDeploymentUrl
    }

    return retVal
  }


export async function startDeploymentJob(
  workloadClient: WorkloadClientAPI,
  item: GenericItem,
  solution: Solution,
  sparkDeploymentConf: SparkDeployConfig,
  lakehouseId: string) : Promise<Solution>{

    if(lakehouseId === undefined || lakehouseId === null || lakehouseId === "") {
        throw new Error("Lakehouse ID is not defined for the solution deployment.");
    }
    const solutionType = SolutionType[solution.type];
     // Construct batch request with proper parameters
    const batchRequest: BatchRequest = {
        name: `${item.displayName} - Deployment - ${solution.type} - ${solution.id}`,
        file: sparkDeploymentConf.deplyomentScript,
        args: [],
        conf: {          
        "spark.itemId": item.id,
        "spark.itemWorkspaceId": item.workspaceId,
        "spark.soltuionType": solutionType,
        "spark.deploymentConfiguration": JSON.stringify(sparkDeploymentConf),
        //TODO: add the deplyoment configuration
        // Using the default environment with added librar textblob
        //"spark.fabric.environmentDetails" : "{\"id\" : \"<ID>\"}"
        },
        tags: {
            source: "Solution Deployment",
            analysisType: solutionType
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
        ...solution,
        deplyomentJobId: batchResponse.id,
        deploymentStatus: SolutionDeploymentStatus.InProgress,
    };

    return retVal;

  }