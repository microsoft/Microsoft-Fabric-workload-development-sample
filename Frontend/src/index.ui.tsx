import { createBrowserHistory } from "history";
import React from "react";
import { createRoot } from 'react-dom/client';

import { FluentProvider } from "@fluentui/react-components";
import { createWorkloadClient, InitParams, ItemTabActionContext } from '@ms-fabric/workload-client';

import { fabricLightTheme } from "./theme";
import { App } from "./App";
import { callItemGet } from "./ItemEditor/ItemEditorController"

export async function initialize(params: InitParams) {
    const workloadClient = createWorkloadClient();

    const history = createBrowserHistory();
    workloadClient.navigation.onNavigate((route) => history.replace(route.targetUrl));
    workloadClient.action.onAction(async function ({ action, data }) {
        const { id } = data as ItemTabActionContext;
        switch (action) {
            case 'item.tab.onInit':
            case 'calculatorSampleItem.tab.onInit':            
                try{
                    const itemResult = await callItemGet(
                        id,
                        workloadClient
                    );
                    return {title: itemResult.displayName};
                } catch (error) {
                    console.error(
                        `Error loading the Item (object ID:${id})`,
                        error
                    );
                    return {};
                }
            case 'calculatorSampleItem.tab.canDeactivate':
                return { canDeactivate: true };
            case 'calculatorSampleItem.tab.onDeactivate':
                return {};
            case 'samplecalculatorSampleItem.tab.canDestroy':
                return { canDestroy: true };
            case 'calculatorSampleItem.tab.onDestroy':
                return {};
            case 'calculatorSampleItem.tab.onDelete':
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
