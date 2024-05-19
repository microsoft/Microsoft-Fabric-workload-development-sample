import React from "react";
import { TableMetadata } from "src/models/LakehouseExplorerModel";
import { ArrowCircleDownSplitRegular, Table20Regular } from "@fluentui/react-icons";
import { Tree, TreeItem, TreeItemLayout, Tooltip } from "@fluentui/react-components";

export function TableTreeWithSchema(tablesInLakehouse: TableMetadata[]) {
    // group the tables by schema
    const tablesInLakehouseGroupedBySchema: { [key: string]: TableMetadata[] } =
        tablesInLakehouse.reduce((acc: { [key: string]: TableMetadata[] }, table) => {
            if (!acc[table.schema]) {
                acc[table.schema] = [];
            }
            acc[table.schema].push(table);
            return acc;
        }, {});
    return (
        <>
            {tablesInLakehouseGroupedBySchema &&
                Object.keys(tablesInLakehouseGroupedBySchema).map((schema) => (
                    <TreeItem key={schema} itemType="branch" value="Schemas">
                        <Tooltip
                        relationship="label"
                        content={schema}>
                            <TreeItemLayout className="lvl1" iconBefore={<ArrowCircleDownSplitRegular />}>
                                {schema}
                            </TreeItemLayout>
                        </Tooltip>
                        <Tree selectionMode="single" size='medium'>
                            {tablesInLakehouseGroupedBySchema[schema].map((table) => (
                                <TreeItem key={table.name} accessKey={table.path} itemType="leaf">
                                    <Tooltip
                                    relationship='label'
                                    content={table.name}>
                                        <TreeItemLayout
                                            className={"lvl2 " + (table.isSelected ? "selected" : "")}
                                            iconBefore={<Table20Regular />}>
                                            {table.name}
                                        </TreeItemLayout>
                                    </Tooltip>
                                </TreeItem>
                            ))}
                        </Tree>
                    </TreeItem>
                ))}
        </>
    );
}