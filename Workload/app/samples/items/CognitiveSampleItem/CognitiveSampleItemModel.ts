import { ItemReference } from "src/workload/models/ItemCRUDModel";


export interface CognitiveSampleItemDefinition  {
  configurations: CognitiveSampleAnalysisConfiguration[];
}

export enum CognitiveSampleAnalysisType {
  SentimentAnalysis = "SentimentAnalysis",
}

export interface CognitiveSampleAnalysisConfiguration extends ItemReference {
  tableName: string;
  sourceColumnName: string; 
  resultColumnName: string;
  analysisType: CognitiveSampleAnalysisType;

  lastBatchId?: string;
}
