# OneLake Item Explorer Component #
In addition to FluentUI controls, the Sample Extension provides a Sample OneLake Item Explorer component under the "FluentUI Playground" tab.

The OneLake Item Explorer component allows the user to select a Data Iteme from specific types the user has access to using the OneLake API. The table data is fetched using the Storage Services API, and the component then displays the tables that are available in the selected Item. The user can then interact with the component and select their desired table.

### Potential Use Cases ###
The OneLake Item Explorer and the functionality it provides can be used to access and manipulate the contents of an item , such as viewing tables, adding tables, editing existing tables, and more.

### UI Experience ###
First, in our sample item, we navigate to the FluentUI Playground tab to see the Lakehouse Explorer Component:

![An empty OneLake Item explorer](./media/lakehouse-explorer-empty.png)

We click on "Add" to choose our Item, prompting the Onelake Data Hub dialog to appear:

<img width="1000" alt="Onelake Datahub Dialog" src="./media/datahub-explorer-lakehouse.png">

Here, we see all the item artifacts of specific types that we have access to. Note, that the item can be in a different workspace than your artifact.

After selecting an item, the tables and files are loaded and can be selected in the UI.

<img height="500" alt="Loading Tables" src="./media/lakehouse-explorer-load-tables.png">
<img height="500" alt="Tables Loaded" src="./media/lakehouse-explorer-no-selection.png">
<img height="500" alt="Table Selecteds" src="./media/lakehouse-explorer-table-selected.png">

The UI is updated to reflect that 'my_table' is selected.

## Frontend ##
The implementation of the OneLake Item Explorer can be found here : [OneLake Item Explorer Component](../Workload/app/components/SampleOneLakeItemExplorer/SampleOneLakeItemExplorer.tsx)

First, we'll address the need for two different tree components, one to handle Items/Lakehouses that have a schema and one to handle Lakehouses that don't have a schema.

**What is a schema**? A schema is an upcoming feature of the Lakehouse artifact that allows us to organize tables. New Lakehouses will, in the future, be created with a default schema "dbo". The user will be able to add other schemas and create tables under them.

Old Lakehouses will retain their structure and will not have the schema property.

In the above sample flow, we chose an "old" Lakehouse that doesn't have a schema. For reference, this is the structure of a Lakehouse with the schemas property:

![Schema Table Selected](./photos/lakehouse-explorer-table-selected-with-schema.png)


### Step 1: Open the datahub selector dialog ###

We use the Datahub API in the SampleWorkloadController to open a dialog containing the Onelake data hub with the available Lakehouses. When a Lakehouse is selected we receive a response of the type **DatahubSelectorDialogResult**.

We extract the following information regarding the selected Lakehouse from the response:

```json
{
        id: artifactObjectId,
        workspaceId: workspaceObjectId,
        type: "Lakehouse", 
        displayName,
        description
}
```

This information will serve us in Step 2.

### Step 2: Call the Fabric Public APIs to fetch table data and Files data from Onelake ###
1. Acquires an access token
2. Fetches the tables in the Item using The controller
3. Sets the schema indicator and the tables to be displayed in the component. The schema indicator determines which tree component to render.

Please reference the [OneLake Item Explorer Controller](../Workload/app/controller/OneLakeItemExplorerController.t

