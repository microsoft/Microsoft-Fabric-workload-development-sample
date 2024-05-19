// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Fabric_Extension_BE_Boilerplate.Constants;
using Fabric_Extension_BE_Boilerplate.Contracts.FabricAPI.Workload;
using Fabric_Extension_BE_Boilerplate.Exceptions;
using Microsoft.AspNetCore.Http;

namespace Boilerplate.Exceptions
{
    public class UnauthorizedException : WorkloadExceptionBase
    {
        public UnauthorizedException()
            : base(
                  httpStatusCode: StatusCodes.Status403Forbidden,   // Due to security considerations for real-world applications returning '404 Not Found' or '401 Unauthorized' may be more appropriate 
                  errorCode: ErrorCodes.Security.AccessDenied,
                  messageTemplate: "Access denied",
                  messageParameters: null,
                  errorSource: ErrorSource.User,
                  isPermanent: true)
        {
        }
    }
}
