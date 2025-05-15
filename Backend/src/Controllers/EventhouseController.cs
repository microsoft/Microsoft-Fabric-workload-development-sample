using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Boilerplate.Constants;
using Boilerplate.Contracts.KustoItems;
using Boilerplate.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Boilerplate.Controllers
{
    public class EventhouseController : ControllerBase
    {
        private static readonly IList<string> EventhubFabricScopes = new[] { $"{EnvironmentConstants.FabricBackendResourceId}/Eventhouse.Read.All" };
        private readonly ILogger<EventhouseController> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAuthenticationService _authenticationService;
        private readonly IHttpClientService _httpClientService;

        public EventhouseController(
            ILogger<EventhouseController> logger,
            IHttpContextAccessor httpContextAccessor,
            IAuthenticationService authenticationService,
            IHttpClientService httpClientService
        )
        {
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _authenticationService = authenticationService;
            _httpClientService = httpClientService;
        }

        /// <summary>
        /// Retrieves an Eventhouse by its ID within a specified workspace.
        /// In order for this method to succeed, the caller must have the appropriate permissions to access the Eventhouse.
        /// Permissions and scopes are defined in Entra ID application. For this request the scope is: FabricEventhouse.Read.All
        /// For more information please follow the link:
        /// https://learn.microsoft.com/en-us/fabric/workload-development-kit/fabric-data-plane#api-permissions
        /// </summary>
        /// <param name="workspaceId">The ID of the workspace containing the Eventhouse.</param>
        /// <param name="eventhouseId">The ID of the Eventhouse to retrieve.</param>
        /// <returns>An IActionResult containing the Eventhouse details if successful, or an error message if the request fails.</returns>
        [HttpGet("eventhouse/{workspaceId}/{eventhouseId}")]
        public async Task<IActionResult> GetEventhouse(Guid workspaceId, Guid eventhouseId)
        {
            _logger.LogInformation("GetEventhouse: get eventhouse '{0}' in workspace '{1}'", eventhouseId, workspaceId);
            var authorizationContext = await _authenticationService.AuthenticateDataPlaneCall(_httpContextAccessor.HttpContext, allowedScopes: new string[] {WorkloadScopes.FabricEventhouseReadAll});
            var token = await _authenticationService.GetAccessTokenOnBehalfOf(authorizationContext, EventhubFabricScopes);

            var url = $"{EnvironmentConstants.FabricApiBaseUrl}/v1/workspaces/{workspaceId}/eventhouses/{eventhouseId}";

            var response = await _httpClientService.GetAsync(url, token);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("GetEventhouse: failed to get eventhouse '{0}' in workspace '{1}'", eventhouseId, workspaceId);
                return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
            }
            var eventhouse = await response.Content.ReadAsAsync<EventhouseItem>();
            return Ok(eventhouse);
        }
    }
}