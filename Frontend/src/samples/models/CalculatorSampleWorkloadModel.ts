
export interface Calculation {
    operand1: number;
    operand2: number;
    operator: CalculationOperator;
}

export interface CalculatorSampleItemState extends Calculation {
    lastResultFile: string;
}

export interface CalculationResult extends Calculation {
    result: number;
    calculationTime: Date;
}

export enum CalculationOperator {
    Undefined = 0,
    Add = 1,
    Subtract = 2,
    Multiply = 3,
    Divide = 4,
    Random = 5,
}
