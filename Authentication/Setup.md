## Setting up
In order to be able to work with authentication, you will need to go through 3 setups:
1. Microsoft Entra Id Application (AAD App).
2. FE sample.
3. BE sample.  

Please follow this guide carefuly to be able to work with authentication in Fabric.

## Azure Storage service provisioning
This sample demonstrates storing and reading data from/to lakehouses, this requires generating tokens for Azure Storage service in OBO flows - to be able to do that, users need to consent for the application to use Azure Storage, and for that Azure Storage needs to be provisioned in the tenant.
To make sure Azure Storage is provisioned in the tenant:
1. Log into https://portal.azure.com
2. Go to Microsoft Entra Id -> Enterprise applications
3. In the filters, choose application type = all aplications, and application id starts with e406a681-f3d4-42a8-90b6-c2b029497af1
   ![image](https://github.com/microsoft/Microsoft-Fabric-developer-sample/assets/97835845/de5b7ae6-6c38-411f-ba4a-462d54f9263c)

If you see Azure storage application then you're set! if not, a tenant global adminstrator will need to provision it, to do so, ask your tenant admin to perform the following:  
Open Windows Powershell as administrator and run the following:  
```
Install-Module az  
Import-Module az  
Connect-AzureAD  
New-AzureADServicePrincipal -AppId e406a681-f3d4-42a8-90b6-c2b029497af1
```


## Configuring your application in Microsoft Entra Id - Manual
To work with authentication, you will need to have an application registered in Microsoft Entra Id, if you don't have an application registered, follow [this guide](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app#register-an-application) to create a new application.

You will need to apply the following configurations to your application:
* Application should be a multi tenant app.
* For Dev applications, the redirect URI should be configured as "http://localhost:60006/close" with SPA platform.
  This is required for our consent support - you may also add other redirect URIs as desired.
  
Please note that the redirect URI should be a URI that simply closes the page when navigating to it, "http://localhost:60006/close" is already configured in the frontend sample and you can change it in [Frontend/src/index.ts](../Frontend/src/index.ts) (If you change it, make sure it matches the one configured on your application). 
 
  ![image](https://github.com/microsoft/Microsoft-Fabric-developer-sample/assets/97835845/bdd63045-e63d-4a76-a407-61064458eaa6)



  **Note:** you can configure the redirect URI after creating the application under Manage -> Authentication.

Next, you will need to change the Application Id URI for your application, to do so, go to Manage -> Expose an API, and edit the Application ID URI for your app:
  * For development scenario, the Application ID URI should start with: "api://localdevinstance/[Workload's publisher's [tenant id](https://learn.microsoft.com/en-us/entra/fundamentals/how-to-find-tenant) in lower case (tenant id of user used in fabric to run the sample)]/[Name of your workload]" and an optional sub-path at the end that starts with "/" (see examples).
    1. Workloadname name must be exactly how it's specified in the manifest.
    2. ID URI should not end with a slash.
    3. At the end of the ID URI there's an optional sub-path: a string consisting of English lower or upper case letters, numbers and dashes, up to 36 characters.
    
    For example, if the publisher's tenant id is 853d9f4f-c71b-4420-b6ec-60e503458946, and the workload's name is "Fabric.WorkloadSample" then:
      * api://localdevinstance/853d9f4f-c71b-4420-b6ec-60e503458946/Fabric.WorkloadSample is valid.
      * api://localdevinstance/853d9f4f-c71b-4420-b6ec-60e503458946/Fabric.WorkloadSample/abc is valid.
      * api://localdevinstance/853d9f4f-c71b-4420-b6ec-60e503458946/Fabric.WorkloadSample/af/ is not valid.
      * api://localdevinstance/853d9f4f-c71b-4420-b6ec-60e503458946/Fabric.WorkloadSample/af/a is not valid.
      * any ID URI that does not start with api://localdevinstance/853d9f4f-c71b-4420-b6ec-60e503458946/Fabric.WorkloadSample is not valid.
   
### Add a scope for CRUD/Jobs:
To be able to work with Create, Read, Update and Delete APIs for workload items, and other operations with jobs - 
you will need to [add a scope](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-configure-app-expose-web-apis#add-a-scope) and add two dedicated Fabric applications (see steps 2-3 below) to the preauthorized applications for that scope to indicate that your API (the scope you created) trusts Fabric, to do so:
1. Under Expose an API, click on "Add a scope", name the scope "FabricWorkloadControl" and provide needed details for it (this scope is needed for communication between Fabric BE and the workload BE and will be validated in the workload BE).
2. Under Authorized client applications, click on Add a client application and add "00000009-0000-0000-c000-000000000000" (Fabric service application) and select your scope.
3. Under Authorized client applications, click on Add a client application and add "d2450708-699c-41e3-8077-b0c8341509aa" (Fabric client for workloads application) and select your scope.

### Add scopes for data plane API:
Additional scopes need to be registered to represent groups of operations, exposed by data plane API.
In the BE sample we provide four as an example (you can see them in [Backend/src/Constants/scopes.cs](../Backend/src/Constants/Scopes.cs) - the scopes are:
1. "Item1.Read.All" - used for reading workload items.
2. "Item1.ReadWrite.All" - used for reading/writing workload items.
3. "FabricLakehouse.Read.All"" - used for reading lakehouse files.
4. "FabricLakehouse.ReadWrite.All" - used for reading/writing from/to lakehouse files.  

You will need to preauthorize "871c010f-5e61-4fb1-83ac-98610a7e9110" (Fabric client application) for these scopes.  
You can find the mentioned application ids above [here](https://learn.microsoft.com/en-us/troubleshoot/azure/active-directory/verify-first-party-apps-sign-in#application-ids-of-commonly-used-microsoft-applications) under "Microsoft Power BI" and "Power BI Service".  

Here's how your 'Expose an API' section should look like in your application (in this example the ID URI is "api://localdevinstance/853d9f4f-c71b-4420-b6ec-60e503458946/Fabric.WorkloadSample":
![image](https://github.com/microsoft/Microsoft-Fabric-developer-sample/assets/97835845/73bb4f32-94da-47cd-b3ad-e305a3c6017b)

### Generate a secret for your applicaiton
Under Certificates & secrets, click on Secrets tab and add a secret, call it whatever you want and save it aside, we will use this secret when configuring our BE sample.
![image](https://github.com/microsoft/Microsoft-Fabric-developer-sample/assets/97835845/181d7cc2-83e7-4d53-bea1-f4325dc765f1)

### Add optional claim 'idtyp'
Under Token configuration, click on add optional claim, choose Access token and add idtyp.
![image](https://github.com/microsoft/Microsoft-Fabric-developer-sample/assets/97835845/8a098482-e1b2-4346-9929-6352fb89846d)

### Add API permissions
Under API permissions, add a new permission: under Power BI Service, select Fabric.Extend scope.  
After that, add the desired permissions for your application, for the backend sample you will need to add Storage user_impersonation (for onelake APIs), Power BI Workspace.Read.all (for workload control APIs) & Lakehouse.Read.All (read lakehouse metadata from Fabric): 
![Screenshot 2023-12-14 111447](https://github.com/microsoft/Microsoft-Fabric-developer-sample/assets/26460388/7c96092e-9898-483d-9a0b-069bd5812120)


### Make sure your application is set to work with auth token v1
Under Manifest, make sure accessTokenAcceptedVersion is set to either null or "1".


## Configuring your application in Microsoft Entra Id - Automatic script
Alternatively, you can setup an application in Microsoft Entra Id using a Powershell script:
   1. Install Azure CLI: [Install the Azure CLI for Windows | Microsoft Learn2.](https://learn.microsoft.com/en-us/cli/azure/)
   2. Run CreateDevAADApp.ps1, and sign in with the user you wish to create the app for.
   3. Enter the name of the app, workload name (make sure it starts with Org.) and tenant Id.

The script will print all you need to configure your workload.
It will also print a URL to your application and a URL for admin consent for the application for the whole tenant.

Here's an example of usage:
`powershell .\CreateDevAADApp.ps1 -applicationName "myWorkloadApp" -workloadName "Org.Myworkload" -tenantId "cb1f79ad-7930-43c0-8d84-c1bf8d15c8c7"`

## Configuring your workload (Backend)
In the Backend sample, go to [src/appsettings.json](../Backend/src/appsettings.json) and configure the following:  
PublisherTenantId - the tenant Id of the publisher.  
ClientId - your application Id (you can find it in Microsoft Entra ID [AAD] under overview).  
ClientSecret - the secret we created earlier when configuring our Microsoft Entra ID [AAD] app.  
Audience - the ID URI we configured earlier in our Microsoft Entra ID [AAD] app.    

Next, you will need to configure your workloadManifest.xml, go to [src/Packages/manifest/files/WorkloadManifest.xml](../Backend/src/Packages/manifest/files/WorkloadManifest.xml) and configure your AppId, redirectUri and ResourceId (ID URI) as explained here [Microsoft Entra ID [Azure Active Directory (AAD)] Application Configuration](https://github.com/microsoft/Microsoft-Fabric-developer-sample/blob/main/Backend/src/Packages/manifest/README.md#azure-active-directory-aad-application-configuration)


## Configuring your workload local frontend app manifest and acquiring a token for your application (Relevant only when running your workload web app locally)
After configuring your application, you will need to add the following configurations to your frontend code.
Under [.env.dev](../Frontend/.env.dev):  
Update this environment variables:

"DEV_AAD_CONFIG_AUDIENCE": "", // The ID URI configured in your application for developer scenario  

"DEV_AAD_CONFIG_REDIRECT_URI": "http://localhost:60006/close", // or the path you configured in index.ts  

"DEV_AAD_CONFIG_APPID": "" // your app Id  

## Ask for a token and consent the application
**Note: This is needed for CRUD/Jobs to work.**  
Run the frontend sample and create a sample item, scroll down until you see Navigate to authentication page button and click on it to go to the authentication section which looks like this:
![image](https://github.com/microsoft/Microsoft-Fabric-developer-sample/assets/97835845/bbd546e7-6008-44c2-85d6-8823b80cbcb3)

Check "Request initial consent" and click on get access token button - this should trigger a consent for your application:
(Additional information on how to handle consents will be updated soon).  
![image](https://github.com/microsoft/Microsoft-Fabric-developer-sample/assets/97835845/361f6bdf-a86a-4930-83a6-4f328e6aac24)

Note that this consent includes the dependencies you added earlier in "Add API Permissions".

After finishing setting up you should be able to work with CRUD/Jobs operations, you also should be able to get an access token to your application in the client side.
You can use the authentication page in the frontend sample as a playground to call your workload APIs (you can see what kind of APIs the backend sample offers in Backend/src/controllers).
