// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

/** Add here error interfaces that are defined in the workload backend and used to propagate exceptions in control plane APIs */

// Error code for errors propagated from the workload backend
export const FabricExternalWorkloadError = "FabricExternalWorkloadError";

// Returned from the workload when interactive authentication is required
export interface AuthenticationUIRequiredException {
    ClaimsForConditionalAccessPolicy: string;
    ScopesToConsent: string[];
    ErrorMessage: string;
}

export const AuthUIRequired = "AuthUIRequired";
export const ItemMetadataNotFound = "ItemMetadataNotFound";
