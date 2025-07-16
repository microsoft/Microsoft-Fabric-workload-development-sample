param (
    #Indicates if the files should be validated before building the package
    [boolean]$ValidateFiles = $false
)

Write-Host "Building Nuget Package ..."

################################################
# Build the current nuget package
################################################
if($ValidateFiles -eq $true) {
    Write-Output "Validating configuration files..."
    $ScriptsDir = Join-Path $PSScriptRoot "Manifest\ValidationScripts"

    & "$ScriptsDir\RemoveErrorFile.ps1" -outputDirectory $ScriptsDir
    & "$ScriptsDir\ManifestValidator.ps1" -inputDirectory $manifestDir -inputXml "WorkloadManifest.xml" -inputXsd "WorkloadDefinition.xsd" -outputDirectory $ScriptsDir
    & "$ScriptsDir\ItemManifestValidator.ps1" -inputDirectory $manifestDir -inputXsd "ItemDefinition.xsd" -workloadManifest "WorkloadManifest.xml" -outputDirectory $ScriptsDir

    $validationErrorFile = Join-Path $ScriptsDir "ValidationErrors.txt"
    if (Test-Path $validationErrorFile) {
        Write-Host "Validation errors found. See $validationErrorFile"
        Get-Content $validationErrorFile | Write-Host
        exit 1
    }
}

################################################
# Build the current nuget package
################################################
$nugetPath = Join-Path $PSScriptRoot "..\..\Workload\node_modules\nuget-bin\nuget.exe"
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
    # alternatively, we could use dotnet tool if available
    # nuget pack $nuspecFile -OutputDirectory $outputDir -Verbosity detailed 2>&1   
    mono $nugetPath pack $nuspecPath -OutputDirectory $outputDir -Verbosity detailed
}

Write-Host “Created a new ManifestPackage in $outputDir." -ForegroundColor Blue

