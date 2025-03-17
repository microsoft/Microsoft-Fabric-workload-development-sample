﻿// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Constants;
using Fabric_Extension_BE_Boilerplate.Contracts.OneLakeAPI;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Boilerplate.Services
{
    /// <summary>
    /// Service for interacting with the OneLake storage.
    /// </summary>
    public class OneLakeClientService : IOneLakeClientService
    {
        private readonly ILogger<OneLakeClientService> _logger;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientService _httpClientService;

        public OneLakeClientService(
            IConfigurationService configuration,
            IHttpClientService httpClientService,
            ILogger<OneLakeClientService> logger)
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
                    _logger.LogWarning($"{nameof(CheckIfFileExists)} received unexpected status code: {response.StatusCode}");
                    return false;
                }
            }
            catch (HttpRequestException ex)
            {
                // Handle HTTP request failure and log the error
                _logger.LogError($"{nameof(CheckIfFileExists)} failed for filePath: {filePath}. Error: {ex.Message}");
                return false;
            }
            catch (Exception ex)
            {
                // Handle other types of exceptions and log the error
                _logger.LogError($"{nameof(CheckIfFileExists)} failed for filePath: {filePath}. Error: {ex.Message}");
                return false;
            }
        }

        public async Task<IEnumerable<string>> GetOneLakeFolderNames(string token, Guid workspaceId, Guid itemId)
        {
            var url = $"{EnvironmentConstants.OneLakeDFSBaseUrl}/{workspaceId}";
            var appendQuery = BuildGetOneLakeFoldersQueryParameters(itemId);
            var appendUrl = url + "?" + appendQuery;

            try
            {
                var response = await _httpClientService.GetAsync(appendUrl, token);

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    var getFoldersResultStr = await response.Content.ReadAsStringAsync();
                    var getFoldersResultObj = JsonConvert.DeserializeObject<GetFoldersResult>(getFoldersResultStr);
                    return getFoldersResultObj.Paths?.Where(f => f.IsDirectory).Select(f => f.Name);
                }
                else if (response.StatusCode == HttpStatusCode.NotFound)
                {
                    // Root folder not found
                    return null;
                }
                else
                {
                    // Handle other status codes if needed
                    _logger.LogWarning($"{nameof(GetOneLakeFolderNames)}  received unexpected status code: {response.StatusCode}");
                    return null;
                }
            }
            catch (HttpRequestException ex)
            {
                // Handle HTTP request failure and log the error
                _logger.LogError($"{nameof(GetOneLakeFolderNames)}  failed for workspaceId: {workspaceId}. itemId: {itemId}, Error: {ex.Message}");
                return null;
            }
            catch (Exception ex)
            {
                // Handle other types of exceptions and log the error
                _logger.LogError($"{nameof(GetOneLakeFolderNames)}  failed for workspaceId: {workspaceId}. itemId: {itemId}, Error: {ex.Message}");
                return null;
            }
        }

        public async Task WriteToOneLakeFile(string token, string filePath, string content)
        {
            var url = $"{EnvironmentConstants.OneLakeDFSBaseUrl}/{filePath}?resource=file";

            try
            {
                // This call creates a new item with empty content if it doesn't exist,
                // but if it already exists, it deletes the existing one and then creates a new one.
                var response = await _httpClientService.PutAsync(url, new StringContent(string.Empty), token);
                response.EnsureSuccessStatusCode();

                _logger.LogInformation($"{nameof(WriteToOneLakeFile)} Creating a new file succeeded for filePath: {filePath}");
            }
            catch (HttpRequestException ex)
            {
                // Handle HTTP request failure
                _logger.LogError($"{nameof(WriteToOneLakeFile)} Creating a new file failed for filePath: {filePath}. Error: {ex.Message}");
            }
            catch (Exception ex)
            {
                // Handle other types of exceptions
                _logger.LogError($"{nameof(WriteToOneLakeFile)} Creating a new file failed for filePath: {filePath}. Error: {ex.Message}");
            }

            await AppendToOneLakeFile(token, filePath, content);
        }

        public async Task<string> GetOneLakeFile(string token, string source)
        {
            var url = $"{EnvironmentConstants.OneLakeDFSBaseUrl}/{source}";

            try
            {
                var response = await _httpClientService.GetAsync(url, token);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                _logger.LogInformation($"{nameof(GetOneLakeFile)} succeeded for source: {source}");
                return content;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError($"{nameof(GetOneLakeFile)} failed for source: {source}. Error: {ex.Message}");
                return string.Empty;
            }
            catch (Exception ex)
            {
                _logger.LogError($"{nameof(GetOneLakeFile)} failed for source: {source}. Error: {ex.Message}");
                return string.Empty;
            }
        }

        public async Task DeleteOneLakeFile(string token, string filePath)
        {
            var uriBuilder = new UriBuilder(EnvironmentConstants.OneLakeDFSBaseUrl);
            uriBuilder.Path = filePath;
            uriBuilder.Query = "recursive=true";

            try
            {
                // Send the DELETE request using the _httpClientService
                var response = await _httpClientService.DeleteAsync(uriBuilder.Uri.ToString(), token);
                response.EnsureSuccessStatusCode();

                _logger.LogInformation($"{nameof(DeleteOneLakeFile)} succeeded for filePath: {filePath}");
            }
            catch (HttpRequestException ex)
            {
                // Handle HTTP request failure and log the error
                _logger.LogError($"{nameof(DeleteOneLakeFile)} failed for filePath: {filePath}. HTTP Error: {ex.Message}");
            }
            catch (Exception ex)
            {
                // Handle other types of exceptions and log the error
                _logger.LogError($"{nameof(DeleteOneLakeFile)} failed for filePath: {filePath}. Error: {ex.Message}");
            }
        }

        public string GetOneLakeFilePath(Guid workspaceId, Guid itemId, string fileName)
        {
            return $"{workspaceId}/{itemId}/Files/{fileName}";
        }

        private async Task AppendToOneLakeFile(string token, string filePath, string content)
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

                _logger.LogInformation($"{nameof(AppendToOneLakeFile)} succeeded for filePath: {filePath}");
            }
            catch (HttpRequestException ex)
            {
                // Handle HTTP request failure and log the error
                _logger.LogError($"{nameof(AppendToOneLakeFile)} failed for filePath: {filePath}. Error: {ex.Message}");
            }
            catch (Exception ex)
            {
                // Handle other types of exceptions and log the error
                _logger.LogError($"{nameof(AppendToOneLakeFile)} failed for filePath: {filePath}. Error: {ex.Message}");
            }

            _logger.LogInformation($"{nameof(AppendToOneLakeFile)} completed for filePath: {filePath}");
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

        private string BuildGetOneLakeFoldersQueryParameters(Guid itemId)
        {
            var queryParameters = new List<string>
            {
                $"directory={itemId}",
                "resource=filesystem",
                "recursive=false"
            };

            return string.Join("&", queryParameters);
        }
    }
}