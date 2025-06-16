param (
    [String]$WorkspaceGuid
)


# Define source and destination directories
$srcDir = Resolve-Path "..\..\config\Templates\DevGateway\"
Write-Output "Using template in $srcDir"
$destDir = Resolve-Path "..\..\config\DevGateway"
Write-Output "Writing configuration files in $destDir"

$manifestFile = Resolve-Path ".\..\..\config"
$manifestFile = Join-Path $manifestFile "Manifest\ManifestPackage.1.0.0.nupkg"

if (!(Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }

# Define key-value dictionary for replacements
$replacements = @{
    "WORKSPACE_GUID" = $WorkspaceGuid
    "WORLOAD_MANIFEST_PACKAGE_FILE_PATH" = $manifestFile
}

# Get all files in the source directory
Get-ChildItem -Path $srcDir -File | ForEach-Object {
    $filePath = $_.FullName
    $content = Get-Content $filePath -Raw

    foreach ($key in $replacements.Keys) {
        $content = $content -replace "\{\{$key\}\}", $replacements[$key]
    }

    $destPath = Join-Path $destDir $_.Name
    Set-Content -Path $destPath -Value $content
}
