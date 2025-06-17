param (
    [string]$HostingType,
    [String]$WorkloadName = "Org.MyWorkloadSample",
    [String]$ItemName = "SampleItem",
    [String]$AADFrontendAppId = "00000000-0000-0000-0000-000000000000",
    [String]$AADBackendAppId
)

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

# Run SetupDevGateway.ps1
$setupDevGatewayScript = Join-Path $PSScriptRoot "..\Setup\SetupDevGateway.ps1"
if (Test-Path $setupDevGatewayScript) {
    $workspaceId = Read-Host "Enter your Entra Workspace Id"
    Write-Host "Running SetupDevGateway.ps1..."
    & $setupDevGatewayScript -WorkspaceGuid $workspaceId
} else {
    Write-Host "SetupDevGateway.ps1 not found at $setupDevGatewayScript"
}

# Prompt user to build the manifest package
$buildManifestScript = Join-Path $PSScriptRoot "..\Build\Manifest\build-package.ps1"
if (Test-Path $buildManifestScript) {
    $buildManifestScriptFull = (Resolve-Path $buildManifestScript).Path
    Write-Host ""
    Write-Host "To build the manifest package, please run the following script:"
    Write-Host "`"$buildManifestScriptFull`""
} else {
    Write-Host "build-package.ps1 not found at $buildManifestScript"
}

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