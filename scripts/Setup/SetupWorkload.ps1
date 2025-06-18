param (
    [ValidateSet("Remote", "FERemote")]
    [string]$HostingType,
    [String]$WorkloadName = "Org.MyWorkloadSample",
    [String]$ItemName = "SampleItem",
    [String]$AADFrontendAppId = "00000000-0000-0000-0000-000000000000",
    [String]$AADBackendAppId
)

if ($HostingType -eq "FERemote" -or $HostingType -eq "Remote") {
    Write-Output "Using Hosting template $HostingType"
} else {
    Write-Host "Invalid parameter. Use 'Remote' or 'FERemote'."
    exit 1
}

# Define source and destination directories
$srcTemplateDir = Join-Path $PSScriptRoot "..\..\config\Templates"
$srcManifestDir = Join-Path $srcTemplateDir "Manifest\$HostingType"
Write-Output "Using template in $srcManifestDir"

$destManifestDir = Join-Path $PSScriptRoot "..\..\config\Manifest"
if (!(Test-Path $destManifestDir)) { New-Item -ItemType Directory -Path $destManifestDir | Out-Null }

$destPackageDir = Join-Path $PSScriptRoot "..\..\Frontend\Package"

Write-Output "Workload Name: $WorkloadName"
Write-Output "Item Name: $ItemName"
Write-Output "AAD Frontend App ID: $AADFrontendAppId"
Write-Output "AAD Backend App ID: $AADBackendAppId"

# Define key-value dictionary for replacements
$replacements = @{
    "WORKLOAD_NAME" = $WorkloadName
    "ITEM_NAME" = $ItemName
    "FRONTEND_APP_ID" = $AADFrontendAppId
    "BACKEND_APP_ID" = $AADBackendAppId
}

# Get all files in the source directory
Write-Output "Writing Manifest files ..."
Get-ChildItem -Path $srcManifestDir -File | ForEach-Object {
    $filePath = $_.FullName
    $content = Get-Content $filePath -Raw

    foreach ($key in $replacements.Keys) {
        $content = $content -replace "\{\{$key\}\}", $replacements[$key]
    }

    $destPath = Join-Path $destManifestDir $_.Name
    Set-Content -Path $destPath -Value $content
    Write-Output "$destPath"
}

# Use a temporary nuspec file
Write-Output "Create nuspec file ..."
$srcNuspecFile = Join-Path $srcTemplateDir "Manifest\ManifestPackage.nuspec"
$destNuspecFile = Join-Path $destManifestDir "ManifestPackage.nuspec"

# Read and update nuspec content
$nuspecContent = Get-Content $srcNuspecFile -Raw
$nuspecContent = $nuspecContent -replace '<BEPath>', ($destManifestDir + '\')
$nuspecContent = $nuspecContent -replace '<FEPath>', ($destPackageDir + '\')

# Write to the temporary nuspec file
Set-Content $destNuspecFile -Value $nuspecContent -Force
Write-Output "$destNuspecFile"

$srcFrontendDir = Join-Path $srcTemplateDir "Frontend"
$destFrontendDir = Join-Path $PSScriptRoot "..\..\Frontend"

# Get all files in the source directory
Write-Output "Writing Frontend files ..."
Get-ChildItem -Path $srcFrontendDir -File | ForEach-Object {
    $filePath = $_.FullName
    $content = Get-Content $filePath -Raw

    foreach ($key in $replacements.Keys) {
        $content = $content -replace "\{\{$key\}\}", $replacements[$key]
    }

    $destPath = Join-Path $destFrontendDir $_.Name
    Set-Content -Path $destPath -Value $content
    Write-Output "$destPath"
}

Write-Host "Setup Workload finished successfully ..."  -ForegroundColor Green