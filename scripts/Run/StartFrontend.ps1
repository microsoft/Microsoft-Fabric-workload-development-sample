Write-Host "Building Nuget Package ..."

################################################
# Build the current nuget package
################################################
$nugetPath = Join-Path $PSScriptRoot "..\..\Frontend\node_modules\nuget-bin\nuget.exe"
$nuspecPath = Join-Path $PSScriptRoot "..\..\config\Manifest\ManifestPackage.nuspec"
$outputDir = Join-Path $PSScriptRoot "..\..\config\Manifest\"

if (-not (Test-Path $nugetPath)) {
    Write-Host "Nuget executable not found at $nugetPath will run npm install to get it."
    $frontendDir = Join-Path $PSScriptRoot "..\..\Frontend"
    try {
        Push-Location $frontendDir
        npm install
    } finally {
        Pop-Location
    }
}

if($IsWindows){
    & $nugetPath pack $nuspecPath -OutputDirectory $outputDir -Verbosity detailed
} else {
    # On Mac and Linux, we need to use mono to run the script
    mono $nugetPath pack $nuspecPath -OutputDirectory $outputDir -Verbosity detailed
}

Write-Host "Nuget package built successfully and saved to $outputDir"

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
