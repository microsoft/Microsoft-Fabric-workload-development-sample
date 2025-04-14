import React, { useEffect, useState } from 'react';
import {
  TabList,
  Tab,
  SelectTabData,
  TabValue,
  Button,
} from '@fluentui/react-components';
import { Stack } from '@fluentui/react';
import { ApiNotification } from './ApiNotification';
import { ApiActionDialog } from './ActionDialog/ApiActionDialog';
import { ApiPanelSettings } from './ApiPanelSettings';
import { ApiNavigation } from './ApiNavigation';
import { ApiData } from './ApiData';
import { UIComponentsExample } from './UIComponents';
import { ApiAuthentication } from './ApiAuthentication';
import { ApiAuthenticationFrontend } from './ApiAuthenticationFrontend';
import { TabContentProps } from '../../models/SampleWorkloadModel';
import { PageProps } from 'src/App';
import { callNavigationBeforeNavigateAway, callNavigationNavigate } from "../../controller/SampleWorkloadController";
import "./../../styles.scss";

export function ClientSDKPlayground(props: TabContentProps) {
  const { workloadClient } = props;
  const [selectedApiTab, setSelectedApiTab] = useState<TabValue>("apiNotification");
  const sampleWorkloadName = process.env.WORKLOAD_NAME;

  useEffect(() => {
    // Controller callbacks registrations:
    // register Blocking in Navigate.BeforeNavigateAway (for a forbidden url)
    callNavigationBeforeNavigateAway(workloadClient);

    // Check session storage for a desired tab
    const storedTab = sessionStorage.getItem("selectedTab");
    if (storedTab) {
      setSelectedApiTab(storedTab as TabValue);
      // Remove it so next time we open fresh at default
      sessionStorage.removeItem("selectedTab");
    }
  }, [workloadClient]);


  return (
    <Stack className="editor" >
      <TabList
        className="tabListContainer"
        selectedValue={selectedApiTab}
        data-testid="item-editor-selected-tab-btn"
        onTabSelect={(_, data: SelectTabData) => setSelectedApiTab(data.value)}
      >
        <Tab value="apiNotification">Notification</Tab>
        <Tab value="apiActionDialog">Action & Dialog</Tab>
        <Tab value="apiPanelSettings">Panel & Settings</Tab>
        <Tab value="apiNavigation">Navigation</Tab>
        <Tab value="dataHub">Data Hub</Tab>
        <Tab value="uiComponents">UI Components</Tab>
        <Tab value="authentication">Backend Authentication</Tab>
        <Tab value="authenticationFrontend">Frontend Authentication (Private-Preview)</Tab>
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
            sessionStorage.setItem("selectedTab", "apiNavigation");
            callNavigationNavigate("workload", "/client-sdk-playground/", workloadClient);
          }

          }
        >
          Navigate Back
        </Button>
      </Stack>
    </Stack>
  );
}