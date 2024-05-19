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
    public class InvalidItemPayloadException : WorkloadExceptionBase
    {
        public InvalidItemPayloadException(string itemType, Guid id)
            : base(
                  httpStatusCode: StatusCodes.Status400BadRequest,
                  errorCode: ErrorCodes.ItemPayload.InvalidItemPayload,
                  messageTemplate: "{0} payload is invalid for id={1}. See MoreDetails for additional information.",
                  messageParameters: new[] { itemType, id.ToString() },
                  errorSource: ErrorSource.User,
                  isPermanent: true)
        {
        }
    }
}
