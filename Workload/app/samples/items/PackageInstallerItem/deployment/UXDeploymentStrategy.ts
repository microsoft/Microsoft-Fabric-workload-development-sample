import { DeploymentStrategy } from "./DeploymentStrategy";
import { DeployedItem, PackageDeployment, DeploymentStatus, PackageItemDefinitionPayloadType } from "../PackageInstallerItemModel";
import { FabricPlatformAPIClient } from "../../../controller/FabricPlatformAPIClient";

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
    
    try {
      await this.createWorkspaceAndFolder();
      
      const fabricAPI = FabricPlatformAPIClient.create(this.workloadClient);
      const targetWorkspaceId = this.deployment.workspace.id;
      
      // Create each item defined in the package
      for (const itemDef of this.pack.items) {
        console.log(`Creating item: ${itemDef.name} of type: ${itemDef.itemType}`);

        const definitionParts = await this.processItemDefinitions(itemDef.itemDefinitions || []);
        const displayName = this.pack.deploymentConfig.suffixItemNames ? `${itemDef.name}_${this.deployment.id}` : itemDef.name;        
        
        const newItem = await fabricAPI.items.createItem(
          targetWorkspaceId,
          {
            displayName: displayName,
            type: itemDef.itemType,
            description: itemDef.description || '',
            definition: definitionParts.length > 0 ? { parts: definitionParts } : undefined,
            folderId: this.deployment.workspace?.folder?.id || undefined
          }
        );        
        
        console.log(`Successfully created item: ${newItem.id}`);
        createdItems.push(
          {
             ...newItem,
             itemDefenitionName: itemDef.name
          });
      }
      
      return {
        ...this.deployment,
        deployedItems: createdItems,
        status: DeploymentStatus.Succeeded
      };
      
    } catch (error) {
      console.error(`Error in UX deployment: ${error}`);
      return { ...this.deployment, status: DeploymentStatus.Failed };
    }
  }

  async updateDeploymentStatus(): Promise<PackageDeployment>{
    // UX deployment does not require status updates, so we can return the current deployment
    return this.deployment;
  }

  private async processItemDefinitions(itemDefinitions: any[]): Promise<any[]> {
    const definitionParts = [];
    
    for (const defPart of itemDefinitions) {
      let payloadData;
      
      switch (defPart.payloadType) {
        case PackageItemDefinitionPayloadType.Asset:
          const assetContent = await this.getAssetContent(defPart.payload);
          payloadData = btoa(assetContent);
          break;
        case PackageItemDefinitionPayloadType.Link:
          try {
            const response = await fetch(defPart.payload);
            if (!response.ok) {
              throw new Error(`Failed to fetch content from link: ${response.status} ${response.statusText}`);
            }
            const linkContent = await response.text();
            payloadData = btoa(linkContent);
          } catch (error) {
            console.error(`Error fetching content from link ${defPart.payload}:`, error);
            throw new Error(`Failed to process link: ${error.message}`);
          }
          break;
        case PackageItemDefinitionPayloadType.InlineBase64:
          payloadData = defPart.payload;
          break;
        default:
          throw new Error(`Unsupported payload type: ${defPart.payloadType}`);
      }
      
      definitionParts.push({
        path: defPart.path,
        payload: payloadData,
        payloadType: "InlineBase64" as const
      });
    }
    
    return definitionParts;
  }
}
