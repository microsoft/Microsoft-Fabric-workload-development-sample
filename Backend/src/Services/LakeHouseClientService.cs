﻿// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Constants;
using Boilerplate.Contracts;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Linq;

namespace Boilerplate.Services
{
    /// <summary>
    /// Service for interacting with the Lakehouse storage.
    /// </summary>
    public class LakehouseClientService : ILakehouseClientService
    {
        private readonly ILogger<LakehouseClientService> _logger;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientService _httpClientService;

        public LakehouseClientService(
            IConfigurationService configuration,
            IHttpClientService httpClientService,
            ILogger<LakehouseClientService> logger)
        {
            _logger = logger;
            _configuration = configuration.GetConfiguration();
            _httpClientService = httpClientService;
        }

        public async Task<bool> CheckIfFileExists(string token, string filePath)
        {
            var url = $"{EnvironmentConstants.OneLakeDFSBaseUrl}/{filePath}?resource=file";

            try
            {
                // Send a HEAD request to check if the file exists
                var response = await _httpClientService.HeadAsync(url, token);

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    // File exists
                    return true;
                }
                else if (response.StatusCode == HttpStatusCode.NotFound)
                {
                    // File does not exist
                    return false;
                }
                else
                {
                    // Handle other status codes if needed
                    _logger.LogWarning($"CheckIfFileExists received unexpected status code: {response.StatusCode}");
                    return false;
                }
            }
            catch (HttpRequestException ex)
            {
                // Handle HTTP request failure and log the error
                _logger.LogError($"CheckIfFileExists failed for filePath: {filePath}. Error: {ex.Message}");
                return false;
            }
            catch (Exception ex)
            {
                // Handle other types of exceptions and log the error
                _logger.LogError($"CheckIfFileExists failed for filePath: {filePath}. Error: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Uploads an empty file to the Lakehouse storage and then appends content to it using PATCH requests.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="filePath">The path to the Lakehouse file where the file will be created and updated.</param>
        /// <param name="content">The content to be appended to the file in the Lakehouse file.</param>
        /// <returns>A <see cref="Task"/> representing the asynchronous operation.</returns>
        public async Task WriteToLakehouseFile(string token, string filePath, string content)
        {
            var url = $"{EnvironmentConstants.OneLakeDFSBaseUrl}/{filePath}?resource=file";

            try
            {
                // This call creates a new item with empty content if it doesn't exist,
                // but if it already exists, it deletes the existing one and then creates a new one.
                var response = await _httpClientService.PutAsync(url, new StringContent(string.Empty), token);
                response.EnsureSuccessStatusCode();

                _logger.LogInformation($"Creating a new file succeeded for filePath: {filePath}");
            }
            catch (HttpRequestException ex)
            {
                // Handle HTTP request failure
                _logger.LogError($"Creating a new file failed for filePath: {filePath}. Error: {ex.Message}");
            }
            catch (Exception ex)
            {
                // Handle other types of exceptions
                _logger.LogError($"Creating a new file failed for filePath: {filePath}. Error: {ex.Message}");
            }

            _logger.LogInformation($"Appending data to file: {filePath}");
            await AppendToLakehouseFile(token, filePath, content);
        }

        public async Task<FabricItem> GetFabricLakehouse(string token, Guid workspaceId, Guid lakehouseId)
        {
            string url = $"{EnvironmentConstants.FabricApiBaseUrl}/v1/workspaces/{workspaceId}/items/{lakehouseId}";
            try
            {
                var response = await _httpClientService.GetAsync(url, token);
                var lakehouse = await response.Content.ReadAsAsync<FabricItem>();
                return lakehouse;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to retrieve FabricLakehouse for lakehouse: {lakehouseId} in workspace: {workspaceId}. Error: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Appends content to an existing file in the Lakehouse storage using PATCH requests.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="filePath">The filePath of the file to which content will be appended.</param>
        /// <returns>A Task representing the asynchronous operation.</returns>
        private async Task AppendToLakehouseFile(string token, string filePath, string content)
        {
            var url = $"{EnvironmentConstants.OneLakeDFSBaseUrl}/{filePath}";
            var appendQuery = BuildAppendQueryParameters();
            var appendUrl = url + "?" + appendQuery;

            try
            {
                // Perform the append action
                var appendContent = new StringContent(content, Encoding.UTF8, "application/json");
                var appendResponse = await _httpClientService.PatchAsync(appendUrl, appendContent, token);
                appendResponse.EnsureSuccessStatusCode();

                // Calculate the length of the content that was appended
                int contentLength = Encoding.UTF8.GetByteCount(content);

                // Update the flush URL with the correct position
                var flushQuery = BuildFlushQueryParameters(contentLength);
                string flushUrl = url + "?" + flushQuery;

                // Perform a flush to finalize the changes
                var flushResponse = await _httpClientService.PatchAsync(flushUrl, null, token);
                flushResponse.EnsureSuccessStatusCode();

                _logger.LogInformation($"AppendToLakehouseFile succeeded for filePath: {filePath}");
            }
            catch (HttpRequestException ex)
            {
                // Handle HTTP request failure and log the error
                _logger.LogError($"AppendToLakehouseFile failed for filePath: {filePath}. Error: {ex.Message}");
            }
            catch (Exception ex)
            {
                // Handle other types of exceptions and log the error
                _logger.LogError($"AppendToLakehouseFile failed for filePath: {filePath}. Error: {ex.Message}");
            }

            _logger.LogInformation($"AppendToLakehouseFile completed for filePath: {filePath}");
        }

        /// <summary>
        /// Retrieves the content of a file from Lakehouse using the provided bearer token.
        /// </summary>
        /// <param name="token">The bearer token for authentication.</param>
        /// <param name="source">The source of the file.</param>
        /// <returns>The content of the file as a string.</returns>
        public async Task<string> GetLakehouseFile(string token, string source)
        {
            var url = $"{EnvironmentConstants.OneLakeDFSBaseUrl}/{source}";

            try
            {
                var response = await _httpClientService.GetAsync(url, token);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                _logger.LogInformation($"GetLakehouseFile succeeded for source: {source}");
                return content;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError($"GetLakehouseFile failed for source: {source}. Error: {ex.Message}");
                return string.Empty;
            }
            catch (Exception ex)
            {
                _logger.LogError($"GetLakehouseFile failed for source: {source}. Error: {ex.Message}");
                return string.Empty;
            }
        }

        /// <summary>
        /// Deletes a file from the Lakehouse storage using the provided access token and query parameters.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="filePath">The path to the Lakehouse file that needs to be deleted.</param>
        /// <returns>A <see cref="Task"/> representing the asynchronous operation.</returns>
        public async Task DeleteLakehouseFile(string token, string filePath)
        {
            var uriBuilder = new UriBuilder(EnvironmentConstants.OneLakeDFSBaseUrl);
            uriBuilder.Path = filePath;
            uriBuilder.Query = "recursive=true";

            try
            {
                // Send the DELETE request using the _httpClientService
                var response = await _httpClientService.DeleteAsync(uriBuilder.Uri.ToString(), token);
                response.EnsureSuccessStatusCode();

                _logger.LogInformation($"DeleteLakehouseFile succeeded for filePath: {filePath}");
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError($"DeleteLakehouseFile failed for filePath: {filePath}. HTTP Error: {ex.Message}");
                // Handle HTTP request failure and log the error
            }
            catch (Exception ex)
            {
                _logger.LogError($"DeleteLakehouseFile failed for filePath: {filePath}. Error: {ex.Message}");
                // Handle other types of exceptions and log the error
            }
        }

        /// <summary>
        /// Retrieves a list of tables available in the current lakehouse using the provided bearer token.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="workspaceId">The id of the workspace that contains the selected lakehouse.</param>
        /// <param name="lakehouseId">The id of the lakehouse from which we want to retrieve tables.</param>
        /// <returns>A list of LakehouseTables</returns>
        public async Task<IEnumerable<LakehouseTable>> GetOneLakeTables(string token, Guid workspaceId, Guid lakehouseId)
        {
            var directory = $"{lakehouseId}/Tables/";
            var oneLakeContainer = await GetPathList(token, workspaceId, directory, recursive: true);
            var deltaLogDirectory = "/_delta_log";
            // A Onelake table is a delta table that consists of Parquet files and a _delta_log/ directory or either a shortcut to a Onelake table.
            var tables = oneLakeContainer.Paths
                .Where(path =>
                    path.Name.EndsWith(deltaLogDirectory) ||
                    (path.IsShortcut == true && path.AccountType == "ADLS"))
                .Select(path =>
                {
                    var pathName = path.Name;
                    var parts = pathName.Split('/');
                    string tableName;
                    string schemaName = null;

                    // Check if the path ends with '_delta_log' and remove it if needed
                    if (pathName.EndsWith(deltaLogDirectory))
                    {
                        pathName = string.Join("/", parts.Take(parts.Length - 1));
                        parts = pathName.Split('/');
                    }

                    // path structure without schema: <lakehouseId>/Tables/<tableName> (3 parts long)
                    // path structure with schema: <lakehouseId>/Tables/<schemaName>/<tableName> (4 parts long)
                    tableName = parts[parts.Length - 1];
                    if (parts.Length == 4)
                    {
                        schemaName = parts[2];
                    }

                    return new LakehouseTable
                    {
                        Name = tableName,
                        Path = pathName + '/',
                        Schema = schemaName,
                    };
                });

            return tables;
        }

        /// <summary>
        /// Retrieves a list of paths available in the selected directory using the provided bearer token.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="workspaceId">The id of the workspace that contains the directory.</param>
        /// <param name="directory">The directory containing the desired paths.</param>
        /// <param name="recursive">A boolean value that determines whether to search the contents of the entire directory or only the immediate descendants</param>
        /// <returns>A list of LakehouseTables</returns>
        private async Task<OneLakePathContainer> GetPathList(string token, Guid workspaceId, string directory, bool recursive = false)
        {
            // Create the URL using the provided source
            string url = $"{EnvironmentConstants.OneLakeDFSBaseUrl}/{workspaceId}/?recursive={recursive}&resource=filesystem&directory={HttpUtility.UrlEncode(directory)}&getShortcutMetadata=true";

            try
            {
                // Set the Authorization header using the bearer token using the _httpClientService
                var response = await _httpClientService.GetAsync(url, token);

                // Read the response content as a string
                var content = await response.Content.ReadAsStringAsync();
                var paths = Newtonsoft.Json.JsonConvert.DeserializeObject<OneLakePathContainer>(content);

                return paths;
            }
            catch (HttpRequestException ex)
            {
                // Handle HTTP request failure
                // You can log or perform other actions here
                _logger.LogError(ex, ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                // Handle other types of exceptions
                // You can log or perform other actions here
                _logger.LogError(ex, ex.Message);
                throw;
            }
        }

        private string BuildAppendQueryParameters()
        {
            var queryParameters = new List<string>
            {
                "position=0",
                "action=append"
            };

            return string.Join("&", queryParameters);
        }

        private string BuildFlushQueryParameters(int contentLength)
        {
            var queryParameters = new List<string>
            {
                $"position={contentLength}",
                "action=flush"
            };

            return string.Join("&", queryParameters);
        }
    }
}