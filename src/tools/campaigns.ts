/**
 * Campaign management tools for Xibo MCP Server
 * @author Xtranumerik Inc.
 */

import { ToolDefinition, Campaign } from '../types.js';
import XiboClient from '../xibo-client.js';

const campaignList: ToolDefinition = {
  name: 'campaign_list',
  description: 'List all campaigns',
  parameters: [
    { name: 'campaign', type: 'string', description: 'Filter by campaign name', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {};
    if (params.campaign) queryParams.campaign = params.campaign;

    try {
      const response = await client.get<Campaign[]>('/campaign', queryParams);
      const campaigns = response.data;

      if (!campaigns || campaigns.length === 0) {
        return 'Aucune campagne trouvée.';
      }

      let result = `📋 **Campagnes trouvées: ${campaigns.length}**\n\n`;
      
      campaigns.forEach((campaign, index) => {
        result += `**${index + 1}. ${campaign.campaign}** (ID: ${campaign.campaignId})\n`;
        result += `   Layouts: ${campaign.numberLayouts}\n`;
        result += `   Durée totale: ${Math.round(campaign.totalDuration)} secondes\n`;
        if (campaign.type) result += `   Type: ${campaign.type}\n`;
        result += `\n`;
      });

      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des campagnes: ${error.message}`;
    }
  }
};

const campaignCreate: ToolDefinition = {
  name: 'campaign_create',
  description: 'Create a new campaign',
  parameters: [
    { name: 'name', type: 'string', description: 'Campaign name', required: true }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const response = await client.post('/campaign', { campaign: params.name });
      const campaign = response.data;
      
      return `✅ Campagne "${params.name}" créée avec succès (ID: ${campaign.campaignId})`;
    } catch (error: any) {
      return `Erreur lors de la création de la campagne: ${error.message}`;
    }
  }
};

const campaignAssignLayout: ToolDefinition = {
  name: 'campaign_assign_layout',
  description: 'Assign a layout to a campaign',
  parameters: [
    { name: 'campaignId', type: 'number', description: 'Campaign ID', required: true },
    { name: 'layoutId', type: 'number', description: 'Layout ID to assign', required: true },
    { name: 'displayOrder', type: 'number', description: 'Display order', required: false, default: 1 }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const data = {
        layoutId: params.layoutId,
        displayOrder: params.displayOrder || 1
      };
      
      await client.post(`/campaign/layout/assign/${params.campaignId}`, data);
      
      return `✅ Layout ${params.layoutId} assigné à la campagne ${params.campaignId}`;
    } catch (error: any) {
      return `Erreur lors de l'assignation: ${error.message}`;
    }
  }
};

const campaignDelete: ToolDefinition = {
  name: 'campaign_delete',
  description: 'Delete a campaign',
  parameters: [
    { name: 'campaignId', type: 'number', description: 'Campaign ID', required: true }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      await client.delete(`/campaign/${params.campaignId}`);
      return `✅ Campagne ${params.campaignId} supprimée avec succès`;
    } catch (error: any) {
      return `Erreur lors de la suppression: ${error.message}`;
    }
  }
};

export const campaignTools: ToolDefinition[] = [
  campaignList,
  campaignCreate,
  campaignAssignLayout,
  campaignDelete
];