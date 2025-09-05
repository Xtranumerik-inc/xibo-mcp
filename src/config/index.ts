/**
 * Configuration loader for Xibo MCP Server
 * @author Xtranumerik Inc.
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { XiboMCPConfig, GeoZone, RegionPermission } from '../types.js';

// Load environment variables
dotenv.config();

/**
 * Parse JSON string with error handling
 */
function parseJsonConfig<T>(jsonString: string | undefined, defaultValue: T): T {
  if (!jsonString) return defaultValue;
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn(`Failed to parse JSON config: ${error}`);
    return defaultValue;
  }
}

/**
 * Parse comma-separated string into array
 */
function parseCommaSeparated(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

/**
 * Load configuration from environment variables
 */
export function loadConfig(): XiboMCPConfig {
  // Validate required environment variables
  const required = ['XIBO_API_URL', 'XIBO_CLIENT_ID', 'XIBO_CLIENT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}\nPlease copy .env.example to .env and configure it.`);
  }

  // Parse geographic zones
  const geoZones = parseJsonConfig<Record<string, any>>(
    process.env.GEO_ZONES,
    {
      region_1: { name: 'Region 1', cities: ['City A', 'City B', 'City C'] },
      region_2: { name: 'Region 2', cities: ['City D', 'City E', 'City F'] },
      national: { name: 'National', cities: ['all'] }
    }
  );

  // Convert to proper GeoZone format
  const formattedGeoZones: Record<string, GeoZone> = {};
  Object.entries(geoZones).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      formattedGeoZones[key] = {
        name: value.name || key,
        cities: Array.isArray(value.cities) ? value.cities : value,
        tags: value.tags || []
      };
    } else if (Array.isArray(value)) {
      formattedGeoZones[key] = {
        name: key,
        cities: value,
        tags: []
      };
    }
  });

  // Parse region permissions
  const regionPermissions = parseJsonConfig<Record<string, RegionPermission>>(
    process.env.REGION_PERMISSIONS,
    {
      client_a: {
        regions: ['region_1', 'region_3'],
        permissions: ['view', 'edit_content']
      },
      internal: {
        regions: ['all'],
        permissions: ['all']
      }
    }
  );

  // Build configuration object
  const config: XiboMCPConfig = {
    // Xibo API Configuration
    apiUrl: process.env.XIBO_API_URL!,
    clientId: process.env.XIBO_CLIENT_ID!,
    clientSecret: process.env.XIBO_CLIENT_SECRET!,
    grantType: (process.env.XIBO_GRANT_TYPE as 'client_credentials' | 'authorization_code') || 'client_credentials',

    // MCP Server Configuration
    serverName: process.env.MCP_SERVER_NAME || 'xibo-mcp',
    serverVersion: process.env.MCP_SERVER_VERSION || '1.0.0',
    serverPort: parseInt(process.env.MCP_SERVER_PORT || '3000', 10),

    // Company Branding
    companyName: process.env.COMPANY_NAME || 'Xtranumerik Inc.',
    logoPath: process.env.LOGO_PATH || '/assets/logo-xtranumerik.png',

    // Geographic Configuration
    geoZones: formattedGeoZones,
    defaultExcludeCities: parseCommaSeparated(process.env.DEFAULT_EXCLUDE_CITIES),

    // Permissions
    regionPermissions,

    // Tags
    defaultTags: parseCommaSeparated(process.env.DEFAULT_TAGS),

    // Logging
    logLevel: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
    logFile: process.env.LOG_FILE || 'xibo-mcp.log',

    // Cache
    cacheEnabled: process.env.ENABLE_CACHE !== 'false',
    cacheTTL: parseInt(process.env.CACHE_TTL || '300', 10),

    // Rate Limiting
    rateLimitRequests: parseInt(process.env.RATE_LIMIT_REQUESTS || '100', 10),
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60', 10)
  };

  return config;
}

/**
 * Validate configuration
 */
export function validateConfig(config: XiboMCPConfig): boolean {
  const errors: string[] = [];

  // Validate API URL
  try {
    new URL(config.apiUrl);
  } catch {
    errors.push('Invalid XIBO_API_URL format');
  }

  // Validate client credentials
  if (!config.clientId || config.clientId.length < 5) {
    errors.push('XIBO_CLIENT_ID must be at least 5 characters');
  }

  if (!config.clientSecret || config.clientSecret.length < 10) {
    errors.push('XIBO_CLIENT_SECRET must be at least 10 characters');
  }

  // Validate port
  if (config.serverPort && (config.serverPort < 1 || config.serverPort > 65535)) {
    errors.push('MCP_SERVER_PORT must be between 1 and 65535');
  }

  // Check if logo file exists
  if (config.logoPath) {
    const logoFullPath = path.join(process.cwd(), config.logoPath);
    if (!fs.existsSync(logoFullPath)) {
      console.warn(`Logo file not found at ${logoFullPath}`);
    }
  }

  if (errors.length > 0) {
    console.error('Configuration validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    return false;
  }

  return true;
}

/**
 * Get configuration (singleton)
 */
let configInstance: XiboMCPConfig | null = null;

export function getConfig(): XiboMCPConfig {
  if (!configInstance) {
    configInstance = loadConfig();
    
    if (!validateConfig(configInstance)) {
      throw new Error('Invalid configuration. Please check your .env file.');
    }
  }
  return configInstance;
}

/**
 * Export geographic zone helpers
 */
export function getCitiesInZone(zoneName: string): string[] {
  const config = getConfig();
  const zone = config.geoZones?.[zoneName];
  return zone?.cities || [];
}

export function isDisplayInZone(displayCity: string, zoneName: string): boolean {
  const cities = getCitiesInZone(zoneName);
  if (cities.includes('all')) return true;
  return cities.some(city => 
    city.toLowerCase() === displayCity.toLowerCase()
  );
}

export function getPermissionsForClient(clientName: string): RegionPermission | null {
  const config = getConfig();
  return config.regionPermissions?.[clientName] || null;
}

export function canClientAccessRegion(clientName: string, regionName: string): boolean {
  const permissions = getPermissionsForClient(clientName);
  if (!permissions) return false;
  
  if (permissions.regions.includes('all')) return true;
  return permissions.regions.includes(regionName);
}

export default {
  loadConfig,
  validateConfig,
  getConfig,
  getCitiesInZone,
  isDisplayInZone,
  getPermissionsForClient,
  canClientAccessRegion
};