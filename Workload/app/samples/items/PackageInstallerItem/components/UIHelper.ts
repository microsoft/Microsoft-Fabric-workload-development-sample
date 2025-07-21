import { Beaker24Regular, BrainCircuit24Regular, ChartMultiple24Regular, Code24Regular, Database24Regular, DatabaseSearch24Regular, DataTrending24Regular, DocumentDatabase24Regular, DocumentTable24Regular, Notebook24Regular, Question24Regular, Stream24Regular } from "@fluentui/react-icons";
import React from "react";


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
      case "eventstream":
      case "event stream":
        return React.createElement(Stream24Regular);
      case "dashboard":
        return React.createElement(ChartMultiple24Regular);
      default:
        return React.createElement(Question24Regular);
    }
  }



