// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Microsoft.AspNetCore.Http;
using Fabric_Extension_BE_Boilerplate.Constants;
using Fabric_Extension_BE_Boilerplate.Contracts.FabricAPI.Workload;
using System.Linq;

namespace Fabric_Extension_BE_Boilerplate.Exceptions
{
    public class AuthenticationException : WorkloadExceptionBase
    {
        public AuthenticationException(string msalOriginalErrorMessage)
            : base(
                  httpStatusCode: StatusCodes.Status401Unauthorized,
                  errorCode: ErrorCodes.Authentication.AuthError,
                  messageTemplate: msalOriginalErrorMessage,
                  messageParameters: null,
                  errorSource: ErrorSource.External,
                  isPermanent: false)
        {
        }
    }
}
