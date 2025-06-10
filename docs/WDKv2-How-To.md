
# How-To use new functionallity

## Frontend API access

The code containing the Frontend Authentication can be found in your repo under [ApiAuthenticationFrontend.tsx](./../Frontend/src/components/ClientSDKPlayground/ApiAuthenticationFrontend.tsx).

There are two important methods in there that will showcase the new functionality: 
1)	 callAuthAcquireFrontendAccessToken  - which provides you with the ability to get a Entra Token for your FE application
 
  ![Call Fronted API Example](./media/Demo-FrontendAPI-1.jpg)

2)	sendWorkloadServerRequest  - which demos how to use the token to access an Entra secured API.
 
![Call Fronted API Example](./media/Demo-FrontendAPI-2.jpg)

## Storing Item state in Fabric

You can find the code for storing item state in the `saveItemState` method within the [SampleWorkloadEditor.tsx](./../Frontend/src/components/SampleWorkloadEditor/SampleWorkloadEditor.tsx) file. Here is the method content for reference:

```typescript
async function SaveItem() {
    let payload: UpdateItemPayload = {
      item1Metadata: {
        lakehouse: selectedLakehouse,
        operand1: operand1,
        operand2: operand2,
        operator: operator,
        useOneLake: storageName === "OneLake"
      },
    };

    var successResult = await callPublicItemUpdateDefinition(
      sampleItem.id,
      [
        { payloadPath: DefinitionPath.ItemMetadata, payloadData: payload }
      ],
      workloadClient
    )
}
```

This method demonstrates how to persist the state of an item using the SDK.

## Standard Item creation experience


The configuration for the standard item creation experience can be found in the [Product.json](../Frontend/Package/Product.json) file, specifically within the `create` section under `createItemDialogConfig`. it allows to define event handlers for failur and success. Here is a snippet for reference:

```json
{
    "name": "Product",
    "version": "1.100",
    "displayName": "Workload_Display_Name",
    "createExperience": {
        "description": "CreateHub_Workload_Description",
        "cards": [
            {
              "title": "CreateHub_Card_2_Title",
              "description": "CreateHub_Card_2_Description",
              "icon": {
                "name": "assets/images/calculator.png"
              },
              "icon_small": {
                "name": "assets/images/calculator.png"
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

**TODO**

## Public API Support

An example of how to aquire a Token with the the right scope and make a call to the API can be found in the [ApiAuthenticationFrontend.tsx](../Frontend/src/components/ClientSDKPlayground/ApiAuthenticationFrontend.tsx) file. The mthod `callAuthAcquireFrontendAcces` implements how to get a token with a specific scope where the `sendWorkloadServerRequest`shows a generic method to parse the token for Fabric API calls. 

```typescript

function callAuthAcquireFrontendAcces(workloadClient, scopes) {
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
