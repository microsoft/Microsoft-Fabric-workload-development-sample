import { WorkloadClientAPI } from "@ms-fabric/workload-client";

export interface TabContentProps {
    workloadClient: WorkloadClientAPI;
    sampleWorkloadName?: string;
    //sampleItem?: WorkloadItem<CalculatorSampleItemMetadata>;
}
