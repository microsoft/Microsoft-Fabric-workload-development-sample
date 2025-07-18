import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { DeploymentStrategy } from "./DeploymentStrategy";
import { UXDeploymentStrategy } from "./UXDeploymentStrategy";
import { SparkLivyDeploymentStrategy } from "./SparkLivyDeploymentStrategy";
import { SparkNotebookDeploymentStrategy } from "./SparkNotebookDeploymentStrategy";
import { Deployment, Package, PackageDeploymentType } from "../PackageInstallerItemModel";
import { GenericItem } from "../../../../implementation/models/ItemCRUDModel";

// Deployment Factory
export class DeploymentStrategyFactory {
  static createStrategy(
    workloadClient: WorkloadClientAPI,
    item: GenericItem,
    pack: Package,
    deployment: Deployment
  ): DeploymentStrategy {
    switch (pack.deploymentType) {
      case PackageDeploymentType.UX:
        return new UXDeploymentStrategy(workloadClient, item, pack, deployment);
      case PackageDeploymentType.SparkLivy:
        return new SparkLivyDeploymentStrategy(workloadClient, item, pack, deployment);
      case PackageDeploymentType.SparkNotebook:
        return new SparkNotebookDeploymentStrategy(workloadClient, item, pack, deployment);
      default:
        throw new Error(`Unsupported deployment type: ${pack.deploymentType}`);
    }
  }
}
