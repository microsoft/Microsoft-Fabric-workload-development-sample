import React from "react";
import { Tab, TabList } from '@fluentui/react-tabs';
import { Toolbar } from '@fluentui/react-toolbar';
import {
  SelectTabEvent, SelectTabData, TabValue,
  ToolbarButton, Tooltip
} from '@fluentui/react-components';
import {
  Add24Regular,
  Connector24Regular,
  Save24Regular,
} from "@fluentui/react-icons";
import { PageProps } from 'src/App';
import './../../../styles.scss';
import { t } from "i18next";

const PackageInstallerItemEditorRibbonHome = (props: PackageInstallerItemEditorRibbonProps) => {

  async function onSaveAsClicked() {
    // your code to save as here
    await props.saveItemCallback();
    return;
  }

  async function onAddSolutionClicked() {
    if (props.addSolutionCallback) {
      props.addSolutionCallback();
    }
  }
  async function onConnectLakehouseClicked() {
    if (props.connectLakehouseCallback) {
      props.connectLakehouseCallback();
    }
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
        content="Add Configuration"
        relationship="label">
        <ToolbarButton
          aria-label="Add Configuration"
          data-testid="item-editor-add-config-btn"
          icon={<Add24Regular />}
          onClick={ onAddSolutionClicked } />
      </Tooltip>
      <Tooltip
        content="Select Lakehous Configuration"
        relationship="label">
        <ToolbarButton
          disabled={!props.isLakehouseConnectEnabled}
          aria-label="Select Lakehouse"
          data-testid="item-editor-add-config-btn"
          icon={<Connector24Regular />}
          onClick={ onConnectLakehouseClicked } />
      </Tooltip>
    </Toolbar>
  );
};

export interface PackageInstallerItemEditorRibbonProps extends PageProps {
  isLakehouseConnectEnabled: boolean;
  connectLakehouseCallback: () => void;
  addSolutionCallback: () => void;
  saveItemCallback: () => Promise<void>;
  isSaveButtonEnabled?: boolean;
  onTabChange: (tabValue: TabValue) => void;
  selectedTab: TabValue;
}


export function PackageInstallerItemEditorRibbon(props: PackageInstallerItemEditorRibbonProps) {
  const { onTabChange, selectedTab } = props;
  const onTabSelect = (_: SelectTabEvent, data: SelectTabData) => {
    onTabChange(data.value);
  };

  return (
    <div className="ribbon">
      <TabList
        disabled={selectedTab === "empty"}
        selectedValue={selectedTab}
        onTabSelect={onTabSelect}>
        <Tab value="home" data-testid="home-tab-btn">
          {t("ItemEditor_Ribbon_Home_Label")}</Tab>
      </TabList>
      <div className="toolbarContainer">
        <PackageInstallerItemEditorRibbonHome {...props} />
      </div>
    </div>
  );
};
