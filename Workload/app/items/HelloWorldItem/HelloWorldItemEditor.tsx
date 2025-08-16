import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageProps, ContextProps } from "../../App";
import { ItemWithDefinition, getWorkloadItem } from "../../controller/ItemCRUDController";
import { HelloWorldItemDefinition } from "./HelloWorldItemModel";
import { ItemEditorLoadingProgressBar } from "../../controls/ItemEditorLoadingProgressBar";
import { HelloWorldItemEditorEmpty } from "./HelloWorldItemEditorEmpty";
import { HelloWorldItemEditorGettingStarted } from "./HelloWorldItemEditorGettingStarted";
//import { callNavigationNavigate } from "../../controller/NavigationController";
import "../../styles.scss";

/**
 * Main editor component for HelloWorld items.
 * This demonstrates:
 * - Item loading from Fabric
 * - State-based navigation between views
 * - State persistence using localStorage
 * - How to use navigation API for external navigation
 * 
 * Note: To remove the empty state, simply set defaultView to 'getting-started'
 * or modify the logic in line 38-43
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
      
      // Navigation hook will automatically determine the correct page based on item content
      setIsLoading(false);
    }
  useEffect(() => {
    if (pageContext?.itemObjectId) {
      const stored = localStorage.getItem(getStorageKey(pageContext.itemObjectId));
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
   * Save current view state to localStorage
   */
  const saveViewState = (view: 'empty' | 'getting-started') => {
    if (pageContext?.itemObjectId) {
      localStorage.setItem(getStorageKey(pageContext.itemObjectId), view);
    }
  };

  /**
   * Navigate to Getting Started view
   * This demonstrates internal view switching.
   * 
   * Note: For external navigation (e.g., to a different item or workspace),
   * you would use: await callNavigationNavigate(workloadClient, 'host', '/path/to/destination')
   */
  const navigateToGettingStarted = () => {
    setCurrentView('getting-started');
    saveViewState('getting-started');
    
    // Example of how to use navigation API for external navigation (commented for demo):
    // await callNavigationNavigate(workloadClient, 'host', `/groups/${workspaceId}/items/${itemId}`);
  };

  /**
   * Navigate back to Empty view
   */
  const navigateToEmpty = () => {
    setCurrentView('empty');
    saveViewState('empty');
  };

  /**
   * Clear state when item is closed
   * This should be called when the item is properly closed
   */
  // const clearItemState = () => {
  //   if (pageContext?.itemObjectId) {
  //     localStorage.removeItem(getStorageKey(pageContext.itemObjectId));
  //   }
  // };

  // Clean up on unmount (optional - uncomment if you want to clear state on unmount)
  // useEffect(() => {
  //   return () => clearItemState();
  // }, []);

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