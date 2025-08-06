<#
.SYNOPSIS
    Sets up a new Microsoft Fabric Workload for development

.DESCRIPTION
    This script sets up a new Fabric Workload for development. It configures:
    - AAD applications for authentication
    - Package.json dependencies 
    - Environment configuration files (.env.dev, .env.test, .env.prod)
    
    This script should be run once when initially setting up the workload.
    For ongoing development, use SetupDevEnvironment.ps1 instead.

.PARAMETER HostingType
    The hosting type for the workload (currently only "FERemote" is supported)

.PARAMETER WorkloadName
    Name of the workload (will be used in configuration and AAD app names)
    Should follow the pattern "Org.YourProjectName"

.PARAMETER WorkloadDisplayName
    Display name of the workload as shown in the Fabric portal

.PARAMETER AADFrontendAppId  
    AAD Application ID for the frontend (optional - will create if not provided)

.PARAMETER AADBackendAppId
    AAD Application ID for the backend (reserved for future use)

.PARAMETER Force
    Overwrite existing files without prompting

.PARAMETER WorkloadVersion
    Version of the workload (defaults to "1.0.0")

.EXAMPLE
    .\SetupWorkload.ps1 -WorkloadName "Org.MyWorkload"
    
.EXAMPLE  
    .\SetupWorkload.ps1 -WorkloadName "Org.MyWorkload" -AADFrontendAppId "12345678-1234-1234-1234-123456789012" -Force

.NOTES
    Run this script from the scripts/Setup directory
    Requires PowerShell execution policy that allows script execution
#>

param ( 
    #Only the FERemote hosting type is supported for now   
    [string]$HostingType = "FERemote",
    # The name of the workload, used for the Entra App and the workload in the Fabric portal
    [String]$WorkloadName = "",
    # The display name of the workload, used in the Fabric portal
    [String]$WorkloadDisplayName = "My Sample Workload",
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

# check if the setup has already been done and ask if you want to force it 


Write-Output "Setting up the environment..."
 if ([string]::IsNullOrWhiteSpace($WorkloadName)) {
    Write-Host "Enter your Workload Name that should be used."
    Write-Host "To get started the Name should be in the form of Org.[YourProjectName] e.g. Org.MyWorkloadSample."
    Write-Host "Please use the public documentation to better understand how Workload Names are structued and used."
    $WorkloadName = Read-Host "WorkloadName"
    if ([string]::IsNullOrWhiteSpace($WorkloadName)) {
        Write-Error "Workspace Name is not set or is using the default placeholder value. Please provide a valid Workspace Name."
        exit 1
    } elseif (! [string]::StartsWith($WorkloadName, "Org.")) {
        Write-Warning "Please make sure that you have registered the Workload name before you start working with it."
    }
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
# Configure the .env.* files 
# This script sets up the env files 
###############################################################################
Write-Host ""
Write-Output "Setting up environment configuration files..."

# Define paths
$templateEnvFile = Join-Path $PSScriptRoot "..\..\config\templates\Workload\.env"
$workloadDir = Join-Path $PSScriptRoot "..\..\Workload\"

# Check if template exists
if (-not (Test-Path $templateEnvFile)) {
    Write-Error "Template .env file not found at $templateEnvFile"
    exit 1
}

# Read the template content
$templateContent = Get-Content $templateEnvFile -Raw

# Define placeholder replacements for different environments
$placeholders = @{
    "{{WORKSPACE_HOSTING_TYPE}}" = $HostingType
    "{{WORKLOAD_VERSION}}" = $WorkloadVersion
    "{{WORKLOAD_NAME}}" = $WorkloadName
    "{{ITEM_NAMES}}" = "HelloWorld"  # Default items, can be updated later
    "{{FRONTEND_APP_ID}}" = $AADFrontendAppId
}

# Environment-specific configurations
$environments = @{
    "dev" = @{
        "{{FRONTEND_BASE_URL}}" = "http://localhost:60006/"
        "{{LOG_LEVEL}}" = "debug"
    }
    "test" = @{
        "{{FRONTEND_BASE_URL}}" = "https://your-staging-url.azurestaticapps.net/"
        "{{LOG_LEVEL}}" = "info"
    }
    "prod" = @{
        "{{FRONTEND_BASE_URL}}" = "https://your-production-url.azurestaticapps.net/"
        "{{LOG_LEVEL}}" = "warn"
    }
}

# Generate .env files for each environment
foreach ($env in $environments.Keys) {
    $envFile = Join-Path $workloadDir ".env.$env"
    
    # Check if file exists and prompt for overwrite (unless Force is set)
    if ((Test-Path $envFile) -and -not $Force) {
        $overwrite = Read-Host "File .env.$env already exists. Overwrite? (y/n)"
        if ($overwrite -ne 'y') {
            Write-Host "Skipping .env.$env"
            continue
        }
    }
    
    # Start with template content
    $envContent = $templateContent
    
    # Replace common placeholders
    foreach ($placeholder in $placeholders.Keys) {
        $envContent = $envContent -replace [regex]::Escape($placeholder), $placeholders[$placeholder]
    }
    
    # Replace environment-specific placeholders
    foreach ($envPlaceholder in $environments[$env].Keys) {
        $envContent = $envContent -replace [regex]::Escape($envPlaceholder), $environments[$env][$envPlaceholder]
    }
    
    # Write the file
    $envContent | Set-Content $envFile -Encoding UTF8
    Write-Host "Generated .env.$env file" -ForegroundColor Green
}

Write-Host "Environment configuration files created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Generated files:"
Write-Host "  - Workload/.env.dev (development configuration)"
Write-Host "  - Workload/.env.test (staging configuration)" 
Write-Host "  - Workload/.env.prod (production configuration)"
Write-Host ""
Write-Host "You can edit these files to customize settings for each environment."
Write-Host "Commit these files to your repository to share configuration with your team."



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
Write-Host "Setup workload finished successfully ..." -ForegroundColor Green
Write-Host "Make sure the .env files are configured correctly for your environment and add them to your Repository." -ForegroundColor Green
Write-Host ""
Write-Host ""

###############################################################################
# Starting the SetupDevEnviroment.ps as well
###############################################################################
$startDevEnviromentScript = Join-Path $PSScriptRoot "..\Setup\SetupDevEnviroment.ps"
if (Test-Path $startDevEnviromentScript) {
     & $startDevEnviromentScript -Force $Force
} else {
    Write-Host "StartDevEnviroment.ps1 not found at $startDevEnviromentScript"
}
