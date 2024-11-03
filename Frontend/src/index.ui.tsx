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
import { ItemTabActionContext } from './models/SampleWorkloadModel';

export async function initialize(params: InitParams) {
    const workloadClient = createWorkloadClient();
    workloadClient.action.onAction(async function ({ action, data }) {
        switch (action) {
            case 'item.tab.onInit':
                const { id } = data as ItemTabActionContext;
                try{
                    const getItemResult = await callItemGet(
                        id,
                        workloadClient
                    );
                    const item = convertGetItemResultToWorkloadItem<ItemPayload>(getItemResult);
                    return {title: item.displayName};
                } catch (error) {
                    console.error(
                        `Error loading the Item (object ID:${id})`,
                        error
                    );
                    return {};
                }
            case 'item.tab.canDeactivate':
                return { canDeactivate: true };
            case 'item.tab.onDeactivate':
                return {};
            case 'item.tab.canDestroy':
                return { canDestroy: true };
            case 'item.tab.onDestroy':
                return {};
            case 'item.tab.onDelete':
                return {};
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
