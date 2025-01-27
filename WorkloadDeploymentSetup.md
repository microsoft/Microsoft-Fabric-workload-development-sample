# Deploying your workload
In this section, we'll cover the requirements for deploying a workload that operates on a remote server with internet access. There are two primary components to consider:

- **Workload Client Code**: This is embedded as an iFrame within the Fabric UI.
- **Workload Backend**: The server-side component that processes your workload.

Both components should be deployed as cloud services and can be hosted on separate servers if necessary.

## AAD App Resource Id format
AAD App resource id should comply with the following format:
```
https://<ISV's tenant verified domain>/<workload frontend server>/<workload backend server>/<workload id>/<optional string>
```
- ISV's tenant verified domain -  an exact match of verified domain in the publisher's tenant without any prefixes or subdomains. [Learn how to add a custom domain to Microsoft Entra](https://learn.microsoft.com/en-us/entra/fundamentals/add-custom-domain).
- Workload frontend server - the frontend server name as appears in the frontend URL (the additional segment in the frontend URL on top of the verified domain).
- Workload backend server - the backend server name as appears in the backend URL (the additional segment in the backend URL on top of the verified domain).
- Workload id - the workload id as appears in the workload manifest.
- At the end of the resource id there can be an optional string.
- `*.onmicrosoft` subdomains are not permitted in URLs.

## FE and BE domains:
- Frontend (FE) and Backend (BE) URLs must be subdomains of the resource id with maximum 1 additional segment.
- Reply URL host domain should be same as the FE host domain.

**Examples:**
- AAD App resource id: `https://datafactory.contoso.com/feserver/beserver/Fabric.WorkloadSample/123`
- FE domain: `https://feserver.datafactory.contoso.com`
- BE domain: `https://beserver.datafactory.contoso.com`
- Redirect URI: `https://feserver.datafactory.contoso.com/close`

## Configuring the workload's backend endpoint
Add the workload's backend URL to the `CloudServiceConfiguration` section in the manifest and name it "Workload".

## Configuring the workload's frontend endpoint
 Add the workload's frontend URL to the `CloudServiceConfiguration` section in the manifest and name it "Frontend".
```
<CloudServiceConfiguration>
    <Cloud>Public</Cloud>
    ...
    <Endpoints>
        <ServiceEndpoint>
        <Name>Workload</Name>
        <Url>https://beserver.datafactory.contoso.com/workload</Url>
        </ServiceEndpoint>
        <ServiceEndpoint>
        <Name>Frontend</Name>
        <Url>https://feserver.datafactory.contoso.com</Url>
        </ServiceEndpoint>
    </Endpoints>
</CloudServiceConfiguration>
```

## Configuring your application in Microsoft Entra Id
When configuring your application in Microsoft Entra Id, ensure the following:
1. The Redirect URL should point to your FE URL appended with `/close`, e.g., `feserver.datafactory.contoso.com/close`.
2. The Application Id URI should match the verified domain of your application.

*All other application configuration in Microsoft Entra Id are the same as in dev mode.


## Configuring your workload (Backend)
Navigate to `src/appsettings.json` in the Backend sample and configure the following:
- `PublisherTenantId`: The tenant ID of the publisher.
- `ClientId`: Your application ID (found in AAD under overview).
- `ClientSecret`: The secret created earlier when configuring the AAD app.
- `Audience`: The ID URI configured earlier in the AAD app.

Next, configure your `WorkloadManifest.xml` by navigating to `src/Packages/manifest/WorkloadManifest.xml` and setting your AppId, redirectUri, and ResourceId (ID URI) under "AADApp".
Note the requirement specified by XSDs and the following [README](https://github.com/microsoft/Microsoft-Fabric-developer-sample/blob/main/Backend/src/Packages/manifest/README.md).

## Configuring your FrontEnd app
Set WORKLOAD_BE_URL to your workload BE url (e.g. beserver.datafactory.contoso.com) in .env.test file.
```
WORKLOAD_NAME=Fabric.WorkloadSample
WORKLOAD_BE_URL=beserver.datafactory.contoso.com
```




# The following sections are relevant if you would like to deploy our Fabric boilerplate frontend and backend web apps to Azure.

## Creating and deploying the boilerplate backend web app
o create an Azure web app from the Azure portal:
1. Create a "Web App" resource in the Azure portal.
2. Fill in all the relevant data:
   - Choose "Publish" -> "Code".
   - Select "Runtime stack" -> ".NET 7 (STS)", "Windows".

For general instructions, see [Getting Started with Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/getting-started?pivots=stack-net).

### Map Your Domain to the Web App
1. Navigate to Settings -> Custom domains.
2. Click "Add custom domain" and follow the instructions.

For more information on mapping custom domains, visit [Custom Domain Mapping in Azure](https://learn.microsoft.com/en-us/azure/app-service/app-service-web-tutorial-custom-domain?tabs=root%2Cazurecli).

1. Open your backend boilerplate Visual Studio solution.
2. Right-click the boilerplate project and select "Publish".
3. Choose Azure as the target.
4. Sign in with a user who has access to the Azure web app you created.
5. Use the UI to locate the relevant subscription and resource group, then follow the instructions to publish.

### Update CORS
1. In your web app's Azure page, navigate to API -> CORS.
2. Under "Allowed Origins", add your FE web app URL.

## Creating and Deploying the Boilerplate Frontend Web App
To create an Azure web app from the Azure portal:
1. Create a "Web App" resource in the Azure portal.
2. Fill in all the relevant data:
   - Choose "Publish" -> "Code".
   - Select "Runtime stack" -> "Node 18 LTS", "Windows".

For general instructions, see [Quickstart for Node.js in Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/quickstart-nodejs?tabs=windows&pivots=development-environment-azure-portal).

### Map Your Domain to the Web App
1. Navigate to Settings -> Custom domains.
2. Click "Add custom domain" and follow the instructions.

For more information on mapping custom domains, visit [Custom Domain Mapping in Azure](https://learn.microsoft.com/en-us/azure/app-service/app-service-web-tutorial-custom-domain?tabs=root%2Cazurecli).

### Publish Your Frontend Boilerplate Web App
1. Build your frontend boilerplate by running `npm run build:test`.
2. Navigate to the `dist` folder at `Microsoft-Fabric-developer-sample\Frontend\tools\dist`.
3. Select all files and the asset folder under `dist` and create a zip file.
4. Open PowerShell.
5. Run `Connect-AzAccount` and sign in with a user who has access to the Azure web app you created.
6. Run `Set-AzContext -Subscription "<subscription_id>"`.
7. Run `Publish-AzWebApp -ResourceGroupName <resource_group_name> -Name <web_app_name> -ArchivePath <zip_file_path>`.