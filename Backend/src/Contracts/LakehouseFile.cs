// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

namespace Boilerplate.Contracts
{
    public class LakehouseFile
    {
        public string Name { get; init; }

        public string Path { get; init; }

        public bool IsDirectory { get; init; }

    }
}