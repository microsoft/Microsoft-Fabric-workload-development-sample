# Nuget Structure Documentation

The Nuget file representing the Workload has the following structure:

- BE
    - WorkloadManifest.xml
    - Item1.xml
    - Item2.xml
    - ...
- FE
    - assets
        - icon1.svg
        - icon2.svg
        - ...
    - Product.json
    - Item1.json
    - Item2.json
    - ...

The Nuget file is comprised of two parts:

- BE part contains XMLs for Workload and Items definitions that are registered in Fabric.
    - Notes:
         - "WorkloadManifest.xml" has to be the exact name of your workload's manifest, verified in Fabric.
         - Item1/Item2... represent the Item manifests, no naming constraints.
- FE part contains JSONs for Product and Items FE related definitions and an 'assets' folder of all icons used by FE code.
    - Notes:
        - "Product.json" has to be the exact name of your product's frontend manifest, verified in Fabric.

This structure, including subfolders' names (e.g. `BE`, `FE`, `assets`), is mandatory and enforced by Fabric, and is used for all Upload scenarios - test packages and dev packages.
In the Boilerplate, the structure is defined by the .nuspec files located at ./src/Packages/manifest/ManifestPackage[Debug/Release].nuspec.
For more information on nuget packaging and structure, please refer to [Package creation workflow]( https://learn.microsoft.com/en-us/nuget/create-packages/overview-and-workflow).
