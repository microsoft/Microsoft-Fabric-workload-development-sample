import React from "react";
import { Provider } from "react-redux";
import { ClientSDKStore } from "./playground/ClientSDKPlaygroundStore/Store";
import { Route, Router, Switch } from "react-router-dom";
import { History } from "history";
import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import CustomItemSettings from "./items/HelloWorldItem/HelloWorldItemEditorSettingsPage";
import CustomAbout from "./items/HelloWorldItem/HelloWorldItemEditorAboutPage";
import { SamplePage, ClientSDKPlayground } from "./playground/ClientSDKPlayground/ClientSDKPlayground";
import { DataPlayground } from "./playground/DataPlayground/DataPlayground";
import { CognitiveSampleItemEditor } from "./samples/items/CognitiveSampleItem/CognitiveSampleItemEditor";


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
    console.log('🎯 App component rendering with history:', history);
    console.log('🎯 Current location:', history.location);

    return <Router history={history}>
        {/* Test route for debugging */}
        <Route exact path="/">
            <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
                <h1>🎉 Workload is running!</h1>
                <p>Current URL: {window.location.href}</p>
                <p>Workload Name: {process.env.WORKLOAD_NAME}</p>
            </div>
        </Route>    
        <Switch>
            {/* Test route for debugging */}
            <Route exact path="/">
                <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
                    <h1>🎉 Workload is running!</h1>
                    <p>Current URL: {window.location.href}</p>
                    <p>Workload Name: {process.env.WORKLOAD_NAME}</p>
                </div>
            </Route>            
            {/* Routing to the Empty Item Editor */}
            <Route path="/HelloWorldItem-editor/:itemObjectId">
                <HelloWorldItemEditor
                    workloadClient={workloadClient} data-testid="HelloWorldItem-editor" />
            </Route>  
            <Route path="/HelloWorldItem-settings-page">
                <CustomItemSettings data-testid="HelloWorldItem-settings-page" />
            </Route>
            <Route path="/HelloWorldItem-about-page">
                <CustomAbout  data-testid="HelloWorldItem-about-page" />
            </Route>

            <Route path="/CalculatorSampleItem-editor/:itemObjectId">
                <CalculatorSampleItemEditor
                    workloadClient={workloadClient} data-testid="CalculatorSampleItem-editor" />
            </Route>
            <Route path="/CalculatorSampleItem-settings-page">
                <CustomItemSettings data-testid="CalculatorSampleItem-settings-page" />
            </Route>
            <Route path="/CalculatorSampleItem-about-page">
                <CustomAbout  data-testid="CalculatorSampleItem-about-page" />
            </Route>

            <Route path="/CognitiveSampleItem-editor/:itemObjectId">
                <CognitiveSampleItemEditor
                    workloadClient={workloadClient} data-testid="CognitiveSampleItem-editor" />
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