// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System;

namespace Boilerplate.Contracts
{
    public class CommonItemMetadata
    {
        public string Type { get; init; }

        public Guid TenantObjectId { get; init; }

        public Guid WorkspaceObjectId { get; init; }

        public Guid ItemObjectId { get; init; }

        public string DisplayName { get; set; }

        public string Description { get; set; }

        public DateTime LastUpdatedDateTimeUtc { get; set; }
    }
}
