param (
    [string]$inputDirectory,
    [string]$inputXsd,
    [string]$outputDirectory
)

try
{
    if (-not($inputDirectory -and $inputXsd -and $outputDirectory))
    {
        throw "Invalid input"
    }

    $workloadManifest = "WorkloadManifest.xml"
    $workloadXmlPath = "$($inputDirectory)$($workloadManifest)"
    $workloadXml = [xml](Get-Content -Path $workloadXmlPath)
    $workloadName = $workloadXml.WorkloadManifestConfiguration.Workload.WorkloadName

    $itemXmls = Get-ChildItem -Path $inputDirectory -Filter "*.xml"

    foreach ($itemXml in $itemXmls)
    {
        if ($itemXml.Name -ne $workloadManifest)
        {
            ."ValidationScripts/ManifestValidator.ps1" -inputDirectory $inputDirectory -inputXml $itemXml -inputXsd $inputXsd -outputDirectory $outputDirectory

            # Naming Validations
            $xdoc = [xml](Get-Content -Path ("$($inputDirectory)$($itemXml)"))
            $itemWorkloadName = $xdoc.ItemManifestConfiguration.Item.Workload.WorkloadName

            if ($itemWorkloadName -ne $workloadName)
            {
                ."ValidationScripts/WriteErrorsToFile.ps1" -errors "Non matching WorkloadName between WorkloadManifest.xml and $($itemXml)" -outputDirectory $outputDirectory
            }

            $itemName = $xdoc.ItemManifestConfiguration.Item.TypeName

            if (-not ($itemName -clike "$($itemWorkloadName).*"))
            {
                ."ValidationScripts/WriteErrorsToFile.ps1" -errors "Item name's prefix should be WorkloadName for item $($itemName)" -outputDirectory $outputDirectory
            }

            $jobNames = $xdoc.SelectNodes("//ItemJobType")

            foreach ($jobName in $jobNames)
            {
                if (-not ($jobName.Name -clike "$($itemName).*"))
                {
                    ."ValidationScripts/WriteErrorsToFile.ps1" -errors "Job type name's prefix should be ItemName for jobType $($jobName.Name)" -outputDirectory $outputDirectory
                }
            }
        }
    }
}
catch
{
    Write-Host "An error occurred:"
    Write-Host $_
}