// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Constants;
using Boilerplate.Contracts;
using Boilerplate.Exceptions;
using Boilerplate.Utils;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace Boilerplate.Services
{
    public class AuthorizationHandler : IAuthorizationHandler
    {
        private static readonly IList<string> FabricScopes = new[] { $"{EnvironmentConstants.FabricBackendResourceId}/.default" };

        private readonly IAuthenticationService _authenticationService;
        private readonly IHttpClientService _httpClientService;
        private readonly ILogger<AuthorizationHandler> _logger;

        public AuthorizationHandler(
            IAuthenticationService authenticationService,
            IHttpClientService httpClientService,
            ILogger<AuthorizationHandler> logger)
        {
            _authenticationService = authenticationService;
            _httpClientService = httpClientService;
            _logger = logger;
        }

        /// <inheritdoc/>
        public async Task ValidatePermissions(AuthorizationContext authorizationContext, Guid workspaceObjectId, Guid itemObjectId, IList<string> requiredPermissions)
        {
            // For calling Fabric workload-control APIs we need a SubjectAndApp token with Fabric audience
            var subjectAndAppToken = await _authenticationService.BuildCompositeToken(authorizationContext, FabricScopes);

            // Resolve item permissions using the provided token
            var response = await ResolveItemPermissions(subjectAndAppToken, workspaceObjectId, itemObjectId);
            Ensure.NotNull(response?.Permissions, "Fabric response should contain permissions");

            // Check if any of the required permissions is missing
            if (requiredPermissions.Except(response.Permissions, StringComparer.OrdinalIgnoreCase).Any())
            {
                _logger.LogError(
                    "Insufficient permissions: subjectTenantObjectId={0}, subjectObjectId={1}, workspaceObjectId={2}, itemObjectId={3}, requiredPermissions=[{4}], actualPermissions=[{5}]",
                    authorizationContext.TenantObjectId,
                    authorizationContext.ObjectId,              // NOTE: ObjectId is EUPI and requries special handling
                    workspaceObjectId,
                    itemObjectId,
                    requiredPermissions,
                    response.Permissions);

                throw new UnauthorizedException();
            }
        }

        /// <summary>
        /// Resolves the permissions for the item using the provided access token asynchronously.
        /// </summary>
        /// <param name="token">The access token for authentication.</param>
        /// <param name="workspaceId">The ID of the workspace where the item resides.</param>
        /// <param name="itemId">The ID of the item for which permissions are being resolved.</param>
        /// <returns>The resolved permissions for the item.</returns>
        private async Task<ResolvePermissionsResponse> ResolveItemPermissions(string token, Guid workspaceId, Guid itemId)
        {
            var url = $"{ApiConstants.WorkloadControlApiBaseUrl}/workspaces/{workspaceId}/items/{itemId}/resolvepermissions";

            var response = await _httpClientService.GetAsync(url, token);
            response.EnsureSuccessStatusCode();

            // Deserialize the response content directly into a C# object
            return await response.Content.ReadAsAsync<ResolvePermissionsResponse>();
        }
    }
}
