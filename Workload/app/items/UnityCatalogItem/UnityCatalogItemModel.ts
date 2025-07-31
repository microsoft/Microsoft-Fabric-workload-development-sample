import { ItemReference } from "../../controller/ItemCRUDController";

export const DEFAULT_SHORTCUT_PREFIX = "uc";
export const UNITY_PROXY_URL = "http://localhost:60006/api/unity-catalog";

export interface ShortcutInfo {
    id: string,
    fabric?: ShortcutInfoFabric;
    unityCatalog: ShortcutInfoUnityCatalog,
    status: 'active' | 'failed' | 'creating';
    createdDate: Date;
    lastSyncDate?: Date;
    error?: string;
}

export interface ShortcutInfoFabric extends ItemReference {
    name: string;
    targetPath: string;
    location: string;
    subpath: string;
    shortcutPath: string;
    connectionId: string;
}

export interface ShortcutInfoUnityCatalog {
    catalogName: string;
    schemaName: string;
    tableName: string;
    dataSourceFormat: 'DELTA' | 'CSV';
    tableLocation: string;
}

export interface UnityCatalogConfig {
    databrickURL: string;
    databricksToken: string;
    databricksConnectionId?: string;
    catalog: string;
    schemas: string[];
    connectionId: string;
    considerTableChanges: boolean;
}

export interface FabricConfig {
    shortcutPrefix: string
    connectionId: string;
}

export interface UnityCatalogItemDefinition {
    unityConfig?: UnityCatalogConfig;
    fabricConfig?: FabricConfig;
    shortcuts?: ShortcutInfo[];
    lastSyncDate?: Date;
}
