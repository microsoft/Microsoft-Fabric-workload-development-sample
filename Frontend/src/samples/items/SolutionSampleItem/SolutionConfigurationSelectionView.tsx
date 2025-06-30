import React from "react";
import { Card, CardHeader, CardPreview, Text, Body1, Button } from "@fluentui/react-components";
import { Stack } from "@fluentui/react";
import { AvailableSolutionConfigurations, SolutionConfiguration, SolutionType,  } from "./SolutionSampleItemModel";

export interface SolutionTilesProps {
  onSolutionSelected: (solutionType: SolutionType) => void;
}
export const SolutionConfigurationSelectionView: React.FC<SolutionTilesProps> = (
  { onSolutionSelected }) => {

  return (
    <Stack>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
        gap: "20px", 
        padding: "20px" 
      }}>
        {AvailableSolutionConfigurations.map((solution: SolutionConfiguration) => (
          <Card
            key={solution.type}
            style={{ cursor: "pointer", height: "100%" }}
            onClick={() => onSolutionSelected(solution.type)}
          >
            <CardPreview>
              <img
                src={solution.icon}
                alt={solution.name}
                style={{ width: "100%", height: "160px", objectFit: "cover" }}
              />
            </CardPreview>
            <CardHeader
              header={
                <Text weight="semibold" size={500}>
                  {solution.name}
                </Text>
              }
              description={
                <Body1>{solution.description}</Body1>
              }
            />
            <div style={{ padding: "0 16px 16px", marginTop: "auto" }}>
              <Button appearance="primary" onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onSolutionSelected(solution.type);
              }}>
                Select
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Stack>
  );
};