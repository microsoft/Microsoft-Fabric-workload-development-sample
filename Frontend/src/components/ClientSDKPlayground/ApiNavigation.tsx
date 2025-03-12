import React from "react";
import { Button, Divider, Label } from "@fluentui/react-components";
import { PanelRightExpand20Regular } from "@fluentui/react-icons";
import { callNavigationNavigate, callPageOpen, CallOpenInNewBrowserTab } from "../../controller/SampleWorkloadController";
import { TabContentProps } from '../../models/SampleWorkloadModel';
import "./../../styles.scss";

export function ApiNavigation(props: TabContentProps) {
    const { sampleWorkloadName, workloadClient } = props;

    async function onCallOpenPage() {
        await callPageOpen(sampleWorkloadName, `/sample-page`, workloadClient);
    }
    async function onCallNavigate(path: string) {
        await callNavigationNavigate("workload", path, workloadClient);
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
                      CallOpenInNewBrowserTab("https://example.com/help", workloadClient)
                    }
                  >
                    Open a link in a new tab
                  </Button>
            </div>
        </span>
    );
}