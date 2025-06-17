import React, { useState } from 'react';
import {
  TabList,
  Tab,
  SelectTabData,
  TabValue,
} from '@fluentui/react-components';
import { Stack } from '@fluentui/react';
import { TabContentProps } from '../../models/SampleWorkloadModel';
import { OneLakeItemExplorerComponent } from '../SampleOneLakeItemExplorer/SampleOneLakeItemExplorer';
import { OneLakeShortcutCreator } from '../OneLakeShortcutCreator/OneLakeShortcutCreator';
import "./../../styles.scss";
import { EventhouseExplorerComponent } from '../SampleEventhouseExplorer/SampleEventhouseExplorer';

export function DataPlayground(props: TabContentProps) {
  const { workloadClient } = props;
  const [selectedTab, setSelectedTab] = useState<TabValue>("onelakeItemExplorer");

  return (
    <Stack className="editor" >
      <TabList
        className="tabListContainer"
        defaultSelectedValue={selectedTab}
        data-testid="item-editor-selected-tab-btn"
        onTabSelect={(_, data: SelectTabData) => setSelectedTab(data.value)}
      >
        <Tab value="onelakeItemExplorer">OneLake Item Explorer</Tab>
        <Tab value="onelakeShortcutCreator">OneLake Shortcut Creator</Tab>
        <Tab value="eventHouseExplorer">Eventhouse Explorer</Tab>
      </TabList>

      <Stack className="main">
        {selectedTab === 'onelakeItemExplorer' && (
          <OneLakeItemExplorerComponent workloadClient={workloadClient} />
        )}
        {selectedTab === 'onelakeShortcutCreator' && (
          <OneLakeShortcutCreator workloadClient={workloadClient} />
        )}
        {selectedTab === 'eventHouseExplorer' && (
          <EventhouseExplorerComponent workloadClient={workloadClient} />
        )}
      </Stack>
    </Stack>

  );
};
