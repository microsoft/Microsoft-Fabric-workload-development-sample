// --- Navigation API

import { WorkloadClientAPI, BeforeNavigateAwayData, BeforeNavigateAwayResult, AfterNavigateAwayData, OpenBrowserTabParams } from "@ms-fabric/workload-client";
import { GenericItem } from "../models/ItemCRUDModel";

/**
 * Calls the 'navigation.navigate' function from the WorkloadClientAPI to navigate to a target (host or workload) and path.
 *
 * @param {T} target - The target location to navigate to ('host' or 'workload').
 * @param {string} path - The path or route to navigate to.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function callNavigationNavigate<T extends 'host' | 'workload'>(
    workloadClient: WorkloadClientAPI,
    target: T,
    path: string) {

    await workloadClient.navigation.navigate(target, { path });
}

/**
 * Helper function to navigate to a specific item based on its type and ID.
 * This function uses the `callNavigationNavigate` method to construct the correct URL based on the item type.
 * @param workloadClient The WorkloadClientAPI instance
 * @param item The item to navigate to
 */
export async function navigateToItem(workloadClient: WorkloadClientAPI, item: GenericItem) {
    const path = getFrontendPath(item.type, item.workspaceId, item.id);
    if (path) {
        await callNavigationNavigate(workloadClient, "host", path);
    } else {
        // Fallback for unrecognized item types
        await callNavigationNavigate(workloadClient, "host", `/groups/${item.workspaceId}/${item.type}/${item.id}`);
    }
}

/** * Navigates to a specific workspace using the WorkloadClientAPI.
 *
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {string} workspaceId - The ID of the workspace to navigate to.
 */
export async function navigateToWorkspace(workloadClient: WorkloadClientAPI, workspaceId: string) {
    await callNavigationNavigate(workloadClient, "host", `/groups/${workspaceId}`);
}

/**
 * Calls the 'navigation.onBeforeNavigateAway' function from the WorkloadClientAPI
 * to register a callback preventing navigation to a specific URL.
 *
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function callNavigationBeforeNavigateAway(workloadClient: WorkloadClientAPI) {
    // Define a callback function to prevent navigation to URLs containing 'forbidden-url'
    const callback: (event: BeforeNavigateAwayData) => Promise<BeforeNavigateAwayResult> =
        async (event: BeforeNavigateAwayData): Promise<BeforeNavigateAwayResult> => {
            // Return a result indicating whether the navigation can proceed
            return { canLeave: !event.nextUrl?.includes("forbidden-url") };
        };

    // Register the callback using the 'navigation.onBeforeNavigateAway' function
    await workloadClient.navigation.onBeforeNavigateAway(callback);
}

/**
 * Registers a callback to trigger after navigating away from page
 * using the 'navigation.onAfterNavigateAway' function.
 *
 * @param {(event: AfterNavigateAwayData) => Promise<void>} callback - A call back function that executes after navigation away.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function callNavigationAfterNavigateAway(
    workloadClient: WorkloadClientAPI,
    callback: (event: AfterNavigateAwayData) => Promise<void>,
    ) {
    // Register the callback using the 'navigation.onAfterNavigateAway' function
    await workloadClient.navigation.onAfterNavigateAway(callback);
}

/**
 * Calls the 'navigation.openBrowserTab' function from the WorkloadClientAPI to navigate to a url in a new tab.
 *
 * @param {string} path - The path or route to navigate to.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function callNavigationOpenInNewBrowserTab(
    workloadClient: WorkloadClientAPI,
    path: string,
    ) {
    try {
        var params: OpenBrowserTabParams = {
            url: path,
            queryParams: {
                key1: "value1",
            }
        }
        await workloadClient.navigation.openBrowserTab(params);
    } catch (err) {
        console.error(err);
    }
}


/**
 * FabricItemMappingDictionary
 * 
 * This dictionary maps Fabric item types to their frontend paths and icons.
 * It can be used for navigation, UI rendering, and other item-specific operations.
 */

interface FabricItemMapping {
  /**
   * The frontend path pattern where {workspaceId} and {itemId} will be replaced with actual values
   */
  frontendTypePath: string;
  
  apiType: string;
}

/**
 * Dictionary mapping Fabric item types to their frontend paths and icons
 */
const FabricItemMappings: Record<string, FabricItemMapping> = {
  // Core Fabric items
  "ApacheAirflowJob": {
    frontendTypePath: "apacheairflowprojects",
    apiType: "ApacheAirflowJob"
  },
  "CopyJob": {
    frontendTypePath: "copyjobs",
    apiType: "CopyJob"
  },
  "Dashboard": {
    frontendTypePath: "dashboards",
    apiType: "Dashboard"
  },
  "Dataflow": {
    frontendTypePath: "dataflows-gen2",
    apiType: "Dataflow"
  },
  "Datamart": {
    frontendTypePath: "",
    apiType: "Datamart"
  },
  "DataPipeline": {
    frontendTypePath: "pipelines",
    apiType: "DataPipeline"
  },
  "DigitalTwinBuilder": {
    frontendTypePath: "",
    apiType: "DigitalTwinBuilder"
  },
  "DigitalTwinBuilderFlow": {
    frontendTypePath: "",
    apiType: "DigitalTwinBuilderFlow"
  },
  "Environment": {
    frontendTypePath: "synapseenvironments",
    apiType: "Environment"
  },
  "Eventhouse": {
    frontendTypePath: "eventhouses",
    apiType: "Eventhouse"
  },
  "Eventstream": {
    frontendTypePath: "eventstreams",
    apiType: "Eventstream"
  },
  "GraphQLApi": {
    frontendTypePath: "graphql",
    apiType: "GraphQLApi"
  },
  "KQLDashboard": {
    frontendTypePath: "kustodashboards",
    apiType: "KQLDashboard"
  },
  "KQLDatabase": {
    frontendTypePath: "kqldatabases",
    apiType: "KQLDatabase"
  },
  "KQLQueryset": {
    frontendTypePath: "queryworkbenches",
    apiType: "KQLQueryset"
  },
  "Lakehouse": {
    frontendTypePath: "lakehouses",
    apiType: "Lakehouse"
  },
  "MirroredAzureDatabricksCatalog": {
    frontendTypePath: "mirroredazuredatabrickscatalogs",
    apiType: "MirroredAzureDatabricksCatalog"
  },
  "MirroredDatabase": {
    frontendTypePath: "mirroreddatabases",
    apiType: "MirroredDatabase"
  },
  "MirroredWarehouse": {
    frontendTypePath: "mirroredwarehouses",
    apiType: "MirroredWarehouse"
  },
  "MLExperiment": {
    frontendTypePath: "mlexperiments",
    apiType: "MLExperiment"
  },
  "MLModel": {
    frontendTypePath: "mlmodels",
    apiType: "MLModel"
  },
  "MountedDataFactory": {
    frontendTypePath: "",
    apiType: "MountedDataFactory"
  },
  "Notebook": {
    frontendTypePath: "synapsenotebooks",
    apiType: "Notebook"
  },
  "PaginatedReport": {
    frontendTypePath: "datasets",
    apiType: "PaginatedReport"
  },
  "Reflex": {
    frontendTypePath: "reflexes",
    apiType: "Reflex"
  },
  "Report": {
    frontendTypePath: "reports",
    apiType: "Report"
  },
  "SemanticModel": {
    frontendTypePath: "semanticmodels",
    apiType: "SemanticModel"
  },
  "SparkJobDefinition": {
    frontendTypePath: "sparkjobdefinitions",
    apiType: "SparkJobDefinition"
  },
  "SQLDatabase": {
    frontendTypePath: "sqldatabases",
    apiType: "SQLDatabase"
  },
  "SQLEndpoint": {
    frontendTypePath: "lakewarehouses",
    apiType: "SQLEndpoint"
  },
  "VariableLibrary": {
    frontendTypePath: "variable-libraries",
    apiType: "VariableLibrary"
  },
  "Warehouse": {
    frontendTypePath: "warehouses",
    apiType: "Warehouse"
  },
  "WarehouseSnapshot": {
    frontendTypePath: "",
    apiType: "WarehouseSnapshot"
  }
};

/**
 * Gets the frontend path for a specific item type and replaces placeholders with actual values
 * 
 * @param itemType The type of item
 * @param workspaceId The workspace ID
 * @param itemId The item ID
 * @returns The complete frontend path or undefined if the item type is not recognized
 */
function getFrontendPath(itemType: string, workspaceId: string, itemId: string): string | undefined {
  const mapping = FabricItemMappings[itemType];
  let frontendPath = mapping?.frontendTypePath;
  if(!frontendPath) {
    frontendPath = itemType.toLowerCase() + "s";
  }
  return `/groups/${workspaceId}/${frontendPath}/${itemId}`
}