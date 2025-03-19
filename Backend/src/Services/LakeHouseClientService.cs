// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Constants;
using Boilerplate.Contracts;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Web;
using System.Linq;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Boilerplate.Services
{
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

        public async Task<IEnumerable<LakehouseFile>> GetLakehouseFiles(string token, Guid workspaceId, Guid lakehouseId)
        {
            var directory = $"{lakehouseId}/Files/";
            var oneLakeContainer = await GetPathList(token, workspaceId, directory, recursive: true);
            var files = oneLakeContainer.Paths
                .Select(path =>
                {
                    var pathName = path.Name;
                    var parts = pathName.Split('/');
                    string fileName = parts[parts.Length - 1];;

                    return new LakehouseFile
                    {
                        Name = fileName,
                        Path = pathName + '/'
                    };
                });

            return files;
        }

        public async Task<IEnumerable<LakehouseTable>> GetLakehouseTables(string token, Guid workspaceId, Guid lakehouseId)
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
    }
}
