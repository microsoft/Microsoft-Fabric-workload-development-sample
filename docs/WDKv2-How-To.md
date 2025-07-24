
# How-To use new functionality

## Frontend API access

The code containing the Frontend Authentication can be found in your repo under [ApiAuthenticationFrontend.tsx](./../Workload/app/components/ClientSDKPlayground/ApiAuthenticationFrontend.tsx).

There are two important methods in there that will showcase the new functionality: 
1)	 callAuthAcquireFrontendAccessToken  - which provides you with the ability to get a Entra Token for your FE application
 
  ![Call Frontend API Example](./media/Demo-FrontendAPI-1.jpg)

2)	sendWorkloadServerRequest  - which demos how to use the token to access an Entra secured API.
 
![Call Frontend API Example](./media/Demo-FrontendAPI-2.jpg)

## Storing Item Definition in Fabric

You can find the code for storing item definition in the `saveItemDefinition` method within the [SampleWorkloadEditor.tsx](./../Workload/app/items/HelloWorldItem/HelloWorldItemEditor.tsx) file. Here is the method content for reference:

```typescript
  async function SaveItem(definition?: HelloWorldItemDefinition) {
    var successResult = await saveItemDefinition<HelloWorldItemDefinition>(
      workloadClient,
      editorItem.id,
      definition || editorItem.definition);
    setIsUnsaved(!successResult);
  }
```

This method demonstrates how to persist the definition of an item using the SDK.

## Standard Item creation experience


The configuration for the standard item creation experience can be found in the [Product.json](../config/Manifest/Product.json) file, specifically within the `create` section under `createItemDialogConfig`. it allows to define event handlers for failure and success. Here is a snippet for reference:

```json
{
    "name": "Product",
    "version": "1.100",
    "displayName": "Workload_Display_Name",
    "createExperience": {
        "description": "Workload_Description",
        "cards": [
            {
              "title": "CreateHub_Card_2_Title",
              "description": "CreateHub_Card_2_Description",
              "icon": {
                "name": "assets/images/HelloWorldItem-icon.png"
              },
              "icon_small": {
                "name": "assets/images/HelloWorldItem-icon.png"
              },
              "availableIn": [
                "home",
                "create-hub",
                "workspace-plus-new",
                "workspace-plus-new-teams"
              ],
              "itemType": "SampleItem",
              "createItemDialogConfig": {
                "onCreationFailure": { "action": "item.onCreationFailure" },
                "onCreationSuccess": { "action": "item.onCreationSuccess" }
              }
            }
        ]
    }    
}
```

This configuration defines the dialog used for creating new items, including the fields, labels, and button text.


## IFrame Relaxation

### Prerequisite
Sandbox relaxation currently works only when `AADFEApp` is defined in the manifest.

### How It Works

When you enable sandbox relaxation in your manifest, the following happens:

1. **AAD Consent Scopes**: Your workload will request two scopes:
   - **Basic Fabric scope** - The standard scope required for any workload to function
   - **Fabric relaxation scope** - Additional scope specifically for sandbox relaxation capabilities

2. **User Consent Flow**: When a user first accesses your extension with sandbox relaxation enabled, they will be prompted to consent to both scopes. If they deny, the iframe will not load.

3. **Additional IFrame Capabilities**: Once consent is granted, your iframes receive these additional sandbox attributes:
   - `allow-downloads` - Enables file downloads from your extension
   - `allow-forms` - Enables form submissions to external services
   - `allow-popups` - Enables opening new windows or tabs

   Default sandbox (without relaxation): `allow-same-origin allow-scripts`
   
   Relaxed sandbox (with consent): `allow-same-origin allow-scripts allow-downloads allow-forms allow-popups`

### Best Practices
Only request sandbox relaxation if absolutely necessary, since each relaxed permission introduces potential security risks.

### Enable in Manifest
Add the `enableSandboxRelaxation` setting to your workload manifest:

```xml
    <RemoteServiceConfiguration>
      <CloudServiceConfiguration>
        <Cloud>Public</Cloud>
        <AADFEApp>
          <AppId>e5d2793e-bc5e-4140-b3c5-7dbea0d723d8</AppId>
        </AADFEApp>
        <EnableSandboxRelaxation>true</EnableSandboxRelaxation>  
```
**Important**: The line **`<EnableSandboxRelaxation>true</EnableSandboxRelaxation>`** must be included to enable this feature.
### Development Mode
For local development, you can use sandbox relaxation and bypass consent using the dev override. [Add to devParameters](../Workload/devServer/webpack.config.js)


```typescript
const devParameters = {
  name: process.env.WORKLOAD_NAME,
  url: "http://127.0.0.1:60006",
  devAADFEAppConfig: {
    appId: process.env.DEV_AAD_CONFIG_FE_APPID,
  },
  devSandboxRelaxation: true
};
```
**Note**: The line **`devSandboxRelaxation: true`** enables sandbox relaxation in development mode without requiring user consent.
## Public API Support

An example of how to acquire a Token with the right scope and make a call to the API can be found in the [ApiAuthenticationFrontend.tsx](../Workload/app/components/ClientSDKPlayground/ApiAuthenticationFrontend.tsx) file. The method `callAuthAcquireFrontendAccess` implements how to get a token with a specific scope where the `sendWorkloadServerRequest`shows a generic method to parse the token for Fabric API calls.

```typescript

function callAuthAcquireFrontendAccess(workloadClient, scopes) {
    callAuthAcquireFrontendAccessToken(workloadClient, scopes)
      .then(result => setToken(result.token))
      .catch((errorResult) => {
          setToken(null);
          console.error("Error acquiring token:", errorResult);
          switch (errorResult.error) {
              case WorkloadAuthError.WorkloadConfigError:
                  setAcquireTokenError("Workload config error - make sure that you have added the right configuration for your AAD app!");
                  break;
              case WorkloadAuthError.UserInteractionFailedError:
                  setAcquireTokenError("User interaction failed!");
                  break;
              case WorkloadAuthError.UnsupportedError:
                  setAcquireTokenError("Authentication is not supported in this environment!");
                  break;
              default:
                  setAcquireTokenError("Failed to fetch token");
          }
      }
}

function sendWorkloadServerRequest(url: string, token: string, httpMethod: string, requestBody?: string): Promise<string> {
    if (url.length == 0) {
        return Promise.resolve('Please provide a valid url');
    }
    if (httpMethod == 'PUT') {
        return fetch(url, { method: httpMethod, body: requestBody, headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token } }).then(response => response.text());
    }
    return fetch(url, { method: httpMethod, headers: { 'Authorization': 'Bearer ' + token } }).then(response => response.text());
}
```

## CI/CD Support

**Still in Development**
