// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Constants;
using Boilerplate.Contracts;
using Boilerplate.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Boilerplate.Controllers
{
    [ApiController]
    public class LakehouseController : ControllerBase
    {
        private static readonly IList<string> OneLakeScopes = new[] { $"{EnvironmentConstants.OneLakeResourceId}/.default" };
        private static readonly IList<string> ScopesForReadLakehouseFile = new[] { WorkloadScopes.FabricLakehouseReadAll, WorkloadScopes.FabricLakehouseReadWriteAll };
        private static readonly IList<string> ScopesForWriteLakehouseFile = new[] { WorkloadScopes.FabricLakehouseReadWriteAll };

        private readonly ILogger<LakehouseController> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAuthenticationService _authenticationService;
        private readonly ILakehouseClientService _lakeHouseClientService;

        public LakehouseController(
            ILogger<LakehouseController> logger,
            IHttpContextAccessor httpContextAccessor,
            IAuthenticationService authenticationService,
            ILakehouseClientService lakeHouseClientService)
        {
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _authenticationService = authenticationService;
            _lakeHouseClientService = lakeHouseClientService;
        }

        [HttpGet("getLakehouseFile")]
        public async Task<IActionResult> GetLakehouseFile(string source)
        {
            var authorizationContext = await _authenticationService.AuthenticateDataPlaneCall(_httpContextAccessor.HttpContext, allowedScopes: ScopesForReadLakehouseFile);
            var lakeHouseAccessToken = await _authenticationService.GetAccessTokenOnBehalfOf(authorizationContext, OneLakeScopes);

            var data = await _lakeHouseClientService.GetLakehouseFile(lakeHouseAccessToken, source);

            if (string.IsNullOrEmpty(data))
            {
                _logger.LogWarning($"GetLakehouseFile returned empty data for source: {source}");
                // Return a 204 No Content status code for empty data
                return NoContent();
            }

            _logger.LogInformation($"GetLakehouseFile succeeded for source: {source}");
            return Ok(data);
        }

        [HttpPut("writeToLakehouseFile")]
        public async Task<IActionResult> WriteToLakehouseFile([FromBody] WriteToLakehouseFileRequest request)
        {
            var authorizationContext = await _authenticationService.AuthenticateDataPlaneCall(_httpContextAccessor.HttpContext, allowedScopes: ScopesForWriteLakehouseFile);
            var lakeHouseAccessToken = await _authenticationService.GetAccessTokenOnBehalfOf(authorizationContext, OneLakeScopes);

            var filePath = $"{request.WorkspaceId}/{request.LakehouseId}/Files/{request.FileName}";

            var fileExists = await _lakeHouseClientService.CheckIfFileExists(lakeHouseAccessToken, filePath);

            if (fileExists && !request.OverwriteIfExists)
            {
                // File exists, and overwrite is not allowed, return an appropriate response
                _logger.LogError($"WriteToLakehouseFile failed. The file already exists at filePath: {filePath}.");
                return Conflict("File already exists. Overwrite is not allowed.");
            }

            // The WriteToLakehouseFile method creates a new item if it doesn't exist,
            // but if it already exists and overwrite is allowed, it deletes the existing one and then creates a new one and writes content to it.
            await _lakeHouseClientService.WriteToLakehouseFile(lakeHouseAccessToken, filePath, request.Content);

            _logger.LogInformation($"WriteToLakehouseFile succeeded for filePath: {filePath}");
            return Ok();
        }

        [HttpGet("onelake/{workspaceId:guid}/{lakehouseId:guid}/tables")]
        public async Task<IActionResult> GetTablesAsync(Guid workspaceId, Guid lakehouseId)
        {
            var authorizationContext = await _authenticationService.AuthenticateDataPlaneCall(_httpContextAccessor.HttpContext, allowedScopes: ScopesForReadLakehouseFile);
            var token = await _authenticationService.GetAccessTokenOnBehalfOf(authorizationContext, OneLakeScopes);
            var tables = await _lakeHouseClientService.GetOneLakeTables(token, workspaceId, lakehouseId);
            return Ok(tables);
        }


    }
}