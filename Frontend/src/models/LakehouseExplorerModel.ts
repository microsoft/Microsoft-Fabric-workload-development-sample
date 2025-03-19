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

export interface FileMetadata {
    name: string;
    path: string;
    isSelected: boolean;
    schema?: string;
}

export interface LakehouseExplorerTablesTreeProps {
    allTablesInLakehouse: TableMetadata[];
    onSelectTableCallback: (selectedTable: TableMetadata) => void;
}

export interface LakehouseExplorerFilesTreeProps {
    allFilesInLakehouse: FileMetadata[];
    onSelectFileCallback: (selectedFile: FileMetadata) => void;
}