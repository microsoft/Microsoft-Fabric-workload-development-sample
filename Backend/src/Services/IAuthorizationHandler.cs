// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Contracts;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Boilerplate.Services
{
    /// <summary>
    /// Provides methods for authorization and permission validation.
    /// </summary>
    public interface IAuthorizationHandler
    {
        /// <summary>
        /// Validates the permissions for a given token on a specific workspace and item.
        /// </summary>
        /// <param name="authorizationContext">The authorization context.</param>
        /// <param name="workspaceObjectId">The ID of the workspace being accessed.</param>
        /// <param name="itemObjectId">The ID of the item being accessed.</param>
        /// <param name="requiredPermissions">A list of required permissions</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        /// <exception cref=""
        Task ValidatePermissions(AuthorizationContext authorizationContext, Guid workspaceObjectId, Guid itemObjectId, IList<string> requiredPermissions);
    }
}
