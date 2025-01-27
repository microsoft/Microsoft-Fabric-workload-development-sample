import React from "react";

import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  Tooltip
} from "@fluentui/react-components";
import {
  TriangleRight20Regular,
  History24Regular,
  Clock24Regular
} from "@fluentui/react-icons";

import { RibbonProps } from "./SampleWorkloadRibbon";
import { callItemGet, callOpenRecentRuns, callOpenSettings, callRunItemJob } from "../../controller/SampleWorkloadController";
import { jobTypeDisplayNames } from "../../utils";

export function ItemTabToolbar(props: RibbonProps) {
  const { itemObjectId, workloadClient, isLakeHouseSelected, saveItemCallback, isDirty } = props;

  async function onRunJob( jobType: string) {
    if (isDirty) {
      await saveItemCallback();
    }

    await callRunItemJob(
      itemObjectId,
      jobType,
      JSON.stringify({metadata: 'JobMetadata'}),
      true /* showNotification */,
      workloadClient);
  }

  async function onRecentRun() {
    try {
      const item = await callItemGet(itemObjectId, workloadClient);
      await callOpenRecentRuns(item, workloadClient);
    } catch (e) {
        console.error(`Failed to open recent runs: ${e}`);
    }
  }

  async function onSchedulePane() {
    try {
      if (isDirty) {
          await saveItemCallback();
      }

      const item = await callItemGet(itemObjectId, workloadClient);
      await callOpenSettings(item, workloadClient, 'Schedule');
    } catch (e) {
        console.error(`Failed to open schedule pane: ${e}`);
    }
  }

  const menuItems = Object.keys(jobTypeDisplayNames).map((key) => (
    <MenuItem key={key} onClick={() => onRunJob(key)} data-testid={`menuitem-${key}`}>
      {jobTypeDisplayNames[key]}
    </MenuItem>
  ));

  function getJobActionTooltipText(regularTooltipMessage: string): string {
    return !props.isLakeHouseSelected
            ? 'Select a Lakehouse'
            : regularTooltipMessage;
  }

  console.log(itemObjectId)
    return (
      <Toolbar>
          <Menu aria-label="run jobs">
            <MenuTrigger>
              <Tooltip
                  content={getJobActionTooltipText("Run Jobs")}
                  data-testid="run-jobs-tooltip"
                  relationship="label">
              <MenuButton
                  style={{fontWeight: 400, fontSize: 14}}
                  size="small"
                  icon={<TriangleRight20Regular/>}
                  data-testid="run-jobs-menu-button"
                  disabled={!isLakeHouseSelected}>Run Jobs</MenuButton>
              </Tooltip>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>{menuItems}</MenuList>
            </MenuPopover>
          </Menu>
        <ToolbarDivider />
        <ToolbarButton
            style={{fontWeight: 400, fontSize: 14}}
            aria-label="Recent runs"
            data-testid="recent-runs-toolbar-button"
            icon={<History24Regular/>}
            onClick={() => onRecentRun()}>
          Recent runs</ToolbarButton>
        <Tooltip
            content={getJobActionTooltipText("Schedule")}
            relationship="label">
          <ToolbarButton
            style={{fontWeight: 400, fontSize: 14}}
            aria-label="Schedule"
            icon={<Clock24Regular/>}
            onClick={() => onSchedulePane()}
            disabled={!isLakeHouseSelected}>Schedule</ToolbarButton>
        </Tooltip>
      </Toolbar>
    );
  }
