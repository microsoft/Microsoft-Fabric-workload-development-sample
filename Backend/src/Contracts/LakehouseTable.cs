// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

namespace Boilerplate.Contracts
{
    public class LakehouseTable
    {
        public string Name { get; init; }

        public string Path { get; init; }

        public string Schema { get; init; }
    }
}