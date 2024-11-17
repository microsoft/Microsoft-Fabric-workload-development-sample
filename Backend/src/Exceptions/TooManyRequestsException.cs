// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Fabric_Extension_BE_Boilerplate.Constants;
using Fabric_Extension_BE_Boilerplate.Contracts.FabricAPI.Workload;
using Fabric_Extension_BE_Boilerplate.Exceptions;
using Microsoft.AspNetCore.Http;

namespace Boilerplate.Exceptions
{
    public class TooManyRequestsException : WorkloadExceptionBase
    {
        public TooManyRequestsException(string message = "Too many requests")
        : base(
              httpStatusCode: StatusCodes.Status429TooManyRequests,
              errorCode: ErrorCodes.RateLimiting.TooManyRequests,
              messageTemplate: message,
              messageParameters: null,
              errorSource: ErrorSource.User,
              isPermanent: false)
        {
        }
    }
}