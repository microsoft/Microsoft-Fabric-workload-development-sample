import { Package, DeploymentType, DeploymentLocation } from '../PackageInstallerItemModel';

export type ConfiguredPackages = {
  [key: string]: Package;
};

// Helper function to convert config JSON to Package interface
function convertConfigToPackage(config: any): Package {
  const deploymentConfig = config.deploymentConfig || {};
  // Convert string deployment type to enum
  let deploymentType: DeploymentType;
  if (typeof deploymentConfig.type === 'string') {
    switch (deploymentConfig.type) {
      case "UX":
        deploymentType = DeploymentType.UX;
        break;
      case "SparkLivy":
        deploymentType = DeploymentType.SparkLivy;
        break;
      case "SparkNotebook":
        deploymentType = DeploymentType.SparkNotebook;
        break;
      default:
        throw new Error(`Unsupported deployment type: ${deploymentConfig.type}`);
    }
  } else {
    deploymentType = deploymentConfig.type || DeploymentType.UX; // Default to UX if not specified
  }

  // Convert string location type to enum  
  let locationType: DeploymentLocation;
  if (typeof deploymentConfig.location === 'string') {
  switch (deploymentConfig.location) {
      case "ExistingWorkspace":
        locationType = DeploymentLocation.ExistingWorkspace;
        break;
      case "NewFolder":
        locationType = DeploymentLocation.NewFolder;
        break;
      case "NewWorkspace":
        locationType = DeploymentLocation.NewWorkspace;
        break;
      default:
        throw new Error(`Unsupported location type: ${deploymentConfig.location}`);
    }
  } else {
    locationType = deploymentConfig.location || DeploymentLocation.NewWorkspace; // Default to NewWorkspace if not specified
  }

  return {
    id: config.id,
    deploymentConfig: {
      ...config.deploymentConfig,
      type: deploymentType,
      location: locationType,
      suffixItemNames: config.deploymentConfig.suffixItemNames || false,
    },
    displayName: config.displayName,
    description: config.description,
    icon: config.icon,
    items: config.items || []
  };
}

// Package Registry Class for dynamic package management
export class PackageRegistry {
  private packages: ConfiguredPackages = {};
  private initialized = false;

  // Load packages from asset config files
  async loadFromAssets(): Promise<void> {
    if (this.initialized) return;

    try {
      // Import config files from assets - adjust paths as needed
      const configModules: (() => Promise<any>)[] = [
        // Add your config file imports here
        () => import('../../../../assets/samples/items/PackageInstallerItem/Planning/package.json'),
        () => import('../../../../assets/samples/items/PackageInstallerItem/Sales/package.json'),
        () => import('../../../../assets/samples/items/PackageInstallerItem/UnifiedAdminMonitoring/package.json'),
        () => import('../../../../assets/samples/items/PackageInstallerItem/WorkspaceMonitoringDashboards/package.json'),
      ];

      // Load all config files
      const configs = await Promise.all(
        configModules.map(async (importFn: () => Promise<any>) => {
          try {
            const module = await importFn();
            return module.default || module;
          } catch (error) {
            console.warn('Failed to load package config:', error);
            return null;
          }
        })
      );

      // Convert and register packages
      configs
        .filter(config => config !== null)
        .forEach(config => {
          try {
            const packageObj = convertConfigToPackage(config);
            this.packages[packageObj.id] = packageObj;
          } catch (error) {
            console.error('Failed to convert package config:', error);
          }
        });

      this.initialized = true;
      console.log(`Loaded ${Object.keys(this.packages).length} packages from assets`);
    } catch (error) {
      console.error('Failed to load packages from assets:', error);
      this.initialized = true; // Mark as initialized even on failure to prevent retries
    }
  }

  // Add a package dynamically
  addPackage(packageConfig: Package | any): void {
    try {
      const packageObj = typeof packageConfig.id === 'string' 
        ? packageConfig as Package 
        : convertConfigToPackage(packageConfig);
      
      this.packages[packageObj.id] = packageObj;
      console.log(`Added package: ${packageObj.id}`);
    } catch (error) {
      console.error('Failed to add package:', error);
      throw error;
    }
  }

  // Download and add package from URL
  async addPackageFromUrl(url: string): Promise<void> {
    try {
      console.log(`Downloading package config from: ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON format');
      }
      
      const packageConfig = await response.json();
      
      // Validate that the downloaded content has required fields
      if (!packageConfig.id || !packageConfig.displayName) {
        throw new Error('Invalid package config: missing required fields (id, displayName)');
      }
      
      // Add the package to the registry
      this.addPackage(packageConfig);
      console.log(`Successfully added package from URL: ${packageConfig.name} (${packageConfig.id})`);
      
    } catch (error) {
      console.error(`Failed to add package from URL ${url}:`, error);
      throw error;
    }
  }

  // Remove a package
  removePackage(id: string): boolean {
    if (this.packages[id]) {
      delete this.packages[id];
      console.log(`Removed package: ${id}`);
      return true;
    }
    return false;
  }

  // Get all packages
  getAllPackages(): ConfiguredPackages {
    return { ...this.packages };
  }

  // Get packages as array
  getPackagesArray(): Package[] {
    return Object.values(this.packages);
  }

  // Get specific package
  getPackage(id: string): Package | undefined {
    return this.packages[id];
  }

  // Check if package exists
  hasPackage(id: string): boolean {
    return id in this.packages;
  }

  // Clear all packages
  clear(): void {
    this.packages = {};
    this.initialized = false;
  }
}

// Create global registry instance
const packageRegistry = new PackageRegistry();

// Initialize packages from assets (call this during app startup)
export async function initializePackages(): Promise<void> {
  await packageRegistry.loadFromAssets();
}

// Utility function to load packages from a specific directory
export async function loadPackagesFromDirectory(packageConfigs: any[]): Promise<void> {
  packageConfigs.forEach(config => {
    try {
      packageRegistry.addPackage(config);
    } catch (error) {
      console.error('Failed to load package config:', error);
    }
  });
}

// Utility function to load packages from multiple URLs
export async function loadPackagesFromUrls(urls: string[]): Promise<void> {
  const results = await Promise.allSettled(
    urls.map(url => packageRegistry.addPackageFromUrl(url))
  );
  
  const successful = results.filter(result => result.status === 'fulfilled').length;
  const failed = results.filter(result => result.status === 'rejected').length;
  
  console.log(`Package loading complete: ${successful} successful, ${failed} failed`);
  
  if (failed > 0) {
    console.warn('Some packages failed to load:', 
      results
        .filter(result => result.status === 'rejected')
        .map((result, index) => ({ url: urls[index], error: result.reason }))
    );
  }
}