import React from 'react';
import { Button } from '@fluentui/react-components';
import { PanelRightExpand20Regular } from '@fluentui/react-icons';
import { callActionExecute } from "../../../samples/controller/CalculatorSampleItemEditorController";
import "../../../styles.scss";
import { TabContentProps } from '../ClientSDKPlaygroundModel';


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