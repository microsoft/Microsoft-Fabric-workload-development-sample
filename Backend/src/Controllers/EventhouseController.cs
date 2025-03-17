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