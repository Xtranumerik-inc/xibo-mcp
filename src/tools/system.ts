/**
 * System configuration tools for Xibo MCP Server
 * Commands, tags, dayparts and system management
 * @author Xtranumerik Inc.
 */

import { ToolDefinition } from '../types.js';
import XiboClient from '../xibo-client.js';

// ========== COMMAND MANAGEMENT TOOLS ==========

const commandList: ToolDefinition = {
  name: 'command_list',
  description: 'List all system commands available in Xibo',
  parameters: [
    { name: 'command', type: 'string', description: 'Filter by command name', required: false },
    { name: 'start', type: 'number', description: 'Starting position for pagination', required: false },
    { name: 'length', type: 'number', description: 'Number of results to return', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {
      start: params.start || 0,
      length: params.length || 50
    };
    
    if (params.command) queryParams.command = params.command;

    try {
      const response = await client.get('/command', queryParams);
      const commands = response.data.data || [];
      const total = response.data.recordsTotal || 0;

      if (commands.length === 0) {
        return 'Aucune commande trouvée.';
      }

      let result = `⚙️ **Commandes système: ${commands.length}/${total}**\n\n`;
      
      // Group by command type
      const commandTypes: any = {};
      commands.forEach((cmd: any) => {
        const type = cmd.type || 'custom';
        if (!commandTypes[type]) commandTypes[type] = [];
        commandTypes[type].push(cmd);
      });
      
      Object.entries(commandTypes).forEach(([type, typeCmds]: [string, any]) => {
        const typeEmojis: any = {
          'android': '📱',
          'windows': '🪟',
          'webos': '📺',
          'custom': '🔧',
          'rs232': '📡'
        };
        
        const emoji = typeEmojis[type] || '⚙️';
        result += `${emoji} **${type.toUpperCase()}: ${typeCmds.length}**\n`;
        
        typeCmds.forEach((command: any, index: number) => {
          result += `   ${index + 1}. **${command.command}**\n`;
          result += `      📝 Description: ${command.description || 'N/A'}\n`;
          result += `      🔧 Code: \`${command.code || 'N/A'}\`\n`;
          
          if (command.validationString) {
            result += `      ✅ Validation: ${command.validationString}\n`;
          }
          
          result += '\n';
        });
        
        result += '\n';
      });

      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des commandes: ${error.message}`;
    }
  }
};

const commandCreate: ToolDefinition = {
  name: 'command_create',
  description: 'Create a new custom system command',
  parameters: [
    { name: 'command', type: 'string', description: 'Command name', required: true },
    { name: 'description', type: 'string', description: 'Command description', required: true },
    { name: 'code', type: 'string', description: 'Command code to execute', required: true },
    { name: 'type', type: 'string', description: 'Command type: android, windows, webos, rs232', required: false },
    { name: 'validationString', type: 'string', description: 'Expected validation response', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const commandData = {
        command: params.command,
        description: params.description,
        code: params.code,
        type: params.type || 'custom',
        validationString: params.validationString || ''
      };
      
      const response = await client.post('/command', commandData);
      const newCommand = response.data;
      
      let result = `✅ **Commande créée avec succès**\n\n`;
      result += `⚙️ **Détails:**\n`;
      result += `   Nom: ${params.command}\n`;
      result += `   Description: ${params.description}\n`;
      result += `   Type: ${params.type || 'custom'}\n`;
      result += `   ID: ${newCommand.commandId || 'N/A'}\n`;
      result += `   Code: \`${params.code}\`\n`;
      
      if (params.validationString) {
        result += `   Validation: ${params.validationString}\n`;
      }
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la création de la commande: ${error.message}`;
    }
  }
};

const commandExecute: ToolDefinition = {
  name: 'command_execute',
  description: 'Execute a system command on specified displays',
  parameters: [
    { name: 'commandId', type: 'number', description: 'Command ID to execute', required: true },
    { name: 'displayId', type: 'number', description: 'Display ID to execute on', required: false },
    { name: 'displayGroupId', type: 'number', description: 'Display group ID to execute on', required: false },
    { name: 'scheduleNow', type: 'number', description: 'Execute immediately (1=yes, 0=schedule)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      // Get command details
      const commandResponse = await client.get(`/command/${params.commandId}`);
      const command = commandResponse.data;
      
      // Prepare execution data
      const executionData: any = {
        commandId: params.commandId
      };
      
      if (params.displayId) {
        executionData.displayId = params.displayId;
      } else if (params.displayGroupId) {
        executionData.displayGroupId = params.displayGroupId;
      } else {
        return '❌ Vous devez spécifier soit displayId soit displayGroupId';
      }
      
      // Execute command
      const endpoint = params.scheduleNow === 1 ? '/command/execute' : '/command/schedule';
      const response = await client.post(endpoint, executionData);
      
      let result = `🚀 **Commande ${params.scheduleNow === 1 ? 'exécutée' : 'programmée'}**\n\n`;
      result += `⚙️ **Détails de la commande:**\n`;
      result += `   Nom: ${command.command}\n`;
      result += `   Description: ${command.description}\n`;
      result += `   Type: ${command.type}\n`;
      
      result += `\n🎯 **Cible:**\n`;
      result += `   ${params.displayId ? `Écran: ${params.displayId}` : `Groupe: ${params.displayGroupId}`}\n`;
      result += `   Exécution: ${params.scheduleNow === 1 ? 'Immédiate' : 'Programmée'}\n`;
      
      if (response.data.success) {
        result += `\n✅ **Résultat:** Succès`;
      } else {
        result += `\n⚠️ **Résultat:** ${response.data.message || 'Status inconnu'}`;
      }
      
      return result;
    } catch (error: any) {
      return `Erreur lors de l'exécution de la commande: ${error.message}`;
    }
  }
};

// ========== TAG MANAGEMENT TOOLS ==========

const tagList: ToolDefinition = {
  name: 'tag_list',
  description: 'List all tags with usage statistics',
  parameters: [
    { name: 'tag', type: 'string', description: 'Filter by tag name', required: false },
    { name: 'start', type: 'number', description: 'Starting position', required: false },
    { name: 'length', type: 'number', description: 'Number of results', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {
      start: params.start || 0,
      length: params.length || 100
    };
    
    if (params.tag) queryParams.tag = params.tag;

    try {
      const response = await client.get('/tag', queryParams);
      const tags = response.data.data || [];
      const total = response.data.recordsTotal || 0;

      if (tags.length === 0) {
        return 'Aucun tag trouvé.';
      }

      let result = `🏷️ **Tags: ${tags.length}/${total}**\n\n`;
      
      // Sort by usage count
      const sortedTags = tags.sort((a: any, b: any) => (b.cnt || 0) - (a.cnt || 0));
      
      // Most used tags
      const topTags = sortedTags.slice(0, 10);
      result += `📊 **Top 10 tags les plus utilisés:**\n`;
      topTags.forEach((tag: any, index: number) => {
        const usage = tag.cnt || 0;
        result += `   ${index + 1}. **${tag.tag}** (${usage} utilisations)\n`;
      });
      
      result += `\n🔤 **Tous les tags:**\n`;
      sortedTags.forEach((tag: any, index: number) => {
        const usage = tag.cnt || 0;
        result += `${index + 1}. ${tag.tag} (${usage})\n`;
      });

      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des tags: ${error.message}`;
    }
  }
};

const tagCreate: ToolDefinition = {
  name: 'tag_create',
  description: 'Create new tags for organization',
  parameters: [
    { name: 'tags', type: 'string', description: 'Comma-separated list of tags to create', required: true },
    { name: 'description', type: 'string', description: 'Description of tag usage', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const tagList = params.tags.split(',').map((tag: string) => tag.trim());
      const results: any[] = [];
      
      // Create each tag
      for (const tagName of tagList) {
        if (!tagName) continue;
        
        try {
          const tagData = {
            tag: tagName,
            description: params.description || `Tag créé automatiquement: ${tagName}`
          };
          
          const response = await client.post('/tag', tagData);
          results.push({ tag: tagName, success: true, data: response.data });
        } catch (error: any) {
          results.push({ tag: tagName, success: false, error: error.message });
        }
      }
      
      let result = `🏷️ **Création de tags**\n\n`;
      
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      result += `📊 **Résumé:**\n`;
      result += `   ✅ Créés: ${successful.length}\n`;
      result += `   ❌ Échecs: ${failed.length}\n\n`;
      
      if (successful.length > 0) {
        result += `✅ **Tags créés avec succès:**\n`;
        successful.forEach((item: any, index: number) => {
          result += `   ${index + 1}. ${item.tag}\n`;
        });
        result += '\n';
      }
      
      if (failed.length > 0) {
        result += `❌ **Échecs:**\n`;
        failed.forEach((item: any, index: number) => {
          result += `   ${index + 1}. ${item.tag}: ${item.error}\n`;
        });
      }
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la création des tags: ${error.message}`;
    }
  }
};

const tagBulkAssign: ToolDefinition = {
  name: 'tag_bulk_assign',
  description: 'Bulk assign tags to multiple items (layouts, media, displays)',
  parameters: [
    { name: 'itemType', type: 'string', description: 'Type: layout, media, display, campaign', required: true },
    { name: 'itemIds', type: 'string', description: 'Comma-separated item IDs', required: true },
    { name: 'tags', type: 'string', description: 'Comma-separated tags to assign', required: true },
    { name: 'replaceExisting', type: 'number', description: 'Replace existing tags (1=yes, 0=append)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const itemIds = params.itemIds.split(',').map((id: string) => parseInt(id.trim()));
      const tagList = params.tags.split(',').map((tag: string) => tag.trim());
      const replaceExisting = params.replaceExisting === 1;
      
      const results: any[] = [];
      
      for (const itemId of itemIds) {
        if (isNaN(itemId)) continue;
        
        try {
          let endpoint = '';
          let dataField = '';
          
          switch (params.itemType.toLowerCase()) {
            case 'layout':
              endpoint = `/layout/${itemId}`;
              dataField = 'layoutId';
              break;
            case 'media':
              endpoint = `/library/${itemId}`;
              dataField = 'mediaId';
              break;
            case 'display':
              endpoint = `/display/${itemId}`;
              dataField = 'displayId';
              break;
            case 'campaign':
              endpoint = `/campaign/${itemId}`;
              dataField = 'campaignId';
              break;
            default:
              throw new Error(`Type d'item non supporté: ${params.itemType}`);
          }
          
          // Get current item data
          const currentResponse = await client.get(endpoint);
          const currentItem = currentResponse.data;
          
          let finalTags = tagList;
          
          // Append to existing tags if not replacing
          if (!replaceExisting && currentItem.tags) {
            const existingTags = currentItem.tags.split(',').map((t: string) => t.trim());
            finalTags = [...new Set([...existingTags, ...tagList])]; // Remove duplicates
          }
          
          // Update item with new tags
          const updateData: any = {
            [dataField]: itemId,
            tags: finalTags.join(',')
          };
          
          await client.put(endpoint, updateData);
          results.push({ 
            itemId, 
            success: true, 
            finalTags: finalTags.join(','),
            name: currentItem.name || currentItem.display || `Item ${itemId}`
          });
          
        } catch (error: any) {
          results.push({ itemId, success: false, error: error.message });
        }
      }
      
      let result = `🏷️ **Attribution en masse de tags**\n\n`;
      result += `📋 **Configuration:**\n`;
      result += `   Type: ${params.itemType}\n`;
      result += `   Tags: ${params.tags}\n`;
      result += `   Mode: ${replaceExisting ? 'Remplacer' : 'Ajouter'}\n\n`;
      
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      result += `📊 **Résumé:**\n`;
      result += `   ✅ Succès: ${successful.length}\n`;
      result += `   ❌ Échecs: ${failed.length}\n\n`;
      
      if (successful.length > 0) {
        result += `✅ **Items mis à jour:**\n`;
        successful.forEach((item: any, index: number) => {
          result += `   ${index + 1}. ${item.name} (${item.itemId})\n`;
          result += `      🏷️  Tags: ${item.finalTags}\n`;
        });
        result += '\n';
      }
      
      if (failed.length > 0) {
        result += `❌ **Échecs:**\n`;
        failed.forEach((item: any, index: number) => {
          result += `   ${index + 1}. Item ${item.itemId}: ${item.error}\n`;
        });
      }
      
      return result;
    } catch (error: any) {
      return `Erreur lors de l'attribution en masse: ${error.message}`;
    }
  }
};

// ========== DAYPART MANAGEMENT TOOLS ==========

const daypartList: ToolDefinition = {
  name: 'daypart_list',
  description: 'List all dayparts (time periods) configured in Xibo',
  parameters: [
    { name: 'dayPart', type: 'string', description: 'Filter by daypart name', required: false },
    { name: 'start', type: 'number', description: 'Starting position', required: false },
    { name: 'length', type: 'number', description: 'Number of results', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {
      start: params.start || 0,
      length: params.length || 50
    };
    
    if (params.dayPart) queryParams.dayPart = params.dayPart;

    try {
      const response = await client.get('/daypart', queryParams);
      const dayparts = response.data.data || [];
      const total = response.data.recordsTotal || 0;

      if (dayparts.length === 0) {
        return 'Aucune période (daypart) trouvée.';
      }

      let result = `⏰ **Périodes (Dayparts): ${dayparts.length}/${total}**\n\n`;
      
      dayparts.forEach((daypart: any, index: number) => {
        result += `**${index + 1}. ${daypart.name}**\n`;
        result += `   📝 Description: ${daypart.description || 'N/A'}\n`;
        result += `   🕐 Heure de début: ${daypart.startTime || 'N/A'}\n`;
        result += `   🕕 Heure de fin: ${daypart.endTime || 'N/A'}\n`;
        result += `   📅 Exceptions: ${daypart.exceptions || 'Aucune'}\n`;
        
        if (daypart.userId) {
          result += `   👤 Créé par: User ID ${daypart.userId}\n`;
        }
        
        result += '\n';
      });

      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des périodes: ${error.message}`;
    }
  }
};

const daypartCreate: ToolDefinition = {
  name: 'daypart_create',
  description: 'Create a new daypart (time period) for scheduling',
  parameters: [
    { name: 'name', type: 'string', description: 'Daypart name', required: true },
    { name: 'description', type: 'string', description: 'Daypart description', required: false },
    { name: 'startTime', type: 'string', description: 'Start time (HH:MM format)', required: true },
    { name: 'endTime', type: 'string', description: 'End time (HH:MM format)', required: true },
    { name: 'exceptions', type: 'string', description: 'Comma-separated exception dates (YYYY-MM-DD)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      // Validate time format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(params.startTime)) {
        return '❌ Format d\'heure de début invalide. Utilisez HH:MM (ex: 09:00)';
      }
      if (!timeRegex.test(params.endTime)) {
        return '❌ Format d\'heure de fin invalide. Utilisez HH:MM (ex: 17:00)';
      }
      
      const daypartData = {
        name: params.name,
        description: params.description || `Période créée: ${params.startTime} - ${params.endTime}`,
        startTime: params.startTime,
        endTime: params.endTime,
        exceptions: params.exceptions || ''
      };
      
      const response = await client.post('/daypart', daypartData);
      const newDaypart = response.data;
      
      let result = `⏰ **Période créée avec succès**\n\n`;
      result += `📋 **Détails:**\n`;
      result += `   Nom: ${params.name}\n`;
      result += `   Description: ${params.description || 'N/A'}\n`;
      result += `   Heure de début: ${params.startTime}\n`;
      result += `   Heure de fin: ${params.endTime}\n`;
      result += `   ID: ${newDaypart.dayPartId || 'N/A'}\n`;
      
      if (params.exceptions) {
        result += `   Exceptions: ${params.exceptions}\n`;
      }
      
      result += `\n💡 **Cette période peut maintenant être utilisée pour:**\n`;
      result += `   - Programmer des campagnes automatiquement\n`;
      result += `   - Définir des heures d'ouverture/fermeture\n`;
      result += `   - Créer des horaires récurrents\n`;
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la création de la période: ${error.message}`;
    }
  }
};

const daypartAssign: ToolDefinition = {
  name: 'daypart_assign',
  description: 'Assign daypart to schedules or campaigns',
  parameters: [
    { name: 'dayPartId', type: 'number', description: 'Daypart ID to assign', required: true },
    { name: 'campaignId', type: 'number', description: 'Campaign ID to schedule', required: false },
    { name: 'layoutId', type: 'number', description: 'Layout ID to schedule', required: false },
    { name: 'displayGroupId', type: 'number', description: 'Display group to target', required: true },
    { name: 'startDate', type: 'string', description: 'Start date (YYYY-MM-DD)', required: true },
    { name: 'endDate', type: 'string', description: 'End date (YYYY-MM-DD)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      if (!params.campaignId && !params.layoutId) {
        return '❌ Vous devez spécifier soit campaignId soit layoutId';
      }
      
      // Get daypart details
      const daypartResponse = await client.get(`/daypart/${params.dayPartId}`);
      const daypart = daypartResponse.data;
      
      // Prepare schedule data
      const scheduleData: any = {
        displayOrder: 1,
        isPriority: 0,
        syncTimezone: 1,
        fromDt: `${params.startDate} ${daypart.startTime}:00`,
        toDt: params.endDate ? `${params.endDate} ${daypart.endTime}:00` : null,
        displayGroupIds: [params.displayGroupId],
        dayPartId: params.dayPartId,
        recurrenceType: 'Day', // Daily recurrence with daypart
        recurrenceDetail: null
      };
      
      if (params.campaignId) {
        scheduleData.campaignId = params.campaignId;
      } else {
        // Create temporary campaign for layout
        const tempCampaignData = {
          campaign: `DAYPART_${params.layoutId}_${Date.now()}`,
          description: `Campagne automatique pour layout ${params.layoutId} avec période ${daypart.name}`
        };
        
        const campaignResponse = await client.post('/campaign', tempCampaignData);
        const tempCampaign = campaignResponse.data;
        
        // Assign layout to campaign
        await client.post(`/campaign/${tempCampaign.campaignId}/layout/assign`, {
          layoutId: [params.layoutId]
        });
        
        scheduleData.campaignId = tempCampaign.campaignId;
      }
      
      // Create the schedule
      const scheduleResponse = await client.post('/schedule', scheduleData);
      
      let result = `⏰ **Période assignée avec succès**\n\n`;
      result += `📋 **Détails de la programmation:**\n`;
      result += `   Période: ${daypart.name}\n`;
      result += `   Heures: ${daypart.startTime} - ${daypart.endTime}\n`;
      result += `   Début: ${params.startDate}\n`;
      result += `   Fin: ${params.endDate || 'Indéfinie'}\n`;
      result += `   Groupe cible: ${params.displayGroupId}\n`;
      result += `   Contenu: ${params.campaignId ? `Campagne ${params.campaignId}` : `Layout ${params.layoutId}`}\n`;
      result += `   ID programmation: ${scheduleResponse.data?.eventId || 'Créée'}\n\n`;
      
      result += `🔄 **Récurrence:**\n`;
      result += `   Cette programmation se répétera chaque jour\n`;
      result += `   aux heures définies par la période "${daypart.name}"\n`;
      
      return result;
    } catch (error: any) {
      return `Erreur lors de l'assignation de la période: ${error.message}`;
    }
  }
};

export const systemTools: ToolDefinition[] = [
  commandList,
  commandCreate,
  commandExecute,
  tagList,
  tagCreate,
  tagBulkAssign,
  daypartList,
  daypartCreate,
  daypartAssign
];