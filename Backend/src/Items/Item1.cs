// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Constants;
using Boilerplate.Contracts;
using Boilerplate.Exceptions;
using Boilerplate.Services;
using Boilerplate.Utils;
using Fabric_Extension_BE_Boilerplate.Constants;
using Fabric_Extension_BE_Boilerplate.Contracts.FabricAPI.Workload;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace Boilerplate.Items
{
    public class Item1 : ItemBase<Item1, Item1Metadata, Item1ClientMetadata>, IItem1
    {
        public static readonly IList<string> SupportedOperators = Enum.GetNames(typeof(Item1Operator))
            .Where(name => name != nameof(Item1Operator.Undefined)).ToList();

        private static readonly IList<string> OneLakeScopes = new[] { $"{EnvironmentConstants.OneLakeResourceId}/.default" };

        private static readonly IList<string> FabricScopes = new[] { $"{EnvironmentConstants.FabricBackendResourceId}/Lakehouse.Read.All" };

        private readonly ILakehouseClientService _lakeHouseClientService;

        private readonly IAuthenticationService _authenticationService;

        private Item1Metadata _metadata;

        public Item1(
            ILogger<Item1> logger,
            IItemMetadataStore itemMetadataStore,
            ILakehouseClientService lakeHouseClientService,
            IAuthenticationService authenticationService,
            AuthorizationContext authorizationContext)
            : base(logger, itemMetadataStore, authorizationContext)
        {
            _lakeHouseClientService = lakeHouseClientService;
            _authenticationService = authenticationService;
        }

        public override string ItemType => WorkloadConstants.ItemTypes.Item1;

        public ItemReference Lakehouse => Metadata.Lakehouse;

        public int Operand1 => Metadata.Operand1;

        public int Operand2 => Metadata.Operand2;

        public override async Task<ItemPayload> GetItemPayload()
        {
            var typeSpecificMetadata = GetTypeSpecificMetadata();

            FabricItem lakehouseItem = null;
            if (typeSpecificMetadata.Lakehouse.Id != Guid.Empty)
            {
                try
                {
                    var token = await _authenticationService.GetAccessTokenOnBehalfOf(AuthorizationContext, FabricScopes);
                    lakehouseItem = await _lakeHouseClientService.GetFabricLakehouse(token, typeSpecificMetadata.Lakehouse.WorkspaceId, typeSpecificMetadata.Lakehouse.Id);
                }
                catch (Exception ex)
                {
                    Logger.LogError($"Failed to retrieve FabricLakehouse for lakehouse: {typeSpecificMetadata.Lakehouse.Id} in workspace: {typeSpecificMetadata.Lakehouse.WorkspaceId}. Error: {ex.Message}");
                }
            }

            return new ItemPayload
            {
                Item1Metadata = typeSpecificMetadata.ToClientMetadata(lakehouseItem)
            };
        }

        public override async Task ExecuteJob(string jobType, Guid jobInstanceId, JobInvokeType invokeType, CreateItemJobInstancePayload creationPayload)
        {
            var token = await _authenticationService.GetAccessTokenOnBehalfOf(AuthorizationContext, OneLakeScopes);

            var op1 = _metadata.Operand1;
            var op2 = _metadata.Operand2;
            var calculationOperator = _metadata.Operator;

            var result = CalculateResult(op1, op2, calculationOperator);

            // Write result to Lakehouse
            var filePath = GetLakehouseFilePath(jobType, jobInstanceId);
            await _lakeHouseClientService.WriteToLakehouseFile(token, filePath, result);
        }

        public override async Task<ItemJobInstanceState> GetJobState(string jobType, Guid jobInstanceId)
        {
            var token = await _authenticationService.GetAccessTokenOnBehalfOf(AuthorizationContext, OneLakeScopes);

            var filePath = GetLakehouseFilePath(jobType, jobInstanceId);
            var fileExists = await _lakeHouseClientService.CheckIfFileExists(token, filePath);

            return new ItemJobInstanceState
            {
                Status = fileExists ? JobInstanceStatus.Completed : JobInstanceStatus.InProgress,
            };
        }

        private string GetLakehouseFilePath(string jobType, Guid jobInstanceId)
        {
            var typeToFileName = new Dictionary<string, string>
            {
                { Item1JobType.ScheduledJob, $"CalculationResult_{jobInstanceId}.txt" },
                { Item1JobType.CalculateAsText, $"CalculationResult_{jobInstanceId}.txt" },
                { Item1JobType.CalculateAsParquet, $"CalculationResult_{jobInstanceId}.parquet" }
            };
            typeToFileName.TryGetValue(jobType, out var fileName);

            if (fileName != null)
            {
                return $"{_metadata.Lakehouse.WorkspaceId}/{_metadata.Lakehouse.Id}/Files/{fileName}";
            }
            throw new NotSupportedException("Workload job type is not supported");
        }

        private string CalculateResult(int op1, int op2, Item1Operator calculationOperator)
        {
            switch (calculationOperator)
            {
                case Item1Operator.Add:
                    return FormatResult(op1, op2, calculationOperator, op1 + op2);
                case Item1Operator.Subtract:
                    return FormatResult(op1, op2, calculationOperator, op1 - op2);
                case Item1Operator.Multiply:
                    return FormatResult(op1, op2, calculationOperator, op1 * op2);
                case Item1Operator.Divide:
                    if (op2 != 0)
                    {
                        return FormatResult(op1, op2, calculationOperator, op1 / op2);
                    }
                    else
                    {
                        throw new ArgumentException("Cannot divide by zero.");
                    }
                case Item1Operator.Random:
                    var rand = new Random().Next(op1, op2);
                    return FormatResult(op1, op2, calculationOperator, rand);
                default:
                    throw new ArgumentException($"Unsupported operator: {calculationOperator}");
            }
        }

        private string FormatResult(int op1, int op2, Item1Operator calculationOperator, int result)
        {
            return $"op1 = {op1}, op2 = {op2}, operator = {calculationOperator}, result = {result}";
        }

        public Item1Operator Operator => Metadata.Operator;

        private Item1Metadata Metadata => Ensure.NotNull(_metadata, "The item object must be initialized before use");

        public async Task<(double Operand1, double Operand2)> Double()
        {
            var metadata = Metadata.Clone();

            switch (metadata.Operator)
            {
                case Item1Operator.Add:
                case Item1Operator.Subtract:
                case Item1Operator.Random:
                    metadata.Operand1 *= 2;
                    metadata.Operand2 *= 2;
                    break;

                case Item1Operator.Multiply:
                case Item1Operator.Divide:
                    metadata.Operand1 *= 2;
                    break;

                default:
                    throw Ensure.UnexpectedSwitchValue(metadata.Operator, "Unexpected operator");
            }

            _metadata = metadata;

            await SaveChanges();

            return (metadata.Operand1, metadata.Operand2);
        }

        protected override void SetDefinition(CreateItemPayload payload)
        {
            if (payload == null)
            {
                Logger.LogInformation("No payload is provided for {0}, objectId={1}", ItemType, ItemObjectId);
                _metadata = Item1Metadata.Default.Clone();
                return;
            }

            if (payload.Item1Metadata == null)
            {
                throw new InvalidItemPayloadException(ItemType, ItemObjectId);
            }

            if (payload.Item1Metadata.Lakehouse == null)
            {
                throw new InvalidItemPayloadException(ItemType, ItemObjectId)
                    .WithDetail(ErrorCodes.ItemPayload.MissingLakehouseReference, "Missing Lakehouse reference");
            }

            _metadata = payload.Item1Metadata.Clone();
        }

        protected override void UpdateDefinition(UpdateItemPayload payload)
        {
            if (payload == null)
            {
                Logger.LogInformation("No payload is provided for {0}, objectId={1}", ItemType, ItemObjectId);
                return;
            }

            if (payload.Item1Metadata == null)
            {
                throw new InvalidItemPayloadException(ItemType, ItemObjectId);
            }

            if (payload.Item1Metadata.Lakehouse == null)
            {
                throw new InvalidItemPayloadException(ItemType, ItemObjectId)
                    .WithDetail(ErrorCodes.ItemPayload.MissingLakehouseReference, "Missing Lakehouse reference");
            }

            SetTypeSpecificMetadata(payload.Item1Metadata);
        }

        protected override void SetTypeSpecificMetadata(Item1Metadata itemMetadata)
        {
            _metadata = itemMetadata.Clone();
        }

        protected override Item1Metadata GetTypeSpecificMetadata()
        {
            return Metadata.Clone();
        }
    }
}
