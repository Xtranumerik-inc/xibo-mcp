/**
 * Display management tools for Xibo MCP Server
 * @author Xtranumerik Inc.
 */

import { ToolDefinition, Display } from '../types.js';
import XiboClient from '../xibo-client.js';

/**
 * List all displays with optional filtering
 */
const displayList: ToolDefinition = {
  name: 'display_list',
  description: 'List all displays with optional filtering by tags, city, or status',
  parameters: [
    { name: 'tags', type: 'string', description: 'Filter by tags (comma-separated)', required: false },
    { name: 'city', type: 'string', description: 'Filter by city location', required: false },
    { name: 'licensed', type: 'boolean', description: 'Filter by license status', required: false },
    { name: 'loggedIn', type: 'boolean', description: 'Filter by online status', required: false },
    { name: 'display', type: 'string', description: 'Search by display name', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {};
    if (params.tags) queryParams.tags = params.tags;
    if (params.city) queryParams.address = params.city;
    if (params.licensed !== undefined) queryParams.licensed = params.licensed ? 1 : 0;
    if (params.loggedIn !== undefined) queryParams.loggedIn = params.loggedIn ? 1 : 0;
    if (params.display) queryParams.display = params.display;

    try {
      const response = await client.get<Display[]>('/display', queryParams);
      const displays = response.data;

      if (!displays || displays.length === 0) {
        return 'Aucun écran trouvé avec les critères spécifiés.';
      }

      let result = `📺 **Écrans trouvés: ${displays.length}**\\n\\n`;
      
      displays.forEach((display, index) => {
        const status = display.loggedIn ? '🟢 En ligne' : '🔴 Hors ligne';
        const licensed = display.licensed ? '✅ Licencié' : '❌ Non licencié';
        
        result += `**${index + 1}. ${display.display}**\\n`;
        result += `   ID: ${display.displayId}\\n`;
        result += `   Statut: ${status}\\n`;
        result += `   Licence: ${licensed}\\n`;
        if (display.description) result += `   Description: ${display.description}\\n`;
        if (display.city) result += `   Ville: ${display.city}\\n`;
        if (display.address) result += `   Adresse: ${display.address}\\n`;
        if (display.lastAccessed) result += `   Dernier accès: ${display.lastAccessed}\\n`;
        if (display.tags && display.tags.length > 0) result += `   Tags: ${display.tags.join(', ')}\\n`;
        result += `\\n`;
      });

      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des écrans: ${error.message}`;
    }
  }
};

/**
 * Get detailed information about a specific display
 */
const displayGet: ToolDefinition = {
  name: 'display_get',
  description: 'Get detailed information about a specific display',
  parameters: [
    { name: 'displayId', type: 'number', description: 'The ID of the display', required: true }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const response = await client.get<Display>(`/display/${params.displayId}`);
      const display = response.data;

      const status = display.loggedIn ? '🟢 En ligne' : '🔴 Hors ligne';
      const licensed = display.licensed ? '✅ Licencié' : '❌ Non licencié';
      
      let result = `📺 **Détails de l'écran: ${display.display}**\\n\\n`;
      result += `**Informations générales:**\\n`;
      result += `   ID: ${display.displayId}\\n`;
      result += `   Nom: ${display.display}\\n`;
      result += `   Statut: ${status}\\n`;
      result += `   Licence: ${licensed}\\n`;
      if (display.description) result += `   Description: ${display.description}\\n`;
      
      result += `\\n**Localisation:**\\n`;
      if (display.address) result += `   Adresse: ${display.address}\\n`;
      if (display.city) result += `   Ville: ${display.city}\\n`;
      if (display.country) result += `   Pays: ${display.country}\\n`;
      
      result += `\\n**Informations techniques:**\\n`;
      if (display.clientType) result += `   Type de client: ${display.clientType}\\n`;
      if (display.clientVersion) result += `   Version: ${display.clientVersion}\\n`;
      if (display.clientCode) result += `   Code client: ${display.clientCode}\\n`;
      
      result += `\\n**Layouts:**\\n`;
      result += `   Layout par défaut: ${display.defaultLayoutId}\\n`;
      if (display.currentLayoutId) result += `   Layout actuel: ${display.currentLayoutId}\\n`;
      
      if (display.storageAvailableSpace && display.storageTotalSpace) {
        const usedSpace = display.storageTotalSpace - display.storageAvailableSpace;
        const usedPercent = Math.round((usedSpace / display.storageTotalSpace) * 100);
        result += `\\n**Stockage:**\\n`;
        result += `   Espace total: ${(display.storageTotalSpace / 1024 / 1024).toFixed(2)} MB\\n`;
        result += `   Espace libre: ${(display.storageAvailableSpace / 1024 / 1024).toFixed(2)} MB\\n`;
        result += `   Utilisation: ${usedPercent}%\\n`;
      }
      
      if (display.lastAccessed) result += `\\n**Dernière activité:** ${display.lastAccessed}\\n`;
      
      if (display.tags && display.tags.length > 0) {
        result += `\\n**Tags:** ${display.tags.join(', ')}\\n`;
      }

      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des détails de l'écran: ${error.message}`;
    }
  }
};

/**
 * Authorize or unauthorize a display
 */
const displayAuthorize: ToolDefinition = {
  name: 'display_authorize',
  description: 'Authorize or unauthorize a display',
  parameters: [
    { name: 'displayId', type: 'number', description: 'The ID of the display', required: true },
    { name: 'authorize', type: 'boolean', description: 'True to authorize, false to unauthorize', required: true }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const data = {
        licensed: params.authorize ? 1 : 0
      };
      
      await client.put(`/display/authorise/${params.displayId}`, data);
      
      const action = params.authorize ? 'autorisé' : 'non autorisé';
      return `✅ Écran ${params.displayId} ${action} avec succès.`;
    } catch (error: any) {
      return `Erreur lors de l'autorisation de l'écran: ${error.message}`;
    }
  }
};

/**
 * Request a screenshot from a display
 */
const displayScreenshot: ToolDefinition = {
  name: 'display_screenshot',
  description: 'Request a screenshot from a display',
  parameters: [
    { name: 'displayId', type: 'number', description: 'The ID of the display', required: true }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      await client.put(`/display/requestscreenshot/${params.displayId}`, {});
      
      return `📸 Capture d'écran demandée pour l'écran ${params.displayId}. La capture sera disponible dans quelques instants dans l'interface Xibo.`;
    } catch (error: any) {
      return `Erreur lors de la demande de capture d'écran: ${error.message}`;
    }
  }
};

/**
 * Send Wake-on-LAN packet to a display
 */
const displayWakeOnLan: ToolDefinition = {
  name: 'display_wol',
  description: 'Send Wake-on-LAN packet to wake up a display',
  parameters: [
    { name: 'displayId', type: 'number', description: 'The ID of the display', required: true }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      await client.post(`/display/wol/${params.displayId}`, {});
      
      return `📡 Paquet Wake-on-LAN envoyé à l'écran ${params.displayId}. L'écran devrait s'allumer dans quelques instants.`;
    } catch (error: any) {
      return `Erreur lors de l'envoi du Wake-on-LAN: ${error.message}`;
    }
  }
};

/**
 * Edit display settings
 */
const displayEdit: ToolDefinition = {
  name: 'display_edit',
  description: 'Edit display settings such as name, description, location, and tags',
  parameters: [
    { name: 'displayId', type: 'number', description: 'The ID of the display', required: true },
    { name: 'display', type: 'string', description: 'New display name', required: false },
    { name: 'description', type: 'string', description: 'New description', required: false },
    { name: 'address', type: 'string', description: 'New address', required: false },
    { name: 'city', type: 'string', description: 'New city', required: false },
    { name: 'country', type: 'string', description: 'New country', required: false },
    { name: 'tags', type: 'string', description: 'New tags (comma-separated)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const data: any = {};
      
      if (params.display) data.display = params.display;
      if (params.description) data.description = params.description;
      if (params.address) data.address = params.address;
      if (params.city) data.city = params.city;
      if (params.country) data.country = params.country;
      if (params.tags) data.tags = params.tags;
      
      if (Object.keys(data).length === 0) {
        return 'Aucune modification spécifiée. Veuillez fournir au moins un paramètre à modifier.';
      }
      
      await client.put(`/display/${params.displayId}`, data);
      
      return `✅ Écran ${params.displayId} modifié avec succès.`;
    } catch (error: any) {
      return `Erreur lors de la modification de l'écran: ${error.message}`;
    }
  }
};

/**
 * Get displays by geographic zone
 */
const displaysByZone: ToolDefinition = {
  name: 'displays_by_zone',
  description: 'Get displays filtered by geographic zone (Montreal, Quebec, etc.)',
  parameters: [
    { name: 'zone', type: 'string', description: 'Geographic zone name (montreal_region, quebec_region, national)', required: true },
    { name: 'exclude', type: 'boolean', description: 'If true, exclude displays from this zone instead', required: false, default: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    const config = params._config;
    
    try {
      // Get all displays first
      const response = await client.get<Display[]>('/display');
      const allDisplays = response.data;
      
      if (!allDisplays || allDisplays.length === 0) {
        return 'Aucun écran trouvé.';
      }

      // Get zone configuration
      const zone = config.geoZones?.[params.zone];
      if (!zone) {
        return `Zone géographique "${params.zone}" non trouvée. Zones disponibles: ${Object.keys(config.geoZones || {}).join(', ')}`;
      }

      // Filter displays by zone
      const filteredDisplays = allDisplays.filter(display => {
        if (!display.city) return false;
        
        const isInZone = zone.cities.includes('all') || 
                        zone.cities.some((city: string) => 
                          city.toLowerCase() === display.city!.toLowerCase()
                        );
        
        return params.exclude ? !isInZone : isInZone;
      });

      if (filteredDisplays.length === 0) {
        const action = params.exclude ? 'exclus de' : 'dans';
        return `Aucun écran ${action} la zone "${zone.name}".`;
      }

      const action = params.exclude ? 'exclus de' : 'dans';
      let result = `📺 **Écrans ${action} la zone "${zone.name}": ${filteredDisplays.length}**\\n\\n`;
      
      filteredDisplays.forEach((display, index) => {
        const status = display.loggedIn ? '🟢' : '🔴';
        result += `${status} **${index + 1}. ${display.display}** (ID: ${display.displayId})\\n`;
        if (display.city) result += `   Ville: ${display.city}\\n`;
        if (display.address) result += `   Adresse: ${display.address}\\n`;
        result += `\\n`;
      });

      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des écrans par zone: ${error.message}`;
    }
  }
};

export const displayTools: ToolDefinition[] = [
  displayList,
  displayGet,
  displayAuthorize,
  displayScreenshot,
  displayWakeOnLan,
  displayEdit,
  displaysByZone
];