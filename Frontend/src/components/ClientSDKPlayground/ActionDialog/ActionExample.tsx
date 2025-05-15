import React from 'react';
import { Button } from '@fluentui/react-components';
import { PanelRightExpand20Regular } from '@fluentui/react-icons';
import { TabContentProps } from '../../../models/SampleWorkloadModel';
import { callActionExecute } from "../../../controller/SampleWorkloadController";
import "../../../styles.scss";


export function ActionExample(props: TabContentProps) {
  const { sampleWorkloadName, workloadClient } = props;

  async function onCallExecuteAction() {
    callActionExecute("sample.Action", sampleWorkloadName, workloadClient);
  }

  return (
    <div className="section">
      <Button
        appearance="primary"
        icon={<PanelRightExpand20Regular />}
        onClick={onCallExecuteAction}
      >
        Execute an Action
      </Button>
    </div>
  );
};