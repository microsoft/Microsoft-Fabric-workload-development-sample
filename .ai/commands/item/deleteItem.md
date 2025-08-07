---
applyTo: "/Workload/app/items/[ItemName]Item/"
---

# Delete Workload Item

## Process

This guide provides step-by-step instructions for AI tools to safely delete an item from the Microsoft Fabric Workload Development Kit (WDK) v2. Deleting an item requires removing implementation files, manifest configuration, routing cleanup, and environment variable updates.

**⚠️ WARNING**: Deleting an item is irreversible. Ensure you have backups if needed and verify the item is not in use.

### Step 1: Verify Item Deletion Safety

Before deleting, check for dependencies:

1. **Check for data dependencies**: Ensure no critical data relies on this item type
2. **Review deployment status**: Verify item is not deployed in production environments
3. **Backup considerations**: Consider backing up item implementation if it might be needed later
4. **Team coordination**: Confirm with team that item removal is intentional

### Step 2: Remove Item Implementation Files

Delete the entire item directory and all its contents:

```
Workload/app/items/[ItemName]Item/
├── [ItemName]ItemModel.ts
├── [ItemName]ItemEditor.tsx
├── [ItemName]ItemEditorEmpty.tsx
└── [ItemName]ItemEditorRibbon.tsx
```

**Important**: 
- Remove the entire `[ItemName]Item/` directory
- Verify no other files reference these components
- Check for any shared utilities that might need cleanup

### Step 3: Remove Manifest Configuration

#### 3.1: Delete XML Manifest Template

Remove: `Workload/Manifest/items/[ItemName]/[ItemName]Item.xml`

#### 3.2: Delete JSON Manifest

Remove: `Workload/Manifest/items/[ItemName]/[ItemName]Item.json`

#### 3.3: Remove Item Directory

Delete the entire manifest directory: `Workload/Manifest/items/[ItemName]/`

#### 3.4: Update Product.json (if needed)

If the item was referenced in `Workload/Manifest/Product.json`, remove any specific references:

- Remove createExperience entries for the deleted item
- Clean up any item-specific configuration sections
- Verify no broken references remain

### Step 4: Remove Asset Files

#### 4.1: Delete Item Icon

Remove: `Workload/Manifest/assets/images/[ItemName]Item-icon.png`

#### 4.2: Clean Up Localization Entries

Update `Workload/Manifest/assets/locales/*/translations.json` files:

```json
{
  // Remove these entries from all locale files
  // "[ItemName]Item_DisplayName": "...",
  // "[ItemName]Item_DisplayName_Plural": "...",
  // "[ItemName]Item_Description": "..."
}
```

**For All Locales**:
- Remove entries from all locale files (en-US, es, etc.)
- Ensure consistent cleanup across all translation files
- Verify no orphaned translation keys remain

### Step 5: Remove Routing Configuration

Update `Workload/app/App.tsx` to remove the route:

```typescript
// Remove the import statement
// import { [ItemName]ItemEditor } from "./items/[ItemName]Item/[ItemName]ItemEditor";

// Remove the route from the Switch statement
// <Route path="/[ItemName]Item-editor/:itemObjectId">
//   <[ItemName]ItemEditor {...pageProps} />
// </Route>
```

**Cleanup Steps**:
1. Remove the import statement for the deleted editor component
2. Remove the route definition that matched the item's editor path
3. Verify no other components import the deleted item components
4. Check for any route guards or permissions that reference the deleted item

### Step 6: 🚨 CRITICAL - Update Environment Variables

**IMPORTANT**: Remove the item from the `ITEM_NAMES` variable in ALL environment files, or the build will fail trying to find the deleted item:

1. **Update Workload/.env.dev**:
   ```bash
   # Before
   ITEM_NAMES=HelloWorld,[ItemName],CustomItem
   
   # After - remove the deleted item
   ITEM_NAMES=HelloWorld,CustomItem
   ```

2. **Update Workload/.env.test**:
   ```bash
   ITEM_NAMES=HelloWorld,CustomItem
   ```

3. **Update Workload/.env.prod**:
   ```bash
   ITEM_NAMES=HelloWorld,CustomItem
   ```

**Why This Matters**:
- The ITEM_NAMES variable controls which items are included when building the manifest package
- Leaving deleted items in this list will cause build failures
- The BuildManifestPackage.ps1 script will try to find manifest files for items in this list
- Each environment file must be updated consistently

### Step 7: Remove Asset Dependencies

#### 7.1: Clean Up Item-Specific Assets

Remove any additional assets in `Workload/app/assets/items/[ItemName]/`:
- EditorEmpty.jpg or other item-specific images
- Any configuration files specific to the item
- Custom stylesheets or resources

#### 7.2: Check for Shared Assets

Review shared assets that might reference the deleted item:
- CSS files that might have item-specific styles
- Shared configuration files
- Documentation or help files

### Step 8: Validation and Testing

#### 8.1: Build Validation

1. **Build the project**:
   ```powershell
   cd Workload
   npm run build:test
   ```

2. **Check for build errors**:
   - Verify no import errors for deleted components
   - Ensure no manifest generation errors
   - Confirm no missing asset references

#### 8.2: Runtime Validation

1. **Start development server**:
   ```powershell
   npm run start
   ```

2. **Test application**:
   - Verify application starts without errors
   - Check that remaining items still work correctly
   - Ensure no broken routes or missing components

#### 8.3: Manifest Generation Test

1. **Test manifest generation**:
   ```powershell
   .\scripts\Build\BuildManifestPackage.ps1 -Environment dev
   ```

2. **Verify clean build**:
   - No errors about missing item files
   - Generated manifest doesn't reference deleted item
   - All remaining items are properly included

### Step 9: Clean Up Build Artifacts

Remove any generated files that might reference the deleted item:

1. **Clear build directory**:
   ```powershell
   Remove-Item -Recurse -Force build/
   ```

2. **Regenerate clean build**:
   ```powershell
   .\scripts\Build\BuildManifestPackage.ps1 -Environment dev
   ```

This ensures no stale references to the deleted item remain in generated files.

### Step 10: Documentation Updates

1. **Update README or documentation** that references the deleted item
2. **Update any API documentation** that mentioned the item type
3. **Remove item from examples or samples** if it was used as a reference
4. **Update deployment guides** if they specifically mentioned the item

## Verification Checklist

After deletion, verify all these components have been removed:

**Implementation Files**:
- [ ] `Workload/app/items/[ItemName]Item/` directory completely removed
- [ ] No import references to deleted components remain
- [ ] No TypeScript errors about missing modules

**Manifest Files**:
- [ ] `Workload/Manifest/items/[ItemName]/` directory completely removed
- [ ] Product.json cleaned of any item-specific references
- [ ] No manifest generation errors

**Asset Files**:
- [ ] `Workload/Manifest/assets/images/[ItemName]Item-icon.png` removed
- [ ] Localization entries removed from all locale files
- [ ] No orphaned asset references

**Code Integration**:
- [ ] Route removed from `Workload/app/App.tsx`
- [ ] Import statement removed
- [ ] No broken route references

**Environment Variables**:
- [ ] Item removed from `ITEM_NAMES` in `Workload/.env.dev`
- [ ] Item removed from `ITEM_NAMES` in `Workload/.env.test`
- [ ] Item removed from `ITEM_NAMES` in `Workload/.env.prod`

**Build Validation**:
- [ ] `npm run build:test` completes without errors
- [ ] `npm run start` works correctly
- [ ] `BuildManifestPackage.ps1` runs without errors
- [ ] No references to deleted item in generated files

## Common Issues and Solutions

### Build Errors After Deletion

**Error**: "Cannot find module '[ItemName]ItemEditor'"
**Solution**: Remove all import statements referencing the deleted item

**Error**: "Manifest file not found for item [ItemName]"
**Solution**: Remove the item from ITEM_NAMES in all .env files

**Error**: "Route component [ItemName]ItemEditor is not defined"
**Solution**: Remove the route definition from App.tsx

### Asset Reference Errors

**Error**: "Image not found: [ItemName]Item-icon.png"
**Solution**: Verify the icon file was properly deleted and no manifest references remain

**Error**: "Translation key '[ItemName]Item_DisplayName' not found"
**Solution**: Clean up localization files in all supported locales

### Deployment Issues

**Problem**: Deleted item still appears in deployed workload
**Solution**: Rebuild and redeploy manifest package with updated ITEM_NAMES

**Problem**: Build fails in production environment
**Solution**: Ensure ITEM_NAMES is updated in production .env files

## Rollback Strategy

If you need to restore a deleted item:

1. **Restore from version control**: Use git to restore deleted files
2. **Re-add to ITEM_NAMES**: Update environment variables
3. **Rebuild**: Run BuildManifestPackage.ps1 to regenerate manifests
4. **Test thoroughly**: Verify item functionality is fully restored

**Best Practice**: Always use version control tags or branches before major deletions to enable easy rollback.
