param (
	[string]$outputDirectory
)
try
{
    if (-not($outputDirectory))
    {
        throw "Invalid input"
    }
    $appSettingsPath = "appsettings.json"
    $appSettingsContent = (Get-Content $appSettingsPath) -replace '// .*', '' -join [Environment]::NewLine | ConvertFrom-Json
    $workloadXmlPath = Join-Path -Path $PSScriptRoot -ChildPath "..\Packages\manifest\WorkloadManifest.xml"
    $workloadXml = [xml](Get-Content -Path $workloadXmlPath)
    $aadApp = $workloadXml.SelectSingleNode("//AADApp")
    if (($appSettingsContent.Audience -ne $aadApp.ResourceId) -or ($appSettingsContent.ClientId -ne $aadApp.AppId))
    {
        $scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "WriteErrorsToFile.ps1"
        & $scriptPath -errors "Non matching default values in WorkloadManifest.xml file" -outputDirectory $outputDirectory
    }
}
catch
{
    Write-Host "An error occurred:"
    Write-Host $_
}