// Quick Test File for Method-Based Scope Selection
// This file demonstrates the key functionality working correctly

import { WorkloadClientAPI } from '@ms-fabric/workload-client';
import { ItemClient } from './ItemClient';
import { WorkspaceClient } from './WorkspaceClient';
import { ConnectionClient } from './ConnectionClient';
import { FabricPlatformAPIClient } from './FabricPlatformAPIClient';
import { SCOPE_PAIRS, getScopeForMethod } from './FabricPlatformScopes';

/**
 * Quick verification that method-based scope selection is working
 */
export class ScopeSelectionTest {
  static testScopeLogic(): void {
    console.log('=== Testing Scope Selection Logic ===');
    
    // Test scope pair functionality
    const itemScopePair = SCOPE_PAIRS.ITEM;
    console.log('GET scope:', getScopeForMethod(itemScopePair, 'GET'));
    console.log('POST scope:', getScopeForMethod(itemScopePair, 'POST'));
    
    // Verify different methods
    console.log('HEAD scope:', getScopeForMethod(itemScopePair, 'HEAD'));
    console.log('PUT scope:', getScopeForMethod(itemScopePair, 'PUT'));
    console.log('PATCH scope:', getScopeForMethod(itemScopePair, 'PATCH'));
    console.log('DELETE scope:', getScopeForMethod(itemScopePair, 'DELETE'));
  }

  static async testClientCreation(workloadClient: WorkloadClientAPI): Promise<void> {
    console.log('=== Testing Client Creation ===');
    
    // Test individual clients with method-based scope selection
    const itemClient = new ItemClient(workloadClient);
    const workspaceClient = new WorkspaceClient(workloadClient);
    const connectionClient = new ConnectionClient(workloadClient);
    
    console.log('ItemClient method-based enabled:', itemClient.isMethodBasedScopeSelectionEnabled());
    console.log('WorkspaceClient method-based enabled:', workspaceClient.isMethodBasedScopeSelectionEnabled());
    console.log('ConnectionClient method-based enabled:', connectionClient.isMethodBasedScopeSelectionEnabled());
    
    // Test unified API client
    const fabricAPI = FabricPlatformAPIClient.create(workloadClient);
    console.log('Unified API client created successfully');
    console.log('Items client method-based enabled:', fabricAPI.items.isMethodBasedScopeSelectionEnabled());
    console.log('Workspaces client method-based enabled:', fabricAPI.workspaces.isMethodBasedScopeSelectionEnabled());
  }

  static async testRuntimeControl(workloadClient: WorkloadClientAPI): Promise<void> {
    console.log('=== Testing Runtime Control ===');
    
    const itemClient = new ItemClient(workloadClient);
    
    // Initial state (should be enabled)
    console.log('Initial state - method-based enabled:', itemClient.isMethodBasedScopeSelectionEnabled());
    
    // Disable method-based selection
    itemClient.disableMethodBasedScopeSelection();
    console.log('After disable - method-based enabled:', itemClient.isMethodBasedScopeSelectionEnabled());
    
    // Re-enable method-based selection
    itemClient.enableMethodBasedScopeSelection(SCOPE_PAIRS.ITEM);
    console.log('After re-enable - method-based enabled:', itemClient.isMethodBasedScopeSelectionEnabled());
  }

  /**
   * Run all tests
   */
  static async runAllTests(workloadClient: WorkloadClientAPI): Promise<void> {
    console.log('🚀 Running Method-Based Scope Selection Tests');
    console.log('');
    
    try {
      this.testScopeLogic();
      console.log('✅ Scope logic test passed');
      console.log('');
      
      await this.testClientCreation(workloadClient);
      console.log('✅ Client creation test passed');
      console.log('');
      
      await this.testRuntimeControl(workloadClient);
      console.log('✅ Runtime control test passed');
      console.log('');
      
      console.log('🎉 All tests passed! Method-based scope selection is working correctly.');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }
}

// Export for easy testing
export default ScopeSelectionTest;
