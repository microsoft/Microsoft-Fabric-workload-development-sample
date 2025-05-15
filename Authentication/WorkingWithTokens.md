## How to work with tokens
1. Your frontend should ask for a token `extensionClient.auth.acquireAccessToken({});`, you can use this token to authenticate with your backend.
2. handle errors of consent (see example in Frontend/src/index.ts).
3. If you wish to access some resource, you should send your token to the BE and try to exchange it using OBO flow for that resource, you can also use the token received from control APIs (CRUD/Jobs) and try to exchange it for that resource.
4. If the exchange fails for consent reasons, you should notify your FE and call `extensionClient.auth.acquireAccessToken({additionalScopesToConsent:[resource]});` and try the process again.
5. If the exchange fails for MFA reasons, you should notify your FE along with the claim received when tying to exchange and call `extensionClient.auth.acquireAccessToken({claimsForConditionalAccessPolicy:claims});`
   
   See below example:  
   https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-on-behalf-of-flow#error-response-example

**Note**: The token you receive when acquiring a token in the frontend is not related to additionalScopesToConsent you pass, meaning once the user consents you can use any token you received from `extensionClient.auth.acquireAccessToken` for your OBO flow.
