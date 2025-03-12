// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using static Fabric_Extension_BE_Boilerplate.Constants.WorkloadConstants;

namespace Boilerplate.Contracts
{
    /// <summary>
    /// Enum representing different types of jobs that the artifact supports, as defined in the workload.xml JobScheduler section.
    /// </summary>
    public static class Item1JobType
    {
        public static readonly string ScheduledJob = ItemTypes.Item1 + ".ScheduledJob";
        public static readonly string CalculateAsText = ItemTypes.Item1 + ".CalculateAsText";
        public static readonly string CalculateAsParquet = ItemTypes.Item1 + ".CalculateAsParquet";
        public static readonly string LongRunningCalculateAsText = ItemTypes.Item1 + ".LongRunningCalculateAsText";
        public static readonly string InstantJob = ItemTypes.Item1 + ".InstantJob";
    }
}
