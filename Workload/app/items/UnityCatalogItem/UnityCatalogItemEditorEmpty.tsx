import React, { useState, useEffect } from "react";
import { Stack } from "@fluentui/react";
import { Text, Button, Input, Field, Dropdown, Option, Checkbox, Spinner } from "@fluentui/react-components";
import "../../styles.scss";
import { WorkloadClientAPI } from "@ms-fabric/workload-client";
import { UnityCatalogItemDefinition, UnityCatalogConfig, DEFAULT_SHORTCUT_PREFIX, UNITY_PROXY_URL} from "./UnityCatalogItemModel";
import { CatalogInfo, UnityCatalogProxyClient } from "../../../api/UnityCatalog/client";
import { FabricPlatformAPIClient } from "../../clients/FabricPlatformAPIClient";
import { Connection } from "../../clients/FabricPlatformTypes";

interface UnityCatalogItemEmptyStateProps {
  workloadClient: WorkloadClientAPI;
  onFinishEmpty: (config: UnityCatalogItemDefinition) => void;
}

export const UnityCatalogItemEmpty: React.FC<UnityCatalogItemEmptyStateProps> = ({
  workloadClient,
  onFinishEmpty
}) => {
  const [databricksWorkspace, setDatabricksWorkspace] = useState<string>("");
  const [databricksToken, setDatabricksToken] = useState<string>("");
  const [catalog, setCatalog] = useState<string>("");
  const [schemas, setSchemas] = useState<string[]>([]);
  const [connectionId, setConnectionId] = useState<string>("");
  
  // UI state
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [availableCatalogs, setAvailableCatalogs] = useState<string[]>([]);
  const [availableSchemas, setAvailableSchemas] = useState<string[]>([]);
  const [availableConnections, setAvailableConnections] = useState<Connection[]>([]);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState<boolean>(false);
  const [isLoadingSchemas, setIsLoadingSchemas] = useState<boolean>(false);
  const [isLoadingConnections, setIsLoadingConnections] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");
  
  const canLogin = databricksWorkspace && databricksToken;
  const canConfigure = isLoggedIn && catalog && schemas.length > 0 && connectionId && 
    availableConnections.some(conn => conn.id === connectionId);

  // Load connections on component mount
  useEffect(() => {
    loadConnections();
  }, []);


  function getUnifyCatalogAPIClient() : UnityCatalogProxyClient {
    const tempConfig: UnityCatalogConfig = {
        databrickURL: databricksWorkspace,
        databricksToken,
        catalog: "",
        schemas: [],
        connectionId: "",
        considerTableChanges: true
      };
      const apiClient = new UnityCatalogProxyClient(tempConfig, UNITY_PROXY_URL);
      apiClient.testConnection();
      return apiClient;
  }

  const loadConnections = async () => {
    setIsLoadingConnections(true);
    try {
      const fabricClient = FabricPlatformAPIClient.create(workloadClient);
      const connections = await fabricClient.connections.getAllConnections();
      const filteredConnections = connections.filter(conn => conn.connectionDetails?.type === "AzureDataLakeStorage");
      setAvailableConnections(filteredConnections);
    } catch (error) {
      console.error("Failed to fetch connections:", error);
      setAvailableConnections([]);
    } finally {
      setIsLoadingConnections(false);
    }
  };

  const handleLogin = async () => {
    if (!canLogin) return;
    
    setIsLoggingIn(true);
    setLoginError("");
    
    try {
      
      const apiClient = getUnifyCatalogAPIClient()
      
      // Test connection and fetch catalogs
      setIsLoadingCatalogs(true);
      const catalogs = await apiClient.listCatalogs();
      
      const availableCatalogs = catalogs.catalogs?.map((c: CatalogInfo) => c.name) || []
      setAvailableCatalogs(availableCatalogs);
      setIsLoggedIn(true);
      setIsLoadingCatalogs(false);
      
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Failed to connect to Unity Catalog");
      setIsLoggedIn(false);
      setAvailableCatalogs([]);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCatalogChange = async (catalogName: string) => {
    setCatalog(catalogName);
    setSchemas([]);
    setAvailableSchemas([]);
    
    if (!catalogName) return;
    
    setIsLoadingSchemas(true);
    try {
      const apiClient = getUnifyCatalogAPIClient();
      const schemaList = await apiClient.listSchemas(catalogName);
      const availableSchemas = schemaList.schemas?.map(s => s.name) || []
      setAvailableSchemas(availableSchemas);
    } catch (error) {
      console.error("Failed to fetch schemas:", error);
      setAvailableSchemas([]);
    } finally {
      setIsLoadingSchemas(false);
    }
  };

  const handleSchemaToggle = (schemaName: string, checked: boolean) => {
    if (checked) {
      setSchemas(prev => [...prev, schemaName]);
    } else {
      setSchemas(prev => prev.filter(s => s !== schemaName));
    }
  };
  
  const saveItem = () => {
    const unityConfig: UnityCatalogConfig = {
      databrickURL: databricksWorkspace,
      databricksToken,
      catalog,
      schemas,
      connectionId,
      considerTableChanges: true
    };
    const config: UnityCatalogItemDefinition = {
        unityConfig: unityConfig,
        fabricConfig: {
            connectionId: connectionId,
            shortcutPrefix: DEFAULT_SHORTCUT_PREFIX
        },
        shortcuts: []
    }
    onFinishEmpty(config);
  };
  return (
    <Stack className="empty-item-container" style={{ minHeight: 1200, height: '100%', maxHeight: '100%' }} horizontalAlign="start" tokens={{ childrenGap: 16 }}>
      <Stack.Item>
        <img
          src="/assets/items/UnityCatalogItem/EditorEmpty.png"
          alt="Empty Unity Catalog item illustration"
          className="empty-item-image"
        />
      </Stack.Item>
      <Stack.Item>
        <Text as="h2" size={800} weight="semibold">
          Configure Unity Catalog Integration
        </Text>
      </Stack.Item>
      <Stack.Item style={{ marginTop: '16px', marginBottom: '24px' }}>
        <Text>
          Set up your Databricks Unity Catalog connection to start creating shortcuts to OneLake.
        </Text>
      </Stack.Item>
      
      <Stack style={{ width: '600px', gap: '16px' }}>
        {/* Step 1: Workspace URL and Token */}
        <Field label="Databricks Workspace URL" required>
          <Input
            value={databricksWorkspace}
            onChange={(e, data) => setDatabricksWorkspace(data.value)}
            placeholder="https://your-workspace.cloud.databricks.com/"
            disabled={isLoggedIn}
          />
        </Field>
        
        <Field label="Databricks Token" required>
          <Input
            type="password"
            value={databricksToken}
            onChange={(e, data) => setDatabricksToken(data.value)}
            placeholder="dapi..."
            disabled={isLoggedIn}
          />
        </Field>

        {/* Login Button */}
        {!isLoggedIn && (
          <>
            <Stack.Item style={{ marginTop: '8px' }}>
              <Button 
                appearance="secondary" 
                onClick={handleLogin}
                disabled={!canLogin || isLoggingIn}
              >
                {isLoggingIn ? (
                  <Stack horizontal tokens={{ childrenGap: 8 }}>
                    <Spinner size="tiny" />
                    <Text>Connecting...</Text>
                  </Stack>
                ) : (
                  "Login to Unity Catalog"
                )}
              </Button>
            </Stack.Item>
            {loginError && (
              <Stack.Item>
                <Text style={{ color: 'red', fontSize: '12px' }}>
                  {loginError}
                </Text>
              </Stack.Item>
            )}
          </>
        )}

        {/* Step 2: Catalog Selection */}
        {isLoggedIn && (
          <>
            <Field label="Unity Catalog Name" required>
              <Dropdown
                placeholder="Select a catalog"
                value={catalog}
                onOptionSelect={(e, data) => handleCatalogChange(data.optionValue as string)}
                disabled={isLoadingCatalogs}
                style={{ maxHeight: '240px' }} // Approx 10 items * 24px height
                listbox={{ style: { maxHeight: '240px', overflowY: 'auto' } }}
              >
                {availableCatalogs.map(catalogName => (
                  <Option key={catalogName} value={catalogName}>
                    {catalogName}
                  </Option>
                ))}
              </Dropdown>
              {isLoadingCatalogs && (
                <Stack horizontal tokens={{ childrenGap: 8 }} style={{ marginTop: '8px' }}>
                  <Spinner size="tiny" />
                  <Text style={{ fontSize: '12px' }}>Loading catalogs...</Text>
                </Stack>
              )}
            </Field>

            {/* Step 3: Schema Selection */}
            {catalog && (
              <Field label="Schemas" required>
                <Stack style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid #ccc', padding: '8px', borderRadius: '4px' }}>
                  {isLoadingSchemas ? (
                    <Stack horizontal tokens={{ childrenGap: 8 }}>
                      <Spinner size="tiny" />
                      <Text style={{ fontSize: '12px' }}>Loading schemas...</Text>
                    </Stack>
                  ) : availableSchemas.length > 0 ? (
                    availableSchemas.map(schemaName => (
                      <Checkbox
                        key={schemaName}
                        label={schemaName}
                        checked={schemas.includes(schemaName)}
                        onChange={(e, data) => handleSchemaToggle(schemaName, data.checked === true)}
                      />
                    ))
                  ) : (
                    <Text style={{ fontSize: '12px', color: '#666' }}>No schemas found in this catalog</Text>
                  )}
                </Stack>
              </Field>
            )}

            {/* Step 4: Connection Selection */}
            {schemas.length > 0 && (
              <Field label="Fabric Connection" required>
                <Stack>
                  <Dropdown
                    placeholder={availableConnections.length > 0 ? "Select a connection" : "No connections available"}
                    value={connectionId}
                    onOptionSelect={(e, data) => setConnectionId(data.optionValue as string)}
                    disabled={isLoadingConnections || availableConnections.length === 0}
                    style={{ maxHeight: '240px' }}
                    listbox={{ style: { maxHeight: '240px', overflowY: 'auto' } }}
                  >
                    {availableConnections.map(connection => (
                      <Option key={connection.id} value={connection.id} text={`${connection.displayName} (${connection.connectionDetails.type})`}>
                        {connection.displayName} ({connection.connectionDetails.type})
                      </Option>
                    ))}
                  </Dropdown>
                  
                  <Stack horizontal tokens={{ childrenGap: 8 }} style={{ marginTop: '8px' }}>
                    <Button 
                      size="small" 
                      appearance="subtle" 
                      onClick={loadConnections}
                      disabled={isLoadingConnections}
                    >
                      {isLoadingConnections ? (
                        <>
                          <Spinner size="tiny" />
                          <Text style={{ marginLeft: '4px', fontSize: '12px' }}>Loading...</Text>
                        </>
                      ) : (
                        availableConnections.length > 0 ? "Refresh Connections" : "Load Connections"
                      )}
                    </Button>
                  </Stack>
                  
                  {!isLoadingConnections && availableConnections.length === 0 && (
                    <Text style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                      No connections available. Please create a connection in Fabric first, then click "Load Connections".
                    </Text>
                  )}
                </Stack>
              </Field>
            )}
          </>
        )}
      </Stack>
      
      {/* Configure Button */}
      {canConfigure && (
        <Stack.Item style={{ marginTop: '24px' }}>
          <Button 
            appearance="primary" 
            onClick={saveItem}
          >
            Configure Unity Catalog
          </Button>
        </Stack.Item>
      )}
    </Stack>
  );
};
