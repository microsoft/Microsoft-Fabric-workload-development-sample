import React from "react";
import { Tab, TabList } from '@fluentui/react-tabs';
import { Toolbar } from '@fluentui/react-toolbar';
import {
  SelectTabEvent, SelectTabData, TabValue,
  ToolbarButton, Tooltip
} from '@fluentui/react-components';
import {
  Add24Regular,
  Save24Regular,
} from "@fluentui/react-icons";
import { PageProps } from 'src/App';
import './../../../styles.scss';
import { t } from "i18next";

const SolutionSampleItemEditorRibbonHomeTabToolbar = (props: SolutionSampleItemEditorRibbonProps) => {

  async function onSaveAsClicked() {
    // your code to save as here
    await props.saveItemCallback();
    return;
  }

    function onAddSolutionClicked() {
    if (props.addSolutionCallback) {
      props.addSolutionCallback();
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
          onClick={onAddSolutionClicked} />
      </Tooltip>
    </Toolbar>
  );
};

export interface SolutionSampleItemEditorRibbonProps extends PageProps {
  addSolutionCallback: () => void;
  saveItemCallback: () => Promise<void>;
  isSaveButtonEnabled?: boolean;
  onTabChange: (tabValue: TabValue) => void;
  selectedTab: TabValue;
}


export function SolutionSampleItemEditorRibbon(props: SolutionSampleItemEditorRibbonProps) {
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
        <SolutionSampleItemEditorRibbonHomeTabToolbar {...props} />
      </div>
    </div>
  );
};
