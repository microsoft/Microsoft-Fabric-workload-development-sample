import { createBrowserHistory } from "history";
import React from "react";
import { createRoot } from 'react-dom/client';

import { FluentProvider } from "@fluentui/react-components";
import { createWorkloadClient, InitParams, ItemTabActionContext } from '@ms-fabric/workload-client';

import { fabricLightTheme } from "./theme";
import { App } from "./App";
import { callGetItem } from "./implementation/controller/ItemCRUDController"

export async function initialize(params: InitParams) {
    console.log('🚀 UI: Initialization started with params:', params);
    
    const workloadClient = createWorkloadClient();
    console.log('✅ UI: WorkloadClient created successfully');

    const history = createBrowserHistory();
    console.log('✅ UI: Browser history created successfully');
    
    workloadClient.navigation.onNavigate((route) => {
        console.log('🧭 UI: Navigation event:', route);
        history.replace(route.targetUrl);
    });
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
    
    console.log('🔍 Looking for root element...');
    const rootElement = document.getElementById('root');
    if (!rootElement) {
        console.error('❌ Root element not found!');
        document.body.innerHTML = '<div style="padding: 20px; color: red;">❌ Error: Root element not found</div>';
        return;
    }
    console.log('✅ Root element found:', rootElement);
    
    try {
        const root = createRoot(rootElement);
        console.log('✅ React root created successfully');
        
        console.log('🎨 Rendering App component...');
        root.render(
            <FluentProvider theme={fabricLightTheme}>
                <App history={history} workloadClient={workloadClient} />
            </FluentProvider>
        );
        console.log('✅ UI: ready for use.');
    } catch (error) {
        console.error('❌ Error during React rendering:', error);
        rootElement.innerHTML = `
            <div style="padding: 20px; color: red; font-family: monospace;">
                <h2>❌ React Rendering Error</h2>
                <p>Error: ${error.message}</p>
                <pre>${error.stack}</pre>
            </div>
        `;
    }

}
