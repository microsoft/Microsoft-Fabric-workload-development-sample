
# Getting Started with WDKv2

In this section we will present all of the necessary steps to get started with the newest version of our Workload Development Kit. You are viewing the private preview of the WDKv2. Before you begin, be sure to [register your tenant](WDKv2-Introduction.md#register-for-private-preview) for private preview.

We look forward to hearing your feedback!

Getting started involves 5 Steps that are all outlined in this document below.

1. Clone this repository to your local machine
2. [Setup the development enviroment](#setup-the-development-enviroment)
3. [Start the development enviroment](#start-the-development-enviroment)
4. [Test the sample workload](#test-the-sample-workload)
5. [Start coding](#start-coding)

## Setup the development enviroment

To make it easy as possible we have created a [Setup.ps1](../scripts/Setup/Setup.ps1) script that will do all the work for you. This will replace all the manual steps that we are discribing in the next section. The setup script can e run without any parameters. While running it will ask you about the parameters that it nees to configure everything. You can specify certain parameters (see example below) in case you alreay have an existing Entra App or you want to change the default values like the Workload or item name.

```powershell
.\Setup.ps1 -WorkloadName "Org.MyWorkloadSample" -ItemName "SampleItem" -FrontendAppId "00000000-0000-0000-0000-000000000000"
```

* Make sure that the Poweshell execution policy is set to Unrestricted and the files are unblocked if you are getting asked if the ps files should be started.
* If you want to use an existing Entra application, make sure to configure the SPA redirect URIs in the application's manifest as described in this [section](./WDKv2-Setup-Manual.md#register-a-frontend-entra-application).
* Follow the guidance the Script provides to get everyting setup
* The WorkloadName needs to follow a specific pattern [Organization].[WorkloadName]. For Development purpose please use Org.[YourWorkloadName] as all other organization names will be rejected. You can find more information on how Workload names work for publishing in the [public documentation](https://learn.microsoft.com/en-us/fabric/workload-development-kit/publish-workload-flow).

For Mac and Linux use pwsh to start the powershell Scripts:

```bash
pwsh .\Setup.ps1 -WorkloadName "Org.MyWorkloadSample" -ItemName "SampleItem" -FrontendAppId "00000000-0000-0000-0000-000000000000" 
```

After the script finished successfully your enviroment is configured and ready to go. The Script will provide you with addtional information on the next steps to see your Workload light up in Fabric.

### Error handling

In case you are getting an error similar to the one below please make sure you have the latest Powershell installed and configured in the enviroment you run the script.

![Powershell setup error](./media/Powershell-setup-error.png)

## Start the development enviroment

After you have completed all of the above steps, you are ready to test the workload.
Start the workload in development mode:

1.Run [StartDevServer.ps1](../scripts/Run/StartDevServer.ps1) to start the local Development enviroment which includes the Frontend and APIs
2.Run [StartDevGateway.ps1](../scripts/Run/StartDevGateway.ps1) to register your local development instance with Fabric Backend
3.Navigate to the Fabric portal. Head to the Admin Portal settings and enable the following tenant settings:
  ![Setup Test](./media/Setup-Test-1.jpg)
4.Navigate to the Fabric Developer Settings and enable the Fabric Developer Mode:
   ![Setup Test](./media/Setup-Test-2.jpg)

You are ready to create your first Hello World Item in Fabric.

## Test the sample workload

To access your workload follow the steps below:

1.Navigate to `https://app.fabric.microsoft.com/workloadhub/detail/<WORKLOAD_NAME>?experience=fabric-developer`
2.Click the Hello World item type on the left
3.Select the development Workspace you have configured before in the dialog to create the item
4.The editor opens and the item is ready for use

Congratulations! You have created your first item from your development enviroment

## Start coding

Now that you are all set you can start following your own item ideas. For this you can either change the [HelloWorldItemEditor.tsx](../Workload/app/items/HelloWorldItem/HelloWorldItemEditor.tsx) or you can use the [CreateNewItem.ps1](../scripts/Setup/CreateNewItem.ps1) to create a new item.

Happy coding! 🚀
