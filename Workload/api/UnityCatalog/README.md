# Unity Catalog API CORS Solution

This folder contains the API wrapper that solves the CORS issue when making calls to Databricks Unity Catalog API from the frontend.

## Problem

When making direct API calls from the browser to Databricks Unity Catalog API, CORS (Cross-Origin Resource Sharing) policy blocks the requests because:
1. The API calls are cross-origin (different domain)
2. Databricks doesn't set the necessary CORS headers for browser requests

## Solution

We've implemented a proxy pattern with these components:

### Backend Components

1. **`index.ts`** - Main proxy service that handles Unity Catalog API calls server-side
2. **`routes.ts`** - Express route definitions for the proxy endpoints
3. **`client.ts`** - Frontend client that calls the proxy instead of Databricks directly

### API Endpoints

The proxy exposes these endpoints under `/api/unity-catalog/`:

- `POST /test-connection` - Test Unity Catalog connectivity
- `POST /catalogs` - List available catalogs
- `POST /schemas` - List schemas in a catalog
- `POST /tables` - List tables in a schema
- `POST /external-tables` - Get external tables for shortcut creation

### Usage

The frontend components now use `UnityCatalogProxyClient` instead of `UnityCatalogAPIClient`:

```typescript
import { UnityCatalogProxyClient } from "../../../api/UnityCatalog/client";

const apiClient = new UnityCatalogProxyClient(config);
const catalogs = await apiClient.listCatalogs();
```

### Request Flow

1. Frontend makes request to proxy endpoint
2. Proxy server receives request with Databricks credentials
3. Proxy server makes actual API call to Databricks Unity Catalog
4. Proxy server returns response to frontend

This eliminates CORS issues since:
- Frontend → Proxy: Same-origin request (no CORS)
- Proxy → Databricks: Server-to-server request (no CORS restrictions)

### Integration

The proxy routes are automatically registered in the development server via `devServer/index.js`. The routes are mounted at `/api/unity-catalog/` and are available during development.

## Benefits

- ✅ Solves CORS issues completely
- ✅ Maintains the same API interface
- ✅ Works seamlessly with existing Unity Catalog integration
- ✅ Secure (credentials handled server-side)
- ✅ No changes needed to business logic
