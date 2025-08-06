# Configurationconfig/
├── templates/
│   ├── Workload/.env         # Template for .env files (used during setup)
│   └── Manifest/             # Workload and item configuration templates (COMMITTED)
│       ├── Product.json      # General workload configuration and metadata
│       ├── WorkloadManifest.xml  # General workload manifest configuration
│       ├── *.xsd             # Schema definition files
│       ├── assets/           # Workload assets (icons, images)
│       └── items/            # Per-item configuration folder
│           └── [ItemName]/   # Individual item folder (e.g., HelloWorld/)
│               ├── [ItemName]Item.json    # Fabric JSON config (e.g., HelloWorldItem.json)
│               ├── [ItemName]Item.xml     # Fabric XML config (e.g., HelloWorldItem.xml)
│               └── ItemDefinition/        # Item schemas and structure definitions (COMMITTED)
│                   ├── schemas/           # JSON/XML schemas for validation
│                   └── structure/         # Item structure definitionst

## Simplified .env-Based Approach

The configuration system uses .env files in the Workload directory as the ONLY configuration source. After initial setup, all configuration is managed through these .env files.

## Structure Overview

```text
Workload/
├── .env.dev                  # Development environment (COMMITTED)
├── .env.test                 # Staging environment (COMMITTED)
├── .env.prod                 # Production environment (COMMITTED)
└── app/                      # Application code

config/
├── templates/
│   ├── Workload/.env         # Template for initial setup only
│   └── Manifest/             # Item configuration templates (COMMITTED)
│       └── [ItemName]/       # Per-item configuration folder
│           ├── *.json        # Fabric JSON configuration files
│           ├── *.xml         # Fabric XML configuration files
│           └── ItemDefinition/   # Item schemas and structure definitions (COMMITTED)
│               ├── schemas/      # JSON/XML schemas for validation
│               └── structure/    # Item structure definitions
├── DevGateway/              # Generated DevGateway config (NOT COMMITTED)
├── Manifest/                # Generated manifest files (NOT COMMITTED)
└── README.md               # This documentation
```

## Two-Step Setup Process

### Step 1: Project Setup (Run Once)

When initially setting up the project:

```powershell
.\scripts\Setup\SetupWorkload.ps1
```

This script will:

- Prompt for workload name (e.g., MyCompany.MyWorkload)
- Prompt for Frontend Application ID (Azure AD App ID)
- Generate .env.dev, .env.test, and .env.prod files in Workload directory
- These .env files should be committed to the repository
- No ongoing dependency on config files after this step

### Step 2: Developer Environment Setup (Each Developer)

Each developer who clones the repository should run:

```powershell
.\scripts\Setup\SetupDevEnvironment.ps1
```

This script will:

- Read configuration from the existing .env.dev file
- Prompt for a development workspace GUID (Fabric workspace ID)
- Generate DevGateway configuration for local development
- Set up manifest files
- Configure individual developer environment

## Item Management

### Adding New Items

To add a new item to your workload:

1. **Create item folder**: Create a new folder in `config/templates/Manifest/items/[YourItemName]/`
2. **Add Fabric configuration files**:
   - Create `[YourItemName]Item.json` in the item folder
   - Create `[YourItemName]Item.xml` in the item folder (use placeholders like `{{WORKLOAD_NAME}}` for environment-specific values)
3. **Update item definitions** (if needed):
   - Add schemas to `config/templates/Manifest/items/[YourItemName]/ItemDefinition/schemas/`
   - Add structure definitions to `config/templates/Manifest/items/[YourItemName]/ItemDefinition/structure/`
4. **Update .env files**: Add your item name to the `ITEM_NAMES` variable in the appropriate .env files
5. **Commit all changes**: The item configuration and definitions should be committed to the repository

### Item Configuration Structure

Each item should follow this structure:

```text
config/templates/Manifest/items/
└── YourItemName/                    # Example: HelloWorld/
    ├── YourItemNameItem.json        # Example: HelloWorldItem.json - Fabric JSON configuration
    ├── YourItemNameItem.xml         # Example: HelloWorldItem.xml - Fabric XML template with placeholders
    └── ItemDefinition/              # Item-specific schemas and structure definitions
        ├── schemas/
        │   ├── YourItemNameItem.xsd     # XML schema validation
        │   └── YourItemNameItem.json    # JSON schema validation
        └── structure/
            ├── structure.md             # Item structure documentation
            └── requirements.md          # Implementation requirements
```

### Template Processing

The XML files in item folders are templates that use placeholders:

- **Placeholders**: Use `{{WORKLOAD_NAME}}` and other environment variables in XML files
- **Environment-Specific**: Placeholders are replaced during manifest generation based on target environment
- **Example**: `{{WORKLOAD_NAME}}` is replaced with value from `.env.dev`, `.env.test`, or `.env.prod`
- **Processing**: Manifest generation reads appropriate .env file and replaces all placeholders

#### Example XML Template

```xml
<?xml version='1.0' encoding='utf-8'?>
<ItemManifestConfiguration SchemaVersion="2.0.0">
  <Item TypeName="{{WORKLOAD_NAME}}.HelloWorld" Category="Data">
    <Workload WorkloadName="{{WORKLOAD_NAME}}" />
  </Item>
</ItemManifestConfiguration>
```

### General Workload Configuration

The following files in `config/templates/Manifest/` hold general workload configuration:

- **Product.json**: Workload metadata, display names, descriptions, and general settings
- **WorkloadManifest.xml**: Main workload manifest with authentication and service configuration
- ***.xsd**: Schema definition files for validation

### Item Configuration Benefits

- **Version Controlled**: All item configurations are committed and shared
- **Structured Organization**: Each item has its own dedicated folder
- **Schema Validation**: Item-specific schemas ensure configuration consistency for each item type
- **Documentation**: Each item has its own structure definitions and documentation
- **Template Processing**: Item configurations support environment-specific token replacement

## Development Workflow

### Starting Development

```powershell
# 1. Ensure your development environment is set up
.\scripts\Setup\SetupDevEnvironment.ps1

# 2. Start the development server
.\scripts\Run\StartDevServer.ps1

# 3. Start the DevGateway (in a separate terminal)
.\scripts\Run\StartDevGateway.ps1
```

### Switching Environments

The Workload directory contains environment-specific .env files:

- `.env.dev` - Development configuration
- `.env.test` - Staging/Test configuration  
- `.env.prod` - Production configuration

Your application should load the appropriate .env file based on your deployment target.

### Updating Configuration

To update the workload configuration:

1. **For project-wide changes**: Modify the values directly in the appropriate .env file and commit
2. **For adding new environments**: Copy an existing .env file and modify as needed
3. **For individual developer settings**: Run `SetupDevEnvironment.ps1` with new parameters

## File Management

### What's Committed to Git

- `Workload/.env.dev` - Development environment configuration
- `Workload/.env.test` - Staging environment configuration
- `Workload/.env.prod` - Production environment configuration
- `config/templates/Workload/.env` - Template for initial setup only
- `config/templates/Manifest/Product.json` - General workload configuration and metadata (COMMITTED)
- `config/templates/Manifest/WorkloadManifest.xml` - General workload manifest configuration (COMMITTED)
- `config/templates/Manifest/items/[ItemName]/` - Per-item Fabric configuration files (JSON/XML) following [ItemName]Item naming (COMMITTED)
- `config/templates/Manifest/items/[ItemName]/ItemDefinition/` - Item-specific schemas and structure definitions (COMMITTED)

### What's Generated (Not Committed)

- `config/DevGateway/` - Individual developer DevGateway configuration
- `config/Manifest/` - Generated manifest files from templates

### Individual Developer Settings

Each developer configures their own:
- Development workspace GUID (Fabric workspace ID)
- Local DevGateway settings

## Benefits of This Approach

- **Self-Contained**: All configuration in the Workload directory with the app
- **Familiar**: .env files are a standard pattern developers know
- **Simple**: Two clear steps - project setup, then developer setup
- **No Dependencies**: After setup, no external config files needed
- **Flexible**: Direct editing of .env files for configuration changes
- **Deployment Ready**: Environment-specific configurations ready for any deployment target

## Troubleshooting

### Common Issues

1. **Missing .env files**: Run `SetupWorkload.ps1` to generate them
2. **DevGateway not working**: Run `SetupDevEnvironment.ps1` with your workspace GUID
3. **Configuration out of sync**: Check that you're using the correct .env file for your environment

### Environment Variables

Individual developers can set these environment variables for customization:
- `DEV_WORKSPACE_GUID` - Your development workspace GUID (saved automatically by SetupDevEnvironment.ps1)
