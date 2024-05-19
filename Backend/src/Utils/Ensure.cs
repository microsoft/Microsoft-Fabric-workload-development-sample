// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Contracts;
using Boilerplate.Exceptions;
using System;
using System.Diagnostics.CodeAnalysis;

namespace Boilerplate.Utils
{
    public static class Ensure
    {
        public static T NotNull<T>(T o, string description) where T : class
        {
            if (o == null)
            {
                throw new InvariantViolationException($"Object reference must not be null: {description}");
            }

            return o;
        }

        public static void Condition(bool condition, string description)
        {
            if (!condition)
            {
                throw new InvariantViolationException($"Condition violation detected: {description}");
            }
        }

        public static void AreEqual<T>(T o1, string description1, T o2, string description2) where T : struct
        {
            if (!o1.Equals(o2))
            {
                throw new InvariantViolationException($"Values must be equal: '{description1}'={o1} != '{description2}'={o2}");
            }
        }

        public static void Tenant(AuthorizationContext authorizationContext, Guid itemTenantObjectId)
        {
            AreEqual(itemTenantObjectId, "item tenant", authorizationContext.TenantObjectId, "subject's tenant");
        }

        [DoesNotReturn]
        public static Exception UnexpectedSwitchValue<T>(T value, string description)
        {
            throw new InvariantViolationException($"Unexpected switch value {value}: {description}");
        }
    }
}
