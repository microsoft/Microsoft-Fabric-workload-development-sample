import React, { useEffect, useState } from "react";
import { Stack } from "@fluentui/react";
import {
  Divider,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Label,
  Input,
  Button,
  Checkbox,
  Switch,
  Radio,
  RadioGroup,
  useId,
} from "@fluentui/react-components";
import { Save24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import {
  callLanguageGet,
  callSettingsOnChange,
} from "../../controller/SampleWorkloadController";
import { TabContentProps } from '../../models/SampleWorkloadModel';
import "./../../styles.scss";

export function UIComponentsExample(props: TabContentProps) {
  const { workloadClient } = props;
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState<string>('en-US');

  const radioName = useId("radio");
  const labelId = useId("label");
  const inputId = useId("input");

  document.body.dir = i18n.dir();

  useEffect(() => {
    callLanguageGet(workloadClient).then((lang) => setLang(lang));
    // register Settings.onChange
    callSettingsOnChange(workloadClient, i18n.changeLanguage);
  }, []);

  return (
    <span>
      {/* List of common UI Components */}
      <div className={i18n.dir()}>
        <MessageBar>
          <MessageBarBody>
            <MessageBarTitle>
              {lang !== "en-US" ? t("Language_Changed_Title") : t("Default_Language_Title")}
            </MessageBarTitle>
            {t("Language_Changed_Message")} {lang}
          </MessageBarBody>
        </MessageBar>
      </div>
      <Divider alignContent="start" className="margin-top">
        Components
      </Divider>
      <div className="section">
        {/* Label and Input */}
        <Stack
          horizontal
          tokens={{ childrenGap: 10 }}
          style={{ padding: "10px" }}
        >
          <Label htmlFor={inputId}>Sample input</Label>
          <Input id={inputId} size="small" placeholder="hint" />
        </Stack>
        {/* Buttons */}
        <Stack
          horizontal
          tokens={{ childrenGap: 10 }}
          style={{ padding: "10px" }}
        >
          <Button icon={<Save24Regular />} appearance="primary">
            Primary
          </Button>
          <Button icon={<Save24Regular />} appearance="secondary">
            Default
          </Button>
          <Button icon={<Save24Regular />} appearance="outline">
            Outline
          </Button>
          <Button icon={<Save24Regular />} appearance="subtle">
            Subtle
          </Button>
        </Stack>
        {/* Checkbox, Switch and Radio */}
        <Checkbox title="my title" label="Checkbox sample" />
        <Switch label="Switch sample" />
        <Label id={labelId}>Radio group</Label>
        <RadioGroup aria-labelledby={labelId} defaultValue="option1">
          <Radio name={radioName} value="option1" label="Option 1" />
          <Radio name={radioName} value="option2" label="Option 2" />
          <Radio name={radioName} value="option3" label="Option 3" />
        </RadioGroup>
      </div>
    </span>
  );
};