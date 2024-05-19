// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System.Collections.Generic;

namespace Boilerplate.Contracts
{
    /// <summary>
    /// Represents a response containing a list of resolved permissions.
    /// </summary>
    public class ResolvePermissionsResponse
    {
        /// <summary>
        /// Gets or sets the list of resolved permissions.
        /// </summary>
        public List<string> Permissions { get; set; }
    }
}
