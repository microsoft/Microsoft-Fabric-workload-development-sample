interface GetFoldersResult {
    paths: OneLakeFolder[];
}

interface OneLakeFolder {
    name: string;
    isDirectory: boolean;
}
