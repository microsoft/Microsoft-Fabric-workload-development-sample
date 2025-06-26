import React from "react";
import { Tab, TabList } from '@fluentui/react-tabs';
import { Toolbar } from '@fluentui/react-toolbar';
import {
  SelectTabEvent, SelectTabData, TabValue,
  ToolbarButton, Tooltip
} from '@fluentui/react-components';
import {
  Save24Regular,
  Add24Regular
} from "@fluentui/react-icons";
import { PageProps } from 'src/App';
import './../../../styles.scss';

const HomeTabToolbar = (props: RibbonProps) => {

  async function onSaveClicked() {
    // your code to save as here
    await props.saveItemCallback();
    return;
  }

  function onAddConfigurationClicked() {
    if (props.addConfigurationCallback) {
      props.addConfigurationCallback();
    }
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
          onClick={onSaveClicked} />
      </Tooltip>
      
      <Tooltip
        content="Add Configuration"
        relationship="label">
        <ToolbarButton
          aria-label="Add Configuration"
          data-testid="item-editor-add-config-btn"
          icon={<Add24Regular />}
          onClick={onAddConfigurationClicked} />
      </Tooltip>
    </Toolbar>
  );
};

export interface RibbonProps extends PageProps {
  onTabChange: (tabValue: TabValue) => void;
  isSaveButtonEnabled?: boolean;
  saveItemCallback: () => Promise<void>;
  addConfigurationCallback?: () => void;
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
