import { GenericItem } from "../../../workload/models/ItemCRUDModel";


export interface SolutionSampleItemDefinition  {
  solutions?: Solution[];
  lakehouseId?: string; // The lakehouse id that is used for the solution deployment
}

export interface Solution {
  id: string;
  deploymentStatus: SolutionDeploymentStatus;
  typeId: string;
  itemsCreated: GenericItem[];
  workspaceId?: string;
  subfolderId?: string; // The UX folder in the Workspace where the solution is deployed
  deploymentJobId?: string; // The spark job id that is used to deploy the solution
}

export enum SolutionDeploymentStatus {
  Pending,
  InProgress,
  Succeeded,
  Failed,
}

export enum SolutionDeploymentType {
  UX,
  SparkLivy
}



export interface SolutionConfiguration {
  typeId: string;
  deploymentType: SolutionDeploymentType; // Optional deployment type, default is UX
  name: string;
  icon?: string;
  description: string;
  deploymentFile?: string; // Optional reference to a deployment file
  items?: SolutionConfigurationItemDefinition[];
}

export interface SolutionConfigurationItemDefinition {
  name: string;
  itemType: string;
  itemTypeName?: string;
  itemDefinitions?: ItemDefinition[];
  description: string;
  icon?: string;
}

export enum ItemDefinitionPayloadType {
  Asset = "Asset", 
  Link = "Link",
  InlineBase64 = "InlineBase64"
}

export interface ItemDefinition {
  payloadType: ItemDefinitionPayloadType;
  payload: string;
  path: string;
}

export type SolutionConfigurations = {
  [key: string]: SolutionConfiguration;
};

// Array of available solution configurations
const solutionConfigList: SolutionConfiguration[] = [
  {
    typeId: "HelloWorld",
    deploymentType: SolutionDeploymentType.SparkLivy,
    name: "Hello World Solution",
    description: "Set up a new workspace with a hello world item.",
    icon: "/assets/samples/items/SolutionSampleItem/HelloWorld/HelloWorldSolution.png",
    deploymentFile: "/assets/samples/items/SolutionSampleItem/jobs/DefaultSolution-Deployment.py",
    items: [
      /*{
        name: "Solution HW Item",
        itemType: process.env.WORKLOAD_NAME + "." + process.env.DEFAULT_ITEM_NAME,
        itemTypeName: "Hello World Item",
        description: "A simple hello world item.",
        icon: "/assets/workload/items/HelloWorldItemIcon.png",
        itemDefinitions: [{
          path: ItemDefinitionPath.ItemMetadata,
          payload: "/assets/samples/items/SolutionSampleItem/HelloWorld/definitions/HelloWorldItem.json",
          payloadType: ItemDefinitionPayloadType.Asset
        }],
      }*/
     {
        name: "SOL - Lakehouse",
        itemType: "Lakehouse",
        description: "A lakehouse for the solution.",
        icon: "/assets/workload/items/HelloWorldItemIcon.png",
        itemDefinitions: []
      },
    ]
  },
  {
    typeId: "DataAnalytics",
    deploymentType: SolutionDeploymentType.SparkLivy,
    name: "Data Analytics Solution",
    icon: "/assets/samples/items/SolutionSampleItem/DataAnalyticsSolution.png",
    description: "Set up a new workspace with a analytics solution.", 
    items: [
      {
        name: "SA - Lakehouse",
        itemType: "Lakehouse",
        description: "A lakehouse for the solution.",
        icon: "/assets/workload/items/HelloWorldItemIcon.png",
        itemDefinitions: []
      },
      {
        name: "SA - Notebook",
        itemType: "Notebook",
        description: "A Notebook for the solution.",
        icon: "/assets/workload/items/HelloWorldItemIcon.png",
        itemDefinitions: []
      },
    ],
  }
];

// Create a registry object from the array for easy access by typeId
export const AvailableSolutionConfigurations: SolutionConfigurations =
  solutionConfigList.reduce((registry, config) => {
    registry[config.typeId] = config;
    return registry;
  }, {} as SolutionConfigurations);

// Export the array version as well if needed for iteration
export const SolutionConfigurationsArray = solutionConfigList;

export interface SparkDeployConfig {
  deploymentScript: string;
  targetWorkspaceId: string; // The workspace id where the solution is deployed
  targetSubfolderId: string; // The UX folder in the Workspace where the solution is deployed
  solutionId?: string; // The solution id that is used to deploy the solution
  items: SparkDeployConfigItem[]
}

export interface SparkDeployConfigItem {
  name: string;
  description: string;
  itemType: string;
  definitionParts?: SparkDeployConfigItemDefinition[]; // Optional parts of the item definition
}

export enum SparkDeployConfigItemDefinitionType {
  OneLake = "OneLake", 
  Link = "Link",
  InlineBase64 = "InlineBase64"
}

export interface SparkDeployConfigItemDefinition {
  path: string; // The OneLake file path for the item definition
  payload: string; // The file reference for the item definition
  payloadType: SparkDeployConfigItemDefinitionType
}



