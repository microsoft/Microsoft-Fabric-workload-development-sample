// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System.Collections.Generic;

namespace Boilerplate.Contracts
{
    internal class OneLakePathData
    {
        public string name = string.Empty;
    }

    internal class OneLakePathContainer
    {
        public IEnumerable<OneLakePathData> paths = new List<OneLakePathData>(); 
    }
}