import React, { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import {
  TabList,
  Tab,
  SelectTabData,
  TabValue,
  Button,
} from '@fluentui/react-components';
import { Stack } from '@fluentui/react';
import { RootState } from "../../ClientSDKPlaygroundStore/Store"
import { setSelectedTab } from "../../ClientSDKPlaygroundStore/tabsSlice";
import { ApiNotification } from './ApiNotification';
import { ApiActionDialog } from './ActionDialog/ApiActionDialog';
import { ApiPanelSettings } from './ApiPanelSettings';
import { ApiNavigation } from './ApiNavigation';
import { ApiData } from './ApiData';
import { UIComponentsExample } from './UIComponents';
import { ApiAuthentication } from './ApiAuthentication';
import { TabContentProps } from '../../models/SampleWorkloadModel';
import { PageProps } from 'src/App';
import { callNavigationBeforeNavigateAway, callNavigationNavigate } from "../../controller/SampleWorkloadController";
import "./../../styles.scss";


export function ClientSDKPlayground(props: TabContentProps) {
  const { workloadClient } = props;
  const sampleWorkloadName = process.env.WORKLOAD_NAME;
  const dispatch = useDispatch();
  const selectedApiTab = useSelector(
    (state: RootState) => state.tabs.selectedTab
  ) as TabValue;

  useEffect(() => {
    // Controller callbacks registrations:
    // register Blocking in Navigate.BeforeNavigateAway (for a forbidden url)
    callNavigationBeforeNavigateAway(workloadClient);
  }, [workloadClient]);


  return (
    <Stack className="editor" >
      <TabList
        className="tabListContainer"
        selectedValue={selectedApiTab}
        data-testid="item-editor-selected-tab-btn"
        onTabSelect={(_, data: SelectTabData) =>
          dispatch(setSelectedTab(data.value as string))}
      >
        <Tab value="apiNotification">Notification</Tab>
        <Tab value="apiActionDialog">Action & Dialog</Tab>
        <Tab value="apiPanelSettings">Panel & Settings</Tab>
        <Tab value="apiNavigation">Navigation</Tab>
        <Tab value="dataHub">Data Hub</Tab>
        <Tab value="uiComponents">UI Components</Tab>
        <Tab value="authentication">Authentication</Tab>
      </TabList>

      <Stack className="main">
        {selectedApiTab === 'apiNotification' && (
          <ApiNotification workloadClient={workloadClient} />
        )}
        {selectedApiTab === 'apiActionDialog' && (
          <ApiActionDialog
            workloadClient={workloadClient}
            sampleWorkloadName={sampleWorkloadName}
          />
        )}
        {selectedApiTab === 'apiPanelSettings' && (
          <ApiPanelSettings
            workloadClient={workloadClient}
            sampleWorkloadName={sampleWorkloadName}
          />
        )}
        {selectedApiTab === 'apiNavigation' && (
          <ApiNavigation
            workloadClient={workloadClient}
            sampleWorkloadName={sampleWorkloadName}
          />
        )}
        {selectedApiTab === 'dataHub' && (
          <ApiData workloadClient={workloadClient} sampleWorkloadName={sampleWorkloadName} />
        )}
        {selectedApiTab === 'uiComponents' && (
          <UIComponentsExample workloadClient={workloadClient} />
        )}
        {selectedApiTab === 'authentication' && (
          <ApiAuthentication workloadClient={workloadClient} />
        )}
      </Stack>
    </Stack>
  );
};

export function SamplePage({ workloadClient, history }: PageProps) {
  return (
    <Stack className="editor">
      <Stack className="main">
        <Button
          onClick={() => {
            callNavigationNavigate("workload", "/client-sdk-playground/", workloadClient);
          }}
        >
          Navigate Back
        </Button>
      </Stack>
    </Stack>
  );
}