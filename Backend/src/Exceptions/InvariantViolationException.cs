// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Fabric_Extension_BE_Boilerplate.Exceptions;

namespace Boilerplate.Exceptions
{
    public class InvariantViolationException : InternalErrorException
    {
        public InvariantViolationException(string message)
            : base(message)
        {
        }

        public override string ToTelemetryString()
        {
            return $"INVARIANT VIOLATION: {InternalMessage}";
        }
    }
}
