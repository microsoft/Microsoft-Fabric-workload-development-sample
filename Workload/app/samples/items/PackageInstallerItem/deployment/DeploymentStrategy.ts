
import { PackageDeployment, Package, PackageInstallerItemDefinition, PackageItemDefinition, PackageItemDefinitionPayloadType, PackageItem, PackageItemDefinitionPart, WorkspaceConfig } from "../PackageInstallerItemModel";
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
  protected async createWorkspaceAndFolder(workspaceConfig: WorkspaceConfig): Promise<WorkspaceConfig> {
    const fabricAPI =this.context.fabricPlatformAPIClient;

    const newWorkspaceConfig: WorkspaceConfig = {
      ...workspaceConfig
    }

    // Check if we need to create a new workspace
    if (newWorkspaceConfig?.createNew) {
      const workspace = await fabricAPI.workspaces.createWorkspace({
        displayName: newWorkspaceConfig.name,
        description: newWorkspaceConfig.description,          
        capacityId: newWorkspaceConfig.capacityId
      });
      newWorkspaceConfig.id = workspace.id
      console.log(`Created new workspace: ${newWorkspaceConfig.id}`);
    }

    // Check if we need to create a new folder
    if (newWorkspaceConfig?.folder?.createNew) {
      const folder = await fabricAPI.folders.createFolder(
        newWorkspaceConfig.id, 
        {
          displayName: newWorkspaceConfig.folder.name,
          parentFolderId: newWorkspaceConfig.folder.parentFolderId,
        }
      );
      newWorkspaceConfig.folder.id = folder.id;
      console.log(`Created new folder: ${newWorkspaceConfig.folder.id}`);
    }
    return newWorkspaceConfig;
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
  protected async createItemUX(item: PackageItem, workspaceId: string, folderId: string, itemNameSuffix: string): Promise<Item> {
    const newItem = await this.context.fabricPlatformAPIClient.items.createItem(
        workspaceId,
        {
          displayName: itemNameSuffix ? `${item.displayName}${itemNameSuffix}` : item.displayName,
          type: item.type,
          description: item.description || '',
          folderId: folderId || undefined
        }
      );
    if(item.definition?.parts?.length > 0) {
      const definitionParts = await this.convertPackageItemDefinition(item.definition);
      await this.context.fabricPlatformAPIClient.items.updateItemDefinition(
        workspaceId,
        newItem.id,
        {
          definition: definitionParts.parts.length > 0 ? definitionParts : undefined,
        }
      );
    }
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

    let content: string;
    switch (defPart.payloadType) {
      case PackageItemDefinitionPayloadType.Asset:
        // Fetch content from asset and encode as base64
        content = await this.getAssetContent(defPart.payload);
        return btoa(content);
        
      case PackageItemDefinitionPayloadType.Link:
        // Download content from HTTP link and encode as base64

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
      case PackageItemDefinitionPayloadType.InlineBase64:
        // Use base64 payload directly
        return defPart.payload;
      default:
        throw new Error(`Unsupported payload type: ${defPart.payloadType}`);
    }
  }
}
