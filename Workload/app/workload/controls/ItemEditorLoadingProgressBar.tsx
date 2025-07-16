import React from 'react';
import { Label, ProgressBar } from '@fluentui/react-components';
import { Stack } from "@fluentui/react";

export const ItemEditorLoadingProgressBar = ({ message }: { message: string }) => (
    <Stack 
    verticalAlign="center" 
    horizontalAlign="center" 
    styles={{ root: { height: '100vh' } }}
    tokens={{ childrenGap: 20 }}
    >
        <Label weight="semibold" size="large">{message}</Label>
        <ProgressBar thickness="medium" style={{ width: '50%' }} />
    </Stack>
);

export default ItemEditorLoadingProgressBar;
