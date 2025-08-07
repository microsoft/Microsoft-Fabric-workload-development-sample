# GitHub Copilot Instructions: Update Workload

## 🔗 Base Instructions

**REQUIRED**: First read the complete generic instructions at `.ai/commands/workload/updateWorkload.md`

This file provides GitHub Copilot-specific enhancements for updating workloads beyond the base generic process.

## 🤖 GitHub Copilot Enhanced Features

### Smart Configuration Analysis
GitHub Copilot automatically analyzes:
- Configuration file dependencies and relationships
- Impact assessment of proposed changes
- Backward compatibility implications
- Required manifest updates

### Intelligent Update Suggestions

#### Context-Aware Recommendations
```typescript
// Copilot detects patterns and suggests updates:
fabric.update.workload.name     // → Comprehensive name change process
fabric.update.item.definition   // → Item schema updates with validation  
fabric.update.manifest.version  // → Version management with dependency tracking
```

### Real-time Impact Analysis
- **Dependency Mapping**: Shows which files require updates
- **Breaking Change Detection**: Warns about compatibility issues
- **Validation Pipeline**: Ensures updates maintain functionality
- **Rollback Planning**: Suggests safe rollback procedures

### Advanced Configuration Management

#### Multi-File Synchronization
GitHub Copilot tracks relationships between:
- `WorkloadManifest.xml` ↔ Implementation files
- Environment configurations across dev/staging/prod
- Item definitions and their corresponding routes
- Asset references and actual file locations

#### Smart Migration Patterns
```powershell
# Copilot generates migration scripts:
fabric migrate v1.x to v2.x    # → Version upgrade automation
fabric migrate dev to staging  # → Environment promotion
fabric migrate org name change # → Organization rebranding
```

### Context-Aware Validation

#### Pre-Update Checks
- Validates current system state
- Checks for uncommitted changes
- Verifies backup procedures
- Ensures test environment availability

#### Post-Update Verification
- Automated testing of updated configurations
- Build process validation
- Runtime functionality checks
- Performance impact assessment

## 🚀 Copilot Quick Actions

### One-Command Updates
```powershell
# Type comment to trigger intelligent updates:
# fabric update workload name from Org.Test to ContosoInc.Production
```

### Smart Configuration Patterns
- `fabric.config.sync` → Synchronizes all related configuration files
- `fabric.config.validate` → Comprehensive configuration validation
- `fabric.config.backup` → Creates safe configuration backup

### Auto-Completion Intelligence
GitHub Copilot recognizes and expands:
- Configuration update patterns
- File relationship mappings
- Validation procedures
- Environment synchronization

---

**Reference**: For complete step-by-step instructions, always consult `.ai/commands/workload/updateWorkload.md` first, then apply these Copilot-specific enhancements.

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
- `CalculatorSampleItem.xml`
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
   .\scripts\Setup\Setup.ps1 -WorkloadName -Force $true
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
Configure build pipelines with environment-specific workload names and the proper script sequence:

### Automated Deployment Pipeline

Use the proper script sequence in deployment pipelines:

```yaml
# Step 1: Setup workload environment
- task: PowerShell@2
  displayName: 'Setup Workload Environment'
  inputs:
    filePath: 'scripts/Setup/SetupWorkload.ps1'
    arguments: '-WorkloadName $(WORKLOAD_NAME) -Force $true'

# Step 2: Build manifest package
- task: PowerShell@2
  displayName: 'Build Manifest Package'
  inputs:
    filePath: 'scripts/Build/BuildManifestPackage.ps1'
    arguments: '-Environment $(ENVIRONMENT_NAME)'

# Step 3: Build release package
- task: PowerShell@2
  displayName: 'Build Release Package'
  inputs:
    filePath: 'scripts/Build/BuildRelease.ps1'
    arguments: '-Environment $(ENVIRONMENT_NAME)'

# Step 4: Publish workload (for production)
- task: PowerShell@2
  displayName: 'Publish Workload'
  condition: eq(variables['Build.SourceBranch'], 'refs/heads/main')
  inputs:
    filePath: 'scripts/Deploy/PublishWorkload.ps1'
    arguments: '-Environment prod -WorkloadName $(WORKLOAD_NAME_PROD)'
```

### Pipeline Variables
Configure environment-specific variables:

```yaml
variables:
  - name: WORKLOAD_NAME_DEV
    value: "Org.MyWorkload"
  - name: WORKLOAD_NAME_TEST
    value: "Org.MyWorkload"  
  - name: WORKLOAD_NAME_PROD
    value: "ContosoInc.MyWorkload"
  - name: ENVIRONMENT_NAME
    value: ${{ parameters.environment }}
```

This comprehensive approach ensures that workload name updates are applied consistently across all required files and configurations, maintaining the integrity of the Fabric workload throughout the development and deployment lifecycle.
