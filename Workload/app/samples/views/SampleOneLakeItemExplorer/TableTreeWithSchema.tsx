import React from "react";
import { TableMetadata, OneLakeItemExplorerTablesTreeProps } from "./SampleOneLakeItemExplorerModel";
import { ArrowCircleDownSplitRegular, Table20Regular } from "@fluentui/react-icons";
import { Tree, TreeItem, TreeItemLayout, Tooltip } from "@fluentui/react-components";


export function TableTreeWithSchema(props: OneLakeItemExplorerTablesTreeProps) {
    const {allTablesInItem: allTablesInOneLake, onSelectTableCallback} = props;
    // group the tables by schema
    const tablesInOneLakeGroupedBySchema: { [key: string]: TableMetadata[] } =
    allTablesInOneLake.reduce((acc: { [key: string]: TableMetadata[] }, table) => {
            if (!acc[table.schema]) {
                acc[table.schema] = [];
            }
            acc[table.schema].push(table);
            return acc;
        }, {});
    return (
        <>
            {tablesInOneLakeGroupedBySchema &&
                Object.keys(tablesInOneLakeGroupedBySchema).map((schema) => (
                    <TreeItem id={schema} key={schema} itemType="branch">
                        <Tooltip
                        relationship="label"
                        content={schema}>
                            <TreeItemLayout id={schema} iconBefore={<ArrowCircleDownSplitRegular />}>
                                {schema}
                            </TreeItemLayout>
                        </Tooltip>
                        <Tree selectionMode="single" size='medium'>
                            {tablesInOneLakeGroupedBySchema[schema].map((table) => (
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
                                            className={(table.isSelected ? "selected" : "")}
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

