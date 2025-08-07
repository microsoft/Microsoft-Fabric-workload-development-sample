---
applyTo: "/Workload/app/items/[ItemName]Item/"
---

# Rename Workload Item

## Process

This guide provides step-by-step instructions for AI tools to safely rename an item in the Microsoft Fabric Workload Development Kit (WDK) v2. Renaming an item requires updating implementation files, manifest configuration, routing changes, and environment variable updates.

**⚠️ WARNING**: Renaming an item affects multiple files and configurations. Ensure you have backups and coordinate with your team before proceeding.

### Step 1: Plan the Rename Operation

Before starting, define your rename parameters:

1. **Current Item Name**: The existing item name (e.g., "OldItem")
2. **New Item Name**: The desired new name (e.g., "NewItem")  
3. **Impact Assessment**: Identify all files and references that need updating
4. **Backup Strategy**: Ensure you can rollback if needed

**Naming Conventions**:
- Use PascalCase for ItemName (e.g., `MyCustomItem`)
- Ensure the new name follows Fabric workload naming standards
- Avoid conflicts with existing item names

### Step 2: Update Implementation File Names and Contents

#### 2.1: Rename Implementation Files

Rename all files in the item directory from `[OldItemName]` to `[NewItemName]`:

```
Workload/app/items/[OldItemName]Item/ → Workload/app/items/[NewItemName]Item/
├── [OldItemName]ItemModel.ts → [NewItemName]ItemModel.ts
├── [OldItemName]ItemEditor.tsx → [NewItemName]ItemEditor.tsx  
├── [OldItemName]ItemEditorEmpty.tsx → [NewItemName]ItemEditorEmpty.tsx
└── [OldItemName]ItemEditorRibbon.tsx → [NewItemName]ItemEditorRibbon.tsx
```

#### 2.2: Update File Contents

Update all references within the implementation files:

**In `[NewItemName]ItemModel.ts`**:
```typescript
// Update interface name
export interface [NewItemName]ItemDefinition {
  // Keep existing properties unchanged
}
```

**In `[NewItemName]ItemEditor.tsx`**:
```typescript
// Update imports
import { [NewItemName]ItemEditorRibbon } from "./[NewItemName]ItemEditorRibbon";
import { [NewItemName]ItemDefinition } from "./[NewItemName]ItemModel";
import { [NewItemName]ItemEmpty } from "./[NewItemName]ItemEditorEmpty";

// Update function name
export function [NewItemName]ItemEditor(props: PageProps) {
  // Keep existing logic unchanged
}
```

**In `[NewItemName]ItemEditorEmpty.tsx`**:
```typescript
// Update imports and interface names
import { [NewItemName]ItemDefinition } from "./[NewItemName]ItemModel";

interface [NewItemName]ItemEmptyStateProps {
  // Keep existing properties
}

export const [NewItemName]ItemEmpty: React.FC<[NewItemName]ItemEmptyStateProps> = ({
  // Keep existing implementation
});
```

**In `[NewItemName]ItemEditorRibbon.tsx`**:
```typescript
// Update interface and function names
export interface [NewItemName]ItemEditorRibbonProps extends PageProps {
  // Keep existing properties
}

export function [NewItemName]ItemEditorRibbon(props: [NewItemName]ItemEditorRibbonProps) {
  // Keep existing implementation
}
```

### Step 3: Update Manifest Configuration

#### 3.1: Rename Manifest Directory

Rename the manifest directory:
```
Workload/Manifest/items/[OldItemName]/ → Workload/Manifest/items/[NewItemName]/
```

#### 3.2: Rename and Update Manifest Files

**Rename XML Manifest**:
```
[OldItemName]Item.xml → [NewItemName]Item.xml
```

Update content to use new item name:
```xml
<?xml version='1.0' encoding='utf-8'?>
<ItemManifestConfiguration SchemaVersion="2.0.0">
  <Item TypeName="{{WORKLOAD_NAME}}.[NewItemName]" Category="Data">
    <Workload WorkloadName="{{WORKLOAD_NAME}}" />
  </Item>
</ItemManifestConfiguration>
```

**Rename JSON Manifest**:
```
[OldItemName]Item.json → [NewItemName]Item.json
```

Update content with new names and paths:
```json
{
  "name": "[NewItemName]",
  "version": "1.100",
  "displayName": "[NewItemName]Item_DisplayName",
  "displayNamePlural": "[NewItemName]Item_DisplayName_Plural", 
  "editor": {
    "path": "/[NewItemName]Item-editor"
  },
  "icon": {
    "name": "assets/images/[NewItemName]Item-icon.png"
  },
  "activeIcon": {
    "name": "assets/images/[NewItemName]Item-icon.png"
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

### Step 4: Update Asset Files

#### 4.1: Rename Item Icon

Rename the icon file:
```
Workload/Manifest/assets/images/[OldItemName]Item-icon.png →
Workload/Manifest/assets/images/[NewItemName]Item-icon.png
```

#### 4.2: Update Localization Entries

Update `Workload/Manifest/assets/locales/*/translations.json` files:

```json
{
  // Remove old entries
  // "[OldItemName]Item_DisplayName": "...",
  // "[OldItemName]Item_DisplayName_Plural": "...",
  // "[OldItemName]Item_Description": "...",
  
  // Add new entries
  "[NewItemName]Item_DisplayName": "Your New Item Display Name",
  "[NewItemName]Item_DisplayName_Plural": "Your New Item Display Names", 
  "[NewItemName]Item_Description": "Description of what this item does"
}
```

**For All Locales**:
- Update entries in all locale files (en-US, es, etc.)
- Maintain consistent translations across all supported languages
- Remove old localization keys to avoid confusion

#### 4.3: Update Product.json (if needed)

If the item was referenced in `Workload/Manifest/Product.json`, update any references:

- Update createExperience entries for the renamed item
- Change any item-specific configuration sections
- Ensure all references use the new item name

### Step 5: Update Routing Configuration

Update `Workload/app/App.tsx` to use the new item name:

```typescript
// Update import statement
import { [NewItemName]ItemEditor } from "./items/[NewItemName]Item/[NewItemName]ItemEditor";

// Update route definition
<Route path="/[NewItemName]Item-editor/:itemObjectId">
  <[NewItemName]ItemEditor {...pageProps} />
</Route>
```

**Key Changes**:
1. Update the import path to the new directory and component name
2. Update the route path to match the new editor path in the JSON manifest
3. Update the component reference in the route definition
4. Ensure the route path follows the pattern: `/[NewItemName]Item-editor`

### Step 6: Update Asset Dependencies

#### 6.1: Rename Additional Assets

If the item has additional assets in `Workload/app/assets/items/`:

```
Workload/app/assets/items/[OldItemName]/ → Workload/app/assets/items/[NewItemName]/
```

Rename any item-specific assets:
- EditorEmpty.jpg or other images
- Configuration files
- Custom stylesheets or resources

#### 6.2: Update Asset References

Check for any hardcoded references to the old item name in:
- CSS files with item-specific styles
- Configuration files
- Documentation or help files
- Test files

### Step 7: 🚨 CRITICAL - Update Environment Variables

**IMPORTANT**: Update the `ITEM_NAMES` variable in ALL environment files to use the new item name:

1. **Update Workload/.env.dev**:
   ```bash
   # Before
   ITEM_NAMES=HelloWorld,[OldItemName],CustomItem
   
   # After - replace with new item name
   ITEM_NAMES=HelloWorld,[NewItemName],CustomItem
   ```

2. **Update Workload/.env.test**:
   ```bash
   ITEM_NAMES=HelloWorld,[NewItemName],CustomItem
   ```

3. **Update Workload/.env.prod**:
   ```bash
   ITEM_NAMES=HelloWorld,[NewItemName],CustomItem
   ```

**Why This Matters**:
- The ITEM_NAMES variable controls which items are included when building the manifest package
- The old item name will cause build failures since the files no longer exist
- The new item name must be included for the renamed item to appear in the workload
- All environment files must be updated consistently

### Step 8: Validation and Testing

#### 8.1: Build Validation

1. **Build the project**:
   ```powershell
   cd Workload
   npm run build:test
   ```

2. **Check for build errors**:
   - Verify no import errors for renamed components
   - Ensure no manifest generation errors
   - Confirm no missing asset references

#### 8.2: Runtime Validation

1. **Start development server**:
   ```powershell
   npm run start
   ```

2. **Test renamed item**:
   - Navigate to Fabric workspace
   - Create new item with the new name
   - Verify editor loads correctly with new route
   - Test save/load functionality
   - Verify UI shows correct display names

#### 8.3: Manifest Generation Test

1. **Test manifest generation**:
   ```powershell
   .\scripts\Build\BuildManifestPackage.ps1 -Environment dev
   ```

2. **Verify clean build**:
   - No errors about missing old item files
   - Generated manifest includes renamed item with correct paths
   - All assets are properly referenced

### Step 9: Clean Up Old References

#### 9.1: Search for Remaining References

Search the entire codebase for any remaining references to the old item name:

```powershell
# Search for old item name references
findstr /s /i "[OldItemName]" *.ts *.tsx *.json *.xml *.md
```

#### 9.2: Update Documentation

Update any documentation that references the old item name:
- README files
- API documentation
- Code comments
- Example configurations

#### 9.3: Clear Build Artifacts

Remove any cached build artifacts that might reference the old item:

```powershell
# Clear build directory
Remove-Item -Recurse -Force build/

# Clear node modules cache if needed
npm run clean
npm install
```

### Step 10: Final Verification

Run a complete build and test cycle to ensure everything works:

```powershell
# Full build test
.\scripts\Setup\SetupWorkload.ps1 -Force $true
.\scripts\Build\BuildManifestPackage.ps1 -Environment dev
.\scripts\Build\BuildRelease.ps1 -Environment dev

# Development test
cd Workload
npm run build:test
npm run start
```

## Verification Checklist

After renaming, verify all these components have been updated:

**Implementation Files**:
- [ ] Directory renamed: `Workload/app/items/[NewItemName]Item/`
- [ ] All four TypeScript files renamed with new item name
- [ ] All internal references updated (interfaces, functions, imports)
- [ ] No TypeScript errors about missing modules

**Manifest Files**:
- [ ] Directory renamed: `Workload/Manifest/items/[NewItemName]/`
- [ ] XML manifest file renamed and content updated
- [ ] JSON manifest file renamed with correct paths and names
- [ ] Product.json updated if referenced

**Asset Files**:
- [ ] Icon renamed: `Workload/Manifest/assets/images/[NewItemName]Item-icon.png`
- [ ] Localization entries updated in all locale files
- [ ] Additional assets renamed if they exist

**Code Integration**:
- [ ] Route updated in `Workload/app/App.tsx`
- [ ] Import statement updated with new path and component name
- [ ] Route path matches new manifest `editor.path`

**Environment Variables**:
- [ ] Old item name removed from `ITEM_NAMES` in `Workload/.env.dev`
- [ ] New item name added to `ITEM_NAMES` in `Workload/.env.dev`
- [ ] Same updates applied to `Workload/.env.test` and `Workload/.env.prod`

**Build Validation**:
- [ ] `npm run build:test` completes without errors
- [ ] `npm run start` works correctly
- [ ] `BuildManifestPackage.ps1` runs without errors
- [ ] Renamed item appears correctly in Fabric workspace

## Common Issues and Solutions

### Build Errors After Rename

**Error**: "Cannot find module '[OldItemName]ItemEditor'"
**Solution**: Update all import statements to use the new component names

**Error**: "Manifest file not found for item [OldItemName]"
**Solution**: Update ITEM_NAMES in all .env files to use the new item name

**Error**: "Route component [NewItemName]ItemEditor is not defined"  
**Solution**: Verify the component export name matches the new item name

### Asset Reference Errors

**Error**: "Image not found: [OldItemName]Item-icon.png"
**Solution**: Ensure icon file was renamed and manifest JSON references are updated

**Error**: "Translation key '[OldItemName]Item_DisplayName' not found"
**Solution**: Update localization files in all supported locales

### Runtime Issues

**Problem**: Item appears with old display name in Fabric
**Solution**: Clear browser cache and verify localization files are updated

**Problem**: Editor doesn't load when creating renamed item
**Solution**: Verify route path in App.tsx matches the editor path in JSON manifest

## Rollback Strategy

If you need to revert the rename:

1. **Use version control**: Git checkout to restore previous state
2. **Manual rollback**: Rename all files back to original names
3. **Reverse environment variables**: Update ITEM_NAMES back to old name
4. **Rebuild**: Run BuildManifestPackage.ps1 to regenerate manifests
5. **Test thoroughly**: Verify original functionality is restored

**Best Practice**: Create a git branch before starting the rename operation to enable easy rollback.
