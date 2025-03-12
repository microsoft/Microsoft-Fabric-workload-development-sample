// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

namespace Fabric_Extension_BE_Boilerplate.Constants
{
    public static class ErrorCodes
    {
        public const string InternalError = "InternalError";

        public static class Authentication
        {
            public const string AuthUIRequired = "AuthUIRequired";
            public const string AuthError = "AuthError";
        }

        public static class Security
        {
            public const string AccessDenied = "AccessDenied";
        }

        public static class ItemPayload
        {
            public const string InvalidItemPayload = "InvalidItemPayload";
            public const string MissingLakehouseReference = "MissingLakehouseReference";
        }

        public static class RateLimiting
        {
            public const string TooManyRequests = "TooManyRequests";
        }

        public static class Item
        {
            public const string ItemMetadataNotFound = "ItemMetadataNotFound";
            public const string DoubledOperandsOverflow = "DoubledOperandsOverflow";
        }

        public static class Kusto
        {
            public const string KustoDataException = "KustoDataException";
        }
    }
}
