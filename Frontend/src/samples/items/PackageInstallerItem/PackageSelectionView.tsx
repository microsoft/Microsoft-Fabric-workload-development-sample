import React from "react";
import { Card, CardHeader, CardPreview, Text, Body1, Button } from "@fluentui/react-components";
import { Stack } from "@fluentui/react";
import { SolutionConfigurationsArray, Package, } from "./PackageInstallerItemModel";

export interface PackageInstallerSelectionViewProps {
  onPackageSelected: (packageId: string) => void;
}
export const PackageSelectionView: React.FC<PackageInstallerSelectionViewProps> = (
  { onPackageSelected: onPackageSelected }) => {

  return (
    <Stack>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
        gap: "20px", 
        padding: "20px" 
      }}>
        {SolutionConfigurationsArray.map((pack: Package) => (
          <Card
            key={pack.typeId}
            style={{ cursor: "pointer", height: "100%" }}
            onClick={() => onPackageSelected(pack.typeId)}
          >
            <CardPreview>
              <img
                src={pack.icon}
                alt={pack.name}
                style={{ width: "100%", height: "160px", objectFit: "cover" }}
              />
            </CardPreview>
            <CardHeader
              header={
                <Text weight="semibold" size={500}>
                  {pack.name}
                </Text>
              }
              description={
                <Body1>{pack.description}</Body1>
              }
            />
            <div style={{ padding: "0 16px 16px", marginTop: "auto" }}>
              <Button appearance="primary" onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onPackageSelected(pack.typeId);
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