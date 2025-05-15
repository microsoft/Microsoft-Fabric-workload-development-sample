// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System;

namespace Boilerplate.Contracts {
    public class ItemJobMetadata {
        public string JobType { get; set; }
        public Guid JobInstanceId { get; set; }
        public object ErrorDetails { get; set; }
        public DateTime? CanceledTime { get; set; }
        public bool UseOneLake { get; set; }
        public bool IsCanceled => CanceledTime != null;
    }
}