import { Label, Stack } from "@fluentui/react";
import { Field, Input, TabValue } from "@fluentui/react-components";
import React, { useEffect, useState, useCallback } from "react";
import { ContextProps, PageProps } from "src/App";
import { HelloWorldItemEditorRibbon } from "./HelloWorldItemEditorRibbon";
import { getWorkloadItem, saveItemDefinition } from "../../controller/ItemCRUDController";
import { WorkloadItem } from "../../models/ItemCRUDModel";
import { useLocation, useParams } from "react-router-dom";
import "./../../../styles.scss";
import { useTranslation } from "react-i18next";
import { HelloWorldItemDefinition } from "./HelloWorldItemModel";
import { HelloWorldItemEmpty } from "./HelloWorldItemEditorEmpty";
import { ItemEditorLoadingProgressBar } from "../../controls/ItemEditorLoadingProgressBar";
import { callNotificationOpen } from "../../controller/NotificationController";

export function HelloWorldItemEditor(props: PageProps) {
  const pageContext = useParams<ContextProps>();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { workloadClient } = props;
  const [isUnsaved, setIsUnsaved] = useState<boolean>(true);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [editorItem, setEditorItem] = useState<WorkloadItem<HelloWorldItemDefinition>>(undefined);
  const [selectedTab, setSelectedTab] = useState<TabValue>("");

  // Computed value from editorItem (single source of truth)
  const payload = editorItem?.definition?.message ?? "";

  // Helper function to update item definition immutably
  const updateItemDefinition = useCallback((updates: Partial<HelloWorldItemDefinition>) => {
    setEditorItem(prevItem => {
      if (!prevItem) return prevItem;
      
      return {
        ...prevItem,
        definition: {
          ...prevItem.definition,
          ...updates
        }
      };
    });
    setIsUnsaved(true);
  }, []);

  useEffect(() => {
      loadDataFromUrl(pageContext, pathname);
    }, [pageContext, pathname]);

  async function SaveItem(defintion?: HelloWorldItemDefinition) {
    var successResult = await saveItemDefinition<HelloWorldItemDefinition>(
      workloadClient,
      editorItem.id,
      defintion || editorItem.definition);
    setIsUnsaved(!successResult);
    callNotificationOpen(
            workloadClient,
            t("ItemEditor_Saved_Notification_Title"),
            t("ItemEditor_Saved_Notification_Text", { itemName: editorItem.displayName }),
            undefined,
            undefined
        );
  }

  async function loadDataFromUrl(pageContext: ContextProps, pathname: string): Promise<void> {
    setIsLoadingData(true);
    var item: WorkloadItem<HelloWorldItemDefinition> = undefined;    
    if (pageContext.itemObjectId) {
      // for Edit scenario we get the itemObjectId and then load the item via the workloadClient SDK
      try {
        item = await getWorkloadItem<HelloWorldItemDefinition>(
          workloadClient,
          pageContext.itemObjectId,          
        );
        
        // Ensure item defintion is properly initialized without mutation
        if (!item.definition) {
          item = {
            ...item,
            definition: {
              message: undefined,
            }
          };
        }
        setEditorItem(item);        
      } catch (error) {
        setEditorItem(undefined);        
      } 
    } else {
      console.log(`non-editor context. Current Path: ${pathname}`);
    }
    setIsUnsaved(false);
    if(item?.definition?.message) {
      setSelectedTab("home");
    } else {
      setSelectedTab("empty");
    }
    setIsLoadingData(false);
  }

  function onUpdateItemDefinition(newDefinition: string) {
    updateItemDefinition({ message: newDefinition });
  }

  async function handleFinishEmpty(message: string) {
    // Update the item defintion with the new message
    const newItemDefinition = { message: message };
    updateItemDefinition(newItemDefinition);
    
    // Save with the updated definition directly to avoid race condition
    await SaveItem(newItemDefinition);
    
    setSelectedTab("home");
  }

  if (isLoadingData) {
    //making sure we show a loding indicator while the itme is loading
    return (<ItemEditorLoadingProgressBar 
      message={t("HelloWorldItemEditor_LoadingProgressBar_Text", { itemName: editorItem?.displayName })} />);
  }
  else {
    return (
      <Stack className="editor" data-testid="item-editor-inner">
        <HelloWorldItemEditorRibbon
            {...props}        
            isSaveButtonEnabled={isUnsaved}
            saveItemCallback={SaveItem}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
        />
        <Stack className="main">
          {["empty"].includes(selectedTab as string) && (
            <span>
              <HelloWorldItemEmpty
                workloadClient={workloadClient}
                item={editorItem}
                itemDefinition={editorItem?.definition}
                onFinishEmpty={handleFinishEmpty}
              />
            </span>
          )}
          {["home"].includes(selectedTab as string) && (
          <span>
              <h2>{t('HelloWorldItemEditor_Title')}</h2>            
              <div> 
                <div className="section" data-testid='item-editor-metadata' >
                  <Field label={t('Item_ID_Label')} orientation="horizontal" className="field">
                    <Label>{editorItem?.id} </Label>
                  </Field>
                  <Field label={t('Item_Type_Label')} orientation="horizontal" className="field">
                    <Label>{editorItem?.type} </Label>
                  </Field>
                  <Field label={t('Item_Name_Label')} orientation="horizontal" className="field">
                    <Label>{editorItem?.displayName} </Label>
                  </Field>
                  <Field label={t('Item_Description_Label')} orientation="horizontal" className="field">
                    <Label>{editorItem?.description} </Label>
                  </Field>

                  <Field label={t('Item_LastModifiedDate_Label')} orientation="horizontal" className="field">
                    <Label>{editorItem?.lastModifiedDate + ""} </Label>
                  </Field>
                  <Field label={t('Item_LastModifiedBy_Label')} orientation="horizontal" className="field">
                    <Label>{editorItem?.lastModifiedBy} </Label>
                  </Field>

                  <Field label={t('Item_CreatedDate_Label')} orientation="horizontal" className="field">
                    <Label>{editorItem?.createdDate + ""} </Label>
                  </Field>
                  <Field label={t('Item_CreatedBy_Label')} orientation="horizontal" className="field">
                    <Label>{editorItem?.createdBy} </Label>
                  </Field>
                  
                  <Field label={t('Workspace_ID_Label')} orientation="horizontal" className="field">
                    <Label>{editorItem?.workspaceId} </Label>
                  </Field>

                  <Field label={t('HelloWorldItemEditor_Definition_Message_Label')} orientation="horizontal" className="field">
                    <Input
                      size="small"
                      type="text"
                      placeholder="Hello World!"
                      value={payload}
                      onChange={(e) => onUpdateItemDefinition(e.target.value)}              
                      data-testid="payload-input"
                    />
                  </Field>
                </div>
              </div>
          </span>
          )}       
        </Stack>
      </Stack>
    );
  }
}
