/**
 * Type definitions for Microsoft Fabric Workload API
 * Generated from swagger.json
 */

// Common enums
const ErrorSource = {
  System: "System",
  User: "User",
  External: "External"
};

const JobInvokeType = {
  UnknownFutureValue: "UnknownFutureValue",
  Scheduled: "Scheduled",
  Manual: "Manual"
};

const JobInstanceStatus = {
  NotStarted: "NotStarted",
  InProgress: "InProgress",
  Completed: "Completed",
  Failed: "Failed",
  Cancelled: "Cancelled"
};

const EndpointResolutionContextPropertyName = {
  EndpointName: "EndpointName",
  TenantRegion: "TenantRegion",
  WorkspaceRegion: "WorkspaceRegion",
  TenantId: "TenantId"
};

// Export all types
module.exports = {
  ErrorSource,
  JobInvokeType,
  JobInstanceStatus,
  EndpointResolutionContextPropertyName
};