import React from "react";
import { Stack } from "@fluentui/react";
import { Text, Button } from "@fluentui/react-components";
import "../../styles.scss";
import { useTranslation } from "react-i18next";
import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { ItemWithDefinition } from "../../controller/ItemCRUDController";
import { HelloWorldItemDefinition } from "./HelloWorldItemModel";
import { callNavigationNavigate } from "../../controller/NavigationController";

interface HelloWorldItemEmptyStateProps {
  workloadClient: WorkloadClientAPI;
  item: ItemWithDefinition<HelloWorldItemDefinition>;
  itemDefinition: HelloWorldItemDefinition;
  onFinishEmpty: (message: string) => void;
}

export const HelloWorldItemEditorEmptyStateOnFirstExprience: React.FC<HelloWorldItemEmptyStateProps> = ({
  workloadClient,
  item,
  itemDefinition: definition,
  onFinishEmpty: onFinishEmpty
}) => {
  const { t } = useTranslation();
  
  const handleStartHere = () => {
    onFinishEmpty(`Hello ${item.displayName}!`);
  };

  async function onCallNavigate(path: string) {
          await callNavigationNavigate(workloadClient, "workload", path );
    }
  
  return (
    <Stack className="empty-state-container" horizontalAlign="center" verticalAlign="center">
      <Stack className="empty-state-content" tokens={{ childrenGap: 24 }} horizontalAlign="center">
        {/* SVG Image */}
        <Stack.Item>
          <img
            src="/assets/items/HelloWorld/empty-states.svg"
            alt="Empty state illustration"
            className="empty-state-image"
          />
        </Stack.Item>
        
        {/* Title and Description */}
        <Stack className="empty-state-text-container" tokens={{ childrenGap: 8 }} horizontalAlign="center">
          <div className="empty-state-header">
            <h2>{t('HelloWorldItemEditorEmpty_Title', 'Empty state on first time experience')}</h2>
            <Text className="empty-state-description">
              {t('HelloWorldItemEditorEmpty_Description', 'This is the first screen people will see after adding your workload. Include some basic information to help them continue.')}
            </Text>
          </div>
        </Stack>
        
        {/* Start Here Button */}
        <Stack.Item>
          <Button appearance="primary" onClick={handleStartHere}>
            {t('HelloWorldItemEditorEmpty_StartButton', 'Start here')}
          </Button>
        </Stack.Item>
      </Stack>
    </Stack>
  );
};