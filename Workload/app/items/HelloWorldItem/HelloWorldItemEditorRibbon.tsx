import React from "react";
import { Tab, TabList } from '@fluentui/react-tabs';
import { Toolbar } from '@fluentui/react-toolbar';
import {
  ToolbarButton, Tooltip, Button
} from '@fluentui/react-components';
import {
  Save24Regular,
  Settings24Regular,
  Rocket24Regular,
  ArrowLeft20Regular
} from "@fluentui/react-icons";
import { PageProps } from '../../App';
import '../../styles.scss';
import { t } from "i18next";

const HelloWorldItemEditorRibbonHomeTabToolbar = (props: HelloWorldItemEditorRibbonProps) => {

  async function onSaveAsClicked() {
    // your code to save as here
    await props.saveItemCallback();
    return;
  }

  async function onSettingsClicked() {
    await props.openSettingsCallback();
    return;
  }

  async function onGettingStartedClicked() {
    await props.openSettingsCallback();
    return;
  }

  return (
    <Toolbar>
      <Tooltip
        content={t("ItemEditor_Ribbon_Save_Label")}
        relationship="label">
        <ToolbarButton
          disabled={!props.isSaveButtonEnabled}
          aria-label={t("ItemEditor_Ribbon_Save_Label")}
          data-testid="item-editor-save-btn"
          icon={<Save24Regular />}
          onClick={onSaveAsClicked} />
      </Tooltip>
      <Tooltip
        content={t("ItemEditor_Ribbon_Settings_Label")}
        relationship="label">
        <ToolbarButton
          aria-label={t("ItemEditor_Ribbon_Settings_Label")}
          data-testid="item-editor-settings-btn"
          icon={<Settings24Regular />}
          onClick={onSettingsClicked} />
      </Tooltip>
      <Tooltip
        content={t("ItemEditor_Ribbon_Settings_Label")}
        relationship="label">
        <ToolbarButton
          aria-label={t("ItemEditor_Ribbon_Settings_Label")}
          data-testid="item-editor-settings-btn"
          icon={<Rocket24Regular />}
          onClick={onGettingStartedClicked} />
      </Tooltip>
    </Toolbar>
  );
};

const BackToHomeTabHeader = (props: HelloWorldItemEditorRibbonProps) => {
  
  function onBackToHomeClicked() {
    // Call the callback to return to home view
    if (props.backToHomeCallback) {
      props.backToHomeCallback();
    }
  }

  return (
    <div className="back-to-home-header">
      <Button
        appearance="subtle"
        icon={<ArrowLeft20Regular />}
        onClick={onBackToHomeClicked}
        className="back-to-home-button"
      >
        {t("ItemEditor_Ribbon_BackToHome_Label", "Back to Home tab")}
      </Button>
      
      <div className="header-divider" />
      
      <div className="header-info">
        <span className="header-label">
          {t("ItemEditor_Ribbon_FeatureName_Label", "Feature name:")}
        </span>
        <span className="header-value">
          {props.featureName || t("ItemEditor_Ribbon_DocumentName_Default", "Document name")}
        </span>
      </div>
    </div>
  );
};

export interface HelloWorldItemEditorRibbonProps extends PageProps {
  isRibbonDisabled?: boolean;
  isSaveButtonEnabled?: boolean;
  saveItemCallback: () => Promise<void>;
  openSettingsCallback: () => Promise<void>;
  openGettingStartedCallback: () => Promise<void>;
  backToHomeCallback?: () => void;
  isInEmptyState?: boolean;
  featureName?: string; // Optional feature name to display in the header

}


export function HelloWorldItemEditorRibbon(props: HelloWorldItemEditorRibbonProps) {
  const { isRibbonDisabled, isInEmptyState = false } = props;
   return (
    <div className="ribbon">
      {!isInEmptyState ? (
        // Show Back to Home button when not in empty state
        <BackToHomeTabHeader {...props} />
      ) : (
        // Show regular tab when in empty state
        <>
          <TabList disabled={isRibbonDisabled}>
            <Tab value="home" data-testid="home-tab-btn">
              {t("ItemEditor_Ribbon_Home_Label")}
            </Tab>
          </TabList>
          <div className="toolbarContainer">
            <HelloWorldItemEditorRibbonHomeTabToolbar {...props} />
          </div>
        </>
      )}
    </div>
  );
};