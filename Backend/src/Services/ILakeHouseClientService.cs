// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Contracts;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace Boilerplate.Services
{
    public interface ILakehouseClientService
    {
        /// <summary>
        /// Get Lakehouse item from Fabric
        /// </summary>
        /// <param name="token">The bearer token for authentication.</param>
        /// <param name="workspaceId">The workspace id of the lakehouse</param>
        /// <param name="lakehouseId">The Lakehouse id</param>
        /// <returns>Lakehouse item metdata</returns>
        Task<FabricItem> GetFabricLakehouse(string token, Guid workspaceId, Guid lakehouseId);

        /// <summary>
        /// Retrieves a list of tables available in the current lakehouse using the provided bearer token.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="workspaceId">The id of the workspace that contains the selected lakehouse.</param>
        /// <param name="lakehouseId">The id of the lakehouse from which we want to retrieve tables.</param>
        /// <returns>A list of LakehouseTables</returns>
        Task<IEnumerable<LakehouseTable>> GetLakehouseTables(string token, Guid workspaceId, Guid lakehouseId);
    }
}