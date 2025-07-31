import { ItemReference } from "../../controller/ItemCRUDController";
import { CreateShortcutRequest, CreateShortcutWithTransformRequest, FabricPlatformAPIClient, Shortcut, WorkloadClientAPI } from "../../clients";
import { DEFAULT_SHORTCUT_PREFIX, ShortcutInfo, ShortcutInfoFabric, UnityCatalogItemDefinition } from "./UnityCatalogItemModel";
import { TableInfo } from "../../../api/UnityCatalog/client";


export class UnityCatalogShortcutController {

    workloadClient: WorkloadClientAPI;
    fabricAPIClient: FabricPlatformAPIClient;

    constructor(workloadClient: WorkloadClientAPI) {
        this.workloadClient = workloadClient;
        this.fabricAPIClient = new FabricPlatformAPIClient(workloadClient);
    }

    convertTable(table: TableInfo) {
        if (table.data_source_format !== 'DELTA') {
            throw new Error(`Table ${table.name} is not in DELTA format and will not be synced.`);
        }
        const shortcutInfo: ShortcutInfo = {
            id: this.generateId(),
            unityCatalog: {
                catalogName: table.catalog_name,
                schemaName: table.schema_name,
                tableName: table.name,
                dataSourceFormat: 'DELTA',
                tableLocation: table.storage_location || '',
            },
            status: 'active',
            createdDate: new Date(),
            lastSyncDate: new Date()
        };
        return shortcutInfo;
    }


    async createUnityShortcut(item: ItemReference, conf: UnityCatalogItemDefinition, shortcutInfo: ShortcutInfo): Promise<Shortcut> {

        // configure the fabric Shortcut Information
        const shortcutName = `${conf.fabricConfig?.shortcutPrefix || DEFAULT_SHORTCUT_PREFIX}_${shortcutInfo.unityCatalog.catalogName}_${shortcutInfo.unityCatalog.schemaName}_${shortcutInfo.unityCatalog.tableName}`;

        const without_scheme = shortcutInfo.unityCatalog.tableLocation.replace("abfss://", "");
        // Extract the storage account name and the rest of the path
        const container_end = without_scheme.indexOf("@");
        const container = without_scheme.slice(0, container_end);
        const remainder = without_scheme.slice(container_end + 1);

        const account_end = remainder.indexOf("/");
        const storage_account = remainder.slice(0, account_end);
        const path = remainder.slice(account_end + 1);
        const https_path = `https://${storage_account}/${container}`;

        shortcutInfo.fabric = {
            //at the moment alway use the current item as shortcut location
            workspaceId: item.workspaceId,
            id: item.id,
            name: shortcutName,
            targetPath: path,
            connectionId: conf.fabricConfig?.connectionId,
            location: https_path,
            subpath: path
        } as ShortcutInfoFabric;

        const shortcutRequest = this.createShortcutRequrest(shortcutInfo)
        return await this.fabricAPIClient.shortcuts.createShortcut(
            shortcutInfo.fabric.workspaceId,
            shortcutInfo.fabric.id,
            shortcutRequest
        )
    }

    private createShortcutRequrest(shortcutInfo: ShortcutInfo): CreateShortcutRequest {
        switch(shortcutInfo.unityCatalog.dataSourceFormat){
            case "DELTA":
                return {
                    name: shortcutInfo.fabric.name,
                    path: `Tables/${shortcutInfo.unityCatalog.tableName}`,
                    target: {
                        adlsGen2: {
                            connectionId: shortcutInfo.fabric.connectionId,
                            location: shortcutInfo.fabric.location,
                            subpath: shortcutInfo.fabric.subpath
                            }
                        },
                    };
            case "CSV":
                return {
                    name: shortcutInfo.fabric.name,
                    path: `Tables/${shortcutInfo.unityCatalog.tableName}`,
                    target: {
                        adlsGen2: {
                            connectionId: shortcutInfo.fabric.connectionId,
                            location: shortcutInfo.fabric.location,
                            subpath: shortcutInfo.fabric.subpath
                            }
                        },
                    transform:  {
                        type: 'csvToDelta',
                        properties: {
                            delimiter: ",",
                            useFirstRowAsHeader: true,
                            skipFilesWithErrors: false
                        }
                    }
                    } as CreateShortcutWithTransformRequest;
            default:
                throw new Error(`Data Source format of ${shortcutInfo.unityCatalog.dataSourceFormat} not supported`);
        }
    }

    async deleteShortcut(shortcutInfo: ShortcutInfo) {
        this.fabricAPIClient.shortcuts.deleteShortcut(
            shortcutInfo.fabric.workspaceId,
            shortcutInfo.fabric.id,
            shortcutInfo.fabric.shortcutPath,
        )
    }

    private generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }

}