import { Label, Stack } from "@fluentui/react";
import { Field, Input, TabValue } from "@fluentui/react-components";
import React, { useEffect, useState, useCallback } from "react";
import { ContextProps, PageProps } from "src/App";
import { Ribbon } from "./HelloWorldItemRibbon";
import { getWorkloadItem, saveItemState } from "../../controller/ItemCRUDController";
import { WorkloadItem } from "../../models/ItemCRUDModel";
import { useLocation, useParams } from "react-router-dom";
import "./../../../styles.scss";
import { useTranslation } from "react-i18next";
import { HelloWorldItemModelState } from "./HelloWorldItemModel";
import { HelloWorldItemEmptyState } from "./HelloWorldItemEditorEmptyState";
import { HelloWorldItemEditorLoadingProgressBar } from "./HelloWorldItemEditorLoadingProgressBar";

export function HelloWorldItemEditor(props: PageProps) {
  const pageContext = useParams<ContextProps>();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { workloadClient } = props;
  const [isUnsafed, setIsUnsafed] = useState<boolean>(true);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [editorItem, setEditorItem] = useState<WorkloadItem<HelloWorldItemModelState>>(undefined);
  const [selectedTab, setSelectedTab] = useState<TabValue>("");

  // Computed value from editorItem (single source of truth)
  const payload = editorItem?.itemState?.message ?? "";

  // Helper function to update item state immutably
  const updateItemState = useCallback((updates: Partial<HelloWorldItemModelState>) => {
    setEditorItem(prevItem => {
      if (!prevItem) return prevItem;
      
      return {
        ...prevItem,
        itemState: {
          ...prevItem.itemState,
          ...updates
        }
      };
    });
    setIsUnsafed(true);
  }, []);

  useEffect(() => {
      loadDataFromUrl(pageContext, pathname);
    }, [pageContext, pathname]);

  async function SaveItem(itemState?: HelloWorldItemModelState) {
    var successResult = await saveItemState<HelloWorldItemModelState>(
      workloadClient,
      editorItem.id,
      itemState || editorItem.itemState);
    setIsUnsafed(!successResult);
  }

  async function loadDataFromUrl(pageContext: ContextProps, pathname: string): Promise<void> {
    setIsLoadingData(true);
    var item: WorkloadItem<HelloWorldItemModelState> = undefined;    
    if (pageContext.itemObjectId) {
      // for Edit scenario we get the itemObjectId and then load the item via the workloadClient SDK
      try {
        item = await getWorkloadItem<HelloWorldItemModelState>(
          workloadClient,
          pageContext.itemObjectId,          
        );
        
        // Ensure item state is properly initialized without mutation
        if (!item.itemState) {
          item = {
            ...item,
            itemState: {
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
    setIsUnsafed(false);
    if(item?.itemState?.message) {
      setSelectedTab("home");
    } else {
      setSelectedTab("empty-state");
    }
    setIsLoadingData(false);
  }

  function onUpdateItemPayload(newPayload: string) {
    updateItemState({ message: newPayload });
  }

  async function handleFinishEmptyState(message: string) {
    // Update the item state with the new message
    const newItemState = { message: message };
    updateItemState(newItemState);
    
    // Save with the updated state directly to avoid race condition
    await SaveItem(newItemState);
    
    setSelectedTab("home");
  }

  if (isLoadingData) {
    //making sure we show a loding indicator while the itme is loading
    return (<HelloWorldItemEditorLoadingProgressBar 
      message={t("HelloWorldItem_LoadingProgressBar_Text", { itemName: editorItem?.displayName })} />);
  }
  else {
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
          {["empty-state"].includes(selectedTab as string) && (
            <span>
              <HelloWorldItemEmptyState
                workloadClient={workloadClient}
                item={editorItem}
                state={editorItem?.itemState}
                onFinishEmptyState={handleFinishEmptyState}
              />
            </span>
          )}
          {["home"].includes(selectedTab as string) && (
          <span>
              <h2>{t('Item_Editor_Titel')}</h2>            
              <div> 
                <div className="section" data-testid='item-editor-metadata' >
                  <Field label={t('Workspace_ID')} orientation="horizontal" className="field">
                    <Label>{editorItem?.workspaceId} </Label>
                  </Field>
                  <Field label={t('HelloWorldItem_ID')} orientation="horizontal" className="field">
                    <Label>{editorItem?.id} </Label>
                  </Field>
                  <Field label={t('HelloWorldItem_Type')} orientation="horizontal" className="field">
                    <Label>{editorItem?.type} </Label>
                  </Field>

                  <Field label={t('HelloWorldItem_Name')} orientation="horizontal" className="field">
                    <Label>{editorItem?.displayName} </Label>
                  </Field>
                  <Field label={t('HelloWorldItem_Description')} orientation="horizontal" className="field">
                    <Label>{editorItem?.description} </Label>
                  </Field>

                  <Field label={t('HelloWorldItem_LastModifiedDate')} orientation="horizontal" className="field">
                    <Label>{editorItem?.lastModifiedDate + ""} </Label>
                  </Field>
                  <Field label={t('HelloWorldItem_LastModifiedBy')} orientation="horizontal" className="field">
                    <Label>{editorItem?.lastModifiedBy} </Label>
                  </Field>

                  <Field label={t('HelloWorldItem_CreatedDate')} orientation="horizontal" className="field">
                    <Label>{editorItem?.createdDate + ""} </Label>
                  </Field>
                  <Field label={t('HelloWorldItem_CreatedBy')} orientation="horizontal" className="field">
                    <Label>{editorItem?.createdBy} </Label>
                  </Field>

                  <Field label={t('HelloWorldItem_State_Payload')} orientation="horizontal" className="field">
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
              </div>
          </span>
          )}       
        </Stack>
      </Stack>
    );
  }
}
