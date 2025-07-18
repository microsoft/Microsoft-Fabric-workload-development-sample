import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { FabricPlatformClient } from "./FabricPlatformClient";
import {
  ItemSchedule,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  ItemJobInstance,
  RunOnDemandItemJobRequest,
  JobStatus,
  PaginatedResponse
} from "./FabricPlatformTypes";

// Define specific scopes for Job Scheduler operations
const JOB_SCHEDULER_SCOPES = [
  "https://api.fabric.microsoft.com/Item.Execute.All",  // Primary scope for job execution
  "https://api.fabric.microsoft.com/Item.Read.All"     // May need to read item info for scheduling
].join(" ");

/**
 * API wrapper for Fabric Platform Job Scheduler operations
 * Provides methods for managing item schedules and job instances
 */
export class JobSchedulerController extends FabricPlatformClient {
  
  constructor(workloadClient: WorkloadClientAPI) {
    super(workloadClient, JOB_SCHEDULER_SCOPES);
  }

  // ============================
  // Schedule Management
  // ============================

  /**
   * Get scheduling settings for one specific item
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param jobType The job type
   * @param continuationToken Token for pagination
   * @returns Promise<PaginatedResponse<ItemSchedule>>
   */
  async listItemSchedules(
    workspaceId: string,
    itemId: string,
    jobType: string,
    continuationToken?: string
  ): Promise<PaginatedResponse<ItemSchedule>> {
    let endpoint = `/workspaces/${workspaceId}/items/${itemId}/jobs/${jobType}/schedules`;
    if (continuationToken) {
      endpoint += `?continuationToken=${encodeURIComponent(continuationToken)}`;
    }
    return this.get<PaginatedResponse<ItemSchedule>>(endpoint);
  }

  /**
   * Gets all schedules for an item (handles pagination automatically)
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param jobType The job type
   * @returns Promise<ItemSchedule[]>
   */
  async getAllItemSchedules(
    workspaceId: string,
    itemId: string,
    jobType: string
  ): Promise<ItemSchedule[]> {
    return this.getAllPages<ItemSchedule>(`/workspaces/${workspaceId}/items/${itemId}/jobs/${jobType}/schedules`);
  }

  /**
   * Create a new schedule for an item
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param jobType The job type
   * @param request CreateScheduleRequest
   * @returns Promise<ItemSchedule>
   */
  async createItemSchedule(
    workspaceId: string,
    itemId: string,
    jobType: string,
    request: CreateScheduleRequest
  ): Promise<ItemSchedule> {
    return this.post<ItemSchedule>(
      `/workspaces/${workspaceId}/items/${itemId}/jobs/${jobType}/schedules`,
      request
    );
  }

  /**
   * Get the specified schedule
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param jobType The job type
   * @param scheduleId The schedule ID
   * @returns Promise<ItemSchedule>
   */
  async getItemSchedule(
    workspaceId: string,
    itemId: string,
    jobType: string,
    scheduleId: string
  ): Promise<ItemSchedule> {
    return this.get<ItemSchedule>(
      `/workspaces/${workspaceId}/items/${itemId}/jobs/${jobType}/schedules/${scheduleId}`
    );
  }

  /**
   * Update the specified schedule
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param jobType The job type
   * @param scheduleId The schedule ID
   * @param request UpdateScheduleRequest
   * @returns Promise<ItemSchedule>
   */
  async updateItemSchedule(
    workspaceId: string,
    itemId: string,
    jobType: string,
    scheduleId: string,
    request: UpdateScheduleRequest
  ): Promise<ItemSchedule> {
    return this.patch<ItemSchedule>(
      `/workspaces/${workspaceId}/items/${itemId}/jobs/${jobType}/schedules/${scheduleId}`,
      request
    );
  }

  /**
   * Delete the specified schedule
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param jobType The job type
   * @param scheduleId The schedule ID
   * @returns Promise<void>
   */
  async deleteItemSchedule(
    workspaceId: string,
    itemId: string,
    jobType: string,
    scheduleId: string
  ): Promise<void> {
    await this.delete<void>(
      `/workspaces/${workspaceId}/items/${itemId}/jobs/${jobType}/schedules/${scheduleId}`
    );
  }

  // ============================
  // Job Instance Management
  // ============================

  /**
   * Returns a list of job instances for the specified item
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param continuationToken Token for pagination
   * @returns Promise<PaginatedResponse<ItemJobInstance>>
   */
  async listItemJobInstances(
    workspaceId: string,
    itemId: string,
    continuationToken?: string
  ): Promise<PaginatedResponse<ItemJobInstance>> {
    let endpoint = `/workspaces/${workspaceId}/items/${itemId}/jobInstances`;
    if (continuationToken) {
      endpoint += `?continuationToken=${encodeURIComponent(continuationToken)}`;
    }
    return this.get<PaginatedResponse<ItemJobInstance>>(endpoint);
  }

  /**
   * Gets all job instances for an item (handles pagination automatically)
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @returns Promise<ItemJobInstance[]>
   */
  async getAllItemJobInstances(workspaceId: string, itemId: string): Promise<ItemJobInstance[]> {
    return this.getAllPages<ItemJobInstance>(`/workspaces/${workspaceId}/items/${itemId}/jobInstances`);
  }

  /**
   * Gets the specified job instance
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param jobInstanceId The job instance ID
   * @returns Promise<ItemJobInstance>
   */
  async getItemJobInstance(
    workspaceId: string,
    itemId: string,
    jobInstanceId: string
  ): Promise<ItemJobInstance> {
    return this.get<ItemJobInstance>(
      `/workspaces/${workspaceId}/items/${itemId}/jobInstances/${jobInstanceId}`
    );
  }

  /**
   * Runs a job on-demand for the specified item
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param jobType The job type
   * @param request Optional execution data
   * @returns Promise<string> - Returns the job instance ID from the Location header
   */
  async runOnDemandItemJob(
    workspaceId: string,
    itemId: string,
    jobType: string,
    request?: RunOnDemandItemJobRequest
  ): Promise<string> {
    const endpoint = `/workspaces/${workspaceId}/items/${itemId}/jobs/instances`;
    const queryParam = `?jobType=${encodeURIComponent(jobType)}`;
    
    // Custom request to capture Location header
    const accessToken = await this.getAccessToken();
    const fullUrl = `${this.baseUrl}/v1${endpoint}${queryParam}`;
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
      body: request ? JSON.stringify(request) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText}. ${errorText}`);
    }

    // Extract job ID from Location header
    const location = response.headers.get('Location');
    if (location) {
      // Location typically contains the full URL, extract the job instance ID
      // Format: /workspaces/{workspaceId}/items/{itemId}/jobs/instances/{jobInstanceId}
      const jobIdMatch = location.match(/\/jobs\/instances\/([^\/\?]+)/);
      if (jobIdMatch) {
        return jobIdMatch[1];
      }
    }
    
    throw new Error('Job instance ID not found in response headers');
  }

  /**
   * Cancels the specified job instance
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param jobInstanceId The job instance ID
   * @returns Promise<void>
   */
  async cancelItemJobInstance(
    workspaceId: string,
    itemId: string,
    jobInstanceId: string
  ): Promise<void> {
    await this.post<void>(
      `/workspaces/${workspaceId}/items/${itemId}/jobInstances/${jobInstanceId}/cancel`
    );
  }

  // ============================
  // Helper Methods
  // ============================

  /**
   * Gets job instances by status
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param status The job status to filter by
   * @returns Promise<ItemJobInstance[]>
   */
  async getJobInstancesByStatus(
    workspaceId: string,
    itemId: string,
    status: JobStatus
  ): Promise<ItemJobInstance[]> {
    const allInstances = await this.getAllItemJobInstances(workspaceId, itemId);
    return allInstances.filter(instance => instance.status === status);
  }

  /**
   * Gets running job instances
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @returns Promise<ItemJobInstance[]>
   */
  async getRunningJobInstances(workspaceId: string, itemId: string): Promise<ItemJobInstance[]> {
    return this.getJobInstancesByStatus(workspaceId, itemId, 'InProgress');
  }

  /**
   * Gets failed job instances
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @returns Promise<ItemJobInstance[]>
   */
  async getFailedJobInstances(workspaceId: string, itemId: string): Promise<ItemJobInstance[]> {
    return this.getJobInstancesByStatus(workspaceId, itemId, 'Failed');
  }

  /**
   * Gets enabled schedules for an item
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param jobType The job type
   * @returns Promise<ItemSchedule[]>
   */
  async getEnabledSchedules(
    workspaceId: string,
    itemId: string,
    jobType: string
  ): Promise<ItemSchedule[]> {
    const allSchedules = await this.getAllItemSchedules(workspaceId, itemId, jobType);
    return allSchedules.filter(schedule => schedule.enabled);
  }

  /**
   * Enables or disables a schedule
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param jobType The job type
   * @param scheduleId The schedule ID
   * @param enabled Whether to enable or disable the schedule
   * @returns Promise<ItemSchedule>
   */
  async toggleSchedule(
    workspaceId: string,
    itemId: string,
    jobType: string,
    scheduleId: string,
    enabled: boolean
  ): Promise<ItemSchedule> {
    // First get the current schedule to preserve its configuration
    const currentSchedule = await this.getItemSchedule(workspaceId, itemId, jobType, scheduleId);
    
    const updateRequest: UpdateScheduleRequest = {
      enabled,
      configuration: currentSchedule.configuration
    };

    return this.updateItemSchedule(workspaceId, itemId, jobType, scheduleId, updateRequest);
  }

  /**
   * Cancels all running job instances for an item
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @returns Promise<void>
   */
  async cancelAllRunningJobs(workspaceId: string, itemId: string): Promise<void> {
    const runningJobs = await this.getRunningJobInstances(workspaceId, itemId);
    
    const cancellationPromises = runningJobs.map(job => 
      this.cancelItemJobInstance(workspaceId, itemId, job.id)
    );

    await Promise.allSettled(cancellationPromises);
  }
}