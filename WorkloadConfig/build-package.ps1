param (
    [string]$ManifestType
)

# Set the source manifest file and definition file based on the parameter
$manifestFile = ""
$definitionFile = ""

if ($ManifestType -eq "Remote") {
    $manifestFile = "Remote\WorkloadManifest.xml"
    $definitionFile = "Remote\WorkloadDefinition.xsd"
} elseif ($ManifestType -eq "FERemote") {
    $manifestFile = "FERemote\FERemoteWorkloadManifest.xml"
    $definitionFile = "FERemote\FERemoteWorkloadDefinition.xsd"
} else {
    Write-Host "Invalid parameter. Use 'Remote' or 'FERemote'."
    exit 1
}

# --- Validation steps ---
$ScriptsDir = Join-Path $PSScriptRoot "ValidationScripts"
$ManifestDir = Join-Path $PSScriptRoot "Packages\manifest"

& "$ScriptsDir\RemoveErrorFile.ps1" -outputDirectory $ScriptsDir
& "$ScriptsDir\ManifestValidator.ps1" -inputDirectory $ManifestDir -inputXml $manifestFile -inputXsd $definitionFile -outputDirectory $ScriptsDir
& "$ScriptsDir\ItemManifestValidator.ps1" -inputDirectory $ManifestDir -inputXsd "Item\ItemDefinition.xsd" -workloadManifest $manifestFile -outputDirectory $ScriptsDir

$validationErrorFile = Join-Path $ScriptsDir "ValidationErrors.txt"
if (Test-Path $validationErrorFile) {
    Write-Host "Validation errors found. See $validationErrorFile"
    Get-Content $validationErrorFile | Write-Host
    exit 1
}

# Use a temporary nuspec file
$nuspecFile = "ManifestPackageDebug.nuspec"
$tempNuspecFile = [System.IO.Path]::Combine($PSScriptRoot, "ManifestPackageDebug.temp.nuspec")

# Read and update nuspec content
$nuspecContent = Get-Content $nuspecFile -Raw
$updatedNuspecContent = $nuspecContent -replace 'WorkloadPath', $manifestFile

# Write to the temporary nuspec file
Set-Content $tempNuspecFile -Value $updatedNuspecContent

# Build the NuGet package using the temporary nuspec file
& nuget pack $tempNuspecFile -OutputDirectory . -Verbosity detailed
$nugetExitCode = $LASTEXITCODE

# Remove the temporary nuspec file
Remove-Item $tempNuspecFile

if ($nugetExitCode -eq 0) {
    Write-Host "NuGet package built successfully with $manifestFile included."
} else {
    Write-Host "NuGet packaging failed. See output above."
    exit $nugetExitCode
}