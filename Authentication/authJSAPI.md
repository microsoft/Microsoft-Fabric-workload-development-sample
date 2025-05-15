# Authentication Javascript API
Fabric frontend offers a javascript API for Fabric workloads to acquire a token for their application in Microsoft Entra Id - before working with authentication JS API make sure you go over the [Setup](./Setup.md) documentation.

## API
`acquireAccessToken(params: AcquireAccessTokenParams): Promise<AccessToken>;`  
`export interface AcquireAccessTokenParams {`  
`    additionalScopesToConsent?: string[];`  
`    claimsForConditionalAccessPolicy?: string;`  
`    promptFullConsent?: boolean;`  
`}`

The API returns an AccessToken object which contains the token itself and an expiry date for the token.
To call the API in the Frontend sample - simply create a sample item and scroll down and click on "Navigate to Authentication page", from there you can click on "get access Token" and you will recieve a token back.
![image](https://github.com/microsoft/Microsoft-Fabric-developer-sample/assets/97835845/219cf870-56cd-4f94-bc8a-60961bd2df7b)

# Consents  
To understand why consents are required, please go over [User and admin consent in Microsoft Entra ID
](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/user-admin-consent-overview).  
**Please note that consents are required for CRUD/Jobs to work and to acquire tokens across tenants**.

## How do consents work in Fabric workloads?
To grant a consent for a specific application, Fabric FE creates an [MSAL](https://www.npmjs.com/package/@azure/msal-browser) instance configured with the workload's application Id and asks for a token for the provided scopes (additionalScopesToConsent - see AcquireAccessTokenParams).
When asking for a token with the workload application for a specific scope, Microsoft entra Id will display a popup consent in case it's missing, and then redirect the popup window to the **redirect URI** configured in the application.

 Typically the redirect URI is in the same domain as the page that requested the token so the page can access the popup and close it.  
In our case it's not in the same domain since Fabric is requesting the token and the redirect URI of the workload is not in the Fabric domain, so when the consent dialog opens it needs to be closed manually after redirect - we don't use the code returned in the redirectUri hence we just auto-close it (when Microsoft Entra Id redirects the popup to the redirect URI it simply closes).  
You can see the code/configuration of the redirect Uri in [index.ts](../Frontend//src//index.ts) file.

Here's an example of a consent popup for our app "my workload app" and its dependencies (storage and Power BI) that we configured when going over [Setup](./Setup.md):  
![image](https://github.com/microsoft/Microsoft-Fabric-developer-sample/assets/97835845/bbed9d85-fb26-4db0-8997-6ba7263aa7a8)

We will see how to work with consents when we talk about AcquireAccessTokenParams.

### Another way to grant consents in the Home tenant (Optional)
To get a consent in the home tenant of the application, you can ask your tenant admin to grant a consent for the whole tenant using this url (Insert your tenant Id and the client Id):  
https://login.microsoftonline.com/{tenantId}/adminconsent?client_id={clientId}


## AcquireAccessTokenParams
When calling acquireAccessToken JS API, we can provide 3 parameters:  

* additionalScopesToConsent: Additional scopes to ask for a consent for, for example re-consent scenarios.
* claimsForConditionalAccessPolicy: Claims returned from AAD when OBO flows fail, for example OBO requires Multi Factor Authentication.
* promptFullConsent: If true, the user will be presented with a full consent of the static dependencies of the workload's application as configured in Entra Id (and additionalScopesToConsent parameter will be ignored).

let's review these 3 parameters and see what to provide when calling acquireAccessToken.

## additionalScopesToConsent
Here's what to provide in additionalScopesToConsent when calling acquireAccessToken:
Scenario | 1. Acquiring a token to call the Workload BE  | 2. OBO flow for scope 'https://analysis.windows.net/powerbi/api/Workspace.Read.All/' fails with consent required error 
--- | --- | --- 
AdditionalScopesToConsent | null | ['https://analysis.windows.net/powerbi/api/Workspace.Read.All'] 

1. Acquiring a token to call the BE Workload: when you want to acquire a token to call your BE workload, simply call acquireAccessToken without providing any additionalScopesToConsent.
    * If the user is in the home tenant of the application, the workload will be able to acquire a token without granting any consent.
    * If the user is in another tenant, he will need to grant consent (or have the admin of the tenant grant consent to the app) before the workload can recieve a token.

2. OBO flow for a specific scope fails with consent required error:
   ![image](https://github.com/microsoft/Microsoft-Fabric-developer-sample/assets/97835845/b96ebb8c-0457-456d-9d07-b7a69dd56673)

If the OBO flow in the workload BE fails with consent required error for a specific scope/s, the workload backend must inform the frontend to call acquireAccessToken API with those scope/s.  

## claimsForConditionalAccessPolicy
This is used when facing OBO failures in the workload BE because of some conditional access policy has been configured on the tenant.
OBO failures because of conditional access policies return a string called "claims", this string should be sent to the workload FE where the FE should ask for a token and pass the claim as claimsForConditionalAccessPolicy.
see [Handling multi-factor auth (MFA), conditional access and incremental consent](https://learn.microsoft.com/en-us/entra/msal/dotnet/acquiring-tokens/web-apps-apis/on-behalf-of-flow#handling-multi-factor-auth-mfa-c).

Refer to [AuthenticationService](../Backend/src/Services/AuthenticationService.cs) AddBearerClaimToResponse usage in the BE sample to see examples of responses when OBO operations fail due to consent missing or conditional access policy.

## promptFullConsent
This is used when the workload wants to ask for a full consent (all of the static dependencies of the application configured in AAD) regardless if the user already provided a consent or not.
