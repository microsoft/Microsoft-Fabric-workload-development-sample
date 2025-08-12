import React from 'react';
import { Stack } from '@fluentui/react';
import { Text } from '@fluentui/react-components';
import { PageProps } from '../../App';
import { useTranslation } from 'react-i18next';
import '../../styles.scss';

export function HelloWorldItemEditorSettingsPage(props: PageProps) {
  const { t } = useTranslation();
  console.log("HelloWorldItemEditorSettingsPage rendered with props:", props);
  
  return (
    <div className="settings-panel-container">
      <Stack 
        className="settings-panel-content"
        horizontalAlign="center" 
        verticalAlign="center"
      >
        <Text className="settings-placeholder-text">
          {t('Settings_PlaceholderText', 'Your content will appear here')}
        </Text>
      </Stack>
    </div>
  );
}

export default HelloWorldItemEditorSettingsPage;