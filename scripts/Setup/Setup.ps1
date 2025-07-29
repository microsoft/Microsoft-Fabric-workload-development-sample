param ( 
    #Only the FERemote hosting type is supported for now   
    [string]$HostingType = "FERemote",
    # The name of the workload, used for the Entra App and the workload in the Fabric portal
    [String]$WorkloadName = "Org.MyWorkloadSample",
    # The display name of the workload, used in the Fabric portal
    [String]$WorkloadDisplayName = "My Sample Workload",
    # The Workspace Id to use for development (GUID)
    # If not provided, the user will be prompted to enter it.
    [String]$DevWorkspaceId = "00000000-0000-0000-0000-000000000000",
    # The Entra Application ID for the frontend
    # If not provided, the user will be prompted to enter it or create a new one.
    [String]$AADFrontendAppId = "00000000-0000-0000-0000-000000000000",
    # Not used in the current setup, but can be used for future backend app configurations
    # If not provided, it will default to an empty string.
    [String]$AADBackendAppId,
    # Force flag to overwrite existing configurations and don't prompt the user
    [boolean]$Force = $false,
    # The version of the workload, used for the manifest package
    [String]$WorkloadVersion = "1.0.0"
)

###############################################################################
# Run SetupDevGateway.ps1
# This script sets up the development gateway environment for the workload.
###############################################################################
Write-Output "Setting up the environment..."
$setupDevGatewayScript = Join-Path $PSScriptRoot "..\Setup\SetupDevGateway.ps1"
if (Test-Path $setupDevGatewayScript) {
    $parsedGuid = [System.Guid]::Empty
    if ([string]::IsNullOrWhiteSpace($DevWorkspaceId) -or $DevWorkspaceId -eq "00000000-0000-0000-0000-000000000000" -or -not [System.Guid]::TryParse($DevWorkspaceId, [ref]$parsedGuid)) {
        $DevWorkspaceId = Read-Host "Enter your Workspace Id that should be used for development"
        if ([string]::IsNullOrWhiteSpace($DevWorkspaceId) -or $DevWorkspaceId -eq "00000000-0000-0000-0000-000000000000" -or -not [System.Guid]::TryParse($DevWorkspaceId, [ref]$parsedGuid)) {
           Write-Error "Workspace Id is not set, is empty, or is not a valid GUID. Please provide a valid Workspace Id."
           exit 1
        }
    }
    Write-Host "Running SetupDevGateway.ps1..."
    & $setupDevGatewayScript -DevWorkspaceId $DevWorkspaceId -WorkloadVersion $WorkloadVersion -Force $Force 
} else {
    Write-Error "SetupDevGateway.ps1 not found at $setupDevGatewayScript"
    exit 1
}

###############################################################################
# Configure AAD Frontend App
# This section checks if the AADFrontendAppId is set and prompts the user if not.
###############################################################################
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

###############################################################################
# Run SetupWorkload.ps1
# This script sets up the workload configuration and dependencies.
###############################################################################
$setupWorkloadScript = Join-Path $PSScriptRoot "..\Setup\SetupWorkload.ps1"
if (Test-Path $setupWorkloadScript) {
    Write-Host ""
    Write-Host "Running SetupWorkload.ps1..."
    & $setupWorkloadScript -HostingType $HostingType `
        -WorkloadName $WorkloadName `
        -WorkloadDisplayName $WorkloadDisplayName `
        -DevWorkspaceId $DevWorkspaceId `
        -AADFrontendAppId $AADFrontendAppId `
        -AADBackendAppId $AADBackendAppId `
        -WorkloadVersion $WorkloadVersion `
        -Force $Force
} else {
    Write-Host "SetupWorkload.ps1 not found at $setupWorkloadScript" -ForegroundColor Red
    exit 1
}


###############################################################################
# Download Workload dependencies to have nuget executables available
###############################################################################
Write-Host ""
Write-Output "Downloading Workload dependencies..."
$workloadDir = Join-Path $PSScriptRoot "..\..\Workload\"
$nugetDir = Join-Path $workloadDir "node_modules\nuget-bin"
# Ensure the frontend directory exists
if (-not (Test-Path $nugetDir)) {
    Write-Host ""
    Write-Host "Running npm install to get the nuget executables..."
    try{
        Push-Location $workloadDir
        npm install
    } finally {
        Pop-Location
    }
} else {
    Write-Host "nuget executable already exists."
}


###############################################################################
# Final output and instructions on how to proceed
###############################################################################
Write-Host ""
Write-Host "Setup finished successfully ..." -ForegroundColor Green
Write-Host ""
Write-Host ""
Write-Host "Now you can run the following scripts to start your development environment:"
Write-Host "--------------------------------------------------------------------------------"

# Promt user to start the DevServer
$startDevServerScript = Join-Path $PSScriptRoot "..\Run\StartDevServer.ps1"
if (Test-Path $startDevServerScript) {
    $startDevServerScriptFull = (Resolve-Path $startDevServerScript).Path
    Write-Host ""
    Write-Host "To launch your workload webapp, start the DevServer locally with the following script:" -ForegroundColor Blue
    Write-Host "`"$startDevServerScriptFull`""
} else {
    Write-Host "StartDevServer.ps1 not found at $startDevServerScript"
}

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

Write-Host ""
Write-Host "Make sure you have enabled the Fabric Developer mode in the Fabric portal." -ForegroundColor Blue
Write-Host "Open https://app.fabric.microsoft.com/ and activate it under Settings > Developer settings > Fabric Developer mode."
Write-Host "Be aware this setting will not stay on forever. Check back if you have problems if it is still active."
Write-Host ""
Write-Host "After following all the instructions above, you will see your workload being available in the Fabric portal."
Write-Host "It will appear in the Workload Hub and items can be created in the workspace you have configured."

Write-Host "Happy coding! 🚀"