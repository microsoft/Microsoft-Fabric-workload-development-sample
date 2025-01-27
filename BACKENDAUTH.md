# Backend authentication and authorization overview

Fabric developer workload sample has the following authentication flows on the backend side

## Authentication and authorization of requests from Fabric to the workload

### Authorization header structure
The authorization header uses a specific token format:

SubjectAndAppToken1.0 subjectToken="delegated token", appToken="S2S token"

This format includes two distinct tokens:

1. `subjectToken`: This is a delegated token representing the user on whose behalf the operation is being performed.
2. `appToken`: This is a token specific to the Fabric application.

The rationale behind using a dual-token header is threefold:

- **Validation**: The workload can verify that the request originated from Fabric by validating the `appToken`.
- **User Context**: The `subjectToken` provides a user context for the action being performed.
- **Inter-Service Communication**: The workload can acquire an On-Behalf-Of (OBO) token using the `subjectToken`, allowing it to call other services with a user token.

### Authentication
The main authentication checks performed for the SubjectAndAppToken are:

1. **'Validation and parsing of the Authorization header value**: This is done in the [AuthenticateControlPlaneCall](Backend/src/Services/AuthenticationService.cs#L53) method. The token must start with the "SubjectAndAppToken1.0" prefix and include two tokens - `subjectToken` and `appToken`.
2. **AAD Token Properties Validation**: Both `subjectToken` and `appToken` are validated for common AAD token properties in the [ValidateAadTokenCommon](Backend/src/Services/AuthenticationService.cs#L230) method. These properties include token signature, token lifetime, token audience (workload app audience), and token version (1.0) and issuer.

3. **AppToken Properties Validation**: The `appToken` should not have an `scp` claim but should have an `idtyp` claim with 'app' as value. We also check that `tid` claim in the workload publisher tenant id.

    Sample appToken claims:
    ```json
    {
    "aud": "api://localdevinstance/12345678-77f3-4fcc-bdaa-487b920cb7ee/Fabric.WorkloadSample/123",
    "iss": "https://sts.windows.net/12345678-77f3-4fcc-bdaa-487b920cb7ee/",
    "iat": 1700047232,
    "nbf": 1700047232,
    "exp": 1700133932,
    "aio": "E2VgYLjBuv2l+c6cmm/iP/bnL2v+AQA=",
    "appid": "00000009-0000-0000-c000-000000000000", // or "d2450708-699c-41e3-8077-b0c8341509aa"
    "appidacr": "2",
    "idp": "https://sts.windows.net/12345678-77f3-4fcc-bdaa-487b920cb7ee/",
    "idtyp": "app",
    "oid": "87654321-727a-403d-b7d4-8e4a48865158",
    "rh": "0.ACgAGX-u-vN3zE-9qkh7kgy37hQbaU7-v2xFr59O_foS7VLZAAA.",
    "sub": "87654321-727a-403d-b7d4-8e4a48865158",
    "tid": "12345678-77f3-4fcc-bdaa-487b920cb7ee",
    "uti": "5bgMXs3uMUSAHCruRjACAA",
    "ver": "1.0"
    }
    ```

4. **SubjectToken Properties Validation**: Ensure that the subjectToken includes an `scp` claim with the `FabricWorkloadControl` scope, that there should be no `idtyp` claim present in the token and it has same `appid` as in the `appToken`.

    Sample subjectToken claims:
    ```json
    {
    "aud": "api://localdevinstance/12345678-77f3-4fcc-bdaa-487b920cb7ee/Fabric.WorkloadSample/123",
    "iss": "https://sts.windows.net/12345678-77f3-4fcc-bdaa-487b920cb7ee/",
    "iat": 1700050446,
    "nbf": 1700050446,
    "exp": 1700054558,
    "acr": "1",
    "aio": "ATQAy/8VAAAAUgWRMRnBo4VGHvrKRykUXOXBNKS1cHnBxLrYkZJJGSjAVyJGBecbLdSud1GUakER",
    "amr": [
        "pwd"
    ],
    "appid": "00000009-0000-0000-c000-000000000000", // or "d2450708-699c-41e3-8077-b0c8341509aa"
    "appidacr": "2",
    "ipaddr": "46.117.19.50",
    "name": "john doe",
    "oid": "abacabac-f91e-41db-b997-699f17146275",
    "rh": "0.ASgAGX-u-vN3zE-9qkh7kgy37hQbaU7-v2xFr59O_foS7VLZANQ.",
    "scp": "FabricWorkloadControl",
    "sub": "X0Wl85UA-uOmdkQz5MoT-hEgYZXDq9FYdS8g2bFUaZA",
    "tid": "12345678-77f3-4fcc-bdaa-487b920cb7ee",
    "unique_name": "user1@constso.com",
    "upn": "user1@constso.com",
    "uti": "_llZwmJoSUiHv-kw6tfDAA",
    "ver": "1.0"
    }
    ```

See [IAuthenticationService](Backend/src/Services/IAuthenticationService.cs).

Please note that all the validations in our sample code are for version 1.0 tokens.

### Authorization
Once it's confirmed that the request originates from the Fabric service (via the `appToken`), it's understood that Fabric has already verified that the user has the necessary permissions to perform the action, based on Fabric's permissions metadata.

## Authentication and authorization of requests from workload to Fabric

### Workload control requests
Workload control APIs are special Fabric APIs that intend to support workloads with their Fabric items lifecycle management.
These APIs use same SubjectAndAppToken1.0 authorization header format.

SubjectAndAppToken1.0 subjectToken="delegated token", appToken="S2S token"

When coming from the workload the included tokens are:

1. `subjectToken`: User delegated token (obtained through the OBO flow) representing the user on whose behalf the operation is being performed. Fabric will verify that the user has the required permissions to perform the needed action.
2. `appToken`: This is a token specific to the workload application. Fabric will check that this is token is from the AAD App of the workload that the relevant Fabric item belongs to and that is on the workload publisher tenant.

See `ValidatePrmissions` method in [AuthorizationHandler](Backend/src/Services/AuthorizationHandler.cs).

### Public APIs
For calling public Fabric APIs the workload should acquire a standard AAD OBO token with the relevant API scopes and pass it as a Bearer token in the request's authorization header.

See [FabricExtensionController](Backend/src/Controllers/FabricExtensionController.cs).

## Authentication and Authorization of Requests from Workload FE to Workload BE

### Authorization Header
The authorization header in a request sent from the workload Front-End (FE) to the workload Back-End (BE) uses a standard Bearer token.

### Authentication
The [AuthenticateControlPlaneCall](Backend/src/Services/AuthenticationService.cs#L53) method in the workload BE is responsible for validating the token. The primary checks performed are:

1. **Token Lifetime**: Ensures the token is within its valid usage period.
2. **Signature**: Verifies the authenticity of the token.
3. **Audience**: Checks that the token's audience matches the workload Azure Active Directory (AAD) App.
4. **Issuer**: Validates the issuer of the token.
5. **Allowed Scopes**: Validates the scopes that the token is permitted to access.


### Authorization
Authorization is achieved by invoking the [ValidatePermissions](Backend/src/Services/AuthorizationHandler.cs#L37) method. This method calls the `resolvePermissions` API in Fabric workload-control endpoint for the relevant Fabric item and verifies that the user possesses the necessary permissions for the operation.