import React from "react";
import { Tab, TabList } from '@fluentui/react-tabs';
import { Toolbar } from '@fluentui/react-toolbar';

import {
  SelectTabEvent, SelectTabData, TabValue,
  Menu, MenuItem, MenuList, MenuPopover, MenuTrigger,
  ToolbarButton, Button, MenuButton, Tooltip
} from '@fluentui/react-components';
import {
  Save24Regular,
  Chat24Regular,
  Edit24Regular,
  Share24Regular,
  Settings24Regular,
} from "@fluentui/react-icons";
import { Stack } from '@fluentui/react';

import { PageProps } from 'src/App';
import { callDatahubOpen, callDialogOpenMsgBox } from '../../controller/SampleWorkloadController';
import './../../styles.scss';
import { ItemTabToolbar } from "./ItemTabToolbar";

const HomeTabToolbar = (props: RibbonProps) => {

  async function onSettingsClicked() {
    await props.openSettingsCallback();
  }

  async function onSaveAsClicked() {
    // your code to save as here
    await props.saveItemCallback();
    return;
  }

  async function onDeleteClicked() {
    // don't call delete in Create mode
    if (!props.isDeleteEnabled) {
      return;
    }

    const msgBoxResult: string = await callDialogOpenMsgBox("Delete Item", "Are you sure about deleting this item?", ["Yes", "No"], props.workloadClient);
    if (msgBoxResult != "Yes") {
      return;
    }

    props.deleteItemCallback();

  }

  function getSaveButtonTooltipText(): string {
    return !props.isFEOnly
      ? 'Save is not supported in Frontend-only'
      : (!props.isStorageSelected
        ? 'Select calculation result storage (Lakehouse / OneLake)'
        : (props.invalidOperands
          ? 'Operands may lead to overflow'
          : 'Save')
        );
  }

  return (
    <Toolbar>

      <Tooltip
        content={getSaveButtonTooltipText()}
        relationship="label">
        <ToolbarButton
          disabled={!props.isSaveButtonEnabled}
          aria-label="Save"
          data-testid="item-editor-save-btn"
          icon={<Save24Regular />}
          onClick={onSaveAsClicked} />
      </Tooltip>

      <Tooltip
        content="Settings"
        relationship="label">
        <ToolbarButton
          aria-label="Settings"
          data-testid="item-editor-settings-btn"
          icon={<Settings24Regular />}
          onClick={onSettingsClicked} />
      </Tooltip>
    </Toolbar>
  );
};

const ViewTabToolbar = (props: RibbonProps) => {
  const zoomOptions = [
    "75%",
    "90%",
    "100%",
    "120%",
    "150%",
  ];

  return (
    <Toolbar>
      <ToolbarButton
        aria-label="Zoom to fit"
        icon={<ZoomFit20Filled />}>Zoom to fit</ToolbarButton>
      <ToolbarDivider />

      <Label className="comboboxLabel">Zoom:</Label>
      <Combobox readOnly={true}
        style={{ minWidth: "unset" }} input={{ style: { width: "50px" } }}
        defaultValue="100%"
        defaultSelectedOptions={["100%"]}>
        {zoomOptions.map((option) => (
          <Option key={option}>{option}</Option>
        ))}
      </Combobox>
    </Toolbar>
  );
};

const CollabButtons = (props: RibbonProps) => {
  return (
    <div className="collabContainer">
      <Stack horizontal>
        <Button size="small" icon={<Chat24Regular />}>Comments</Button>
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <MenuButton size="small" icon={<Edit24Regular />}>Editing</MenuButton>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem>Editing</MenuItem>
              <MenuItem>Viewing</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
        <Button size="small" icon={<Share24Regular />} appearance="primary">Share</Button>
      </Stack>
    </div>
  );
}

export interface RibbonProps extends PageProps {
  saveItemCallback: () => Promise<void>;
  isStorageSelected?: boolean;
  isSaveButtonEnabled?: boolean;
  isFEOnly?: boolean;
  openSettingsCallback: () => Promise<void>;
  itemObjectId?: string;
  onTabChange: (tabValue: TabValue) => void;
  selectedTab: TabValue;
  isDirty: boolean;
  invalidOperands: boolean;
}

export function Ribbon(props: RibbonProps) {
  const { onTabChange, selectedTab } = props;
  const onTabSelect = (_: SelectTabEvent, data: SelectTabData) => {
    setSelectedValue(data.value);
    onTabChange(data.value);
  };

  return (
    <div className="ribbon">
      <CollabButtons {...props} />
      <TabList
        selectedValue={selectedTab}
        onTabSelect={onTabSelect}>
        <Tab value="home" data-testid="home-tab-btn">Home</Tab>
        <Tab value="jobs" data-testid="jobs-tab-btn">Jobs</Tab>
        <Tab value="api" data-testid="api-tab-btn">API Playground</Tab>
        <Tab value="fluentui" data-testid="fluentui-tab-btn">FluentUI Playground</Tab>
      </TabList>

      <div className="toolbarContainer">
        {selectedTab === "home" && <HomeTabToolbar {...props} />}
        {selectedTab === "jobs" && <ItemTabToolbar {...props} />}
      </div>

    </div>
  );
};
