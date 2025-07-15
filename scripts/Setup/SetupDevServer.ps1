param (
    # Only the FERemote hosting type is supported for now
    [ValidateSet("Remote", "FERemote")]
    [string]$HostingType,
    # The name of the workload, used for the Entra App and the workload in the Fabric portal
    [String]$WorkloadName = "Org.MyWorkloadSample",
    # The display name of the workload, used in the Fabric portal
    [String]$WorkloadDisplayName = "My Sample Workload",
    # The Entra Application ID for the frontend
    # If not provided, the user will be prompted to enter it or create a new one.
    [String]$AADFrontendAppId = "00000000-0000-0000-0000-000000000000",
    # The Entra Application ID for the backend
    # Not used in the current setup, but can be used for future backend app configurations
    [String]$AADBackendAppId,
    # Force flag to overwrite existing configurations and don't prompt the user
    # If not provided, it will default to false.
    [boolean]$Force = $false
)

if ($HostingType -eq "FERemote" -or $HostingType -eq "Remote") {
    Write-Output "Using Hosting template $HostingType"
} else {
    Write-Host "Invalid parameter. Use 'Remote' or 'FERemote'."
    exit 1
}

###############################################################################
# Writing the DevServer config files
###############################################################################

Write-Output "Writing DevServer files ..."
$srcDevServerDir = Join-Path $srcTemplateDir "DevServer"
$destDevServerDir = Join-Path $PSScriptRoot "..\..\DevServer"

Write-Host "The DevServer destination dir $destDevServerDir"
Write-Host "The DevServer src dir $srcDevServerDir"

# Get all files in the source directory
Get-ChildItem -Path $srcDevServerDir -Force
Get-ChildItem -Path $srcDevServerDir -Force -File | ForEach-Object {
    $filePath = $_.FullName
    $content = Get-Content $filePath -Raw
    $destPath = Join-Path $destDevServerDir $_.Name

    $writeFile = $true
    if ((Test-Path $destPath) -and !$Force) {         
        $writeFile = Read-Host "File  $_ exists do you want to override it with the templates? (y/n)"      
    }

    if($writeFile) {
        Write-Host "Processing file: $filePath"
        foreach ($key in $replacements.Keys) {
            $content = $content -replace "\{\{$key\}\}", $replacements[$key]
        }
        Set-Content -Path $destPath -Value $content -Force
        Write-Output "$destPath"
    } else {
        Write-Host "Skipping file: $filePath"
    }
}

Write-Host "Setup DevServer finished successfully ..."  -ForegroundColor Green