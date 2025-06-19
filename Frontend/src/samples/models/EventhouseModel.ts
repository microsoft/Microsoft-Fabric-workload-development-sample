export interface EventhouseItemMetadata {
    workspaceObjectId: string;
    id: string;
    type: string;
    displayName: string;
    description: string;
    properties: EventhouseItemPropertiesMetadata;
}

export interface EventhouseItemPropertiesMetadata {
    queryServiceUri: string;
    ingestionServiceUri: string;
    databasesItemIds: string[]
}