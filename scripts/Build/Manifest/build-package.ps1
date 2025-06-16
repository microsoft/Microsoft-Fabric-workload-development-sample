param (
    [string]$ManifestType
)

# Set the source manifest file and definition file based on the parameter
$manifestDir = Join-Path $PSScriptRoot "..\..\..\config\Manifest"
$FEPath = Join-Path $PSScriptRoot "..\..\..\Frontend"

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
Write-Output "Creating nuget package..."
& nuget pack $nuspecFile -OutputDirectory $manifestDir -Verbosity detailed
$nugetExitCode = $LASTEXITCODE

if ($nugetExitCode -eq 0) {
    Write-Host "NuGet package built successfully ..."
} else {
    Write-Host "NuGet packaging failed. See output above."
    exit $nugetExitCode
}