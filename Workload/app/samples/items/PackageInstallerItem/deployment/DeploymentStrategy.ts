
import { PackageDeployment, Package, PackageInstallerItemDefinition, PackageItemDefinition, PackageItemDefinitionPayloadType, PackageItem, PackageItemDefinitionPart } from "../PackageInstallerItemModel";
import { WorkloadItem } from "../../../../implementation/models/ItemCRUDModel";
import { PackageInstallerContext } from "../package/PackageInstallerContext";
import { ItemDefinition } from "@ms-fabric/workload-client";
import { Item } from "src/samples/controller";

// Abstract base class for deployment strategies
export abstract class DeploymentStrategy {
  constructor(
    protected context: PackageInstallerContext,
    protected item: WorkloadItem<PackageInstallerItemDefinition>,
    protected pack: Package,
    protected deployment: PackageDeployment
  ) {}

  

  // Abstract method that each strategy must implement
  abstract deploy(): Promise<PackageDeployment>;

  //Abstract method to update deployment status depending on the underlying strategy
  abstract updateDeploymentStatus(): Promise<PackageDeployment>;

  // Common functionality that all strategies can use
  protected async createWorkspaceAndFolder() {
    const fabricAPI =this.context.fabricPlatformAPIClient;

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

  /**
   * Creates the item in the UX
   * @param item The item to create
   * @param workspaceId The workspace ID where the item should be created 
   * @param folderId
   * @returns 
   */
  protected async createItemUX(item: PackageItem, workspaceId: string, folderId: string): Promise<Item> {
    const newItem = await this.context.fabricPlatformAPIClient.items.createItem(
        workspaceId,
        {
          displayName: item.displayName,
          type: item.type,
          description: item.description || '',
          folderId: folderId || undefined
        }
      );
    const definitionParts = await this.convertPackageItemDefinition(item.definition);
    await this.context.fabricPlatformAPIClient.items.updateItemDefinition(
      workspaceId,
      newItem.id,
      {
        definition: definitionParts.parts.length > 0 ? definitionParts : undefined,
      }
    );
    console.log(`Successfully created item: ${newItem.id}`);
    return newItem;
  }

  protected async convertPackageItemDefinition(itemDefinition: PackageItemDefinition): Promise<ItemDefinition> {

    const definitionParts = [];
    
    for (const defPart of itemDefinition.parts) {
      let payloadData = await this.getItemDefinitionPartContent(defPart);
      
      definitionParts.push({
        path: defPart.path,
        payload: payloadData,
        payloadType: "InlineBase64" as const
      });
    }
    
    return {
      format: itemDefinition.format,
      parts: definitionParts
    } as ItemDefinition;
  }

  /** 
   * Retrieves the content of the deployment file based on its payload type
   * @returns Promise<string> Base64 encoded content of the deployment file
   */
  private async getItemDefinitionPartContent(defPart: PackageItemDefinitionPart): Promise<string> {

    const deploymentConfig = this.pack.deploymentConfig;
    if (!deploymentConfig.deploymentFile) {
      throw new Error("No deployment file specified");
    }

    let content: string;
    

    switch (defPart.payloadType) {
      case PackageItemDefinitionPayloadType.Asset:
        // Fetch content from asset and encode as base64
        content = await this.getAssetContent(deploymentConfig.deploymentFile.payload);
        return btoa(content);
        
      case PackageItemDefinitionPayloadType.Link:
        // Download content from HTTP link and encode as base64
        try {
          const url = defPart.payload;
          console.log(`Fetching deployment file from URL: ${url}`);
          
          // Validate that the URL is absolute
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            throw new Error(`Invalid URL format. Expected absolute URL starting with http:// or https://, got: ${url}`);
          }
          
          // Create a proper URL object to ensure it's valid
          const validatedUrl = new URL(url);
          console.log(`Validated URL: ${validatedUrl.toString()}`);
          
          const response = await fetch(validatedUrl.toString());
          if (!response.ok) {
            throw new Error(`Failed to fetch deployment file from link: ${response.status} ${response.statusText}`);
          }
          content = await response.text();
          return btoa(content);
        } catch (error) {
          console.error(`Error fetching deployment file from link ${deploymentConfig.deploymentFile.payload}:`, error);
          throw new Error(`Failed to process deployment file link: ${error.message}`);
        }
        
      case PackageItemDefinitionPayloadType.InlineBase64:
        // Use base64 payload directly
        return deploymentConfig.deploymentFile.payload;
        
      default:
        throw new Error(`Unsupported deployment file payload type: ${deploymentConfig.deploymentFile.payloadType}`);
    }
  }
}
