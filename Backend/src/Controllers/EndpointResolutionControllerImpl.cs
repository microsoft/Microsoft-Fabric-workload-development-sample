// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Services;
using Fabric_Extension_BE_Boilerplate.Contracts.FabricAPI.Workload;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace Fabric_Extension_BE_Boilerplate.Controllers
{
    public class EndpointResolutionControllerImpl : IEndpointResolutionController
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<EndpointResolutionControllerImpl> _logger;
        private readonly IAuthenticationService _authenticationService;

        public EndpointResolutionControllerImpl(
            IHttpContextAccessor httpContextAccessor,
            ILogger<EndpointResolutionControllerImpl> logger,
            IAuthenticationService authenticationService)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _authenticationService = authenticationService;

            _logger.LogTrace("EndpointResolutionControllerImpl: Instance created");
        }

        /// <summary>
        /// Resolves the service endpoint for requests originating from Microsoft Fabric based on resolution context.
        /// </summary>
        /// <param name="request">The request body for endpoint resolution.</param>
        /// <returns>An EndpointResolutionResponse with the resolved URL and additional metadata.</returns>
        public async Task<EndpointResolutionResponse> ResolveAsync(EndpointResolutionRequest body)
        {
            _logger.LogInformation("ResolveAsync: Attempting to resolve endpoint");

            if (body == null)
            {
                throw new ArgumentNullException(nameof(body), "ResolveAsync: The request cannot be null.");
            }

            if (body.Context == null || body.Context.Count == 0)
            {
                throw new ArgumentException("ResolveAsync: The resolution context is missing or empty.", nameof(body.Context));
            }

            var authorizationContext = await _authenticationService.AuthenticateControlPlaneCall(_httpContextAccessor.HttpContext, requireSubjectToken: false, requireTenantIdHeader: false);

            // Implement the actual logic to resolve the endpoint based on the request's properties.
            var resolvedUrl = ResolveEndpointUrl(body);

            // The TTL is set to a default value; adjust as necessary based on caching requirements.
            int ttlInMinutes = 60;

            var response = new EndpointResolutionResponse
            {
                Url = resolvedUrl,
                TtlInMinutes = ttlInMinutes,
            };

            _logger.LogInformation($"Resolved endpoint URL: {response.Url}");

            return response;
        }

        private string ResolveEndpointUrl(EndpointResolutionRequest request)
        {
            // Placeholder for actual endpoint resolution logic.
            // This should be replaced with the real implementation.

            string contextJson = Newtonsoft.Json.JsonConvert.SerializeObject(request.Context);
            _logger.LogInformation($"Resolving endpoint with Context Properties: {contextJson}");

            var httpContext = _httpContextAccessor.HttpContext;

            if (httpContext == null)
            {
                throw new InvalidOperationException("HTTP context is not available for resolving the endpoint URL.");
            }

            var baseUrl = $"{httpContext.Request.Scheme}://{httpContext.Request.Host}{httpContext.Request.PathBase}";
            var apiBaseRoute = "/workload"; // This should be replaced with the actual base route of your API
            baseUrl = $"{baseUrl}{apiBaseRoute}";

            return baseUrl;
        }
    }
}
