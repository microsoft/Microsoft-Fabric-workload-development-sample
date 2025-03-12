// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Boilerplate.Services
{

    /// <summary>
    /// Represents a service for interacting with OneLake storage.
    /// </summary>
    public interface IOneLakeClientService
    {
        /// <summary>
        /// Checks if a file exists in OneLake storage.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="filePath">The path to the file to be checked.</param>
        /// <returns>True if the file exists; otherwise, false.</returns>
        Task<bool> CheckIfFileExists(string token, string filePath);

        /// <summary>
        /// Returns the names of the folders under the item's root folder in OneLake, if exists.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="itemId">The item ID.</param>
        /// <param name="workspaceId">The workspace ID.</param>
        /// <returns>Names of folders</returns>
        Task<IEnumerable<string>> GetOneLakeFolderNames(string token, Guid workspaceId, Guid itemId);

        /// <summary>
        /// Writes content to a OneLake file, overwriting any existing data.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="path">The path to the OneLake file where the content will be written.</param>
        /// <param name="content">The content to be written to the OneLake file.</param>
        Task WriteToOneLakeFile(string token, string path, string content);

        /// <summary>
        /// Retrieves the content of a file from OneLake using the provided bearer token.
        /// </summary>
        /// <param name="token">The bearer token for authentication.</param>
        /// <param name="source">The source of the file.</param>
        /// <returns>The content of the file as a string.</returns>
        Task<string> GetOneLakeFile(string token, string source);

        /// <summary>
        /// Deletes a file from OneLake using the provided bearer token.
        /// </summary>
        /// <param name="token">The bearer token for authentication.</param>
        /// <param name="filePath">The path of the file to be deleted.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task DeleteOneLakeFile(string token, string filePath);

        /// <summary>
        /// Returns the path to a file in OneLake storage.
        /// </summary>
        /// <param name="workspaceId">The workspace ID</param>
        /// <param name="itemId">The item ID</param>
        /// <param name="fileName">The file's name</param>
        /// <returns></returns>
        string GetOneLakeFilePath(Guid workspaceId, Guid itemId, string fileName);
    }
}