Write-Output "Setting up the environment..."
Write-Output "TODO:Ask for download of DevGateway..."
Write-Output "TODO:Extract DevGateway to tools directory ..."

#Write-Output "Creating a new Entra Application..."
#& "$PSScriptRoot\CreateDevAADApp.ps1"
#To make CreateDevAADApp. work
# remove the scopes and only keep the FabricExtend (first one) scope
# add the new redirect URIs - for that you need to ask for tenant id and replace the workloadId 
Write-Output "TODO:Give me Entra App Id ..."


Write-Output "Configuring the project..."
Write-Output "TODO:Updateing Entra App ids in Workload Manfest.xml & .env.dev ..."

Write-Output "Building the manifes..."
Write-Output "TODO:Update the build-package.ps1 file to use js instead of Nuget.exe ..."
& "$PSScriptRoot\..\Manifest\build-package.ps1" FERemote

Write-Output "TODO:Give me Entra Workspac Id ..."

Write-Output "TODO:Update absolute path in ../config/DevGateway/workload-dev-mode.json"
Write-Output "TODO:Update worksapace Id  in ../config/DevGateway/workload-dev-mode.json"


Write-Output "TODO:for starting DevGateway call abdc.exe -DevMode:LocalConfigFilePath ../config/DevGateway/workload-dev-mode.json "

Write-Output "open website to fabric "
Write-Output "Turn on development mode  "
