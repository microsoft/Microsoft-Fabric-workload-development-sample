// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Contracts;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace Boilerplate.Services
{

    /// <summary>
    /// Represents a service for interacting with the Lakehouse storage.
    /// </summary>
    public interface ILakehouseClientService
    {
        /// <summary>
        /// Checks if a file exists in the Lakehouse storage.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="filePath">The path to the file to be checked.</param>
        /// <returns>True if the file exists; otherwise, false.</returns>
        Task<bool> CheckIfFileExists(string token, string filePath);

        /// <summary>
        /// Writes content to a Lakehouse file, overwriting any existing data.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="path">The path to the Lakehouse file where the content will be written.</param>
        /// <param name="content">The content to be written to the Lakehouse file.</param>
        Task WriteToLakehouseFile(string token, string path, string content);

        /// <summary>
        /// Retrieves the content of a file from Lakehouse using the provided bearer token.
        /// </summary>
        /// <param name="token">The bearer token for authentication.</param>
        /// <param name="source">The source of the file.</param>
        /// <returns>The content of the file as a string.</returns>
        Task<string> GetLakehouseFile(string token, string source);

        /// <summary>
        /// Deletes a file from Lakehouse using the provided bearer token.
        /// </summary>
        /// <param name="token">The bearer token for authentication.</param>
        /// <param name="filePath">The path of the file to be deleted.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task DeleteLakehouseFile(string token, string filePath);


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
