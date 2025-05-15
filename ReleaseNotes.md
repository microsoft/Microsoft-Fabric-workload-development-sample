# Workload extensibility release notes

The Fabric Workload Extensibility SDK lets you create custom Workload for Microsoft Fabric. The SDK is currently in development and will be released in two preview phases: private preview and public preview. This article explains what each preview phase includes and what you can expect from the SDK.

## Private preview

> [!NOTE]
> Microsoft partners joining Microsoft Fabric workload extensibility private preview understand that they must provision a non-production tenant which will be enabled by Microsoft for workload development. Developing with the Fabric extensibility framework in this private preview might expose tenant users to security risks such as data leakage or identity theft.

The private preview is designed to enable partners to start developing a custom workloads using the initial release of the Workload extensibility SDK. The private preview features include:

- The workload extensibility framework, which provides the basic infrastructure and APIs for creating and running extensions.
- Register workload dynamically in a capacity scope, only via developer mode.
- The access to the Fabric extensibility framework (Fabric shell) and the public REST API with Azure Active Directory (AAD) and single sign-on (SSO). The Fabric shell is a common user interface that provides navigation, branding, and security for all workloads. The public REST API allows you to interact with Fabric data and services.

See the following know limitation and bugs of the private preview:

| Index | Known issue | Status |
|---|---|---|
| 1. | At times disconnecting BE debug session does not unregister the workload (internal tracking id: 1248957). | Fix in Progress |
| 2. | Users may encounter a scenario where workspace settings become unresponsive after uploading one or more partner workloads. This issue manifests as an inability to close workspace settings through normal means.  To prevent this issue, ensure that all workloads uploaded to the tenant are updated or removed. If faced with an unresponsive workspace setting, refreshing the browser page (F5) will exit the settings interface. (internal tracking id: 1352420). | Fix in Progress |
| 3. |  Duplicate Version Conflict: Uploading workloads with identical versions can lead to unexpected behavior, such as both versions appearing as "active" in the workload status. Users are advised to avoid uploading duplicate versions to prevent this issue. (internal tracking id: 1352419). | Fix in Progress |
| 4. | Route Name Conflict:  When multiple workloads use identical "RouteName" properties, it can cause unexpected behaviors and navigation issues, including opening the wrong item editor. (internal tracking id: 1352371). | Fix in Progress |
| 5. | Job Failure Details: When a job fails, the lack of details in the monitoring hub can leave users without the necessary information to troubleshoot effectively. (internal tracking id: 1352421). | Fix in Progress |
| 6. | Workload Deletion: Currently, deleting an uploaded workload is not supported. This functionality is expected to be implemented soon. (internal tracking id: 1352419). | Fix in Progress |



## Public preview

The public preview is the public release of the extensibility framework. The public preview features include:

- The admin center, which allows you to upload and manage your extensions at the capacity level.
- The ability to enable Microsoft pre-approved extensions for every capacity in your organization.
- Datahub support, which allows marking item type as data type item to integrate with Datahub.
- The publishing feature, which enables you to publish your extension at the tenant level and release it outside your organization.
- Additional workload APIs, which allow you to update and get metadata and permissions for your extension.

