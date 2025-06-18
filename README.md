
# Microsoft Fabric Software Developer Kit

Welcome to the Fabric Workload Development Kit. This comprehensive guide covers everything you need to know to create a custom Fabric workload for your organization. We’re here to assist you every step of the way, so please don’t hesitate to reach out with any questions. Happy developing!

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft
trademarks or logos is subject to and must follow 
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.

## Table of contents

- [Introduction](#introduction)
  - [What is Fabric](#what-is-fabric)
  - [What are Workloads](#what-are-workloads)
  - [What the Workload Development Kit Offers](#what-the-workload-development-kit-offers)
- [Build Your Own Workload](#build-your-own-workload)
  - [Get Started](#get-started)
  - [Implement Your Custom Workload](#implement-your-custom-workload)
  - [Publish your workload](#publish-you-workload)
- [Resources](#resources)

# Introduction

## What is Fabric

Microsoft Fabric is a comprehensive analytics solution designed for enterprise-level applications. This platform encompasses a wide range of services, including data engineering, real-time analytics, and business intelligence, all consolidated within a single, unified framework.

The key advantage of Microsoft Fabric is its integrated approach, that eliminates the need for distinct services from multiple vendors. Users can leverage this platform to streamline their analytics processes, with all services accessible from a single source of truth.

Microsoft Fabric provides integration and simplicity, as well as a transparent and flexible cost management experience. This cost management experience allows users to control expenses effectively by ensuring they only pay for the resources they require.

The Fabric platform is not just a tool, but a strategic asset that simplifies and enhances the analytics capabilities of any enterprise.
For more information about Fabric [click here](https://learn.microsoft.com/en-us/fabric/get-started/microsoft-fabric-overview).

## What Are Workloads

In Microsoft Fabric, workloads signify different components that are integrated into the Fabric framework. Workloads enhance the usability of your service within the familiar Fabric workspace, eliminating the need to leave the Fabric environment for different services. [Data Factory](https://learn.microsoft.com/en-us/fabric/data-factory/data-factory-overview), [Data Warehouse](https://learn.microsoft.com/en-us/fabric/data-warehouse/data-warehousing), [Power BI](https://learn.microsoft.com/en-us/power-bi/enterprise/service-premium-what-is) and [Fabric Activator](https://learn.microsoft.com/en-us/fabric/real-time-intelligence/data-activator/activator-introduction) are some of the built-in Fabric workloads.

## What is the Workload Development Kit

With the Workload Development Kit, you can create your own workload for your data applications. Publishing a Fabric Workload to the [Fabric Workload Hub](https://learn.microsoft.com/en-us/fabric/workload-development-kit/more-workloads-add) increases your application’s discoverability and user engagement. The Microsoft Fabric Workload Development Kit provides the necessary tools and interfaces to embed your data application into Microsoft Fabric.

For more information on what workloads can offer Microsoft partners, and for useful examples, head to our official [Workload Dev Kit documentation](https://learn.microsoft.com/en-us/fabric/workload-development-kit/development-kit-overview).

You can also learn more about the Fabric workload architecture [here](https://learn.microsoft.com/en-us/fabric/workload-development-kit/workload-environment).


# Build Your Own Workload

This repository provides the basis for you to get started building your customer workload.

## Get Started

### Prerequisits
To run the development enviroment locally you need the follwoing components:

* [Node.js](https://nodejs.org/en/download/)
* [Powershell](https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell)
* [VSCode](https://code.visualstudio.com/download) or simmilar development enviroment
* [Fabric Tenant](https://app.fabric.microsoft.com/) that you use for development and publishing the Workload later on
* [Fabric Workspace](https://learn.microsoft.com/en-us/fabric/fundamentals/workspaces) that you can use to build your workload
* [Fabric Capacity](https://learn.microsoft.com/en-us/fabric/enterprise/licenses) that is assigned to the workspace you are planning to use
* [Entra App](https://entra.microsoft.com/) You either need an existing Entra App you can use that is [configured](./docs/WDKv2-How-To.md) corectly or you need permission to create a new Entra App.

### Setting things up

* Clone or fork this repository
```
git clone -b wdkv2_preview https://github.com/microsoft/Microsoft-Fabric-workload-development-sample.git
```
* Run the [Setup.ps1](./scripts/Setup/Setup.ps1) Script in your local repository with your configuration parameters.

```
.\Setup.ps1 -WorkloadName "Org.MyWorkloadSample" -ItemName "SampleItem" -AADFrontendAppId "00000000-0000-0000-0000-000000000000"
```
* Follow the guidance the Script provides to get everyting setup

Alternatively you can use the documentation for a step-by-step guide to getting your environment set up and your first workload up and running: [Getting Started](/docs/WDKv2-Setup.md).

## Implement your custom workload

After you have completed the initial steps you are all set to start adopting the Workload semple to your needs. 

Be sure to look at what has been released with the [newest version of the WDK](/docs/WDKv2-Introduction.md) and our guide on [how to use those new features](docs/WDKv2-How-To.md).

## Publish your workload

After developing your Fabric Workload according to the [certification requirements](https://learn.microsoft.com/en-us/fabric/workload-development-kit/publish-workload-requirements), you can publish it to the Workload Hub which will allow every Fabric user a chance to easily start a trial experience and then buy your workload. Use the  in-depth description of [how to publish a workload](https://learn.microsoft.com/en-us/fabric/workload-development-kit/publish-workload-flow) for the different stages and concepts provided by the platform. 

# Resources

Here are all the resources included and referenced. These documents provide additional information and can serve as a reference:
* [WDK Documentation](https://learn.microsoft.com/en-us/fabric/workload-development-kit/)
* [Quickstart Guide](/docs/WDKv2-Setup.md)
* [Workload Architecture](https://learn.microsoft.com/en-us/fabric/workload-development-kit/workload-environment)
* [Authentication Overview](https://learn.microsoft.com/en-us/fabric/workload-development-kit/authentication-concept)
* [OneLake](https://learn.microsoft.com/en-us/fabric/onelake/onelake-overview)
* [One Lake APIs](https://learn.microsoft.com/en-us/fabric/onelake/onelake-access-api)
* [Frontend Configuration Guide](https://learn.microsoft.com/en-us/fabric/workload-development-kit/extensibility-front-end)
* [Backend Implementation Guide](https://learn.microsoft.com/en-us/fabric/workload-development-kit/extensibility-back-end)
* [DevGateway Container Setup Guide](/tools/DevGatewayContainer/README.md)
* [Backend API Requests Authentication Overview](https://learn.microsoft.com/en-us/fabric/workload-development-kit/back-end-authentication)
* [Monitoring Hub Configuration Guide](https://learn.microsoft.com/en-us/fabric/workload-development-kit/monitoring-hub)
* [Backend REST APIs](https://go.microsoft.com/fwlink/?linkid=2271986)
* [Publish a workload to the Workload Hub](https://learn.microsoft.com/en-us/fabric/workload-development-kit/publish-workload-flow)
