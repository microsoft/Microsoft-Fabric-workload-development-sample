import { NotificationType, WorkloadClientAPI } from "@ms-fabric/workload-client";
import { callNotificationOpen } from "../../../../implementation/controller/NotificationController";
import { callNavigationNavigate } from "../../../../implementation/controller/NavigationController";
import { GenericItem } from "../../../../implementation/models/ItemCRUDModel";
import { Beaker24Regular, BrainCircuit24Regular, ChartMultiple24Regular, Code24Regular, Database24Regular, DatabaseSearch24Regular, DataTrending24Regular, DocumentDatabase24Regular, DocumentTable24Regular, Notebook24Regular, Question24Regular, Stream24Regular } from "@fluentui/react-icons";
import React from "react";


// Function to navigate to a created item
  export async function handleItemClick(workloadClient: WorkloadClientAPI, item: GenericItem) {
    console.log('handleItemClick called with item:', item);
    
    try {
      // Validate required fields to prevent undefined values in URL
      if (!item || !item.workspaceId || !item.type || !item.id) {
        console.warn('Invalid item data:', item);
        callNotificationOpen(
          workloadClient,
          "Navigation Error",
          "Cannot open item: Missing required information (workspace, type, or ID)",
          NotificationType.Error,
          undefined
        );
        return;
      }

      await callNavigationNavigate(workloadClient, 
        "host",
        `/groups/${item.workspaceId}/${item.type}/${item.id}`);
      console.log('Successfully called CallOpenInNewBrowserTab for item');
    } catch (error) {
      console.error(`Error navigating to item ${item?.id}:`, error);
      callNotificationOpen(
        workloadClient,
        "Navigation Error",
        `Failed to open item: ${error.message || error}`,
        NotificationType.Error,
        undefined
      );
    }
  };


  // Function to get icon component for a given item type
  export function getItemTypeIcon(itemType: string): React.JSX.Element {
    switch (itemType.toLowerCase()) {
      case "notebook":
        return React.createElement(Notebook24Regular);
      case "report":
        return React.createElement(ChartMultiple24Regular);
      case "semanticmodel":
      case "semantic model":
        return React.createElement(DocumentDatabase24Regular);
      case "lakehouse":
        return React.createElement(Database24Regular);
      case "warehouse":
        return React.createElement(DocumentTable24Regular);
      case "kqldatabase":
      case "kql database":
        return React.createElement(DatabaseSearch24Regular);
      case "kqlqueryset":
      case "kql queryset":
        return React.createElement(Code24Regular);
      case "kqldashboard":
      case "kql dashboard":
      case "realtimedashboard":
      case "real-time dashboard":
        return React.createElement(ChartMultiple24Regular);
      case "datapipeline":
      case "data pipeline":
        return React.createElement(DataTrending24Regular);
      case "dataflow":
      case "dataflow gen2":
        return React.createElement(Stream24Regular);
      case "mlmodel":
      case "ml model":
        return React.createElement(BrainCircuit24Regular);
      case "mlexperiment":
      case "ml experiment":
        return React.createElement(Beaker24Regular);
      case "sparkjobdefinition":
      case "spark job definition":
        return React.createElement(Code24Regular);
      case "environment":
        return React.createElement(DocumentDatabase24Regular);
      case "eventhouse":
      case "event house":
        return React.createElement(DatabaseSearch24Regular);
      case "eventstream":
      case "event stream":
        return React.createElement(Stream24Regular);
      case "dashboard":
        return React.createElement(ChartMultiple24Regular);
      default:
        return React.createElement(Question24Regular);
    }
  }



