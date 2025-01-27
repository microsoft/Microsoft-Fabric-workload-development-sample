param (
    [string]$applicationName, # The desired name of the application for your workload
    [string]$workloadName, # The name of the workload
    [string]$tenantId # The ID of the tenant where the workload dev instance will be published
)

function PostAADRequest {
    param (
        [string]$url,
        [string]$body
    )

    return az rest --method POST --url $url --body $body --headers "Content-Type=application/json"
}

function PrintInfo {
    param (
        [string]$key,
        [string]$value
    )
    $boldText = [char]27 + "[1m"
    $resetText = [char]27 + "[0m"
    Write-Host ("${boldText}$key : ${resetText}" + $value)
}

$loginResult = az login --allow-no-subscriptions

Write-Host "------------------------------------------------"
Write-Host "------------------------------------------------"
Write-Host "------------------------------------------------"

if (-not $applicationName) {
    $applicationName = Read-Host "Enter the desired application name"
}
if (-not $workloadName) {
    $workloadName = Read-Host "Enter your workload name"
}
while (-not ($workloadName -match "^Org\.[^.]+$"))
{
    $workloadName = Read-Host "Workload name must start with Org. and contain only 2 segments!. please re-enter your workload name"
}
if (-not $tenantId) {
    $tenantId = Read-Host "Enter your tenant id (tenant id of the user you are using in Fabric to develop your workload)"
}

$redirectUri = "http://localhost:60006/close"

$FabricWorkloadControlGuid = New-Guid
$Item1ReadAllGuid = New-Guid
$Item1ReadWriteAllGuid = New-Guid
$FabricLakehouseReadAllGuid = New-Guid
$FabricLakehouseReadWriteAllGuid = New-Guid

## Generate URI

$length = Get-Random -Minimum 1 -Maximum 6  # Generate a random length between 1 and 5

# Generate a random string for the audience (see below)
$randomString = -join ((65..90) + (97..122) | Get-Random -Count $length | ForEach-Object { [char]$_ })

# Create an audience for the application that contains 4 parts:
# 1. The audience should start with api://localdevinstance.
# 2. The next part should be the tenantId where the workload dev instance will be published.
# 3. After that should come the wokrload name.
# 4. The last part is a random string - this is optional, but we add it everytime to avoid collisions as AAD does not allow 2 applications to have the same audience.
$applicationIdUri = "api://localdevinstance/" + $tenantId + "/" + $workloadName + "/" + $randomString

$application = @{
    displayName = $applicationName
    signInAudience = "AzureADMultipleOrgs"
    optionalClaims = @{
        accessToken = @(
            @{
                essential = $false
                name = "idtyp"
            }
        )
    }
    spa = @{
        redirectUris = @(
            $redirectUri
        )
    }
    identifierUris = @($applicationIdUri)
    api = @{
        oauth2PermissionScopes = @( # Scopes
            @{
                adminConsentDisplayName = "FabricWorkloadControl"
                adminConsentDescription = "FabricWorkloadControl"
                value = "FabricWorkloadControl"
                id = $FabricWorkloadControlGuid
                isEnabled = $true
                type = "Admin"
            },
            @{
                adminConsentDisplayName = "Item1.Read.All"
                adminConsentDescription = "Item1.Read.All"
                value = "Item1.Read.All"
                id = $Item1ReadAllGuid
                isEnabled = $true
                type = "Admin"
            },
            @{
                adminConsentDisplayName = "Item1.ReadWrite.All"
                adminConsentDescription = "Item1.ReadWrite.All"
                value = "Item1.ReadWrite.All"
                id = $Item1ReadWriteAllGuid
                isEnabled = $true
                type = "Admin"
            },
            @{
                adminConsentDisplayName = "FabricLakehouse.Read.All"
                adminConsentDescription = "FabricLakehouse.Read.All"
                value = "FabricLakehouse.Read.All"
                id = $FabricLakehouseReadAllGuid
                isEnabled = $true
                type = "Admin"
            },
            @{
                adminConsentDisplayName = "FabricLakehouse.ReadWrite.All"
                adminConsentDescription = "FabricLakehouse.ReadWrite.All"
                value = "FabricLakehouse.ReadWrite.All"
                id = $FabricLakehouseReadWriteAllGuid
                isEnabled = $true
                type = "Admin"
            }
        )
        preAuthorizedApplications = @( # Preauthorize
            @{
                appId = "871c010f-5e61-4fb1-83ac-98610a7e9110"
                delegatedPermissionIds = @(
                    $Item1ReadAllGuid, $Item1ReadWriteAllGuid, $FabricLakehouseReadAllGuid, $FabricLakehouseReadWriteAllGuid 
                )
            },
             @{
                appId = "00000009-0000-0000-c000-000000000000"
                delegatedPermissionIds = @(
                    $FabricWorkloadControlGuid
                )
            },
            @{
                appId = "d2450708-699c-41e3-8077-b0c8341509aa"
                delegatedPermissionIds = @(
                    $FabricWorkloadControlGuid
                )
            }
        )
    }
     requiredResourceAccess = @( # API Permissions
            @{
                resourceAppId = "e406a681-f3d4-42a8-90b6-c2b029497af1" # Azure Storage
                resourceAccess = @(
                    @{
                        id = "03e0da56-190b-40ad-a80c-ea378c433f7f" # user_impersonation
                        type = "Scope"
                    }
                )
            },
            @{
                resourceAppId = "00000003-0000-0000-c000-000000000000" # Graph
                resourceAccess = @(
                    @{
                        id = "e1fe6dd8-ba31-4d61-89e7-88639da4683d" # User.Read
                        type = "Scope"
                    }
                )
            },
            @{
                resourceAppId = "00000009-0000-0000-c000-000000000000" # PBI Service
                resourceAccess = @(
                    @{
                        id = "7ba630b9-8110-4e27-8d17-81e5f2218787" # Fabric.Extend
                        type = "Scope"
                    },
                    @{
                        id = "b2f1b2fa-f35c-407c-979c-a858a808ba85" # Workspace.Read.All
                        type = "Scope"
                    },
                    @{
                        id = "caf40b1a-f10e-4da1-86e4-5fda17eb2b07" # Item.Execute.ALL
                        type = "Scope"
                    },
                    @{
                        id = "d2bc95fc-440e-4b0e-bafd-97182de7aef5" # Item.Read.All
                        type = "Scope"
                    },
                    @{
                        id = "7a27a256-301d-4359-b77b-c2b759d2e362" # Item.ReadWrite.All
                        type = "Scope"
                    },
                    @{
                        id = "02e8d710-956c-4760-b996-2e83935c2cf5" # Item.Reshare.All
                        type = "Scope"
                    },
                    @{
                        id = "13060bfd-9305-4ec6-8388-8916580f4fa9" # Lakehouse.Read.All
                        type = "Scope"
                    }
                )
            }
        )
}

# Convert to valid json format (escape the '"')
$applicationJson = ( $application | ConvertTo-Json -Compress -Depth 10) -replace '"','\"'

# Create application
$result = PostAADRequest -url https://graph.microsoft.com/v1.0/applications -body $applicationJson

$resultObject = $result | ConvertFrom-Json

$applicationObjectId = $resultObject.id

if ($null -eq $applicationObjectId) {
    Write-Host "Failed to fetch id of application... exiting"
    Exit
}

$applicationId = $resultObject.appId

# Add secret
# Get dates for creation & experation
$startUtcDateTimeString = [DateTime]::UtcNow
$endUtcDateTimeString = $startUtcDateTimeString.AddDays(180)

$startUtcDateTimeString = $startUtcDateTimeString.ToString('u') -replace ' ', 'T'
$endUtcDateTimeString = $endUtcDateTimeString.ToString('u') -replace ' ', 'T'

$passwordCreds = @{
  passwordCredential = @{
    displayName = "SampleSecret"
    endDateTime = $endUtcDateTimeString
    startDateTime = $startUtcDateTimeString
  }
}

# Convert to valid json format (escape the '"')
$passwordCredsJson = ( $passwordCreds | ConvertTo-Json -Compress -Depth 10) -replace '"','\"'

$addPasswordResult = PostAADRequest -url ("https://graph.microsoft.com/v1.0/applications/" + $applicationObjectId + "/addPassword") -body $passwordCredsJson
$addPasswordObject = ($addPasswordResult | ConvertFrom-Json)
$secret = $addPasswordObject.secretText

if ($null -eq $secret) {
    Write-Host "Failed to add secret, please add it manually..."
}

# Result
$greenColor = [char]27 + "[32m"

Write-Host "${greenColor}All set! Here's what you need:"
Write-Host "------------------------------------------------"
PrintInfo -key "ApplicationIdUri / Audience" -value $applicationIdUri
PrintInfo -key "RedirectURI" -value $redirectUri
PrintInfo -key "Application Id" -value $applicationId
PrintInfo -key "secret" -value $secret

Write-Host "------------------------------------------------"
Write-Host "You can see the application here:" ("https://ms.portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/" + $applicationId + "/isMSAApp~/false")
Write-Host "------------------------------------------------"
Write-Host ("You can consent for the application for your tenant (Valid from tenant admin only) here, wait a minute before navigating: " + "https://login.microsoftonline.com/" + $tenantId + "/adminconsent?client_id=" + $applicationId)
