/**
 * Demonstration of Method-Based Scope Selection in Fabric Platform API Clients
 * 
 * This example shows how the Fabric clients automatically use appropriate scopes
 * based on the HTTP method being called:
 * - GET operations use read-only scopes 
 * - POST/PUT/PATCH/DELETE operations use read-write scopes
 */

import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { FabricPlatformAPIClient } from "./FabricPlatformAPIClient";
import { ItemClient } from "./ItemClient";
import { WorkspaceClient } from "./WorkspaceClient";
import { ConnectionClient } from "./ConnectionClient";
import { SCOPE_PAIRS } from "./FabricPlatformScopes";

/**
 * Example 1: Using the unified API client with automatic scope selection
 */
export async function demonstrateUnifiedAPIClient(workloadClient: WorkloadClientAPI) {
  console.log("=== Unified API Client Demo ===");
  
  const fabricAPI = FabricPlatformAPIClient.create(workloadClient);
  
  // GET operations automatically use read-only scopes
  console.log("🔍 GET operations (using read scopes):");
  
  try {
    // These calls will use read-only scopes like Workspace.Read.All, Item.Read.All
    const workspaces = await fabricAPI.workspaces.getAllWorkspaces();
    console.log(`✅ Retrieved ${workspaces.length} workspaces with read scopes`);
    
    if (workspaces.length > 0) {
      const workspaceId = workspaces[0].id;
      const items = await fabricAPI.items.getAllItems(workspaceId);
      console.log(`✅ Retrieved ${items.length} items with read scopes`);
    }
  } catch (error) {
    console.error("❌ Error in read operations:", error);
  }
  
  // POST/PUT/DELETE operations automatically use read-write scopes
  console.log("\n✏️ Write operations (using write scopes):");
  
  try {
    // These calls will use read-write scopes like Workspace.ReadWrite.All, Item.ReadWrite.All
    const newWorkspace = await fabricAPI.workspaces.createWorkspace({
      displayName: `Demo Workspace ${Date.now()}`,
      description: "Created with automatic write scope selection"
    });
    console.log(`✅ Created workspace "${newWorkspace.displayName}" with write scopes`);
    
    // Clean up
    await fabricAPI.workspaces.deleteWorkspace(newWorkspace.id);
    console.log(`✅ Deleted workspace with write scopes`);
    
  } catch (error) {
    console.error("❌ Error in write operations:", error);
  }
}

/**
 * Example 2: Using individual clients with method-based scope selection
 */
export async function demonstrateIndividualClients(workloadClient: WorkloadClientAPI) {
  console.log("\n=== Individual Clients Demo ===");
  
  // Item client with automatic scope selection
  const itemClient = new ItemClient(workloadClient);
  
  console.log("📋 Item Client Operations:");
  console.log(`Method-based scope selection enabled: ${itemClient.isMethodBasedScopeSelectionEnabled()}`);
  
  try {
    const workspaces = await new WorkspaceClient(workloadClient).getAllWorkspaces();
    if (workspaces.length > 0) {
      const workspaceId = workspaces[0].id;
      
      // GET operation - uses Item.Read.All + Workspace.Read.All
      const items = await itemClient.getAllItems(workspaceId);
      console.log(`✅ GET items (read scopes): Retrieved ${items.length} items`);
      
      // POST operation - uses Item.ReadWrite.All + Workspace.Read.All  
      const newItem = await itemClient.createItem(workspaceId, {
        displayName: `Demo Item ${Date.now()}`,
        type: "Report",
        description: "Created with write scopes"
      });
      console.log(`✅ POST item (write scopes): Created "${newItem.displayName}"`);
      
      // DELETE operation - uses Item.ReadWrite.All + Workspace.Read.All
      await itemClient.deleteItem(workspaceId, newItem.id);
      console.log(`✅ DELETE item (write scopes): Deleted item`);
    }
  } catch (error) {
    console.error("❌ Error in item operations:", error);
  }
}

/**
 * Example 3: Controlling scope selection behavior
 */
export async function demonstrateScopeControl(workloadClient: WorkloadClientAPI) {
  console.log("\n=== Scope Control Demo ===");
  
  const connectionClient = new ConnectionClient(workloadClient);
  
  console.log("🔌 Connection Client Scope Control:");
  
  // Check current configuration
  console.log(`Method-based selection enabled: ${connectionClient.isMethodBasedScopeSelectionEnabled()}`);
  
  try {
    // Use method-based scope selection (default)
    const connections1 = await connectionClient.getAllConnections(); // Uses read scopes
    console.log(`✅ With method-based selection: Retrieved ${connections1.length} connections`);
    
    // Disable method-based selection and use fixed write scopes
    connectionClient.disableMethodBasedScopeSelection();
    console.log(`Method-based selection enabled: ${connectionClient.isMethodBasedScopeSelectionEnabled()}`);
    
    const connections2 = await connectionClient.getAllConnections(); // Now uses write scopes
    console.log(`✅ With fixed write scopes: Retrieved ${connections2.length} connections`);
    
    // Re-enable method-based selection
    connectionClient.enableMethodBasedScopeSelection(SCOPE_PAIRS.CONNECTION);
    console.log(`Method-based selection enabled: ${connectionClient.isMethodBasedScopeSelectionEnabled()}`);
    
    const connections3 = await connectionClient.getAllConnections(); // Back to read scopes
    console.log(`✅ Method-based selection re-enabled: Retrieved ${connections3.length} connections`);
    
  } catch (error) {
    console.error("❌ Error in connection operations:", error);
  }
}

/**
 * Example 4: Understanding the scope differences
 */
export function demonstrateScopeMapping() {
  console.log("\n=== Scope Mapping Demo ===");
  
  console.log("📊 Scope pairs for different clients:");
  
  Object.entries(SCOPE_PAIRS).forEach(([clientName, scopePair]) => {
    console.log(`\n${clientName} Client:`);
    console.log(`  📖 Read scopes:  ${scopePair.read}`);
    console.log(`  ✏️  Write scopes: ${scopePair.write}`);
  });
  
  console.log("\n🔍 HTTP Method to Scope Mapping:");
  console.log("  GET, HEAD     → Read scopes (minimal permissions)");
  console.log("  POST, PUT, PATCH, DELETE → Write scopes (full permissions)");
}

/**
 * Main demonstration function
 */
export async function runScopeSelectionDemo(workloadClient: WorkloadClientAPI) {
  console.log("🚀 Fabric Platform API - Method-Based Scope Selection Demo");
  console.log("=".repeat(60));
  
  try {
    // Show scope mapping
    demonstrateScopeMapping();
    
    // Demonstrate unified API client
    await demonstrateUnifiedAPIClient(workloadClient);
    
    // Demonstrate individual clients  
    await demonstrateIndividualClients(workloadClient);
    
    // Demonstrate scope control
    await demonstrateScopeControl(workloadClient);
    
    console.log("\n✅ Demo completed successfully!");
    console.log("\nKey Benefits:");
    console.log("  🔒 Better security - minimal scopes for read operations");
    console.log("  🔄 Automatic selection - no manual scope management"); 
    console.log("  🎛️  Full control - can disable and customize as needed");
    
  } catch (error) {
    console.error("❌ Demo failed:", error);
  }
}

// Export for use in playground/samples
export const MethodBasedScopeDemo = {
  runScopeSelectionDemo,
  demonstrateUnifiedAPIClient,
  demonstrateIndividualClients,
  demonstrateScopeControl,
  demonstrateScopeMapping
};
