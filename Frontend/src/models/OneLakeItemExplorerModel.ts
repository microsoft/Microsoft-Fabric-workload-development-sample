export interface ItemMetadata {
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
    isDirectory: boolean;
    isSelected: boolean;
}

export interface OneLakeItemExplorerTablesTreeProps {
    allTablesInItem: TableMetadata[];
    onSelectTableCallback: (selectedTable: TableMetadata) => void;
}

export interface OneLakeItemExplorerFilesTreeProps {
    allFilesInItem: FileMetadata[];
    onSelectFileCallback: (selectedFile: FileMetadata) => void;
}