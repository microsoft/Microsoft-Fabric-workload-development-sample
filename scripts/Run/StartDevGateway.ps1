param (
    [boolean]$InteractiveLogin = $true
)

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

$token = ""
# For Codespaces, we can't use interactive login, so we need to use az login with device code
# This is required to get the access token for the Fabric API
if ($env:CODESPACES -eq "true" -or -not $InteractiveLogin) {
    # Check if already logged in
    $account = az account show 2>$null
    if (-not $account) {
        Write-Host "Not logged in. You ndeed to perform az login..." -ForegroundColor Red
        az config set core.login_experience_v2=off | Out-Null
        $fabricTentanID = Read-Host "Enter your Fabric tenant id"
        $loginResult = az login -t $fabricTentanID --allow-no-subscriptions --use-device-code
    }

    $token = az account get-access-token --scope https://analysis.windows.net/powerbi/api/.default --query accessToken -o tsv 
}
$config = Get-Content -Path $CONFIGURATIONFILE -Raw | ConvertFrom-Json 
$manifestPackageFilePath = $config.ManifestPackageFilePath 
$workspaceGuid = $config.WorkspaceGuid 
$workloadEndpointURL = $config.WorkloadEndpointURL 
$logLevel = "Information"


if($IsWindows) { 
    & $fileExe -DevMode:LocalConfigFilePath $CONFIGURATIONFILE
} else {   
    & dotnet $fileExe -LogLevel $logLevel -DevMode:UserAuthorizationToken $token -DevMode:ManifestPackageFilePath $manifestPackageFilePath -DevMode:WorkspaceGuid $workspaceGuid -DevMode:WorkloadEndpointUrl $workloadEndpointURL
}