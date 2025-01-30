// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using Fabric_Extension_BE_Boilerplate.Constants;
using Fabric_Extension_BE_Boilerplate.Contracts.FabricAPI.Workload;

namespace Fabric_Extension_BE_Boilerplate.Exceptions
{
    public class DoubledOperandsOverflowException : WorkloadExceptionBase
    {
        public DoubledOperandsOverflowException(IList<string> messageParameters)
            : base(
                  httpStatusCode: StatusCodes.Status400BadRequest,
                  errorCode: ErrorCodes.Item.DoubledOperandsOverflow,
                  messageTemplate: "{0} may lead to overflow",
                  messageParameters: messageParameters,
                  errorSource: ErrorSource.User,
                  isPermanent: false)
        {
        }
    }
}
