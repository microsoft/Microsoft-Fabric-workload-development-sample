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
import { PageProps } from 'src/App';
import './../../styles.scss';

const HomeTabToolbar = (props: RibbonProps) => {

  async function onSaveAsClicked() {
    // your code to save as here
    await props.saveItemCallback();
    return;
  }

  return (
    <Toolbar>
      <Tooltip
        content="Save"
        relationship="label">
        <ToolbarButton
          disabled={!props.isSaveButtonEnabled}
          aria-label="Save"
          data-testid="item-editor-save-btn"
          icon={<Save24Regular />}
          onClick={onSaveAsClicked} />
      </Tooltip>
    </Toolbar>
  );
};

export interface RibbonProps extends PageProps {
  saveItemCallback: () => Promise<void>;
  isSaveButtonEnabled?: boolean;
  onTabChange: (tabValue: TabValue) => void;
  selectedTab: TabValue;
}


export function Ribbon(props: RibbonProps) {
  const { onTabChange, selectedTab } = props;
  const onTabSelect = (_: SelectTabEvent, data: SelectTabData) => {
    onTabChange(data.value);
  };

  return (
    <div className="ribbon">
      <TabList
        selectedValue={selectedTab}
        onTabSelect={onTabSelect}>
        <Tab value="home" data-testid="home-tab-btn">Home</Tab>
      </TabList>

      <div className="toolbarContainer">
        {selectedTab === "home" && <HomeTabToolbar {...props} />}
      </div>

    </div>
  );
};