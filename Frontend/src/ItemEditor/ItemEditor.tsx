import { Label, Stack } from "@fluentui/react";
import { Divider, TabValue } from "@fluentui/react-components";
import React, { useEffect, useState } from "react";
import { ContextProps, PageProps } from "src/App";
import { Ribbon } from "./ItemEditorRibbon";
import { callItemGet, callPublicItemGetDefinition, callPublicItemUpdateDefinition, convertGetItemResultToWorkloadItem } from "./ItemEditorController";
import { ItemPayload, ItemPayloadPath, WorkloadItem } from "./ItemEditorModel";
import LoadingProgressBar from "./ItemEditorLoadingProgressBar";
import { useLocation, useParams } from "react-router-dom";
import "./../styles.scss";

export function ItemEditor(props: PageProps) {
  const pageContext = useParams<ContextProps>();
  const { pathname } = useLocation();

  const { workloadClient } = props;
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isUnsafed, setIsUnsafed] = useState<boolean>(true);
  const [editorItem, setEditorItem] = useState<WorkloadItem<ItemPayload>>(undefined);
  const [selectedTab, setSelectedTab] = useState<TabValue>("home");

  useEffect(() => {
      loadDataFromUrl(pageContext, pathname);
    }, [pageContext, pathname]);

  async function SaveItem() {
    let payload: ItemPayload = {};

    var successResult = await callPublicItemUpdateDefinition(
      editorItem.id,
      [
        { payloadPath: ItemPayloadPath.ItemMetadata, payloadData: payload }
      ],
      workloadClient
    )
    setIsUnsafed(!successResult);
  }

  async function loadDataFromUrl(pageContext: ContextProps, pathname: string): Promise<void> {
    setIsLoadingData(true);
    if (pageContext.itemObjectId) {
      // for Edit scenario we get the itemObjectId and then load the item via the workloadClient SDK
      try {
        const getItemResult = await callItemGet(
          pageContext.itemObjectId,
          workloadClient
        );
        const getItemDefinitionResult = await callPublicItemGetDefinition(pageContext.itemObjectId, workloadClient);
        const item = convertGetItemResultToWorkloadItem<ItemPayload>(getItemResult, getItemDefinitionResult);
        setEditorItem(item);
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
              <h2>Hello World</h2>            
              <div>
                  <Divider alignContent="start">
                      Item Details
                  </Divider>
                  {editorItem && (
                    <div className="section" data-testid='item-editor-metadata' >
                      <Label>WorkspaceId Id: {editorItem?.workspaceId}</Label>
                      <Label>Item Id: {editorItem?.id}</Label>                      
                      <Label>Item Display Name: {editorItem?.displayName}</Label>
                      <Label>Item Description: {editorItem?.description}</Label>
                      
                      <Label>Item Type: {editorItem?.type}</Label>
                      <Label>Last Modified: {editorItem?.lastModifiedDate + ""}</Label>
                      <Label>Last Modified By: {editorItem?.lastModifiedBy}</Label>
                    </div>
                  )}
              </div>
          </span>
          )}
      </Stack>
    </Stack>
  );
}
