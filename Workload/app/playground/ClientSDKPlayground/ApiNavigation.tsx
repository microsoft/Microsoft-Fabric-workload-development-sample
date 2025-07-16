import React from "react";
import { Button, Divider, Label } from "@fluentui/react-components";
import { PanelRightExpand20Regular } from "@fluentui/react-icons";
import { callNavigationNavigate, CallOpenInNewBrowserTab } from "../../workload/controller/NavigationController";
import "../../styles.scss";
import { TabContentProps } from "./ClientSDKPlaygroundModel";
import { callPageOpen } from "../../workload/controller/PageController";

export function ApiNavigation(props: TabContentProps) {
    const { sampleWorkloadName, workloadClient } = props;

    async function onCallOpenPage() {
        await callPageOpen(workloadClient, sampleWorkloadName, `/sample-page`);
    }
    async function onCallNavigate(path: string) {
        await callNavigationNavigate(workloadClient, "workload", path);
    }

    return (
        <span>
            {/* Navigation and Page API usage example */}
            <Divider alignContent="start">Navigation</Divider>
            <div className="section">
                <Button
                    appearance="primary"
                    icon={<PanelRightExpand20Regular />}
                    onClick={() => onCallOpenPage()}
                >
                    Open Sample Page
                </Button>
                <Button
                    appearance="primary"
                    icon={<PanelRightExpand20Regular />}
                    onClick={() => onCallNavigate(`/sample-page`)}
                >
                    Navigate to Sample Page
                </Button>
                <Label />
                <Label>
                    BeforeNavigateAway callback has been registered to block
                    navigation to a 'forbidden-url'. Clicking the below should
                    NOT navigate away
                </Label>
                <Button
                    appearance="primary"
                    icon={<PanelRightExpand20Regular />}
                    onClick={() => onCallNavigate("/sample-forbidden-url-page")}
                >
                    Attempt to navigate to a Forbidden URL
                </Button>
                <Button
                    appearance="primary"
                    icon={<PanelRightExpand20Regular />}
                    onClick={() =>
                      CallOpenInNewBrowserTab(workloadClient, "https://example.com/help")
                    }
                  >
                    Open a link in a new tab
                  </Button>
            </div>
        </span>
    );
}