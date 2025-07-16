import { GenericItem } from "../../../workload/models/ItemCRUDModel";


export interface PackageInstallerItemDefinition  {
  deployments?: Deployment[];
  lakehouseId?: string; // The lakehouse id that is used for the deployment
}

export interface Deployment {
  id: string;
  status: DeploymentStatus;
  packageId: string;
  itemsCreated: GenericItem[];
  workspaceId?: string;
  folderId?: string; // The UX folder in the Workspace where the package is deployed
  jobId?: string; // The spark job id that is used to deploy the package
}

export enum DeploymentStatus {
  Pending,
  InProgress,
  Succeeded,
  Failed,
}



export interface Package {
  typeId: string;
  deploymentType: PackageDeploymentType; // Optional deployment type, default is UX
  name: string;
  icon?: string;
  description: string;
  deploymentFile?: string; // Optional reference to a deployment file
  items?: PackageItemDefinition[];
}

export enum PackageDeploymentType {
  UX,
  SparkLivy
}

export interface PackageItemDefinition {
  name: string;
  itemType: string;
  itemTypeName?: string;
  itemDefinitions?: PackageItemDefinitionPayload[];
  description: string;
  icon?: string;
}

export enum PackageItemDefinitionPayloadType {
  Asset = "Asset", 
  Link = "Link",
  InlineBase64 = "InlineBase64"
}

export interface PackageItemDefinitionPayload {
  payloadType: PackageItemDefinitionPayloadType;
  payload: string;
  path: string;
}

export type ConfiguredPackages = {
  [key: string]: Package;
};

// Array of available packages 
const packageList: Package[] = [
  {
    typeId: "HelloWorld",
    deploymentType: PackageDeploymentType.SparkLivy,
    name: "Hello World Solution",
    description: "Set up a new workspace with a hello world item.",
    icon: "/assets/samples/items/PackageInstallerItem/HelloWorld/HelloWorldPackage.png",
    deploymentFile: "/assets/samples/items/PackageInstallerItem/jobs/DefaultPackageInstaller.py",
    items: [
      /*{
        name: "Solution HW Item",
        itemType: process.env.WORKLOAD_NAME + "." + process.env.DEFAULT_ITEM_NAME,
        itemTypeName: "Hello World Item",
        description: "A simple hello world item.",
        icon: "/assets/workload/items/HelloWorldItemIcon.png",
        itemDefinitions: [{
          path: ItemDefinitionPath.ItemMetadata,
          payload: "/assets/samples/items/PackageInstallerItem/HelloWorld/definitions/HelloWorldItem.json",
          payloadType: ItemDefinitionPayloadType.Asset
        }],
      }*/
     {
        name: "SOL - Lakehouse",
        itemType: "Lakehouse",
        description: "A lakehouse used to store the information.",
        icon: "/assets/workload/items/HelloWorldItemIcon.png",
        itemDefinitions: []
      },
    ]
  },
  {
    typeId: "DataAnalytics",
    deploymentType: PackageDeploymentType.SparkLivy,
    name: "Data Analytics Solution",
    icon: "/assets/samples/items/PackageInstallerItem/DataAnalyticsPackage.png",
    description: "Set up a new workspace for analytics.", 
    items: [
      {
        name: "SA - Lakehouse",
        itemType: "Lakehouse",
        description: "A lakehouse to store the data.",
        icon: "/assets/workload/items/HelloWorldItemIcon.png",
        itemDefinitions: []
      },
      {
        name: "SA - Notebook",
        itemType: "Notebook",
        description: "A Notebook to transform the data.",
        icon: "/assets/workload/items/HelloWorldItemIcon.png",
        itemDefinitions: []
      },
    ],
  }
];

// Create a registry object from the array for easy access by typeId
export const AvailablePackages: ConfiguredPackages =
  packageList.reduce((registry, config) => {
    registry[config.typeId] = config;
    return registry;
  }, {} as ConfiguredPackages);

// Export the array version as well if needed for iteration
export const SolutionConfigurationsArray = packageList;

export interface SparkDeployment {
  deploymentScript: string;
  targetWorkspaceId: string; // The workspace id where the package is deployed
  targetFolderId: string; // The UX folder in the Workspace where the package is deployed
  deploymentId?: string; // The deployment id
  items: SparkDeploymentItem[]
}

export interface SparkDeploymentItem {
  name: string;
  description: string;
  itemType: string;
  definitionParts?: SparkDeploymentItemDefinition[]; // Optional parts of the item definition
}

export enum SparkDeploymentItemDefinitionType {
  OneLake = "OneLake", 
  Link = "Link",
  InlineBase64 = "InlineBase64"
}

export interface SparkDeploymentItemDefinition {
  path: string; // The OneLake file path for the item definition
  payload: string; // The file reference for the item definition
  payloadType: SparkDeploymentItemDefinitionType
}



