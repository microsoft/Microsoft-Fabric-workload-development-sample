import {
    WorkloadClientAPI,
} from "@ms-fabric/workload-client";

import { Calculation, CalculationOperator, CalculationResult, CalculatorSampleItemDefinition } from "./CalculatorSampleItemModel";
import { readOneLakeFileAsText, getOneLakeFilePath, writeToOneLakeFileAsText, checkIfFileExists } from "../../controller/OneLakeController";
import { WorkloadItem } from "../../../workload/models/ItemCRUDModel";
import { GenericItemAndPath } from "../../../workload/models/DataHubModel";
import { OneLakeShortcutCreateRequest, OneLakeShortcutCreateResponse, OneLakeShortcutTargetOneLake } from "../../views/SampleOneLakeShortcutCreator/SampleOneLakeShortcutModel";
import { createOneLakeShortcut } from "../../views/SampleOneLakeShortcutCreator/SampleOneLakeShortcutController";


/**
 * Saves the calculation result to OneLake and updates the item defintion.
 *
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {WorkloadItem<CalculatorSampleItemDefinition>} item - The workload item to update.
 * @param {CalculationResult} calculation - The calculation result to save.
 * @returns {Promise<CalculatorSampleItemDefinition>} - The updated item definiton after saving the calculation result.
 */
export async function createCalculationShortcut(workloadClient: WorkloadClientAPI, item: WorkloadItem<CalculatorSampleItemDefinition>, 
    source: GenericItemAndPath): Promise<OneLakeShortcutCreateResponse> {
    const target: OneLakeShortcutTargetOneLake = {
        oneLake: {
            workspaceId: item.workspaceId,
            itemId: item.id,
            path: "Files/CalcResults",
        }
    };
    const shortcutRequest: OneLakeShortcutCreateRequest = {
        path: source.selectedPath || "Files",
        name: "CalcResults",
        target: target
    };
    return createOneLakeShortcut(workloadClient, source.workspaceId, source.id, shortcutRequest);
}

/**
 * Saves the calculation result to OneLake and updates the item definition.
 *
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {WorkloadItem<CalculatorSampleItemDefinition>} item - The workload item to update.
 * @param {CalculationResult} calculation - The calculation result to save.
 * @returns {Promise<CalculatorSampleItemDefinition>} - The updated item definition after saving the calculation result.
 */
export async function saveCalculationResult(workloadClient: WorkloadClientAPI, item: WorkloadItem<CalculatorSampleItemDefinition>, calculation: CalculationResult): Promise<CalculatorSampleItemDefinition> {    
    const result = calculateResult(calculation);
    const fileName = `CalcResults/Calculation-${result.calculationTime.toUTCString() + ""}.json`;
    const filePath = getOneLakeFilePath(item.workspaceId, item.id, fileName)
    await writeToOneLakeFileAsText(workloadClient, filePath, JSON.stringify(result));
    const newItemDefinition: CalculatorSampleItemDefinition = {
        operand1: calculation.operand1,
        operand2: calculation.operand2,
        operator: calculation.operator,        
        lastResultFile: fileName,
    }
    saveCalculationToHistory(workloadClient, item, result);
    return newItemDefinition
}

/**
 * Loads the calculation result from OneLake for a given workload item
 * 
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {WorkloadItem<CalculatorSampleItemDefinition>} item - The workload item from which to load the calculation result.
 * @returns {Promise<CalculationResult>} - The loaded calculation result.
 */
export async function loadCalculationResult(workloadClient: WorkloadClientAPI, item: WorkloadItem<CalculatorSampleItemDefinition>): Promise<CalculationResult> {
    const fileName = item.definition?.lastResultFile;
    const filePath = getOneLakeFilePath(item.workspaceId, item.id, fileName);
    const result = await readOneLakeFileAsText(workloadClient, filePath);
    return JSON.parse(result)
}

/** 
 * Saves the calculation result to the history file in OneLake.
 *
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {WorkloadItem<CalculatorSampleItemDefinition>} item - The workload item to update.
 * @param {CalculationResult} calculationResult - The calculation result to save.
 * @returns {Promise<void>} - A promise that resolves when the calculation result is saved.
 */
export async function saveCalculationToHistory(workloadClient: WorkloadClientAPI, item: WorkloadItem<CalculatorSampleItemDefinition>, calculationResult: CalculationResult): Promise<void> {
   const fileName = "CalcResults/CalculationHistory.csv";
   const filePath = getOneLakeFilePath(item.workspaceId, item.id, fileName);
   const fileExist = await checkIfFileExists(workloadClient, filePath)
   var data = "";
   if (!fileExist) {
         // If the file does not exist, create it with a header
         data = "Operand1;Operand2;Operator;Result;CalculationTime\n";
}
   data += `${calculationResult.operand1};${calculationResult.operand2};${calculationResult.operator};${calculationResult.result};\"${calculationResult.calculationTime.toUTCString()}\"\n`;
   await writeToOneLakeFileAsText(workloadClient, filePath, data);
}

/** 
 * Loads the calculation history from OneLake for a given workload item.
 *
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.    
 * @param {WorkloadItem<CalculatorSampleItemDefinition>} item - The workload item from which to load the calculation history.
 * @returns {Promise<CalculationResult[]>} - A promise that resolves to an array of calculation results.
 */
export async function loadCalculationHistory(workloadClient: WorkloadClientAPI, item: WorkloadItem<CalculatorSampleItemDefinition>): Promise<CalculationResult[]> {
    var retVal: CalculationResult[];
    const fileName = "CalcResults/CalculationHistory.csv";
    const filePath = getOneLakeFilePath(item.workspaceId, item.id, fileName);
    const result = await readOneLakeFileAsText(workloadClient, filePath);
    const lines = result.split(/\r\n|\n|\r/);
    lines.map(line => {
        const parts = line.split(";");
        if (parts.length < 5) {
            console.warn(`Skipping invalid line in calculation history: ${line}`);
            return;
        } else {
            const calculation: CalculationResult = {
                operand1: parseFloat(parts[0]),
                operand2: parseFloat(parts[1]),
                operator: CalculationOperator[parts[2] as keyof typeof CalculationOperator],
                result: parseFloat(parts[3]),
                calculationTime: new Date(parts[4])
            };
            retVal.push(calculation);
        }
    });
    return retVal;
}


export function calculateResult(calculation: Calculation): CalculationResult {
    const result: number = calculateResultInt(calculation);
    return {    
        operand1: calculation.operand1,
        operand2: calculation.operand2,
        operator: calculation.operator,
        result: result,
        calculationTime: new Date(),
    }
}

function calculateResultInt(data: Calculation): number {
    switch (data?.operator) {
        case CalculationOperator.Add:
            return data?.operand1 + data?.operand2;
        case CalculationOperator.Subtract:
            return data?.operand1 - data?.operand2;
        case CalculationOperator.Multiply:
            return data?.operand1 * data?.operand2;
        case CalculationOperator.Divide:
            if (data?.operand2 !== 0) {
                return data?.operand1 / data?.operand2;
            } else {
                throw new Error("Cannot divide by zero.");
            }
        case CalculationOperator.Random:
            // Math.random() returns a float between 0 and 1, so we use Math.floor and scale
            const min = Math.min(data?.operand1, data?.operand2);
            const max = Math.max(data?.operand1, data?.operand2);
            const rand = Math.floor(Math.random() * (max - min + 1)) + min;
            return  rand;
        default:
            throw new Error(`Unsupported operator: ${data?.operator}`);
    }
}


