Write-Host "Building Nuget Package ..."

################################################
# If its a codespace we need to update the URL in the manifest
################################################

if ($env:CODESPACES -eq "true") {
    Write-Host "Running in Codespace, updating the URL in the manifest..."
    $manifestFilePath = Join-Path $PSScriptRoot "..\..\config\Manifest\WorkloadManifest.xml"
    [xml]$manifest = Get-Content -Path $manifestFilePath
    $manifest.WorkloadManifestConfiguration.Workload.RemoteServiceConfiguration.CloudServiceConfiguration.Endpoints.ServiceEndpoint.Url = "https://$($env:CODESPACE_NAME).github.dev:60006/"
    $manifest.Save($manifestFilePath)
} else {
    Write-Host "Not running in Codespace, using default URL."
}


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
    & mono $nugetPath pack $nuspecPath -OutputDirectory $outputDir -Verbosity detailed
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
    npm start
} finally {
    Pop-Location
}
