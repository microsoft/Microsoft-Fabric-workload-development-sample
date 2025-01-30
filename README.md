
# Microsoft Fabric Software Developer Kit
Welcome to the Fabric workload development documentation. This comprehensive guide covers everything you need to know to create your own custom Fabric workload for your organization. We’re here to assist you every step of the way, so please don’t hesitate to reach out with any questions. Happy developing!

Note: The Fabric Workload SDK repository is currently in private preview and is subject to change. As such, there may be issues or missing documentation. We kindly request you to keep this in mind while using the repository. We are working hard to ensure that the repository is as stable and reliable as possible, and we appreciate your patience and understanding during this time.

If you need any further assistance, please don’t hesitate to ask.

# March update

We have introduced numerous updates and capabilities, in the latest update, including breaking changes which will require updating existing workloads, please review them in the [change log](/changelog.md). This changes will take effect from April 1st.

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
    - [What a Workload Offers](#what-a-workload-offers)
    - [Workloads Use Cases Examples](#workloads-use-cases-examples)
- [Build Your Own Workloads](#build-your-own-workloads)
    - [Introducing Workloads](#introducing-workloads)
    - [Fabric Workload Architecture](#fabric-workload-architecture)
- [Getting started with Frontend only](#getting-started-with-frontend-only)
    - [Prerequisites](#fe-prerequisites)
    - [Frontend Guides](#frontend-guides)
- [Development Environment](#development-environment)

- [Getting Started with Workload Backend](#getting-started-with-the-workload-backend)
    - [Prerequisites](#be-prerequisites)
    - [Backend Guide](#workload-be-guide)
    - [DevGateway Container Setup Guide](#fabric-dev-gateway)
    - [Resources](#resources)
- [Publication Process (TBD)](#publication)


# What is Fabric

## Introduction

Microsoft Fabric is a comprehensive analytics solution designed for enterprise-level applications. This platform encompasses a wide range of services, including data engineering, real-time analytics, and business intelligence, all consolidated within a single, unified framework.
The key advantage of Microsoft Fabric is its integrated approach, that eliminates the need for disparate services from multiple vendors. Users can leverage this platform to streamline their analytics processes, with all services accessible from a single source of truth.
Built on a Software as a Service (SaaS), Microsoft Fabric provides integration and simplicity, as well as a transparent and flexible cost management experience. This cost management experience allows users to control expenses effectively by ensuring they only pay for the resources they require.
The Fabric platform is not just a tool, but a strategic asset that simplifies and enhances the analytics capabilities of any enterprise.
For more information about Fabric [click here](https://learn.microsoft.com/en-us/fabric/get-started/microsoft-fabric-overview).


## What Are Workloads

Microsoft Fabric allows the creation of workloads, integrating your application within the Fabric framework. This enhances the usability of your service within a familiar workspace, eliminating the need to leave the Fabric environment. Fabric workloads increase user engagement and improve your application’s discoverability in the Fabric store, supporting compelling business models. The Fabric workspace includes various components, known as Fabric items, which handle the storage, analysis, and presentation of your data.

## What A Workload Offers

### Workload Extensibility Framework
This is a robust mechanism designed to enhance the existing Fabric experience by integrating custom capabilities. The entire Fabric platform has been engineered with interoperability in mind, seamlessly incorporating workload capabilities. For instance, the item editor facilitates the creation of a native, consistent user experience by embedding the customer's workload within the context of a Fabric workspace item.

### Universal Compute Capacity
Fabric comes equipped with a diverse array of compute engines, enabling customers to purchase and utilize Fabric services. To access premium features as well as any Fabric workloads, universal capacity must be allocated to a Fabric workspace (refer to [How to purchase Power BI Premium - Power BI | Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/enterprise/service-admin-premium-purchase)).

### Authentication
Fabric workloads integrate with Microsoft [Entra Id](https://learn.microsoft.com/en-us/entra/fundamentals/whatis) for authentication and authorization. All interactions between workloads and other Fabric or Azure components necessitate proper authentication support for incoming and outgoing requests, ensuring correct generation and validation of tokens.

### Fabric Permission Model
This represents user permissions pertaining to the workspace and specific items. It is utilized to inherit user permissions and applied as part of provisioning resources (see [Roles in workspaces in Power BI - Power BI | Microsoft Learn](https://learn.microsoft.com/power-bi/collaborate-share/service-roles-new-workspaces)).

### Monitoring Hub & Scheduler
The monitoring hub provides a comprehensive view of all background jobs to Fabric users, enhancing transparency and control.


## Workloads Use Cases Examples

In this section, we provide a few examples of use cases to help you understand their potential applications. However, it’s important to note that these are just a few of the many unique use cases that can be tailored to meet the specific needs of your organization. The versatility of workloads allows for a wide range of possibilities, enabling you to create solutions that are perfectly suited to your operational requirements. We encourage you to explore and experiment with different configurations to discover the full potential of what workloads can do for your organization.

### Data Job
This is one of the most common scenarios. Data jobs involve extracting data from OneLake, performing various data operations, and then writing the results back to OneLake. These jobs can be integrated with Fabric’s data scheduling capabilities and executed as background tasks. An example of this would be Data Pipelines Notebooks.

### Data Store
These are workloads that manage and store data. They can provide APIs to query and write data, serving as a robust and flexible data management solution. Examples include Microsoft Fabric Lakehouse and CosmosDB.

### Visual
These are data visualization applications that are entirely based on existing Fabric data items. They allow for the creation of dynamic and interactive visual representations of your data. Power BI reports or dashboards serve as excellent examples of this type of workload.


# Build Your Own Workloads

This chapter will cover the basic concepts and components of Fabric, and a dive into the step-by-step process of creating a workload. We’ll cover everything from setting up your environment, to configuring your workload, to deploying and managing it.

### Note
 Please ensure that you have these tools installed and properly configured before proceeding with the guide. If you don’t have these tools installed, you can find installation instructions on their respective official websites.


## Introducing Workloads
In the following sections, we will introduce the key components of our system and provide an overview of the architecture. These components work together to create a robust and flexible platform for your development needs. Let’s delve into these components and their roles within our architecture.

### Fabric Workload Architecture

* The workload Backend (BE) handles data processing, storage, and management. It validates Entra ID tokens before processing them and interacts with external Azure services, such as Lakehouse.
* The workload Frontend (FE) offers a user interface for job creation, authoring, management, and execution.
* User interactions via the FE initiates request to the BE, either directly or indirectly via the Fabric Backend (Fabric BE).

For more detailed diagrams depicting the communication and authentication of the various components see the [BE Authentication and Security](Backend/README.md#authentication-and-security) and the [Authentication Overview](Authentication/overview.md#authentication-overview) diagrams.

#### Frontend (FE)
The frontend serves as the base of the user experience (UX) and behavior. operating within an iframe in the Fabric portal. And provides the Fabric partner with a specific user interface experience, including an item editor. The extension client SDK equips the necessary interfaces, APIs, and bootstrap functions to transform a regular web app into a Micro Frontend web app that operates seamlessly within the Fabric portal.

#### Backend (BE)
The backend is the powerhouse for data processing and metadata storage. It employs CRUD operations to create and manage workload items along with metadata, and executes jobs to populate data in storage. The communication bridge between the frontend and backend is established through public APIs.

The workloads can run in two environments: local and cloud. In local (devmode), the workload runs on the developer’s machine, with API calls managed by the DevGateway utility. This utility also handles workload registration with Fabric. In cloud mode, the workload runs on the partner services, with API calls made directly to an HTTPS endpoint.

### Development environment
During the development cycle testing a workload on a non production tenant can be done in two mode, local (devmode) and cloud mode (tenant mode). For more information please see the relevant document.
Note that for each dev mode, there is a different package that is created when building the BE solution in Visual Studio.
- Dev mode workload package - When building the BE solution in Visual Studio, use the Debug parameter to create a BE nuget package, which can be loaded in to the Fabric tenant using the DevGateWay application.
![alt text](photos/dev-env-debug.png)

- Cloud mode workload package - When building the BE solution in Visual Studio, use the Release parameter to create a standalone workload package (BE and FE), this will package can be uploaded to tenant directly.
![alt text](photos/dev-env-release.png)

#### Local development mode (devmode)
The workload backend (BE) operates on the developer's machine. Workload API calls are transmitted via Azure Relay, with the workload's side of the Azure Relay channel managed by a specialized command-line utility, DevGateway. Workload Control API calls are sent directly from the workload to Fabric, bypassing the Azure Relay channel. The DevGateway utility also oversees the registration of the local development instance of the workload with Fabric, within a specific capacity context. This ensures the workload's availability across all workspaces assigned to that capacity. Upon termination of the DevGateway utility, the registration of the workload instance is automatically rescinded. For more information see [Backend Overview](/Backend/README.md)

##### DevMode schema
![alt text](photos/dev-mode-schema.png)

##### DevMode BE schema
![alt text](photos/dev-mode-be-schema.png)

#### Cloud development mode (cloudmode)
The workload backend (BE) operates within the partner's services. Workload API calls are made directly to the HTTPS endpoint, as specified in the workload manifest. In this scenario, the DevGateway utility is not required. The registration of the workload with Fabric is accomplished by uploading the workload nuget package to Fabric and subsequently activating the workload for the tenant. For more information see [Upload and Test in Cloud Mode](/UploadAndTestGuide.md)

##### CloudMode schema
![alt text](photos/cloud-mode-schema.png)
#### Lakehouse Integration
Our architecture is designed to integrate flawlessly with Lakehouse, enabling operations such as saving, reading, and fetching data. This interaction is facilitated through Azure Relay and the Fabric SDK, ensuring secure and authenticated communication.

#### Authentication and Security
We employ Entra ID (formerly AAD) for robust and secure authentication, ensuring that all interactions within the architecture are authorized and secure. For a complete introduction to the workload authentication as displayed in the diagram above, please refer to the authentication documents.:
1. [Workload Authentication - Setup Guide](Authentication/Setup.md)
2. [Workload Authentication - Architecture Overview ](Authentication/overview.md)
3. [Workload Authentication - Implementation Guide](BACKENDAUTH.md)

#### Item Discovery
Before getting started with the workload development, please review the item discovery schema that described the item creation, read and edit process and the recommended approach.
![alt text](<photos/item-discovery-part1.png>)

![alt text](<photos/item-discovery-part2.png>)

## Getting started with Frontend only

### FE Prerequisites
Before we dive into the guide, there are a few prerequisites that you need to have installed on your system. These tools will be used throughout the guide, so it’s important to ensure that you have them set up correctly.
#### Git
A distributed version control system that we’ll use to manage and track changes to our project.
#### NPM (Node Package Manager)
This is the default package manager for Node.js and it’s used to manage and share the packages that you use in your project.
#### Node.js
An open-source, cross-platform, JavaScript runtime environment that executes JavaScript code outside a web browser. We’ll use this to run our server-side JavaScript code.
#### Webpack
A static module bundler for modern JavaScript applications. It helps to bundle JavaScript files for usage in a browser.
#### Webpack CLI
The command line interface for Webpack. This allows us to use Webpack from the command line.
This guide outlines the setup for development workload sample in Fabric tenant. It involves enabling the workload feature and Developer mode in the designated tenant. It assumes you have Node.js and npm installed, and walks you through the entire process of running a locally hosted workload frontend.

In the context of executing the workload SDK sample and building a workload, it is strongly recommended to employ a dedicated development tenant. This practice ensures an isolated environment, minimizing the risk of inadvertent disruptions or modifications to production systems. Moreover, it provides an additional layer of security, safeguarding production data from potential exposure or compromise. Adherence to this recommendation aligns with industry best practices and contributes to a robust, reliable, and secure development lifecycle.

### Frontend Guides:

#### [FE Quick Setup guide](Frontend/README.md#installation-and-usage): provides a fast and straightforward way to add and test the sample Frontend (FE) workload to your Fabric capacity. It’s perfect for those who want to quickly see the workload in action.

#### [FE Deep Dive guide](Frontend/README.md#package-structure): A comprehensive guide walks you through the process of customizing the sample workload. It’s ideal for those who want to tailor the workload to their specific needs.
The UX workload frontend, a standard web app, uses an extension client SDK to operate within the Fabric portal, providing workload-Specific UI experiences. This SDK can be installed in Angular or React applications, with React recommended for compatibility with the Fluent UI library. The package also includes a UX workload Sample implementation built on Fluent UI, designed for React. Alongside the web app, workloads must provide a UX workload Frontend Manifest, a JSON resource containing essential information about the workload. This combination allows workloads to integrate their web applications within the Fabric portal, ensuring a consistent user experience.

### Note
* #### Both the FE Quick Setup and the FE Deep Dive guides can be found in the [FE Readme](Frontend/README.md).

* #### Prior to customizing the sample workload, Implementing the Frontend (FE) authentication token as outlined in the [Authentication Guide](Authentication/Setup.md#configuring-your-workload-local-manifest-and-acquiring-a-token-for-your-application-frontend).


## Getting Started with the Workload Backend
This chapter provides a comprehensive walkthrough for setting up and configuring the workload BE. Fabric developer sample project is built on the .NET 7 framework and utilizes various tools and packages to deliver a high-performance backend solution.

### BE Prerequisites
Before proceeding with the project setup, ensure the following tools and packages are installed and configured:

#### .NET 7.0 SDK
The project is built on the .NET 7 framework. Download and install the .NET 7.0 SDK from the official .NET website.
#### Visual Studio 2022
The project requires Visual Studio 2022 due to its dependency on .NET 7. Note that .NET 6.0 or higher in Visual Studio 2019 is not supported.
#### NuGet Package Manager
The NuGet Package Manager should be integrated into your Visual Studio installation for managing external libraries and packages.

#### The workload BE has dependencies on the following Azure SDK packages:

* Azure.Core
* Azure.Identity
* Azure.Storage.Files.DataLake
* Microsoft Identity package

### Workload BE Guide
With the prerequisites in place, you can proceed with the project configuration. The rest of your guide can follow from here. This includes cloning the project, setting up the workload configuration, and generating a manifest package file. Remember to update the necessary fields in the configuration files to match your setup. To get started with a step-by-step guide, please refer to our [Backend Workload Configuration Guide](Backend/README.md).

### Fabric DevGateway Container Setup
Follow [this guide](/tools/DevGatewayContainer/README.md) to setup and run the DevGateway in a Docker container.
If you prefer run the DevGateway without Docker, it can be downloaded from [Microsoft Download Center](https://www.microsoft.com/en-us/download/details.aspx?id=105993)
> Note that the downloaded version can only be run on Windows.

# Resources
Here are all the resources included and referenced. These documents provide additional information and can serve as a reference:
* [Authentication Overview](Authentication/overview.md)
* [Authentication Setup Guide](Authentication/Setup.md)
* [Authentication JavaScript API](Authentication/authJSAPI.md)
* [Backend Configuration Guide](Backend/README.md)
* [Frontend Configuration Guide](Frontend/README.md)
* [DevGateway Container Setup Guide](/tools/DevGatewayContainer/README.md)
* [Frontend Manifest](Frontend/frontendManifest.md)
* [Backend API Requests Authentication Overview](BACKENDAUTH.md)
* [Monitoring Hub Configuration Guide](MonitoringHub.md)
* [Backend REST APIs](Backend/docs/BE-Rest-APIs.md)



# Publication

Please note that the publication process is currently unavailable. We understand the importance of this and are working diligently to make it accessible. We appreciate your patience and assure you that it will be added shortly. Stay tuned for updates!

# Consideration and Limitation

See [Release Notes](./ReleaseNotes.md)
