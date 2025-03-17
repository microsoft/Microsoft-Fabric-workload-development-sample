import React, { useState } from 'react';
import {
    Field,
    Input,
    Tooltip,
    Button,
    Combobox,
    Option,
} from '@fluentui/react-components';
import { PanelRightExpand20Regular } from '@fluentui/react-icons';
import { TabContentProps } from '../../../models/SampleWorkloadModel';
import { callDialogOpenMsgBox } from "../../../controller/SampleWorkloadController";
import "../../../styles.scss";


export function MessageBoxExample(props: TabContentProps) {
    const { workloadClient } = props
    const [apiDialogMsgboxTitle, setApiDialogMsgboxTitle] = useState<string>("");
    const [apiDialogMsgboxContent, setApiDialogMsgboxContent] = useState<string>("");
    const [apiDialogMsgboxLink, setApiDialogMsgboxLink] = useState<string>("");
    const [apiDialogMsgboxButtonCount, setApiDialogMsgboxButtonCount] = useState<number>(0);
    const msgboxButtonCountOptions = ["0", "1", "2", "3"];

    async function onCallOpenMessageBox() {
        const buttonNames: string[] = [];
        for (let i = 1; i <= apiDialogMsgboxButtonCount; ++i) {
            buttonNames.push(`Button ${i}`);
        }
        callDialogOpenMsgBox(
            apiDialogMsgboxTitle,
            apiDialogMsgboxContent,
            buttonNames,
            workloadClient,
            apiDialogMsgboxLink
        );
    }

    return (
        <div className="section">
            <Field
                label="Message Box Title"
                orientation="horizontal"
                className="field"
            >
                <Input
                    size="small"
                    placeholder="Title"
                    value={apiDialogMsgboxTitle}
                    onChange={(e) => setApiDialogMsgboxTitle(e.target.value)}
                />
            </Field>
            <Field
                label="Message Box Content"
                orientation="horizontal"
                className="field"
            >
                <Input
                    size="small"
                    placeholder="Content..."
                    value={apiDialogMsgboxContent}
                    onChange={(e) => setApiDialogMsgboxContent(e.target.value)}
                />
            </Field>
            <Tooltip
                content="Link must start with 'https://', and can't be window's origin or belong to one of Fabric's known domains (such as 'powerbi.com', 'fabric.microsoft.com' or 'windows.net')"
                relationship="label"
            >
                <Field
                    label="Message Box Link"
                    orientation="horizontal"
                    className="field"
                >
                    <Input
                        size="small"
                        placeholder="Link"
                        value={apiDialogMsgboxLink}
                        onChange={(e) => setApiDialogMsgboxLink(e.target.value)}
                    />
                </Field>
            </Tooltip>
            <Combobox
                placeholder="Buttons count"
                value={apiDialogMsgboxButtonCount.toString()}
                onOptionSelect={(_, opt) =>
                    setApiDialogMsgboxButtonCount(Number.parseInt(opt.optionValue))
                }
            >
                {msgboxButtonCountOptions.map((option) => (
                    <Option key={option}>{option}</Option>
                ))}
            </Combobox>
            <Button
                appearance="primary"
                icon={<PanelRightExpand20Regular />}
                onClick={onCallOpenMessageBox}
            >
                Open Dialog Message Box
            </Button>
        </div>
    );
};