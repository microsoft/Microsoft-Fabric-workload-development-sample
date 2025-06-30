import { Stack } from "@fluentui/react";
import {
  TabValue,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Text,
  Button,
} from "@fluentui/react-components";
import { DeleteRegular } from "@fluentui/react-icons";
import React, { useEffect, useState, useCallback } from "react";
import { ContextProps, PageProps } from "src/App";
import { SolutionSampleItemEditorRibbon } from "./SolutionSampleItemEditorRibbon";
import { getWorkloadItem, saveItemDefinition } from "../../../workload/controller/ItemCRUDController";
import { WorkloadItem } from "../../../workload/models/ItemCRUDModel";
import { useLocation, useParams } from "react-router-dom";
import "./../../../styles.scss";
import { useTranslation } from "react-i18next";
import { Solution, SolutionSampleItemDefinition, SolutionDeploymentStatus, AvailableSolutionConfigurations, SolutionType } from "./SolutionSampleItemModel";
import { SolutionSampleItemEmpty } from "./SolutionSampleItemEditorEmpty";
import { ItemEditorLoadingProgressBar } from "../../../workload/controls/ItemEditorLoadingProgressBar";
import { callNotificationOpen } from "../../../workload/controller/NotificationController";
import { SolutionDetailView } from "./SolutionDetailView";

export function SolutionSampleItemEditor(props: PageProps) {
  const pageContext = useParams<ContextProps>();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { workloadClient } = props;
  const [isUnsaved, setIsUnsaved] = useState<boolean>(true);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [editorItem, setEditorItem] = useState<WorkloadItem<SolutionSampleItemDefinition>>(undefined);
  const [selectedTab, setSelectedTab] = useState<TabValue>("");
  const [selectedSolution, setSelectedSolution] = useState<Solution | undefined>(undefined);

  // Helper function to update item definition immutably
  const updateItemDefinition = useCallback((updates: Partial<SolutionSampleItemDefinition>) => {
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

  async function SaveItem(defintion?: SolutionSampleItemDefinition) {
    var successResult = await saveItemDefinition<SolutionSampleItemDefinition>(
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
    var item: WorkloadItem<SolutionSampleItemDefinition> = undefined;    
    if (pageContext.itemObjectId) {
      // for Edit scenario we get the itemObjectId and then load the item via the workloadClient SDK
      try {
        item = await getWorkloadItem<SolutionSampleItemDefinition>(
          workloadClient,
          pageContext.itemObjectId,          
        );
        
        // Ensure item defintion is properly initialized without mutation
        if (!item.definition) {
          item = {
            ...item,
            definition: {
              solutions: []
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
    if(item?.definition?.solutions?.length > 0) {
      setSelectedTab("home");
    } else {
      setSelectedTab("empty");
    }
    setIsLoadingData(false);
  }

  /**
   * Add a new configuration to the list
   */
  function addSoltuion() {
    setSelectedTab("empty");
  }
  

  /**
   * Remove a solution from the list
   */
  function handleRemoveSolution(solutionId: string) {
    if (editorItem?.definition?.solutions) {
      const filteredSolutions = editorItem.definition.solutions.filter(
        (solution) => solution.id !== solutionId
      );
      
      updateItemDefinition({ solutions: filteredSolutions });
    }
  }

  async function handleFinishEmpty(solutionType: SolutionType) {
    const createdSolution: Solution = {
      id: generateUniqueId(),
      deploymentStatus: SolutionDeploymentStatus.Pending,
      itemsCreated: [],
      type: solutionType,
    };

    const newItemDefinition: SolutionSampleItemDefinition = {
      ...editorItem?.definition,
        solutions: Array.isArray(editorItem?.definition?.solutions) 
          ? [...editorItem.definition.solutions, createdSolution]
          : [createdSolution]
    };
    updateItemDefinition(newItemDefinition);
    
    // Save with the updated definition directly to avoid race condition
    await SaveItem(newItemDefinition);
    
    setSelectedSolution(createdSolution);
    setSelectedTab("solution");
  }

  if (isLoadingData) {
    //making sure we show a loding indicator while the itme is loading
    return (<ItemEditorLoadingProgressBar 
      message={`Loading item ${editorItem?.displayName} ...`} />);
  }
  else {
    return (
      <Stack className="editor" data-testid="item-editor-inner">
        <SolutionSampleItemEditorRibbon
            {...props}        
            addSolutionCallback={addSoltuion}
            isSaveButtonEnabled={isUnsaved}
            saveItemCallback={SaveItem}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
        />
        <Stack className="main">
          {["empty"].includes(selectedTab as string) && (
            <span>
              <SolutionSampleItemEmpty
                workloadClient={workloadClient}
                item={editorItem}
                itemDefinition={editorItem?.definition}
                onFinishEmpty={handleFinishEmpty}
              />
            </span>
          )}
          {["solution"].includes(selectedTab as string) && (
            <span>
              <SolutionDetailView
                workloadClient={workloadClient}
                solution={selectedSolution}
                item={editorItem}
                onBackToHome={() => setSelectedTab("home")}
              />
            </span>
          )}

          {["home"].includes(selectedTab as string) && (
          <span>
              <h2>{t('Deployed solutions')}</h2>
              {editorItem?.definition?.solutions?.length > 0 ? (
                <div className="solutions-container">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell>{t('Solution Id')}</TableHeaderCell>
                        <TableHeaderCell>{t('Solution Type')}</TableHeaderCell>
                        <TableHeaderCell>{t('Deployment Status')}</TableHeaderCell>
                        <TableHeaderCell>{t('Workspace ID')}</TableHeaderCell>
                        <TableHeaderCell>{t('Actions')}</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editorItem.definition.solutions.map((solution: Solution) => (
                        <TableRow key={solution.id} onClick={() => {
                          setSelectedSolution(solution);
                          setSelectedTab("solution");
                        }}>
                          <TableCell>{solution.id}</TableCell>
                          <TableCell>{AvailableSolutionConfigurations[solution.type]?.name}</TableCell>
                          <TableCell>{SolutionDeploymentStatus[solution.deploymentStatus]}</TableCell>
                          <TableCell>{solution.workspaceId}</TableCell>
                          <TableCell>
                            <Button
                              icon={<DeleteRegular />}
                              appearance="subtle"
                              disabled={solution.deploymentStatus !== SolutionDeploymentStatus.Pending}
                              onClick={(e: any) => {
                                e.stopPropagation(); // Prevent row click from triggering
                                handleRemoveSolution(solution.id);
                              }}
                              aria-label={t('Remove solution')}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="no-solutions">
                  <Text size={300} italic>
                    {t('No solutions have been deployed yet')}
                  </Text>
                </div>
              )}
          </span>
          )}
        </Stack>
      </Stack>
    );
  }
}

function generateUniqueId(): string {
  // Generate a random unique ID for solutions
  return 'sol_' + Math.random().toString(36).substring(2, 9);
}

