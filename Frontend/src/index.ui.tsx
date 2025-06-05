import { createBrowserHistory } from "history";
import React from "react";
import { createRoot } from 'react-dom/client';

import { FluentProvider } from "@fluentui/react-components";
import { createWorkloadClient, InitParams, ItemTabActionContext } from '@ms-fabric/workload-client';

import { fabricLightTheme } from "./theme";
import { App } from "./App";
import { convertGetItemResultToWorkloadItem } from "./utils";
import { callItemGet, callPublicItemGetDefinition } from "./controller/SampleWorkloadController";
import { ItemPayload } from "./models/SampleWorkloadModel";

export async function initialize(params: InitParams) {
    const workloadClient = createWorkloadClient();

    const history = createBrowserHistory();
    workloadClient.navigation.onNavigate((route) => history.replace(route.targetUrl));
    workloadClient.action.onAction(async function ({ action, data }) {
        switch (action) {
            case 'sample.tab.onInit':
                const { id } = data as ItemTabActionContext;
                try{
                    const getItemResult = await callItemGet(
                        id,
                        workloadClient
                    );
                    const getItemDefinitionResult = await callPublicItemGetDefinition(id, workloadClient);
                    const item = convertGetItemResultToWorkloadItem<ItemPayload>(getItemResult, getItemDefinitionResult);
                    return {title: item.displayName};
                } catch (error) {
                    console.error(
                        `Error loading the Item (object ID:${id})`,
                        error
                    );
                    return {};
                }
            case 'sample.tab.canDeactivate':
                return { canDeactivate: true };
            case 'sample.tab.onDeactivate':
                return {};
            case 'sample.tab.canDestroy':
                return { canDestroy: true };
            case 'sample.tab.onDestroy':
                return {};
            case 'sample.tab.onDelete':
                return {};
            default:
                throw new Error('Unknown action received');
        }
    });
    const root = createRoot(document.getElementById('root'));
    root.render(
        <FluentProvider theme={fabricLightTheme}>
            <App history={history} workloadClient={workloadClient} />
        </FluentProvider>
    );
}
