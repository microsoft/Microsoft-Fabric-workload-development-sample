import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { FabricPlatformClient } from "./FabricPlatformClient";
import {
  OperationState,
  LongRunningOperationStatus,
  ErrorResponse
} from "./FabricPlatformTypes";

/**
 * API wrapper for Long Running Operations
 * Provides methods for tracking and managing long-running operations
 */
export class LongRunningOperationsController extends FabricPlatformClient {
  
  constructor(workloadClient: WorkloadClientAPI) {
    super(workloadClient);
  }

  // ============================
  // Operation Management
  // ============================

  /**
   * Gets the state of a long-running operation
   * @param operationId The operation ID
   * @returns Promise<OperationState>
   */
  async getOperationState(operationId: string): Promise<OperationState> {
    return this.get<OperationState>(`/operations/${operationId}`);
  }

  /**
   * Polls an operation until it completes (succeeds or fails)
   * @param operationId The operation ID
   * @param pollingIntervalMs Polling interval in milliseconds (default: 2000)
   * @param timeoutMs Timeout in milliseconds (default: 300000 - 5 minutes)
   * @returns Promise<OperationState>
   */
  async pollUntilComplete(
    operationId: string,
    pollingIntervalMs: number = 2000,
    timeoutMs: number = 300000
  ): Promise<OperationState> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const state = await this.getOperationState(operationId);
      
      if (state.status === 'Succeeded' || state.status === 'Failed') {
        return state;
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollingIntervalMs));
    }
    
    throw new Error(`Operation ${operationId} timed out after ${timeoutMs}ms`);
  }

  /**
   * Waits for an operation to complete successfully
   * @param operationId The operation ID
   * @param pollingIntervalMs Polling interval in milliseconds (default: 2000)
   * @param timeoutMs Timeout in milliseconds (default: 300000 - 5 minutes)
   * @returns Promise<OperationState>
   * @throws Error if operation fails or times out
   */
  async waitForSuccess(
    operationId: string,
    pollingIntervalMs: number = 2000,
    timeoutMs: number = 300000
  ): Promise<OperationState> {
    const finalState = await this.pollUntilComplete(operationId, pollingIntervalMs, timeoutMs);
    
    if (finalState.status === 'Failed') {
      const errorMessage = finalState.error?.error?.message || 'Operation failed';
      throw new Error(`Operation ${operationId} failed: ${errorMessage}`);
    }
    
    return finalState;
  }

  /**
   * Checks if an operation is still running
   * @param operationId The operation ID
   * @returns Promise<boolean>
   */
  async isRunning(operationId: string): Promise<boolean> {
    try {
      const state = await this.getOperationState(operationId);
      return state.status === 'Running' || state.status === 'NotStarted';
    } catch (error) {
      // If we can't get the state, assume it's not running
      return false;
    }
  }

  /**
   * Checks if an operation has completed (either succeeded or failed)
   * @param operationId The operation ID
   * @returns Promise<boolean>
   */
  async isComplete(operationId: string): Promise<boolean> {
    try {
      const state = await this.getOperationState(operationId);
      return state.status === 'Succeeded' || state.status === 'Failed';
    } catch (error) {
      // If we can't get the state, assume it's complete (possibly deleted)
      return true;
    }
  }

  /**
   * Checks if an operation has succeeded
   * @param operationId The operation ID
   * @returns Promise<boolean>
   */
  async hasSucceeded(operationId: string): Promise<boolean> {
    try {
      const state = await this.getOperationState(operationId);
      return state.status === 'Succeeded';
    } catch (error) {
      return false;
    }
  }

  /**
   * Checks if an operation has failed
   * @param operationId The operation ID
   * @returns Promise<boolean>
   */
  async hasFailed(operationId: string): Promise<boolean> {
    try {
      const state = await this.getOperationState(operationId);
      return state.status === 'Failed';
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets the progress percentage of an operation
   * @param operationId The operation ID
   * @returns Promise<number | null> Returns null if progress is not available
   */
  async getProgress(operationId: string): Promise<number | null> {
    try {
      const state = await this.getOperationState(operationId);
      return state.percentComplete ?? null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Gets the error details of a failed operation
   * @param operationId The operation ID
   * @returns Promise<ErrorResponse | null>
   */
  async getError(operationId: string): Promise<ErrorResponse | null> {
    try {
      const state = await this.getOperationState(operationId);
      return state.error ?? null;
    } catch (error) {
      return null;
    }
  }

  // ============================
  // Helper Methods
  // ============================

  /**
   * Creates a simple progress tracker that calls a callback with updates
   * @param operationId The operation ID
   * @param onProgress Callback called with progress updates
   * @param pollingIntervalMs Polling interval in milliseconds (default: 2000)
   * @param timeoutMs Timeout in milliseconds (default: 300000 - 5 minutes)
   * @returns Promise<OperationState>
   */
  async trackProgress(
    operationId: string,
    onProgress: (progress: number | null, status: LongRunningOperationStatus) => void,
    pollingIntervalMs: number = 2000,
    timeoutMs: number = 300000
  ): Promise<OperationState> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const state = await this.getOperationState(operationId);
      
      // Call progress callback
      onProgress(state.percentComplete ?? null, state.status);
      
      if (state.status === 'Succeeded' || state.status === 'Failed') {
        return state;
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollingIntervalMs));
    }
    
    throw new Error(`Operation ${operationId} timed out after ${timeoutMs}ms`);
  }

  /**
   * Executes multiple operations in parallel and waits for all to complete
   * @param operationIds Array of operation IDs
   * @param pollingIntervalMs Polling interval in milliseconds (default: 2000)
   * @param timeoutMs Timeout in milliseconds (default: 300000 - 5 minutes)
   * @returns Promise<OperationState[]>
   */
  async waitForMultiple(
    operationIds: string[],
    pollingIntervalMs: number = 2000,
    timeoutMs: number = 300000
  ): Promise<OperationState[]> {
    const promises = operationIds.map(id => 
      this.pollUntilComplete(id, pollingIntervalMs, timeoutMs)
    );
    
    return Promise.all(promises);
  }

  /**
   * Executes multiple operations in parallel but only waits for successful ones
   * @param operationIds Array of operation IDs
   * @param pollingIntervalMs Polling interval in milliseconds (default: 2000)
   * @param timeoutMs Timeout in milliseconds (default: 300000 - 5 minutes)
   * @returns Promise<{ succeeded: OperationState[], failed: OperationState[] }>
   */
  async waitForMultipleWithResults(
    operationIds: string[],
    pollingIntervalMs: number = 2000,
    timeoutMs: number = 300000
  ): Promise<{ succeeded: OperationState[], failed: OperationState[] }> {
    const results = await Promise.allSettled(
      operationIds.map(id => this.pollUntilComplete(id, pollingIntervalMs, timeoutMs))
    );
    
    const succeeded: OperationState[] = [];
    const failed: OperationState[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value.status === 'Succeeded') {
          succeeded.push(result.value);
        } else {
          failed.push(result.value);
        }
      } else {
        // Create a synthetic failed state for operations that threw errors
        failed.push({
          status: 'Failed',
          createdTimeUtc: new Date().toISOString(),
          lastUpdatedTimeUtc: new Date().toISOString(),
          error: {
            error: {
              code: 'OperationError',
              message: result.reason?.message || 'Operation failed or timed out'
            }
          }
        });
      }
    });
    
    return { succeeded, failed };
  }
}
