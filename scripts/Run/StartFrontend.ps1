Write-Host "Building Nuget Package ..."

################################################
# Build the current nuget package
################################################
$nugetPath = Join-Path $PSScriptRoot "..\..\Frontend\node_modules\.bin\nuget.ps1"
$nuspecPath = Join-Path $PSScriptRoot "..\..\config\Manifest\ManifestPackage.nuspec"
$outputDir = Join-Path $PSScriptRoot "..\..\config\Manifest\"

if($IsWindows){
    & $nugetPath pack $nuspecPath -OutputDirectory $outputDir -Verbosity detailed
} else {
    # On Mac and Linux, we need to use pwsh to run the script
    $pwshPath = "pwsh"
    & $pwshPath $nugetPath pack $nuspecPath -OutputDirectory $outputDir -Verbosity detailed
}

Write-Host "Nuget package built successfully and saved to $outputDir"

################################################
# Starting the Frontend
################################################
Write-Host ""
Write-Host "Starting the Frontend ..."
try {
    $frontendDir = Join-Path $PSScriptRoot "..\..\Frontend"
    Push-Location $frontendDir
    npm start
} finally {
    Pop-Location
}
