import { CalculationOperator, CalculatorSampleItemDefinition } from "./samples/items/CalculatorSampleItem/CalculatorSampleItemModel";

export enum EnvironmentConstants {
    FabricApiBaseUrl = "https://api.fabric.microsoft.com",
    OneLakeDFSBaseUrl= "https://onelake.dfs.fabric.microsoft.com",
}

export const defaultCalculatorSampleItemDefinition: CalculatorSampleItemDefinition = {
    operand1: 0,
    operand2: 0,
    operator: CalculationOperator.Undefined,
    lastResultFile: null
}






