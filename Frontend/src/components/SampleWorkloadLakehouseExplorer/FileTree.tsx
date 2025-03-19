import React from "react";
import { LakehouseExplorerFilesTreeProps } from "src/models/LakehouseExplorerModel";
import { Square20Regular } from "@fluentui/react-icons";
import { TreeItem, TreeItemLayout, Tooltip } from "@fluentui/react-components";

export function FileTree(props: LakehouseExplorerFilesTreeProps) {
    const {allFilesInLakehouse, onSelectFileCallback} = props;
    return (
        <>
            {allFilesInLakehouse &&
                allFilesInLakehouse.map((file) => (
                    <TreeItem 
                    key={file.name} 
                    accessKey={file.path} 
                    itemType="leaf" 
                    onClick={() => onSelectFileCallback(file)}
                    >
                        <Tooltip
                        relationship="label"
                        content={file.name}>
                            <TreeItemLayout
                                className={"lvl1 " + (file.isSelected ? "selected" : "")}
                                iconBefore={<Square20Regular />}>
                                {file.name}
                            </TreeItemLayout>
                        </Tooltip>
                    </TreeItem>
                ))}
        </>
    );
}
