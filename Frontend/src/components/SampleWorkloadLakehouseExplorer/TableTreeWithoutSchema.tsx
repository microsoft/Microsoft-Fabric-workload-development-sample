import React from "react";
import { LakehouseExplorerTablesTreeProps } from "src/models/LakehouseExplorerModel";
import { Table20Regular } from "@fluentui/react-icons";
import { TreeItem, TreeItemLayout, Tooltip } from "@fluentui/react-components";

export function TableTreeWithoutSchema(props: LakehouseExplorerTablesTreeProps) {
    const {allTablesInLakehouse, onSelectTableCallback} = props;
    return (
        <>
            {allTablesInLakehouse &&
                allTablesInLakehouse.map((table) => (
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
                                className={"lvl1 " + (table.isSelected ? "selected" : "")}
                                iconBefore={<Table20Regular />}>
                                {table.name}
                            </TreeItemLayout>
                        </Tooltip>
                    </TreeItem>
                ))}
        </>
    );
}
