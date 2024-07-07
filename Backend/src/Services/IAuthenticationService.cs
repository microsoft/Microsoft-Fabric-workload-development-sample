// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System.Threading.Tasks;
using System.Collections.Generic;
using Boilerplate.Contracts;
using Microsoft.AspNetCore.Http;

namespace Boilerplate.Services
{
    public interface IAuthenticationService
    {
        /// <summary>
        /// Authenticates a control plane call based on
        ///     - the "subject and app" token sent in the 'Authorization' HTTP header with SubjectAndAppToken1.0 scheme
        ///     - the subject's tenantId sent in the 'ms-client-tenant-id' HTTP header
        /// </summary>
        /// <param name="httpContext">The context of the HTTP request</param>
        /// <param name="requireSubjectToken">Specifies whether the subject token is mandatory</param>
        /// <returns>The authorization context</returns>
        Task<AuthorizationContext> AuthenticateControlPlaneCall(HttpContext httpContext, bool requireSubjectToken = true, bool requireTenantIdHeader = true);

        /// <summary>
        /// Authenticates a control plane call based on
        ///     - the "subject and app" token sent in the 'Authorization' HTTP header with SubjectAndAppToken1.0 scheme
        ///     - the subject's tenantId sent in the 'ms-client-tenant-id' HTTP header
        /// </summary>
        /// <param name="httpContext">The context of the HTTP request</param>
        /// <param name="allowedScopes">A list of allowed scopes - if the token contains any of these scopes it is valid</param>
        /// <returns>The authorization context</returns>
        Task<AuthorizationContext> AuthenticateDataPlaneCall(HttpContext httpContext, IList<string> allowedScopes);

        /// <summary>
        /// Obtains an access token for scopes on behalf of a user using an existing token.
        /// </summary>
        /// <param name="authorizationContext">The authorization context representing the subject principal.</param>
        /// <param name="scopes">The scopes we want to acquire a token for.</param>
        /// <returns>The access token obtained on behalf of the user.</returns>
        Task<string> GetAccessTokenOnBehalfOf(AuthorizationContext authorizationContext, IList<string> scopes);

        /// <summary>
        /// Builds a composite token for authentication purposes.
        /// </summary>
        /// <param name="authorizationContext">The authorization context representing the subject principal.</param>
        /// <param name="scopes">The scopes we want to acquire a token for.</param>
        /// <returns>The composite token combining user token and service principal token.</returns>
        Task<string> BuildCompositeToken(AuthorizationContext authorizationContext, IList<string> scopes);
    }
}
