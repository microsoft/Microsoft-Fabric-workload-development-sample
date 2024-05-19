import { createBrowserHistory } from "history";
import React from "react";
import ReactDOM from "react-dom";

import { FluentProvider } from "@fluentui/react-components";
import { createWorkloadClient, InitParams } from '@ms-fabric/workload-client';

import { fabricLightTheme } from "./theme";
import { App } from "./App";

export async function initialize(params: InitParams) {
    const workloadClient = createWorkloadClient();

    const history = createBrowserHistory();
    workloadClient.navigation.onNavigate((route) => history.replace(route.targetUrl));

    ReactDOM.render(
        <FluentProvider theme={fabricLightTheme}>
            <App history={history} workloadClient={workloadClient} />
        </FluentProvider>,
        document.querySelector("#root")
    );
}
