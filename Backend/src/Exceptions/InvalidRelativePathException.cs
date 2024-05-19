// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Fabric_Extension_BE_Boilerplate.Exceptions;

namespace Boilerplate.Exceptions
{
    public class InvalidRelativePathException : InternalErrorException
    {
        public InvalidRelativePathException(string relativePath)
            : base($"The relative path is invalid: {relativePath}")
        {
        }
    }
}
