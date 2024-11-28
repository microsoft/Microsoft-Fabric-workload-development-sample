import React from "react";
import { Route, Router, Switch } from "react-router-dom";
import { History } from "history";

import { WorkloadClientAPI } from "@ms-fabric/workload-client";

import { SampleWorkloadEditor, SamplePage } from "./components/SampleWorkloadEditor/SampleWorkloadEditor";
import { AdlsApiTester } from './components/SampleWorkloadAuthEditor/SampleWorkloadAuthEditor';
import { Panel } from "./components/SampleWorkloadPanel/SampleWorkloadPanel";
import { SaveAsDialog } from "./components/SampleWorkloadCreateDialog/SampleWorkloadCreateDialog";
import { FabricApiTester } from "./components/SampleWorkloadAuthEditor/FabricApiTester";

/*
    Add your Item Editor in the Route section of the App function below
*/

interface AppProps {
    history: History;
    workloadClient: WorkloadClientAPI;
}

export interface PageProps {
    workloadClient: WorkloadClientAPI;

}

export interface ContextProps {
    itemObjectId?: string;
    workspaceObjectId?: string
}

export function App({ history, workloadClient }: AppProps) {
    return <Router history={history}>
        <Switch>
            {/* This is the routing to the Sample Workload Editor.
                 Add your workload editor path here, and reference it in index.worker.ts  */}
            <Route path="/sample-workload-editor/:itemObjectId">
                <SampleWorkloadEditor
                    workloadClient={workloadClient} />
            </Route>

            {/* This is the routing to the Sample Workload Frontend-ONLY experience.
                 Add your workload creator path here, and reference it in index.worker.ts  */}
            <Route path="/sample-workload-frontend-only">
                <SampleWorkloadEditor
                    workloadClient={workloadClient} />
            </Route>

            {/* This is the routing to the Sample Workload Create Dialog experience, 
                where an Item will be saved and the Editor will be opened
                Add your workload creator path here, and reference it in index.worker.ts  */}
            <Route path="/sample-workload-create-dialog/:workspaceObjectId">
                <SaveAsDialog
                    workloadClient={workloadClient}
                    isImmediateSave={true} />
            </Route>

            {/* Routing to a sample Panel  */}
            <Route path="/panel">
                <Panel
                    workloadClient={workloadClient} />
            </Route>

            {/* Routing to a sample Page  */}
            <Route path="/sample-page">
                <SamplePage workloadClient={workloadClient} />
            </Route>

            {/* Routing to an Authentication Editor */}
            <Route path="/Authentication">
                <AdlsApiTester />
            </Route>
                        {/* Routing to an Authentication Editor */}
                        <Route path="/FabricApiTester">
                <FabricApiTester />
            </Route>
        </Switch>
    </Router>;
}
