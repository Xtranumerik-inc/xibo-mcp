/**
 * Display Group management tools for Xibo MCP Server
 * @author Xtranumerik Inc.
 */

import { ToolDefinition, DisplayGroup } from '../types.js';
import XiboClient from '../xibo-client.js';

const displayGroupList: ToolDefinition = {
  name: 'displaygroup_list',
  description: 'List all display groups',
  parameters: [
    { name: 'displayGroup', type: 'string', description: 'Filter by group name', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {};
    if (params.displayGroup) queryParams.displayGroup = params.displayGroup;

    try {
      const response = await client.get<DisplayGroup[]>('/displaygroup', queryParams);
      const groups = response.data;

      if (!groups || groups.length === 0) {
        return 'Aucun groupe d\'écrans trouvé.';
      }

      let result = `📺 **Groupes d'écrans trouvés: ${groups.length}**\n\n`;
      
      groups.forEach((group, index) => {
        const type = group.isDynamic ? '🔄 Dynamique' : '📋 Statique';
        result += `**${index + 1}. ${group.displayGroup}** (ID: ${group.displayGroupId})\n`;
        result += `   Type: ${type}\n`;
        if (group.description) result += `   Description: ${group.description}\n`;
        if (group.tags && group.tags.length > 0) result += `   Tags: ${group.tags.join(', ')}\n`;
        result += `\n`;
      });

      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des groupes: ${error.message}`;
    }
  }
};

const displayGroupCreate: ToolDefinition = {
  name: 'displaygroup_create',
  description: 'Create a new display group',
  parameters: [
    { name: 'name', type: 'string', description: 'Group name', required: true },
    { name: 'description', type: 'string', description: 'Group description', required: false },
    { name: 'tags', type: 'string', description: 'Tags (comma-separated)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const data: any = { displayGroup: params.name };
      if (params.description) data.description = params.description;
      if (params.tags) data.tags = params.tags;
      
      const response = await client.post('/displaygroup', data);
      const group = response.data;
      
      return `✅ Groupe d'écrans "${params.name}" créé avec succès (ID: ${group.displayGroupId})`;
    } catch (error: any) {
      return `Erreur lors de la création du groupe: ${error.message}`;
    }
  }
};

export const displayGroupTools: ToolDefinition[] = [
  displayGroupList,
  displayGroupCreate
];