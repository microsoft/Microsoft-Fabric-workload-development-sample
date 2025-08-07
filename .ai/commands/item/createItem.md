---
applyTo: "/Workload/app/items/[ItemName]Item/"
---

# Create New Workload Item

## Process

This guide provides step-by-step instructions for AI tools to create a new item in the Microsoft Fabric Workload Development Kit (WDK) v2. Creating a new item requires implementation files, manifest configuration, routing setup, and environment variable updates.

### Step 1: Create Item Implementation Structure

1. **Create item directory**:
   ```
   Workload/app/items/[ItemName]Item/
   ```

2. **Create the four required implementation files**:
   - `[ItemName]ItemModel.ts` - Data model and interface definitions
   - `[ItemName]ItemEditor.tsx` - Main editor component
   - `[ItemName]ItemEditorEmpty.tsx` - Empty state component (shown when item is first created)
   - `[ItemName]ItemEditorRibbon.tsx` - Ribbon/toolbar component

### Step 2: Implement the Model (`[ItemName]ItemModel.ts`)

The model defines the data structure that will be stored in Fabric. **Use the HelloWorld pattern**:

```typescript
// Based on HelloWorldItemModel.ts
export interface [ItemName]ItemDefinition {
  // Add your item-specific properties here
  // Example: Follow HelloWorld pattern with a simple property
  message?: string;
  // Add more properties as needed:
  // title?: string;
  // description?: string;
  // configuration?: any;
}
```

**Key Points**:
- Define the interface that represents your item's state
- This data will be persisted in Fabric's storage
- Keep it serializable (JSON-compatible types only)
- Follow the HelloWorld pattern for consistency

### Step 3: Implement the Editor (`[ItemName]ItemEditor.tsx`)

The main editor component handles the item's primary interface. **Use the HelloWorld pattern as template**:

```typescript
// Based on HelloWorldItemEditor.tsx - Complete functional implementation
import { Label, Stack } from "@fluentui/react";
import { Field, Input, TabValue } from "@fluentui/react-components";
import React, { useEffect, useState, useCallback } from "react";
import { ContextProps, PageProps } from "../../App";
import { [ItemName]ItemEditorRibbon } from "./[ItemName]ItemEditorRibbon";
import { callGetItem, getWorkloadItem, saveItemDefinition } from "../../controller/ItemCRUDController";
import { ItemWithDefinition } from "../../controller/ItemCRUDController";
import { useLocation, useParams } from "react-router-dom";
import "../../styles.scss";
import { useTranslation } from "react-i18next";
import { [ItemName]ItemDefinition } from "./[ItemName]ItemModel";
import { [ItemName]ItemEmpty } from "./[ItemName]ItemEditorEmpty";
import { ItemEditorLoadingProgressBar } from "../../controls/ItemEditorLoadingProgressBar";
import { callNotificationOpen } from "../../controller/NotificationController";
import { callOpenSettings } from "../../controller/SettingsController";

export function [ItemName]ItemEditor(props: PageProps) {
  const pageContext = useParams<ContextProps>();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { workloadClient } = props;
  const [isUnsaved, setIsUnsaved] = useState<boolean>(true);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [editorItem, setEditorItem] = useState<ItemWithDefinition<[ItemName]ItemDefinition>>(undefined);
  const [selectedView, setSelectedView] = useState<TabValue>("");

  // Computed value from editorItem (single source of truth)
  const payload = editorItem?.definition?.message ?? "";

  // Helper function to update item definition immutably
  const updateItemDefinition = useCallback((updates: Partial<[ItemName]ItemDefinition>) => {
    setEditorItem(prevItem => {
      if (!prevItem) return prevItem;
      
      return {
        ...prevItem,
        definition: {
          ...prevItem.definition,
          ...updates
        }
      };
    });
    setIsUnsaved(true);
  }, []);

  useEffect(() => {
      loadDataFromUrl(pageContext, pathname);
    }, [pageContext, pathname]);

  async function SaveItem(definition?: [ItemName]ItemDefinition) {
    var successResult = await saveItemDefinition<[ItemName]ItemDefinition>(
      workloadClient,
      editorItem.id,
      definition || editorItem.definition);
    setIsUnsaved(!successResult);
    callNotificationOpen(
            workloadClient,
            t("ItemEditor_Saved_Notification_Title"),
            t("ItemEditor_Saved_Notification_Text", { itemName: editorItem.displayName }),
            undefined,
            undefined
        );
  }

  async function openSettings() {
    if (editorItem) {      
      const item = await callGetItem(workloadClient, editorItem.id);
      const result = await callOpenSettings(workloadClient, item, 'About');
      console.log("Settings opened result:", result.value);
    }
  }

  async function loadDataFromUrl(pageContext: ContextProps, pathname: string): Promise<void> {
    setIsLoadingData(true);
    var item: ItemWithDefinition<[ItemName]ItemDefinition> = undefined;    
    if (pageContext.itemObjectId) {
      try {
        item = await getWorkloadItem<[ItemName]ItemDefinition>(
          workloadClient,
          pageContext.itemObjectId,          
        );
        
        // Ensure item definition is properly initialized without mutation
        if (!item.definition) {
          item = {
            ...item,
            definition: {
              message: undefined,
            }
          };
        }
        setEditorItem(item);        
      } catch (error) {
        setEditorItem(undefined);        
      } 
    } else {
      console.log(`non-editor context. Current Path: ${pathname}`);
    }
    setIsUnsaved(false);
    if(item?.definition?.message) {
      setSelectedView("home");
    } else {
      setSelectedView("empty");
    }
    setIsLoadingData(false);
  }

  function onUpdateItemDefinition(newDefinition: string) {
    updateItemDefinition({ message: newDefinition });
  }

  async function handleFinishEmpty(message: string) {
    const newItemDefinition = { message: message };
    updateItemDefinition(newItemDefinition);
    await SaveItem(newItemDefinition);
    setSelectedView("home");
  }

  if (isLoadingData) {
    return (<ItemEditorLoadingProgressBar 
      message={t("[ItemName]ItemEditor_LoadingProgressBar_Text")} />);
  }
  else {
    return (
      <Stack className="editor" data-testid="item-editor-inner">
        <[ItemName]ItemEditorRibbon
            {...props}        
            isRibbonDisabled={selectedView === "empty"}
            isSaveButtonEnabled={isUnsaved}
            saveItemCallback={SaveItem}
            openSettingsCallback={openSettings}
        />
        <Stack className="main">
          {["empty"].includes(selectedView as string) && (
            <span>
              <[ItemName]ItemEmpty
                workloadClient={workloadClient}
                item={editorItem}
                itemDefinition={editorItem?.definition}
                onFinishEmpty={handleFinishEmpty}
              />
            </span>
          )}
          {["home"].includes(selectedView as string) && (
          <span>
              <h2>{t('[ItemName]ItemEditor_Title')}</h2>            
              <div> 
                <div className="section" data-testid='item-editor-metadata' >
                  <Field label={t('Item_ID_Label')} orientation="horizontal" className="field">
                    <Label>{editorItem?.id} </Label>
                  </Field>
                  <Field label={t('Item_Type_Label')} orientation="horizontal" className="field">
                    <Label>{editorItem?.type} </Label>
                  </Field>
                  <Field label={t('Item_Name_Label')} orientation="horizontal" className="field">
                    <Label>{editorItem?.displayName} </Label>
                  </Field>
                  <Field label={t('Item_Description_Label')} orientation="horizontal" className="field">
                    <Label>{editorItem?.description} </Label>
                  </Field>
                  <Field label={t('Workspace_ID_Label')} orientation="horizontal" className="field">
                    <Label>{editorItem?.workspaceId} </Label>
                  </Field>

                  <Field label={t('[ItemName]ItemEditor_Definition_Message_Label')} orientation="horizontal" className="field">
                    <Input
                      size="small"
                      type="text"
                      placeholder="Enter your [ItemName] message"
                      value={payload}
                      onChange={(e) => onUpdateItemDefinition(e.target.value)}              
                      data-testid="payload-input"
                    />
                  </Field>
                </div>
              </div>
          </span>
          )}       
        </Stack>
      </Stack>
    );
  }
}
```

**Key Features**:

- **Complete State Management**: Loading, saving, and updating item definitions
- **Empty State Handling**: Automatic detection and transitions between empty and loaded states
- **Error Handling**: Proper try/catch for async operations
- **Immutable Updates**: Safe state updates using functional patterns
- **Notifications**: User feedback on save operations
- **Settings Integration**: Opens item settings when needed
- **Loading States**: Progress indicators during data operations

### Step 4: Implement the Empty State (`[ItemName]ItemEditorEmpty.tsx`)

The empty state is shown when users first create the item. **Use the HelloWorld pattern as template**:

```typescript
// Based on HelloWorldItemEditorEmpty.tsx - Complete functional implementation
import React, { useState } from "react";
import { Stack } from "@fluentui/react";
import { Text, Button, Input } from "@fluentui/react-components";
import "../../styles.scss";
import { useTranslation } from "react-i18next";
import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { ItemWithDefinition } from "../../controller/ItemCRUDController";
import { [ItemName]ItemDefinition } from "./[ItemName]ItemModel";

interface [ItemName]ItemEmptyStateProps {
  workloadClient: WorkloadClientAPI,
  item: ItemWithDefinition<[ItemName]ItemDefinition>;
  itemDefinition: [ItemName]ItemDefinition,
  onFinishEmpty: (message: string) => void;
}

export const [ItemName]ItemEmpty: React.FC<[ItemName]ItemEmptyStateProps> = ({
  workloadClient,
  item,
  itemDefinition: definition,
  onFinishEmpty: onFinishEmpty
}) => {
  const [message, setMessage] = useState<string>(`Hello ${item.displayName}!`);
  const { t } = useTranslation();
  
  const saveItem = () => {
    onFinishEmpty(message);
  };
  
  return (
    <Stack className="empty-item-container" horizontalAlign="center" tokens={{ childrenGap: 16 }}>
      <Stack.Item>
        <img
          src="/assets/items/[ItemName]/EditorEmpty.jpg"
          alt="Empty item illustration"
          className="empty-item-image"
        />
      </Stack.Item>
      <Stack.Item>
        <Text as="h2" size={800} weight="semibold">
          Your [ItemName] item has been created!
        </Text>
      </Stack.Item>
      <Stack.Item style={{ marginTop: '16px', marginBottom: '24px' }}>
        <Text>
          {t('[ItemName]ItemEditorEmpty_Message', {itemName: item.displayName})}
        </Text>
      </Stack.Item>
      <Stack.Item style={{ width: '300px', marginTop: '16px' }}>
        <Input
          placeholder="Enter your [ItemName] message"
          value={message}
          onChange={(e, data) => setMessage(data.value)}
        />
      </Stack.Item>
      <Stack.Item style={{ marginTop: '16px' }}>
        <Button appearance="primary" onClick={saveItem}>
          {t('[ItemName]ItemEditorEmpty_Button')}
        </Button>
      </Stack.Item>
    </Stack>
  );
};
```

**Key Features**:

- **Default Value**: Initializes with a friendly message using the item's display name
- **User Input**: Allows users to customize their initial message
- **Callback Integration**: Calls `onFinishEmpty` to transition to the main editor
- **Localization Support**: Uses translation keys for all user-facing text
- **Fluent UI Components**: Follows Microsoft design system patterns

### Step 5: Implement the Ribbon (`[ItemName]ItemEditorRibbon.tsx`)

The ribbon provides toolbar actions and navigation tabs. **Use the HelloWorld pattern as template**:

```typescript
// Based on HelloWorldItemEditorRibbon.tsx - Complete functional implementation
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

  async function onSaveAsClicked() {
    await props.saveItemCallback();
    return;
  }

  async function onSettingsClicked() {
    await props.openSettingsCallback();
    return;
  }

  return (
    <Toolbar>
      <Tooltip
        content={t("ItemEditor_Ribbon_Save_Label")}
        relationship="label">
        <ToolbarButton
          disabled={!props.isSaveButtonEnabled}
          aria-label={t("ItemEditor_Ribbon_Save_Label")}
          data-testid="item-editor-save-btn"
          icon={<Save24Regular />}
          onClick={onSaveAsClicked} />
      </Tooltip>
      <Tooltip
        content={t("ItemEditor_Ribbon_Settings_Label")}
        relationship="label">
        <ToolbarButton
          aria-label={t("ItemEditor_Ribbon_Settings_Label")}
          data-testid="item-editor-settings-btn"
          icon={<Settings24Regular />}
          onClick={onSettingsClicked} />
      </Tooltip>
    </Toolbar>
  );
};

export interface [ItemName]ItemEditorRibbonProps extends PageProps {
  isRibbonDisabled?: boolean;
  isSaveButtonEnabled?: boolean;
  saveItemCallback: () => Promise<void>;
  openSettingsCallback: () => Promise<void>;
}

export function [ItemName]ItemEditorRibbon(props: [ItemName]ItemEditorRibbonProps) {
  const { isRibbonDisabled } = props;
  return (
    <div className="ribbon">
      <TabList disabled={isRibbonDisabled}>
        <Tab value="home" data-testid="home-tab-btn">
          {t("ItemEditor_Ribbon_Home_Label")}</Tab>
      </TabList>
      <div className="toolbarContainer">
        <[ItemName]ItemEditorRibbonHomeTabToolbar {...props} />
      </div>
    </div>
  );
};
```

**Key Features**:

- **Save Button**: Integrated with save callback and enabled/disabled states
- **Settings Button**: Opens item settings dialog
- **Tooltip Support**: Accessible button descriptions
- **Tab Navigation**: Home tab with toolbar actions
- **Disabled States**: Ribbon can be disabled during empty state
- **Test IDs**: Includes test identifiers for automated testing

### Step 6: Create Manifest Configuration

#### 6.1: Create XML Manifest Template (`Workload/Manifest/items/[ItemName]/[ItemName]Item.xml`)

**Use the HelloWorld pattern exactly**:

```xml
<?xml version='1.0' encoding='utf-8'?>
<ItemManifestConfiguration SchemaVersion="2.0.0">
  <Item TypeName="{{WORKLOAD_NAME}}.[ItemName]" Category="Data">
    <Workload WorkloadName="{{WORKLOAD_NAME}}" />
  </Item>
</ItemManifestConfiguration>
```

**Key Elements**:

- **Location**: Place in `Workload/Manifest/items/[ItemName]/[ItemName]Item.xml`
- **Template Processing**: Use `{{WORKLOAD_NAME}}` placeholder for environment-specific generation
- **Naming Convention**: Follow `[ItemName]Item.xml` pattern
- **Category**: Fabric category (Data, Analytics, etc.)
- **Environment Generation**: Manifest generation will replace placeholders with values from .env files

#### 6.2: Create JSON Manifest (`Workload/Manifest/items/[ItemName]/[ItemName]Item.json`)

**Use the HelloWorld pattern as template**:

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
  "contextMenuItems": [],
  "quickActionItems": [],
  "supportedInMonitoringHub": true,
  "supportedInDatahubL1": true,
  "itemJobActionConfig": {},
  "itemSettings": {
    "getItemSettings": {
      "action": "getItemSettings"
    }
  },
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

Update `Workload/Manifest/assets/locales/en-US/translations.json` **following the HelloWorld pattern**:

```json
{
  // Add these entries to the existing translations (follow HelloWorld pattern)
  "[ItemName]Item_DisplayName": "Your Item Display Name",
  "[ItemName]Item_DisplayName_Plural": "Your Item Display Names",
  "[ItemName]Item_Description": "Description of what this item does",
  "[ItemName]ItemEditor_Title": "Your [ItemName] Editor",
  "[ItemName]ItemEditor_Definition_Message_Label": "Message",
  "[ItemName]ItemEditor_LoadingProgressBar_Text": "Loading your [ItemName] item...",
  "[ItemName]ItemEditorEmpty_Message": "Welcome to your new {itemName}! Enter a message to get started.",
  "[ItemName]ItemEditorEmpty_Button": "Get Started"
}
```

**Required Translation Keys**:

- `[ItemName]Item_DisplayName`: Display name in Fabric UI
- `[ItemName]Item_DisplayName_Plural`: Plural form for lists
- `[ItemName]Item_Description`: Item description
- `[ItemName]ItemEditor_Title`: Main editor title
- `[ItemName]ItemEditor_Definition_Message_Label`: Field label in editor
- `[ItemName]ItemEditor_LoadingProgressBar_Text`: Loading message
- `[ItemName]ItemEditorEmpty_Message`: Empty state message
- `[ItemName]ItemEditorEmpty_Button`: Empty state button text

**For Additional Locales**:

- Add corresponding entries in other locale files (e.g., `es/translations.json`)
- Maintain the same keys with translated values

#### 8.3: Update Product.json (if needed)

If your item requires specific workload-level configuration, update `Workload/Manifest/Product.json` to include references to your new item type.

**Note**: Remember that Product.json is a template and may use placeholders that get replaced during manifest generation.

### Step 9: 🚨 CRITICAL - Update Environment Variables

**IMPORTANT**: After creating a new item, you MUST update the `ITEM_NAMES` variable in ALL environment files, or your item will not be included in the build:

1. **Update Workload/.env.dev**:
   ```bash
   # Before
   ITEM_NAMES=HelloWorld
   
   # After - add your new item
   ITEM_NAMES=HelloWorld,[ItemName]
   ```

2. **Update Workload/.env.test**:
   ```bash
   ITEM_NAMES=HelloWorld,[ItemName]
   ```

3. **Update Workload/.env.prod**:
   ```bash
   ITEM_NAMES=HelloWorld,[ItemName]
   ```

**Why This Matters**:
- The ITEM_NAMES variable controls which items are included when building the manifest package
- Missing items from this list will NOT appear in the workload
- Each environment can have different sets of items enabled
- This is required for the BuildManifestPackage.ps1 script to include your item

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

## Quick Start: Use HelloWorld as Template

**For AI Tools**: Instead of creating empty files, copy and modify the existing HelloWorld item:

### 1. Copy HelloWorld Item Structure
```bash
# Copy the entire HelloWorld item implementation
cp -r Workload/app/items/HelloWorldItem Workload/app/items/[ItemName]Item

# Copy the manifest files
cp -r Workload/Manifest/items/HelloWorld Workload/Manifest/items/[ItemName]
```

### 2. Find and Replace Pattern
```bash
# Replace all instances in the copied files:
HelloWorld → [ItemName]
HelloWorldItem → [ItemName]Item
HelloWorldItemDefinition → [ItemName]ItemDefinition
HelloWorldItemEditor → [ItemName]ItemEditor
HelloWorldItemEmpty → [ItemName]ItemEmpty
HelloWorldItemEditorRibbon → [ItemName]ItemEditorRibbon
```

### 3. Update File Names
```bash
# Rename all files to match the new item name
mv [ItemName]Item/HelloWorldItemModel.ts [ItemName]Item/[ItemName]ItemModel.ts
mv [ItemName]Item/HelloWorldItemEditor.tsx [ItemName]Item/[ItemName]ItemEditor.tsx
mv [ItemName]Item/HelloWorldItemEditorEmpty.tsx [ItemName]Item/[ItemName]ItemEditorEmpty.tsx
mv [ItemName]Item/HelloWorldItemEditorRibbon.tsx [ItemName]Item/[ItemName]ItemEditorRibbon.tsx
# Continue for all files...
```

This approach ensures you get a **complete, functional item** rather than empty file structures.

---

## Usage

### Quick Checklist for AI Tools

When creating a new item, ensure all these components are created:

**Implementation Files** (in `Workload/app/items/[ItemName]Item/`):
- [ ] `[ItemName]ItemModel.ts` - Data model interface
- [ ] `[ItemName]ItemEditor.tsx` - Main editor component  
- [ ] `[ItemName]ItemEditorEmpty.tsx` - Empty state component
- [ ] `[ItemName]ItemEditorRibbon.tsx` - Ribbon/toolbar component

**Manifest Files** (in `Workload/Manifest/items/[ItemName]/`):
- [ ] `[ItemName]Item.xml` - XML manifest template with placeholders like `{{WORKLOAD_NAME}}`
- [ ] `[ItemName]Item.json` - JSON manifest with editor path and metadata

**product Configuration File** (in `Workload/Manifest/Product.json`):
- [ ] Update the file to include a createExperience section for the new item

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
