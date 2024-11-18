// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System.Collections.Generic;

namespace Boilerplate.Contracts
{
    internal class OneLakePathData
    {
        public string Name { get; init; }
    }

    internal class OneLakePathContainer
    {
        public IEnumerable<OneLakePathData> Paths { get; init; }
    }
}
