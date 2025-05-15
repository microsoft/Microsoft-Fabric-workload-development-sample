# Microsoft Fabric - Frontend Developer sample

This repository serves as a guide and demonstration for integrating a custom UX Workload with Microsoft Fabric. With this project, developers can seamlessly integrate their own UI components and behaviors into Fabric's runtime environment, enabling rapid experimentation and customization. 

# Overview #

With Fabric as a platform for building workloads, using its Extensibility framework, developers can expand the existing Fabric experience by creating custom capabilities. The entire Fabric platform was designed to be interoperable with ISV capabilities. For example, the item editor allows creating a native, consistent user experience by embedding ISV’s frontend in the context of a Fabric workspace item.

The UX Workload Frontend is a standard web app that incorporates our extension client SDK, a standard NPM package, to enable its functionality. 
Hosted by the ISV, it runs within an `<iframe>` in the Fabric portal and presents ISV-specific UI experiences, such as an item editor. 
The extension client SDK provides all the necessary interfaces, APIs and bootstrap functions required to transform a regular web app into a Micro Frontend web app that operates seamlessly within the Fabric portal.   

The SDK can be installed in Angular or React applications; we recommend React. 

With React, developers can leverage the Fluent UI library, which aligns with Fabric UI.  
This compatibility makes it easy to adopt the look and feel of the Fabric portal. 

Note: Not all Fabric tenants have the ability to enable the workload extensions. There is a process that can be followed to enable your Fabric to allow the workload extensions.

## UX Workload Sample implementation ##

This package is built on top of the Fluent UI and is specifically designed for React and at least for now will not be supported by Angular. 
It provides a sample UI that showcases the usage of most of the available SDK calls, demonstrates a sample of the Fluent UI-based extensible **Ribbon** that visually matches the look and feel of Fabric, and allows easy customization, observing changes in Fabric in real time, while in Fabric Development Mode.

## UX Workload Frontend Manifest ##

Alongside the UX Workload Web App, the ISV is required to provide a JSON resource called the UX Workload Frontend Manifest - consisting of several files.
This manifest contains essential information about the workload, such as the URL of the workload web app, and various UI details like the display name of the ISV item and associated icons. 
In addition, the manifest provides the ISV with the ability to customize what happens when users interact with their items in the Fabric portal (e.g user clicks on the ISV item in the workspace) 

In this package, the manifest files are located here, under the `Package` folder: [Frontend Manifest files](./Package/)  (and a detailed description can be found [here](./frontendManifest.md)

By combining these two components, the Fabric UX Workload enables ISVs to seamlessly integrate their web applications within the Fabric portal, providing a consistent user experience and leveraging Fabric features. 

The following diagram depicts how Fabric is using the Manifest for reading the Workload's metadata and behavior and how it is embedding the Workload's Web App inside of Fabric's iFrame.

![DEVX diagram](./docs/devxDiagram.png)

## Installation and Usage ## 
A prerequisite for using custom workloads in Fabric is enabling this feature in Admin Portal by the Tenant Administrator.
This is done by enabling the switch 'Workload extensions (preview)' - either for the entire organization, or for specific groups within the organization.

![Workloads tenant switch](./docs/tenantSwitch.png)

To get started with the Sample Project, follow these simple steps:

0. **Verify** `Node.js` and `npm` are installed. The `npm` version should be at least **9** (installing **latest** `Node.js` and `npm` is ok.)


1. **Install**. Notice existing packages under `node_modules` !
   Clone the repository:

   ```
   git clone https://github.com/microsoft/Microsoft-Fabric-developer-sample.git
   ```

   Under the repository folder, go to `Frontend` and run **npm install** 
   ``` 
   <repository folder>\Frontend> npm install
    ```


2. **Start server**
   ```
   <repository folder>\Frontend> npm start
   ```

   This starts a **local** Node.js server (using `webpack`), that Microsoft Fabric will connect to when in Development Mode.
   
   Refer to the localhost server notes for port details, that appear after it has started.
   Current port is `60006`.
   After the localhost server has been started, opening the URL: `127.0.0.1:60006/manifests` will fetch the contents of the `localWorkloadManifest.json` manifest file.
   This can be done to verify that the server is up and running.

   Modifying source files triggers a reload of contents in Fabric through `webpack`, if already connected.
   However, typically, this would still necessitate a page refresh.

   If you make changes to the `localWorkloadManifest.json` manifest file, refresh the Fabric page to reload the manifest.

3. **Run**
   In Fabric - enable the Frontend Developer mode setting, allowing Fabric to access your localhost server
   This is done via Developer Settings --> Fabric Developer Mode (and a refresh of the page).
   This setting is persisted in the current browser.

   ![Enabling Developer Mode](./docs/devMode.png)
   
   

# Sample Usage #

Running a typical *Hello World* test scenario:

After starting the local server and enabling Dev Mode, the menu at the left bottom corner should show the new Sample Workload:
![Product Switcher Example Image](./docs/productSwitcher.png)

Select the **Sample Workload** and navigate the user to the Sample workload Home page. The upper section presents the Create Experience:
![Create Card Image](./docs/createCard.png)

Clicking on *Sample Item* will open a dialog for creating a new item, and if the [backend](../Backend/README.md) is configured - the newly saved item will be opened for editing.
![Create dialog image](./docs/createDialog.png)


For testing out the various APIs and UI controls, while remaining in a Frontend-only experience - we provide the *Sample Item - Frontend only* card, which opens the same UI, but without an ability to perform CRUD or Jobs operations.

![Main Sample UI image](./docs/sampleEditor.png)

The tabs at the top split the functionality of the sample into distinct areas:
-  **Home** + **Jobs** for working with CRUD, Jobs and Lakehouse-related aspects, explored in details in the Backend documentation section.

- **FluentUI Playground** - examples of the commonly used Fluent UI controls

- **API Playground** - a playground for exploring the provided ExtensionClient API (SDK)

![APIs](./docs/editorAPI.png)

Explore the various controls to see Fabric's ExtensionClient API (SDK) capabilities - open Notifications and Dialogs, Navigate to pages, get Theme and Workload settings, Execute Actions, etc. Most of the available SDK functionality is either wired to the buttons' actions, or registered as callbacks. The results are usually a Notification or a Message Box, showing that some API has been invoked. 
Some examples:
* the *Execute Action* calls the `action.execute()` API with an action named "sample.Action". The action's functionality is to show a Notification
* click on the *Save* button on the Ribbon to call the `dialog.open()` API, which opens a dialog where a user provides a name and saves the item in Fabric (this is further explored in the CRUD section below)
* *Get Theme Settings* button shows a list of Fabric's Theme configurations (via the `theme.get()` API)

The Sample Workload UI is hosted in a Fabric `iframe` which we can see when we examine the page's DOM:
![IFrame embedding image](./docs/iframeDOM.png)

# Frontend repository structure #
This is the Frontend repository directory layout, with a description of the essential components and resources

* **docs** - SDK documentation, images
* **Package** - location of the workload package: Frontend resources, including manifests and assets.
* **src** - Workload code:
    + **index.ts** - main initialization file, `boostrap`-ing the `index.worker` and `index.ui` IFrames - *detailed below*
    + **App.tsx** - routing of paths to pages, e.g. - `/sample-workload-editor` is routed to the `SampleWorkloadEditor` function under `components`
    
    + **components** - location of the actual UI code - the Editor view, and other views that are used by the sample (Ribbon, Authentication page, Panel, etc...)
    + **controller** - the Controller that is calling the SDK APIs
    + **models** - the contracts and models in use by the UI itself and for communication with the boilerplate's Backend
    + **tools** - 
      + `webpack.config.js` - configuration of the local Node.js server
      + web configuration and manifest reader/processor

# Diving into the code #

## bootstrap() ##

Before bootstrapping, we check if we need to close the window by checking the path - this is needed for authentication API (see more in authentication section).

```
const redirectUriPath = '/close';
const url = new URL(window.location.href);
if (url.pathname?.startsWith(redirectUriPath)) {
    window.close();
}
```

Every Fabric Workload App needs to support being loaded in two modes:

* UI mode: App in UI mode is loaded in visible IFrames and listens for its own route changes to render corresponding UI components, including pages, panels, dialogs, and so on.
* Worker mode: App in worker mode runs in an invisible IFrame, which is mainly used to receive commands sent from the outside world and respond to them.
`@ms-fabric/workload-client` provides a `bootstrap()` method to simplify the initialization steps. The bootstrap() method internally detects whether the current App is loaded in UI mode or worker mode, and then calls the appropriate initialization method (initializeUI vs. initializeWorker). After the initialization is complete, bootstrap() notifies Fabric micro-frontend framework of the initialization success or failure.

```
bootstrap({
    initializeWorker: (params) =>
        import('./index.worker').then(({ initialize }) => initialize(params)),
    initializeUI: (params) =>
        import('./index.ui').then(({ initialize }) => initialize(params)),
});
```

## index.worker ##

Here we have the main 'onAction' registration, handling events sent from the Fabric host, which are themselves triggered by executed *actions*.
These actions can be either sent by the workload itself - to Fabric - and then called-back into the onAction handler; or initiated by the Fabric host - e.g. when clicking on 'Create Sample Item - Frontend Only', Fabric triggers the action 'open.createSampleWorkloadFrontendOnly', and the onAction handler initiates the opening of the workload main UI page, as seen in the code below.
The current workspace objectId is passed into the Frontend-only experience as well.
```
   extensionClient.action.onAction((message) => {
        switch (message.action) {
            /**
             * This opens the Frontend-only experience, allowing to experiment with the UI without the need for CRUD operations.
             * This experience still allows saving the item, if the Backend is connected and registered
             */
            case 'open.createSampleWorkloadFrontendOnly':
                const { workspaceObjectId: workspaceObjectId1 } = data as ArtifactCreateContext;
                return extensionClient.page.open({
                    extensionName: 'Org.WorkloadSample',
                    route: {
                        path: `/sample-workload-frontend-only/${workspaceObjectId1}`,
                    },
                });

                // ... elided for brevity...
            default:
                throw new Error('Unknown action received');
        }
    });
```

The invocation and handling of action can be described by this diagram:
![Actions Invocation](./docs/actions.png)


## index.ui ##

The `initialize()` function renders the React DOM where the `App` function is embedded. We pass the `extensionClient` SDK handle which is used throughout the code to invoke the API calls.
The `FluentProvider` class is for style consistency across the various FluentUI controls in use.

 ```
 ReactDOM.render(
        <FluentProvider theme={fabricLightTheme}>
            <App
                history={history}
                extensionClient={extensionClient}
            />
        </FluentProvider>,
        document.querySelector("#root")
    );
 ```

 ## Development flow ##

 * `App` routes the code into the `SampleWorkloadEditor`, which is a **function** returning a `React.JSX.Element`.
 * It contains the UI structure (the Ribbon and the controls on the page - buttons, input fields, etc...).
 * Information collected from the user is stored via React's `useState()`
 * Handlers of the UI controls call the SampleWorkloadController functions, and pass the relevant state variables.
 * In order to support the CRUD operations, the state of the created/loaded item is stored in `artifactItem`, along with `workspaceObjectId` and a sample implementation of payload variables.

 An example with `notification.open()` API:

+ state:
   ```const [apiNotificationTitle, setNotificationTitle] = useState<string>('');
      const [apiNotificationMessage, setNotificationMessage] = useState<string>('');
   ```
+ UI:
   + Title:
   ``` 
      <Field label="Title" validationMessage={notificationValidationMessage} orientation="horizontal" className="field">
         <Input size="small" placeholder="Notification Title" onChange={e => setNotificationTitle(e.target.value)} />
       </Field>
   ```
   + Send Button:
   ```
      <Button icon={<AlertOn24Regular />} appearance="primary" onClick={() => onCallNotification()} > Send Notification </Button>
   ```
   + Handler:
   ```
      function onCallNotification() {
       ... elided for brevity
        callNotificationOpen(apiNotificationTitle, apiNotificationMessage, undefined, undefined, extensionClient, setNotificationId);
      };
   ```
+ Controller:
```
   export async function callNotificationOpen(
    title: string,
    message: string,
    type: NotificationType = NotificationType.Success,
    duration: NotificationToastDuration = NotificationToastDuration.Medium,
    extensionClient: ExtensionClientAPI,
    setNotificationId?: Dispatch<SetStateAction<string>>) {

    const result = await extensionClient.notification.open({
        notificationType: type,
        title,
        duration,
        message
    });
    if (type == NotificationType.Success && setNotificationId) {
        setNotificationId(result?.notificationId);
    }
}
```
## CRUD operations ##

While a Frontend-only development scenario is easily supported, the full End-to-end developer experience requires saving, reading and editing existing workload items.
The setup and use of the Backend side is described in details in the Backend section of this repository [Backend documentation](../Backend/README.md)

Once the backend is up and running, and the Org.WorkloadSample.SampleWorkloadItem type is **registered in Fabric**, it's possible to perform CRUD operations on this type.
These operations are exposed via `ItemCrudAPI` inside of `WorkloadClientAPI` - [ItemCrud API](./node_modules/@ms-fabric/workload-client/src/workload-client.d.ts)

### CREATE ###
A sample call to `create`, as implemented when saving the workload item for the first time:
```
 const params: CreateArtifactParams = {
        workspaceObjectId,
        payload: { artifactType, displayName, description, workloadPayload: JSON.stringify(workloadPayload), payloadContentType: "InlineJson", }
    };
 const result: CreateArtifactResult = await extensionClient.artifactCrud.createArtifact(params);
```

Our sample implementation is storing the created item inside of the `artifactItem`.
Notice that the item will be created under the *currently selected workspace*. This requires the workspace to be assigned to the capacity that is configured by the backend configuration, as detailed in the backend docs.
An attempt to create an item under a non-compatible workspace will fail.

! The `onCreateFabricItem` callback in the backend is blocking the CREATE call - a failure there will fail the operation and no item would be created in Fabric. See backend's debugging/TSG documentation.

! Currently a saved item doesn't automatically appear in the workspace and a page refresh is needed. 

### GET ###
When clicking on an existing Sample Workload item in the workspace view, Fabric navigates to the route that is defined in the Frontend manifest, under `artifacts`-->`editor`-->`path`:
```
"artifacts": [
		{
			"name": "Org.WorkloadSample.SampleWorkloadItem",
			"editor": {
				"extension": "Org.WorkloadSample",
				"path": "/sample-workload-editor"
			},
```

As we invoke `artifactCrud.getArtifact`, the data is loaded from Fabric's backend (along with data from the Workload Backend), and is loaded into the `artifactItem` object of the opened GUI.
![Opening existing items](./docs/itemsInWorkspace.png)

### UPDATE ###
An existing item can be updated via `artifactCrud.updateArtifact` - currently the Workload payload itself is updated by the Workload Backend, while in Fabric only the item's "lastModifiedTime" is changed.

### DELETE ###
The delete operation can be called either from Fabric's Workspace view (as a general action available for all items), or via an explicit call from the Workload to `artifactCrud.deleteArtifact`.
Both calls would end up going throught the Workload backend's `onDeleteItem` callback

 ## Authentication ##
 In sample workload editor, there's a section that lets you navigate to the authentication section.
 Before using authentication API, an AAD app is required to be configured the right way in AAD.
 Additionally, ensure that your env.dev file is configured accurately. For more details about authentication, refer to [link](../Authentication/Setup.md#configuring-your-workload-local-frontend-app-manifest-and-acquiring-a-token-for-your-application-relevant-only-when-running-your-workload-web-app-locally).

# Debugging #

Open the **Source** tab of the browser's DevTools (F12) to see the Worker and UI IFrames:
![Debugging image](./docs/debugging.png)

We can place a breakpoint both in the Worker IFrame and see the main `switch` on the incoming Action, as well as debug the UI IFrame, e.g. the code inside `SampleWorkloadEditor`.

# Fluent UI controls #

UX Workloads are using Fluent UI controls to provide visual consistency with Fabric and ease of developement. The Sample Workload provides examples of usage of the most common controls. 
Additional information can be found [on the Fluent UI page](https://develop.fluentui.dev/get-started/develop)


# Frontend Manifest customization #
As mentioned, the frontend manifest describes the frontend aspects of the workload - appearance of the product, names, visual assets, available actions, and is the main point of contact of Fabric with the workload. 
For our sample workload, the `localWorkloadManifest.json` is the manifest that is loaded into Fabric in Developer mode, and its various sections, definitions and examples of the manifest are shown [here](./frontendManifest.md).
Changes to the manifest's entries, the wiring of different actions and updating of visual assets can be seen in real time after a page refresh.

# Extension Client SDK - supported APIs #

The SDK documentation is located [in the docs section of this repo](./docs/client-3p/index.html)
To view it, download or clone the repo. and open the `index.html` from the file system.
This is the API documentation that can be seen in each of the SDK's files.

A list of the currently- supported APIs:

* notification.open
* notification.hide
* panel.open
* panel.close
* action.onAction
* action.execute
* navigation.navigate
* navigation.onNavigate
* navigation.onBeforeNavigateAway
* navigation.onAfterNavigateAway
* page.open
* dialog.openDialog
* dialog.openMessageBox
* dialog.close
* theme.get
* theme.onChange
* settings.get
* settings.onChange
* errorHandling.openErrorDialog
* errorHandling.handleRequestFailure
* artifactCrud.createArtifact
* artifactCrud.getArtifact
* artifactCrud.updateArtifact
* artifactCrud.deleteArtifact
* artifactSchedule.runArtifactJob
* artifactSchedule.cancelArtifactJob
* artifactRecentRuns.open

# Environment Configuration in Workload Frontend Repository

## Purpose of Environment Configuration

Environment configuration is an essential aspect of developing web applications. It allows us to tailor the application's behavior to different environments, such as development, testing, and production. In our project, we utilize environment-specific `.env` files to manage configuration variables easily.

## Structure of Environment Configuration Files

We have three `.env` files in our repository, each serving a specific purpose:

1. **.env.dev**: This file is used when running the application in development mode (`npm start`). It contains configuration variables tailored for local development, including the workload name and backend URL. Additionally, it includes settings related to authentication for frontend development.

2. **.env.test**: Used during the testing phase (`npm build:test`), this file sets up configuration variables suitable for running tests. It primarily focuses on the workload name and backend URL.

3. **.env.prod**: When building the application for production (`npm build:prod`), this file provides configuration variables optimized for deployment in a production environment. Similar to the other files, it defines the workload name and backend URL.

## Modifying Configuration Variables

To modify the configuration variables for different environments, follow these steps:

1. Open the respective `.env` file (`.env.dev`, `.env.test`, `.env.prod`) in the repository.

2. Update the values of the configuration variables as needed. For example, you may need to change the `WORKLOAD_NAME` or `WORKLOAD_BE_URL` based on the target environment.

## Important Notes

- Ensure that the .env file, specifically the workload name, matches the one defined in the workload xml file to prevent unexpected behavior during development, testing, or production.
- Refer to the documentation or comments within each `.env` file for additional context on specific configuration variables.

