# Workload Development Kit (WDK) Knowledge

## Context

The Microsoft Fabric Workload Development Kit (WDK) enables partners and customers to create custom workloads that integrate seamlessly with the Fabric platform. This knowledge applies to developing, deploying, and maintaining custom Fabric workloads.

## Key Concepts

### Workload Architecture
- **Frontend**: React/TypeScript application running in Fabric's web experience
- **Backend**: Optional REST API service hosted separately (Azure, on-premises, or other cloud)
- **Manifest**: XML/JSON configuration defining workload capabilities and integration points
- **Authentication**: Integrated with Entra ID (Azure AD) for seamless user authentication

### Core Components
- **Items**: Custom data types and experiences (e.g., custom reports, datasets, models)
- **Editors**: UI components for creating and editing workload items
- **Viewers**: Read-only views for displaying workload content
- **APIs**: RESTful interfaces for backend integration and data operations

## Implementation Patterns

### Item Development Pattern
Every workload item requires exactly four components:

```typescript
// 1. Model - Data interface and state definition
[ItemName]ItemModel.ts

// 2. Editor - Main editing experience
[ItemName]ItemEditor.tsx

// 3. Empty State - Initial setup and onboarding
[ItemName]ItemEditorEmpty.tsx

// 4. Ribbon - Toolbar and navigation commands
[ItemName]ItemEditorRibbon.tsx
```

### Authentication Integration
```typescript
// Standard pattern for API authentication
import { WorkloadClientAPI } from '@ms-fabric/workload-client';

const workloadClient = new WorkloadClientAPI();
const accessToken = await workloadClient.authentication.acquireAccessToken(scopes);
```

### Manifest Configuration
- **WorkloadManifest.xml**: Defines workload metadata, capabilities, and permissions
- **[ItemName]Item.xml**: Defines individual item types, their properties, and behaviors
- **Product.json**: Frontend metadata including routes, translations, and assets

## Best Practices

### Development Guidelines
1. **Follow Naming Conventions**: Use PascalCase for item names, maintain consistency
2. **Implement Error Handling**: Provide user-friendly error messages and recovery options
3. **Use Fluent UI**: Leverage @fluentui/react-components for consistent visual design
4. **State Management**: Use Redux Toolkit patterns for complex state management
5. **Performance**: Implement lazy loading and code splitting for large applications

### Security Considerations
1. **Minimal Scopes**: Request only necessary OAuth scopes for operations
2. **Input Validation**: Validate all user inputs and API responses
3. **Secure Storage**: Use secure storage for sensitive configuration data
4. **HTTPS Only**: Ensure all backend communications use HTTPS

### Testing Strategies
1. **Unit Tests**: Test individual components and business logic
2. **Integration Tests**: Verify API integrations and authentication flows
3. **E2E Tests**: Test complete user workflows and item lifecycles
4. **Performance Tests**: Validate loading times and responsiveness

## Common Issues

### Authentication Problems
- **Issue**: Token acquisition failures
- **Solution**: Verify Entra app configuration and scope permissions
- **Prevention**: Implement proper error handling and token refresh logic

### Manifest Validation Errors
- **Issue**: Build failures due to invalid XML/JSON
- **Solution**: Use schema validation and consistent naming patterns
- **Prevention**: Regular validation during development process

### Performance Issues
- **Issue**: Slow loading or unresponsive UI
- **Solution**: Implement code splitting, lazy loading, and efficient state management
- **Prevention**: Regular performance profiling and optimization

### Development Environment Issues
- **Issue**: Local development server connection problems
- **Solution**: Verify DevGateway configuration and network connectivity
- **Prevention**: Use provided setup scripts and validate environment configuration

## Development Workflow

### Setup Process
1. Run `scripts/Setup/Setup.ps1` with appropriate parameters
2. Configure environment variables in `.env.*` files
3. Install dependencies: `npm install` in Workload directory
4. Build manifest package: `scripts/Build/BuildManifestPackage.ps1`

### Development Loop
1. Start DevGateway: `scripts/Run/StartDevGateway.ps1`
2. Start DevServer: `scripts/Run/StartDevServer.ps1`
3. Implement changes in `Workload/app/` directory
4. Test in browser at configured development URL
5. Build and validate: `scripts/Build/BuildRelease.ps1`

### Deployment Process
1. Build production release with organization name
2. Create Azure Web App or alternative hosting
3. Deploy using `scripts/Deploy/DeployToAzureWebApp.ps1`
4. Register workload with Fabric tenant
5. Test in production environment

## Integration Points

### Fabric Platform APIs
- **Items API**: CRUD operations for workload items
- **Workspaces API**: Workspace management and permissions
- **OneLake API**: Data storage and access patterns
- **Job Scheduler API**: Background task execution

### Microsoft Services
- **Power BI**: Embedding reports and dashboards
- **Azure Services**: Backend hosting and data services
- **Microsoft 365**: Integration with Office applications
- **Entra ID**: Authentication and user management

## References

- [WDK Documentation](https://learn.microsoft.com/en-us/fabric/workload-development-kit/)
- [Fabric REST APIs](https://learn.microsoft.com/en-us/rest/api/fabric/)
- [React Development Guide](https://reactjs.org/docs/getting-started.html)
- [Fluent UI Components](https://react.fluentui.dev/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/)
