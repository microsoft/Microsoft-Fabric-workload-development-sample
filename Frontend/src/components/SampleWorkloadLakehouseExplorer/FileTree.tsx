import React from "react";
import { Document20Regular, FolderRegular } from "@fluentui/react-icons";
import { Tree, TreeItem, TreeItemLayout, Tooltip } from "@fluentui/react-components";
import { FileMetadata, LakehouseExplorerFilesTreeProps } from "src/models/LakehouseExplorerModel";

interface TreeNode {
    metadata: FileMetadata;
    children: TreeNode[];
}

type FolderMap = Map<string, TreeNode>;

export function FileTree(props: LakehouseExplorerFilesTreeProps) {
    const {allFilesInLakehouse, onSelectFileCallback} = props;

    const buildFileTree = (files: FileMetadata[]) => {
        const root: TreeNode[] = [];
        const folders: FolderMap = new Map();

        // Helper function to add a node (file or folder) to the tree
        const addNode = (metadata: FileMetadata): TreeNode => {
            const node: TreeNode = {
                metadata: metadata,
                children: []
            };
            
            // If it's a directory, store it in our folders map for later reference
            if (metadata.isDirectory) {
                folders.set(metadata.path, node);
            }

            // Add to parent folder or root
            const segments = metadata.path.split('/').filter(s => s);
            if (segments.length > 1) {
                const parentPath = segments.slice(0, -1).join('/');
                const parent = folders.get(parentPath);
                if (parent) {
                    parent.children.push(node);
                } else {
                    root.push(node);
                }
            } else {
                root.push(node);
            }

            return node;
        };

        // First pass: create folder nodes
        files.filter(f => f.isDirectory).forEach(folder => {
            addNode(folder);
        });

        // Second pass: add files to their folders
        files.filter(f => !f.isDirectory).forEach(file => {
            addNode(file);
        });

        // Sort tree alphabetically and by type (folders first)
        const sortNodes = (nodes: TreeNode[]) => {
            nodes.sort((a, b) => {
                if (a.metadata.isDirectory !== b.metadata.isDirectory) {
                    return a.metadata.isDirectory ? -1 : 1;
                }
                return a.metadata.name.localeCompare(b.metadata.name);
            });
            nodes.forEach(node => {
                if (node.children.length > 0) {
                    sortNodes(node.children);
                }
            });
        };

        sortNodes(root);
        return root;
    };

    const renderTreeNode = (node: TreeNode): JSX.Element => {
        const { metadata, children } = node;

        if (metadata.isDirectory) {
            return (
                <TreeItem key={metadata.path} itemType="branch">
                    <Tooltip relationship="label" content={metadata.name}>
                        <TreeItemLayout iconBefore={<FolderRegular />}>
                            {metadata.name}
                        </TreeItemLayout>
                    </Tooltip>
                    <Tree>
                        {children.map(child => renderTreeNode(child))}
                    </Tree>
                </TreeItem>
            );
        } else {
            return (
                <TreeItem
                    key={metadata.path}
                    itemType="leaf"
                    onClick={() => onSelectFileCallback(metadata)}
                >
                    <Tooltip relationship="label" content={metadata.name}>
                        <TreeItemLayout
                            className={metadata.isSelected ? "selected" : ""}
                            iconBefore={<Document20Regular />}
                        >
                            {metadata.name}
                        </TreeItemLayout>
                    </Tooltip>
                </TreeItem>
            );
        }
    };

    const fileTree = buildFileTree(allFilesInLakehouse || []);

    return (
        <>
            {fileTree.map(node => renderTreeNode(node))}
        </>
    );
}
