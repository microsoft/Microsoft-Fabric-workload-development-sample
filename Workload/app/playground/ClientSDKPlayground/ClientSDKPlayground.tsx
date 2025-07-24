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
import { RootState } from "../ClientSDKPlaygroundStore/Store"
import { setSelectedTab } from "../ClientSDKPlaygroundStore/tabsSlice";
import { ApiNotification } from './ApiNotification';
import { ApiActionDialog } from './ActionDialog/ApiActionDialog';
import { ApiPanelSettings } from './ApiPanelSettings';
import { ApiNavigation } from './ApiNavigation';
import { ApiData } from './ApiData';
import { UIComponentsExample } from './UIComponents';
import { ApiAuthenticationFrontend } from './ApiAuthenticationFrontend';
import { ApiAuthentication } from './ApiAuthentication';
import { PageProps } from '../../App';
import { callNavigationBeforeNavigateAway, callNavigationNavigate } from "../../controller/NavigationController";
import "../../styles.scss";
import { ApiArtifactCrudPublic } from './ApiArtifactCrudPublic';
import SampleSparkTerminal from '../../samples/views/SampleSparkTerminal/SampleSparkTerminal';
import { TabContentProps } from './ClientSDKPlaygroundModel';


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
        <Tab value="authenticationFrontend">Frontend Authentication</Tab>
        <Tab value="publicJSCrud">Public Definition JS API</Tab>
        <Tab value="sparkTerminal">Spark Terminal</Tab>
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
        {selectedApiTab === 'authenticationFrontend' && (
          <ApiAuthenticationFrontend workloadClient={workloadClient} />
        )}
        {selectedApiTab === 'publicJSCrud' && (
          <ApiArtifactCrudPublic workloadClient={workloadClient} />
        )}
        {selectedApiTab === 'sparkTerminal' && (
          <SampleSparkTerminal workloadClient={workloadClient} />
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
            callNavigationNavigate(workloadClient, "workload", "/client-sdk-playground/");
          }}
        >
          Navigate Back
        </Button>
      </Stack>
    </Stack>
  );
}