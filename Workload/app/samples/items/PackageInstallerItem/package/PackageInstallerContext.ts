import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { PackageRegistry } from "./PackageRegistry";
import { Package } from "../PackageInstallerItemModel";
import { FabricPlatformAPIClient } from "../../../controller";


export class PackageInstallerContext {
    workloadClientAPI: WorkloadClientAPI;
    packageRegistry: PackageRegistry;
    fabricPlatformAPIClient: FabricPlatformAPIClient;

    constructor(workloadClientAPI: WorkloadClientAPI) {
        this.workloadClientAPI = workloadClientAPI;
        this.packageRegistry = new PackageRegistry();
        this.fabricPlatformAPIClient = new FabricPlatformAPIClient(workloadClientAPI);
    }


    getPackage(typeId: string): Package | undefined {
        return this.packageRegistry.getPackage(typeId);
    }

}
