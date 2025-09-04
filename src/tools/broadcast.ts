/**
 * Intelligent broadcasting tools for Xibo MCP Server
 * Core functionality: "Mets cette pub dans tous mes écrans sauf ceux à Québec"
 * @author Xtranumerik Inc.
 */

import { ToolDefinition, Display, BroadcastConfig } from '../types.js';
import XiboClient from '../xibo-client.js';

const broadcastAd: ToolDefinition = {
  name: 'broadcast_ad',
  description: 'Intelligently broadcast content to displays with geographic and criteria filtering. Perfect for "Mets cette pub dans tous mes écrans sauf ceux à Québec"',
  parameters: [
    { name: 'mediaId', type: 'number', description: 'Media ID to broadcast', required: true },
    { name: 'includeTags', type: 'string', description: 'Include displays with these tags (comma-separated)', required: false },
    { name: 'excludeTags', type: 'string', description: 'Exclude displays with these tags (comma-separated)', required: false },
    { name: 'includeCities', type: 'string', description: 'Include displays in these cities (comma-separated)', required: false },
    { name: 'excludeCities', type: 'string', description: 'Exclude displays in these cities (comma-separated)', required: false },
    { name: 'includeZones', type: 'string', description: 'Include geographic zones (montreal_region, quebec_region, national)', required: false },
    { name: 'excludeZones', type: 'string', description: 'Exclude geographic zones', required: false },
    { name: 'displayIds', type: 'string', description: 'Specific display IDs (comma-separated)', required: false },
    { name: 'priority', type: 'string', description: 'Broadcast priority', required: false, default: 'normal', enum: ['low', 'normal', 'high', 'urgent'] },
    { name: 'duration', type: 'number', description: 'Duration in seconds (optional)', required: false },
    { name: 'layoutId', type: 'number', description: 'Target layout ID (if not specified, creates new campaign)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    const config = params._config;
    
    try {
      // Step 1: Get all displays
      const displayResponse = await client.get<Display[]>('/display');
      const allDisplays = displayResponse.data;
      
      if (!allDisplays || allDisplays.length === 0) {
        return 'Aucun écran disponible pour la diffusion.';
      }

      // Step 2: Apply intelligent filtering
      let targetDisplays = allDisplays.filter(display => display.licensed && display.loggedIn);
      
      // Filter by specific display IDs
      if (params.displayIds) {
        const ids = params.displayIds.split(',').map((id: string) => parseInt(id.trim()));
        targetDisplays = targetDisplays.filter(display => ids.includes(display.displayId));
      } else {
        // Apply tag filters
        if (params.includeTags) {
          const includeTags = params.includeTags.split(',').map((tag: string) => tag.trim().toLowerCase());
          targetDisplays = targetDisplays.filter(display => 
            display.tags && display.tags.some(tag => 
              includeTags.includes(tag.toLowerCase())
            )
          );
        }
        
        if (params.excludeTags) {
          const excludeTags = params.excludeTags.split(',').map((tag: string) => tag.trim().toLowerCase());
          targetDisplays = targetDisplays.filter(display => 
            !display.tags || !display.tags.some(tag => 
              excludeTags.includes(tag.toLowerCase())
            )
          );
        }
        
        // Apply city filters
        if (params.includeCities) {
          const includeCities = params.includeCities.split(',').map((city: string) => city.trim().toLowerCase());
          targetDisplays = targetDisplays.filter(display => 
            display.city && includeCities.includes(display.city.toLowerCase())
          );
        }
        
        if (params.excludeCities) {
          const excludeCities = params.excludeCities.split(',').map((city: string) => city.trim().toLowerCase());
          targetDisplays = targetDisplays.filter(display => 
            !display.city || !excludeCities.includes(display.city.toLowerCase())
          );
        }
        
        // Apply zone filters
        if (params.includeZones) {
          const includeZones = params.includeZones.split(',').map((zone: string) => zone.trim());
          targetDisplays = targetDisplays.filter(display => {
            if (!display.city) return false;
            return includeZones.some(zoneName => {
              const zone = config.geoZones?.[zoneName];
              if (!zone) return false;
              return zone.cities.includes('all') || 
                     zone.cities.some((city: string) => city.toLowerCase() === display.city!.toLowerCase());
            });
          });
        }
        
        if (params.excludeZones) {
          const excludeZones = params.excludeZones.split(',').map((zone: string) => zone.trim());
          targetDisplays = targetDisplays.filter(display => {
            if (!display.city) return true;
            return !excludeZones.some(zoneName => {
              const zone = config.geoZones?.[zoneName];
              if (!zone) return false;
              return zone.cities.includes('all') || 
                     zone.cities.some((city: string) => city.toLowerCase() === display.city!.toLowerCase());
            });
          });
        }
      }
      
      if (targetDisplays.length === 0) {
        return 'Aucun écran ne correspond aux critères de filtrage spécifiés.';
      }
      
      // Step 3: Create or use layout
      let layoutId = params.layoutId;
      if (!layoutId) {
        // Create a simple layout with the media
        const layoutResponse = await client.post('/layout', {
          layout: `Broadcast_${Date.now()}`,
          width: 1920,
          height: 1080
        });
        layoutId = layoutResponse.data.layoutId;
      }
      
      // Step 4: Create campaign
      const campaignResponse = await client.post('/campaign', {
        campaign: `Broadcast_Campaign_${Date.now()}`
      });
      const campaignId = campaignResponse.data.campaignId;
      
      // Step 5: Assign layout to campaign
      await client.post(`/campaign/layout/assign/${campaignId}`, {
        layoutId: layoutId,
        displayOrder: 1
      });
      
      // Step 6: Schedule to target displays
      const scheduledDisplays: string[] = [];
      const errors: string[] = [];
      
      for (const display of targetDisplays) {
        try {
          const scheduleData = {
            eventTypeId: 1, // Layout event
            campaignId: campaignId,
            displayGroupId: display.displayGroupId,
            fromDt: new Date().toISOString(),
            toDt: new Date(Date.now() + (params.duration || 3600) * 1000).toISOString(), // 1 hour default
            isPriority: params.priority === 'high' || params.priority === 'urgent' ? 1 : 0,
            displayOrder: params.priority === 'urgent' ? 1 : 10
          };
          
          await client.post('/schedule', scheduleData);
          scheduledDisplays.push(`${display.display} (${display.city || 'N/A'})`);
        } catch (error: any) {
          errors.push(`${display.display}: ${error.message}`);
        }
      }
      
      // Step 7: Generate summary report
      let result = `🚀 **Diffusion intelligente terminée!**\\n\\n`;
      result += `📊 **Résumé:**\\n`;
      result += `   Média: ${params.mediaId}\\n`;
      result += `   Campagne: ${campaignId}\\n`;
      result += `   Layout: ${layoutId}\\n`;
      result += `   Priorité: ${params.priority || 'normal'}\\n\\n`;
      
      result += `✅ **Écrans ciblés avec succès (${scheduledDisplays.length}):**\\n`;
      scheduledDisplays.forEach((display, index) => {
        result += `   ${index + 1}. ${display}\\n`;
      });
      
      if (errors.length > 0) {
        result += `\\n❌ **Erreurs (${errors.length}):**\\n`;
        errors.forEach((error, index) => {
          result += `   ${index + 1}. ${error}\\n`;
        });
      }
      
      // Add filtering summary
      result += `\\n🎯 **Filtres appliqués:**\\n`;
      if (params.includeTags) result += `   ✅ Tags inclus: ${params.includeTags}\\n`;
      if (params.excludeTags) result += `   ❌ Tags exclus: ${params.excludeTags}\\n`;
      if (params.includeCities) result += `   ✅ Villes incluses: ${params.includeCities}\\n`;
      if (params.excludeCities) result += `   ❌ Villes exclues: ${params.excludeCities}\\n`;
      if (params.includeZones) result += `   ✅ Zones incluses: ${params.includeZones}\\n`;
      if (params.excludeZones) result += `   ❌ Zones exclues: ${params.excludeZones}\\n`;
      
      return result;
      
    } catch (error: any) {
      return `Erreur lors de la diffusion intelligente: ${error.message}`;
    }
  }
};

const broadcastToZone: ToolDefinition = {
  name: 'broadcast_to_zone',
  description: 'Broadcast content to a specific geographic zone',
  parameters: [
    { name: 'mediaId', type: 'number', description: 'Media ID to broadcast', required: true },
    { name: 'zone', type: 'string', description: 'Geographic zone (montreal_region, quebec_region, national)', required: true },
    { name: 'exclude', type: 'boolean', description: 'Exclude this zone instead of including it', required: false, default: false },
    { name: 'priority', type: 'string', description: 'Broadcast priority', required: false, default: 'normal', enum: ['low', 'normal', 'high', 'urgent'] }
  ],
  handler: async (params: any) => {
    // This tool is a shortcut for broadcast_ad with zone filtering
    const broadcastParams = {
      ...params,
      _xiboClient: params._xiboClient,
      _config: params._config
    };
    
    if (params.exclude) {
      broadcastParams.excludeZones = params.zone;
    } else {
      broadcastParams.includeZones = params.zone;
    }
    
    delete broadcastParams.zone;
    delete broadcastParams.exclude;
    
    return await broadcastAd.handler(broadcastParams);
  }
};

const broadcastUrgent: ToolDefinition = {
  name: 'broadcast_urgent',
  description: 'Broadcast urgent content to all displays immediately',
  parameters: [
    { name: 'mediaId', type: 'number', description: 'Media ID to broadcast', required: true },
    { name: 'message', type: 'string', description: 'Description of the urgent message', required: false }
  ],
  handler: async (params: any) => {
    const broadcastParams = {
      ...params,
      _xiboClient: params._xiboClient,
      _config: params._config,
      priority: 'urgent',
      duration: 300 // 5 minutes for urgent messages
    };
    
    const result = await broadcastAd.handler(broadcastParams);
    
    return `🚨 **MESSAGE URGENT DIFFUSÉ!**\\n\\n${result}`;
  }
};

export const broadcastTools: ToolDefinition[] = [
  broadcastAd,
  broadcastToZone,
  broadcastUrgent
];