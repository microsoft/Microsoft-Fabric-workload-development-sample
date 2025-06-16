param (
    [string]$HostingType
)

# Set the source manifest file and definition file based on the parameter
$manifestDir = Join-Path $PSScriptRoot "..\..\..\config\Manifest"
$packageConfigDir = Join-Path $manifestDir "Current"
 

$FEPath = Join-Path $PSScriptRoot "..\..\..\Frontend"

# --- Validation steps ---
Write-Output "Validating configuration files..."
$ScriptsDir = Join-Path $PSScriptRoot "ValidationScripts"

& "$ScriptsDir\RemoveErrorFile.ps1" -outputDirectory $ScriptsDir
& "$ScriptsDir\ManifestValidator.ps1" -inputDirectory $packageConfigDir -inputXml $manifestFile -inputXsd "WorkloadDefinition.xsd" -outputDirectory $ScriptsDir
& "$ScriptsDir\ItemManifestValidator.ps1" -inputDirectory $packageConfigDir -inputXsd "ItemDefinition.xsd" -workloadManifest $manifestFile -outputDirectory $ScriptsDir

$validationErrorFile = Join-Path $ScriptsDir "ValidationErrors.txt"
if (Test-Path $validationErrorFile) {
    Write-Host "Validation errors found. See $validationErrorFile"
    Get-Content $validationErrorFile | Write-Host
    exit 1
}

# Use a temporary nuspec file
Write-Output "Create temp nuspec file..."
$nuspecFile = Join-Path $manifestDir "ManifestPackage.nuspec"
$tempNuspecFile = Join-Path $manifestDir "ManifestPackage.temp.nuspec"

# Read and update nuspec content
$nuspecContent = Get-Content $nuspecFile -Raw
$nuspecContent = $nuspecContent -replace '<BEPath>', ($packageConfigDir + '\')
$nuspecContent = $nuspecContent -replace '<FEPath>', (Join-Path $FEPath "Package\")

# Write to the temporary nuspec file
Set-Content $tempNuspecFile -Value $nuspecContent

# Build the NuGet package using the temporary nuspec file
Write-Output "Creating nuget package..."
& nuget pack $tempNuspecFile -OutputDirectory $manifestDir -Verbosity detailed
$nugetExitCode = $LASTEXITCODE

# Remove the temporary nuspec file
Remove-Item $tempNuspecFile

if ($nugetExitCode -eq 0) {
    Write-Host "NuGet package built successfully with $manifestFile included."
} else {
    Write-Host "NuGet packaging failed. See output above."
    exit $nugetExitCode
}