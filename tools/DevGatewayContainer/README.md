# DevGateway Container

This guide provides instructions on how to run the Fabric DevGateway in a container.
The dockerfile downloads the Fabric DevGateway and runs a script which validates the environment variables and ensures the required files are properly mounted to the container.

## Prerequisites

Before you begin, ensure you have the following installed:

- Docker
- Docker Compose

> For developers using Apple Silicon processors(M-Series), make sure you enable `Use Rosetta for x86/amd64 on Apple Silicon` in Docker. See [here](https://docs.docker.com/desktop/settings-and-maintenance/settings/#general) for more details.

## Getting Started

### 1. Set the Environment Variables

Copy the `sample.env` file, rename it to `.env`, update the values as needed and set the variables.

```bash
cp sample.env .env
```

| Variable Name                | Description                                                                            |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| `ENTRA_TENANT_ID`            | Fabric instance's Tenant ID                                                            |
| `WORKSPACE_GUID`             | User's Workspace ID                                                                    |
| `MANIFEST_PACKAGE_FILE_PATH` | **Full Path** to the Fabric workload backend `ManifestPackage.1.0.0.nupkg` build file. Example: `/Users/Username/Microsoft-Fabric-workload-development-sample/Backend/src/bin/Debug/ManifestPackage.1.0.0.nupkg` |
| `LOCAL_BACKEND_PORT`         | Fabric workload backend port. Default: `5000`                                          |
| `LOG_LEVEL`                  | DevGateway application log level. Default: `Information`                               |

### 2. Create an App registration

Use this script ![](../../Authentication/CreateDevAADApp.ps1) to create an App Registration.

> You will need to create a client secret for the App Registration

### 3. Update App Setting.json

Update the `PublisherTenantId`, `ClientId`, `ClientSecret` and `Audience` in the ![Backend's appsettings.json](../../Backend/src/appsettings.json) with values from the App Registration.

### 4. Update the workload.xml

Update the following fields in ![WorkloadManifest.xml](../../Backend/src/Packages/manifest/WorkloadManifest.xml)

```xml
    <AADApp>
        <AppId>00000000-0000-0000-0000-0f433e979e6c</AppId> <!-- Your application ID -->
        <RedirectUri>http://localhost:60006/close</RedirectUri> <!-- Your application Redirect URI -->
        <ResourceId>api://localdevinstance/TENANTID/Org.WorkloadSample/QJ</ResourceId> <!-- Your application Resource Id-->
     </AADApp>
```

### 5. Build and run the Docker Image

Run the following command to build and run the Docker image:

```sh
docker compose up
```

### 6. Authenticate to the DevGateway

Once the container is up and running, follow the prompts in the terminal to authenticate to Fabric.

### 7. Shutting things down

Stop the running container and remove containers and networks by running the command below.

```bash
docker compose down
```

However, since the terminal is attached to the running container, you have to open a new terminal from the `DevGateway` folder to execute the command. You can also shutdown the container gracefully with `Ctrl + C`.