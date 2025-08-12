import { Label, Stack } from "@fluentui/react";
import { Field, Input, TabValue } from "@fluentui/react-components";
import React, { useEffect, useState, useCallback } from "react";
import { ContextProps, PageProps } from "../../App";
import { HelloWorldItemEditorRibbon } from "./HelloWorldItemEditorRibbon";
import { callGetItem, getWorkloadItem, saveItemDefinition } from "../../controller/ItemCRUDController";
import { ItemWithDefinition } from "../../controller/ItemCRUDController";
import { useLocation, useParams } from "react-router-dom";
import "../../styles.scss";
import { useTranslation } from "react-i18next";
import { HelloWorldItemDefinition } from "./HelloWorldItemModel";
//import { HelloWorldItemEmpty } from "./HelloWorldItemEditorEmpty";
import { HelloWorldItemEditorGettingStarted } from "./GettingStarted";
import { HelloWorldItemEditorEmptyStateOnFirstExprience } from "./HelloWorldItemEditorEmptyStateOnFirstExprience";
import { ItemEditorLoadingProgressBar } from "../../controls/ItemEditorLoadingProgressBar";
import { callNotificationOpen } from "../../controller/NotificationController";
import { callOpenSettings } from "../../controller/SettingsController";


export function HelloWorldItemEditor(props: PageProps) {
  const pageContext = useParams<ContextProps>();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { workloadClient } = props;
  const [isUnsaved, setIsUnsaved] = useState<boolean>(true);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [editorItem, setEditorItem] = useState<ItemWithDefinition<HelloWorldItemDefinition>>(undefined);
  const [selectedView, setSelectedView] = useState<TabValue>("");

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

  async function SaveItem(definition?: HelloWorldItemDefinition) {
    var successResult = await saveItemDefinition<HelloWorldItemDefinition>(
      workloadClient,
      editorItem.id,
      definition || editorItem.definition);
    setIsUnsaved(!successResult);
    callNotificationOpen(
            workloadClient,
            t("ItemEditor_Saved_Notification_Title"),
            t("ItemEditor_Saved_Notification_Text", { itemName: editorItem.displayName }),
            undefined,
            undefined
        );
  }


  async function openSettings() {
    if (editorItem) {      
      //workloadClient.state.sharedState = {
      //  item: editorItem;
      //}
      //TODO: this needs to be updated to use the Item instead of Itemv2
      const item = await callGetItem(workloadClient, editorItem.id);
      const result = await callOpenSettings(workloadClient, item, 'About');
      console.log("Settings opened result:", result.value);
    }
  }

  async function openGettingStarte() {
    if (editorItem) {      
      //workloadClient.state.sharedState = {
      //  item: editorItem;
      //}
      //TODO: this needs to be updated to use the Item instead of Itemv2
      const item = await callGetItem(workloadClient, editorItem.id);
      const result = await callOpenSettings(workloadClient, item, 'About');
      console.log("Settings opened result:", result.value);
    }
  }

  async function loadDataFromUrl(pageContext: ContextProps, pathname: string): Promise<void> {
    setIsLoadingData(true);
    var item: ItemWithDefinition<HelloWorldItemDefinition> = undefined;    
    if (pageContext.itemObjectId) {
      // for Edit scenario we get the itemObjectId and then load the item via the workloadClient SDK
      try {
        item = await getWorkloadItem<HelloWorldItemDefinition>(
          workloadClient,
          pageContext.itemObjectId,          
        );
        
        // Ensure item definition is properly initialized without mutation
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
      setSelectedView("home");
    } else {
      setSelectedView("empty");
    }
    setIsLoadingData(false);
  }

  function onUpdateItemDefinition(newDefinition: string) {
    updateItemDefinition({ message: newDefinition });
  }

  async function handleFinishEmpty(message: string) {
    // Update the item definition with the new message
    const newItemDefinition = { message: message };
    updateItemDefinition(newItemDefinition);
    
    // Save with the updated definition directly to avoid race condition
    //await SaveItem(newItemDefinition);
    
    // Navigate to the getting started view instead of home
    setSelectedView("home");
  }

  function handleClose() {
    // Handle closing the getting started view and go to home
    setSelectedView("home");
  }

  if (isLoadingData) {
    //making sure we show a loding indicator while the itme is loading
    return (<ItemEditorLoadingProgressBar 
      message={t("HelloWorldItemEditor_LoadingProgressBar_Text")} />);
  }
  else {
    return (
      <Stack className="editor" data-testid="item-editor-inner">
        <HelloWorldItemEditorRibbon
            {...props}        
            isRibbonDisabled={selectedView === "empty"}
            isSaveButtonEnabled={isUnsaved}
            saveItemCallback={SaveItem}
            openSettingsCallback={openSettings}
            openGettingStartedCallback={openGettingStarte} />
        
        {/* Show empty state OR getting started OR main content */}
        {selectedView === "empty" ? (
          <HelloWorldItemEditorEmptyStateOnFirstExprience
            workloadClient={workloadClient}
            item={editorItem}
            itemDefinition={editorItem?.definition}
            onFinishEmpty={handleFinishEmpty}
          />
        ) : selectedView === "home" ? (
          <HelloWorldItemEditorGettingStarted
            workloadClient={workloadClient}
            item={editorItem}
            onClose={handleClose}
          />
        ) : (
          <Stack className="main">
            {selectedView === "gettingStarted" && (
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
        )}
      </Stack>
    );
  }
}