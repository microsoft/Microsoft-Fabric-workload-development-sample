param (
    # The name of the workload, used for the Entra App and the workload in the Fabric portal
    [String]$WorkloadName = "Org.MyWorkloadSample",
    # The name of the item, used for the item in the Fabric portal
    # Items will be created with the {WorkloadName}.{ItemName} format in Fabric
    [String]$ItemName
)

###############################################################################
# Functions used in the script
# These functions are used to copy files and replace placeholders in the content
###############################################################################
function Replace-HelloWorldPath {
    param (
        [String]$Path
    )
    return $Path -replace "HelloWorld", $ItemName 
}

function Replace-HelloWorld {
    param (
        [string]$Content
    )
    $content = $content -replace "HelloWorld", $ItemName
    $content = $content -replace "\{\{WORKLOAD_NAME\}\}", $WorkloadName
    $content = $content -replace "\{\{ITEM_NAME\}\}", $ItemName
    return $content
}

function Copy-HelloWorldFile {
    param (
        [string]$SourceFile,
        [string]$DestinationFile
    )
    $content = Get-Content $SourceFile -Raw
    $content = Replace-HelloWorld $content

    New-Item -Path $DestinationFile -ItemType File -Force | Out-Null
    Set-Content -Path $DestinationFile -Value $content -Force
    Write-Output " $DestinationFile"
}

function Replace-Content {
    param (
        [string]$SourceFile,
        [hashtable]$Replacments
    )
    $content = Get-Content $SourceFile -Raw
    foreach ($key in $Replacments.Keys) {
        Write-Output "Replacing '$key' with '$($Replacments[$key])' in $SourceFile"
        $content = $content -replace $key, $Replacments[$key]
    }

    Set-Content -Path $SourceFile -Value $content -Force
}



###############################################################################
# Configure the item
###############################################################################
$srCodeDir = Join-Path $PSScriptRoot "..\..\Frontend\src\workload\items\HelloWorldItem"
$targetFile = Replace-HelloWorldPath -Path $srcFile
Write-Output "Using Hello World sample in $srCodeDir as source"
Write-Host ""
Write-Host "Creating code files..."
$targetCodeDir = Join-Path $PSScriptRoot "..\..\Frontend\src\workload\items\${ItemName}Item-editor"
Write-Host "Write the item code in:"
Write-Host " $targetCodeDir"

###############################################################################
# Writing code files
# This will create a new item in the src\workload\items directory
###############################################################################
Get-ChildItem -Recurse -Path $srCodeDir -File |  
    ForEach-Object {
        $srcFile = $_.FullName
        $targetFile = Replace-HelloWorldPath -Path $srcFile
        Copy-HelloWorldFile -SourceFile $srcFile -DestinationFile $targetFile
    }


###############################################################################
# Writing manifest files
# This will create a new item in the Manfiest directory
###############################################################################
Write-Host ""
Write-Host "Creating manifest files..."
$srcFile = Join-Path $PSScriptRoot "..\..\config\templates\Manifest\Item.xml"
if (Test-Path $srcFile) {
    $targetFile = Join-Path $PSScriptRoot "..\..\config\Manifest\$itemName.xml"
    Copy-HelloWorldFile -SourceFile $srcFile -DestinationFile $targetFile
} else {
    Write-Host "Item.xml not found at $targetFile" -ForegroundColor Red
}

$srcFile = Join-Path $PSScriptRoot "..\..\config\templates\Manifest\Item.json"
if (Test-Path $srcFile) {
    $targetFile = Join-Path $PSScriptRoot "..\..\config\Manifest\$itemName.json"
    Copy-HelloWorldFile -SourceFile $srcFile -DestinationFile $targetFile

    $replacements = @{
        "HelloWorld" = $ItemName
    }

    Replace-Content -SourceFile $targetFile -Replacements $replacements
} else {
    Write-Host "Item.json not found at $targetFile" -ForegroundColor Red
}

Write-Host ""
$targetFile = Join-Path $PSScriptRoot "..\..\config\Manifest\Product.json"
$targetFile = Resolve-Path $targetFile
Write-Host "TODO: Add the configuration Section to the Product.json file!" -ForegroundColor Blue
Write-Host "The file you need to change is:"
Write-Host " $targetFile"

Write-Host ""
$targetFile = Join-Path $PSScriptRoot "..\..\config\Manifest\assets\locales"
$targetFile = Resolve-Path $targetFile
Write-Host " Add the Translations to the Manifest asset files!" -ForegroundColor Blue
Write-Host "The file you need to change are located here:"
Write-Host " $targetFile"

Write-Host ""
$targetFile = Join-Path $PSScriptRoot "..\..\Frontend\src\App.tsx"
$targetFile = Resolve-Path $targetFile
$routingEntry = "${ItemName}Item-editor"
Write-Host "TODO: add the routing for '$routingEntry' to the App.tsx file!" -ForegroundColor Blue
Write-Host "The file you need to change is:"
Write-Host " $targetFile"



