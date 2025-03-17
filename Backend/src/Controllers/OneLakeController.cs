// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Constants;
using Boilerplate.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Boilerplate.Controllers
{
    [ApiController]
    public class OneLakeController : ControllerBase
    {
        private readonly ILogger<OneLakeController> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAuthenticationService _authenticationService;
        private readonly IOneLakeClientService _oneLakeClientService;
        private readonly IAuthorizationHandler _authorizationHandler;
        private readonly IItemFactory _itemFactory;

        public OneLakeController(
            ILogger<OneLakeController> logger,
            IHttpContextAccessor httpContextAccessor,
            IAuthenticationService authenticationService,
            IOneLakeClientService oneLakeClientService,
            IAuthorizationHandler authorizationHandler,
            IItemFactory itemFactory)
        {
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _authenticationService = authenticationService;
            _oneLakeClientService = oneLakeClientService;
            _authorizationHandler = authorizationHandler;
            _itemFactory = itemFactory;
        }

        /// <summary>
        /// Returns a flag indicating whether OneLake storage is supported for this item.
        /// OneLake is supported if the workload opts in via the "CreateOneLakeFoldersOnArtifactCreation" flag
        /// </summary>
        /// <returns>true if OneLake is supported for this item, false otherwise</returns>
        [HttpGet("{workspaceObjectId:guid}/{itemObjectId:guid}/isOneLakeSupported")]
        public async Task<IActionResult> IsOneLakeSupported(Guid workspaceObjectId, Guid itemObjectId)
        {
            var authorizationContext = await _authenticationService.AuthenticateDataPlaneCall(_httpContextAccessor.HttpContext, allowedScopes: new[] { WorkloadScopes.Item1ReadWriteAll });
            var token = await _authenticationService.GetAccessTokenOnBehalfOf(authorizationContext, OneLakeConstants.OneLakeScopes);
            var folderNames = await _oneLakeClientService.GetOneLakeFolderNames(token, workspaceObjectId, itemObjectId);

            return Ok(folderNames?.Any() ?? false);
        }
    }
}
