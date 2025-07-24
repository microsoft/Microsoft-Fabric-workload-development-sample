import React from "react";
import { Tab, TabList } from '@fluentui/react-tabs';
import { Toolbar } from '@fluentui/react-toolbar';
import {
  SelectTabEvent, SelectTabData, TabValue,
  ToolbarButton, Tooltip
} from '@fluentui/react-components';
import {
  Save24Regular,
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
    </Toolbar>
  );
};

export interface HelloWorldItemEditorRibbonProps extends PageProps {
  saveItemCallback: () => Promise<void>;
  isSaveButtonEnabled?: boolean;
  onTabChange: (tabValue: TabValue) => void;
  selectedTab: TabValue;
}


export function HelloWorldItemEditorRibbon(props: HelloWorldItemEditorRibbonProps) {
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
        <HelloWorldItemEditorRibbonHomeTabToolbar {...props} />
      </div>
    </div>
  );
};