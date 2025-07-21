import { DeploymentStrategy } from "./DeploymentStrategy";
import { DeployedItem, PackageDeployment, DeploymentStatus } from "../PackageInstallerItemModel";

// UX Deployment Strategy
export class UXDeploymentStrategy extends DeploymentStrategy {
  
  async deploy(): Promise<PackageDeployment> {
    console.log(`Deploying package via UX for item: ${this.item.id}. Deployment: ${this.deployment.id} with type: ${this.pack.id}`);
    
    // Check if items are defined in the package
    if (!this.pack.items || this.pack.items.length === 0) {
      console.log("No items defined in package");
      return { ...this.deployment, status: DeploymentStatus.Succeeded };
    }

    const createdItems: DeployedItem[] = [];
    
    const newPackageDeployment: PackageDeployment = {
        ...this.deployment   
    };
    
    try {
      // Create workspace and folder if needed
      const newWorkspace = await this.createWorkspaceAndFolder(this.deployment.workspace);
      newPackageDeployment.workspace = newWorkspace;
      newPackageDeployment.job = { 
              id: "",
              startTime: new Date(),
              item: { 
                id: this.item.id, 
                workspaceId: newWorkspace.id,
              }, 
            }
      
      var itemNameSuffix: string | undefined = this.pack.deploymentConfig.suffixItemNames ? `_${this.deployment.id}` : undefined;
      console.log(`Creating items in workspace: ${newPackageDeployment.workspace.id}, folder: ${this.deployment.workspace?.folder?.id}, itemNameSuffix: ${itemNameSuffix}`);
      
      // Create each item defined in the package
      for (const itemDef of this.pack.items) {
        console.log(`Creating item: ${itemDef.displayName} of type: ${itemDef.type}`);

        itemDef.description = this.pack.deploymentConfig.suffixItemNames ? `${itemDef.displayName}_${this.deployment.id}` : itemDef.displayName;
        const newItem = await this.createItemUX(itemDef, 
                                                newPackageDeployment.workspace.id, 
                                                this.deployment.workspace?.folder?.id, 
                                                itemNameSuffix);
        createdItems.push(
          {
             ...newItem,
             itemDefenitionName: itemDef.displayName
          });
      }
      newPackageDeployment.deployedItems = createdItems;
      newPackageDeployment.status = DeploymentStatus.Succeeded;
      newPackageDeployment.job.endTime = new Date();
            
    } catch (error) {
      console.error(`Error in UX deployment: ${error}`);
      newPackageDeployment.status = DeploymentStatus.Failed;
      newPackageDeployment.job.endTime = new Date();
      newPackageDeployment.job.failureReason = error;
    }
    return newPackageDeployment;
  }

  async updateDeploymentStatus(): Promise<PackageDeployment>{
    // UX deployment does not require status updates, so we can return the current deployment
    return {
      ...this.deployment
    }
  }
  
}
