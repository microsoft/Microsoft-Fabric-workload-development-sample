import React from "react";
import { Stack } from "@fluentui/react";
import { Text } from "@fluentui/react-components";
import "./../../../styles.scss";
import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { GenericItem } from "../../../workload/models/ItemCRUDModel";
import { PackageInstallerItemDefinition } from "./PackageInstallerItemModel";
import { PackageSelectionView } from "./PackageSelectionView";

interface PackageInstallerItemEmptyStateProps {
  workloadClient: WorkloadClientAPI,
  item: GenericItem;
  itemDefinition: PackageInstallerItemDefinition,
  onPackageSelected: (packageId: string) => void;
}

export const PackageInstallerItemEditorEmpty: React.FC<PackageInstallerItemEmptyStateProps> = ({
  workloadClient,
  item,
  itemDefinition: definition,
  onPackageSelected: onPackageSelected
}) => {

  // Handle deployment selection
  const handlePackageSelected = (packageId: string) => {
    console.log(`Selected a package: ${packageId}`);
    onPackageSelected(packageId);
  };

  
  return (
    <Stack className="empty-item-container" horizontalAlign="center" tokens={{ childrenGap: 16 }}>
      <Stack.Item>
        <img
          src="/assets/samples/items/PackageInstallerItem/EditorEmpty.png"
          alt="Empty item illustration"
          className="empty-item-image"
        />
      </Stack.Item>
      <Stack.Item>
        <Text as="h2" size={800} weight="semibold">
          Select a package that should be deploymed
        </Text>
      </Stack.Item>
      <Stack.Item style={{ width: '100%' }}>
        <PackageSelectionView onPackageSelected={handlePackageSelected} />
      </Stack.Item>
    </Stack>
  );
};
