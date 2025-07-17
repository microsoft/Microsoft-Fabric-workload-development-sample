# Microsoft Fabric Platform API Wrappers

This directory contains comprehensive TypeScript API wrappers for the Microsoft Fabric Platform REST APIs. These wrappers provide a strongly-typed, easy-to-use interface for interacting with Fabric platform services from your workload applications.

## Overview

The API wrappers are built on top of the `@ms-fabric/workload-client` SDK and provide:

- **Type Safety**: Complete TypeScript interfaces for all API models
- **Authentication**: Automatic authentication handling via WorkloadClientAPI
- **Error Handling**: Standardized error handling and reporting
- **Pagination**: Automatic pagination support for list operations
- **Utility Methods**: Helper methods for common operations

## Architecture

### Core Components

- **`FabricPlatformClient`**: Abstract base class providing common HTTP client functionality
- **`FabricPlatformTypes`**: Comprehensive TypeScript type definitions
- **`FabricPlatformAPIClient`**: Unified client that aggregates all individual controllers
- **Individual Controllers**: Specialized controllers for each API domain

### Controllers

| Controller | Purpose | Key Features |
|------------|---------|--------------|
| `WorkspaceController` | Workspace management | CRUD operations, role assignments, capacity management |
| `ItemController` | Item management | CRUD operations, definition management, search capabilities |
| `FolderController` | Folder hierarchy | CRUD operations, path utilities, hierarchy management |
| `CapacityController` | Capacity management | Capacity info, workload management, workspace assignments |
| `JobSchedulerController` | Job scheduling | Schedule management, job execution, status tracking |
| `OneLakeShortcutController` | OneLake shortcuts | Shortcut creation/management for external data sources |
| `LongRunningOperationsController` | Operation tracking | Progress monitoring, polling utilities |

## Quick Start

### Basic Usage

```typescript
import { FabricPlatformAPIClient, WorkloadClientAPI } from './controller';

// Initialize the workload client (typically provided by Fabric platform)
const workloadClient = new WorkloadClientAPI();

// Create the comprehensive API client
const fabricAPI = FabricPlatformAPIClient.create(workloadClient);

// Use the APIs
const workspaces = await fabricAPI.workspaces.getAllWorkspaces();
const items = await fabricAPI.items.getAllItems(workspaceId);
```

### Individual Controller Usage

```typescript
import { WorkspaceController, WorkloadClientAPI } from './controller';

const workloadClient = new WorkloadClientAPI();
const workspaceController = new WorkspaceController(workloadClient);

// Get workspace details
const workspace = await workspaceController.getWorkspace(workspaceId);

// Create a new workspace
const newWorkspace = await workspaceController.createWorkspace({
  displayName: 'My New Workspace',
  description: 'A workspace for my project'
});
```

## Examples

### Workspace Management

```typescript
// List all workspaces
const workspaces = await fabricAPI.workspaces.getAllWorkspaces();

// Get a specific workspace
const workspace = await fabricAPI.workspaces.getWorkspace(workspaceId);

// Update workspace
await fabricAPI.workspaces.updateWorkspace(workspaceId, {
  displayName: 'Updated Name',
  description: 'Updated description'
});

// Assign workspace to capacity
await fabricAPI.workspaces.assignToCapacity(workspaceId, capacityId);
```

### Item Management

```typescript
// List items in workspace
const items = await fabricAPI.items.getAllItems(workspaceId);

// Search items by name
const reports = await fabricAPI.items.searchByName(workspaceId, 'Sales Report');

// Get items by type
const notebooks = await fabricAPI.items.getItemsByType(workspaceId, 'Notebook');

// Create new item
const newItem = await fabricAPI.items.createItem(workspaceId, {
  displayName: 'My Report',
  type: 'Report',
  description: 'Monthly sales report'
});
```

### Job Scheduling

```typescript
// Create a schedule
const schedule = await fabricAPI.scheduler.createItemSchedule(
  workspaceId, 
  itemId, 
  'Refresh',
  {
    enabled: true,
    configuration: {
      type: 'Daily',
      startDateTime: '2024-01-01T09:00:00Z',
      endDateTime: '2024-12-31T09:00:00Z',
      localTimeZoneId: 'UTC',
      times: ['09:00:00']
    }
  }
);

// Run job on-demand
await fabricAPI.scheduler.runOnDemandItemJob(workspaceId, itemId, 'Refresh');

// Get job instances
const jobInstances = await fabricAPI.scheduler.getAllItemJobInstances(workspaceId, itemId);
```

### OneLake Shortcuts

```typescript
// Create a OneLake shortcut
const shortcut = await fabricAPI.shortcuts.createOneLakeShortcut(
  workspaceId,
  lakehouseId,
  'shared_data',
  '/Files/shared_data',
  sourceWorkspaceId,
  sourceLakehouseId,
  '/Files/source_data'
);

// Create ADLS Gen2 shortcut
const adlsShortcut = await fabricAPI.shortcuts.createAdlsGen2Shortcut(
  workspaceId,
  lakehouseId,
  'external_data',
  '/Files/external_data',
  adlsConnectionId,
  '/container/folder'
);
```

### Long Running Operations

```typescript
// Poll operation until completion
const result = await fabricAPI.operations.waitForSuccess(operationId);

// Track progress with callback
const result = await fabricAPI.operations.trackProgress(
  operationId,
  (progress, status) => {
    console.log(`Operation ${status}: ${progress}% complete`);
  }
);

// Wait for multiple operations
const results = await fabricAPI.operations.waitForMultiple([op1, op2, op3]);
```

### Capacity Management

```typescript
// List all capacities
const capacities = await fabricAPI.capacities.getAllCapacities();

// Get active capacities
const activeCapacities = await fabricAPI.capacities.getActiveCapacities();

// Enable workload on capacity
await fabricAPI.capacities.enableCapacityWorkload(capacityId, 'DataEngineering');

// Assign workspace to capacity
await fabricAPI.capacities.assignWorkspaceToCapacity(capacityId, workspaceId);
```

## Error Handling

All API methods throw typed errors that can be caught and handled:

```typescript
try {
  const workspace = await fabricAPI.workspaces.getWorkspace(workspaceId);
} catch (error) {
  if (error.status === 404) {
    console.log('Workspace not found');
  } else if (error.status === 403) {
    console.log('Access denied');
  } else {
    console.error('API Error:', error.message);
  }
}
```

## Pagination

Large result sets are automatically paginated. Use the `getAll*` methods for automatic pagination handling:

```typescript
// Automatically handles pagination
const allWorkspaces = await fabricAPI.workspaces.getAllWorkspaces();

// Manual pagination control
let continuationToken: string | undefined;
do {
  const result = await fabricAPI.workspaces.listWorkspaces(continuationToken);
  processWorkspaces(result.value);
  continuationToken = result.continuationToken;
} while (continuationToken);
```

## Type Safety

All API responses are strongly typed:

```typescript
import { Workspace, Item, Capacity } from './controller';

const workspace: Workspace = await fabricAPI.workspaces.getWorkspace(workspaceId);
const items: Item[] = await fabricAPI.items.getAllItems(workspaceId);
const capacity: Capacity = await fabricAPI.capacities.getCapacity(capacityId);
```

## Contributing

When adding new API endpoints:

1. Add type definitions to `FabricPlatformTypes.ts`
2. Create or update the appropriate controller
3. Add the controller to `FabricPlatformAPIClient.ts`
4. Export from `index.ts`
5. Update this README with examples

## API Reference

For detailed API documentation, refer to:
- [Microsoft Fabric REST API Documentation](https://learn.microsoft.com/en-us/rest/api/fabric/)
- [Fabric Platform API Specifications](https://github.com/microsoft/fabric-rest-api-specs)

## License

This code is part of the Microsoft Fabric Workload Development Kit and follows the same licensing terms.
