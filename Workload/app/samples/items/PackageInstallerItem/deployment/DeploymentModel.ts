import { WorkspaceConfig } from "../PackageInstallerItemModel";

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