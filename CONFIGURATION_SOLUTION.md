# Solution: WDK v2 .env-Based Configuration System

## 🎯 **Problem Solved**

The original Microsoft Fabric WDK had several configuration management challenges:

1. **Configuration Scattered** across multiple file formats and locations
2. **Manual Synchronization** required between .env files and manifest XML files
3. **Git Version Control** conflicts with generated vs. source files
4. **Environment Management** complexity for dev/test/prod deployments
5. **Template Processing** needed for placeholder replacement

## ✅ **WDK v2 Solution Implemented**

### **1. .env-Based Configuration System**

**Structure:**
```text
Workload/
├── .env.dev                    # COMMITTED - Development configuration
├── .env.test                   # COMMITTED - Test/staging configuration  
├── .env.prod                   # COMMITTED - Production configuration
├── .env.template              # COMMITTED - Template for new environments
├── Manifest/                   # COMMITTED - Templates with placeholders
│   ├── WorkloadManifest.xml   # Main workload template
│   ├── Product.json           # Product configuration template
│   ├── assets/                # Asset templates
│   │   ├── images/            # Item icons
│   │   └── locales/           # Localization files
│   └── items/                 # Item-specific templates
│       ├── HelloWorld/        # Sample item templates
│       │   ├── HelloWorldItem.xml
│       │   └── HelloWorldItem.json
│       └── [ItemName]/        # Custom item templates
│           ├── [ItemName]Item.xml
│           └── [ItemName]Item.json
├── app/                       # Application source code
build/                         # GENERATED - Not committed
├── Manifest/                  # Generated manifest files
└── DevGateway/               # Generated DevGateway config
```

**Key Principles:**
- **Source vs. Generated**: Clear separation between templates (committed) and generated files (not committed)
- **Environment-Specific**: Separate .env files for each deployment target
- **Template Processing**: Placeholders like `{{WORKLOAD_NAME}}` replaced during build
- **On-Demand Generation**: All artifacts generated from templates during build process

### **2. Enhanced Scripts for WDK v2**

#### **SetupWorkload.ps1**
- Creates environment-specific .env files from templates
- Processes all Workload/Manifest/ templates with placeholder replacement
- Sets up complete development environment
- Includes safety checks to prevent overwriting existing configurations

#### **BuildManifestPackage.ps1**
- Builds manifest packages from templates for specific environments
- Copies templates from Workload/Manifest/ to build/Manifest/temp/
- Replaces all placeholders like `{{WORKLOAD_NAME}}` with environment values
- Generates environment-specific manifest packages
- Validates processed files for consistency

#### **CreateNewItem.ps1**
- Creates new item templates in Workload/Manifest/items/[ItemName]/
- Copies from existing item templates (e.g., HelloWorld)
- Preserves {{WORKLOAD_NAME}} placeholders for build-time replacement
- Provides clear guidance on updating ITEM_NAMES in .env files

### **3. .gitignore Strategy for WDK v2**

**What's Committed:**
```text
✅ Workload/.env.dev           # Development environment configuration
✅ Workload/.env.test          # Test environment configuration  
✅ Workload/.env.prod          # Production environment configuration
✅ Workload/.env.template      # Template for new environments
✅ Workload/Manifest/          # Template files with placeholders
✅ Workload/app/               # Application source code
❌ build/                      # Generated files (all contents)
❌ Workload/.env               # Active environment file (generated)
```

**Benefits:**

- No merge conflicts on generated files
- Templates are version controlled with clear separation
- Environment-specific configurations managed cleanly
- Build-centric approach eliminates repository clutter

### **4. Configuration Relationships in WDK v2**

**Automatic Build-Time Processing:**

- `.env` files → Template processing → `build/Manifest/` files
- Environment selection → Appropriate .env file → Generated manifests
- ITEM_NAMES variable → Controls which items are included in builds
- Template placeholders → Replaced with environment-specific values

## 🚀 **How to Use WDK v2 System**

### **For New Users (Setup)**

```powershell
# 1. Clone repository (includes templates and .env files)
git clone repo

# 2. Update environment configuration for your workload
# Edit Workload/.env.dev with your settings

# 3. Setup development environment  
.\scripts\Setup\SetupWorkload.ps1

# 4. Start development
.\scripts\Run\StartDevServer.ps1
.\scripts\Run\StartDevGateway.ps1
```

### **For Existing Users (Migration)**

```powershell
# 1. Backup current configuration values
# Save your existing workload settings

# 2. Update .env files with your current values
# Edit Workload/.env.dev, .env.test, .env.prod

# 3. Re-setup environment
.\scripts\Setup\SetupWorkload.ps1 -Force

# 4. Validate everything works
npm run build:test
```

### **For Configuration Updates**

```powershell
# Update environment-specific settings
# Edit appropriate .env file (dev/test/prod)

# Build with updated configuration
.\scripts\Build\BuildManifestPackage.ps1 -Environment dev

# Or setup workload with new configuration
.\scripts\Setup\SetupWorkload.ps1

# For new items, update ITEM_NAMES in all .env files
# Then rebuild
```

## 🎉 **WDK v2 Benefits Achieved**

### **✅ Version Control Issues Solved**

- Only source files and templates committed
- Generated files clearly separated in build/ directory
- No local file conflicts with .env-based configuration
- Clean repository history

### **✅ Configuration Consistency Guaranteed**

- Environment files as single source of truth
- Template processing ensures consistency
- Build-time validation prevents mismatched settings
- Environment-specific configurations properly isolated

### **✅ Maintainability Improved**

- Update .env files, rebuild automatically applies everywhere
- Template-based approach scales to new items easily
- Clear separation of concerns between templates and generated files
- Automated scripts reduce configuration errors

### **✅ User Experience Enhanced**

- Familiar .env file format for all developers
- Clear error messages and guidance
- Automated item creation with proper warnings
- Comprehensive documentation and AI tooling support

## 🔄 **Migration Path to WDK v2**

1. **Understand New Structure**: Review the .env-based configuration system
2. **Update Environment Files**: Configure your settings in Workload/.env.dev, .env.test, .env.prod
3. **Update ITEM_NAMES**: Ensure all your custom items are listed in the ITEM_NAMES variable
4. **Test Build Process**: Run BuildManifestPackage.ps1 to verify template processing
5. **Update Development Workflow**: Use new scripts for setup and build processes
6. **Commit Changes**: Commit .env files and Workload/Manifest/ templates (build/ directory remains ignored)

This WDK v2 solution provides a robust, scalable configuration management system that eliminates version control conflicts while ensuring consistency across all deployment environments!
