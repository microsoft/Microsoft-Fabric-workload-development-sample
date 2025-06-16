param (
    [string]$HostingType,
    [String]$WorkloadName = "Org.MyFERemoteWorkloadSample",
    [String]$ItemName = "SampleItem",
    [String]$AADFrontendAppId = "00000000-0000-0000-0000-000000000000",
    [String]$AADBackendAppId = "00000000-0000-0000-0000-000000000000"
)


if ($HostingType -eq "FERemote" || $HostingType -eq "Remote") {
    Write-Output "Using Hosting template $HostingType"
} else {
    Write-Host "Invalid parameter. Use 'Remote' or 'FERemote'."
    exit 1
}

# Define source and destination directories
$srcDir = Resolve-Path ".\..\..\config\Templates"
$destDir = Resolve-Path ".\..\..\config\" 

$srcManifestDir = Join-Path $srcDir "Manifest\$HostingType"
Write-Output "Using template in $srcManifestDir"

$destManifestDir = Join-Path $destDir "Manifest\$HostingType"
Write-Output "Writing Manifest files in $destManifestDir"

Write-Output "Using Workload Name $WorkloadName"
Write-Output "Using Item Name $ItemName"
Write-Output "Using AAD Frontend App ID $AADFrontendAppId"
#Write-Output "Using AAD Backend App ID $AADBackendAppId"


if (!(Test-Path $destManifestDir)) { New-Item -ItemType Directory -Path $destManifestDir | Out-Null }

# Define key-value dictionary for replacements
$replacements = @{
    "WORKLOAD_NAME" = $WorkloadName
    "ITEM_NAME" = $ItemName
    "FRONTEND_APP_ID" = $AADFrontendAppId
    "BACKEND_APP_ID" = $AADBackendAppId
}

# Get all files in the source directory
Get-ChildItem -Path $srcManifestDir -File | ForEach-Object {
    $filePath = $_.FullName
    $content = Get-Content $filePath -Raw

    foreach ($key in $replacements.Keys) {
        $content = $content -replace "\{\{$key\}\}", $replacements[$key]
    }

    $destPath = Join-Path $destManifestDir $_.Name
    Set-Content -Path $destPath -Value $content
}
