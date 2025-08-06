import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { FabricPlatformClient } from './FabricPlatformClient';
import { SCOPE_PAIRS } from './FabricPlatformScopes';
import {
  Tag,
  Tags,
  ApplyTagsRequest,
  UnapplyTagsRequest
} from './FabricPlatformTypes';

/**
 * Client for interacting with Fabric Tags APIs
 * Tags API is in Preview and allows listing tenant tags and applying/unapplying tags to items.
 * 
 * API Features:
 * - List Tags: Get all available tags in the tenant (Tag.Read.All scope)
 * - Apply Tags: Apply tags to workspace items (ItemMetadata.ReadWrite.All scope)
 * - Unapply Tags: Remove tags from workspace items (ItemMetadata.ReadWrite.All scope)
 * 
 * Rate Limits:
 * - List Tags: 25 requests per minute
 * - Apply/Unapply Tags: 25 requests per hour
 */
export class TagsClient extends FabricPlatformClient {
  constructor(workloadClient: WorkloadClientAPI) {
    super(workloadClient, SCOPE_PAIRS.TAGS); // Using dedicated tags scopes
  }

  /**
   * Get all available tags in the tenant
   * @param continuationToken Optional token for retrieving the next page of results
   * @returns Promise resolving to tags list
   */
  async listTags(continuationToken?: string): Promise<Tags> {
    let endpoint = '/tags';
    if (continuationToken) {
      endpoint += `?continuationToken=${encodeURIComponent(continuationToken)}`;
    }

    return this.get<Tags>(endpoint);
  }

  /**
   * Get all tags with automatic pagination
   * @param maxResults Optional maximum number of tags to retrieve (default: no limit)
   * @returns Promise resolving to array of all tags
   */
  async getAllTags(maxResults?: number): Promise<Tag[]> {
    const allTags: Tag[] = [];
    let continuationToken: string | undefined;

    do {
      const response = await this.listTags(continuationToken);
      allTags.push(...response.value);

      if (maxResults && allTags.length >= maxResults) {
        return allTags.slice(0, maxResults);
      }

      continuationToken = response.continuationToken;
    } while (continuationToken);

    return allTags;
  }

  /**
   * Apply tags to a workspace item
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param tagIds Array of tag IDs to apply to the item
   * @returns Promise resolving when tags are applied
   */
  async applyTags(workspaceId: string, itemId: string, tagIds: string[]): Promise<void> {
    const request: ApplyTagsRequest = {
      tags: tagIds.map(id => ({ id }))
    };

    await this.post<void>(`/workspaces/${workspaceId}/items/${itemId}/applyTags`, request);
  }

  /**
   * Remove tags from a workspace item
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param tagIds Array of tag IDs to remove from the item
   * @returns Promise resolving when tags are removed
   */
  async unapplyTags(workspaceId: string, itemId: string, tagIds: string[]): Promise<void> {
    const request: UnapplyTagsRequest = {
      tags: tagIds.map(id => ({ id }))
    };

    await this.post<void>(`/workspaces/${workspaceId}/items/${itemId}/unapplyTags`, request);
  }

  /**
   * Apply a single tag to a workspace item
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param tagId The tag ID to apply to the item
   * @returns Promise resolving when tag is applied
   */
  async applyTag(workspaceId: string, itemId: string, tagId: string): Promise<void> {
    return this.applyTags(workspaceId, itemId, [tagId]);
  }

  /**
   * Remove a single tag from a workspace item
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param tagId The tag ID to remove from the item
   * @returns Promise resolving when tag is removed
   */
  async unapplyTag(workspaceId: string, itemId: string, tagId: string): Promise<void> {
    return this.unapplyTags(workspaceId, itemId, [tagId]);
  }

  /**
   * Find tags by name (case-insensitive search)
   * @param searchName The name to search for
   * @param exact Whether to match exact name or partial match (default: false)
   * @returns Promise resolving to array of matching tags
   */
  async findTagsByName(searchName: string, exact: boolean = false): Promise<Tag[]> {
    const allTags = await this.getAllTags();
    const searchLower = searchName.toLowerCase();

    return allTags.filter(tag => {
      const tagNameLower = tag.name.toLowerCase();
      return exact ? tagNameLower === searchLower : tagNameLower.includes(searchLower);
    });
  }

  /**
   * Find a tag by exact name
   * @param name The exact name of the tag to find
   * @returns Promise resolving to the tag if found, undefined otherwise
   */
  async findTagByName(name: string): Promise<Tag | undefined> {
    const tags = await this.findTagsByName(name, true);
    return tags.length > 0 ? tags[0] : undefined;
  }

  /**
   * Apply tags by name to a workspace item
   * Automatically looks up tag IDs by name before applying
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param tagNames Array of tag names to apply to the item
   * @returns Promise resolving to applied tag information
   */
  async applyTagsByName(workspaceId: string, itemId: string, tagNames: string[]): Promise<{
    applied: Tag[];
    notFound: string[];
  }> {
    const allTags = await this.getAllTags();
    const tagMap = new Map(allTags.map(tag => [tag.name.toLowerCase(), tag]));

    const applied: Tag[] = [];
    const notFound: string[] = [];

    for (const tagName of tagNames) {
      const tag = tagMap.get(tagName.toLowerCase());
      if (tag) {
        applied.push(tag);
      } else {
        notFound.push(tagName);
      }
    }

    if (applied.length > 0) {
      await this.applyTags(workspaceId, itemId, applied.map(t => t.id));
    }

    return { applied, notFound };
  }

  /**
   * Remove tags by name from a workspace item
   * Automatically looks up tag IDs by name before removing
   * @param workspaceId The workspace ID
   * @param itemId The item ID
   * @param tagNames Array of tag names to remove from the item
   * @returns Promise resolving to removed tag information
   */
  async unapplyTagsByName(workspaceId: string, itemId: string, tagNames: string[]): Promise<{
    removed: Tag[];
    notFound: string[];
  }> {
    const allTags = await this.getAllTags();
    const tagMap = new Map(allTags.map(tag => [tag.name.toLowerCase(), tag]));

    const removed: Tag[] = [];
    const notFound: string[] = [];

    for (const tagName of tagNames) {
      const tag = tagMap.get(tagName.toLowerCase());
      if (tag) {
        removed.push(tag);
      } else {
        notFound.push(tagName);
      }
    }

    if (removed.length > 0) {
      await this.unapplyTags(workspaceId, itemId, removed.map(t => t.id));
    }

    return { removed, notFound };
  }

  /**
   * Get tags filtered by color
   * @param color The color to filter by
   * @returns Promise resolving to tags with the specified color
   */
  async getTagsByColor(color: string): Promise<Tag[]> {
    const allTags = await this.getAllTags();
    return allTags.filter(tag => tag.color.toLowerCase() === color.toLowerCase());
  }
}
