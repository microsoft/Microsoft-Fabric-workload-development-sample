import { Item } from "../../../implementation/clients/FabricPlatformTypes";

/* 
 * Represents a reference to a fabric item.
 * This interface extends ItemLikeV2 to include additional metadata.    
 */
export interface EventhouseItemMetadata extends Item {
    properties: EventhouseItemPropertiesMetadata;
}

/**
 * Represents a fabric item with additional metadata and a payload.
 * This interface extends GenericItem and includes properties for item type, display name, description, and metadata.
 */
export interface EventhouseItemPropertiesMetadata {
    queryServiceUri: string;
    ingestionServiceUri: string;
    databasesItemIds: string[]
}