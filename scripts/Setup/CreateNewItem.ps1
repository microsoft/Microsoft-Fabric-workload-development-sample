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
    Write-Output "File created: $DestinationFile"
}



###############################################################################
# Configure the item
###############################################################################
$srCodeDir = Join-Path $PSScriptRoot "..\..\Frontend\src\workload\items\HelloWorldItem"
$targetFile = Replace-HelloWorldPath -Path $srcFile
Write-Output "Using Hello World sample in $srCodeDir as source"
Write-Output "Write the item code in $targetCodeDir"

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

$srcFile = Join-Path $PSScriptRoot "..\..\config\templates\Manifest\Item.xml"
if (Test-Path $srcFile) {
    $targetFile = Join-Path $PSScriptRoot "..\..\config\Manifest\$itemName.xml"
    Copy-HelloWorldFile -SourceFile $srcFile -DestinationFile $targetFile
} else {
    Write-Host "${redColor}Item.xml not found at $targetFile"
}

$srcFile = Join-Path $PSScriptRoot "..\..\config\templates\Manifest\Item.json"
if (Test-Path $srcFile) {
    $targetFile = Join-Path $PSScriptRoot "..\..\config\Manifest\$itemName.json"
    Copy-HelloWorldFile -SourceFile $srcFile -DestinationFile $targetFile
} else {
    Write-Host "${redColor}Item.json not found at $targetFile"
}

Write-Output "TODO: Add the configuration Section to the Product.json file"
Write-Output "TODO: Add the Translations to the Manifest asset files"
Write-Output "TODO: add the routing to the App.tsx file"


