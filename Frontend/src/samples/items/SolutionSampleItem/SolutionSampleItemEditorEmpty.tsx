import React from "react";
import { Stack } from "@fluentui/react";
import { Text } from "@fluentui/react-components";
import "./../../../styles.scss";
import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { GenericItem } from "../../../workload/models/ItemCRUDModel";
import { SolutionSampleItemDefinition } from "./SolutionSampleItemModel";
import { SolutionConfigurationSelectionView } from "./SolutionConfigurationSelectionView";

interface SolutionSampleItemEmptyStateProps {
  workloadClient: WorkloadClientAPI,
  item: GenericItem;
  itemDefinition: SolutionSampleItemDefinition,
  onFinishEmpty: (solutionTypeId: string) => void;
}

export const SolutionSampleItemEmpty: React.FC<SolutionSampleItemEmptyStateProps> = ({
  workloadClient,
  item,
  itemDefinition: definition,
  onFinishEmpty
}) => {

  // Handle solution selection
  const handleSolutionSelected = (solutionTypeId: string) => {
    console.log(`Selected solution: ${solutionTypeId}`);
    onFinishEmpty(solutionTypeId);
  };

  
  return (
    <Stack className="empty-item-container" horizontalAlign="center" tokens={{ childrenGap: 16 }}>
      <Stack.Item>
        <img
          src="/assets/samples/items/SolutionSampleItem/EditorEmpty.png"
          alt="Empty item illustration"
          className="empty-item-image"
        />
      </Stack.Item>
      <Stack.Item>
        <Text as="h2" size={800} weight="semibold">
          Select a Solution that should be created
        </Text>
      </Stack.Item>
      <Stack.Item style={{ width: '100%' }}>
        <SolutionConfigurationSelectionView onSolutionSelected={handleSolutionSelected} />
      </Stack.Item>
    </Stack>
  );
};
