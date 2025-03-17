import React, { useState } from "react";
import { Divider, Switch, Button } from "@fluentui/react-components";
import { PanelRightExpand20Regular } from "@fluentui/react-icons";
import {
    callPanelOpen,
    callDialogOpenMsgBox,
    themeToView,
    callThemeGet,
    settingsToView,
    callSettingsGet,
} from "../../controller/SampleWorkloadController";
import { TabContentProps } from '../../models/SampleWorkloadModel';
import "./../../styles.scss";

export function ApiPanelSettings(props: TabContentProps) {
    const { sampleWorkloadName, workloadClient } = props;
    const [apiPanelIsLightDismiss, setApiPanelIsLightDismiss] =
        useState<boolean>(false);

    async function onCallOpenPanel() {
        callPanelOpen(
            sampleWorkloadName,
            "/panel",
            apiPanelIsLightDismiss,
            workloadClient
        );
    }

    async function onCallThemeGet() {
        const themeString: string = themeToView(await callThemeGet(workloadClient));
        callDialogOpenMsgBox(
            "Theme Configuration",
            themeString,
            ["OK"],
            workloadClient
        );
    }

    async function onCallSettingsGet() {
        const settingsString: string = settingsToView(
            await callSettingsGet(workloadClient)
        );
        callDialogOpenMsgBox(
            "Settings Configuration",
            settingsString,
            ["OK"],
            workloadClient
        );
    }

    return (
        <span>
            {/* Panel API usage example */}
            <Divider alignContent="start">Panel</Divider>
            <div className="section">
                <Switch
                    label="Clicking outside of Panel closes it"
                    onChange={(e) => setApiPanelIsLightDismiss(e.target.checked)}
                />
                <Button
                    appearance="primary"
                    icon={<PanelRightExpand20Regular />}
                    onClick={onCallOpenPanel}
                >
                    Open Panel
                </Button>
            </div>
            {/* Theme API usage example */}
            <Divider alignContent="start">Theme</Divider>
            <div className="section">
                <Button
                    appearance="primary"
                    icon={<PanelRightExpand20Regular />}
                    onClick={onCallThemeGet}
                >
                    Get Theme Settings
                </Button>
            </div>
            {/* Settings API usage example */}
            <Divider alignContent="start">Settings</Divider>
            <div className="section">
                <Button
                    appearance="primary"
                    icon={<PanelRightExpand20Regular />}
                    onClick={onCallSettingsGet}
                >
                    Get Host Settings
                </Button>
            </div>
        </span>
    );
};