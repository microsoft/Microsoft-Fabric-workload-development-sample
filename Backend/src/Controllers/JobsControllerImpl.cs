// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>


using Boilerplate.Services;
using Fabric_Extension_BE_Boilerplate.Contracts.FabricAPI.Workload;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Net;
using System.Threading.Tasks;

namespace Fabric_Extension_BE_Boilerplate.Controllers
{
    internal class JobsControllerImpl : IJobsController
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<JobsControllerImpl> _logger;
        private readonly IAuthenticationService _authenticationService;
        private readonly ILakehouseClientService _lakeHouseClientService;
        private readonly IItemFactory _itemFactory;

        public JobsControllerImpl(
            IHttpContextAccessor httpContextAccessor,
            ILogger<JobsControllerImpl> logger,
            IAuthenticationService authenticationService,
            ILakehouseClientService lakeHouseClientService,
            IItemFactory itemFactory)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _authenticationService = authenticationService;
            _lakeHouseClientService = lakeHouseClientService;
            _itemFactory = itemFactory;

            _logger.LogTrace("FabricItemsJobsHandler: Instance created");
        }

        /// <inheritdoc/>
        public async Task CreateItemJobInstanceAsync(
            Guid workspaceId,
            string itemType,
            Guid itemId,
            string jobType,
            Guid jobInstanceId,
            CreateItemJobInstanceRequest createItemJobInstanceRequest)
        {
            var authorizationContext = await _authenticationService.AuthenticateControlPlaneCall(_httpContextAccessor.HttpContext);

            var item = _itemFactory.CreateItem(itemType, authorizationContext);
            await item.Load(itemId);

            _logger.LogInformation($"OnRunFabricItemJobAsync: Running {jobType}.");

            await item.ExecuteJob(jobType, jobInstanceId, createItemJobInstanceRequest.InvokeType, createItemJobInstanceRequest.CreationPayload);

            _httpContextAccessor.HttpContext.Response.StatusCode = (int)HttpStatusCode.Accepted;
        }

        /// <inheritdoc/>
        public async Task<ItemJobInstanceState> GetItemJobInstanceStateAsync(Guid workspaceId, string itemType, Guid itemId, string jobType, Guid jobInstanceId)
        {
            var authorizationContext = await _authenticationService.AuthenticateControlPlaneCall(_httpContextAccessor.HttpContext);

            var item = _itemFactory.CreateItem(itemType, authorizationContext);
            await item.Load(itemId);

            _logger.LogInformation($"OnRunFabricItemJobAsync: Running {jobType}.");

            var jobState = await item.GetJobState(jobType, jobInstanceId);

            return jobState;
        }

        /// <inheritdoc/>
        public Task<ItemJobInstanceState> CancelItemJobInstanceAsync(Guid workspaceId, string itemType, Guid itemId, string jobType, Guid jobInstanceId)
        {
            throw new NotImplementedException();
        }
    }
}