import { GenericItem, ItemReference } from "../../../implementation/models/ItemCRUDModel";

export interface PackageInstallerItemDefinition  {
  deployments?: PackageDeployment[];
  additionalPackages?: string[]; // Additional packages that can be installed with this item
  lakehouseId?: string; // The lakehouse id that is used for the deployment
}

export interface PackageDeployment {
  id: string;
  status: DeploymentStatus;
  triggeredBy?: string; // The user who triggered the deployment
  triggeredTime?: Date; // The date when the deployment was triggered
  packageId: string;
  deployedItems: DeployedItem[];
  workspace?: WorkspaceConfig;  
  job?: DeploymentJobInfo; // The spark job id that is used to deploy the package
}

export interface DeploymentJobInfo {
  id: string; // The job id that is used to deploy the package
  item: ItemReference
  startTime?: Date; // The date when the job was created
  endTime?: Date; // The date when the job was finished
  failureReason?: any; // The reason why the job failed
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
  Pending = "Pending",
  InProgress = "InProgress",
  Succeeded = "Succeeded",
  Failed = "Failed",
  Cancelled = "Cancelled",
}
 
export interface Package {
  id: string;
  displayName: string;
  description?: string;
  icon?: string;
  deploymentConfig: DeploymentConfiguration; // Configuration for the deployment
  items?: PackageItem[];
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
  UX = "UX", // UX deployment strategy
  SparkLivy = "SparkLivy", // Spark Livy deployment strategy
  SparkNotebook = "SparkNotebook" // Spark Notebook deployment strategy
}

export enum DeploymentLocation {
  // A new workspace will be created for the package
  NewWorkspace = "NewWorkspace",
  // The package will be deployed to an existing workspace into a new folder
  ExistingWorkspace = "ExistingWorkspace",
  // The package will be deployed to an existing folder in the workspace
  NewFolder = "NewFolder"
}

export interface PackageItem {
  type: string;
  displayName: string;
  description: string;
  definition?: PackageItemDefinition; // The item definition that is used to create the item
}

export enum PackageItemDefinitionPayloadType {
  Asset = "Asset", 
  Link = "Link",
  InlineBase64 = "InlineBase64"
}

export interface PackageItemDefinition {
  format?: string; // Format of the item definition, e.g., "ipynb" for Jupyter Notebooks
  parts?: PackageItemDefinitionPart[]; // Parts of the item definition, e.g., file paths and payloads
}

export interface PackageItemDefinitionPart {
  payloadType: PackageItemDefinitionPayloadType;
  payload: string;
  path: string;
}





