################################################
# Make sure Manifest is built
################################################
# Run BuildManifestPackage.ps1 with absolute path
$buildManifestPackageScript = Join-Path $PSScriptRoot "..\Build\BuildManifestPackage.ps1"
if (Test-Path $buildManifestPackageScript) {
    $buildManifestPackageScript = (Resolve-Path $buildManifestPackageScript).Path
    & $buildManifestPackageScript 
} else {
    Write-Host "BuildManifestPackage.ps1 not found at $buildManifestPackageScript"
    exit 1
}

################################################
# Starting the Frontend
################################################
Write-Host ""
Write-Host "Starting the Frontend ..."
$frontendDir = Join-Path $PSScriptRoot "..\..\Frontend"
Push-Location $frontendDir
try {
    # If running in Codespaces, use the low memory version by default to prevent OOM errors
    if ($env:CODESPACES -eq "true") {
        Write-Host "Running in Codespace environment - using low memory configuration to prevent OOM errors"
        $env:NODE_ENV = "codespace"
        npm run start:codespace
    } else {
        # Use regular start for non-codespace environments
        npm start
    }
} finally {
    Pop-Location
}
