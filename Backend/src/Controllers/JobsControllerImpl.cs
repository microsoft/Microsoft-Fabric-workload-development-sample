// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>


using Boilerplate.Services;
using Fabric_Extension_BE_Boilerplate.Contracts.FabricAPI.Workload;
using Fabric_Extension_BE_Boilerplate.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Net;
using System.Threading.Tasks;

namespace Fabric_Extension_BE_Boilerplate.Controllers
{
    [ServiceFilter(typeof(RequestLoggingFilter))]
    internal class JobsControllerImpl : IJobsController
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<JobsControllerImpl> _logger;
        private readonly IAuthenticationService _authenticationService;
        private readonly IItemFactory _itemFactory;

        public JobsControllerImpl(
            IHttpContextAccessor httpContextAccessor,
            ILogger<JobsControllerImpl> logger,
            IAuthenticationService authenticationService,
            IItemFactory itemFactory)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _authenticationService = authenticationService;
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
            
            _logger.LogInformation($"{nameof(CreateItemJobInstanceAsync)}: Running {jobType}.");

            _ = item.ExecuteJob(jobType, jobInstanceId, createItemJobInstanceRequest.InvokeType, createItemJobInstanceRequest.CreationPayload);

            _httpContextAccessor.HttpContext.Response.StatusCode = (int)HttpStatusCode.Accepted;
        }

        /// <inheritdoc/>
        public async Task<ItemJobInstanceState> GetItemJobInstanceStateAsync(Guid workspaceId, string itemType, Guid itemId, string jobType, Guid jobInstanceId)
        {
            var authorizationContext = await _authenticationService.AuthenticateControlPlaneCall(_httpContextAccessor.HttpContext);

            var item = _itemFactory.CreateItem(itemType, authorizationContext);
            await item.Load(itemId);

            _logger.LogInformation($"{nameof(GetItemJobInstanceStateAsync)}: Running {jobType}.");

            var jobState = await item.GetJobState(jobType, jobInstanceId);

            return jobState;
        }

        /// <inheritdoc/>
        public async Task<ItemJobInstanceState> CancelItemJobInstanceAsync(Guid workspaceId, string itemType, Guid itemId, string jobType, Guid jobInstanceId)
        {
            var authorizationContext = await _authenticationService.AuthenticateControlPlaneCall(_httpContextAccessor.HttpContext);

            var item = _itemFactory.CreateItem(itemType, authorizationContext);
            await item.Load(itemId);

            if (item.ItemObjectId == Guid.Empty)
            {
                _logger.LogInformation($"{nameof(CancelItemJobInstanceAsync)}: Item not found.");
                return new ItemJobInstanceState
                {
                    Status = JobInstanceStatus.Failed,
                    ErrorDetails = new ErrorDetails
                    {
                        ErrorCode = "ItemNotFound",
                        Message = "Item not found.",
                    },
                };
            }
            _logger.LogInformation($"{nameof(CancelItemJobInstanceAsync)}: Canceling {jobType} with jobInstanceId {jobInstanceId}.");

            await item.CancelJob(jobType, jobInstanceId);
            return new ItemJobInstanceState
            {
                Status = JobInstanceStatus.Cancelled,
                ErrorDetails = null,
            };
        }
    }
}