import React, { useState } from 'react';
import {
  TabList,
  Tab,
  SelectTabData,
  TabValue,
} from '@fluentui/react-components';
import { Stack } from '@fluentui/react';
import { TabContentProps } from '../../models/SampleWorkloadModel';
import { LakehouseExplorerComponent } from '../SampleWorkloadLakehouseExplorer/SampleWorkloadLakehouseExplorer';
import "./../../styles.scss";

export function DataPlayground(props: TabContentProps) {
  const { workloadClient } = props;
  const [selectedTab, setSelectedTab] = useState<TabValue>("lakehouseExplorer");

  return (
    <Stack className="editor" >
      <TabList
        className="tabListContainer"
        defaultSelectedValue={selectedTab}
        data-testid="item-editor-selected-tab-btn"
        onTabSelect={(_, data: SelectTabData) => setSelectedTab(data.value)}
      >
        <Tab value="lakehouseExplorer">OneLake Explorer</Tab>
      </TabList>

      <Stack className="main">
        {selectedTab === 'lakehouseExplorer' && (
          <LakehouseExplorerComponent workloadClient={workloadClient} />
        )}
      </Stack>
    </Stack>

  );
};
