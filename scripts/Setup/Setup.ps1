param (
    [string]$HostingType = "FERemote",
    [String]$WorkloadName = "Org.MyWorkloadSample",
    [String]$ItemName = "SampleItem",
    [String]$WorkspaceId = "00000000-0000-0000-0000-000000000000",
    [String]$AADFrontendAppId = "00000000-0000-0000-0000-000000000000",
    [String]$AADBackendAppId
)


Write-Output "Setting up the environment..."

# Run SetupDevGateway.ps1
$setupDevGatewayScript = Join-Path $PSScriptRoot "..\Setup\SetupDevGateway.ps1"
if (Test-Path $setupDevGatewayScript) {
    if ([string]::IsNullOrWhiteSpace($WorkspaceId) -or $WorkspaceId -eq "00000000-0000-0000-0000-000000000000") {
        $WorkspaceId = Read-Host "Enter your Workspace Id that should be used for development"
        if ([string]::IsNullOrWhiteSpace($WorkspaceId) -or $WorkspaceId -eq "00000000-0000-0000-0000-000000000000") {
           Write-Error "Workspace Id is not set or is using the default placeholder value. Please provide a valid Workspace Id."
           exit 1
        }
    }
    Write-Host "Running SetupDevGateway.ps1..."
    & $setupDevGatewayScript -WorkspaceGuid $WorkspaceId
} else {
    Write-Error "SetupDevGateway.ps1 not found at $setupDevGatewayScript"
    exit 1
}

if ([string]::IsNullOrWhiteSpace($AADFrontendAppId) -or $AADFrontendAppId -eq "00000000-0000-0000-0000-000000000000") {
    Write-Warning "AADFrontendAppId is not set or is using the default placeholder value."
    $confirmation = Read-Host "Do you have an Entra Application ID you can use? (y/n)"
    if ($confirmation -eq 'y') {
        $AADFrontendAppId = Read-Host "Enter your Entra Frontend App Id"
    } else {
        $confirmation = Read-Host "Do you want to create a new Entra Application? (y/n)"   
        if ($confirmation -eq 'y') {
            $createDevAADAppScript = Join-Path $PSScriptRoot "..\Setup\CreateDevAADApp.ps1"
            if (Test-Path $createDevAADAppScript) { 
                $TenantId = Read-Host "Provide your Entra Tenant Id"             
                $AADFrontendAppId = & $createDevAADAppScript -HostingType $HostingType -WorkloadName $WorkloadName -ApplicationName $WorkloadName -TenantId $TenantId
            } else {
                Write-Error "SetupDevGateway.ps1 not found at $setupDevGatewayScript"
                exit 1
            } 
        } else {
            $AADFrontendAppId = "00000000-0000-0000-0000-000000000000"
        }
    }
}
# Validate AADFrontendAppId
if ([string]::IsNullOrWhiteSpace($AADFrontendAppId) -or $AADFrontendAppId -eq "00000000-0000-0000-0000-000000000000") {
    Write-Error "We can't setup the workload without an Entra App. Please make sure you have one an run the script again."
    exit 1
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
    Write-Host "SetupWorkload.ps1 not found at $setupWorkloadScript" -ForegroundColor Red
    exit 1
}

Write-Output "Downloading Frontend dependencies..."
$frontendDir = Join-Path $PSScriptRoot "..\..\Frontend"
Push-Location $frontendDir
npm install
Pop-Location
# Ensure we are back in the scripts directory

Write-Output "Building the manifest..."

# Prompt user to build the manifest package
$buildManifestScript = Join-Path $PSScriptRoot "..\Build\Manifest\build-package.ps1"
if (Test-Path $buildManifestScript) {
    $buildManifestScriptFull = (Resolve-Path $buildManifestScript).Path
    & $buildManifestScriptFull -WorkloadName $WorkloadName -ItemName $ItemName
    Write-Host ""
    Write-Host "Manifest has been built. If you change configuration, please run the following script again:"
    Write-Host "`"$buildManifestScriptFull`""
} else {
    Write-Host "${redColor}build-package.ps1 not found at $buildManifestScript"
}

Write-Host ""
Write-Host "Everything is set up." -ForegroundColor Green
Write-Host "Now you can run the following scripts to start your development environment."
Write-Host "--------------------------------------------------------------------------------"


# Prompt user to run StartDevGateway.ps1 with absolute path
$startDevGatewayScript = Join-Path $PSScriptRoot "..\Run\StartDevGateway.ps1"
if (Test-Path $startDevGatewayScript) {
    $startDevGatewayScriptFull = (Resolve-Path $startDevGatewayScript).Path
    Write-Host ""
    Write-Host “To register your workload in dev-mode on the Fabric tenant, start the DevGateway with the following script:" -ForegroundColor Blue
    Write-Host "`"$startDevGatewayScriptFull`""
} else {
    Write-Host "StartDevGateway.ps1 not found at $startDevGatewayScript"
}

# Promt user to run mpn start
$startFrontendScript = Join-Path $PSScriptRoot "..\Run\StartFrontend.ps1"
if (Test-Path $startFrontendScript) {
    $startFrontendScriptFull = (Resolve-Path $startFrontendScript).Path
    Write-Host ""
    Write-Host "To launch your workload webapp, start your Fronend locally with the following script:" -ForegroundColor Blue
    Write-Host "`"$startFrontendScriptFull`""
} else {
    Write-Host "StartFrontend.ps1 not found at $startFrontendScript"
}

Write-Host ""
Write-Host "Make sure you have enabled the Fabcic Develper mode in the Fabric portal." -ForegroundColor Blue
Write-Host "Open https://msit.fabric.microsoft.com/ and activate it under Settings > Developer settings > Fabric Developer mode."
Write-Host ""
Write-Host "After following all the instructions above, you will see your workload being available in the Fabric portal."
Write-Host "It will appear in the Workload Hub and items can be created in the workspace you have configured."

Write-Host "Happy coding! 🚀"