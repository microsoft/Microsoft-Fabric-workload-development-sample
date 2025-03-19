import React, { useState } from 'react';
import {
  TabList,
  Tab,
  SelectTabData,
  TabValue,
} from '@fluentui/react-components';
import { Stack } from '@fluentui/react';
import { GenericItem, TabContentProps } from '../../models/SampleWorkloadModel';
import { EventhouseExplorerComponent } from '../SampleWorkloadEventhouseExplorer/SampleWorkloadEventhouseExplorer';
import { LakehouseExplorerComponent } from '../SampleWorkloadLakehouseExplorer/SampleWorkloadLakehouseExplorer';
import "./../../styles.scss";

export function DataPlayground(props: TabContentProps) {
  const { workloadClient } = props;
  const [selectedTab, setSelectedTab] = useState<TabValue>("lakehouseExplorer");
  const [selectedLakehouse, setSelectedLakehouse] = useState<GenericItem>(null);

  return (
    <Stack className="editor" >
      <TabList
        className="tabListContainer"
        defaultSelectedValue={selectedTab}
        data-testid="item-editor-selected-tab-btn"
        onTabSelect={(_, data: SelectTabData) => setSelectedTab(data.value)}
      >
        <Tab value="lakehouseExplorer">Lakehouse</Tab>
        <Tab value="dataEventHouse">Eventhouse</Tab>
      </TabList>

      <Stack className="main">
        {selectedTab === 'lakehouseExplorer' && (
          <LakehouseExplorerComponent workloadClient={workloadClient} selectedLakehouse={selectedLakehouse} setSelectedLakehouse={setSelectedLakehouse} />
        )}
        {selectedTab === 'dataEventHouse' && (
          <EventhouseExplorerComponent workloadClient={workloadClient} />
        )}
      </Stack>
    </Stack>

  );
};
