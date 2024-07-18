// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Constants;
using Boilerplate.Contracts;
using Boilerplate.Utils;
using Fabric_Extension_BE_Boilerplate.Constants;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Identity.Client;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Net.Http.Headers;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Authentication;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;

namespace Boilerplate.Services
{
    public class AuthenticationService : IAuthenticationService
    {
        private static readonly IList<string> SubjectAndAppAuthAllowedScopes = new[] { WorkloadScopes.FabricWorkloadControl };

        private readonly IConfigurationManager<OpenIdConnectConfiguration> _openIdConnectConfigurationManager;
        private readonly IConfidentialClientApplication _confidentialClientApplication;
        private readonly ILogger<AuthenticationService> _logger;

        private readonly string _publisherTenantId;
        private readonly string _audience;

        public AuthenticationService(
            IConfigurationService configurationService,
            IConfigurationManager<OpenIdConnectConfiguration> openIdConnectConfigurationManager,
            IConfidentialClientApplication confidentialClientApplication,
            ILogger<AuthenticationService> logger)
        {
            _openIdConnectConfigurationManager = openIdConnectConfigurationManager;
            _confidentialClientApplication = confidentialClientApplication;
            _logger = logger;

            var configuration = configurationService.GetConfiguration();
            _publisherTenantId = configuration["PublisherTenantId"];
            _audience = configuration["Audience"];
        }

        public async Task<AuthorizationContext> AuthenticateControlPlaneCall(HttpContext httpContext, bool requireSubjectToken = true, bool requireTenantIdHeader = true)
        {
            if (!httpContext.Request.Headers.TryGetValue(HttpHeaders.Authorization, out var authValues) || authValues.Count != 1)
            {
                throw new AuthenticationException($"Missing or invalid {HttpHeaders.Authorization} header");
            }

            Guid? tenantId = null;

            if (requireTenantIdHeader)
            {
                if (!httpContext.Request.Headers.TryGetValue(HttpHeaders.XmsClientTenantId, out var tenantIdValues) ||
                    tenantIdValues.Count != 1 ||
                    !Guid.TryParse(tenantIdValues.Single(), out var parsedTenantId))
                {
                        throw new AuthenticationException($"Missing or invalid {HttpHeaders.XmsClientTenantId} header");
                }

                tenantId = parsedTenantId;
            }

            var subjectAndAppToken = SubjectAndAppToken.Parse(authValues.Single());
            
            var authorizationContext = await Authenticate(
                tenantId,
                subjectAndAppToken,
                SubjectAndAppAuthAllowedScopes,
                requireSubjectToken,
                requireTenantIdHeader);

            return authorizationContext;
        }

        /// <inheritdoc/>
        public async Task<AuthorizationContext> AuthenticateDataPlaneCall(HttpContext httpContext, IList<string> allowedScopes)
        {
            if (!httpContext.Request.Headers.TryGetValue(HttpHeaders.Authorization, out var authValues) ||
                authValues.Count != 1 ||
                !authValues.Single().StartsWith(AuthorizationSchemes.Bearer))
            {
                throw new AuthenticationException($"Missing or invalid {HttpHeaders.Authorization} header");
            }

            var token = authValues.Single().Substring(startIndex: AuthorizationSchemes.Bearer.Length);

            var authorizationContext = await Authenticate(token, allowedScopes);

            return authorizationContext;
        }

        /// <inheritdoc/>
        public async Task<string> GetAccessTokenOnBehalfOf(AuthorizationContext authorizationContext, IList<string> scopes)
        {
            _logger.LogInformation("Exchanging tokens for scopes:" + string.Join(", ", scopes));

            var userAssertion = new UserAssertion(authorizationContext.OriginalSubjectToken);

            var result = await _confidentialClientApplication
                .AcquireTokenOnBehalfOf(scopes, userAssertion)
                .ExecuteAsync();

            _logger.LogInformation("Succeeded Exchanging tokens for scopes:" + string.Join(", ", scopes));

            return result.AccessToken;
        }

        /// <inheritdoc/>
        public async Task<string> BuildCompositeToken(AuthorizationContext authorizationContext, IList<string> scopes)
        {
            // The token retrieved from the call is for the application,
            // in order to make calls to Fabric APIs, it needs to be converted to an on-behalf-of (OBO) token for Fabric.
            var tokenOBO = await GetAccessTokenOnBehalfOf(authorizationContext, scopes);

            var servicePrincipalToken = await GetFabricS2SToken();

            return SubjectAndAppToken.GenerateAuthorizationHeaderValue(tokenOBO, servicePrincipalToken);
        }

        /// <summary>
        /// Adds WWWAuthenticate header to the response.
        /// https://learn.microsoft.com/en-us/entra/msal/dotnet/acquiring-tokens/web-apps-apis/on-behalf-of-flow#handling-multi-factor-auth-mfa-conditional-access-and-incremental-consent
        /// </summary>
        /// <param name="ex">The MsalUiRequiredException exception recieved from AAD</param>
        /// <param name="response">The response for the request</param>
        /// <returns>403 status code</returns>
        public static void AddBearerClaimToResponse(MsalUiRequiredException ex, HttpResponse response)
        {
            var message = $"Bearer claims={ex.Claims}, error={ex.Message}";

            // Remove new lines so we can add the string to WWWAuthenticate header
            message = message.Replace(System.Environment.NewLine, " ");
            response.Headers[HeaderNames.WWWAuthenticate] = message;
        }

        private async Task<AuthorizationContext> Authenticate(
            Guid? subjectTenantId,
            SubjectAndAppToken subjectAndAppToken,
            IList<string> allowedScopes,
            bool requireSubjectToken = true,
            bool requireTenantIdHeader = true)
        {
            if (requireTenantIdHeader && !subjectTenantId.HasValue)
            {
                _logger.LogError("subjectTenantId header is missing");
                throw new AuthenticationException("subjectTenantId header is missing");
            }

            var openIdConnectConfiguration = await GetOpenIdConnectConfiguration();

            var appClaims = ValidateAadTokenCommon(subjectAndAppToken.AppToken, openIdConnectConfiguration, isAppOnly: true);
            var appTokenAppId = ValidateClaimOneOfValues(appClaims, "appid", new List<string> { EnvironmentConstants.FabricBackendAppId, EnvironmentConstants.FabricClientForWorkloadsAppId }, "app-only token must belong to Fabric BE or Fabric client for workloads");
            ValidateClaimValue(appClaims, "tid", _publisherTenantId, "app token must be in the publisher's tenant");

            if (string.IsNullOrEmpty(subjectAndAppToken.SubjectToken))
            {
                if (requireSubjectToken)
                {
                    _logger.LogError("subject token is missing");
                    throw new AuthenticationException("SubjectAndAppToken is missing subject token");
                }

                if (requireTenantIdHeader)
                {
                    return new AuthorizationContext { TenantObjectId = subjectTenantId.Value };
                }
                else
                {
                    return new AuthorizationContext { };
                }
            }

            var subjectClaims = ValidateAadTokenCommon(subjectAndAppToken.SubjectToken, openIdConnectConfiguration, isAppOnly: false);
            ValidateClaimValue(subjectClaims, "appid", appTokenAppId, "subject and app tokens should belong to same application");
            ValidateClaimValue(subjectClaims, "tid", subjectTenantId.Value.ToString(), "subject tokens must belong to the subject's tenant");

            ValidateAnyScope(subjectClaims, allowedScopes);

            return new AuthorizationContext
            {
                OriginalSubjectToken = subjectAndAppToken.SubjectToken,
                TenantObjectId = subjectTenantId.Value,
                Claims = subjectClaims.ToList()
            };
        }

        public async Task<AuthorizationContext> Authenticate(string subjectToken, IList<string> allowedScopes)
        {
            var openIdConnectConfiguration = await GetOpenIdConnectConfiguration();

            var claims = ValidateAadTokenCommon(subjectToken, openIdConnectConfiguration, isAppOnly: false);
            var subjectTenantId = ValidateClaimExists(claims, "tid", "access tokens should have this claim");

            ValidateAnyScope(claims, allowedScopes);

            return new AuthorizationContext
            {
                OriginalSubjectToken = subjectToken,
                TenantObjectId = new Guid(subjectTenantId),
                Claims = claims.ToList()
            };
        }

        private async Task<OpenIdConnectConfiguration> GetOpenIdConnectConfiguration()
        {
            var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
            var configuration = await _openIdConnectConfigurationManager.GetConfigurationAsync(cts.Token);
            return configuration;
        }

        private async Task<string> GetFabricS2SToken()
        {
            // "/.default" is used to build the scope for requesting permissions from the Microsoft Identity Platform.
            // It requests the default set of permissions associated with the registered application.
            string[] scopes = new string[] { EnvironmentConstants.FabricBackendResourceId + "/.default" };

            try
            {
                AuthenticationResult authenticationResult = await _confidentialClientApplication
                    .AcquireTokenForClient(scopes)
                    .WithTenantId(_publisherTenantId)
                    .ExecuteAsync();

                // AcquireTokenForClient never returns null
                return authenticationResult.AccessToken;
            }
            catch (MsalException msalEx)
            {
                // Handle MSAL exceptions
                _logger.LogError($"MSAL exception: {msalEx.Message}", msalEx);
                throw new Exception($"MSAL exception: {msalEx.Message}", msalEx);
            }
            catch (Exception ex)
            {
                // Handle other exceptions
                _logger.LogError($"An error occurred: {ex.Message}", ex);
                throw new Exception($"An error occurred: {ex.Message}", ex);
            }
        }

        private IEnumerable<Claim> ValidateAadTokenCommon(string token, OpenIdConnectConfiguration openIdConnectConfiguration, bool isAppOnly)
        {
            var tokenHandler = new JwtSecurityTokenHandler();

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,                                                         // We implement custom issuer validation to allow tokens for any tenant
                IssuerValidator = CreateIssuerValidator(openIdConnectConfiguration.Issuer),

                IssuerSigningKeys = openIdConnectConfiguration.SigningKeys,

                ValidateAudience = true,
                ValidAudience = _audience,

                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(1),                                            // Set this to the appropriate value for your application.
            };

            JwtSecurityToken jwtSecurityToken;
            try
            {
                tokenHandler.ValidateToken(token, validationParameters, out var parsedToken);
                jwtSecurityToken = (JwtSecurityToken)parsedToken;
            }
            catch (Exception e)
            {
                _logger.LogError("Token validation failed: {0}", e);
                throw new AuthenticationException(e.Message, e);
            }

            ValidateClaimValue(jwtSecurityToken.Claims, "ver", "1.0", "only v1 tokens are expected");
            ValidateClaimExists(jwtSecurityToken.Claims, "appid", "access tokens should have this claim");

            ValidateAppOnly(jwtSecurityToken.Claims, isAppOnly);

            return jwtSecurityToken.Claims;
        }

        private void ValidateAppOnly(IEnumerable<Claim> claims, bool isAppOnly)
        {
            if (isAppOnly)
            {
                ValidateClaimValue(claims, "idtyp", "app", "expecting an app-only token");
                ValidateNoClaim(claims, "scp", "app-only tokens should not have this claim");
            }
            else
            {
                ValidateNoClaim(claims, "idtyp", "delegated tokens should not have this claim");
                ValidateClaimExists(claims, "scp", "delegated tokens should have this claims");
            }
        }

        private string ValidateClaimValue(IEnumerable<Claim> claims, string claimType, string expectedValue, string reason)
        {
            var actualValue = claims.GetClaimValueOrDefault(claimType);
            if (actualValue != expectedValue)
            {
                _logger.LogError(
                    "Missing or unexpected claim value: claimType='{0}', expectedValue='{1}', reason='{2}', actualValue='{3}'",
                    claimType,
                    expectedValue,
                    reason,
                    actualValue);

                throw new AuthenticationException("Unexpected token format");
            }

            return actualValue;
        }

        private string ValidateClaimOneOfValues(IEnumerable<Claim> claims, string claimType, IList<string> expectedValues, string reason)
        {
            var actualValue = claims.GetClaimValueOrDefault(claimType);
            if (!expectedValues.Contains(actualValue))
            {
                _logger.LogError(
                    "Missing or unexpected claim value: claimType='{0}', reason='{1}'",
                    claimType,
                    reason);

                throw new AuthenticationException("Unexpected token format");
            }

            return actualValue;
        }

        private string ValidateClaimExists(IEnumerable<Claim> claims, string claimType, string reason)
        {
            var actualValue = claims.GetClaimValueOrDefault(claimType);
            if (actualValue == null)
            {
                _logger.LogError("Expected claim is missing: claimType='{0}', reason='{1}'", claimType, reason);
                throw new AuthenticationException("Unexpected token format");
            }

            return actualValue;
        }

        private void ValidateNoClaim(IEnumerable<Claim> claims, string claimType, string reason)
        {
            var actualValue = claims.GetClaimValueOrDefault(claimType);
            if (actualValue != null)
            {
                _logger.LogError("Unexpected claim exists: claimType='{0}', reason='{1}', actualValue={2}", claimType, reason, actualValue);
                throw new AuthenticationException("Unexpected token format");
            }
        }

        private void ValidateAnyScope(IEnumerable<Claim> claims, IList<string> allowedScopes)
        {
            var scopes = claims.GetClaimValueOrDefault("scp", defaultValue: string.Empty).Split(" ");

            if (!scopes.Any(s => allowedScopes.Contains(s)))
            {
                _logger.LogError("Missing or invalid 'scp' claim");
                throw new AuthenticationException("Invalid scopes");
            }
        }

        private IssuerValidator CreateIssuerValidator(string issuerConfiguration)
        {
            return (string issuer, SecurityToken securityToken, TokenValidationParameters validationParameters) =>
            {
                var jwtSecurityToken = (JwtSecurityToken)securityToken;

                var tenantId = jwtSecurityToken.Claims.GetClaimValue("tid");
                var expectedIssuer = issuerConfiguration.Replace("{tenantid}", tenantId);

                if (issuer != expectedIssuer)
                {
                    _logger.LogError("Unexpected token issuer: expected='{0}', actual='{1}'", expectedIssuer, issuer);
                    throw new AuthenticationException("Unexpected token format");
                }

                return issuer;
            };
        }
    }
}
