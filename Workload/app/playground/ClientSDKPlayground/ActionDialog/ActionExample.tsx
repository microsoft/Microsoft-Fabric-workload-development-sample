import React from 'react';
import { Button } from '@fluentui/react-components';
import { PanelRightExpand20Regular } from '@fluentui/react-icons';
import { callActionExecute } from "../../../controller/ActionController";
import "../../../styles.scss";
import { TabContentProps } from '../ClientSDKPlaygroundModel';


export function ActionExample(props: TabContentProps) {
  const { sampleWorkloadName, workloadClient } = props;

  async function onCallExecuteAction() {
    callActionExecute(workloadClient, "sample.Action", sampleWorkloadName);
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