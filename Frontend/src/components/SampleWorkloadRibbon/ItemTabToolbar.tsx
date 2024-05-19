import React from "react";

import { Menu, MenuButton, MenuItem, MenuList, MenuPopover, MenuTrigger, Toolbar, ToolbarButton, ToolbarDivider } from "@fluentui/react-components";
import {
  TriangleRight20Regular,
  History24Regular,
  Clock24Regular
} from "@fluentui/react-icons";

import { RibbonProps } from "./SampleWorkloadRibbon";
import { callItemGet, callOpenRecentRuns, callOpenSettings, callRunItemJob } from "../../controller/SampleWorkloadController";
import { jobTypeDisplayNames } from "../../utils";

export function ItemTabToolbar(props: RibbonProps) {
  const { itemObjectId, workloadClient } = props;

  async function onRunJob( jobType: string) {
    await callRunItemJob(
      itemObjectId,
      jobType,
      JSON.stringify({metadata: 'JobMetadata'}),
      workloadClient,
      true /* showNotification */);
  }

  async function onRecenetRun() {
    const item = await callItemGet(itemObjectId, workloadClient);
    await callOpenRecentRuns(item, workloadClient);
  }

  async function onScheduelePane() {
    const item = await callItemGet(itemObjectId, workloadClient);
    await callOpenSettings(item, workloadClient, 'Schedule');
  }

  const menuItems = Object.keys(jobTypeDisplayNames).map((key) => (
    <MenuItem key={key} onClick={() => onRunJob(key)}>
      {jobTypeDisplayNames[key]}
    </MenuItem>
  ));

  console.log(itemObjectId)
    return (
      <Toolbar>
        <Menu aria-label="run jobs">
          <MenuTrigger>
            <MenuButton style={{ fontWeight: 400, fontSize:14 }} size="small" icon={<TriangleRight20Regular />}>Run Jobs</MenuButton>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>{menuItems}</MenuList>
          </MenuPopover>
        </Menu>
        <ToolbarDivider />
        <ToolbarButton
          style={{ fontWeight: 400, fontSize:14 }} 
          aria-label="Recent runs"
          icon={<History24Regular />}
          onClick={() => onRecenetRun()}>Recent runs</ToolbarButton>
        <ToolbarButton
          style={{ fontWeight: 400, fontSize:14 }} 
          aria-label="Schedule"
          icon={<Clock24Regular/>}
          onClick={() => onScheduelePane()}>Schedule</ToolbarButton>
      </Toolbar>
    );
  }