/**
 * TypeScript interfaces for Fabric Platform API data models
 * Based on the platform.json definitions from microsoft/fabric-rest-api-specs
 */

// Authentication configuration types
export interface ServicePrincipalConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  authority?: string; // Optional custom authority URL
}

export interface AuthenticationConfig {
  type: 'UserToken' | 'ServicePrincipal';
  servicePrincipal?: ServicePrincipalConfig;
  customToken?: string; // For pre-acquired tokens
}

// Common types
export interface Principal {
  id: string;
  type: 'User' | 'Group' | 'ServicePrincipal' | 'ManagedIdentity';
  profile?: {
    displayName?: string;
    email?: string;
  };
}

export interface PaginatedResponse<T> {
  value: T[];
  continuationToken?: string;
  continuationUri?: string;
}

// Workspace types
export interface Workspace {
  id: string;
  displayName: string;
  description: string;
  type: WorkspaceType;
  capacityId?: string;
}

export interface WorkspaceInfo extends Workspace {
  capacityAssignmentProgress?: CapacityAssignmentProgress;
  workspaceIdentity?: WorkspaceIdentity;
  capacityRegion?: string;
  oneLakeEndpoints?: OneLakeEndpoints;
}

export interface CreateWorkspaceRequest {
  displayName: string;
  description?: string;
  capacityId?: string;
}

export interface UpdateWorkspaceRequest {
  displayName?: string;
  description?: string;
}

export type WorkspaceType = 'Personal' | 'Workspace';
export type CapacityAssignmentProgress = 'Completed' | 'Failed' | 'InProgress';

export interface WorkspaceIdentity {
  applicationId: string;
  servicePrincipalId: string;
}

export interface OneLakeEndpoints {
  blobEndpoint: string;
  dfsEndpoint: string;
}

// Workspace Role Assignment types
export interface WorkspaceRoleAssignment {
  id: string;
  principal: Principal;
  role: WorkspaceRole;
}

export interface AddWorkspaceRoleAssignmentRequest {
  principal: Principal;
  role: WorkspaceRole;
}

export interface UpdateWorkspaceRoleAssignmentRequest {
  role: WorkspaceRole;
}

export type WorkspaceRole = 'Admin' | 'Member' | 'Contributor' | 'Viewer';

// Capacity types
export interface Capacity {
  id: string;
  displayName?: string;
  sku?: string;
  region?: string;
  state?: CapacityState;
  admins?: string[];
}

export type CapacityState = 'Active' | 'Inactive' | 'Provisioning' | 'Suspended' | 'Paused';

export interface CapacityWorkload {
  name: string;
  state: WorkloadState;
}

export type WorkloadState = 'Enabled' | 'Disabled' | 'Unsupported';

export interface AssignWorkspaceToCapacityRequest {
  workspaceId: string;
}

export interface UnassignWorkspaceFromCapacityRequest {
  workspaceId: string;
}

// Item types
export interface Item {
  id: string;
  type: string;
  displayName: string;
  description?: string;
  workspaceId: string;
  folderId?: string;
  definition?: ItemDefinition;
}

export interface CreateItemRequest {
  displayName: string;
  description?: string;
  type: string;
  folderId?: string;
  definition?: ItemDefinition;
  creationPayload?: Record<string, unknown>;
}

export interface UpdateItemRequest {
  displayName?: string;
  description?: string;
}

export interface ItemDefinition {
  format?: string;
  parts: ItemDefinitionPart[];
}

export interface ItemDefinitionPart {
  path: string;
  payload: string;
  payloadType: PayloadType;
}

export type PayloadType = 'InlineBase64' | 'InlineJson';

export interface ItemDefinitionResponse {
  definition: ItemDefinition;
}

export interface UpdateItemDefinitionRequest {
  definition: ItemDefinition;
}

// Folder types
export interface Folder {
  id: string;
  displayName: string;
  type: 'Folder';
  workspaceId: string;
  parentFolderId?: string;
}

export interface CreateFolderRequest {
  displayName: string;
  parentFolderId?: string;
}

export interface UpdateFolderRequest {
  displayName: string;
}

export interface MoveFolderRequest {
  targetFolderId?: string;
}

// Job Scheduler types
export interface ItemSchedule {
  id: string;
  enabled: boolean;
  createdDateTime: string;
  configuration: ScheduleConfig;
  owner: Principal;
}

export interface ScheduleConfig {
  type: ScheduleType;
  startDateTime: string;
  endDateTime: string;
  localTimeZoneId: string;
}

export type ScheduleType = 'Cron' | 'Daily' | 'Weekly';

export interface CronScheduleConfig extends ScheduleConfig {
  type: 'Cron';
  interval: number;
}

export interface DailyScheduleConfig extends ScheduleConfig {
  type: 'Daily';
  times: string[];
}

export interface WeeklyScheduleConfig extends ScheduleConfig {
  type: 'Weekly';
  times: string[];
  weekdays: DayOfWeek[];
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface CreateScheduleRequest {
  enabled: boolean;
  configuration: ScheduleConfig;
}

export interface UpdateScheduleRequest {
  enabled: boolean;
  configuration: ScheduleConfig;
}

export interface ItemJobInstance {
  id: string;
  itemId: string;
  jobType: string;
  invokeType: InvokeType;
  status: JobStatus;
  rootActivityId?: string;
  startTimeUtc?: string;
  endTimeUtc?: string;
  failureReason?: ErrorResponse;
}

export type InvokeType = 'Scheduled' | 'Manual';
export type JobStatus = 'NotStarted' | 'InProgress' | 'Completed' | 'Failed' | 'Cancelled' | 'Deduped';

export interface RunOnDemandItemJobRequest {
  executionData?: Record<string, unknown>;
}

// Long Running Operations
export interface OperationState {
  status: LongRunningOperationStatus;
  createdTimeUtc: string;
  lastUpdatedTimeUtc: string;
  percentComplete?: number;
  error?: ErrorResponse;
}

export type LongRunningOperationStatus = 'Undefined' | 'NotStarted' | 'Running' | 'Succeeded' | 'Failed';

// OneLake Shortcuts types
export interface Shortcut {
  path: string;
  name: string;
  target: Target;
  transform?: Transform;
}

export interface CreateShortcutRequest {
  path: string;
  name: string;
  target: CreatableShortcutTarget;
}

export interface CreateShortcutWithTransformRequest extends CreateShortcutRequest {
  transform?: Transform;
}

export interface BulkCreateShortcutsRequest {
  createShortcutRequests: CreateShortcutWithTransformRequest[];
}

export interface Target {
  type: TargetType;
  oneLake?: OneLakeTarget;
  amazonS3?: AmazonS3Target;
  adlsGen2?: AdlsGen2Target;
  googleCloudStorage?: GoogleCloudStorageTarget;
  s3Compatible?: S3CompatibleTarget;
  dataverse?: DataverseTarget;
  externalDataShare?: ExternalDataShareTarget;
  azureBlobStorage?: AzureBlobStorageTarget;
}

export type TargetType = 'OneLake' | 'AmazonS3' | 'AdlsGen2' | 'GoogleCloudStorage' | 'S3Compatible' | 'Dataverse' | 'ExternalDataShare' | 'AzureBlobStorage';

export interface CreatableShortcutTarget {
  oneLake?: OneLakeTarget;
  amazonS3?: AmazonS3Target;
  adlsGen2?: AdlsGen2Target;
  googleCloudStorage?: GoogleCloudStorageTarget;
  s3Compatible?: S3CompatibleTarget;
  dataverse?: DataverseTarget;
  azureBlobStorage?: AzureBlobStorageTarget;
}

export interface OneLakeTarget {
  itemId: string;
  workspaceId: string;
  path: string;
  connectionId?: string;
}

export interface AmazonS3Target {
  location: string;
  subpath?: string;
  connectionId: string;
}

export interface AdlsGen2Target {
  location: string;
  subpath: string;
  connectionId: string;
}

export interface GoogleCloudStorageTarget {
  location: string;
  subpath: string;
  connectionId: string;
}

export interface S3CompatibleTarget {
  location: string;
  subpath: string;
  bucket: string;
  connectionId: string;
}

export interface DataverseTarget {
  environmentDomain: string;
  connectionId: string;
  deltaLakeFolder: string;
  tableName: string;
}

export interface AzureBlobStorageTarget {
  location: string;
  subpath: string;
  connectionId: string;
}

export interface ExternalDataShareTarget {
  connectionId: string;
}

export interface Transform {
  type: TransformType;
}

export type TransformType = 'csvToDelta';

export interface CsvToDeltaTransform extends Transform {
  type: 'csvToDelta';
  properties: CsvToDeltaTransformProperties;
}

export interface CsvToDeltaTransformProperties {
  delimiter?: string;
  useFirstRowAsHeader?: boolean;
  skipFilesWithErrors?: boolean;
}

// Data Access Security types
export interface DataAccessRole {
  id?: string;
  name: string;
  decisionRules: DecisionRule[];
  members?: Members;
}

export interface DecisionRule {
  effect?: Effect;
  permission: PermissionScope[];
}

export type Effect = 'Permit';

export interface PermissionScope {
  attributeName: AttributeName;
  attributeValueIncludedIn: string[];
}

export type AttributeName = 'Path' | 'Action';

export interface Members {
  fabricItemMembers?: FabricItemMember[];
  microsoftEntraMembers?: MicrosoftEntraMember[];
}

export interface MicrosoftEntraMember {
  tenantId: string;
  objectId: string;
  objectType?: ObjectType;
}

export type ObjectType = 'Group' | 'User' | 'ServicePrincipal' | 'ManagedIdentity';

export interface FabricItemMember {
  itemAccess: ItemAccess[];
  sourcePath: string;
}

export type ItemAccess = 'Read' | 'Write' | 'Reshare' | 'Explore' | 'Execute' | 'ReadAll';

export interface CreateOrUpdateDataAccessRolesRequest {
  value: DataAccessRole[];
}

// Error types
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: ErrorDetail[];
  };
}

export interface ErrorDetail {
  code: string;
  message: string;
  target?: string;
}

// Long Running Operations types
export interface LongRunningOperation {
  id: string;
  type: string;
  status: OperationStatus;
  createdDateTime: string;
  lastUpdatedDateTime: string;
  percentComplete?: number;
  error?: OperationError;
  result?: any;
}

export type OperationStatus = 'NotStarted' | 'Running' | 'Succeeded' | 'Failed' | 'Cancelled';

export interface OperationError {
  code: string;
  message: string;
  details?: OperationErrorDetail[];
}

export interface OperationErrorDetail {
  code: string;
  message: string;
  target?: string;
}
