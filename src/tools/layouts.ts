/**
 * Layout management tools for Xibo MCP Server
 * @author Xtranumerik Inc.
 */

import { ToolDefinition, Layout } from '../types.js';
import XiboClient from '../xibo-client.js';

const layoutList: ToolDefinition = {
  name: 'layout_list',
  description: 'List all layouts with optional filtering',
  parameters: [
    { name: 'layout', type: 'string', description: 'Filter by layout name', required: false },
    { name: 'tags', type: 'string', description: 'Filter by tags (comma-separated)', required: false },
    { name: 'retired', type: 'boolean', description: 'Include retired layouts', required: false, default: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {};
    if (params.layout) queryParams.layout = params.layout;
    if (params.tags) queryParams.tags = params.tags;
    if (params.retired) queryParams.retired = 1;

    try {
      const response = await client.get<Layout[]>('/layout', queryParams);
      const layouts = response.data;

      if (!layouts || layouts.length === 0) {
        return 'Aucune mise en page trouvée.';
      }

      let result = `🖼️ **Mises en page trouvées: ${layouts.length}**\n\n`;
      
      layouts.forEach((layout, index) => {
        const status = layout.publishedStatusId === 1 ? '🟢 Publié' : '🟡 Brouillon';
        result += `**${index + 1}. ${layout.layout}** (ID: ${layout.layoutId})\n`;
        result += `   Statut: ${status}\n`;
        result += `   Dimensions: ${layout.width}x${layout.height}px\n`;
        if (layout.description) result += `   Description: ${layout.description}\n`;
        if (layout.tags && layout.tags.length > 0) result += `   Tags: ${layout.tags.join(', ')}\n`;
        result += `\n`;
      });

      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des mises en page: ${error.message}`;
    }
  }
};

const layoutCreate: ToolDefinition = {
  name: 'layout_create',
  description: 'Create a new layout',
  parameters: [
    { name: 'name', type: 'string', description: 'Layout name', required: true },
    { name: 'description', type: 'string', description: 'Layout description', required: false },
    { name: 'width', type: 'number', description: 'Layout width in pixels', required: false, default: 1920 },
    { name: 'height', type: 'number', description: 'Layout height in pixels', required: false, default: 1080 },
    { name: 'backgroundColor', type: 'string', description: 'Background color (hex)', required: false },
    { name: 'tags', type: 'string', description: 'Tags (comma-separated)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const data: any = {
        layout: params.name,
        width: params.width || 1920,
        height: params.height || 1080
      };
      
      if (params.description) data.description = params.description;
      if (params.backgroundColor) data.backgroundColor = params.backgroundColor;
      if (params.tags) data.tags = params.tags;
      
      const response = await client.post('/layout', data);
      const layout = response.data;
      
      return `✅ Mise en page "${params.name}" créée avec succès (ID: ${layout.layoutId})`;
    } catch (error: any) {
      return `Erreur lors de la création de la mise en page: ${error.message}`;
    }
  }
};

const layoutGet: ToolDefinition = {
  name: 'layout_get',
  description: 'Get detailed information about a layout',
  parameters: [
    { name: 'layoutId', type: 'number', description: 'The layout ID', required: true }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const response = await client.get<Layout>(`/layout/${params.layoutId}`);
      const layout = response.data;

      const status = layout.publishedStatusId === 1 ? '🟢 Publié' : '🟡 Brouillon';
      
      let result = `🖼️ **Détails de la mise en page: ${layout.layout}**\n\n`;
      result += `**Informations générales:**\n`;
      result += `   ID: ${layout.layoutId}\n`;
      result += `   Nom: ${layout.layout}\n`;
      result += `   Statut: ${status}\n`;
      result += `   Dimensions: ${layout.width}x${layout.height}px\n`;
      if (layout.description) result += `   Description: ${layout.description}\n`;
      if (layout.backgroundColor) result += `   Couleur de fond: ${layout.backgroundColor}\n`;
      
      if (layout.regions && layout.regions.length > 0) {
        result += `\n**Régions (${layout.regions.length}):**\n`;
        layout.regions.forEach((region, index) => {
          result += `   ${index + 1}. ${region.name} (${region.width}x${region.height}px)\n`;
        });
      }
      
      if (layout.tags && layout.tags.length > 0) {
        result += `\n**Tags:** ${layout.tags.join(', ')}\n`;
      }

      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des détails de la mise en page: ${error.message}`;
    }
  }
};

const layoutPublish: ToolDefinition = {
  name: 'layout_publish',
  description: 'Publish a draft layout',
  parameters: [
    { name: 'layoutId', type: 'number', description: 'The layout ID', required: true }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      await client.put(`/layout/publish/${params.layoutId}`, {});
      return `✅ Mise en page ${params.layoutId} publiée avec succès.`;
    } catch (error: any) {
      return `Erreur lors de la publication: ${error.message}`;
    }
  }
};

export const layoutTools: ToolDefinition[] = [
  layoutList,
  layoutCreate,
  layoutGet,
  layoutPublish
];