import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { FabricPlatformClient } from './FabricPlatformClient';
import { SCOPE_PAIRS } from './FabricPlatformScopes';
import {
  DataAccessRole,
  DataAccessRoles,
  CreateOrUpdateDataAccessRolesRequest,
  DecisionRule,
  Members,
  PermissionScope,
  AttributeName,
  Effect,
  ItemAccess,
  ObjectType
} from './FabricPlatformTypes';

/**
 * Client for interacting with OneLake Data Access Security APIs
 * OneLake Data Access Security API is in Preview and allows managing data access roles for OneLake items.
 * 
 * API Features:
 * - List Data Access Roles: Get all data access roles for an item (OneLake.Read.All scope)
 * - Create Or Update Data Access Roles: Create or update data access roles (OneLake.ReadWrite.All scope)
 * 
 * Data Access Roles define permissions and scopes for data access in OneLake items.
 * They control what actions users or groups can perform on specific paths within the data.
 */
export class OneLakeDataAccessSecurityClient extends FabricPlatformClient {
  constructor(workloadClient: WorkloadClientAPI) {
    super(workloadClient, SCOPE_PAIRS.ONELAKE_DATA_ACCESS_SECURITY); // Using dedicated OneLake data access security scopes
  }

  /**
   * Get all data access roles for a workspace item
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param continuationToken Optional token for retrieving the next page of results
   * @returns Promise resolving to data access roles list
   */
  async listDataAccessRoles(workspaceId: string, itemId: string, continuationToken?: string): Promise<DataAccessRoles> {
    let endpoint = `/workspaces/${workspaceId}/items/${itemId}/dataAccessRoles`;
    if (continuationToken) {
      endpoint += `?continuationToken=${encodeURIComponent(continuationToken)}`;
    }

    return this.get<DataAccessRoles>(endpoint);
  }

  /**
   * Get all data access roles with automatic pagination
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param maxResults Optional maximum number of roles to retrieve (default: no limit)
   * @returns Promise resolving to array of all data access roles
   */
  async getAllDataAccessRoles(workspaceId: string, itemId: string, maxResults?: number): Promise<DataAccessRole[]> {
    const allRoles: DataAccessRole[] = [];
    let continuationToken: string | undefined;

    do {
      const response = await this.listDataAccessRoles(workspaceId, itemId, continuationToken);
      allRoles.push(...response.value);

      if (maxResults && allRoles.length >= maxResults) {
        return allRoles.slice(0, maxResults);
      }

      continuationToken = response.continuationToken;
    } while (continuationToken);

    return allRoles;
  }

  /**
   * Create or update data access roles for a workspace item
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param roles Array of data access roles to create or update
   * @param options Optional request options
   * @returns Promise resolving when roles are created or updated
   */
  async createOrUpdateDataAccessRoles(
    workspaceId: string,
    itemId: string,
    roles: DataAccessRole[],
    options?: {
      dryRun?: boolean;
      ifMatch?: string;
      ifNoneMatch?: string;
    }
  ): Promise<void> {
    let endpoint = `/workspaces/${workspaceId}/items/${itemId}/dataAccessRoles`;
    
    if (options?.dryRun) {
      endpoint += '?dryRun=true';
    }

    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };
    
    if (options?.ifMatch) {
      headers['If-Match'] = `"${options.ifMatch}"`;
    }
    if (options?.ifNoneMatch) {
      headers['If-None-Match'] = `"${options.ifNoneMatch}"`;
    }

    const request: CreateOrUpdateDataAccessRolesRequest = {
      value: roles
    };

    await this.makeRequest<void>(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(request)
    });
  }

  /**
   * Test changes with a dry run before applying them
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param roles Array of data access roles to test
   * @returns Promise resolving when dry run is complete
   */
  async dryRunDataAccessRoles(workspaceId: string, itemId: string, roles: DataAccessRole[]): Promise<void> {
    return this.createOrUpdateDataAccessRoles(workspaceId, itemId, roles, { dryRun: true });
  }

  /**
   * Create a simple data access role with read permissions for specific paths
   * @param name The name of the role
   * @param paths Array of paths to grant read access to (e.g., ["Tables/Table1", "Files/folder1/*"])
   * @param members The members to assign to this role
   * @returns DataAccessRole object
   */
  createReadRole(name: string, paths: string[], members: Members): DataAccessRole {
    const pathPermission: PermissionScope = {
      attributeName: 'Path' as AttributeName,
      attributeValueIncludedIn: paths
    };

    const actionPermission: PermissionScope = {
      attributeName: 'Action' as AttributeName,
      attributeValueIncludedIn: ['Read']
    };

    const decisionRule: DecisionRule = {
      effect: 'Permit' as Effect,
      permission: [pathPermission, actionPermission]
    };

    return {
      name,
      decisionRules: [decisionRule],
      members
    };
  }

  /**
   * Create a data access role with full permissions for specific paths
   * @param name The name of the role
   * @param paths Array of paths to grant access to
   * @param actions Array of actions to allow (e.g., ["Read", "Write"])
   * @param members The members to assign to this role
   * @returns DataAccessRole object
   */
  createCustomRole(name: string, paths: string[], actions: string[], members: Members): DataAccessRole {
    const pathPermission: PermissionScope = {
      attributeName: 'Path' as AttributeName,
      attributeValueIncludedIn: paths
    };

    const actionPermission: PermissionScope = {
      attributeName: 'Action' as AttributeName,
      attributeValueIncludedIn: actions
    };

    const decisionRule: DecisionRule = {
      effect: 'Permit' as Effect,
      permission: [pathPermission, actionPermission]
    };

    return {
      name,
      decisionRules: [decisionRule],
      members
    };
  }

  /**
   * Find a data access role by name
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param roleName The name of the role to find
   * @returns Promise resolving to the role if found, undefined otherwise
   */
  async findDataAccessRoleByName(workspaceId: string, itemId: string, roleName: string): Promise<DataAccessRole | undefined> {
    const allRoles = await this.getAllDataAccessRoles(workspaceId, itemId);
    return allRoles.find(role => role.name === roleName);
  }

  /**
   * Get data access roles that have specific members
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param objectId The Microsoft Entra object ID to search for
   * @returns Promise resolving to roles that contain the specified member
   */
  async getRolesForMember(workspaceId: string, itemId: string, objectId: string): Promise<DataAccessRole[]> {
    const allRoles = await this.getAllDataAccessRoles(workspaceId, itemId);
    
    return allRoles.filter(role => {
      return role.members.microsoftEntraMembers?.some(member => member.objectId === objectId) ||
             false; // Could extend to check fabricItemMembers if needed
    });
  }

  /**
   * Get data access roles that grant access to specific paths
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param targetPath The path to check access for
   * @returns Promise resolving to roles that grant access to the specified path
   */
  async getRolesForPath(workspaceId: string, itemId: string, targetPath: string): Promise<DataAccessRole[]> {
    const allRoles = await this.getAllDataAccessRoles(workspaceId, itemId);
    
    return allRoles.filter(role => {
      return role.decisionRules.some(rule => {
        const pathPermission = rule.permission.find(p => p.attributeName === 'Path');
        if (!pathPermission) return false;
        
        return pathPermission.attributeValueIncludedIn.some(path => {
          // Simple path matching - could be enhanced with wildcard support
          return path === '*' || path === targetPath || targetPath.startsWith(path);
        });
      });
    });
  }

  /**
   * Create Members object for Microsoft Entra users/groups
   * @param entries Array of member entries with object ID, type, and tenant ID
   * @returns Members object
   */
  createEntraMembers(entries: Array<{
    objectId: string;
    objectType: ObjectType;
    tenantId: string;
  }>): Members {
    return {
      microsoftEntraMembers: entries.map(entry => ({
        objectId: entry.objectId,
        objectType: entry.objectType,
        tenantId: entry.tenantId
      }))
    };
  }

  /**
   * Create Members object for Fabric item-based membership
   * @param entries Array of Fabric item member entries
   * @returns Members object
   */
  createFabricItemMembers(entries: Array<{
    itemAccess: ItemAccess[];
    sourcePath: string;
  }>): Members {
    return {
      fabricItemMembers: entries.map(entry => ({
        itemAccess: entry.itemAccess,
        sourcePath: entry.sourcePath
      }))
    };
  }

  /**
   * Helper to create a default reader role that grants read access to all data
   * @param members The members to assign to this role
   * @returns DataAccessRole object for default reader
   */
  createDefaultReaderRole(members: Members): DataAccessRole {
    return this.createReadRole('DefaultReader', ['*'], members);
  }

  /**
   * Helper to create a table-specific reader role
   * @param tableName The name of the table
   * @param members The members to assign to this role
   * @returns DataAccessRole object for table reader
   */
  createTableReaderRole(tableName: string, members: Members): DataAccessRole {
    return this.createReadRole(`${tableName}Reader`, [`/Tables/${tableName}`], members);
  }

  /**
   * Helper to create a folder-specific reader role
   * @param folderPath The path to the folder (e.g., "Files/folder1")
   * @param members The members to assign to this role
   * @returns DataAccessRole object for folder reader
   */
  createFolderReaderRole(folderPath: string, members: Members): DataAccessRole {
    const paths = [
      `/${folderPath}`,
      `/${folderPath}/*`
    ];
    return this.createReadRole(`${folderPath.replace(/[\/\\]/g, '_')}Reader`, paths, members);
  }
}
