// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Microsoft.AspNetCore.Http;
using Fabric_Extension_BE_Boilerplate.Constants;
using Fabric_Extension_BE_Boilerplate.Contracts.FabricAPI.Workload;
using System.Linq;

namespace Fabric_Extension_BE_Boilerplate.Exceptions
{
    public class AuthenticationUIRequiredException : WorkloadExceptionBase
    {
        public static string AdditionalScopesToConsentName = "additionalScopesToConsent";
        public static string ClaimsForCondtionalAccessPolicyName = "claimsForCondtionalAccessPolicy";
        public AuthenticationUIRequiredException(string msalOriginalErrorMessage)
            : base(
                  httpStatusCode: StatusCodes.Status401Unauthorized,
                  errorCode: ErrorCodes.Authentication.AuthUIRequired,
                  messageTemplate: msalOriginalErrorMessage,
                  messageParameters: null,
                  errorSource: ErrorSource.System,
                  isPermanent: false)
        {
        }

        public string ClaimsForConditionalAccessPolicy => Details?.FirstOrDefault()?.AdditionalParameters?.Where(ap => ap.Name == ClaimsForCondtionalAccessPolicyName).FirstOrDefault()?.Value;
    }
}