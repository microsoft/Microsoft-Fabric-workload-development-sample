// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Fabric_Extension_BE_Boilerplate.Constants;
using Fabric_Extension_BE_Boilerplate.Contracts.FabricAPI.Workload;
using Microsoft.AspNetCore.Http;

namespace Fabric_Extension_BE_Boilerplate.Exceptions
{
    public class InternalErrorException : WorkloadExceptionBase
    {
        public InternalErrorException(string message)
            : base(
                httpStatusCode: StatusCodes.Status500InternalServerError,
                errorCode: ErrorCodes.InternalError,
                messageTemplate: "Internal error",
                messageParameters: null,
                errorSource: ErrorSource.System,
                isPermanent: false)
        {
            InternalMessage = message;
        }

        public string InternalMessage { get; }

        public override string ToTelemetryString()
        {
            return InternalMessage;
        }
    }
}
