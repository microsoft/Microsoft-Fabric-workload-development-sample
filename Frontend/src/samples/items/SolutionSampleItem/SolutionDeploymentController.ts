import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { Solution, SolutionConfiguration, SparkDeployConfig, SparkDeployConfigItem, SparkDeployConfigItemDefinition, SolutionDeploymentStatus, SolutionDeploymentType, ItemDefinitionPayloadType, SparkDeployConfigItemDefinitionType } from "./SolutionSampleItemModel";
import { GenericItem } from "../../../workload/models/ItemCRUDModel";
import { getOneLakeFilePath, writeToOneLakeFileAsText } from "../../controller/OneLakeController";
import { BatchRequest } from "../../models/SparkLivyModel";
import { createBatch } from "../../controller/SparkLivyController";
import { EnvironmentConstants } from "../../../constants";
import { callCreateItem, callUpdateItemDefinition } from "../../../workload/controller/ItemCRUDController";


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
    console.log(`Deploying solution UX for item: ${item.id} with type: ${solutionConfig.typeId}`);
    
    // Check if items are defined in the solution configuration
    if (!solutionConfig.items || solutionConfig.items.length === 0) {
      console.log("No items defined in solution configuration");
      solution.deploymentStatus = SolutionDeploymentStatus.Succeeded;
      return solution;
    }

    // Initialize array to store created items
    const createdItems: GenericItem[] = [];
    
    try {
      // Get target workspace ID, default to the current item's workspace if not specified
      const targetWorkspaceId = solution.workspaceId ? solution.workspaceId : item.workspaceId;
      
      // Create each item defined in the solution configuration
      for (const itemDef of solutionConfig.items) {
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
              case ItemDefinitionPayloadType.Asset:
                // Fetch content from the asset and encode as base64
                const assetContent = await getAssetContent(defPart.payload);
                payloadData = btoa(assetContent); // Convert to base64 string
                break;
              case ItemDefinitionPayloadType.Link:
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
              case ItemDefinitionPayloadType.InlineBase64:
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
      
      // Create a copy of the solution with updated status and created items
      const updatedSolution: Solution = {
        ...solution,
        itemsCreated: createdItems,
        deploymentStatus: SolutionDeploymentStatus.Succeeded
      };
      
      return updatedSolution;
      
    } catch (error) {
      console.error(`Error in UX deployment: ${error}`);
      
      // Return a copy of the solution with failed status
      const failedSolution: Solution = {
        ...solution,
        deploymentStatus: SolutionDeploymentStatus.Failed
      };
      
      return failedSolution;
    }
}


async function deploySolutionSparkLivy(
  workloadClient: WorkloadClientAPI,
  item: GenericItem,
  solutionConfig: SolutionConfiguration,
  solution: Solution,
  lakehouseId: string): Promise<Solution> {
    console.log(`Deploying solution Spark Livy for item: ${item.id} with type: ${solutionConfig.typeId}`);
    const sparkDeploymentConf = await copySolutionContentToItem(workloadClient, item, solutionConfig, solution);
    const retVal = await startDeploymentJob(workloadClient, item, solution, sparkDeploymentConf, lakehouseId);
    return retVal;
}


function getContentSubPath(typeName: string, path: string): string {
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
  solutionType: string,
  path: string): Promise<string> {
    const assetContent = await getAssetContent(path);
    const destinationSubPath = `Solutions/${getContentSubPath(solutionType, path)}`;
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
 
    console.log(`Copying solution content for item: ${item.id} with type: ${solutionConfig.typeId}`);
    const sparkDeploymentConf: SparkDeployConfig = {
      targetWorkspaceId: solution.workspaceId ? solution.workspaceId : item.workspaceId,
      targetSubfolderId: solution.subfolderId,
      solutionId: solution.id,
      items: [],
      deploymentScript: ""
    }

    //copying all the solution item definitions to the a onelake folder in the item
    solution.itemsCreated = [];
    solution.deploymentStatus = SolutionDeploymentStatus.InProgress;
    
    // Use Promise.all to wait for all async operations to complete
    const itemPromises = solutionConfig.items.map(async (configItem) => {
      const itemConfig: SparkDeployConfigItem = {
          name: configItem.name,
          description: configItem.description,
          itemType: configItem.itemType,
          definitionParts: []
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
                  solutionConfig.typeId,
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
                  solutionConfig.typeId,
                  solutionConfig.deploymentFile
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
  solution: Solution,
  sparkDeploymentConf: SparkDeployConfig,
  lakehouseId: string) : Promise<Solution>{

    if(lakehouseId === undefined || lakehouseId === null || lakehouseId === "") {
        throw new Error("Lakehouse ID is not defined for the solution deployment.");
    }
  
     // Construct batch request with proper parameters
    const batchRequest: BatchRequest = {
        name: `${item.displayName} - Deployment - ${solution.typeId} - ${solution.id}`,
        file: sparkDeploymentConf.deploymentScript,
        args: [],
        conf: {          
        "spark.itemId": item.id,
        "spark.itemWorkspaceId": item.workspaceId,
        "spark.solutionType": solution.typeId,
        "spark.deploymentConfiguration": JSON.stringify(sparkDeploymentConf),
        //TODO: add the deployment configuration
        // Using the default environment with added librar textblob
        //"spark.fabric.environmentDetails" : "{\"id\" : \"<ID>\"}"
        },
        tags: {
            source: "Solution Deployment",
            analysisType: solution.typeId
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
        deploymentJobId: batchResponse.id,
        deploymentStatus: SolutionDeploymentStatus.InProgress,
    };

    return retVal;

  }