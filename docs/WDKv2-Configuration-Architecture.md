# Final Simplified Configuration Architecture

## ✅ Pure .env-Based Configuration

We have successfully simplified the Microsoft Fabric Workload Development Kit (WDK) v2 configuration to use only .env files.

## 🏗️ Final Architecture

### Configuration Structure
```text
Workload/
├── .env.dev                  # Development configuration (COMMITTED)
├── .env.test                 # Staging configuration (COMMITTED)
├── .env.prod                 # Production configuration (COMMITTED)
├── app/                      # Application code
└── Manifest/                 # Workload and item configuration templates (COMMITTED)
    ├── Product.json          # General workload configuration and metadata
    ├── WorkloadManifest.xml  # General workload manifest configuration
    ├── *.xsd                 # Schema definition files
    ├── assets/               # Workload assets (icons, images)
    └── items/                # Per-item configuration folder
        └── [ItemName]/       # Individual item folder (e.g., HelloWorld/)
            ├── [ItemName]Item.json    # Fabric JSON config (e.g., HelloWorldItem.json)
            ├── [ItemName]Item.xml     # Fabric XML config (e.g., HelloWorldItem.xml)
            └── ItemDefinition/        # Item schemas and structure definitions (COMMITTED)
                ├── schemas/           # JSON/XML schemas for validation
                └── structure/         # Item structure definitions

config/
└── templates/
    └── Workload/.env         # Setup template (used once during project setup)

build/                        # All build resources generated on-demand (NOT COMMITTED)
├── Frontend/                 # Built frontend code ready for deployment
├── DevGateway/              # Generated DevGateway configuration and files  
│   ├── workload-dev-mode.json  # Generated DevGateway config
│   └── [other DevGateway files]
└── Manifest/                # Built manifest files and packages
    ├── temp/                # Temporary processed manifest files
    └── [WorkloadName].[Version].nupkg  # Generated NuGet package for deployment
``` 
```

## 🚀 Workflow

### 1. Initial Project Setup (Once per project)
```powershell
.\scripts\Setup\SetupWorkload.ps1
```
- Prompts for workload name and frontend app ID
- Generates .env.dev, .env.test, .env.prod files
- These files are committed to the repository
- No shared config files needed after this

### 2. Developer Environment Setup (Each developer)
```powershell
.\scripts\Setup\SetupDevEnvironment.ps1
```
- Reads configuration from .env.dev
- Prompts for developer's workspace GUID
- Generates local DevGateway configuration
- No dependency on shared config files

### 3. Daily Development
```powershell
# Start development
.\scripts\Run\StartDevServer.ps1     # Uses .env.dev 
.\scripts\Run\StartDevGateway.ps1    # Uses generated DevGateway config
```

### 4. Build and Deployment
```powershell
# Build frontend application
.\scripts\Build\BuildFrontend.ps1 -Environment dev

# Build manifest package - this is done automatically every time the DevGateway is started or the DevServer gets a request to provide the manifest
.\scripts\Build\BuildManifestPackage.ps1 -Environment prod

# Complete build for deployment
.\scripts\Build\BuildAll.ps1 -Environment prod
```

All build outputs are generated in the `build/` directory and are environment-specific based on the corresponding `.env.*` file.

## 🏗️ Build Architecture

### On-Demand Generation
All build artifacts are generated on-demand from source templates and configuration:

- **Frontend Build**: Application code compiled and bundled for deployment
- **DevGateway Config**: Generated configuration based on environment variables and workspace settings
- **Manifest Package**: NuGet package created from templates with environment-specific variable replacement
- **No Static Config**: No pre-generated configuration files are stored in the repository

### Environment-Specific Builds
Each build target uses the appropriate `.env.*` file:
- **Development**: Uses `.env.dev` → `build/` outputs for local testing
- **Test/Staging**: Uses `.env.test` → `build/` outputs for staging deployment  
- **Production**: Uses `.env.prod` → `build/` outputs for production deployment

### Build Dependencies
- **Source**: `Workload/app/` and `Workload/Manifest/` templates
- **Configuration**: Environment-specific `.env.*` files
- **Output**: Complete deployment artifacts in `build/` directory

## 📁 Configuration Management

### What Gets Committed

- ✅ `Workload/.env.dev` - All team members use this for development
- ✅ `Workload/.env.test` - Staging environment configuration
- ✅ `Workload/.env.prod` - Production environment configuration
- ✅ `Workload/.env.template` - Setup template for project initialization
- ✅ `Workload/Manifest/` - All manifest templates and item configurations
- ✅ `Workload/app/` - Application source code

## 📦 Item Management

### Per-Item Configuration

Each Fabric item has its own folder containing:

- **Fabric Configuration**: JSON/XML files required by Microsoft Fabric
- **Item Definition**: Schemas and structure definitions specific to that item type

### Item Structure Example

```text
Workload/Manifest/items/HelloWorld/
├── HelloWorldItem.json          # Fabric JSON configuration
├── HelloWorldItem.xml           # Fabric XML template with placeholders (e.g., {{WORKLOAD_NAME}})
└── ItemDefinition/              # Item-specific schemas and structure
    ├── schemas/
    │   ├── HelloWorldItem.xsd   # XML schema validation
    │   └── HelloWorldItem.json  # JSON schema validation
    └── structure/
        ├── structure.md         # Item structure documentation
        └── requirements.md      # Implementation requirements
```

### Template Processing and Environment Management

The configuration system uses template processing for environment-specific manifests:

- **XML Templates**: Item XML files contain placeholders like `{{WORKLOAD_NAME}}` that are replaced during manifest generation
- **Environment-Specific Generation**: Placeholders are replaced with values from the appropriate .env file (dev/test/prod)
- **Build-Time Processing**: Manifest generation reads environment variables and processes all template files
- **Example**: `{{WORKLOAD_NAME}}` becomes the actual workload name from `.env.dev` when building development manifests

### General Workload Configuration

The workload has general configuration files:

- **Product.json**: Workload metadata, display names, descriptions, and general settings
- **WorkloadManifest.xml**: Main workload manifest with authentication and service configuration (also uses placeholders)
- ***.xsd**: Schema definition files for validation

### Schema and Structure Management

- **Naming Convention**: Item files follow [ItemName]Item naming pattern (e.g., HelloWorldItem.json, HelloWorldItem.xml)
- **Template Files**: XML files use placeholders that are replaced during manifest generation
- **Schemas**: Item-specific validation schemas stored in `items/[ItemName]/ItemDefinition/schemas/`
- **Structure**: Item architecture and requirements stored in `items/[ItemName]/ItemDefinition/structure/`
- **Version Control**: All ItemDefinition contents are committed for team sharing
- **Validation**: Each item maintains its own validation rules and documentation

### What Stays Local (Generated on Build)

- ❌ `build/Frontend/` - Built frontend application ready for deployment
- ❌ `build/DevGateway/` - Generated DevGateway configuration and runtime files
- ❌ `build/Manifest/` - Processed manifest files and NuGet packages
- ❌ `build/Manifest/[WorkloadName].[Version].nupkg` - Final deployment package

All files in the `build/` directory are generated on-demand from templates and should not be committed to version control.

### Configuration Changes

- **Environment settings**: Edit .env files directly and commit
- **New environments**: Copy existing .env file, modify, and commit
- **Item configurations**: Add/modify files in Workload/Manifest/items/[ItemName]/ and commit
- **Developer workspace**: Run SetupDevEnvironment.ps1 again
- **Build artifacts**: Run build scripts to regenerate all files in build/ directory

## 🎯 Key Benefits

1. **Self-Contained**: All configuration lives with the application code
2. **Standard Format**: .env files are universally understood
3. **Simple Workflow**: Two setup steps, then normal development
4. **No Dependencies**: After setup, no external config files needed
5. **Environment Clarity**: Each deployment target has its own committed file
6. **Direct Editing**: Developers can modify .env files without complex scripts

## 💡 Example .env File Structure

```bash
# Workload/.env.dev
WORKLOAD_VERSION=1.0.0
WORKLOAD_NAME=MyCompany.MyWorkload
ITEM_NAMES=HelloWorld,CustomItem
FRONTEND_APPID=12345678-1234-1234-1234-123456789abc
FRONTEND_URL=http://localhost:60006/
LOG_LEVEL=debug
```

This architecture achieves the original goal: **"all the configuration is done in the env files after the setup"** - providing a clean, simple, and maintainable configuration system for Microsoft Fabric Workload development.
