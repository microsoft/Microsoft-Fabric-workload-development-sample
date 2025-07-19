import { GenericItem, ItemReference } from "../../../implementation/models/ItemCRUDModel";

export interface PackageInstallerItemDefinition  {
  deployments?: PackageDeployment[];
  additionalPackages?: string[]; // Additional packages that can be installed with this item
  lakehouseId?: string; // The lakehouse id that is used for the deployment
}

export interface PackageDeployment {
  id: string;
  status: DeploymentStatus;
  packageId: string;
  deployedItems: DeployedItem[];
  workspace: WorkspaceConfig;  
  job?: DeploymentJobInfo; // The spark job id that is used to deploy the package
}

export interface DeploymentJobInfo {
  id: string; // The job id that is used to deploy the package
  item: ItemReference
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
  id: string;
  displayName: string;
  description?: string;
  icon?: string;
  deploymentConfig: DeploymentConfiguration; // Configuration for the deployment
  items?: PackageItemDefinition[];
}

export interface DeploymentConfiguration {
  type: DeploymentType; // Optional deployment type, default is UX
  location: DeploymentLocation; // Optional location type, default is NewWorkspace
  deploymentFile?: DeploymentFile; // Optional reference to a deployment file
  suffixItemNames?: boolean; // Flag to indicate if item names should be prefixed with the package name
}

export interface DeploymentFile {
  payloadType: PackageItemDefinitionPayloadType;
  payload: string;
}

export enum DeploymentType {
  UX,
  SparkLivy,
  SparkNotebook
}

export enum DeploymentLocation {
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





