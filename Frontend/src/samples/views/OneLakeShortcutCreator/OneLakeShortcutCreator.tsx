import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
  Input,
  Label,
  Spinner,
  Text
} from "@fluentui/react-components";
import { createOneLakeShortcut } from "../../controller/OneLakeShortcutController";
import { OneLakeShortcutCreateRequest, OneLakeShortcutTargetOneLake } from "../../models/OneLakeShortcutModel";
import { PageProps } from "../../../App";
import { GenericItem } from "../../../workload/models/ItemCRUDModel";
import { callDatahubOpen} from "../../../workload/controller/DataHubController";

export function OneLakeShortcutCreator({ workloadClient }: PageProps) {
  // Source and target item states
  const [shortcutName, setShortcutName] = useState<string>("");

  const [sourceItem, setSourceItem] = useState<GenericItem>(null);
  const [sourceShortcutPath, setSourceShortcutPath] = useState<string>("Files");

  const [targetItem, setTargetItem] = useState<GenericItem>(null);
  const [targetShortcutPath, setTargetShortcutPath] = useState<string>("Files");
  
  // UI states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // Select source item using datahub
  const selectSourceItem = async () => {
    const result = await callDatahubOpen( //) callDatahubWizardOpen(
      workloadClient,
      ["Lakehouse", 
        process.env.WORKLOAD_NAME + "." + process.env.DEFAULT_ITEM_NAME,
        process.env.WORKLOAD_NAME + ".CalculatorSample"],
      "Select source item for shortcut",
      false
    );
    
    if (result) {
      /*const sourceItem = await getItem(result.id, workloadClient)
      const sourceGenericItem = {
        workspaceId: result.workspaceId,
        id: result.id,
        displayName: "Unknown Item",
        description: "",
        type: undefined
      } as GenericItem;*/
      setTargetItem(result);
      //setSourceShortcutPath(result.selectedPath || "Files");
      setResultMessage("");
    }
  };

  // Select target item using datahub
  const selectTargetItem = async () => {
    const result = await callDatahubOpen( //callDatahubWizardOpen(
      workloadClient,
      ["Lakehouse", 
        process.env.WORKLOAD_NAME + "." + process.env.DEFAULT_ITEM_NAME,
        process.env.WORKLOAD_NAME + ".CalculatorSample"],
      "Select target item for shortcut",
      false
    );
    
    if (result) {
      /*const targetItem: undefined //= await getItem(result.id, workloadClient)
      const targetGenericItem = {
        workspaceId: result.workspaceId,
        id: result.id,
        displayName: "Unknown Item",
        description: "",
        type: undefined
      } as GenericItem;*/
      setTargetItem(result);
      //setTargetShortcutPath(result.selectedPath || "Files");
      setResultMessage("");
    }
  };

  // Create shortcut between the selected items
  const createShortcut = async () => {
    if (!sourceItem || !targetItem || !shortcutName) {
      setResultMessage("Please select source, target items and provide a shortcut name.");
      return;
    }

    setIsProcessing(true);
    setResultMessage("");

    try {
      // Create the shortcut request object
      const target: OneLakeShortcutTargetOneLake = {
        oneLake: {
          workspaceId: targetItem.workspaceId,
          itemId: targetItem.id,
          path: targetShortcutPath
        }
      };

      const shortcutRequest: OneLakeShortcutCreateRequest = {
        path: sourceShortcutPath,
        name: shortcutName,
        target: target
      };

      // Call the controller function to create the shortcut
      const result = await createOneLakeShortcut(
        workloadClient, 
        sourceItem.workspaceId, 
        sourceItem.id, 
        shortcutRequest
      );

      setResultMessage(`Shortcut created successfully: ${result.name}`);
      
      // Reset the form after success
      setShortcutName("");
      
    } catch (error) {
      setResultMessage(`Error creating shortcut: ${error.message}`);
      console.error("Error creating shortcut:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset the form
  const resetForm = () => {
    setShortcutName("");
    setSourceItem(null);
    setSourceShortcutPath("Files/");
    setTargetItem(null);    
    setTargetShortcutPath("Files/");
    setResultMessage("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>OneLake Shortcut Creator</h2>
      
     <div style={{ marginBottom: "20px" }}>
        <Label htmlFor="sourceItem">Source Item</Label>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <Text>
            {sourceItem ? sourceItem.displayName : "No item selected"}
          </Text>
          <Button appearance="primary" onClick={selectSourceItem}>
            Select Source Item
          </Button>
        </div>
        <div style={{ marginBottom: "20px" }}>
            <Label htmlFor="sourceShortcutPath">Path</Label>
            <Input 
            id="sourceShortcutPath" 
            value={sourceShortcutPath} 
            onChange={(e, data) => setSourceShortcutPath(data.value)}
            placeholder="/"
            style={{ marginBottom: "10px", width: "300px" }}
            />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <Label htmlFor="shortcutName">Name</Label>
          <Input 
            id="shortcutName" 
            value={shortcutName} 
            onChange={(e, data) => setShortcutName(data.value)}
            placeholder="Enter shortcut name"
            style={{ marginBottom: "10px", width: "300px" }}
          />
        </div>   
     </div>
     <div style={{ marginBottom: "20px" }}>
        <Label htmlFor="targetItem">Target Item</Label>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <Text>
            {targetItem ? targetItem.displayName : "No item selected"}
          </Text>
          <Button appearance="primary" onClick={selectTargetItem}>
            Select Target Item
          </Button>
        </div>
        <div style={{ marginBottom: "20px" }}>
            <Label htmlFor="targetShortcutPath">Path</Label>
            <Input 
            id="targetShortcutPath" 
            value={targetShortcutPath} 
            onChange={(e, data) => setTargetShortcutPath(data.value)}
            placeholder="/"
            style={{ marginBottom: "10px", width: "300px" }}
            />
        </div>
     </div>
     <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", gap: "10px" }}>
        <Button 
          appearance="primary" 
          onClick={() => setIsDialogOpen(true)}
          disabled={!sourceItem || !targetItem || !shortcutName}
        >
          Create Shortcut
        </Button>
        <Button appearance="subtle" onClick={resetForm}>
          Reset
        </Button>
      </div>
     </div>
      {resultMessage && (
        <div style={{ marginTop: "20px", padding: "10px", backgroundColor: resultMessage.includes("Error") ? "#FDE7E9" : "#DFF6DD", borderRadius: "4px" }}>
          {resultMessage}
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(e, data) => setIsDialogOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Create OneLake Shortcut</DialogTitle>
            <DialogContent>
              Are you sure you want to create a shortcut from "{sourceItem?.displayName}" to "{targetItem?.displayName}" with name "{shortcutName}"?
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                appearance="primary" 
                onClick={() => {
                  setIsDialogOpen(false);
                  createShortcut();
                }}
                disabled={isProcessing}
              >
                {isProcessing ? <Spinner size="tiny" /> : "Create"}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}