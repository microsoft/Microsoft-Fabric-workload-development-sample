import React, { useState } from "react";
import { Stack } from "@fluentui/react";
import { Text, Button, Input } from "@fluentui/react-components";
import "./../../../styles.scss";
import { useTranslation } from "react-i18next";


interface HelloWorldItemEmptyStateProps {
  itemName?: string;
  onSayHello: (message: string) => void;
}

export const HelloWorldItemEmptyState: React.FC<HelloWorldItemEmptyStateProps> = ({
  itemName,
  onSayHello
}) => {
  const [message, setMessage] = useState<string>("Hello World!");
  const { t } = useTranslation();
  
  const handleSayHello = () => {
    onSayHello(message);
  };
  
  return (
    <Stack className="empty-state-container" horizontalAlign="center" tokens={{ childrenGap: 16 }}>
      <Stack.Item>
        <img
          src="/assets/images/hello-world-empty-state.jpg"
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
          {t('Item_EmptyState_Message', {itemName: itemName})}
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
        <Button appearance="primary" onClick={handleSayHello}>
          {t('Item_EmptyState_Button')}
        </Button>
      </Stack.Item>
    </Stack>
  );
};