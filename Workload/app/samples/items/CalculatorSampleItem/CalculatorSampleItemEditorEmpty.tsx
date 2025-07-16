import React, { useState } from "react";
import { Stack } from "@fluentui/react";
import {
  Text,
  Button,
  Combobox,
  Input,
  Option,
} from "@fluentui/react-components";
import "../../../styles.scss";
import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { GenericItem } from "../../../implementation/models/ItemCRUDModel";
import { CalculationOperator, CalculatorSampleItemDefinition } from "./CalculatorSampleItemModel";


interface CalculatorSampleItemEmptyStateProps {
  workloadClient: WorkloadClientAPI,
  item: GenericItem;
  itemDefinition: CalculatorSampleItemDefinition,
  onFinishEmpty: (operand1: number, operand2: number, operator: CalculationOperator) => void;
}

export const CalculatorSampleItemEmpty: React.FC<CalculatorSampleItemEmptyStateProps> = ({
  workloadClient,
  item,
  itemDefinition: definition,
  onFinishEmpty: onFinishEmpty
}) => {
  const [operand1, setOperand1] = useState<number>(1);
  const [operand2, setOperand2] = useState<number>(2);
  const [operator, setOperator] = useState<CalculationOperator>(CalculationOperator.Add);
  
  const saveItem = () => {
    onFinishEmpty(operand1, operand2, operator);
  };

  async function onOperand1InputChanged(value: number) {
      setOperand1(value);      
    }
  
    async function onOperand2InputChanged(value: number) {
      setOperand2(value);
    }
  
    function onOperatorInputChanged(value: string | null) {
      const operatorValue = CalculationOperator[value as keyof typeof CalculationOperator] || CalculationOperator.Undefined;
      setOperator(operatorValue);
    }
  
  return (
    <Stack className="empty-item-container" horizontalAlign="center" tokens={{ childrenGap: 16 }}>
      <Stack.Item>
        <img
          src="/assets/samples/items/CalculatorSampleItem/EditorEmpty.png"
          alt="Empty definition illustration"
          className="empty-item-image"
        />
      </Stack.Item>
      <Stack.Item>
        <Text as="h2" size={800} weight="semibold">
          Your item has been created!
        </Text>
      </Stack.Item>
      <Stack.Item style={{ marginTop: '16px', marginBottom: '24px' }}>
        <Text>
          {"Start calculating in " + item.displayName}
        </Text>
      </Stack.Item>
      <Stack.Item style={{ width: '400px', marginTop: '16px' }}>
        <Stack horizontal horizontalAlign="center" tokens={{ childrenGap: 8 }}>
          <Stack.Item style={{ width: '120px' }}>
            <Input
              type="number"
              placeholder="1"
              value={operand1.toString()}
              onChange={(e, data) =>
                onOperand1InputChanged(parseInt(data.value))
              }
              data-testid="operand1-input"
              style={{ width: '100%' }}
            />
          </Stack.Item>
          <Stack.Item style={{ width: '280px' }}>
            <Combobox
              data-testid="operator-combobox"
              value={operator == CalculationOperator.Undefined ? "" : CalculationOperator[operator]}
              onOptionSelect={(_, opt) =>
                onOperatorInputChanged(opt.optionValue)
              }
              style={{ width: '100px' }}
            >
              {
                Object.keys(CalculationOperator).filter(key => isNaN(Number(key))).map(
                  (option) => (
                    <Option key={option} text={option} value={option}>{option}</Option>
                  ))}
            </Combobox>
          </Stack.Item>
          <Stack.Item style={{ width: '120px' }}>
            <Input
              type="number"
              placeholder="2"
              value={operand2.toString()}
              onChange={(e, data) =>
                onOperand2InputChanged(parseInt(data.value))
              }
              data-testid="operand2-input"
              style={{ width: '100%' }}
            />
          </Stack.Item>
        </Stack>
      </Stack.Item>
      <Stack.Item style={{ marginTop: '16px' }}>
        <Button appearance="primary" onClick={saveItem}>
          Calculate and Save
        </Button>
      </Stack.Item>
    </Stack>
  );
};
