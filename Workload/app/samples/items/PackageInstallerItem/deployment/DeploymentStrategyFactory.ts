
import { DeploymentStrategy } from "./DeploymentStrategy";
import { UXDeploymentStrategy } from "./UXDeploymentStrategy";
import { SparkLivyDeploymentStrategy } from "./SparkLivyDeploymentStrategy";
import { SparkNotebookDeploymentStrategy } from "./SparkNotebookDeploymentStrategy";
import { PackageDeployment, Package, DeploymentType } from "../PackageInstallerItemModel";
import { GenericItem } from "../../../../implementation/models/ItemCRUDModel";
import { PackageInstallerContext } from "../package/PackageInstallerContext";

// Deployment Factory
export class DeploymentStrategyFactory {
  static createStrategy(
    context: PackageInstallerContext,
    item: GenericItem,
    pack: Package,
    deployment: PackageDeployment
  ): DeploymentStrategy {
    switch (pack.deploymentConfig.type) {
      case DeploymentType.UX:
        return new UXDeploymentStrategy(context, item, pack, deployment);
      case DeploymentType.SparkLivy:
        return new SparkLivyDeploymentStrategy(context, item, pack, deployment);
      case DeploymentType.SparkNotebook:
        return new SparkNotebookDeploymentStrategy(context, item, pack, deployment);
      default:
        throw new Error(`Unsupported deployment type: ${pack.deploymentConfig.type}`);
    }
  }
}
