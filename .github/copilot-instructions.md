# AI Tool Guidance for Microsoft Fabric Workload Development Kit

## 🤖 Fabric AI Agent

This repository includes a specialized **Fabric AI Agent** configured for comprehensive Microsoft Fabric development assistance. The agent combines public platform knowledge with project-specific patterns.

### Agent Activation
Use `@fabric` or these keywords to activate specialized assistance:
- `fabric workload` - WDK-specific development help
- `fabric item` - Item creation and management  
- `fabric auth` - Authentication and security patterns
- `fabric api` - API integration guidance
- `fabric deploy` - Deployment and operations

### Knowledge Integration
The agent leverages:
- **Public Knowledge**: Complete Microsoft Fabric platform understanding
- **Project Context**: `.ai/context/` files and current implementation patterns
- **WDK Expertise**: Workload Development Kit patterns and best practices

### Specialized Capabilities
- 🏗️ **Architecture & Design**: Workload patterns and platform integration
- 🔧 **Development Support**: TypeScript/React component generation with Fluent UI
- 📊 **Data Integration**: OneLake, Power BI, and cross-workload patterns
- 🔐 **Security Implementation**: OAuth, Entra ID, and compliance patterns
- 🚀 **Operations**: CI/CD, deployment, and troubleshooting guidance

## 🎯 Repository Overview

This repository contains the Microsoft Fabric Workload Development Kit (WDK v2) - a comprehensive sample and framework for building custom workloads that integrate with the Microsoft Fabric platform. This guide provides AI tools with essential context, conventions, and procedures for effectively working with this codebase.

## 📁 Repository Structure

```text
Microsoft-Fabric-workload-development-sample/
├── .ai/                          # AI-specific documentation and commands
│   ├── commands/                 # Task-specific automation guides
│   │   ├── item/                 # Item creation and management
│   │   ├── workload/             # Workload operations (run, update, publish)
│   │   └── README.md             # Commands overview
│   └── context/                  # Domain knowledge for AI tools
│       ├── fabric.md             # Microsoft Fabric platform context
│       ├── fabric_workload.md    # Project-specific structure guide
│       ├── react.md              # React/TypeScript development context
│       └── typescript.md         # TypeScript conventions
├── Workload/                     # Frontend React/TypeScript application
│   ├── app/                      # Main application source code
│   │   ├── clients/              # Clients for APIs can go here. By default Fabric API is implemented
│   │   │── controller/           # Dedicated controller wrappers for the UX 
│   │   │── controls/             # Common ux controls that should be shared between items
│   │   │── items/                # Every item in a seperate subfolder with all it's components and dependencies
│   │   ├── playground/           # Demo/learning examples (deletable)
│   │   └── samples/              # Reference implementations  (deletable)
│   ├── devServer/                # Development server configuration
│   ├── package.json              # Node.js dependencies and scripts
│   └── .env.*                    # Environment configurations
├── config/                       # Workload configuration
│   ├── Manifest/                 # Workload and item definitions
│   │   ├── WorkloadManifest.xml  # Main workload configuration
│   │   ├── Product.json          # Frontend metadata
│   │   ├── *Item.xml             # Item type definitions
│   │   └── assets/               # Icons, translations, etc.
│   ├── DevGateway/               # Development gateway config
│   └── templates/                # Template files for setup scripts
├── scripts/                      # PowerShell automation scripts
│   ├── Build/                    # Build and package scripts
│   ├── Deploy/                   # Deployment automation
│   ├── Run/                      # Development server scripts
│   └── Setup/                    # Initial setup and configuration
├── release/                      # Built artifacts (generated)
├── tools/                        # Development tools and utilities
└── docs/                         # Project documentation
```

## 🔄 Project Awareness & Context

### Mandatory Reading Before Any Task

1. **Always read** `.ai/context/fabric_workload.md` to understand project structure and conventions
2. **Check** `.ai/context/fabric.md` for Microsoft Fabric platform context
3. **Review** `.ai/commands/` directory for available automation tasks
4. **Understand** the dual nature: `Workload/` (implementation) + `config/Manifest/` (configuration)

### Core Architecture Principles

- **Workload Structure**: `[Organization].[WorkloadId]` naming convention
- **Item Relationship**: Each `Workload/app/items/[ItemName]/` maps to `config/Manifest/[ItemName]Item.xml`
- **Environment Separation**: Development ("Org") vs Production (registered organization name)
- **Script-Driven**: Use PowerShell scripts in `scripts/` for automation

### Key Relationships

- **Frontend ↔ Manifest**: Item implementations must match manifest definitions
- **Development ↔ Production**: Organization name changes from "Org" to registered name
- **Build Process**: `scripts/Build/` creates deployable artifacts in `release/`

## 🧱 Code Structure & Modularity

### Workload Item Structure (Mandatory Pattern)
Every workload item must have exactly these four components in `Workload/app/items/[ItemName]Item/`:

```typescript
[ItemName]ItemModel.ts        // Data interface and state definition
[ItemName]ItemEditor.tsx      // Main editor component
[ItemName]ItemEditorEmpty.tsx // Empty state/initial setup UI
[ItemName]ItemEditorRibbon.tsx// Toolbar and navigation
```

### File Organization Rules
- **Customer Code**: Place all custom implementations in `Workload/app/`
- **Item Implementations**: Use PascalCase naming: `MyCustomItem`
- **Manifest Files**: XML and JSON files in `config/Manifest/` must match item names
- **Asset Management**: Icons in `config/Manifest/assets/images/`, translations in `locales/`

### Import and Dependency Guidelines
- **Fabric Integration**: Always use `@ms-fabric/workload-client` for platform integration
- **UI Framework**: Use `@fluentui/react` and `@fluentui/react-components` for consistency
- **State Management**: Use `@reduxjs/toolkit` and `react-redux` patterns
- **Routing**: Use `react-router-dom` for navigation

## 🔧 Development Workflow

### Environment Setup Process
1. **Run Setup**: Use `scripts/Setup/Setup.ps1` with appropriate parameters
2. **Install Dependencies**: `npm install` in `Workload/` directory
3. **Configure Environment**: Update `.env.*` files with correct values
4. **Build Manifest**: Run `scripts/Build/BuildManifestPackage.ps1`

### Development Server Startup
```powershell
# Terminal 1: Start Development Gateway
.\scripts\Run\StartDevGateway.ps1

# Terminal 2: Start Development Server
.\scripts\Run\StartDevServer.ps1
```

### Build and Release Process
```powershell
# Build for testing
.\scripts\Build\BuildRelease.ps1 -WorkloadName "Org.TestWorkload"

# Build for production
.\scripts\Build\BuildRelease.ps1 -WorkloadName "YourOrg.YourWorkload" -AADFrontendAppId "prod-app-id"
```

## 📋 Task Completion Guidelines

### Before Starting Any Task
- **Identify Task Type**: Item creation, workload management, or configuration update
- **Check Dependencies**: Ensure setup is complete and environment is configured
- **Verify Context**: Read relevant `.ai/context/` files for domain knowledge
- **Review Examples**: Use `clients/`, `controller/`,`items/`, `playground/` and `samples/` as reference patterns

### Task Categories and Approaches

#### Item Creation Tasks
1. **Read**: `.ai/commands/item/create.md` for complete process
2. **Create**: Four required components (Model, Editor, Empty, Ribbon)
3. **Configure**: Add XML and JSON manifest files
4. **Route**: Update `App.tsx` with new route
5. **Assets**: Add icon and translations
6. **Test**: Verify item creation and editing functionality

#### Workload Management Tasks
1. **Name Updates**: Use `.ai/commands/workload/update.md` guidance
2. **Running**: Follow `.ai/commands/workload/run.md` startup process
3. **Build**: Reference `.ai/commands/workload/build.md` for building
4. **Deploy**: Reference `.ai/commands/workload/deploy.md` for deployment
5. **Publishing**: Reference `.ai/commands/workload/publish.md` for publishing

#### Configuration Tasks
- **Always update both**: Implementation files AND manifest files
- **Maintain consistency**: Between XML, JSON, and environment files
- **Test changes**: Using development server before deployment

### Completion Verification
- [ ] All required files created/updated
- [ ] Build scripts run without errors
- [ ] Development server starts successfully
- [ ] Functionality tested in browser
- [ ] No console errors or warnings
- [ ] Documentation updated if needed

## 📎 Style & Conventions

### TypeScript/React Standards
- **Type Safety**: Always use TypeScript interfaces and type annotations
- **Component Structure**: Follow functional component patterns with hooks
- **State Management**: Use Redux Toolkit patterns for complex state
- **Error Handling**: Implement proper error boundaries and user feedback

### Naming Conventions
```typescript
// Item Types
interface [ItemName]ItemDefinition { }
export function [ItemName]ItemEditor(props: PageProps) { }

// File Names
[ItemName]ItemModel.ts
[ItemName]ItemEditor.tsx

// Route Patterns
/[ItemName]Item-editor/:itemObjectId

// Manifest Names
[ItemName]Item.xml
[ItemName]Item.json
```

### PowerShell Script Conventions
- **Parameter Validation**: Use parameter attributes and validation
- **Error Handling**: Include proper error checking and user feedback
- **Documentation**: Use comment-based help for all scripts
- **Consistency**: Follow existing script patterns in `scripts/` directory

## 🧪 Testing & Validation

### Development Testing
- **Build Validation**: Ensure manifest package builds successfully
- **Runtime Testing**: Start both DevGateway and DevServer
- **Functionality Testing**: Create, edit, and save items
- **Browser Testing**: Verify no console errors
- **Authentication Testing**: Confirm login flows work

### Pre-Deployment Validation
- **Manifest Validation**: Run `BuildManifestPackage.ps1 -ValidateFiles $true`
- **Production Build**: Test `BuildRelease.ps1` with production parameters
- **Environment Testing**: Verify all environment configurations
- **Documentation Review**: Ensure all changes are documented

### Error Handling Patterns
```typescript
// Use try/catch for async operations
try {
  const result = await saveItemDefinition(definition);
  setIsUnsaved(false);
} catch (error) {
  callNotificationOpen("Error saving item", "error");
}
```

## 📚 Documentation & Communication

### Documentation Updates Required
- **README Updates**: When adding major features or changing setup
- **AI Context Updates**: When patterns or conventions change
- **Script Documentation**: Include parameter descriptions and examples
- **Code Comments**: Explain complex business logic and Fabric integrations

### Communication Patterns
- **User Notifications**: Use `callNotificationOpen()` for user feedback
- **Console Logging**: Include meaningful logs for debugging
- **Error Messages**: Provide actionable error information
- **Progress Indicators**: Show loading states for async operations

## 🧠 AI Behavior Rules

### Context Management
- **Never assume**: Always read `.ai/context/` files before starting work
- **Verify paths**: Confirm file locations before creating or modifying files
- **Check dependencies**: Ensure required scripts and tools are available
- **Maintain relationships**: Keep implementation and manifest files synchronized

### Code Safety
- **Never delete**: Existing functionality unless explicitly instructed
- **Always backup**: Consider version control implications
- **Preserve patterns**: Follow existing code structures and conventions
- **Test incrementally**: Verify changes at each step

### Fabric-Specific Considerations
- **Authentication**: Always handle Azure AD authentication properly
- **Workload Registration**: Understand development vs production naming
- **Manifest Consistency**: Ensure XML and JSON files remain synchronized
- **Environment Variables**: Keep `.env` files consistent across environments

### Problem-Solving Approach
1. **Identify the scope**: Item-level, workload-level, or infrastructure change
2. **Check documentation**: Review relevant `.ai/` files first
3. **Follow patterns**: Use existing implementations as templates
4. **Test early**: Validate changes as soon as possible
5. **Document decisions**: Update relevant documentation files

## 🚀 Quick Reference

### Essential Commands

#### Setup a new workload
```powershell
.\scripts\Setup\Setup.ps1 -WorkloadName "Org.MyWorkload"
```

#### Start development enviroment
```powershell
.\scripts\Run\StartDevGateway.ps1
.\scripts\Run\StartDevServer.ps1
```

#### Build and test
```powershell
.\scripts\Build\BuildRelease.ps1
```

#### Frontend development
```powershell
.\scripts\Run\StartDevGateway.ps1
.\scripts\Run\StartDevServer.ps1
```

### Key File Locations
- **Item Implementation**: `Workload/app/items/[ItemName]Item/`
- **Manifest Configuration**: `config/Manifest/[ItemName]Item.xml` and `.json`
- **Environment Config**: `Workload/.env.dev`, `.env.prod`, `.env.test`
- **Build Output**: `release/` directory
- **AI Documentation**: `.ai/context/` and `.ai/commands/`

### Common Troubleshooting
- **Build Failures**: Check manifest syntax and required files
- **Server Start Issues**: Verify Azure authentication and workspace configuration
- **Item Not Appearing**: Confirm manifest files and routing are correct
- **Authentication Problems**: Check Entra application configuration

This guidance document provides AI tools with comprehensive context for working effectively with the Microsoft Fabric Workload Development Kit while maintaining code quality, consistency, and proper integration with the Fabric platform.
