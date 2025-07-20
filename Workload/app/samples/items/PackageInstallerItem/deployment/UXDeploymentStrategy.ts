import { DeploymentStrategy } from "./DeploymentStrategy";
import { DeployedItem, PackageDeployment, DeploymentStatus, DeploymentJobInfo } from "../PackageInstallerItemModel";

// UX Deployment Strategy
export class UXDeploymentStrategy extends DeploymentStrategy {
  
  async deploy(): Promise<PackageDeployment> {
    console.log(`Deploying package via UX for item: ${this.item.id}. Deployment: ${this.deployment.id} with type: ${this.pack.id}`);
    
    // Check if items are defined in the package
    if (!this.pack.items || this.pack.items.length === 0) {
      console.log("No items defined in package");
      return { ...this.deployment, status: DeploymentStatus.Succeeded };
    }

    const targetWorkspaceId = this.deployment.workspace.id;
    const createdItems: DeployedItem[] = [];
    const job:DeploymentJobInfo = { 
      id: "",
      startTime: new Date(),
      item: { 
        id: this.item.id, 
        workspaceId: targetWorkspaceId
      } 
    };
    
    try {
      await this.createWorkspaceAndFolder();
      
      // Create each item defined in the package
      for (const itemDef of this.pack.items) {
        console.log(`Creating item: ${itemDef.displayName} of type: ${itemDef.type}`);

        itemDef.description = this.pack.deploymentConfig.suffixItemNames ? `${itemDef.displayName}_${this.deployment.id}` : itemDef.displayName;
        const newItem = await this.createItemUX(itemDef, targetWorkspaceId, this.deployment.workspace?.folder?.id);
        createdItems.push(
          {
             ...newItem,
             itemDefenitionName: itemDef.displayName
          });
      }
            
    } catch (error) {
      console.error(`Error in UX deployment: ${error}`);
      job.failureReason = error;
    }
    finally {
      return {
        ...this.deployment,
        deployedItems: createdItems,
        status: job.failureReason ? DeploymentStatus.Failed : DeploymentStatus.Succeeded,
        job: {
          ...job,
          endTime: new Date(),
        }
      };
    }
  }

  async updateDeploymentStatus(): Promise<PackageDeployment>{
    // UX deployment does not require status updates, so we can return the current deployment
    return this.deployment;
  }
  
}
