$fileExe = Join-Path $PSScriptRoot "..\..\tools\DevGateway\Microsoft.Fabric.Workload.DevGateway.exe"
$CONFIGURATIONFILE = Resolve-Path -Path (Join-Path $PSScriptRoot "..\..\config\DevGateway\workload-dev-mode.json")
$CONFIGURATIONFILE = $CONFIGURATIONFILE.Path
Write-Host "DevGateway used: $fileExe"
Write-Host "Configuration xsfile used: $CONFIGURATIONFILE"

if($IsWindows) {
    & $fileExe -DevMode:LocalConfigFilePath $CONFIGURATIONFILE
} else {
     # On Linux or MacOS, we need to use the mono runtime to execute the .exe file
    dotnet $fileExe -DevMode:LocalConfigFilePath $CONFIGURATIONFILE
}
