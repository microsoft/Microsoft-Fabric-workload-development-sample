import React from "react";
import { Card, CardHeader, CardPreview, Text, Body1, Button } from "@fluentui/react-components";
import { Stack } from "@fluentui/react";
import { PackageInstallerContext } from "./package/PackageInstallerContext";
import { Package } from "./PackageInstallerItemModel";

export interface PackageInstallerSelectionViewProps {
  context: PackageInstallerContext,
  onPackageSelected: (packageId: string) => void;
}
export const PackageSelectionView: React.FC<PackageInstallerSelectionViewProps> = (
  { 
    context,
    onPackageSelected: onPackageSelected }) => {

  return (
    <Stack>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
        gap: "20px", 
        padding: "20px",
        justifyContent: "center",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {context.packageRegistry.getPackagesArray().map((pack: Package) => (
          <Card
            key={pack.id}
            style={{ cursor: "pointer", height: "100%", maxWidth: "300px" }}
            onClick={() => onPackageSelected(pack.id)}
          >
            <CardPreview>
              <img
                src={pack.icon}
                alt={pack.displayName}
                style={{ width: "100%", height: "160px", objectFit: "cover" }}
              />
            </CardPreview>
            <CardHeader
              header={
                <Text weight="semibold" size={500}>
                  {pack.displayName}
                </Text>
              }
              description={
                <Body1>{pack.description}</Body1>
              }
            />
            <div style={{ padding: "0 16px 16px", marginTop: "auto" }}>
              <Button appearance="primary" onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onPackageSelected(pack.id);
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