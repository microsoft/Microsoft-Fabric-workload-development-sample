// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Fabric_Extension_BE_Boilerplate.Contracts.FabricAPI.Workload;
using System;
using System.Threading.Tasks;

namespace Boilerplate.Items
{
    public interface IItem
    {
        public string ItemType { get; }

        public Guid TenantObjectId { get; }

        public Guid WorkspaceObjectId { get; }

        public Guid ItemObjectId { get; }

        public string DisplayName { get; }

        public string Description { get; }

        Task Load(Guid itemId);

        Task<ItemPayload> GetItemPayload();

        Task Create(Guid workspaceId, Guid itemId, CreateItemRequest createItemRequest);

        Task Update(UpdateItemRequest updateItemRequest);

        Task Delete();

        Task ExecuteJob(string jobType, Guid jobInstanceId, JobInvokeType invokeType, CreateItemJobInstancePayload creationPayload);

        Task<ItemJobInstanceState> GetJobState(string jobType, Guid jobInstanceId);
    }
}
