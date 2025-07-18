import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { GenericItem } from "../../../implementation/models/ItemCRUDModel";
import { DeploymentStrategyFactory } from "./deployment/DeploymentStrategyFactory";
import { Deployment, Package } from "./PackageInstallerItemModel";


export async function deployPackage(
  workloadClient: WorkloadClientAPI,
  item: GenericItem,
  pack: Package,
  deployment: Deployment,
  lakehouseId: string): Promise<Deployment> {
    
    const strategy = DeploymentStrategyFactory.createStrategy(
      workloadClient,
      item,
      pack,
      deployment
    );
    
    return await strategy.deploy();
}
