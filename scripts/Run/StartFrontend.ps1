Write-Output "Starting the Frontend ..."

try {
    $frontendDir = Join-Path $PSScriptRoot "..\..\Frontend"
    Push-Location $frontendDir
    npm start
} finally {
    Pop-Location
}
