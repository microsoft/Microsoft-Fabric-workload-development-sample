import { GenericItem, ItemDefinitionPath } from "../../../workload/models/ItemCRUDModel";


export interface SolutionSampleItemDefinition  {
  solutions?: Solution[];
}

export interface Solution {
  id: string;
  deploymentStatus: SolutionDeploymentStatus;
  type: SolutionType;
  itemsCreated: GenericItem[];
  workspaceId?: string;
}

export enum SolutionDeploymentStatus {
  Pending,
  InProgress,
  Succeeded,
  Failed,
}


// Configuration information for Solutions
export enum SolutionType {
  // Add more solution types as needed
  HelloWorld,
  DataAnalytics
}

export interface SolutionConfiguration {
  type: SolutionType;
  name: string;
  icon?: string;
  description: string;
  items?: SoltuionConfigurationItemDefinition[];

}

export interface SoltuionConfigurationItemDefinition {
  name: string;
  itemType: string;
  itemTypeName?: string;
  itemDefinition: ItemDefinitionReference[];
  description: string;
  icon?: string;
}

export interface ItemDefinitionReference {
  fileReference: string;
  path: string;
}

export type SolutionConfigurations = {
  [key in SolutionType]: SolutionConfiguration;
};

export const AvailableSolutionConfigurations: SolutionConfiguration[] = [
  {
    type: SolutionType.HelloWorld,
    name: "Hello World Solution",
    icon: "/assets/samples/items/SolutionSampleItem/HelloWorldSolution.png",
    description: "Set up a new workspace with a hello world item.",
    items: [
      {
        name: "Soltuion HW Item",
        itemType: process.env.WORKLOAD_NAME + "." + process.env.DEFAULT_ITEM_NAME,
        itemTypeName: "Hello World Item",
        itemDefinition: [{
          fileReference: "HelloWorldItemPayload.json",
          path: ItemDefinitionPath.ItemMetadata
        }],
        description: "A simple hello world item to demonstrate the solution.",
        icon: "/assets/workload/items/HelloWorldItem/HelloWorldItemIcon.png"
      }
    ]
  },
  {
    type: SolutionType.DataAnalytics,
    name: "Data Analytics Solution",
    icon: "/assets/samples/items/SolutionSampleItem/DataAnalyticsSolution.png",
    description: "Set up a new workspace with a analytics solution.", 
    items: [],
  }
];



