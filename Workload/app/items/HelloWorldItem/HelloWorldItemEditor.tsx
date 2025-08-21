import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageProps, ContextProps } from "../../App";
import { ItemWithDefinition, getWorkloadItem } from "../../controller/ItemCRUDController";
import { HelloWorldItemDefinition } from "./HelloWorldItemModel";
import { ItemEditorLoadingProgressBar } from "../../controls/ItemEditorLoadingProgressBar";
import { HelloWorldItemEditorEmpty } from "./HelloWorldItemEditorEmpty";
import { HelloWorldItemEditorGettingStarted } from "./HelloWorldItemEditorGettingStarted";
import "../../styles.scss";

/**
 * Main editor component for HelloWorld item.
 * 
 * Note: To remove the empty state, simply set defaultView to 'getting-started'
 * or modify the logic in line 62-73
 */
export function HelloWorldItemEditor(props: PageProps) {
  const { workloadClient } = props;
  const pageContext = useParams<ContextProps>();
  const { t } = useTranslation();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [item, setItem] = useState<ItemWithDefinition<HelloWorldItemDefinition>>();
  const [currentView, setCurrentView] = useState<'empty' | 'getting-started'>('empty');

  // Get storage key for this specific item
  const getStorageKey = (itemId: string) => `helloworld-editor-state-${itemId}`;
  const { pathname } = useLocation();

  async function loadDataFromUrl(pageContext: ContextProps, pathname: string): Promise<void> {
      setIsLoading(true);
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
          setItem(item);        
        } catch (error) {
          setItem(undefined);        
        } 
      } else {
        console.log(`non-editor context. Current Path: ${pathname}`);
      }
      setIsLoading(false);
    }

  useEffect(() => {
    if (pageContext?.itemObjectId) {
      const stored = sessionStorage.getItem(getStorageKey(pageContext.itemObjectId));
      if (stored === 'getting-started' || stored === 'empty') {
        setCurrentView(stored);
      } else {
        setCurrentView('empty'); // default for new items
      }
    } else {
      setCurrentView('empty');
    }
  }, [pageContext?.itemObjectId]);

  useEffect(() => {
        loadDataFromUrl(pageContext, pathname);
      }, [pageContext, pathname]);

  /**
   * Save current view state to sessionStorage
   */
  const saveViewState = (view: 'empty' | 'getting-started') => {
    if (pageContext?.itemObjectId) {
      sessionStorage.setItem(getStorageKey(pageContext.itemObjectId), view);
    }
  };
 
  const navigateToGettingStarted = () => {
    setCurrentView('getting-started');
    saveViewState('getting-started');
  };

  /**
   * Navigate back to Empty view
   */
  const navigateToEmpty = () => {
    setCurrentView('empty');
    saveViewState('empty');
  };

  // Show loading state
  if (isLoading) {
    return (
      <ItemEditorLoadingProgressBar 
        message={t("HelloWorldItemEditor_Loading", "Loading item...")} 
      />
    );
  }

  // Render appropriate view based on state
  return (
    <>
    {currentView === 'empty' ? (
        <HelloWorldItemEditorEmpty
          workloadClient={workloadClient}
          item={item}
          onNavigateToGettingStarted={navigateToGettingStarted}
        />
      ) : (
        <HelloWorldItemEditorGettingStarted
          workloadClient={workloadClient}
          item={item}
          onNavigateToEmpty={navigateToEmpty}
        />
      )}
    </>     
  );
}