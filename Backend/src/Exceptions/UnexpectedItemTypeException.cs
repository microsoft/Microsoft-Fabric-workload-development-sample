// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Fabric_Extension_BE_Boilerplate.Exceptions;

namespace Boilerplate.Exceptions
{
    public class UnexpectedItemTypeException : InternalErrorException
    {
        public UnexpectedItemTypeException(string message)
            : base(message)
        {
        }
    }
}
