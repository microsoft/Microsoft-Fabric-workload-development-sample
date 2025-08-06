# Update Workload Configuration - .env-Based System

## Process Overview

This guide provides instructions for updating Microsoft Fabric workload configuration using the simplified .env-based system. The new system uses environment files as the single source of truth for all configuration.

## 🏗️ **New Configuration Architecture**

### Environment-Based Configuration
- **Environment Files**: `Workload/.env.dev`, `.env.test`, `.env.prod` - Primary configuration source
- **Templates**: `Workload/Manifest/` - Version-controlled templates with placeholders
- **Generated Files**: `build/Manifest/` and `build/DevGateway/` - Auto-generated from templates and .env files

### Key Benefits
- **Simplicity**: Standard .env format familiar to all developers
- **Environment Management**: Separate committed files for each deployment target
- **Template Processing**: Placeholders like `{{WORKLOAD_NAME}}` replaced during generation
- **Self-Contained**: All configuration lives with application code

## Step 1: Update Environment Configuration

### 1.1: Edit Environment Files

Update the appropriate .env file in the `Workload/` directory:

**For Development** (`Workload/.env.dev`):
```bash
WORKLOAD_VERSION=1.0.0
WORKLOAD_NAME=Org.YourWorkloadName
ITEM_NAMES=HelloWorld,CustomItem
FRONTEND_APPID=12345678-1234-1234-1234-123456789abc
FRONTEND_URL=http://localhost:60006/
LOG_LEVEL=debug
```

**For Staging** (`Workload/.env.test`):
```bash
WORKLOAD_VERSION=1.0.0
WORKLOAD_NAME=YourOrganization.YourWorkloadName
ITEM_NAMES=HelloWorld,CustomItem
FRONTEND_APPID=12345678-1234-1234-1234-123456789abc
FRONTEND_URL=https://your-staging-url.azurestaticapps.net/
LOG_LEVEL=info
```

**For Production** (`Workload/.env.prod`):
```bash
WORKLOAD_VERSION=1.0.0
WORKLOAD_NAME=YourOrganization.YourWorkloadName
ITEM_NAMES=HelloWorld,CustomItem
FRONTEND_APPID=12345678-1234-1234-1234-123456789abc
FRONTEND_URL=https://your-production-url.azurestaticapps.net/
# Update Workload Configuration - .env-Based System

## Process Overview

This guide provides instructions for updating Microsoft Fabric workload configuration using the simplified .env-based system. The configuration uses environment files as the single source of truth.

## 🏗️ Configuration Architecture

### Environment-Based Configuration

- **Environment Files**: `Workload/.env.dev`, `.env.test`, `.env.prod` - Primary configuration source
- **Templates**: `config/templates/` - Version-controlled templates with placeholders
- **Generated Files**: `build/Manifest/` and `build/DevGateway/` - Auto-generated from templates

### Key Benefits

- **Simplicity**: Standard .env format familiar to all developers
- **Environment Management**: Separate committed files for each deployment target
- **Template Processing**: Placeholders like `{{WORKLOAD_NAME}}` replaced during generation
- **Self-Contained**: All configuration lives with application code

## Step 1: Update Environment Configuration

### 1.1: Understand Environment File Generation

**Automated Generation**: If you ran `SetupWorkload.ps1`, environment files were automatically generated:
- **`.env.dev`** - Development configuration with localhost URLs and debug logging
- **`.env.test`** - Staging configuration with staging URLs and info logging  
- **`.env.prod`** - Production configuration with production URLs and warn logging

**Template Source**: Files are generated from `config/templates/Workload/.env` with placeholders replaced.

### 1.2: Edit Environment Files (Manual Updates)

Update the appropriate .env file in the `Workload/` directory:

**Development Configuration** (`Workload/.env.dev`):

```bash
WORKLOAD_VERSION=1.0.0
WORKLOAD_NAME=YourOrganization.YourWorkloadName
ITEM_NAMES=HelloWorld,CustomItem
FRONTEND_APPID=12345678-1234-1234-1234-123456789abc
FRONTEND_URL=http://localhost:60006/
LOG_LEVEL=debug
```

**Staging Configuration** (`Workload/.env.test`):

```bash
WORKLOAD_VERSION=1.0.0
WORKLOAD_NAME=YourOrganization.YourWorkloadName
ITEM_NAMES=HelloWorld,CustomItem
FRONTEND_APPID=12345678-1234-1234-1234-123456789abc
FRONTEND_URL=https://your-staging-url.azurestaticapps.net/
LOG_LEVEL=info
```

**Production Configuration** (`Workload/.env.prod`):

```bash
WORKLOAD_VERSION=1.0.0
WORKLOAD_NAME=YourOrganization.YourWorkloadName
ITEM_NAMES=HelloWorld,CustomItem
FRONTEND_APPID=12345678-1234-1234-1234-123456789abc
FRONTEND_URL=https://your-production-url.azurestaticapps.net/
LOG_LEVEL=warn
```

### 1.2: Configuration Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `WORKLOAD_VERSION` | Version of your workload | `1.0.0` |
| `WORKLOAD_NAME` | Unique workload identifier | `MyCompany.MyWorkload` |
| `ITEM_NAMES` | Comma-separated list of item names | `HelloWorld,CustomItem` |
| `FRONTEND_APPID` | Azure AD App ID for authentication | `12345678-1234-1234-1234-123456789abc` |
| `FRONTEND_URL` | Base URL for workload frontend | `http://localhost:60006/` |
| `LOG_LEVEL` | Logging level | `debug`, `info`, `warn`, `error` |

## Step 2: Apply Configuration Changes

### 2.1: Commit Environment Files

After updating .env files, commit them to version control:

```powershell
git add Workload/.env.dev Workload/.env.test Workload/.env.prod
git commit -m "Update workload configuration"
```

### 2.2: Developer Environment Setup

If workload name or fundamental settings changed, developers need to update their environment:

```powershell
# Each developer runs this to update their local DevGateway configuration
.\scripts\Setup\SetupDevEnvironment.ps1
```

## Step 3: Common Configuration Updates

### 3.1: Update Workload Name

When changing workload name, update all environment files:

```powershell
# Update all .env files with new workload name
(Get-Content Workload\.env.dev) -replace 'WORKLOAD_NAME=.*', 'WORKLOAD_NAME=NewCompany.NewWorkload' | Set-Content Workload\.env.dev
(Get-Content Workload\.env.test) -replace 'WORKLOAD_NAME=.*', 'WORKLOAD_NAME=NewCompany.NewWorkload' | Set-Content Workload\.env.test
(Get-Content Workload\.env.prod) -replace 'WORKLOAD_NAME=.*', 'WORKLOAD_NAME=NewCompany.NewWorkload' | Set-Content Workload\.env.prod
```

### 3.2: Add New Items

When adding new items, update the ITEM_NAMES variable:

```bash
# Before
ITEM_NAMES=HelloWorld

# After
ITEM_NAMES=HelloWorld,NewCustomItem
```

Then create the item configuration in `Workload/Manifest/items/NewCustomItem/`.

### 3.3: Update Frontend App ID

When changing Azure AD App registration:

```bash
# Update in all environment files
FRONTEND_APPID=new-app-id-here
```

### 3.4: Switch Base URLs for Deployment

For different deployment environments:

```bash
# Development
FRONTEND_URL=http://localhost:60006/

# Staging
FRONTEND_URL=https://staging-workload.azurestaticapps.net/

# Production  
FRONTEND_URL=https://prod-workload.azurestaticapps.net/
```

## Step 4: Template Updates

### 4.1: Update Item Templates

When modifying item configurations, update files in:

- `Workload/Manifest/items/[ItemName]/[ItemName]Item.xml` - Use placeholders like `{{WORKLOAD_NAME}}`
- `Workload/Manifest/items/[ItemName]/[ItemName]Item.json` - JSON configuration

### 4.2: Update General Workload Templates

Modify workload-level configuration:

- `Workload/Manifest/Product.json` - Workload metadata
- `Workload/Manifest/WorkloadManifest.xml` - Main manifest with placeholders

## Step 5: Validation and Testing

### 5.1: Validate Configuration

Check that all required variables are set:

```powershell
# Validate development environment
Get-Content Workload\.env.dev | Where-Object { $_ -match "^[A-Z_]+=.+" }

# Validate production environment  
Get-Content Workload\.env.prod | Where-Object { $_ -match "^[A-Z_]+=.+" }
```

### 5.2: Test Configuration

Test the updated configuration:

```powershell
# Start development server with updated config
.\scripts\Run\StartDevServer.ps1

# Start DevGateway with updated config
.\scripts\Run\StartDevGateway.ps1
```

## Step 6: Environment Switching

### 6.1: Switch Between Environments

For local testing of different environments:

```powershell
# Use development configuration (default)
Copy-Item Workload\.env.dev Workload\.env

# Use staging configuration
Copy-Item Workload\.env.test Workload\.env

# Use production configuration
Copy-Item Workload\.env.prod Workload\.env
```

### 6.2: Build for Specific Environment

During build/deployment, the appropriate .env file is used automatically based on the target environment.

## Quick Reference

### File Locations

- **Configuration**: `Workload/.env.dev`, `Workload/.env.test`, `Workload/.env.prod`
- **Templates**: `Workload/Manifest/` and `config/templates/Workload/`
- **Generated**: `build/Manifest/` and `build/DevGateway/` (not committed)

### Common Commands

```powershell
# Update developer environment after config changes
.\scripts\Setup\SetupDevEnvironment.ps1

# Start development with current configuration
.\scripts\Run\StartDevServer.ps1
.\scripts\Run\StartDevGateway.ps1

# Switch to production configuration locally
Copy-Item Workload\.env.prod Workload\.env
```

### Key Principles

1. **Edit .env files directly** - No complex scripts needed
2. **Commit all .env files** - Shared team configuration
3. **Use placeholders in templates** - `{{WORKLOAD_NAME}}` for environment-specific generation
4. **Run SetupDevEnvironment.ps1** - When fundamental settings change
5. **Test locally** - Copy appropriate .env file to test different environments

This simplified approach provides maximum flexibility with minimal complexity, making workload configuration management straightforward for all team members.
``` 
    "description": "Updated workload description",
    "version": "1.0.1",
    "organization": "YourOrganization",
    "workloadId": "YourWorkloadName"
  },
  "frontend": {
    "appId": "your-production-app-id",
    "baseUrl": "https://your-workload.azurestaticapps.net/",
    "developmentPort": 5173
  },
  "environment": {
    "development": {
      "workspaceGuid": "your-dev-workspace-guid",
      "debug": true,
      "logLevel": "debug"
    },
    "production": {
      "workspaceGuid": "your-prod-workspace-guid", 
      "debug": false,
      "logLevel": "error"
    }
  }
}
```

### 1.2: Validate Configuration Schema

The configuration file includes JSON schema validation:

```powershell
# The config.json automatically validates against config-schema.json
# VS Code and other editors will show validation errors
```

## Step 2: Generate Configuration Files

### 2.1: Use Quick Update Script (Recommended)

For workload name changes:

```powershell
# Update workload name and regenerate all files
.\scripts\Setup\UpdateWorkloadName.ps1 -WorkloadName "YourOrg.YourWorkload"

# Update with environment files
.\scripts\Setup\UpdateWorkloadName.ps1 -WorkloadName "YourOrg.YourWorkload" -UpdateEnvironmentFiles
```

### 2.2: Use Full Configuration Generator

For comprehensive updates:

```powershell
# Generate all configuration files
.\scripts\Setup\GenerateConfiguration.ps1

# Generate for specific environment
.\scripts\Setup\GenerateConfiguration.ps1 -Environment production

# Force regeneration of all files
.\scripts\Setup\GenerateConfiguration.ps1 -Force
```

## Step 3: Validate Configuration Consistency

### 3.1: Run Configuration Validation

```powershell
# Check configuration consistency  
.\scripts\Setup\ValidateConfiguration.ps1

# Automatically fix inconsistencies
.\scripts\Setup\ValidateConfiguration.ps1 -FixInconsistencies
```

### 3.2: Manual Validation

Verify key files contain correct values:

```powershell
# Check workload name consistency
Select-String -Path "config\Manifest\*.xml" -Pattern "YourOrg.YourWorkload"
Select-String -Path "config\DevGateway\*.json" -Pattern "YourOrg.YourWorkload"
Select-String -Path "Workload\.env*" -Pattern "WORKLOAD_NAME=YourOrg.YourWorkload"
```

## Step 4: Advanced Configuration Updates

### 4.1: Adding New Items

Add items to the shared configuration:

```json
{
  "items": [
    {
      "name": "HelloWorldItem",
      "displayName": "Hello World Item",
      "description": "Existing item",
      "iconPath": "assets/images/HelloWorldItem.svg"
    },
    {
      "name": "NewCustomItem",
      "displayName": "New Custom Item", 
      "description": "Newly added item",
      "iconPath": "assets/images/NewCustomItem.svg"
    }
  ]
}
```

Then regenerate configuration:

```powershell
.\scripts\Setup\GenerateConfiguration.ps1 -Force
```

### 4.2: Environment-Specific Updates

Update environment-specific settings:

```json
{
  "environment": {
    "development": {
      "workspaceGuid": "dev-workspace-guid",
      "debug": true,
      "logLevel": "debug"
    },
    "staging": {
      "workspaceGuid": "staging-workspace-guid",
      "debug": false, 
      "logLevel": "info"
    },
    "production": {
      "workspaceGuid": "prod-workspace-guid",
      "debug": false,
      "logLevel": "error"
    }
  }
}
```

Generate for specific environment:

```powershell
# Generate staging configuration
.\scripts\Setup\GenerateConfiguration.ps1 -Environment staging

# Generate production configuration  
.\scripts\Setup\GenerateConfiguration.ps1 -Environment production
```

### 4.3: Frontend Configuration Updates

Update frontend settings:

```json
{
  "frontend": {
    "appId": "new-app-id",
    "baseUrl": "https://new-domain.azurestaticapps.net/",
    "developmentPort": 3000
  }
}
```

## Step 5: Testing and Validation

### 5.1: Build and Test

After configuration updates:

```powershell
# Validate configuration
.\scripts\Setup\ValidateConfiguration.ps1

# Build manifest package
.\scripts\Build\BuildManifestPackage.ps1

# Test development environment
.\scripts\Run\StartDevGateway.ps1
.\scripts\Run\StartDevServer.ps1
```

### 5.2: Environment Testing

Test each environment configuration:

```powershell
# Test development environment
.\scripts\Setup\GenerateConfiguration.ps1 -Environment development
.\scripts\Run\StartDevGateway.ps1

# Test production environment (after proper setup)
.\scripts\Setup\GenerateConfiguration.ps1 -Environment production
.\scripts\Build\BuildRelease.ps1
```

## Usage

### Quick Commands for Common Updates

#### Update Workload Name
```powershell
# Single command to update workload name everywhere
.\scripts\Setup\UpdateWorkloadName.ps1 -WorkloadName "NewOrg.NewWorkload" -UpdateEnvironmentFiles -Force
```

#### Validate All Configuration
```powershell
# Check and fix all configuration issues
.\scripts\Setup\ValidateConfiguration.ps1 -FixInconsistencies
```

#### Switch Environments
```powershell
# Switch to production configuration
.\scripts\Setup\GenerateConfiguration.ps1 -Environment production

# Switch back to development
.\scripts\Setup\GenerateConfiguration.ps1 -Environment development
```

#### Complete Configuration Regeneration
```powershell
# Force regenerate everything
.\scripts\Setup\GenerateConfiguration.ps1 -Force
```

### Configuration File Relationships

The new system maintains these relationships automatically:

```text
Workload/.env.* (ENVIRONMENT CONFIGURATION)
       ↓
Workload/Manifest/ (TEMPLATES WITH TOKENS)
       ↓
build/Manifest/ (GENERATED - NOT COMMITTED)
build/DevGateway/ (GENERATED - NOT COMMITTED)  
```

### Troubleshooting

#### Issue: Configuration Inconsistency
**Solution**: Run validation and fix
```powershell
.\scripts\Setup\ValidateConfiguration.ps1 -FixInconsistencies
```

#### Issue: Missing Configuration Files
**Solution**: Regenerate all files
```powershell
.\scripts\Setup\GenerateConfiguration.ps1 -Force
```

#### Issue: Wrong Environment Active
**Solution**: Switch to correct environment
```powershell
.\scripts\Setup\GenerateConfiguration.ps1 -Environment development
```

#### Issue: Template Updates Not Applied
**Solution**: Force regeneration
```powershell
.\scripts\Setup\GenerateConfiguration.ps1 -Force
```

This enhanced template system ensures consistent configuration management across all Fabric workload components while maintaining a clean version control structure.

- **`scripts/Setup/Setup.ps1`**: Main setup script that orchestrates the entire process
- **`scripts/Setup/SetupWorkload.ps1`**: Handles workload-specific configuration and template processing

## Files Requiring Updates

When updating a workload name, the following files must be updated consistently:

### 1. Manifest Configuration Files (`build/Manifest/`)

#### `WorkloadManifest.xml`
```xml
<Workload WorkloadName="[Organization].[WorkloadId]" HostingType="FERemote">
```

#### Item Manifest Files (`*Item.xml`)
**All item XML files must be updated:**
- `HelloWorldItem.xml`
- `[ItemName].xml`
- Any custom item XML files

```xml
<Item TypeName="[Organization].[WorkloadId].[ItemName]" Category="Data">
  <Workload WorkloadName="[Organization].[WorkloadId]" />
</Item>
```

### 2. Environment Configuration Files (`Workload/`)

#### `.env.dev`
```bash
WORKLOAD_NAME=[Organization].[WorkloadId]
```

#### `.env.prod`
```bash
WORKLOAD_NAME=[Organization].[WorkloadId]
```

#### `.env.test`
```bash
WORKLOAD_NAME=[Organization].[WorkloadId]
```

### 3. Template Files (`Workload/Manifest/`)

Templates use placeholder tokens that get replaced during setup:

#### `WorkloadManifest.xml`
```xml
<Workload WorkloadName="{{WORKLOAD_NAME}}" HostingType="FERemote">
```

#### Item Template Files
```xml
<Item TypeName="{{WORKLOAD_NAME}}.[ItemName]" Category="Data">
  <Workload WorkloadName="{{WORKLOAD_NAME}}" />
</Item>
```

## Step-by-Step Update Process

### Method 1: Using Setup Scripts (Recommended)

1. **Prepare Parameters**:
   ```powershell
   $WorkloadName = "YourOrg.YourWorkloadId"
   ```

2. **Run Setup Script**:
   ```powershell
   .\scripts\Setup\Setup.ps1 -WorkloadName $WorkloadName -Force $true
   ```

3. **Verify Updates**: Check that all files have been updated with the new workload name

### Method 2: Manual Update Process

#### Step 1: Update Template Files
Update all template files in `Workload/Manifest/` to ensure future setup runs use correct values.

#### Step 2: Update Manifest Files
1. **Update `build/Manifest/WorkloadManifest.xml`**:
   ```xml
   <Workload WorkloadName="NewOrg.NewWorkloadId" HostingType="FERemote">
   ```

2. **Update all Item XML files** in `build/Manifest/`:
   - Find all `*Item.xml` files
   - Update `TypeName` and `WorkloadName` attributes:
   ```xml
   <Item TypeName="NewOrg.NewWorkloadId.ItemName" Category="Data">
     <Workload WorkloadName="NewOrg.NewWorkloadId" />
   </Item>
   ```

#### Step 3: Update Environment Files
Update all three environment files in `Workload/`:

1. **`.env.dev`**:
   ```bash
   WORKLOAD_NAME=NewOrg.NewWorkloadId
   ```

2. **`.env.prod`**:
   ```bash
   WORKLOAD_NAME=NewOrg.NewWorkloadId
   ```

3. **`.env.test`**:
   ```bash
   WORKLOAD_NAME=NewOrg.NewWorkloadId
   ```

#### Step 4: Rebuild and Test
1. **Build manifest package**:
   ```powershell
   .\scripts\Build\BuildManifestPackage.ps1
   ```

2. **Build application**:
   ```powershell
   cd Workload
   npm run build:test
   ```

3. **Test the workload**:
   ```powershell
   npm run start
   ```

## Validation Checklist

After updating the workload name, verify these items:

### Configuration Consistency
- [ ] `WorkloadManifest.xml` contains the new workload name
- [ ] All `*Item.xml` files use the new workload name in both `TypeName` and `WorkloadName`
- [ ] All three `.env` files contain the updated `WORKLOAD_NAME`
- [ ] Template files use `{{WORKLOAD_NAME}}` placeholders correctly

### Build Validation
- [ ] Manifest package builds successfully
- [ ] Frontend application builds without errors
- [ ] No references to old workload name in generated files

### Runtime Validation
- [ ] Workload appears with correct name in Fabric
- [ ] Items can be created and edited successfully
- [ ] No console errors related to workload identification

## Common Issues and Troubleshooting

### Issue: Workload Not Recognized
**Symptoms**: Workload doesn't appear in Fabric or shows as unregistered
**Solutions**:
- Verify `WorkloadManifest.xml` has correct `WorkloadName`
- Ensure environment variables are updated
- Rebuild manifest package
- Restart dev gateway

### Issue: Items Not Loading
**Symptoms**: Items show errors or don't load in editor
**Solutions**:
- Check that all `*Item.xml` files have matching `WorkloadName`
- Verify `TypeName` follows correct pattern: `[Organization].[WorkloadId].[ItemName]`
- Ensure frontend routes match item configurations

### Issue: Template Replacement Failures
**Symptoms**: Setup script fails or generates files with placeholder tokens
**Solutions**:
- Verify template files contain correct `{{WORKLOAD_NAME}}` tokens
- Check that `SetupWorkload.ps1` replacement dictionary includes all required tokens
- Run setup script with `-Force $true` to overwrite existing files

### Issue: Environment Mismatch
**Symptoms**: Different behavior between development and production
**Solutions**:
- Ensure all three `.env` files have the same `WORKLOAD_NAME` value
- Verify the workload name matches between manifest and environment files
- Check that the correct environment file is being used for each build

## Best Practices

### Development Workflow
1. **Always use "Org" organization** for development and testing
2. **Test thoroughly** before changing to production organization name
3. **Use setup scripts** rather than manual updates when possible
4. **Version control** all configuration changes

### Production Deployment
1. **Register organization name** with Microsoft before production deployment
2. **Update organization name** only when ready for production
3. **Test in staging environment** with production organization name
4. **Document organization name** requirements for future developers

### Naming Conventions
1. **Organization names** should be meaningful and registered
2. **WorkloadId** should be descriptive and unique within organization
3. **Avoid special characters** in workload names (use letters, numbers, periods only)
4. **Use PascalCase** for WorkloadId portion

## Integration with CI/CD

### Environment Variables
Configure build pipelines to use environment-specific workload names:

```yaml
variables:
  - name: WORKLOAD_NAME_DEV
    value: "Org.MyWorkload"
  - name: WORKLOAD_NAME_PROD  
    value: "ContosoInc.MyWorkload"
```

### Automated Deployment
Use setup scripts in deployment pipelines:

```yaml
- task: PowerShell@2
  inputs:
    filePath: 'scripts/Setup/Setup.ps1'
    arguments: '-WorkloadName $(WORKLOAD_NAME) -Force $true'
```

This comprehensive approach ensures that workload name updates are applied consistently across all required files and configurations, maintaining the integrity of the Fabric workload throughout the development and deployment lifecycle.
