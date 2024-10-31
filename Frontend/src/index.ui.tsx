import { createBrowserHistory } from "history";
import React from "react";
import ReactDOM from "react-dom";

import { FluentProvider } from "@fluentui/react-components";
import { createWorkloadClient, InitParams } from '@ms-fabric/workload-client';

import { fabricLightTheme } from "./theme";
import { App } from "./App";
import { convertGetItemResultToWorkloadItem } from "./utils";
import { callItemGet } from "./controller/SampleWorkloadController";
import { ItemPayload } from "./models/SampleWorkloadModel";
import { DataWithId } from './models/SampleWorkloadModel';

export async function initialize(params: InitParams) {
    const workloadClient = createWorkloadClient();
    workloadClient.action.onAction(async function ({ action, data }) {
        switch (action) {
            case 'sample.tab.onInit':
                const { id } = data as DataWithId;
                const getItemResult = await callItemGet(
                    id,
                    workloadClient
                );
                const item = convertGetItemResultToWorkloadItem<ItemPayload>(getItemResult);
                return {title: item.displayName};
            default:
                throw new Error('Unknown action received');
        }
    });
    const history = createBrowserHistory();
    workloadClient.navigation.onNavigate((route) => history.replace(route.targetUrl));

    ReactDOM.render(
        <FluentProvider theme={fabricLightTheme}>
            <App history={history} workloadClient={workloadClient} />
        </FluentProvider>,
        document.querySelector("#root")
    );
}
