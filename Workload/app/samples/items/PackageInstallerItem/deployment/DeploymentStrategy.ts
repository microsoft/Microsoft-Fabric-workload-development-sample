import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { Deployment, Package, PackageInstallerItemDefinition } from "../PackageInstallerItemModel";
import { WorkloadItem } from "../../../../implementation/models/ItemCRUDModel";
import { FabricPlatformAPIClient } from "../../../controller/FabricPlatformAPIClient";

// Abstract base class for deployment strategies
export abstract class DeploymentStrategy {
  constructor(
    protected workloadClient: WorkloadClientAPI,
    protected item: WorkloadItem<PackageInstallerItemDefinition>,
    protected pack: Package,
    protected deployment: Deployment
  ) {}

  

  // Abstract method that each strategy must implement
  abstract deploy(): Promise<Deployment>;

  //Abstract method to update deployment status depending on the underlying strategy
  abstract updateDeploymentStatus(): Promise<Deployment>;

  // Common functionality that all strategies can use
  protected async createWorkspaceAndFolder() {
    const fabricAPI = FabricPlatformAPIClient.create(this.workloadClient);

    // Check if we need to create a new workspace
    if (this.deployment.workspace?.createNew) {
      const workspace = await fabricAPI.workspaces.createWorkspace({
        displayName: this.deployment.workspace.name,
        description: this.deployment.workspace.description,          
        capacityId: this.deployment.workspace.capacityId
      });
      this.deployment.workspace = {
        ...this.deployment.workspace,
        id: workspace.id
      };
      console.log(`Created new workspace: ${this.deployment.workspace.id}`);
    }

    // Check if we need to create a new folder
    if (this.deployment.workspace?.folder?.createNew) {
      const folder = await fabricAPI.folders.createFolder(
        this.deployment.workspace.id, 
        {
          displayName: this.deployment.workspace.folder.name,
          parentFolderId: this.deployment.workspace.folder.parentFolderId,
        }
      );
      this.deployment.workspace.folder = {
        ...this.deployment.workspace.folder,
        id: folder.id
      };
      console.log(`Created new folder: ${this.deployment.workspace.folder.id}`);
    }
  }

  protected async getAssetContent(path: string): Promise<string> {
    const response = await fetch(path);
    if (!response.ok) {
      console.error('Error fetching content:', path);
      throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
    }
    return await response.text();
  }
}
