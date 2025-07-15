Write-Host "Building Nuget Package ..."

################################################
# Build the current nuget package
################################################
$nugetPath = Join-Path $PSScriptRoot "..\..\Frontend\node_modules\nuget-bin\nuget.exe"
$nuspecPath = Join-Path $PSScriptRoot "..\..\config\Manifest\ManifestPackage.nuspec"
$outputDir = Join-Path $PSScriptRoot "..\..\config\Manifest\"

Write-Host "Using configuration in $outputDir"

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

Write-Host “Created a new ManifestPackage in $outputDir." -ForegroundColor Blue

