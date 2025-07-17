import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { FabricPlatformClient } from "./FabricPlatformClient";
import {
  Capacity,
  CapacityWorkload,
  AssignWorkspaceToCapacityRequest,
  UnassignWorkspaceFromCapacityRequest,
  PaginatedResponse
} from "./FabricPlatformTypes";

/**
 * API wrapper for Fabric Platform Capacity operations
 * Provides methods for managing capacities and workspace assignments
 */
export class CapacityController extends FabricPlatformClient {
  
  constructor(workloadClient: WorkloadClientAPI) {
    super(workloadClient);
  }

  // ============================
  // Capacity Management
  // ============================

  /**
   * Returns a list of capacities that the user has access to
   * @param continuationToken Token for pagination
   * @returns Promise<PaginatedResponse<Capacity>>
   */
  async listCapacities(continuationToken?: string): Promise<PaginatedResponse<Capacity>> {
    let endpoint = '/capacities';
    if (continuationToken) {
      endpoint += `?continuationToken=${encodeURIComponent(continuationToken)}`;
    }
    return this.get<PaginatedResponse<Capacity>>(endpoint);
  }

  /**
   * Gets all capacities (handles pagination automatically)
   * @returns Promise<Capacity[]>
   */
  async getAllCapacities(): Promise<Capacity[]> {
    return this.getAllPages<Capacity>('/capacities');
  }

  /**
   * Returns the specified capacity
   * @param capacityId The capacity ID
   * @returns Promise<Capacity>
   */
  async getCapacity(capacityId: string): Promise<Capacity> {
    return this.get<Capacity>(`/capacities/${capacityId}`);
  }

  // ============================
  // Capacity Workload Management
  // ============================

  /**
   * Returns a list of workloads and their states for the specified capacity
   * @param capacityId The capacity ID
   * @returns Promise<CapacityWorkload[]>
   */
  async listCapacityWorkloads(capacityId: string): Promise<CapacityWorkload[]> {
    return this.get<CapacityWorkload[]>(`/capacities/${capacityId}/workloads`);
  }

  /**
   * Returns the state of the specified workload for the specified capacity
   * @param capacityId The capacity ID
   * @param workloadName The workload name
   * @returns Promise<CapacityWorkload>
   */
  async getCapacityWorkload(capacityId: string, workloadName: string): Promise<CapacityWorkload> {
    return this.get<CapacityWorkload>(`/capacities/${capacityId}/workloads/${workloadName}`);
  }

  /**
   * Changes the state of the specified workload to Enabled
   * @param capacityId The capacity ID
   * @param workloadName The workload name
   * @returns Promise<void>
   */
  async enableCapacityWorkload(capacityId: string, workloadName: string): Promise<void> {
    await this.post<void>(`/capacities/${capacityId}/workloads/${workloadName}/enable`);
  }

  /**
   * Changes the state of the specified workload to Disabled
   * @param capacityId The capacity ID
   * @param workloadName The workload name
   * @returns Promise<void>
   */
  async disableCapacityWorkload(capacityId: string, workloadName: string): Promise<void> {
    await this.post<void>(`/capacities/${capacityId}/workloads/${workloadName}/disable`);
  }

  // ============================
  // Workspace-Capacity Assignment
  // ============================

  /**
   * Assigns the specified workspace to the specified capacity
   * @param capacityId The capacity ID
   * @param workspaceId The workspace ID
   * @returns Promise<void>
   */
  async assignWorkspaceToCapacity(
    capacityId: string,
    workspaceId: string
  ): Promise<void> {
    const request: AssignWorkspaceToCapacityRequest = {
      workspaceId
    };
    await this.post<void>(`/capacities/${capacityId}/assignWorkspace`, request);
  }

  /**
   * Unassigns the specified workspace from a capacity
   * @param workspaceId The workspace ID
   * @returns Promise<void>
   */
  async unassignWorkspaceFromCapacity(workspaceId: string): Promise<void> {
    const request: UnassignWorkspaceFromCapacityRequest = {
      workspaceId
    };
    await this.post<void>('/capacities/unassignWorkspace', request);
  }

  // ============================
  // Helper Methods
  // ============================

  /**
   * Gets capacities by region
   * @param region The region to filter by (e.g., 'westus2', 'eastus')
   * @returns Promise<Capacity[]>
   */
  async getCapacitiesByRegion(region: string): Promise<Capacity[]> {
    const allCapacities = await this.getAllCapacities();
    return allCapacities.filter(capacity => capacity.region?.toLowerCase() === region.toLowerCase());
  }

  /**
   * Gets capacities by SKU
   * @param sku The SKU to filter by (e.g., 'F2', 'F4', 'F8', etc.)
   * @returns Promise<Capacity[]>
   */
  async getCapacitiesBySku(sku: string): Promise<Capacity[]> {
    const allCapacities = await this.getAllCapacities();
    return allCapacities.filter(capacity => capacity.sku?.toLowerCase() === sku.toLowerCase());
  }

  /**
   * Gets active capacities only
   * @returns Promise<Capacity[]>
   */
  async getActiveCapacities(): Promise<Capacity[]> {
    const allCapacities = await this.getAllCapacities();
    return allCapacities.filter(capacity => capacity.state === 'Active');
  }

  /**
   * Gets paused capacities only
   * @returns Promise<Capacity[]>
   */
  async getPausedCapacities(): Promise<Capacity[]> {
    const allCapacities = await this.getAllCapacities();
    return allCapacities.filter(capacity => capacity.state === 'Paused');
  }

  /**
   * Searches capacities by name pattern
   * @param namePattern The name pattern to search for (case-insensitive)
   * @returns Promise<Capacity[]>
   */
  async searchCapacitiesByName(namePattern: string): Promise<Capacity[]> {
    const allCapacities = await this.getAllCapacities();
    const lowerPattern = namePattern.toLowerCase();
    
    return allCapacities.filter(capacity => 
      capacity.displayName?.toLowerCase().includes(lowerPattern)
    );
  }

  /**
   * Gets enabled workloads for a capacity
   * @param capacityId The capacity ID
   * @returns Promise<CapacityWorkload[]>
   */
  async getEnabledWorkloads(capacityId: string): Promise<CapacityWorkload[]> {
    const allWorkloads = await this.listCapacityWorkloads(capacityId);
    return allWorkloads.filter(workload => workload.state === 'Enabled');
  }

  /**
   * Gets disabled workloads for a capacity
   * @param capacityId The capacity ID
   * @returns Promise<CapacityWorkload[]>
   */
  async getDisabledWorkloads(capacityId: string): Promise<CapacityWorkload[]> {
    const allWorkloads = await this.listCapacityWorkloads(capacityId);
    return allWorkloads.filter(workload => workload.state === 'Disabled');
  }

  /**
   * Checks if a specific workload is enabled on a capacity
   * @param capacityId The capacity ID
   * @param workloadName The workload name
   * @returns Promise<boolean>
   */
  async isWorkloadEnabled(capacityId: string, workloadName: string): Promise<boolean> {
    try {
      const workload = await this.getCapacityWorkload(capacityId, workloadName);
      return workload.state === 'Enabled';
    } catch (error) {
      // If workload doesn't exist or we can't access it, assume disabled
      return false;
    }
  }

  /**
   * Toggles the state of a workload (enable if disabled, disable if enabled)
   * @param capacityId The capacity ID
   * @param workloadName The workload name
   * @returns Promise<CapacityWorkload>
   */
  async toggleWorkload(capacityId: string, workloadName: string): Promise<CapacityWorkload> {
    const currentWorkload = await this.getCapacityWorkload(capacityId, workloadName);
    
    if (currentWorkload.state === 'Enabled') {
      await this.disableCapacityWorkload(capacityId, workloadName);
    } else {
      await this.enableCapacityWorkload(capacityId, workloadName);
    }

    // Return the updated workload state
    return this.getCapacityWorkload(capacityId, workloadName);
  }

  /**
   * Enables multiple workloads on a capacity
   * @param capacityId The capacity ID
   * @param workloadNames Array of workload names to enable
   * @returns Promise<void>
   */
  async enableMultipleWorkloads(capacityId: string, workloadNames: string[]): Promise<void> {
    const enablePromises = workloadNames.map(workloadName => 
      this.enableCapacityWorkload(capacityId, workloadName)
    );

    await Promise.allSettled(enablePromises);
  }

  /**
   * Disables multiple workloads on a capacity
   * @param capacityId The capacity ID
   * @param workloadNames Array of workload names to disable
   * @returns Promise<void>
   */
  async disableMultipleWorkloads(capacityId: string, workloadNames: string[]): Promise<void> {
    const disablePromises = workloadNames.map(workloadName => 
      this.disableCapacityWorkload(capacityId, workloadName)
    );

    await Promise.allSettled(disablePromises);
  }

  /**
   * Gets capacity utilization information (if available)
   * @param capacityId The capacity ID
   * @returns Promise<any> - Returns utilization data structure
   */
  async getCapacityUtilization(capacityId: string): Promise<any> {
    // Note: This endpoint may not be available in all API versions
    // Implementation would depend on specific utilization endpoints
    try {
      return this.get<any>(`/capacities/${capacityId}/utilization`);
    } catch (error) {
      console.warn(`Utilization data not available for capacity ${capacityId}`);
      return null;
    }
  }

  /**
   * Gets capacity pricing tier information
   * @param capacityId The capacity ID
   * @returns Promise<string> - Returns pricing tier (e.g., 'Premium', 'Fabric')
   */
  async getCapacityPricingTier(capacityId: string): Promise<string> {
    const capacity = await this.getCapacity(capacityId);
    
    // Infer pricing tier from SKU
    if (capacity.sku?.startsWith('F')) {
      return 'Fabric';
    } else if (capacity.sku?.startsWith('P')) {
      return 'Premium';
    } else if (capacity.sku?.startsWith('A')) {
      return 'Azure';
    }
    
    return 'Unknown';
  }
}
