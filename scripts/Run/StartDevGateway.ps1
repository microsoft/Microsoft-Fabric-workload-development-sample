$fileExe = $PSScriptRoot + "\..\..\tools\DevGateway\Microsoft.Fabric.Workload.DevGateway.exe"
$CONFIGURATIONFILE = $PSScriptRoot + "\..\..\config\DevGateway\workload-dev-mode.json"
Write-Host "DevGateway used: $fileExe"
Write-Host "Configurationfile used: $CONFIGURATIONFILE"
& $fileExe -DevMode:LocalConfigFilePath $CONFIGURATIONFILE