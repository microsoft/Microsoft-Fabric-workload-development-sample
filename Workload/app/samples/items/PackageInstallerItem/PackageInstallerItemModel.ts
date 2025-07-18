import { GenericItem } from "../../../implementation/models/ItemCRUDModel";

// Import config files dynamically
import planningConfig from "../../../assets/samples/items/PackageInstallerItem/Planning/config.json";
import salesConfig from "../../../assets/samples/items/PackageInstallerItem/Sales/config.json";
import unifiedAdminConfig from "../../../assets/samples/items/PackageInstallerItem/UnifiedAdminMonitoring/config.json";
import workspaceMonitoringConfig from "../../../assets/samples/items/PackageInstallerItem/WorkspaceMonitoringDashboards/config.json";


export interface PackageInstallerItemDefinition  {
  deployments?: Deployment[];
  lakehouseId?: string; // The lakehouse id that is used for the deployment
}

export interface Deployment {
  id: string;
  status: DeploymentStatus;
  packageId: string;
  deployedItems: DeployedItem[];
  workspace: WorkspaceConfig;  
  jobId?: string; // The spark job id that is used to deploy the package
}

export interface DeployedItem extends GenericItem {
  itemDefenitionName: string; // The item definition name that was used to create the item
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
  Cancelled,
}

export interface Package {
  typeId: string;
  deploymentType: PackageDeploymentType; // Optional deployment type, default is UX
  locationType: PackageDeploymentLocation; // Optional location type, default is NewWorkspace
  name: string;
  icon?: string;
  description: string;
  deploymentFile?: DeploymentFile; // Optional reference to a deployment file
  items?: PackageItemDefinition[];
  suffixItemNames?: boolean; // Flag to indicate if item names should be prefixed with the package name
}

export interface DeploymentFile {
  payloadType: PackageItemDefinitionPayloadType;
  payload: string;
}

export enum PackageDeploymentType {
  UX,
  SparkLivy,
  SparkNotebook
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

// Helper function to convert config JSON to Package interface
function convertConfigToPackage(config: any): Package {
  // Convert string deployment type to enum
  let deploymentType: PackageDeploymentType;
  switch (config.deploymentType) {
    case "UX":
      deploymentType = PackageDeploymentType.UX;
      break;
    case "SparkLivy":
      deploymentType = PackageDeploymentType.SparkLivy;
      break;
    case "SparkNotebook":
      deploymentType = PackageDeploymentType.SparkNotebook;
      break;
    default:
      throw new Error(`Unsupported deployment type: ${config.deploymentType}`);
  }

  // Convert string location type to enum  
  let locationType: PackageDeploymentLocation;
  switch (config.locationType) {
    case "ExistingWorkspace":
      locationType = PackageDeploymentLocation.ExistingWorkspace;
      break;
    case "NewFolder":
      locationType = PackageDeploymentLocation.NewFolder;
      break;
    case "NewWorkspace":
      locationType = PackageDeploymentLocation.NewWorkspace;
      break;
    default:
      throw new Error(`Unsupported location type: ${config.locationType}`);
  }

  return {
    typeId: config.typeId,
    deploymentType,
    locationType,
    name: config.name,
    description: config.description,
    icon: config.icon,
    suffixItemNames: config.suffixItemNames || false,
    deploymentFile: config.deploymentFile ? {
      payloadType: PackageItemDefinitionPayloadType.Link,
      payload: config.deploymentFile
    } : undefined,
    items: config.items || []
  };
}

// Load packages from config files
const configFiles = [
  planningConfig,
  salesConfig,
  unifiedAdminConfig,
  workspaceMonitoringConfig
];

// Array of available packages loaded from config files
const packageList: Package[] = configFiles.map(convertConfigToPackage);

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

export enum SparkDeploymentReferenceType {
  OneLake = "OneLake", 
  Link = "Link",
  InlineBase64 = "InlineBase64"
}

export interface SparkDeploymentItemDefinition {
  path: string; // The OneLake file path for the item definition
  payload: string; // The file reference for the item definition
  payloadType: SparkDeploymentReferenceType
}



