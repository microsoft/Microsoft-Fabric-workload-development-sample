import * as React from 'react';
import {
    Lightbulb24Regular
  } from "@fluentui/react-icons";
import { PageProps } from 'src/App';
import { Label, Stack } from '@fluentui/react';
import { Button, Radio, RadioGroup, useId } from '@fluentui/react-components';
import { CloseMode, WorkloadClientAPI } from '@ms-fabric/workload-client';

import './../../styles.scss';

export async function callPanelClose(workloadClient: WorkloadClientAPI) {
    await workloadClient.panel.close({ mode: CloseMode.PopOne });
}

// Panel 
export function Panel(props: PageProps) {

    const radioName = useId("radio");
    const labelId = useId("label");

    return (
        <Stack className='panel'>
            <div className='section'>
                <Button icon={<Lightbulb24Regular/>} appearance="primary">Button 1</Button>
            </div>
            <div className='section'>
                <Button icon={<Lightbulb24Regular/>} appearance="primary">Button 2</Button>
            </div>
            <div className='section'>
                <Button icon={<Lightbulb24Regular/>} appearance="primary">Button 3</Button>
            </div>
            <Label id={labelId}>Radio group</Label>
            <RadioGroup  aria-labelledby={labelId} defaultValue="option1">
                <Radio name={radioName} value="option1" label="Option 1" />
                <Radio name={radioName} value="option2" label="Option 2" />
                <Radio name={radioName} value="option3" label="Option 3" />
            </RadioGroup>

            <div className='section'>
                <Button onClick={() => callPanelClose(props.workloadClient)}>Close Panel</Button>
            </div>
        </Stack>
    );
};