# Fabric Extension - BE Boilerplate

## Introduction

This guide serves as a starting point for building applications that require integration with various services, including Workload and Lakehouse. This guide will help you set up the environment in the local dev mode, and configure the necessary components to get started. The key components and their roles in the architecture are outlined below:

![alt text](/photos/dev-mode-schema.png)

#### Frontend (FE)
The frontend is responsible for managing the user experience (UX) and behavior. It communicates with the Fabric FE portal via an IFrame, facilitating seamless interaction with the user.

#### Backend (BE)
The backend plays a crucial role in storing both data and metadata. It utilizes CRUD operations to create Workload (WL) items along with metadata, and executes jobs to populate data in storage. The communication between the frontend and backend is established through public APIs.

#### Azure Relay and DevGateway
Azure Relay acts as a conduit for interactions between the BE development box and the Fabric BE in local (development) mode. The DevGateway utility handles the workload's side of Azure Relay channel and manages the registration of the workload local instance with Fabric in the context of a specific capacity. The utility ensures that the workload is available in all workspaces assigned to that capacity and handles the deregistration when stopped.

#### DevGateway
In local mode, the workload operates on the developer's machine. Workload API calls from Fabric to the workload are channeled through Azure Relay, with the workload's side of the Azure Relay channel managed by the DevGateway command-line utility. Workload Control API calls are made directly from the workload to Fabric, not requiring the Azure Relay channel. The DevGateway utility also manages the registration of the workload's local (development) instance with Fabric within a specific capacity context, making the workload accessible in all workspaces assigned to that capacity. Terminating the DevGateway utility automatically removes the workload instance registration.

#### Lakehouse Integration
Our architecture seamlessly integrates with Lakehouse, allowing operations such as saving, reading, and fetching data. The interaction is facilitated through Azure Relay and direct calls to the Workload Control API, ensuring secure and authenticated communication.

#### Authentication and Security
Azure Active Directory (AAD) is employed for secure authentication, ensuring that all interactions within the architecture are authorized and secure.

This overview provides a glimpse into the intricacies of our architecture. For detailed information on project configuration, guidelines, and getting started, please refer to the respective sections in this README.

![alt text](/photos/overall-arch.png)

The frontend (FE) establishes communication with the Fabric FE portal via an IFrame. The portal, in turn, interacts with the Fabric backend (BE) by making calls to its exposed public APIs.

For interactions between the BE development box and the Fabric BE, the Azure Relay and the DevGateway utility serve as a conduit. Additionally, the BE development box seamlessly integrates with Lakehouse, performing operations such as saving, reading, and fetching data from this resource. 

The authentication for all communication within these components is ensured through Azure Active Directory (AAD), providing a secure and authenticated environment for the interactions between the frontend, backend, Azure Relay, and Lakehouse.

## Project Configuration Guidelines

Our project operates on the .NET 7 framework, necessitating the installation of the .NET 7.0 SDK, available for download from the official .NET website. As our project harnesses the capabilities of .NET 7, it is required to use Visual Studio 2022. NET 6.0 or higher in Visual Studio 2019 is not supported.

Ensure that the NuGet Package Manager is integrated into your Visual Studio installation. This tool is required for streamlined management of external libraries and packages essential for our project.

#### NuGet package management

```xml
<NuspecFile>Packages\manifest\ManifestPackage.nuspec</NuspecFile>
```
This property specifies the path to the NuSpec file used for creating the NuGet package. The NuSpec file contains metadata about the package, such as its ID, version, dependencies, and other relevant information.

```xml
<GeneratePackageOnBuild>true</GeneratePackageOnBuild>
```
When set to true, this property instructs the build process to automatically generate a NuGet package during each build. This is particularly useful to ensure that the package is always up-to-date with the latest changes in the project.

```xml
<IsPackable>true</IsPackable>
```
This property, when set to true, indicates that the project is packable, meaning it can be packaged into a NuGet package. It is an essential property for projects intended to produce NuGet packages during the build process.

The generated NuGet package will be located in the **src\bin\Debug** directory after the build process.

#### Dependencies
The BE Boilerplate depends on the following Azure SDK packages:

* Azure.Core
* Azure.Identity
* Azure.Storage.Files.DataLake

Additionally, incorporate the Microsoft Identity package, as it plays a crucial role in implementing secure authentication and authorization, particularly when interfacing with Azure Active Directory (AAD) or other identity providers.

```xml
﻿﻿<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net7.0</TargetFramework>
    <AutoGenerateBindingRedirects>true</AutoGenerateBindingRedirects>
    <BuildDependsOn>PreBuild</BuildDependsOn>
    <GeneratePackageOnBuild>true</GeneratePackageOnBuild>
    <IsPackable>true</IsPackable>
  </PropertyGroup>
  
  <PropertyGroup Condition="'$(Configuration)' == 'Release'">
    <NuspecFile>Packages\manifest\ManifestPackageRelease.nuspec</NuspecFile>
  </PropertyGroup>

  <PropertyGroup Condition="'$(Configuration)' == 'Debug'">
    <NuspecFile>Packages\manifest\ManifestPackageDebug.nuspec</NuspecFile>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Azure.Core" Version="1.36.0" />
    <PackageReference Include="Azure.Identity" Version="1.10.4" />
    <PackageReference Include="Azure.Storage.Files.DataLake" Version="12.14.0" />
    <PackageReference Include="Microsoft.AspNet.WebApi.Client" Version="5.2.9" />
    <PackageReference Include="Microsoft.AspNetCore.Mvc.NewtonsoftJson" Version="7.0.5" />
    <PackageReference Include="Microsoft.Extensions.Logging.Debug" Version="7.0.0" />
    <PackageReference Include="Microsoft.Identity.Client" Version="4.58.1" />
    <PackageReference Include="Microsoft.IdentityModel.Protocols" Version="6.30.1" />
    <PackageReference Include="Microsoft.IdentityModel.Protocols.OpenIdConnect" Version="6.30.1" />
    <PackageReference Include="Microsoft.IdentityModel.Tokens" Version="6.30.1" />
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.5.0" />
  </ItemGroup>

  <ItemGroup>
    <Folder Include="Properties\ServiceDependencies\" />
  </ItemGroup>

  <Target Name="PreBuild" BeforeTargets="PreBuildEvent">
    <Exec Command="Packages\manifest\Fabric_Extension_BE_Boilerplate_WorkloadManifestValidator.exe Packages\manifest\WorkloadManifest.xml .\Packages\manifest\" />
    <Error Condition="Exists('.\Packages\manifest\ValidationErrors.txt')" Text="WorkloadManifest validation error" File=".\Packages\manifest\ValidationErrors.txt" />
  </Target>

</Project>
```

## Getting Started

To set up the boilerplate/sample project on your local machine, follow these steps:

1. Clone the Boilerplate: git clone https://github.com/microsoft/Microsoft-Fabric-developer-sample.git
2. Open Solution in Visual Studio 2022 (since our project works with net7).
3. Setup an app registration by following instructions on the Authentication [guide](../Authentication/Setup.md). Ensure that both your Frontend and Backend projects have the necessary setup described in the guide. Azure Active Directory (AAD) is employed for secure authentication, ensuring that all interactions within the architecture are authorized and secure.
   
4. Update the One Lake DFS Base URL: Depending on the environment you are using for Fabric, you can update the `OneLakeDFSBaseURL` within the **src\Constants\ folder. The default is `onelake.dfs.fabric.microsoft.com` but this can be updated to reflect the environment you are on. More information on the DFS paths can be found [here](https://learn.microsoft.com/en-us/fabric/onelake/onelake-access-api)

5. Setup Workload Configuration\
	&nbsp;&nbsp;a. Copy workload-dev-mode.json from src/Config to `C:\`.\
	&nbsp;&nbsp;**Note:** you can copy it to any other path and set up the command line argument "-DevMode:LocalConfigFilePath" in your project to specify the path.\
	&nbsp;&nbsp;b. In the workload-dev-mode.json file, update the following fields to match your configuration:\
		&emsp;&emsp;i. CapacityGuid: Your Capacity ID. This can be found within the Fabric Portal under the Capacity Settings of the Admin portal.\
		&emsp;&emsp;ii. ManifestPackageFilePath: The location of the manifest package. When you build the solution, it will save the manifest package within **src\bin\Debug**. More details on the manifest package can be found in the later steps.\
		&emsp;&emsp;iii. WorkloadEndpointURL: Workload Endpoint URL.\
	&nbsp;&nbsp;c. In the Packages/manifest/WorkloadManifest.xml file, update the following fields to match your configuration:\
		&emsp;&emsp;i. \<AppId>: Client ID (Application ID) pf the workload AAD application.\
		&emsp;&emsp;ii. \<RedirectUri>: Redirect URIs. This can be found in your app registration that you created under 'Authentication' section.\
		&emsp;&emsp;iii. \<ResourceId>: Audience for the incoming AAD tokens. This can be found in your app registration that you created under 'Expose an API' section.						
	&nbsp;&nbsp;d. In the src/appsettings.json file, update the following fields to match your configuration:\
		&emsp;&emsp;i. PublisherTenantId: The Id of the workload publisher tenant.\
		&emsp;&emsp;ii. ClientId: Client ID (AppId) of the workload AAD application.\
		&emsp;&emsp;iii. ClientSecret: The secret for the workload AAD application.\
		&emsp;&emsp;iv. Audience: Audience for incoming AAD tokens. This can be found in your app registration that you created under "Expose an API" section. This is also referred to as the Application ID URI. \
	&nbsp;&nbsp;Please note that there is work to merge the two configuration files into one.

6. Manifest Package\
To generate a manifest package file, build Fabric_Extension_BE_Boilerplate which will run a 3 step process to generate the manifest package file:

a. The prebuild process runs a series of PowerShell scripts to validate the project's manifest files.
   It checks the workload manifest, item manifests, and default values against their respective schemas and requirements.
   If any validation fails, an error file is generated in the ValidationScripts directory with details of the failed validations.

b. If the error file exists, the build will fail with "WorkloadManifest validation error".
   You can double click on the error in VS and it will show you the error file.

c. After successful validation, the script packs the required files into ManifestPackage.1.0.0.nupkg. The resulting package can be found in **src\bin\Debug**.

Copy the ManifestPackage.1.0.0.nupkg file to the path defined in the workload-dev-mode.json configuration file.
7. Program.cs
	Serves as the entry point and startup script for your application. In this file, you can configure various services, initialize the application, and start the web host. It plays a pivotal role in setting up the foundation of your project.
	
8. Build to ensure your project can access the required dependencies for compilation and execution. 
9. Run the DevGateway and login with a user that is a capacity admin of the capacity you've defined in workload-dev-mode.json(CapacityGuid). Upon the initialization of the workload, an authentication prompt will be presented. It is essential to highlight that administrative privileges for the capacity are a prerequisite. (For more info, [go to the DevGateway README](./DevGateway/README.md))

![signIn](https://github.com/microsoft/Microsoft-Fabric-developer-sample/assets/138197766/573bb83a-1c54-4baf-bf52-0aca1e72bc21)
After authentication, external workloads establish communication with the Fabric backend through Azure Relay. This process involves relay registration and communication management, facilitated by a designated Proxy node. Furthermore, the package containing the workload manifest is uploaded and published.

At this stage, Fabric has knowledge of the workload, encompassing its allocated capacity.

Monitoring for potential errors can be observed in the console, with plans to incorporate additional logging in subsequent iterations.

If you see no errors, it means the connection is established, registration is successfully executed, and the workload manifest has been systematically uploaded, - a dedicated success message will be added here in the future.
![devgetway](https://github.com/microsoft/Microsoft-Fabric-developer-sample/assets/139851206/548ea235-07f3-461d-b312-c9a01aa967a1)
10. Lastly, change your startup project in Visual Studio to the 'Boilerplate' project and simply click the "Run" button. 
![Run](https://github.com/microsoft/Microsoft-Fabric-developer-sample/assets/138197766/16da53ad-013a-4382-b6cd-51acc4352c52)
![image](https://github.com/microsoft/Microsoft-Fabric-developer-sample/assets/139851206/1e3fe360-28d1-4471-aded-8d69f00a8cfd)


## Working with the Boilerplate

### Code generation
We will use the workload Boilerplate C# ASP.NET Core sample for explaining how to build a workload with REST API. Everything starts with generating server stubs and contract classes based on the Workload API [Swagger specification](./src/Contracts/FabricAPI/Workload/swagger.json). This can be done using a variety of Swagger code generation tools. Our Boilerplate sample uses [NSWag](https://github.com/RicoSuter/NSwag). The sample contains GenerateServerStub.cmd command line script which wraps NSwag code generator. The script takes a single parameter which is a full path to NSWag installation directory. It also expects to find next to it the Swagger definition file swagger.json and configuration file nswag.json.

This usage information is printed if the script is executed without parameters.


Executing this script will produce a C# file WorkloadAPI_Generated.cs. Although there is no clear separation in the file, its content can be logically divided into three parts, as described below.

### ASP.NET Core stub controllers
ItemLifecycleController and JobsController classes are very thin implementations of ASP.NET Core controllers for two subsets of Workload API: item lifecycle management and jobs. These classes plug into ASP.NET Core HTTP pipeline, and serve the entry points for API methods, defined in the Swagger specification. All these classes do is forwarding the calls to the "real" implementation, provided by the workload.

This is for example CreateItem method (manually formatted to fit into page).

```csharp
/// <summary>
/// Called by Microsoft Fabric for creating a new item.
/// </summary>
/// <remarks>
/// Upon item creation Fabric performs some basic validations, creates the item with 'provisioning' state and calls this API to notify the workload. The workload is expected to perform required validations, store the item metadata, allocate required resources, and update the Fabric item metadata cache with item relations and ETag. To learn more see [Microsoft Fabric item update flow](https://updateflow).
/// <br/>
/// <br/>This API should accept [SubjectAndApp authentication](https://subjectandappauthentication).
/// <br/>
/// <br/>##Permissions
/// <br/>Permissions are checked by Microsoft Fabric.
/// </remarks>
/// <param name="workspaceId">The workspace ID.</param>
/// <param name="itemType">The item type.</param>
/// <param name="itemId">The item ID.</param>
/// <param name="createItemRequest">The item creation request.</param>
/// <returns>Successfully created.</returns>
[Microsoft.AspNetCore.Mvc.HttpPost, Microsoft.AspNetCore.Mvc.Route("workspaces/{workspaceId}/items/{itemType}/{itemId}")]
public System.Threading.Tasks.Task CreateItem(System.Guid workspaceId, string itemType, System.Guid itemId, [Microsoft.AspNetCore.Mvc.FromBody] CreateItemRequest createItemRequest)
{

	return _implementation.CreateItemAsync(workspaceId, itemType, itemId, createItemRequest);
}
```
### Interfaces for workload implementation
IItemLifecycleController and IJobsController are interfaces for the aforementioned "real" implementations. The define same methods, which are implemented by the controllers.

### Definition of contract classes
C# contract classes used by the APIs.


## Implementation
The next step after code generation is implementing IItemLifecycleController and IJobsController interfaces. In the Boilerplate sample these interfaces are implemented by ItemLifecycleControllerImpl and JobsControllerImpl classes respectively.

This is for example the implementation of CreateItem API.

```csharp
/// <inheritdoc/>
public async Task CreateItemAsync(Guid workspaceId, string itemType, Guid itemId, CreateItemRequest createItemRequest)
{
	var authorizationContext = await _authenticationService.AuthenticateControlPlaneCall(_httpContextAccessor.HttpContext);
	var item = _itemFactory.CreateItem(itemType, authorizationContext);
	await item.Create(workspaceId, itemId, createItemRequest);
}
```

## Handling item payload
Several API methods accept as part of the request body or return as part of the response various types of "payload". For example, CreateItemRequest has creationPayload property.

```json
"CreateItemRequest": {
	"description": "Create item request content.",
	"type": "object",
	"additionalProperties": false,
	"required": [ "displayName" ],
	"properties": {
	"displayName": {
		"description": "The item display name.",
		"type": "string",
		"readOnly": false
	},
	"description": {
		"description": "The item description.",
		"type": "string",
		"readOnly": false
	},
	"creationPayload": {
		"description": "Creation payload specific to the workload and item type, passed by the item editor or as Fabric Automation API parameter.",
		"$ref": "#/definitions/CreateItemPayload",
		"readOnly": false
	}
	}
}
```

The types for such "payload" properties are defined in the Swagger specification - a dedicated type for every kind of payload. These types do not define any specific properties and allow any property to be included. This is for example CreateItemPayload type.

```json
"CreateItemPayload": {
	"description": "Creation payload specific to the workload and item type.",
	"type": "object",
	"additionalProperties": true
}
```
The generated C# contract classes are defined as partial and have a dictionary with properties.

```csharp
/// <summary>
/// Creation payload specific to the workload and item type.
/// </summary>
[System.CodeDom.Compiler.GeneratedCode("NJsonSchema", "13.20.0.0 (NJsonSchema v10.9.0.0 (Newtonsoft.Json v13.0.0.0))")]
public partial class CreateItemPayload
{
	private System.Collections.Generic.IDictionary<string, object> _additionalProperties;

	[Newtonsoft.Json.JsonExtensionData]
	public System.Collections.Generic.IDictionary<string, object> AdditionalProperties
	{
		get { return _additionalProperties ?? (_additionalProperties = new System.Collections.Generic.Dictionary<string, object>()); }
		set { _additionalProperties = value; }
	}
}
```

The code can use this dictionary for reading and returning properties. However, a better approach is defining specific properties with corresponding types and names. This can be easily achieved because of the 'partial' declaration on the generated classes.

For example, CreateItemPayload.cs file contains a complementary definition for CreateItemPayload class, which adds Item1Metadata property.

```csharp
namespace Fabric_Extension_BE_Boilerplate.Contracts.FabricAPI.Workload
{
    /// <summary>
    /// Extend the generated class by adding item-type-specific fields.
    /// In this sample every type will have a dedicated property. Alternatively, polymorphic serialization could be used.
    /// </summary>
    public partial class CreateItemPayload
    {
        [Newtonsoft.Json.JsonProperty("item1Metadata", Required = Newtonsoft.Json.Required.Default, NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore)]
        public Item1Metadata Item1Metadata { get; init; }
    }
}
```

There is a caveat though. If the workload supports multiple item types, CreateItemPayload class needs to be able to handle different types of creation payload, one per item type. This can be done in two ways. A simpler one, used by the Boilerplate sample, is defining multiple optional properties, each representing the creation payload for a different item type. Every request will then have just one of these properties set, according to the item type being created. An alternative, slightly more complex approach, could be implementing polymorphic serialization, but it is not demonstrated in the sample because it does not provide any significant benefits.

For example, for supporting two item types this class definition would need to be extended as follows:
```csharp
namespace Fabric_Extension_BE_Boilerplate.Contracts.FabricAPI.Workload
{
    public partial class CreateItemPayload
    {
        [Newtonsoft.Json.JsonProperty("item1Metadata", Required = Newtonsoft.Json.Required.Default, NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore)]
        public Item1Metadata Item1Metadata { get; init; }

        [Newtonsoft.Json.JsonProperty("item2Metadata", Required = Newtonsoft.Json.Required.Default, NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore)]
        public Item2Metadata Item2Metadata { get; init; }
    }	
}
```

Note: The "payload" sent to the workload is generated by the client. It could be the item editor iframe or Fabric Automation REST API. It is the responsibility of the client to send a correct payload, matching the item type and the responsibility of the workload to verify that. Fabric treats this payload as an opaque object and only transfers it from the client to the workload. Similarly, for a payload returned by the workload to the client, it is workload's and client's responsibility to handle the payload correctly.

For example, this is how the Boilerplate sample Item1 implementation handles that:

```csharp
protected override void SetDefinition(CreateItemPayload payload)
{
	if (payload == null)
	{
		Logger.LogInformation("No payload is provided for {0}, objectId={1}", ItemType, ItemObjectId);
		_metadata = Item1Metadata.Default.Clone();
		return;
	}

	if (payload.Item1Metadata == null)
	{
		throw new InvalidItemPayloadException(ItemType, ItemObjectId);
	}

	if (payload.Item1Metadata.Lakehouse == null)
	{
		throw new InvalidItemPayloadException(ItemType, ItemObjectId)
			.WithDetail(ErrorCodes.ItemPayload.MissingLakehouseReference, "Missing Lakehouse reference");
	}

	_metadata = payload.Item1Metadata.Clone();
}
```

## Migration from code developed based on first developers drop
The Boilerplate sample has been updated to work with REST APIs. Partners who start using the sample only now and those who used it before without making any customizations, can just seamlessly switch to the new version.
Partners who customized the sample or used it as a reference for implementing their own workload will need to make similar changes to their code. The following Boilerplate sample PR can be used as a reference for the required changes: Adapt the sample for working with REST API defined in Swagger without dependency on .NET SDK by yuryber · Pull Request #160 · microsoft/Microsoft-Fabric-developer-sample (github.com).

## Troubleshooting and Debugging
### Known Issues and Solutions
#### Missing Client Secret

`Error`:
Microsoft.Identity.Client.MsalServiceException: A configuration issue is preventing authentication - check the error message from the server for details. You can modify the configuration in the application registration portal. See https://aka.ms/msal-net-invalid-client for details. Original exception: AADSTS7000215: Invalid client secret provided. Ensure the secret being sent in the request is the client secret value, not the client secret ID, for a secret added to app 'app_guid'.

`Resolution`: Make sure you have the correct client secret in appsettings.json.

--------------------------------
#### Error during artifact creation due to missing admin consent
`Error`:
Microsoft.Identity.Client.MsalUiRequiredException: AADSTS65001: The user or administrator has not consented to use the application with ID '4e691b14-bffe-456c-af9f-4efdfa12ed52' named 'childofmsaapp'. Send an interactive authorization request for this user and resource.

`Resolution`:
In the artifact editor, navigate to the bottom and click "Navigate to Authentication Page."
Under "Scopes" write ".default" and click "Get Access token."
Approve consent in the popped-up dialog.

-------------------
#### Artifact creation fails due to capacity selection

`Error`: PriorityPlacement: There are no available core services for priority placement only 'name','guid','workload-name'.

`Resolution`: You might be using a user that only have access to Trial capacity. Make sure you are using a capacity that you have access to.

--------------

#### File creation failure with 404 (NotFound) error

`Error`: Creating a new file failed for filePath: 'workspace-id'/'lakehouse-id'/Files/data.json. Error: Response status code does not indicate success: 404 (NotFound).
Resolution: Ensure you are using the correct OneLake DFS URL for your environment.

`Resolution`: Make sure you are working with the OneLake DFS URL that fits your environment. For example, if you work with PPE environment, change EnvironmentConstants.OneLakeDFSBaseUrl in Constants.cs to the appropriate URL.

### Debugging
When troubleshooting various operations, you can set breakpoints in the code to analyze and debug the behavior. Follow these steps for effective debugging:

* Open the code in your development environment.
* Navigate to the relevant operation handler function (e.g., OnCreateFabricItemAsync for CRUD operations or an endpoint in a controller for Execute operations).
* Place breakpoints at specific lines where you want to inspect the code.
* Run the application in debug mode.
* Trigger the operation from the frontend (FE) that you want to debug.
* The debugger will pause execution at the specified breakpoints, enabling you to examine variables, step through code, and identify issues.

![BPCreate](https://github.com/microsoft/Microsoft-Fabric-developer-sample/assets/138197766/106332b5-3240-4a31-9b6b-dcc440cced36)

## Note

If you try to run the Sample to make changes on the backend be sure you are in a workspace previously created not in the default My Workspace. Otherwise you may face this issue:
    ![image](https://github.com/microsoft/Microsoft-Fabric-developer-sample/assets/62876278/80ada389-0070-45ed-be6f-f500d08939c5)

1. Click in a named workspace to leave the default - My workspace.For example, the image is trying to access the testbeapi:

   
   ![image](https://github.com/microsoft/Microsoft-Fabric-developer-sample/assets/62876278/4b3b5965-facc-403d-9ef1-3d0bc17d4af3)


3. Once you are in the right workspace load Sample Workload and proceed with the tests:
   
   
    ![image](https://github.com/microsoft/Microsoft-Fabric-developer-sample/assets/62876278/eb27a0a4-c52a-4e89-88ab-4972c6e95fba)



## Contributing


We welcome contributions to this project. If you find any issues or want to add new features, please follow these steps:

	1. Fork the repository.
	2. Create a new branch for your feature or bug fix.
	3. Make your changes and commit them.
	4. Push your changes to your forked repository.
 	5. Create a pull request with a clear description of your changes.
