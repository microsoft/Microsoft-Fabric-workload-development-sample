import React from "react";
import { OneLakeItemExplorerTablesTreeProps } from "src/samples/views/SampleOneLakeItemExplorer/SampleOneLakeItemExplorerModel";
import { Table20Regular } from "@fluentui/react-icons";
import { TreeItem, TreeItemLayout, Tooltip } from "@fluentui/react-components";

export function TableTreeWithoutSchema(props: OneLakeItemExplorerTablesTreeProps) {
    const {allTablesInItem: allTablesInOneLake, onSelectTableCallback} = props;
    return (
        <>
            {allTablesInOneLake &&
                allTablesInOneLake.map((table) => (
                    <TreeItem 
                    key={table.name} 
                    accessKey={table.path} 
                    itemType="leaf" 
                    onClick={() => onSelectTableCallback(table)}
                    >
                        <Tooltip
                        relationship="label"
                        content={table.name}>
                            <TreeItemLayout
                                className={(table.isSelected ? "selected" : "")}
                                iconBefore={<Table20Regular />}>
                                {table.name}
                            </TreeItemLayout>
                        </Tooltip>
                    </TreeItem>
                ))}
        </>
    );
}
