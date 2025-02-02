// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System;
using Fabric_Extension_BE_Boilerplate.Contracts.FabricAPI.Workload;

namespace Boilerplate.Contracts {
    public class ItemJobMetadata {
        public string JobType { get; set; }
        public Guid JobInstanceId { get; set; }
        public JobInstanceStatus Status { get; set; }
        public object ErrorDetails { get; set; }
        public DateTime? CanceledTime { get; set; }
    }
}