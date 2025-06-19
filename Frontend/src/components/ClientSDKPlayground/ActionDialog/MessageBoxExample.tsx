import React from 'react';
import { useDispatch, useSelector } from "react-redux";
import {
    Field,
    Input,
    Tooltip,
    Button,
    Combobox,
    Option,
} from '@fluentui/react-components';
import { PanelRightExpand20Regular } from '@fluentui/react-icons';
import { RootState } from "../../../ClientSDKPlaygroundStore/Store";
import {
    updateMessageBoxTitle,
    updateMessageBoxMessage,
    updateMessageBoxLink,
    updateButtonCount
} from "../../../ClientSDKPlaygroundStore/actionDialogSlice";
import { TabContentProps } from '../../../models/SampleWorkloadModel';
import { callDialogOpenMsgBox } from "../../../controller/SampleItemEditorController";
import "../../../styles.scss";


export function MessageBoxExample(props: TabContentProps) {
    const { workloadClient } = props
    const dispatch = useDispatch();
    const {
        apiDialogMsgboxTitle,
        apiDialogMsgboxContent,
        apiDialogMsgboxLink,
        apiDialogMsgboxButtonCount,
    } = useSelector((state: RootState) => state.actionDialog);
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
                    onChange={(e) => dispatch(updateMessageBoxTitle(e.target.value))}
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
                    onChange={(e) => dispatch(updateMessageBoxMessage(e.target.value))}
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
                        onChange={(e) => dispatch(updateMessageBoxLink(e.target.value))}
                    />
                </Field>
            </Tooltip>
            <Combobox
                placeholder="Buttons count"
                value={apiDialogMsgboxButtonCount.toString()}
                onOptionSelect={(_, opt) =>
                    dispatch(updateButtonCount(parseInt(opt.optionValue)))
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