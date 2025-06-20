param (
    [ValidateSet("Remote", "FERemote")]
    [string]$HostingType,
    [String]$WorkloadName = "Org.MyWorkloadSample",
    [String]$ItemName = "SampleItem",
    [String]$AADFrontendAppId = "00000000-0000-0000-0000-000000000000",
    [String]$AADBackendAppId,
    [boolean]$Force = $false
)

if ($HostingType -eq "FERemote" -or $HostingType -eq "Remote") {
    Write-Output "Using Hosting template $HostingType"
} else {
    Write-Host "Invalid parameter. Use 'Remote' or 'FERemote'."
    exit 1
}

###############################################################################
# Setup Workload
###############################################################################
$srcTemplateDir = Join-Path $PSScriptRoot "..\..\config\templates"
$srcManifestDir = Join-Path $srcTemplateDir "Manifest\"
Write-Output "Using template in $srcManifestDir"

$destDir = Join-Path $PSScriptRoot "..\..\config"
$destManifestDir = Join-Path $PSScriptRoot "..\..\config\Manifest"
if (!(Test-Path $destManifestDir)) { New-Item -ItemType Directory -Path $destManifestDir | Out-Null }

Write-Output "Workload Name: $WorkloadName"
Write-Output "Item Name: $ItemName"
Write-Output "AAD Frontend App ID: $AADFrontendAppId"
Write-Output "AAD Backend App ID: $AADBackendAppId"


###############################################################################
# Writing the Manifest files
###############################################################################
# Define key-value dictionary for replacements
$replacements = @{
    "WORKLOAD_NAME" = $WorkloadName
    "ITEM_NAME" = $ItemName
    "FRONTEND_APP_ID" = $AADFrontendAppId
    "BACKEND_APP_ID" = $AADBackendAppId
}

# Copy the template files to the destination directory
Write-Output "Writing Manifest files ..."
$writeManifestFiles = $true
if (((Test-Path $destManifestDir) -and (Get-ChildItem -Path $destManifestDir -Recurse | Measure-Object).Count -ne 0) -and !$Force) {
    $writeManifestFiles = Read-Host "Manifest directory not empty, do you want to override the files with the templates? (y/n)" 
    $writeManifestFiles = $writeManifestFiles -eq 'y'
}
if($writeManifestFiles) {
    Copy-Item -Path $srcManifestDir -Destination $destDir -Recurse -Force
    Get-ChildItem -Recurse -Path $destManifestDir -File | ForEach-Object {
        $filePath = $_.FullName
        $content = Get-Content $filePath -Raw
        foreach ($key in $replacements.Keys) {
            $content = $content -replace "\{\{$key\}\}", $replacements[$key]
        }
        Set-Content -Path $filePath -Value $content -Force
        Write-Output "$destPath"
    }
}

# Use a temporary nuspec file
Write-Output "Create nuspec file ..."

# Use Join-Path and [IO.Path]::DirectorySeparatorChar for cross-platform compatibility
$nuspecManifestDir = Join-Path $srcTemplateDir "Manifest"
$srcNuspecFile = Join-Path $nuspecManifestDir "ManifestPackage.nuspec"
$destNuspecFile = Join-Path $destManifestDir "ManifestPackage.nuspec"

# Read and update nuspec content
$nuspecContent = Get-Content $srcNuspecFile -Raw
# Use the correct directory separator for the current OS
$sep = [IO.Path]::DirectorySeparatorChar
$nuspecContent = $nuspecContent -replace '<ManifestFolder>', ($destManifestDir + $sep)

# Write to the temporary nuspec file
Set-Content $destNuspecFile -Value $nuspecContent -Force
Write-Output "$destNuspecFile"

###############################################################################
# Writing the Frontend config files
###############################################################################

Write-Output "Writing Frontend files ..."
$srcFrontendDir = Join-Path $srcTemplateDir "Frontend"
$destFrontendDir = Join-Path $PSScriptRoot "..\..\Frontend"

Write-Host "The Frontend destination dir $destFrontendDir"
Write-Host "The Frontend src dir $srcFrontendDir"

# Get all files in the source directory
Get-ChildItem -Path $srcFrontendDir -Force
Get-ChildItem -Path $srcFrontendDir -Force -File | ForEach-Object {
    $filePath = $_.FullName
    $content = Get-Content $filePath -Raw
    $destPath = Join-Path $destFrontendDir $_.Name

    $writeFile = $true
    if (Test-Path $destPath -or !$Force) {
        $writeFile = Read-Host "File $_.Name aleready exists do you want to override it with the templates? (y/n)" 
        $writeFile = $writeManifestFiles -eq 'y'
    }

    if($writeFile) {
        Write-Host "Processing file: $filePath"
        foreach ($key in $replacements.Keys) {
            $content = $content -replace "\{\{$key\}\}", $replacements[$key]
        }
        Set-Content -Path $destPath -Value $content -Force
        Write-Output "$destPath"
    } else {
        Write-Host "Skipping file: $filePath"
    }
}

Write-Host "Setup Workload finished successfully ..."  -ForegroundColor Green