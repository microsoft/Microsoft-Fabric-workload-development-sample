import React from "react";
import { Provider } from "react-redux";
import { ClientSDKStore } from "./playground/ClientSDKPlaygroundStore/Store";
import { Route, Router, Switch } from "react-router-dom";
import { History } from "history";
import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { CalculatorSampleItemEditor } from "./samples/items/CalculatorSampleItem/CalculatorSampleItemEditor";
import CustomItemSettings from "./samples/items/CalculatorSampleItem/CalculatorSampleItemEditorSettingsDialog";
import CustomAbout from "./samples/items/CalculatorSampleItem/CalculatorSampleItemEditorAboutDialog";
import SharedStatePage from "./samples/items/CalculatorSampleItem/CalculatorSampleItemEditorSharedStatePage"
import { SamplePage, ClientSDKPlayground } from "./playground/ClientSDKPlayground/ClientSDKPlayground";
import { DataPlayground } from "./playground/DataPlayground/DataPlayground";
import { HelloWorldItemEditor } from "./workload/items/HelloWorldItem/HelloWorldItemEditor";

/*
    Add your Item Editor in the Route section of the App function below
*/

interface AppProps {
    history: History;
    workloadClient: WorkloadClientAPI;
}

export interface PageProps {
    workloadClient: WorkloadClientAPI;
    history?: History

}

export interface ContextProps {
    itemObjectId?: string;
    workspaceObjectId?: string
    source?: string;
}

export interface SharedState {
    message: string;
}

export function App({ history, workloadClient }: AppProps) {
    return <Router history={history}>
        <Switch>
            {/* Routing to the Empty Item Editor */}
            <Route path="/item-editor/:itemObjectId">
                <HelloWorldItemEditor
                    workloadClient={workloadClient} data-testid="item-editor" />
            </Route>
            {/* This is the routing to the Sample Workload Editor.
                 Add your workload editor path here, and reference it in index.worker.ts  */}
            <Route path="/CalculatorSample-item-editor/:itemObjectId">
                <CalculatorSampleItemEditor
                    workloadClient={workloadClient} data-testid="sample-item-editor" />
            </Route>
            <Route path="/CalculatorSample-item-settings-dialog">
                <CustomItemSettings data-testid="custom-about" />
            </Route>
            <Route path="/CalculatorSample-item-about-dialog">
                <CustomAbout />
            </Route>     

            <Route path="/client-sdk-playground">
                <Provider store={ClientSDKStore}>
                    <ClientSDKPlayground workloadClient={workloadClient} />
                </Provider>
            </Route>
            <Route path="/data-playground">
                <DataPlayground workloadClient={workloadClient} />
            </Route>

             {/* -- TODO: Clean up not needed --*/}
            <Route path="/shared-state-page">
                <SharedStatePage
                    workloadClient={workloadClient} />
            </Route> 
            <Route path="/sample-page">
                <SamplePage workloadClient={workloadClient} />
            </Route>

        </Switch>
    </Router>;
}