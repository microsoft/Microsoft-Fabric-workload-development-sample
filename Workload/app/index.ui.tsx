import { createBrowserHistory } from "history";
import React from "react";
import { createRoot } from 'react-dom/client';

import { FluentProvider } from "@fluentui/react-components";
import { createWorkloadClient, InitParams, ItemTabActionContext } from '@ms-fabric/workload-client';

import { fabricLightTheme } from "./theme";
import { App } from "./App";
import { callGetItem } from "./implementation/controller/ItemCRUDController"

export async function initialize(params: InitParams) {
    const workloadClient = createWorkloadClient();

    const history = createBrowserHistory();
    workloadClient.navigation.onNavigate((route) => history.replace(route.targetUrl));
    workloadClient.action.onAction(async function ({ action, data }) {
        const { id } = data as ItemTabActionContext;
        switch (action) {
            case 'item.tab.onInit':            
                try{
                    const itemResult = await callGetItem(
                        workloadClient,
                        id
                    );
                    return {title: itemResult.displayName};
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
    const root = createRoot(document.getElementById('root'));
    root.render(
        <FluentProvider theme={fabricLightTheme}>
            <App history={history} workloadClient={workloadClient} />
        </FluentProvider>
    );
}
