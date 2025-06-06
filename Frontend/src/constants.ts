export enum EnvironmentConstants {
    FabricApiBaseUrl = "https://dxtapi.powerbi.com",
    OneLakeDFSBaseUrl= "https://dxt-onelake.dfs.fabric.microsoft.com",
    LivyApiBaseUrl = "https://dxt-livy.azure.com/api/v1"
}
//user_impersonation
export const oneLakeScope = "https://storage.azure.com/user_impersonation";

export const livyScope = ["https://api.fabric.microsoft.com/Lakehouse.Execute.All", 
                            "https://api.fabric.microsoft.com/Lakehouse.Read.All", 
                            "https://api.fabric.microsoft.com/Item.ReadWrite.All", 
                            "https://api.fabric.microsoft.com/Workspace.ReadWrite.All", 
                            "https://api.fabric.microsoft.com/Code.AccessStorage.All", 
                            "https://api.fabric.microsoft.com/Code.AccessAzureKeyvault.All", 
                            "https://api.fabric.microsoft.com/Code.AccessAzureDataExplorer.All", 
                            "https://api.fabric.microsoft.com/Code.AccessAzureDataLake.All", 
                            "https://api.fabric.microsoft.com/Code.AccessFabric.All"].toString();
