Write-Output "Setting up the environment..."
#$nugetExe = Read-Host "Provide the path to the Nuge executable"
#$env:Path += ";$nugetExe"

Write-Output "Creating a new Entra Application..."
#& "$PSScriptRoot\CreateDevAADApp.ps1"

Write-Output "Configuring the project..."
#Write-Output "Not implemented yet"

Write-Output "Building the manifes..."
#& "$PSScriptRoot\..\Manifest\build-package.ps1" FERemote

Write-Output "Starting the Frontend..."
#Write-Output "Not implemented yet"

Write-Output "Starting the Dev-Gateway..."
#Write-Output "Not implemented yet"