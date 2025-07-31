import React from "react";
import { Tab, TabList } from '@fluentui/react-tabs';
import { Toolbar } from '@fluentui/react-toolbar';
import {
  ToolbarButton, Tooltip
} from '@fluentui/react-components';
import {
  Save24Regular,
  Settings24Regular,
  ArrowSync24Regular,
} from "@fluentui/react-icons";
import { PageProps } from '../../App';
import '../../styles.scss';
import { t } from "i18next";

interface UnityCatalogItemEditorRibbonProps extends PageProps {
  isRibbonDisabled: boolean;
  isSaveButtonEnabled: boolean;
  saveItemCallback: () => Promise<void>;
  openSettingsCallback: () => Promise<void>;
  syncShortcutsCallback: () => Promise<void>;
  isLoading: boolean;
}

const UnityCatalogItemEditorRibbonHomeTabToolbar = (props: UnityCatalogItemEditorRibbonProps) => {

  async function onSaveClicked() {
    await props.saveItemCallback();
    return;
  }

  async function onSettingsClicked() {
    await props.openSettingsCallback();
    return;
  }

  async function onSyncClicked() {
    await props.syncShortcutsCallback();
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
          data-testid="unity-catalog-editor-save-btn"
          icon={<Save24Regular />}
          onClick={onSaveClicked} />
      </Tooltip>
      
      <Tooltip
        content="Sync Shortcuts"
        relationship="label">
        <ToolbarButton
          disabled={props.isLoading}
          aria-label="Sync Shortcuts"
          data-testid="unity-catalog-editor-sync-btn"
          icon={<ArrowSync24Regular />}
          onClick={onSyncClicked} />
      </Tooltip>
      
      <Tooltip
        content={t("ItemEditor_Ribbon_Settings_Label")}
        relationship="label">
        <ToolbarButton
          aria-label={t("ItemEditor_Ribbon_Settings_Label")}
          data-testid="unity-catalog-editor-settings-btn"
          icon={<Settings24Regular />}
          onClick={onSettingsClicked} />
      </Tooltip>
    </Toolbar>
  );
};

export function UnityCatalogItemEditorRibbon(props: UnityCatalogItemEditorRibbonProps) {
  const { isRibbonDisabled } = props;
  return (
    <div className="ribbon">
        <TabList disabled={isRibbonDisabled}>
        <Tab value="home" data-testid="home-tab-btn">
            {t("ItemEditor_Ribbon_Home_Label")}</Tab>
        </TabList>
        <div className="toolbarContainer">
        <UnityCatalogItemEditorRibbonHomeTabToolbar {...props} />
        </div>
    </div>
  );
}
