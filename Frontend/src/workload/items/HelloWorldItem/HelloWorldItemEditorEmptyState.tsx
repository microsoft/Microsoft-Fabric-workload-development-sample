import React, { useState } from "react";
import { Stack } from "@fluentui/react";
import { Text, Button, Input } from "@fluentui/react-components";
import "./../../../styles.scss";
import { useTranslation } from "react-i18next";
import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { GenericItem } from "src/workload/models/ItemCRUDModel";
import { HelloWorldItemModelState } from "./HelloWorldItemModel";


interface HelloWorldItemEmptyStateProps {
  workloadClient: WorkloadClientAPI,
  item: GenericItem;
  state: HelloWorldItemModelState,
  onFinishEmptyState: (message: string) => void;
}

export const HelloWorldItemEmptyState: React.FC<HelloWorldItemEmptyStateProps> = ({
  workloadClient,
  item,
  state,
  onFinishEmptyState
}) => {
  const [message, setMessage] = useState<string>(`Hello ${item.displayName}!`);
  const { t } = useTranslation();
  
  const saveItem = () => {
    onFinishEmptyState(message);
  };
  
  return (
    <Stack className="empty-state-container" horizontalAlign="center" tokens={{ childrenGap: 16 }}>
      <Stack.Item>
        <img
          src="/assets/images/HelloWorldItem-empty-state.jpg"
          alt="Empty state illustration"
          className="empty-state-image"
        />
      </Stack.Item>
      <Stack.Item>
        <Text as="h2" size={800} weight="semibold">
          Your item has been created!
        </Text>
      </Stack.Item>
      <Stack.Item style={{ marginTop: '16px', marginBottom: '24px' }}>
        <Text>
          {t('HelloWorldItem_EmptyState_Message', {itemName: item.displayName})}
        </Text>
      </Stack.Item>
      <Stack.Item style={{ width: '300px', marginTop: '16px' }}>
        <Input
          placeholder="Enter your message"
          value={message}
          onChange={(e, data) => setMessage(data.value)}
        />
      </Stack.Item>
      <Stack.Item style={{ marginTop: '16px' }}>
        <Button appearance="primary" onClick={saveItem}>
          {t('HelloWorldItem_EmptyState_Button')}
        </Button>
      </Stack.Item>
    </Stack>
  );
};
