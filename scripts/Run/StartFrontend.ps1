Write-Output "Starting the Frontend ..."

$frontendDir = Join-Path $PSScriptRoot "..\..\Frontend"
Push-Location $frontendDir
npm start
