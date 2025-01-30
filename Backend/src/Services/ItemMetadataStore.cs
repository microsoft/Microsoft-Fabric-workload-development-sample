// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Contracts;
using Boilerplate.Exceptions;
using Fabric_Extension_BE_Boilerplate.Constants;
using Fabric_Extension_BE_Boilerplate.Utils;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Concurrent;
using System.IO;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Boilerplate.Services
{
    /// <summary>
    /// This is a naive implementation of a metadata store intended for demonstrating concepts of Fabric workload extensibility.
    /// It does not handle many important aspects like concurrency control, transactional updates, encryption at rest and more.
    /// </summary>
    public class ItemMetadataStore : IItemMetadataStore
    {
        private const string CommonItemMetadataFilename = "common.metadata.json";
        private const string TypeSpecificMetadataFilename = "item.metadata.json";
        private static readonly ConcurrentDictionary<string, SemaphoreSlim> semaphores = new ConcurrentDictionary<string, SemaphoreSlim>();

        private static readonly JsonConverter<Item1Operator> Item1OperatorConverter = new UnknownAsDefaultEnumConverter<Item1Operator>();
        private static readonly JsonSerializerOptions ContentSerializationOptions = new JsonSerializerOptions
        { 
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true,
            Converters = { Item1OperatorConverter },
        };

        private readonly ILogger<ItemMetadataStore> _logger;
        private readonly string _baseDirectory;

        public ItemMetadataStore(ILogger<ItemMetadataStore> logger)
        {
            _logger = logger;
            _baseDirectory = GetBaseDirectoryPath(WorkloadConstants.WorkloadName);
        }

        public async Task Upsert<TItemMetadata>(Guid tenantObjectId, Guid itemObjectId, CommonItemMetadata commonMetadata, TItemMetadata typeSpecificMetadata)
        {
            var itemMetadataDirectoryPath = GetSubDirectoryFullPath(_baseDirectory, $"{tenantObjectId}\\{itemObjectId}");
            Directory.CreateDirectory(itemMetadataDirectoryPath);

            await StoreFile(itemMetadataDirectoryPath, CommonItemMetadataFilename, commonMetadata);
            await StoreFile(itemMetadataDirectoryPath, TypeSpecificMetadataFilename, typeSpecificMetadata);
        }

        public async Task UpsertJobCancel(Guid tenantObjectId, Guid itemObjectId, string jobType, Guid jobInstanceId, ItemJobMetadata itemJobMetadata)
        {
            var itemMetadataDirectoryPath = GetSubDirectoryFullPath(_baseDirectory, $"{tenantObjectId}\\{itemObjectId}");
            Directory.CreateDirectory(itemMetadataDirectoryPath);

            var jobCancelRequestFilename = $"{jobInstanceId}.jobcancel.json";
            await StoreFile(itemMetadataDirectoryPath, jobCancelRequestFilename, itemJobMetadata);
        }

        public async Task<ItemMetadata<TItemMetadata>> Load<TItemMetadata>(Guid tenantObjectId, Guid itemObjectId)
        {
            var itemMetadataDirectoryPath = GetSubDirectoryFullPath(_baseDirectory, $"{tenantObjectId}\\{itemObjectId}");
            var commonMetadata = await LoadFile<CommonItemMetadata>(itemMetadataDirectoryPath, CommonItemMetadataFilename);
            var typeSpecificMetadata = await LoadFile<TItemMetadata>(itemMetadataDirectoryPath, TypeSpecificMetadataFilename);
            return new ItemMetadata<TItemMetadata> {  CommonMetadata = commonMetadata, TypeSpecificMetadata = typeSpecificMetadata };
        }

        public bool Exists(Guid tenantObjectId, Guid itemObjectId)
        {
            var itemDirectoryPath = GetSubDirectoryFullPath(_baseDirectory, $"{tenantObjectId}\\{itemObjectId}");
            var commonItemMetadataFilePath = Path.Combine(itemDirectoryPath, CommonItemMetadataFilename);
            var itemMetadataFilePath = Path.Combine(itemDirectoryPath, TypeSpecificMetadataFilename);
            return File.Exists(commonItemMetadataFilePath) && File.Exists(itemMetadataFilePath);
        }

        public Task Delete(Guid tenantObjectId, Guid itemObjectId)
        {
            var itemDirectoryPath = GetSubDirectoryFullPath(_baseDirectory, $"{tenantObjectId}\\{itemObjectId}");
            Directory.Delete(itemDirectoryPath, recursive: true);
            return Task.CompletedTask;
        }

        private async Task StoreFile<TContent>(string directoryPath, string filename, TContent content)
        {
            var filePath = GetSubDirectoryFullPath(directoryPath, filename);
            var semaphore = semaphores.GetOrAdd(filePath, _ => new SemaphoreSlim(1, 1));
            await semaphore.WaitAsync();
            try
            {
                var serializedContent = JsonSerializer.Serialize(content, ContentSerializationOptions);
                await File.WriteAllTextAsync(filePath, serializedContent);
            }
            finally
            {
                semaphore.Release();
            }
        }

        private async Task<TContent> LoadFile<TContent>(string directoryPath, string filename)
        {
            var filePath = GetSubDirectoryFullPath(directoryPath, filename);
            var semaphore = semaphores.GetOrAdd(filePath, _ => new SemaphoreSlim(1, 1));
            await semaphore.WaitAsync();
            try
            {
                var content = await File.ReadAllTextAsync(filePath);
                return JsonSerializer.Deserialize<TContent>(content, ContentSerializationOptions);
            }
            finally
            {
                semaphore.Release();
            }
        }

        private static string GetBaseDirectoryPath(string workloadName)
        {
            return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), workloadName);
        }

        private static string GetSubDirectoryFullPath(string basePath, string relativePath)
        {
            var subDirectoryFullPath = Path.Combine(basePath, relativePath);
            if (!subDirectoryFullPath.StartsWith(basePath))
            {
                throw new InvalidRelativePathException(relativePath);
            }

            return subDirectoryFullPath;
        }

        public bool JobCancelRequestExists(Guid tenantObjectId, Guid itemObjectId, Guid jobInstanceId)
        {
            var itemDirectoryPath = GetSubDirectoryFullPath(_baseDirectory, $"{tenantObjectId}\\{itemObjectId}");
            var jobCancelRequestFilename = $"{jobInstanceId}.jobcancel.json";
            var jobCancelRequestFilePath = Path.Combine(itemDirectoryPath, jobCancelRequestFilename);
            return File.Exists(jobCancelRequestFilePath);
        }
    }
}
