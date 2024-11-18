import React from "react";
import { TableMetadata, LakehouseExplorerTablesTreeProps } from "src/models/LakehouseExplorerModel";
import { ArrowCircleDownSplitRegular, Table20Regular } from "@fluentui/react-icons";
import { Tree, TreeItem, TreeItemLayout, Tooltip } from "@fluentui/react-components";


export function TableTreeWithSchema(props: LakehouseExplorerTablesTreeProps) {
    const {allTablesInLakehouse, onSelectTableCallback} = props;
    // group the tables by schema
    const tablesInLakehouseGroupedBySchema: { [key: string]: TableMetadata[] } =
    allTablesInLakehouse.reduce((acc: { [key: string]: TableMetadata[] }, table) => {
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
                    <TreeItem id={schema} key={schema} itemType="branch">
                        <Tooltip
                        relationship="label"
                        content={schema}>
                            <TreeItemLayout id={schema} className="lvl1" iconBefore={<ArrowCircleDownSplitRegular />}>
                                {schema}
                            </TreeItemLayout>
                        </Tooltip>
                        <Tree selectionMode="single" size='medium'>
                            {tablesInLakehouseGroupedBySchema[schema].map((table) => (
                                <TreeItem 
                                key={table.name} 
                                accessKey={table.path} 
                                itemType="leaf"
                                onClick={() => onSelectTableCallback(table)}
                                >
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

