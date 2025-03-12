// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Constants;
using Boilerplate.Items;
using Boilerplate.Services;
using Fabric_Extension_BE_Boilerplate.Constants;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Threading.Tasks;

namespace Boilerplate.Controllers
{
    /// <summary>
    /// Implements REST APIs used by the UI extension
    /// </summary>
    [ApiController]
    public class FabricExtensionController : ControllerBase
    {
        private readonly ILogger<FabricExtensionController> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAuthenticationService _authenticationService;
        private readonly IOneLakeClientService _oneLakeClientService;
        private readonly IAuthorizationHandler _authorizationHandler;
        private readonly IItemFactory _itemFactory;

        public FabricExtensionController(
            ILogger<FabricExtensionController> logger,
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
        /// Gets a list of arithmetic operators supported for Item1.
        /// </summary>
        /// <returns>A FabricItemMetadata representing the retrieved item.</returns>
        [HttpGet("item1SupportedOperators")]
        public async Task<IActionResult> GetItem1SupportedOperators()
        {
            // This method is not related to any specific item instance so no need to check permissions.
            // We still require an authenticated user and Item1.ReadWrite.All scope (because this information is only needed when editing an item).
            await _authenticationService.AuthenticateDataPlaneCall(_httpContextAccessor.HttpContext, allowedScopes: new[] { WorkloadScopes.Item1ReadWriteAll });
            return Ok(Item1.SupportedOperators);
        }

        /// <summary>
        /// Doubles the result of the calculation for an instance of Item1.
        /// </summary>
        /// <returns>A FabricItemMetadata representing the updated item.</returns>
        [HttpPost("{workspaceObjectId}/{itemObjectId}/item1DoubleResult")]
        public async Task<IActionResult> Item1DoubleResult(Guid workspaceObjectId, Guid itemObjectId)
        {
            _logger.LogInformation("Double called: workspaceObjectId={0}, itemObjectId={1}", workspaceObjectId, itemObjectId);

            // Authenticate the call
            var authorizationContext = await _authenticationService.AuthenticateDataPlaneCall(_httpContextAccessor.HttpContext, allowedScopes: new[] { WorkloadScopes.Item1ReadWriteAll });

            // This is a direct call to the workload which was not verified by Fabric, so need to check permissions.
            await _authorizationHandler.ValidatePermissions(authorizationContext, workspaceObjectId, itemObjectId, new[] { "Read", "Write" });

            // Now can execute the action on the item
            var item = (IItem1)_itemFactory.CreateItem(WorkloadConstants.ItemTypes.Item1, authorizationContext);
            await item.Load(itemObjectId);
            var doubleResult = await item.Double();

            var serializedDoubleResult = JsonConvert.SerializeObject(new { Operand1 = doubleResult.Operand1, Operand2 = doubleResult.Operand2 });

            // Return the updated operands
            return Ok(serializedDoubleResult);
        }

        [HttpGet("{itemObjectId}/getLastResult")]
        public async Task<IActionResult> GetLastResult(Guid itemObjectId)
        {
            // Authenticate the call
            var authorizationContext = await _authenticationService.AuthenticateDataPlaneCall(_httpContextAccessor.HttpContext, allowedScopes: new[] { WorkloadScopes.Item1ReadWriteAll });

            var item = (IItem1)_itemFactory.CreateItem(WorkloadConstants.ItemTypes.Item1, authorizationContext);
            await item.Load(itemObjectId);
            var lastResult = await item.GetLastResult();
            return Ok(lastResult);
        }
    }
}
