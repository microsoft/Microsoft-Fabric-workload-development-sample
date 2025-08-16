/**
 * HelloWorldItemEditorEmptyStateRibbon.tsx
 * 
 * Ribbon component for the Empty State of the HelloWorld item editor.
 * This ribbon displays the home tab with toolbar containing save (disabled), 
 * settings, and get started buttons as specified in the requirements.
 */

import React from "react";
import { Tab, TabList } from '@fluentui/react-tabs';
import { Toolbar } from '@fluentui/react-toolbar';
import {
  ToolbarButton, Tooltip
} from '@fluentui/react-components';
import {
  Save24Regular,
  Settings24Regular,
  Rocket24Regular
} from "@fluentui/react-icons";
import { PageProps } from '../../App';
import { useTranslation } from "react-i18next";
import '../../styles.scss';

/**
 * Props interface for the Empty State Ribbon component
 */
export interface HelloWorldItemEditorEmptyStateRibbonProps extends PageProps {
  /** Callback to open settings */
  openSettingsCallback: () => Promise<void>;
  /** Callback to navigate to getting started */
  navigateToGettingStartedCallback: () => void;
}

/**
 * Toolbar component for the Empty State home tab
 */
const EmptyStateHomeTabToolbar: React.FC<HelloWorldItemEditorEmptyStateRibbonProps> = (props) => {
  const { t } = useTranslation();


  const handleSettingsClick = async () => {
    await props.openSettingsCallback();
  };

  const handleGettingStartedClick = () => {
    props.navigateToGettingStartedCallback();
  };

  return (
    <Toolbar>
      {/* Save Button - Disabled */}
      <Tooltip
        content={t("ItemEditor_Ribbon_Save_Label")}
        relationship="label">
        <ToolbarButton
          disabled={true}
          aria-label={t("ItemEditor_Ribbon_Save_Label")}
          data-testid="item-editor-save-btn"
          icon={<Save24Regular />}
        />
      </Tooltip>

      {/* Settings Button */}
      <Tooltip
        content={t("ItemEditor_Ribbon_Settings_Label")}
        relationship="label">
        <ToolbarButton
          aria-label={t("ItemEditor_Ribbon_Settings_Label")}
          data-testid="item-editor-settings-btn"
          icon={<Settings24Regular />}
          onClick={handleSettingsClick} 
        />
      </Tooltip>

      {/* Get Started Button - Primary action in empty state */}
      <Tooltip
        content={t("ItemEditor_Ribbon_GettingStarted_Label", "Getting Started")}
        relationship="label">
        <ToolbarButton
          aria-label={t("ItemEditor_Ribbon_GettingStarted_Label", "Getting Started")}
          data-testid="item-editor-getting-started-btn"
          icon={<Rocket24Regular />}
          onClick={handleGettingStartedClick}
        />
      </Tooltip>
    </Toolbar>
  );
};

/**
 * Main Empty State Ribbon component
 * Displays the home tab with appropriate toolbar for empty state
 */
export function HelloWorldItemEditorEmptyStateRibbon(props: HelloWorldItemEditorEmptyStateRibbonProps) {
  const { t } = useTranslation();

  return (
    <div className="ribbon">
      {/* Home Tab */}
      <TabList defaultSelectedValue="home">
        <Tab value="home" data-testid="home-tab-btn">
          {t("ItemEditor_Ribbon_Home_Label")}
        </Tab>
      </TabList>

      {/* Toolbar Container */}
      <div className="toolbarContainer">
        <EmptyStateHomeTabToolbar {...props} />
      </div>
    </div>
  );
}