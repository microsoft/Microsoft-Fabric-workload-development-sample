param(
    # The GUID of the workspace to use for the developer environment
    [Parameter(Mandatory=$false)]
    [string]$WorkspaceGuid,
    [Parameter(Mandatory=$false)]
    # Force flag to overwrite existing configurations and don't prompt the user
    [boolean]$Force = $false,

)

# Script to set up individual developer environment
# This script should be run by each developer after cloning the repository
# It configures DevGateway and other developer-specific settings

Write-Host "🛠️ Setting up Developer Environment" -ForegroundColor Green
Write-Host ""

# Paths
$ScriptRoot = $PSScriptRoot
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptRoot)
$DevGatewayDir = Join-Path $ProjectRoot "config\DevGateway"
$ManifestDir = Join-Path $ProjectRoot "config\Manifest"
$WorkloadDir = Join-Path $ProjectRoot "Workload"

# Check if .env files exist (should be created by SetupProject.ps1)
$EnvDevFile = Join-Path $WorkloadDir ".env.dev"
if (-not (Test-Path $EnvDevFile)) {
    Write-Error "Development environment file not found: $EnvDevFile"
    Write-Error "Please run SetupProject.ps1 first to configure the project."
    exit 1
}

# Load configuration from .env.dev file
Write-Host "📖 Loading project configuration from .env.dev..." -ForegroundColor Blue
$EnvConfig = @{}
Get-Content $EnvDevFile | Where-Object { $_ -notmatch '^#' -and $_ -notmatch '^$' } | ForEach-Object {
    $key, $value = $_ -split '=', 2
    if ($key -and $value) {
        $EnvConfig[$key.Trim()] = $value.Trim()
    }
}

# Validate required configuration
$RequiredKeys = @('WORKLOAD_NAME', 'FRONTEND_BASE_URL')
foreach ($Key in $RequiredKeys) {
    if (-not $EnvConfig.ContainsKey($Key)) {
        Write-Error "Required configuration '$Key' not found in $EnvDevFile"
        exit 1
    }
}

# Get workspace GUID from user or environment variable
if (-not $WorkspaceGuid) {
    $WorkspaceGuid = $env:DEV_WORKSPACE_GUID
}

if (-not $WorkspaceGuid) {
    Write-Host "🏢 Workspace Configuration" -ForegroundColor Yellow
    Write-Host "You need to provide a Fabric workspace GUID for development."
    Write-Host "This should be a real workspace ID within your Fabric tenant."
    Write-Host ""
    $WorkspaceGuid = Read-Host "Enter your development workspace GUID"
    
    if (-not $WorkspaceGuid) {
        Write-Error "Workspace GUID is required for development setup"
        exit 1
    }
    
    # Ask if user wants to save it as environment variable
    $saveEnvVar = Read-Host "Do you want to save this workspace GUID as an environment variable? (y/n)"
    if ($saveEnvVar -eq 'y' -or $saveEnvVar -eq 'Y') {
        [Environment]::SetEnvironmentVariable("DEV_WORKSPACE_GUID", $WorkspaceGuid, "User")
        Write-Host "✅ Workspace GUID saved as environment variable DEV_WORKSPACE_GUID" -ForegroundColor Green
    }
}

# Validate GUID format
try {
    [System.Guid]::Parse($WorkspaceGuid) | Out-Null
} catch {
    Write-Error "Invalid GUID format for workspace: $WorkspaceGuid"
    exit 1
}

# Ensure directories exist
Write-Host "📁 Creating output directories..." -ForegroundColor Blue
if (-not (Test-Path $DevGatewayDir)) {
    New-Item -ItemType Directory -Path $DevGatewayDir -Force | Out-Null
    Write-Host "  ✅ Created: $DevGatewayDir" -ForegroundColor Green
}

if (-not (Test-Path $ManifestDir)) {
    New-Item -ItemType Directory -Path $ManifestDir -Force | Out-Null
    Write-Host "  ✅ Created: $ManifestDir" -ForegroundColor Green
}

# Generate DevGateway configuration
Write-Host "🔧 Generating DevGateway configuration..." -ForegroundColor Blue

$WorkloadName = $EnvConfig['WORKLOAD_NAME']
$FrontendBaseUrl = $EnvConfig['FRONTEND_BASE_URL']
$ManifestPath = Join-Path $ManifestDir "WorkloadManifest.xml"

$DevGatewayConfig = @{
    WorkspaceGuid = $WorkspaceGuid
    WorkloadName = $WorkloadName
    WorkloadManifestPath = $ManifestPath
    WorkloadEndpoint = $FrontendBaseUrl
}

$DevGatewayFile = Join-Path $DevGatewayDir "workload-dev-mode.json"
$DevGatewayConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath $DevGatewayFile -Encoding UTF8
Write-Host "  ✅ Created: $DevGatewayFile" -ForegroundColor Green

# Copy/generate basic manifest files if they don't exist
Write-Host "📄 Setting up manifest files..." -ForegroundColor Blue
$ManifestTemplateDir = Join-Path $ProjectRoot "config\templates\Manifest"

if (Test-Path $ManifestTemplateDir) {
    $ManifestFiles = Get-ChildItem -Path $ManifestTemplateDir -File
    foreach ($File in $ManifestFiles) {
        $DestPath = Join-Path $ManifestDir $File.Name
        if (-not (Test-Path $DestPath)) {
            Copy-Item -Path $File.FullName -Destination $DestPath -Force
            Write-Host "  ✅ Copied: $($File.Name)" -ForegroundColor Green
        } else {
            Write-Host "  ℹ️ Already exists: $($File.Name)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Warning "Manifest template directory not found: $ManifestTemplateDir"
}

Write-Host ""
Write-Host "🎉 Developer environment setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Configuration Summary:" -ForegroundColor Yellow
Write-Host "  Workspace GUID: $WorkspaceGuid" -ForegroundColor Cyan
Write-Host "  Workload Name: $WorkloadName" -ForegroundColor Cyan
Write-Host "  Frontend URL: $FrontendBaseUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Generated files:" -ForegroundColor Yellow
Write-Host "  ✅ $DevGatewayFile" -ForegroundColor Green
if (Test-Path $ManifestPath) {
    Write-Host "  ✅ $ManifestPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start the development server: .\scripts\Run\StartDevServer.ps1" -ForegroundColor Cyan
Write-Host "  2. Start the DevGateway: .\scripts\Run\StartDevGateway.ps1" -ForegroundColor Cyan
Write-Host "  3. Enable Fabric Developer mode in the Fabric portal" -ForegroundColor Cyan
Write-Host "     https://app.fabric.microsoft.com/ > Settings > Developer settings" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Environment variables for future runs:" -ForegroundColor Yellow
Write-Host "  DEV_WORKSPACE_GUID=$WorkspaceGuid" -ForegroundColor Gray


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
