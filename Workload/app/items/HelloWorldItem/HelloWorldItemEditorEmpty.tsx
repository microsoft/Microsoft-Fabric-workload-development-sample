import React from "react";
import { Stack } from "@fluentui/react";
import { Button, Text} from "@fluentui/react-components";

import { useTranslation } from "react-i18next";
import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { ItemWithDefinition } from "../../controller/ItemCRUDController";
import { HelloWorldItemDefinition } from "./HelloWorldItemModel";
import { callOpenSettings } from "../../controller/SettingsController";
import { HelloWorldItemEditorEmptyStateRibbon } from "./HelloWorldItemEditorEmptyStateRibbon";
import { callGetItem } from "../../controller/ItemCRUDController";
import "../../styles.scss";

interface HelloWorldItemEditorEmptyProps {
  workloadClient: WorkloadClientAPI;
  item?: ItemWithDefinition<HelloWorldItemDefinition>;
  onNavigateToGettingStarted: () => void;
}

/**
 * Empty state component - the first screen users see
 * This is a static page that can be easily removed or replaced by developers
 * 
 *  To skip this page, modify HelloWorldItemEditor.tsx line 38-43
 * to always set currentView to 'getting-started'
 */
export function HelloWorldItemEditorEmpty({
  workloadClient,
  item,
  onNavigateToGettingStarted
}: HelloWorldItemEditorEmptyProps) {
  const { t } = useTranslation();

  const handleOpenSettings = async () => {
    if (item) {
      try {
        const item_res = await callGetItem(workloadClient, item.id);
        await callOpenSettings(workloadClient, item_res, 'About');
      } catch (error) {
        console.error('Failed to open settings:', error);
      }
    }
  };

  return (
    <Stack className="editor" data-testid="item-editor-inner">
      {/* Ribbon with Home Tab */}
      <HelloWorldItemEditorEmptyStateRibbon
              workloadClient={workloadClient}
              openSettingsCallback={handleOpenSettings}
              navigateToGettingStartedCallback={onNavigateToGettingStarted}
            />

      {/* Empty State Content - Matching the first image */}
      <Stack className="empty-state-container" horizontalAlign="center" verticalAlign="center">
        <Stack className="empty-state-content" tokens={{ childrenGap: 24 }} horizontalAlign="center">
          <Stack.Item>
            <img
              src="/assets/items/HelloWorld/empty-states.svg"
              alt="Empty state illustration"
              className="empty-state-image"
            />
          </Stack.Item>
          <Stack className="empty-state-text-container" tokens={{ childrenGap: 8 }} horizontalAlign="center">
            <div className="empty-state-header">
              <h2>{t('HelloWorldItemEditorEmpty_Title', 'Welcome to HelloWorld!')}</h2>
              <Text className="empty-state-description">
                {t('HelloWorldItemEditorEmpty_Description', 'This is the first screen people will see after adding your workload. Include some basic information to help them continue.')}
              </Text>
            </div>
          </Stack>
          <Stack.Item>
            <Button appearance="primary" onClick={onNavigateToGettingStarted}>
              {t('HelloWorldItemEditorEmpty_StartButton', 'Getting Started')}
            </Button>
          </Stack.Item>
        </Stack>
      </Stack>
    </Stack>
  );
}