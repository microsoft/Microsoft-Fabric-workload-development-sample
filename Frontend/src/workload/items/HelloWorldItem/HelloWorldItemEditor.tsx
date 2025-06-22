import { Label, Stack } from "@fluentui/react";
import { Field, Input, TabValue } from "@fluentui/react-components";
import React, { useEffect, useState } from "react";
import { ContextProps, PageProps } from "src/App";
import { Ribbon } from "./HelloWorldItemRibbon";
import { getWorkloadItem, saveItemState } from "../../controller/ItemCRUDController";
import { WorkloadItem } from "../../models/ItemCRUDModel";
import LoadingProgressBar from "./HelloWorldItemEditorLoadingProgressBar";
import { useLocation, useParams } from "react-router-dom";
import "./../../../styles.scss";
import { useTranslation } from "react-i18next";
import { HelloWorldItemModelState } from "./HelloWorldItemModel";

export function HelloWorldItemEditor(props: PageProps) {
  const pageContext = useParams<ContextProps>();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { workloadClient } = props;
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [payload, setPayload] = useState<string>();
  const [isUnsafed, setIsUnsafed] = useState<boolean>(true);
  const [editorItem, setEditorItem] = useState<WorkloadItem<HelloWorldItemModelState>>(undefined);
  const [selectedTab, setSelectedTab] = useState<TabValue>("home");

  useEffect(() => {
      loadDataFromUrl(pageContext, pathname);
    }, [pageContext, pathname]);

  async function SaveItem() {

    var successResult = await saveItemState<HelloWorldItemModelState>(
      workloadClient,
      editorItem.id,
      editorItem.itemState);
    setIsUnsafed(!successResult);
  }

  async function loadDataFromUrl(pageContext: ContextProps, pathname: string): Promise<void> {
    setIsLoadingData(true);
    if (pageContext.itemObjectId) {
      // for Edit scenario we get the itemObjectId and then load the item via the workloadClient SDK
      try {
        const item = await getWorkloadItem<HelloWorldItemModelState>(
          workloadClient,
          pageContext.itemObjectId,          
        );
        setEditorItem(item);
        if(!item.itemState){
          item.itemState =  {
              message: undefined,
            };
        }
        setPayload(item.itemState.message);
        setSelectedTab("home");
      } catch (error) {
        setEditorItem(undefined);        
      }
    } else {
      console.log(`non-editor context. Current Path: ${pathname}`);
      setEditorItem(undefined);
    }
    setIsUnsafed(false);
    setIsLoadingData(false);
  }

  function onUpdateItemPayload(newPayload: string) {
    setIsUnsafed(true)
    setPayload(newPayload);
    editorItem.itemState.message = newPayload
  }

  // HTML page contents
  if (isLoadingData) {
    return <LoadingProgressBar message="Loading..." />;
  }
  return (
      <Stack className="editor" data-testid="item-editor-inner">
      <Ribbon
          {...props}        
          isSaveButtonEnabled={isUnsafed}
          saveItemCallback={SaveItem}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
      />

      <Stack className="main">
          {["home"].includes(selectedTab as string) && (
          <span>
              <h2>{t('Item_Editor_Titel')}</h2>            
              <div>
                {editorItem && (
                  <div className="section" data-testid='item-editor-metadata' >
                    <Field label={t('Workspace_ID')} orientation="horizontal" className="field">
                      <Label>{editorItem?.workspaceId} </Label>
                    </Field>
                    <Field label={t('Item_ID')} orientation="horizontal" className="field">
                      <Label>{editorItem?.id} </Label>
                    </Field>
                    <Field label={t('Item_Type')} orientation="horizontal" className="field">
                      <Label>{editorItem?.type} </Label>
                    </Field>

                    <Field label={t('Item_Name')} orientation="horizontal" className="field">
                      <Label>{editorItem?.displayName} </Label>
                    </Field>
                    <Field label={t('Item_Description')} orientation="horizontal" className="field">
                      <Label>{editorItem?.description} </Label>
                    </Field>
                    
                    <Field label={t('Item_LastModifiedDate')} orientation="horizontal" className="field">
                      <Label>{editorItem?.lastModifiedDate + ""} </Label>
                    </Field>
                    <Field label={t('Item_LastModifiedBy')} orientation="horizontal" className="field">
                      <Label>{editorItem?.lastModifiedBy} </Label>
                    </Field>
                    
                    <Field label={t('Item_CreatedDate')} orientation="horizontal" className="field">
                      <Label>{editorItem?.createdDate + ""} </Label>
                    </Field>
                    <Field label={t('Item_CreatedBy')} orientation="horizontal" className="field">
                      <Label>{editorItem?.createdBy} </Label>
                    </Field>

                    <Field label={t('Item_State_Payload')} orientation="horizontal" className="field">
                      <Input
                        size="small"
                        type="text"
                        placeholder="Hello World!"
                        value={payload}
                        onChange={(e) => onUpdateItemPayload(e.target.value)}              
                        data-testid="payload-input"
                      />
                    </Field>
                  </div>
                )}
              </div>
          </span>
          )}
      </Stack>
    </Stack>
  );
}
