# Local Development Environment Variables

This document explains how to configure local development settings that are specific to your development environment and not shared with the team.

## Overview

The shared configuration in `config/shared/config.json` contains only settings that should be identical across all team members. Individual developer settings are configured through environment variables or use sensible defaults.

## Required Environment Variables for Development

### DevGateway Configuration

The DevGateway configuration is automatically generated for the development environment using these environment variables:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `DEV_WORKSPACE_GUID` | *(generated UUID)* | Development workspace GUID - needs to be a real workspace id within Fabric.  |

### Setting Environment Variables

#### PowerShell (Recommended)

```powershell
# Set for current session
$env:DEV_GATEWAY_RELAY_NAMESPACE = "your-namespace"
$env:DEV_GATEWAY_RELAY_HYBRID_CONNECTION = "your-connection"
$env:DEV_GATEWAY_REDIRECT_HOST = "localhost:60006"
$env:DEV_WORKSPACE_GUID = "your-workspace-guid"

# Set permanently for your user
[Environment]::SetEnvironmentVariable("DEV_GATEWAY_RELAY_NAMESPACE", "your-namespace", "User")
[Environment]::SetEnvironmentVariable("DEV_GATEWAY_RELAY_HYBRID_CONNECTION", "your-connection", "User")
[Environment]::SetEnvironmentVariable("DEV_GATEWAY_REDIRECT_HOST", "localhost:60006", "User")
[Environment]::SetEnvironmentVariable("DEV_WORKSPACE_GUID", "your-workspace-guid", "User")
```

#### Using .env.local (Alternative)

Create a `.env.local` file in the root directory (this file is git-ignored):

```env
DEV_GATEWAY_RELAY_NAMESPACE=your-namespace
DEV_GATEWAY_RELAY_HYBRID_CONNECTION=your-connection
DEV_GATEWAY_REDIRECT_HOST=localhost:60006
DEV_WORKSPACE_GUID=your-workspace-guid
```

## Configuration Generation

When you run `scripts/Setup/GenerateConfiguration.ps1`, the script will:

1. **For all environments**: Use the shared configuration from `config/shared/config.json`
2. **For development environment only**:

   - Check for environment variables for DevGateway settings
   - Use default values if environment variables are not set
   - Generate a unique workspace GUID if `DEV_WORKSPACE_GUID` is not provided
   - Create the DevGateway configuration file automatically

## Why This Approach?

### Team Collaboration Benefits

- **Consistent shared settings**: All team members use identical workload configuration
- **No merge conflicts**: Local development settings don't appear in shared config files
- **Easy onboarding**: New team members get working defaults automatically
- **Flexible customization**: Developers can override defaults for their specific setup

### Local Development Benefits

- **Secure secrets**: Sensitive connection strings stay in your local environment
- **Personal workspaces**: Each developer can use their own workspace GUID
- **Custom endpoints**: Developers can point to different relay namespaces for testing
- **No accidental commits**: Local settings can't be accidentally committed to git

## Troubleshooting

### Missing DevGateway Configuration

If you're missing the DevGateway configuration file after running generation:

1. Ensure you're generating for the "development" environment
2. Check that environment variables are set (or rely on defaults)
3. Verify the output directory exists: `config/DevGateway/`

### Environment Variable Not Taking Effect

1. Restart your PowerShell session after setting environment variables
2. Verify the variable is set: `echo $env:VARIABLE_NAME`
3. For permanent variables, check they're set at the User level

### Workspace GUID Issues

- The system will auto-generate a UUID if `DEV_WORKSPACE_GUID` is not set
- To use a specific workspace, set the environment variable before running generation
- The workspace GUID is only used in development environment

## Example Complete Setup

```powershell
# 1. Set your specific development environment (optional - defaults will work)
$env:DEV_GATEWAY_RELAY_NAMESPACE = "my-dev-namespace"
$env:DEV_WORKSPACE_GUID = "12345678-1234-1234-1234-123456789abc"

# 2. Generate configuration for development
.\scripts\Setup\GenerateConfiguration.ps1 -Environment development

# 3. Verify files were created
ls config/DevGateway/  # Should contain workload-dev-mode.json
ls config/Manifest/    # Should contain generated manifest files
```

This approach ensures that your local development environment is properly configured while maintaining clean, shareable team configuration files.
