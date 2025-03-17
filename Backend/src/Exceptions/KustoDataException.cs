// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Fabric_Extension_BE_Boilerplate.Constants;
using Fabric_Extension_BE_Boilerplate.Contracts.FabricAPI.Workload;
using Fabric_Extension_BE_Boilerplate.Exceptions;
using Microsoft.AspNetCore.Http;
using System;

namespace Boilerplate.Exceptions
{
    public class KustoDataException : WorkloadExceptionBase
    {
        public KustoDataException(string message)
            : base(
                  httpStatusCode: StatusCodes.Status400BadRequest,
                  errorCode: ErrorCodes.Kusto.KustoDataException,
                  messageTemplate: message,
                  messageParameters: null,
                  errorSource: ErrorSource.User,
                  isPermanent: true)
        {
        }
    }
}
