export interface LakehouseMetadata {
    workspaceObjectId: string;
    objectId: string;
    displayName: string;
}

export interface TableMetadata {
    name: string;
    path: string;
    isSelected: boolean;
    schema?: string;
}

export interface LakehouseExplorerTablesTreeProps {
    allTablesInLakehouse: TableMetadata[];
    onSelectTableCallback: (selectedTable: TableMetadata) => void;
}