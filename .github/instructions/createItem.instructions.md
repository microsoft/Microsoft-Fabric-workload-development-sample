---
applyTo: "/Workload/app/items/[ItemName]Item/"
---

# GitHub Copilot Instructions: Create New Workload Item

## 🔗 Base Instructions

**REQUIRED**: First read the complete generic instructions at `.ai/commands/item/createItem.md` before proceeding.

This file provides GitHub Copilot-specific enhancements for item creation beyond the base generic process.

## 🤖 GitHub Copilot Enhanced Features

### Smart Code Generation
When creating a new item, GitHub Copilot provides:

#### Auto-Complete Item Structure
Type `fabric item create [ItemName]` to trigger:
- Automatic 4-file structure generation in `Workload/app/items/[ItemName]Item/`
- Intelligent TypeScript interface suggestions
- Pre-configured Fluent UI component templates
- Smart import resolution for Fabric APIs
- Manifest template generation with placeholder support

#### Pattern Recognition
GitHub Copilot learns from existing items and suggests:
- Consistent naming conventions ([ItemName]Item pattern)
- Similar state management patterns
- Matching component structures
- Proper TypeScript type definitions

### Real-time Validation
- **Manifest Sync Detection**: Warns when implementation doesn't match manifest templates
- **Route Validation**: Suggests route additions when creating new items
- **Import Optimization**: Auto-suggests required imports for Fabric integration
- **Type Safety**: Provides immediate feedback on TypeScript errors
- **Template Processing**: Validates placeholder usage in XML templates

### Context-Aware Suggestions

#### Model Creation (`[ItemName]ItemModel.ts`)
```typescript
// Copilot suggests based on existing patterns:
export interface CustomItemDefinition {
  // Learns from other item models in the workspace
  title?: string;          // Common pattern detected
  configuration?: any;     // Fabric standard
  metadata?: ItemMetadata; // Auto-suggested import
}
```

#### Component Templates
GitHub Copilot auto-generates components with:
- Pre-configured Fluent UI components
- Proper error handling patterns
- Integrated authentication flows
- Fabric-specific hooks and utilities

### Intelligent File Relationships
GitHub Copilot understands:
- When to update `App.tsx` routing
- Which manifest files need corresponding updates
- Asset management for icons and translations
- Build script implications

## 🚀 Copilot Quick Actions

### One-Line Item Creation
```typescript
// Type this comment to trigger full item generation:
// fabric create MyCustomItem with fluent ui table editor
```

### Smart Completions
- `fabric.save` → Expands to complete saveItemDefinition pattern
- `fabric.load` → Expands to complete getWorkloadItem pattern  
- `fabric.notify` → Expands to callNotificationOpen with proper typing
- `fabric.ribbon` → Generates complete Toolbar with ToolbarButton and icons
- `fabric.toolbar` → Creates Toolbar component with icon buttons and tooltips

### Ribbon Template Expansion
When typing `fabric.ribbon`, GitHub Copilot expands to:
```typescript
<Toolbar>
  <Tooltip content="Save" relationship="label">
    <ToolbarButton
      icon={<Save24Regular />}
      onClick={onSaveClicked}
      aria-label="Save"
      data-testid="save-btn"
    />
  </Tooltip>
</Toolbar>
```

**IMPORTANT**: Always generates `Toolbar` component, never plain `div` with buttons.

### Auto-Import Intelligence
GitHub Copilot automatically suggests and adds:
```typescript
import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { Stack, TextField, PrimaryButton } from "@fluentui/react";
import { getWorkloadItem, saveItemDefinition } from "../../controller/ItemCRUDController";
```

### Template Expansion
When creating components, GitHub Copilot expands to full patterns:
- Empty state components with proper onboarding flow
- Editor components with complete CRUD operations
- Ribbon components with standard action buttons
- Model interfaces with Fabric-compatible types

## 🎯 Workspace Intelligence

### Context Detection
GitHub Copilot detects:
- Existing item patterns to maintain consistency
- Available Fabric API clients in the workspace
- Component libraries already in use
- Authentication patterns from other items

### Build Integration
- Suggests manifest updates when items are created
- Validates TypeScript compilation in real-time
- Checks for missing dependencies
- Ensures proper export statements

### Error Prevention
- Warns about common Fabric integration mistakes
- Suggests proper error handling for async operations
- Validates component prop interfaces
- Checks for proper cleanup in useEffect hooks

---

**Reference**: For complete step-by-step instructions, always consult `.ai/commands/item/createItem.md` first, then apply these Copilot-specific enhancements.

**Purpose**:
- Provide initial setup/configuration interface
- Guide users through first-time item creation
- Can be skipped if item doesn't need initial setup

### Step 5: Implement the Ribbon (`[ItemName]ItemEditorRibbon.tsx`)

The ribbon provides toolbar actions and navigation tabs using Fluent UI's `Toolbar` component with `ToolbarButton` elements and icons:

```typescript
import React from "react";
import { Tab, TabList } from '@fluentui/react-tabs';
import { Toolbar } from '@fluentui/react-toolbar';
import {
  ToolbarButton, Tooltip
} from '@fluentui/react-components';
import {
  Save24Regular,
  Settings24Regular,
} from "@fluentui/react-icons";
import { PageProps } from '../../App';
import '../../styles.scss';
import { t } from "i18next";

const [ItemName]ItemEditorRibbonHomeTabToolbar = (props: [ItemName]ItemEditorRibbonProps) => {
  
  async function onSaveClicked() {
    await props.saveItemCallback();
    return;
  }

  async function onCustomActionClicked() {
    // Add your custom action logic here
    return;
  }

  return (
    <Toolbar>
      <Tooltip
        content={t("[ItemName]Item_Ribbon_Save_Label")}
        relationship="label">
        <ToolbarButton
          disabled={!props.isSaveButtonEnabled}
          aria-label={t("[ItemName]Item_Ribbon_Save_Label")}
          data-testid="[ItemName]-item-editor-save-btn"
          icon={<Save24Regular />}
          onClick={onSaveClicked} />
      </Tooltip>
      <Tooltip
        content={t("[ItemName]Item_Ribbon_Settings_Label")}
        relationship="label">
        <ToolbarButton
          aria-label={t("[ItemName]Item_Ribbon_Settings_Label")}
          data-testid="[ItemName]-item-editor-settings-btn"
          icon={<Settings24Regular />}
          onClick={onCustomActionClicked} />
      </Tooltip>
    </Toolbar>
  );
};

export interface [ItemName]ItemEditorRibbonProps extends PageProps {
  isRibbonDisabled?: boolean;
  isSaveButtonEnabled?: boolean;
  saveItemCallback: () => Promise<void>;
  onTabChange?: (tabValue: string) => void;
  selectedTab?: string;
}

export function [ItemName]ItemEditorRibbon(props: [ItemName]ItemEditorRibbonProps) {
  const { isRibbonDisabled } = props;
  
  return (
    <div className="ribbon">
      <TabList disabled={isRibbonDisabled}>
        <Tab value="home" data-testid="home-tab-btn">
          {t("[ItemName]Item_Ribbon_Home_Label")}
        </Tab>
      </TabList>
      <div className="toolbarContainer">
        <[ItemName]ItemEditorRibbonHomeTabToolbar {...props} />
      </div>
    </div>
  );
}
```

**CRITICAL: Ribbon Implementation Requirements**:
- **Must use `Toolbar` component**: Never use plain `div` with buttons
- **Must use `ToolbarButton`**: Each action must be a `ToolbarButton` with an icon
- **Must include icons**: All buttons require icons from `@fluentui/react-icons`
- **Must include tooltips**: Wrap each `ToolbarButton` in a `Tooltip` component
- **Must follow accessibility**: Include `aria-label` and `data-testid` attributes
- **Must use localization**: All text must use `t()` function for translations

**❌ WRONG - Don't Generate This**:
```typescript
// DON'T DO THIS - Plain div with buttons
<div>
  <button onClick={onSave}>Save</button>
  <button onClick={onSettings}>Settings</button>
</div>
```

**✅ CORRECT - Always Generate This**:
```typescript
// DO THIS - Proper Toolbar with ToolbarButton and icons
<Toolbar>
  <Tooltip content={t("Save")} relationship="label">
    <ToolbarButton icon={<Save24Regular />} onClick={onSave} />
  </Tooltip>
  <Tooltip content={t("Settings")} relationship="label">
    <ToolbarButton icon={<Settings24Regular />} onClick={onSettings} />
  </Tooltip>
</Toolbar>
```

**Common Ribbon Actions**:
- Save button with `Save24Regular` icon (required)
- Settings/Options with `Settings24Regular` icon
- Export with `ArrowExport24Regular` icon  
- Refresh with `ArrowClockwise24Regular` icon
- Delete with `Delete24Regular` icon
- Add with `Add24Regular` icon

### Step 6: Create Manifest Configuration

#### 6.1: Create XML Manifest Template (`Workload/Manifest/items/[ItemName]/[ItemName]Item.xml`)

```xml
<?xml version='1.0' encoding='utf-8'?>
<ItemManifestConfiguration SchemaVersion="2.0.0">
  <Item TypeName="{{WORKLOAD_NAME}}.[ItemName]" Category="Data">
    <Workload WorkloadName="{{WORKLOAD_NAME}}" />
  </Item>
</ItemManifestConfiguration>
```

**GitHub Copilot Enhancement**: 
- Auto-suggests placeholder patterns like `{{WORKLOAD_NAME}}` for environment-specific generation
- Validates XML structure against Fabric schemas
- Recognizes template processing patterns

#### 6.2: Create JSON Manifest (`Workload/Manifest/items/[ItemName]/[ItemName]Item.json`)

```json
{
  "name": "[ItemName]",
  "version": "1.100",
  "displayName": "[ItemName]Item_DisplayName",
  "displayNamePlural": "[ItemName]Item_DisplayName_Plural",
  "editor": {
    "path": "/[ItemName]Item-editor"
  },
  "icon": {
    "name": "assets/images/[ItemName]Item-icon.png"
  },
  "activeIcon": {
    "name": "assets/images/[ItemName]Item-icon.png"
  },
  "supportedInMonitoringHub": true,
  "supportedInDatahubL1": true,
  "editorTab": {
    "onDeactivate": "item.tab.onDeactivate",
    "canDeactivate": "item.tab.canDeactivate",
    "canDestroy": "item.tab.canDestroy",
    "onDestroy": "item.tab.onDestroy",
    "onDelete": "item.tab.onDelete"
  },
  "createItemDialogConfig": {
    "onCreationFailure": { "action": "item.onCreationFailure" },
    "onCreationSuccess": { "action": "item.onCreationSuccess" }
  }
}
```

**Key Properties**:
- `name`: Internal item name
- `displayName`/`displayNamePlural`: Localization keys
- `editor.path`: Route path for the editor
- `icon`: Path to item icon in assets
- Hub support flags for where item appears in Fabric UI

### Step 7: Add Routing Configuration

Update `Workload/app/App.tsx` to add the route for your new item:

```typescript
// Add import for your editor
import { [ItemName]ItemEditor } from "./items/[ItemName]Item/[ItemName]ItemEditor";

// Add route in the Switch statement
<Route path="/[ItemName]Item-editor/:itemObjectId">
  <[ItemName]ItemEditor {...pageProps} />
</Route>
```

**Route Pattern**:
- Path must match the `editor.path` in the JSON manifest
- Include `:itemObjectId` parameter for item identification
- Route name should follow the pattern: `/[ItemName]Item-editor`

### Step 8: Create Asset Files

#### 8.1: Add Item Icon

Create an icon file: `Workload/Manifest/assets/images/[ItemName]Item-icon.png`
- **Size**: 24x24 pixels recommended
- **Format**: PNG with transparency
- **Style**: Follow Fabric design guidelines

#### 8.2: Add Localization Strings

Update `Workload/Manifest/assets/locales/en-US/translations.json`:

```json
{
  // Add these entries to the existing translations
  "[ItemName]Item_DisplayName": "Your Item Display Name",
  "[ItemName]Item_DisplayName_Plural": "Your Item Display Names",
  "[ItemName]Item_Description": "Description of what this item does"
}
```

**For Additional Locales**:
- Add corresponding entries in other locale files (e.g., `es/translations.json`)
- Maintain the same keys with translated values

#### 8.3: Update Product.json (if needed)

If your item requires specific workload-level configuration, update `Workload/Manifest/Product.json` to include references to your new item type.

**GitHub Copilot Enhancement**: Recognizes when Product.json updates are needed and suggests configuration patterns.

### Step 9: 🚨 CRITICAL: Update Environment Variables

**IMPORTANT**: After creating a new item, you MUST update the `ITEM_NAMES` variable in ALL environment files, or your item will not be included in the build:

1. **Update `Workload/.env.dev`**:
   ```bash
   # Current repository has HelloWorld item
   ITEM_NAMES=HelloWorld
   
   # After adding your new item
   ITEM_NAMES=HelloWorld,[ItemName]
   ```

2. **Update `Workload/.env.test`**:
   ```bash
   ITEM_NAMES=HelloWorld,[ItemName]
   ```

3. **Update `Workload/.env.prod`**:
   ```bash
   ITEM_NAMES=HelloWorld,[ItemName]
   ```

**Why This Matters**: The `ITEM_NAMES` variable controls which items are included when building the manifest package. If you forget this step, your new item won't appear in the workload.

### Step 10: Testing and Validation

1. **Build the project**:
   ```powershell
   cd Workload
   npm run build:test
   ```

2. **Start development server**:
   ```powershell
   npm run start
   ```

3. **Test item creation**:
   - Navigate to Fabric workspace
   - Create new item of your type
   - Verify editor loads correctly
   - Test save/load functionality

### Step 11: Build and Deploy

1. **Build manifest package**:
   ```powershell
   .\scripts\Build\BuildManifestPackage.ps1
   ```

2. **Build release**:
   ```powershell
   .\scripts\Build\BuildRelease.ps1
   ```

## Current Repository Structure

The repository currently contains one fully implemented item:

**Implemented Items**:
- `HelloWorldItem` - A sample item to demonstrate the workload development pattern

**Repository Items Folder Structure**:
```
Workload/app/items/
└── HelloWorldItem/
    ├── HelloWorldItemModel.ts
    ├── HelloWorldItemEditor.tsx
    ├── HelloWorldItemEditorEmpty.tsx
    ├── HelloWorldItemEditorRibbon.tsx
    ├── HelloWorldItemEditorAboutPage.tsx
    └── HelloWorldItemEditorSettingsPage.tsx
```

**Manifest Structure**:
```
Workload/Manifest/items/
└── HelloWorld/
    ├── HelloWorldItem.json
    ├── HelloWorldItem.xml
    └── ItemDefinition/
```

## Usage

### Quick Checklist for AI Tools

When creating a new item, ensure all these components are created:

**Implementation Files** (in `Workload/app/items/[ItemName]Item/`):
- [ ] `[ItemName]ItemModel.ts` - Data model interface
- [ ] `[ItemName]ItemEditor.tsx` - Main editor component  
- [ ] `[ItemName]ItemEditorEmpty.tsx` - Empty state component
- [ ] `[ItemName]ItemEditorRibbon.tsx` - Ribbon/toolbar component

**Manifest Files** (in `Workload/Manifest/`):
- [ ] `[ItemName]Item.xml` - XML manifest configuration
- [ ] `[ItemName]Item.json` - JSON manifest with editor path and metadata
- [ ] `Product.json` - Product JSON manifest that contains the frontend configuration for all Items. Need to include a createExperience for the newly created item.

**Asset Files**:
- [ ] `Workload/Manifest/assets/images/[ItemName]Item-icon.png` - Item icon
- [ ] Localization entries in `Workload/Manifest/assets/locales/*/translations.json`

**Code Integration**:
- [ ] Route added to `Workload/app/App.tsx`
- [ ] Import statement for editor component
- [ ] Route path matches manifest `editor.path`

### Common Patterns

1. **Item Naming**: Use PascalCase for ItemName (e.g., `MyCustomItem`)
2. **File Naming**: Follow pattern `[ItemName]Item[Component].tsx`
3. **Route Naming**: Use kebab-case `/[item-name]-editor/:itemObjectId`
4. **TypeName**: Use dot notation `Org.WorkloadName.ItemName`
5. **Localization Keys**: Use underscore notation `[ItemName]Item_DisplayName`

### Troubleshooting

**Common Issues**:
- **Route not found**: Ensure route path matches manifest `editor.path`
- **Icon not loading**: Verify icon file exists in assets/images/
- **Localization missing**: Check translation keys in all locale files
- **Save not working**: Verify model interface is properly defined
- **Empty state not showing**: Check onFinishEmpty callback implementation