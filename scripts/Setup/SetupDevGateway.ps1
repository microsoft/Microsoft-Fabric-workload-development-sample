param (
    [String]$WorkspaceGuid
)

$toolsDir = Join-Path $PSScriptRoot "..\..\tools" # Replace with your desired folder
$devGatewayDir = Join-Path $toolsDir "DevGateway"
$downloadDevGateway = Read-Host "Do you want to download DevGateway? (y/n)"
if ($downloadDevGateway -eq "y") {
    $DEV_GATEWAY_DOWNLOAD_URL = "https://download.microsoft.com/download/c/4/a/c4a0a569-87cd-4633-a81e-26ef3d4266df/DevGateway.zip"
    Write-Host "📥 Downloading DevGateway..."
    if (!(Test-Path $devGatewayDir)) {   
        try {
            New-Item -ItemType Directory -Path $devGatewayDir | Out-Null 
            $tempZipPath = "$env:TEMP\DevGateway-tmp.zip"  # Temporary location for the ZIP file
            # Download the ZIP file
            Invoke-WebRequest -Uri $DEV_GATEWAY_DOWNLOAD_URL -OutFile $tempZipPath
            # Extract the ZIP file
            Expand-Archive -Path $tempZipPath -DestinationPath $devGatewayDir -Force
            # Remove the temporary ZIP file
            Remove-Item $tempZipPath
            Write-Host "✅ DevGateway downloaded and extracted to $devGatewayDir"
        }
        catch {
            Write-Host "❌ Failed to download or extract DevGateway: $_"
            exit 1
        }
    }
}
else {
    Write-Host "⏭️ Skipping DevGateway download."
}

# Define source and destination directories
$srcDir = Join-Path $PSScriptRoot "..\..\config\Templates\DevGateway"
Write-Output "Using template in $srcDir"
$destDir = Join-Path $PSScriptRoot "..\..\config\DevGateway"
if (!(Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }
Write-Output "Writing configuration files in $destDir"

$manifestConfigFile= Join-Path $PSScriptRoot ".\..\..\config"
if (!(Test-Path $manifestConfigFile)) { New-Item -ItemType Directory -Path $manifestConfigFile | Out-Null }
$manifestDir = (Resolve-Path -Path (Join-Path $PSScriptRoot "..\..\config\Manifest")).Path
$manifestFile = Join-Path $manifestDir "ManifestPackage.1.0.0.nupkg"
Write-Output "Manifest location used $manifestFile"

# Define key-value dictionary for replacements
$replacements = @{
    "WORKSPACE_GUID"                     = $WorkspaceGuid
    "WORLOAD_MANIFEST_PACKAGE_FILE_PATH" = [regex]::Escape($manifestFile).Replace("\.", ".")
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
