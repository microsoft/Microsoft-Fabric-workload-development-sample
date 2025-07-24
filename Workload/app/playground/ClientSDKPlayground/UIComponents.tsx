import React, { useEffect, useState } from "react";
import { Stack } from "@fluentui/react";
import { useDispatch, useSelector } from "react-redux";
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
import "../../styles.scss";
import { TabContentProps } from "./ClientSDKPlaygroundModel";
import { RootState } from "../ClientSDKPlaygroundStore/Store";
import { callLanguageGet, callSettingsOnChange } from "../../controller/SettingsController";
import { setCheckboxChecked, setSampleInput, setSelectedRadio, setSwitchChecked } from "../ClientSDKPlaygroundStore/uiComponentsSlice";

export function UIComponentsExample(props: TabContentProps) {
  const { workloadClient } = props;
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState<string>('en-US');
  const dispatch = useDispatch();

  const {
    sampleInput,
    checkboxChecked,
    selectedRadio,
    switchChecked,
  } = useSelector((state: RootState) => state.uiComponents);

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
          <Input
            id={inputId}
            size="small"
            placeholder="hint"
            value={sampleInput}
            onChange={(e) => dispatch(setSampleInput(e.target.value))}
          />
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
        <Checkbox
          title="my title"
          label="Checkbox sample"
          checked={checkboxChecked}
          onChange={(e) => dispatch(setCheckboxChecked(e.target.checked))}
        />
        <Switch label="Switch sample" checked={switchChecked} onChange={(e) => dispatch(setSwitchChecked(e.target.checked))} />
        <Label id={labelId}>Radio group</Label>
        <RadioGroup aria-labelledby={labelId} value={selectedRadio} onChange={(e, data) => dispatch(setSelectedRadio(data.value))}>
          <Radio name={radioName} value="option1" label="Option 1" />
          <Radio name={radioName} value="option2" label="Option 2" />
          <Radio name={radioName} value="option3" label="Option 3" />
        </RadioGroup>
      </div>
    </span>
  );
};