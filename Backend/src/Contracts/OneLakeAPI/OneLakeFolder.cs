// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Contracts;
using Newtonsoft.Json;

namespace Fabric_Extension_BE_Boilerplate.Contracts.OneLakeAPI
{
    public partial class GetFoldersResult
    {
        [JsonProperty("paths")]
        public OneLakeFolder[] Paths { get; init; }
    }

    public partial class OneLakeFolder
    {
        [JsonProperty("name")]
        public string Name { get; init; }

        [JsonProperty("isDirectory")]
        public bool IsDirectory { get; init; }
    }
}
