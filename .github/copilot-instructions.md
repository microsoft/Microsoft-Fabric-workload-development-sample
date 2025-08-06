# GitHub Copilot Instructions for Microsoft Fabric Workload Development Kit

## 📋 Overview

This file contains **GitHub Copilot-specific** instructions that extend the generic AI guidance found in the `.ai/` folder. All AI tools should first reference the generic instructions, then apply the Copilot-specific enhancements below.

## 🔗 Base AI Instructions

**REQUIRED**: Before using these instructions, always reference the generic AI guidance:

- **Primary Context**: `.ai/context/fabric-workload.md` - Project structure and conventions
- **Platform Knowledge**: `.ai/context/fabric.md` - Microsoft Fabric platform understanding  
- **Available Commands**: `.ai/commands/` - All automation tasks and procedures
  - Item Operations: `.ai/commands/item/` (createItem.md, deleteItem.md)
  - Workload Operations: `.ai/commands/workload/` (runWorkload.md, updateWorkload.md, deployWorkload.md, publishworkload.md)

## 🤖 GitHub Copilot Enhanced Features

### Agent Activation
Use `@fabric` or these keywords for specialized GitHub Copilot assistance:
- `fabric workload` - WDK-specific development help with autocomplete
- `fabric item` - Item creation with intelligent code generation
- `fabric auth` - Authentication patterns with secure defaults
- `fabric api` - API integration with type inference
- `fabric deploy` - Deployment automation with validation

### Enhanced Capabilities
GitHub Copilot provides additional features beyond generic AI tools:
- 🔮 **Predictive Coding**: Auto-completion for Fabric patterns and TypeScript interfaces
- � **Context-Aware Suggestions**: Smart suggestions based on current file and cursor position
- ⚡ **Real-time Validation**: Immediate feedback on code quality and Fabric compliance
- � **Pattern Recognition**: Learns from existing codebase patterns for consistent suggestions
- � **Inline Documentation**: Generates JSDoc comments following Fabric conventions

## 🎯 GitHub Copilot Integration

### Command Reference System
GitHub Copilot integrates with the generic `.ai/commands/` structure:

| **Generic Command** | **GitHub Copilot Enhancement** |
|-------------------|-------------------------------|
| `.ai/commands/item/createItem.md` | Auto-generates 4-file structure with intelligent TypeScript interfaces |
| `.ai/commands/item/deleteItem.md` | Validates dependencies before suggesting removal |
| `.ai/commands/workload/runWorkload.md` | Provides environment validation and startup optimization |
| `.ai/commands/workload/updateWorkload.md` | Suggests configuration updates with impact analysis |
| `.ai/commands/workload/deployWorkload.md` | Validates deployment readiness with security checks |
| `.ai/commands/workload/publishworkload.md` | Ensures production-ready manifest compliance |

### Context Enhancement
Beyond the generic `.ai/context/` files, GitHub Copilot provides:
- **Real-time IntelliSense**: Auto-completion for Fabric APIs and TypeScript definitions
- **Error Prevention**: Immediate feedback on common Fabric development pitfalls
- **Pattern Matching**: Suggests code based on similar implementations in the workspace
- **Dependency Tracking**: Understands relationships between manifest and implementation files

## 🧠 GitHub Copilot Behavioral Enhancements

### Smart Suggestions
- **File Creation**: When creating items, automatically suggests the 4-file pattern structure
- **Import Resolution**: Auto-imports Fabric platform types and client libraries
- **Error Recovery**: Provides specific fixes for common Fabric authentication and manifest issues
- **Code Completion**: Understands Fabric-specific patterns like `callNotificationOpen()` and `saveItemDefinition()`

### Workspace Intelligence
- **Manifest Sync**: Detects when implementation changes require manifest updates
- **Environment Awareness**: Suggests appropriate `.env` configurations based on current context
- **Build Validation**: Predicts build issues before they occur
- **Routing Updates**: Automatically suggests route additions when new items are created

## 🚀 GitHub Copilot Quick Actions

### Smart Code Generation
Instead of manual file creation, GitHub Copilot can generate complete structures:

```typescript
// Type "fabric item create MyCustom" to generate:
// - MyCustomItemModel.ts with intelligent interface
// - MyCustomItemEditor.tsx with Fluent UI components
// - MyCustomItemEditorEmpty.tsx with onboarding flow
// - MyCustomItemEditorRibbon.tsx with action buttons
```

### Enhanced Development Commands
GitHub Copilot understands context-aware shortcuts:

```powershell
# Smart environment detection
fabric dev start    # Automatically chooses correct scripts

# Intelligent build with validation
fabric build check  # Pre-validates before building

# Context-aware deployment
fabric deploy prod   # Validates production readiness
```

### Auto-completion Patterns
GitHub Copilot recognizes Fabric patterns and suggests:
- **API Calls**: Complete authentication and error handling
- **Component Structure**: Fluent UI patterns with proper TypeScript
- **Manifest Updates**: XML/JSON synchronization
- **Route Configuration**: Automatic route registration

### Workspace-Aware Features
- **File Relationships**: Understands manifest ↔ implementation dependencies
- **Environment Detection**: Suggests appropriate configurations for dev/prod
- **Error Resolution**: Provides specific fixes for Fabric development issues
- **Pattern Learning**: Adapts suggestions based on existing codebase patterns

---

## � Reference Architecture

For complete understanding, GitHub Copilot users should reference:
- **Generic Foundation**: All files in `.ai/context/` and `.ai/commands/`
- **Copilot Enhancements**: This file's specific GitHub Copilot features
- **Live Workspace**: Current implementation patterns and recent changes

This dual approach ensures consistency across all AI tools while providing GitHub Copilot users with enhanced, context-aware development assistance.
