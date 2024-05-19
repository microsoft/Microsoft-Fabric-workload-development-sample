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
    $appSettingsContent = (Get-Content $appSettingsPath) -replace '// .*', '' -join [Environment]::NewLine | ConvertFrom-json

    $workloadXmlPath = ".\Packages\manifest\WorkloadManifest.xml"
    $workloadXml = [xml](Get-Content -Path $workloadXmlPath)
    $aadApp = $workloadXml.SelectSingleNode("//AADApp")

    if (($appSettingsContent.Audience -ne $aadApp.ResourceId) -or ($appSettingsContent.ClientId -ne $aadApp.AppId))
    {
        ."ValidationScripts/WriteErrorsToFile.ps1" -errors "Non matching default values in WorkloadManifest.xml file" -outputDirectory $outputDirectory
    }
}
catch
{
    Write-Host "An error occurred:"
    Write-Host $_
}