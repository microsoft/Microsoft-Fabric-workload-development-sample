$fileExe = Join-Path $PSScriptRoot "..\..\tools\DevGateway\Microsoft.Fabric.Workload.DevGateway.exe"
$CONFIGURATIONFILE = Resolve-Path -Path (Join-Path $PSScriptRoot "..\..\config\DevGateway\workload-dev-mode.json")
$CONFIGURATIONFILE = $CONFIGURATIONFILE.Path
Write-Host "DevGateway used: $fileExe"
Write-Host "Configuration xsfile used: $CONFIGURATIONFILE"
& $fileExe -DevMode:LocalConfigFilePath $CONFIGURATIONFILE