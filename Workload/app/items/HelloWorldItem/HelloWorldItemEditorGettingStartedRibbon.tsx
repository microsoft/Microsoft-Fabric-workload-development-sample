/**
 * HelloWorldItemEditorGettingStartedRibbon.tsx
 */
import React from "react";
import { Toolbar } from '@fluentui/react-toolbar';
import {
  ToolbarButton, Tooltip, Button
} from '@fluentui/react-components';
import {
  Save24Regular,
  Settings24Regular,
  ArrowLeft20Regular
} from "@fluentui/react-icons";
import { PageProps } from '../../App';
import { useTranslation } from "react-i18next";
import '../../styles.scss';

export interface HelloWorldItemEditorGettingStartedRibbonProps extends PageProps {
  openSettingsCallback: () => Promise<void>;
  navigateToEmptyStateCallback: () => void;
  featureName?: string;
}

const GettingStartedToolbar: React.FC<HelloWorldItemEditorGettingStartedRibbonProps> = (props) => {
  const { t } = useTranslation();
  return (
    <Toolbar>
      <Tooltip content={t("ItemEditor_Ribbon_Save_Label")} relationship="label">
        <ToolbarButton
          disabled
          aria-label={t("ItemEditor_Ribbon_Save_Label")}
          data-testid="item-editor-save-btn"
          icon={<Save24Regular />}
        />
      </Tooltip>
      <Tooltip content={t("ItemEditor_Ribbon_Settings_Label")} relationship="label">
        <ToolbarButton
          aria-label={t("ItemEditor_Ribbon_Settings_Label")}
            data-testid="item-editor-settings-btn"
            icon={<Settings24Regular />}
            onClick={props.openSettingsCallback}
        />
      </Tooltip>
    </Toolbar>
  );
};

export function HelloWorldItemEditorGettingStartedRibbon(props: HelloWorldItemEditorGettingStartedRibbonProps) {
  const { t } = useTranslation();

  const handleBack = () => props.navigateToEmptyStateCallback();

  return (
    <div className="ribbon getting-started-ribbon">
      <div className="back-to-home-header">
        <Button
          appearance="subtle"
          icon={<ArrowLeft20Regular />}
          onClick={handleBack}
          className="back-to-home-button"
          data-testid="back-to-home-btn"
        >
          {t("ItemEditor_Ribbon_BackToHome_Label", "Back to Home tab")}
        </Button>
      </div>

      <div className="toolbarContainer getting-started-toolbar">
        <GettingStartedToolbar {...props} />
      </div>
    </div>
  );
}