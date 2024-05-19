# Function to write errors to file
param (
    [string]$errors,
    [string]$outputDirectory
)

try
{
    if (-not($errors -and $outputDirectory))
    {
        throw "Invalid input"
    }

    $validationErrorsFile = "ValidationErrors.txt"
    $outputFile = Join-Path -Path $outputDirectory -ChildPath $validationErrorsFile

    $errors | Out-File -FilePath $outputFile -Append
}
catch
{
    Write-Host "An error occurred:"
    Write-Host $_
}