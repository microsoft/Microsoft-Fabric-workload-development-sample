param (
    [string]$HostingType = "FERemote",
    [String]$WorkloadName = "Org.MyWorkloadSample",
    [String]$ItemName = "SampleItem",
    [String]$AADFrontendAppId = "00000000-0000-0000-0000-000000000000",
    [String]$AADBackendAppId
)


Write-Output "Setting up the environment..."

# Run SetupDevGateway.ps1
$setupDevGatewayScript = Join-Path $PSScriptRoot "..\Setup\SetupDevGateway.ps1"
if (Test-Path $setupDevGatewayScript) {
    $workspaceId = Read-Host "Enter your Entra Workspace Id"
    Write-Host "Running SetupDevGateway.ps1..."
    & $setupDevGatewayScript -WorkspaceGuid $workspaceId
} else {
    Write-Host "SetupDevGateway.ps1 not found at $setupDevGatewayScript"
}

if ([string]::IsNullOrWhiteSpace($AADFrontendAppId) -or $AADFrontendAppId -eq "00000000-0000-0000-0000-000000000000") {
    Write-Warning "AADFrontendAppId is not set or is using the default placeholder value."
    Write-Host "Please provide a valid AADFrontendAppId for your Entra Application or run CreateDevAADApp.ps1 to create one."
    $AADFrontendAppId = Read-Host "Enter your Entra Workspace Id"
}

# Run SetupWorkload.ps1
$setupWorkloadScript = Join-Path $PSScriptRoot "..\Setup\SetupWorkload.ps1"
if (Test-Path $setupWorkloadScript) {
    Write-Host "Running SetupWorkload.ps1..."
    & $setupWorkloadScript -HostingType $HostingType `
        -WorkloadName $WorkloadName `
        -ItemName $ItemName `
        -AADFrontendAppId $AADFrontendAppId `
        -AADBackendAppId $AADBackendAppId
} else {
    Write-Host "SetupWorkload.ps1 not found at $setupWorkloadScript"
}

Write-Output "Building the manifes..."

# Prompt user to build the manifest package
$buildManifestScript = Join-Path $PSScriptRoot "..\Build\Manifest\build-package.ps1"
if (Test-Path $buildManifestScript) {
    $buildManifestScriptFull = (Resolve-Path $buildManifestScript).Path
    & $buildManifestScriptFull -WorkloadName $WorkloadName -ItemName $ItemName
    Write-Host ""
    Write-Host "Manifest has been built. If you change configuration, please run the following script again:"
    Write-Host "`"$buildManifestScriptFull`""
} else {
    Write-Host "build-package.ps1 not found at $buildManifestScript"
}

Write-Host ""
Write-Host "Everything is set up."
Write-Host "Now you can run the following scripts to start your development environment."
Write-Host "--------------------------------------------------------------------------------"


# Prompt user to run StartDevGateway.ps1 with absolute path
$startDevGatewayScript = Join-Path $PSScriptRoot "..\Run\StartDevGateway.ps1"
if (Test-Path $startDevGatewayScript) {
    $startDevGatewayScriptFull = (Resolve-Path $startDevGatewayScript).Path
    Write-Host ""
    Write-Host "To start DevGateway, please run the following script:"
    Write-Host "`"$startDevGatewayScriptFull`""
} else {
    Write-Host "StartDevGateway.ps1 not found at $startDevGatewayScript"
}


# Promt user to run mpn start
Write-Host ""
Write-Host "To start the Frontend locally, run the following command in the Frontend directory:"
Write-Host "mpn start"


Write-Host ""
Write-Host "Make sure you have enabled the Fabcic Develper mode in the Fabric portal."
Write-Host "Open https://msit.fabric.microsoft.com/ and Activate it under Settings > Developer settings > Fabric Developer mode."

Write-Host "After following all the instructions above, you will see your workload being available in the Fabric portal."
Write-Host "Happy coding! 🚀"