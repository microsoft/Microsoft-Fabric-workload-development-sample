import { GenericItem } from "../../../implementation/models/ItemCRUDModel";


export interface PackageInstallerItemDefinition  {
  deployments?: Deployment[];
  lakehouseId?: string; // The lakehouse id that is used for the deployment
}

export interface Deployment {
  id: string;
  status: DeploymentStatus;
  packageId: string;
  itemsCreated: GenericItem[];
  workspace: WorkspaceConfig;  
  jobId?: string; // The spark job id that is used to deploy the package
}

export interface WorkspaceConfig {
  createNew: boolean; // Flag to indicate if a new workspace should be created
  id?: string;
  name?: string;
  description?: string;
  capacityId?: string; // The capacity id that is used for the workspace
  folder?: FolderConfig; // The UX folder in the Workspace where the package is deployed
}

export interface FolderConfig {
  createNew: boolean; // Flag to indicate if a new folder should be created
  parentFolderId?: string; // The parent folder id where the new folder should be created
  id?: string;
  name: string;
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
  locationType: PackageDeploymentLocation; // Optional location type, default is NewWorkspace
  name: string;
  icon?: string;
  description: string;
  deploymentFile?: string; // Optional reference to a deployment file
  items?: PackageItemDefinition[];
  suffixItemNames?: boolean; // Flag to indicate if item names should be prefixed with the package name
}

export enum PackageDeploymentType {
  UX,
  SparkLivy
}

export enum PackageDeploymentLocation {
  // A new workspace will be created for the package
  NewWorkspace = "NewWorkspace",
  // The package will be deployed to an existing workspace into a new folder
  ExistingWorkspace = "ExistingWorkspace",
  // The package will be deployed to an existing folder in the workspace
  NewFolder = "NewFolder"
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
    typeId: "PlanningWS",
    deploymentType: PackageDeploymentType.UX,
    locationType: PackageDeploymentLocation.NewWorkspace,
    name: "Product Planning Project",
    description: "Set up a workspace that will configure every component that is needed to do product planning.",
    icon: "/assets/samples/items/PackageInstallerItem/Planning/icon.png",
    deploymentFile: "/assets/samples/items/PackageInstallerItem/jobs/DefaultPackageInstaller.py",    
    suffixItemNames: false,
    items: [
     {
        name: "PlanningLH",
        itemType: "Lakehouse",
        description: "A lakehouse that contains access to all Planning Data.",
        icon: "",
        itemDefinitions: []
      },
    ]
  },
  {
    typeId: "SalesData",
    deploymentType: PackageDeploymentType.UX,
    locationType: PackageDeploymentLocation.NewFolder,
    name: "Sales Data Workspace",
    icon: "/assets/samples/items/PackageInstallerItem/Sales/icon.png",
    description: "Set up a new workspace to analyse .", 
    suffixItemNames: true,
    items: [
      {
        name: "SalesDataLH",
        itemType: "Lakehouse",
        description: "A lakehouse that has access to the sales data.",
        icon: "",
        itemDefinitions: []
      },
      {
        name: "SalesDataNB",
        itemType: "Notebook",
        description: "A Notebook to Analyze the Sales data.",
        icon: "",
        itemDefinitions: []
      },
      {
        name: "SalesDataNB2",
        itemType: "Notebook",
        description: "A Notebook second to Analyze the Sales data.",
        icon: "",
        itemDefinitions: []
      }
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
  workspace: WorkspaceConfig; // location information where to deploy to
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



