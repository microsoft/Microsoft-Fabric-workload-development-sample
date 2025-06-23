
/**
 * Calculator Sample Workload Model
 * This model defines the structure of calculations and results for the Calculator Sample Workload. 
 */
export interface Calculation {
    operand1: number;
    operand2: number;
    operator: CalculationOperator;
}

/**
 * Calculator Sample Item State
 * This interface extends the Calculation interface and includes a property for the last result file.   
 * It is used as the state object for the Calculator Sample Item Editor.
 */
export interface CalculatorSampleItemState extends Calculation {
    lastResultFile: string;
}

/**
 * Calculation Result
 * This interface extends the Calculation interface and includes properties for the result and calculation time.
 * It is used to represent the result of a calculation performed in the Calculator Sample Workload.
 * It includes the result of the calculation and the time when the calculation was performed.
 * It is used to store the result of a calculation and the time when the calculation was performed.
 * It is used to represent the result of a calculation performed in the Calculator Sample Workload.
 */
export interface CalculationResult extends Calculation {
    result: number;
    calculationTime: Date;
}

/**
 * Calculation Operator Enum
 * This enum defines the different operators that can be used in calculations.
 * It includes operators for addition, subtraction, multiplication, division, and random calculations.
 * The Undefined operator is used to indicate that no operator has been selected.
 */
export enum CalculationOperator {
    Undefined,
    Add,
    Subtract,
    Multiply,
    Divide,
    Random,
}
