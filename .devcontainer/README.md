# Development Container for Microsoft Fabric Workload Development

This directory contains configuration for a development container that can be used with VS Code Remote Containers or GitHub Codespaces. The container includes all the tools needed for developing both the frontend (Angular with Node.js) and backend (ASP.NET 6) components of the Microsoft Fabric Workload Development project.

## What's Included

### Runtimes & SDKs
- .NET 6 SDK
- Node.js LTS
- Angular CLI (globally installed)

### Tools & Utilities
- Git
- PowerShell (latest version)
- Docker-in-Docker
- Azure CLI (latest version) for `az` command-line operations
- .NET Entity Framework Core tools

### VS Code Extensions
- Angular Language Service
- ESLint
- Prettier
- C# Dev Kit
- Docker
- GitHub Copilot
- Code Spell Checker
- GitLens

## Getting Started

### Using VS Code Remote Containers
1. Install [VS Code](https://code.visualstudio.com/) and the [Remote Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
2. Clone the repository
3. Open the repository in VS Code
4. When prompted, select "Reopen in Container"
   - Alternatively, press F1 and select "Remote-Containers: Reopen in Container"

### Using GitHub Codespaces
1. Navigate to the repository on GitHub
2. Click on "Code" > "Open with Codespaces"
3. Click "New codespace"

## Port Forwarding

The following ports are automatically forwarded when running the container:

- `6000`: Fabric Workload Development Kit
- `4200`: Angular development server
- `5000`: ASP.NET HTTP endpoint
- `5001`: ASP.NET HTTPS endpoint
- `60006`: Fabric Workload Development Kit Frontend

## Additional Configuration

You can further customize the development container by modifying:

- `.devcontainer/devcontainer.json`: Add extensions, features, and settings
- `.devcontainer/Dockerfile`: Modify the container setup
- `.devcontainer/docker-compose.yml`: Adjust container orchestration

## Using Azure CLI

The container comes with Azure CLI pre-installed. Here's how to get started:

1. Authenticate with Azure:
   ```bash
   az login
   ```

2. Select a subscription:
   ```bash
   az account set --subscription <subscription-id>
   ```

3. Run Azure commands:
   ```bash
   az group list
   az resource list
   az account show
   ```

For more information, see the [Azure CLI documentation](https://docs.microsoft.com/en-us/cli/azure/).

## Using PowerShell

The container comes with the latest version of PowerShell pre-installed:

1. Start a PowerShell session:
   ```bash
   pwsh
   ```

2. Check your PowerShell version:
   ```powershell
   $PSVersionTable
   ```

3. Run PowerShell commands:
   ```powershell
   # Working with files and directories
   Get-ChildItem
   
   # Working with Azure PowerShell modules
   # Install-Module -Name Az -AllowClobber -Scope CurrentUser
   # Connect-AzAccount
   
   # Working with .NET
   [System.Environment]::OSVersion
   ```

For more information, see the [PowerShell documentation](https://docs.microsoft.com/en-us/powershell/).

## More Resources

- [VS Code Remote Development](https://code.visualstudio.com/docs/remote/remote-overview)
- [GitHub Codespaces](https://docs.github.com/en/codespaces)
- [Dev Containers Specification](https://containers.dev/)