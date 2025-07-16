import React from "react";
import { Tab, TabList } from '@fluentui/react-tabs';
import { Toolbar, ToolbarDivider } from '@fluentui/react-toolbar';
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
  FolderLink24Regular,
} from "@fluentui/react-icons";
import { Stack } from '@fluentui/react';
import { PageProps } from 'app/App';
import '../../../styles.scss';
import { t } from "i18next";

const CalculatorSampleItemEditorRibbonHomeTabToolbar = (props: CalculatorSampleItemEditorRibbonProps) => {

  async function onSettingsClicked() {
    await props.openSettingsCallback();
  }

  async function onCreateShortcutClicked() {
    await props.openCreateShortcutCallback();
  }

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

      <Tooltip
        content="Settings"
        relationship="label">
        <ToolbarButton
          disabled={!props.isSaveButtonEnabled}
          aria-label="Settings"
          data-testid="item-editor-settings-btn"
          icon={<Settings24Regular />}
          onClick={onSettingsClicked} />
      </Tooltip>
      <ToolbarDivider />
      <Tooltip
        content="Create a Shortcut to the calcuation results"
        relationship="label">
        <ToolbarButton
          disabled={!props.isSaveButtonEnabled}
          aria-label="Shortcut"
          data-testid="item-editor-shortcut-btn"
          icon={<FolderLink24Regular />}
          onClick={onCreateShortcutClicked} />
      </Tooltip>
    </Toolbar>
  );
};

const CalculatorSampleItemEditorCollaborationButtons = (props: CalculatorSampleItemEditorRibbonProps) => {
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

export interface CalculatorSampleItemEditorRibbonProps extends PageProps {
  saveItemCallback: () => Promise<void>;
  isSaveButtonEnabled?: boolean;
  openSettingsCallback: () => Promise<void>;
  openCreateShortcutCallback?: () => Promise<void>;
  onTabChange: (tabValue: TabValue) => void;
  selectedTab: TabValue;
}

export function CalculatorSampleItemEditorRibbon(props: CalculatorSampleItemEditorRibbonProps) {
  const { onTabChange, selectedTab } = props;
  const onTabSelect = (_: SelectTabEvent, data: SelectTabData) => {
    onTabChange(data.value);
  };

  return (
    <div className="ribbon">
      <CalculatorSampleItemEditorCollaborationButtons {...props} />
      <TabList
        disabled={selectedTab === "empty"}
        selectedValue={selectedTab}
        onTabSelect={onTabSelect}>
        <Tab value="home" data-testid="home-tab-btn">
          {t("ItemEditor_Ribbon_Home_Label")}
        </Tab>
      </TabList>

      <div className="toolbarContainer">
        <CalculatorSampleItemEditorRibbonHomeTabToolbar {...props} />
      </div>

    </div>
  );
};
