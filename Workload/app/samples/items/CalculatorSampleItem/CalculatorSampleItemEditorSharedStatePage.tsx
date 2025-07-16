import React, { useState } from 'react';
import {
  Button,
  Field,
  Input
  } from "@fluentui/react-components";
import { Stack } from "@fluentui/react";
import { WorkloadClientAPI } from '@ms-fabric/workload-client';
import { PageProps, SharedState } from '../../../App';
import { callDialogClose } from '../../../implementation/controller/DialogController';

export function SharedStatePage(props: PageProps) {
  const { workloadClient } = props;

  // declaring the workload's shared state
  const sharedState = workloadClient.state.sharedState as SharedState;

  const [localSharedStateMessage, setLocalSharedStateMessage] = useState<string>(sharedState.message);
  
  async function onSaveClicked(workloadClient: WorkloadClientAPI) {
    sharedState.message = localSharedStateMessage;
    callDialogClose(workloadClient);
  }

  async function onCancelClicked() {
    callDialogClose(workloadClient);
  }

  // HTML page contents
  return (
    <Stack className="shared-state-dialog">
      <Stack className="section">
        <h2>Shared state usage example:</h2>
        <Field label="New Shared State Message:">
          <Input
            size="small"
            placeholder="Message"
            value={localSharedStateMessage}
            onChange={(e) =>
              setLocalSharedStateMessage(e.target.value)
            }
            data-testid="iframe-shared-state-input"
          />
        </Field>
        <Stack className="shared-state-iframe-buttons" horizontal tokens={{ childrenGap: 10 }}>
          <Button appearance="primary" onClick={() => onSaveClicked(workloadClient)} data-testid="save-iframe-shared-state">Save</Button>
          <Button appearance="secondary" onClick={() => onCancelClicked()}>Cancel</Button>
        </Stack>
      </Stack>
    </Stack>
  );
}

export default SharedStatePage;