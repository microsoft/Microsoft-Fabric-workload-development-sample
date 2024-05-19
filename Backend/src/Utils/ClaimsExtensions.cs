// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

namespace Boilerplate.Utils
{
    public static class ClaimsExtensions
    {
        public static string GetClaimValueOrDefault(this IEnumerable<Claim> claims, string claimType, string defaultValue = null)
        {
            return claims?.FirstOrDefault(c => c.Type == claimType)?.Value ?? defaultValue;
        }

        public static string GetClaimValue(this IEnumerable<Claim> claims, string claimType)
        {
            Ensure.NotNull(claims, nameof(claims));
            return claims.First(c => c.Type == claimType).Value;
        }
    }
}
