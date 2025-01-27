// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Contracts;
using Boilerplate.Exceptions;
using Boilerplate.Services;
using Boilerplate.Utils;
using Fabric_Extension_BE_Boilerplate.Contracts.FabricAPI.Workload;
using Fabric_Extension_BE_Boilerplate.Exceptions;
using Microsoft.Extensions.Logging;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Boilerplate.Items
{
    /// <summary>
    /// This is a naive implentation of an item intended for demonstrating concepts of Fabric workload extensibility.
    /// It does not handle many important aspects like concurrency control, resource management and more.
    /// </summary>
    public abstract class ItemBase<TItem, TItemMetadata, TItemClientMetadata> : IItem
        where TItem : ItemBase<TItem, TItemMetadata, TItemClientMetadata>
        where TItemMetadata : class
    {
        protected static readonly JsonSerializerOptions ClientSerializationOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            Converters = { new JsonStringEnumConverter() },
        };

        private readonly IItemMetadataStore _itemMetadataStore;

        public Guid TenantObjectId { get; private set; }

        public Guid WorkspaceObjectId { get; private set; }

        public Guid ItemObjectId { get; private set; }

        public string DisplayName { get; protected set; }

        public string Description { get; protected set; }

        public abstract string ItemType { get; }

        protected ILogger Logger { get; }

        protected AuthorizationContext AuthorizationContext { get; }

        protected ItemBase(ILogger logger, IItemMetadataStore itemMetadataStore, AuthorizationContext authorizationContext)
        {
            Logger = logger;
            AuthorizationContext = authorizationContext;
            _itemMetadataStore = itemMetadataStore;
        }

        public async Task Load(Guid itemId)
        {
            var tenantObjectId = AuthorizationContext.TenantObjectId;
            if (!_itemMetadataStore.Exists(tenantObjectId, itemId))
            {
                throw new ItemMetadataNotFoundException(itemId);
            }

            var itemMetadata = await _itemMetadataStore.Load<TItemMetadata>(tenantObjectId, itemId);

            Ensure.NotNull(itemMetadata, nameof(itemMetadata));
            Ensure.NotNull(itemMetadata.CommonMetadata, nameof(itemMetadata.CommonMetadata));
            Ensure.NotNull(itemMetadata.TypeSpecificMetadata, nameof(itemMetadata.TypeSpecificMetadata));

            if (itemMetadata.CommonMetadata.Type != ItemType)
            {
                throw new UnexpectedItemTypeException($"Unexpected item type '{itemMetadata.CommonMetadata.Type}'. Expected type is '{ItemType}'.");
            }

            Ensure.Condition(itemMetadata.CommonMetadata.TenantObjectId == tenantObjectId, "TenantObjectId must match");
            Ensure.Condition(itemMetadata.CommonMetadata.ItemObjectId == itemId, "ItemObjectId must match");

            TenantObjectId = itemMetadata.CommonMetadata.TenantObjectId;
            WorkspaceObjectId = itemMetadata.CommonMetadata.WorkspaceObjectId;
            ItemObjectId = itemMetadata.CommonMetadata.ItemObjectId;
            DisplayName = itemMetadata.CommonMetadata.DisplayName;
            Description = itemMetadata.CommonMetadata.Description;

            SetTypeSpecificMetadata(itemMetadata.TypeSpecificMetadata);
        }

        public abstract Task<ItemPayload> GetItemPayload();

        public async Task Create(Guid workspaceId, Guid itemId, CreateItemRequest createItemRequest)
        {
            TenantObjectId = AuthorizationContext.TenantObjectId;
            WorkspaceObjectId = workspaceId;
            ItemObjectId = itemId;
            DisplayName = createItemRequest.DisplayName;
            Description = createItemRequest.Description;

            SetDefinition(createItemRequest.CreationPayload);

            await Store();
            await AllocateAndFreeResources();
            await UpdateFabric();
        }

        public async Task Update(UpdateItemRequest updateItemRequest)
        {
            DisplayName = updateItemRequest.DisplayName;
            Description = updateItemRequest.Description;

            UpdateDefinition(updateItemRequest.UpdatePayload);

            await Store();
            await AllocateAndFreeResources();
            await UpdateFabric();
        }

        public async Task Delete()
        {
            // >>> Get a list of allocated resources and free them <<<

            await _itemMetadataStore.Delete(TenantObjectId, ItemObjectId);
        }

        protected abstract void SetDefinition(CreateItemPayload payload);

        protected abstract void UpdateDefinition(UpdateItemPayload payload);

        protected abstract TItemMetadata GetTypeSpecificMetadata();

        protected abstract void SetTypeSpecificMetadata(TItemMetadata itemMetadata);

        public abstract Task ExecuteJob(string jobType, Guid jobInstanceId, JobInvokeType invokeType, CreateItemJobInstancePayload creationPayload);

        public abstract Task<ItemJobInstanceState> GetJobState(string jobType, Guid jobInstanceId);

        public async Task CancelJob(string jobType, Guid jobInstanceId) {
            var jobMetadata = new ItemJobMetadata
            {
                JobType = jobType,
                JobInstanceId = jobInstanceId,
                Status = JobInstanceStatus.Cancelled,
                ErrorDetails = null,
                CanceledTime = DateTime.UtcNow,
            };
            await _itemMetadataStore.UpsertJobCancel(TenantObjectId, ItemObjectId, jobType, jobInstanceId, jobMetadata);
        }

        protected async Task SaveChanges()
        {
            await Store();
            await AllocateAndFreeResources();
            await UpdateFabric();
        }

        private async Task Store()
        {
            var commonMetadata = new CommonItemMetadata
            {
                Type = ItemType,
                TenantObjectId = TenantObjectId,
                WorkspaceObjectId = WorkspaceObjectId,
                ItemObjectId = ItemObjectId,
                DisplayName = DisplayName,
                Description = Description,
            };

            var typeSpecificMetadata = GetTypeSpecificMetadata();

            await _itemMetadataStore.Upsert(TenantObjectId, ItemObjectId, commonMetadata, typeSpecificMetadata);
        }

        private Task AllocateAndFreeResources()
        {
            // >>> Get lists of required and already allocated reasource and free/allocate as needed <<<
            return Task.CompletedTask;
        }

        private Task UpdateFabric()
        {
            // TODO: Notify Fabric on changes in item metadata, relations, ETag etc.
            return Task.CompletedTask;
        }
    }
}
