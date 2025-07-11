$fileExe = Join-Path $PSScriptRoot "..\..\tools\DevGateway\Microsoft.Fabric.Workload.DevGateway.exe"
$CONFIGURATIONFILE = Resolve-Path -Path (Join-Path $PSScriptRoot "..\..\config\DevGateway\workload-dev-mode.json")
$CONFIGURATIONFILE = $CONFIGURATIONFILE.Path
Write-Host "DevGateway used: $fileExe"
Write-Host "Configuration xsfile used: $CONFIGURATIONFILE"

& $fileExe -DevMode:LocalConfigFilePath $CONFIGURATIONFILE



$fileExe = ""
if($IsWindows) { 
    $fileExe = Join-Path $PSScriptRoot "..\..\tools\DevGateway\Microsoft.Fabric.Workload.DevGateway.exe"
} else { 
    $fileExe = Join-Path $PSScriptRoot "..\..\tools\DevGateway\Microsoft.Fabric.Workload.DevGateway.dll"
}

$CONFIGURATIONFILE = Resolve-Path -Path (Join-Path $PSScriptRoot "..\..\config\DevGateway\workload-dev-mode.json")
$CONFIGURATIONFILE = $CONFIGURATIONFILE.Path
Write-Host "DevGateway used: $fileExe"
Write-Host "Configuration xsfile used: $CONFIGURATIONFILE"
if($IsWindows) { 
    & $fileExe -DevMode:LocalConfigFilePath $CONFIGURATIONFILE
} else { 
    #$token = az account get-access-token --scope https://analysis.windows.net/powerbi/api/.default --query accessToken -o tsv 
    $token = "" 
    $config = Get-Content -Path $CONFIGURATIONFILE -Raw | ConvertFrom-Json 
    $manifestPackageFilePath = $config.ManifestPackageFilePath 
    $workspaceGuid = $config.WorkspaceGuid 
    $workloadEndpointURL = $config.WorkloadEndpointURL 
    & dotnet $fileExe -DevMode:UserAuthorizationToken $token -DevMode:ManifestPackageFilePath $manifestPackageFilePath -DevMode:WorkspaceGuid $workspaceGuid -DevMode:WorkloadEndpointUrl $workloadEndpointURL
}