
# Set the source manifest file and definition file based on the parameter
$manifestDir = Join-Path $PSScriptRoot "..\..\..\config\Manifest"

# --- Validation steps ---
Write-Output "Validating configuration files..."
$ScriptsDir = Join-Path $PSScriptRoot "ValidationScripts"

& "$ScriptsDir\RemoveErrorFile.ps1" -outputDirectory $ScriptsDir
& "$ScriptsDir\ManifestValidator.ps1" -inputDirectory $manifestDir -inputXml "WorkloadManifest.xml" -inputXsd "WorkloadDefinition.xsd" -outputDirectory $ScriptsDir
& "$ScriptsDir\ItemManifestValidator.ps1" -inputDirectory $manifestDir -inputXsd "ItemDefinition.xsd" -workloadManifest "WorkloadManifest.xml" -outputDirectory $ScriptsDir

$validationErrorFile = Join-Path $ScriptsDir "ValidationErrors.txt"
if (Test-Path $validationErrorFile) {
    Write-Host "Validation errors found. See $validationErrorFile"
    Get-Content $validationErrorFile | Write-Host
    exit 1
}


$nuspecFile = Join-Path $manifestDir "ManifestPackage.nuspec"

# Build the NuGet package using the temporary nuspec file
# Find nuget.exe in node_modules/.bin (relative to repo root)
$repoRoot = Join-Path $PSScriptRoot "..\..\..\Frontend"
$nugetExe = Resolve-Path -Path (Join-Path $repoRoot "node_modules\nuget-bin\nuget.exe")

# Build the NuGet package using the temporary nuspec file
Write-Output "Creating nuget package..."
& $nugetExe pack $nuspecFile -OutputDirectory $manifestDir -Verbosity detailed 2>&1
$nugetExitCode = $LASTEXITCODE

if ($nugetExitCode -eq 0) {
    Write-Host "NuGet package built successfully ..."  -ForegroundColor Green
} else {
    Write-Error "NuGet packaging failed. See output above."
    exit $nugetExitCode
}