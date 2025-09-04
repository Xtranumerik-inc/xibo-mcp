/**
 * Schedule management tools for Xibo MCP Server
 * @author Xtranumerik Inc.
 */

import { ToolDefinition, Schedule } from '../types.js';
import XiboClient from '../xibo-client.js';

const scheduleList: ToolDefinition = {
  name: 'schedule_list',
  description: 'List scheduled events',
  parameters: [
    { name: 'displayGroupId', type: 'number', description: 'Filter by display group', required: false },
    { name: 'fromDt', type: 'string', description: 'From date (YYYY-MM-DD)', required: false },
    { name: 'toDt', type: 'string', description: 'To date (YYYY-MM-DD)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {};
    if (params.displayGroupId) queryParams.displayGroupId = params.displayGroupId;
    if (params.fromDt) queryParams.fromDt = params.fromDt;
    if (params.toDt) queryParams.toDt = params.toDt;

    try {
      const response = await client.get<Schedule[]>('/schedule', queryParams);
      const schedules = response.data;

      if (!schedules || schedules.length === 0) {
        return 'Aucune programmation trouvée.';
      }

      let result = `📅 **Programmations trouvées: ${schedules.length}**\n\n`;
      
      schedules.forEach((schedule, index) => {
        const priority = schedule.isPriority ? '🔴 Prioritaire' : '🟢 Normal';
        result += `**${index + 1}. Event ${schedule.eventId}**\n`;
        result += `   De: ${schedule.fromDt}\n`;
        result += `   À: ${schedule.toDt}\n`;
        result += `   Priorité: ${priority}\n`;
        if (schedule.campaignId) result += `   Campagne: ${schedule.campaignId}\n`;
        if (schedule.displayGroupId) result += `   Groupe d'écrans: ${schedule.displayGroupId}\n`;
        result += `\n`;
      });

      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des programmations: ${error.message}`;
    }
  }
};

const scheduleNow: ToolDefinition = {
  name: 'schedule_now',
  description: 'Schedule content to play immediately',
  parameters: [
    { name: 'campaignId', type: 'number', description: 'Campaign ID to schedule', required: true },
    { name: 'displayGroupId', type: 'number', description: 'Display group ID', required: true },
    { name: 'duration', type: 'number', description: 'Duration in minutes', required: false, default: 60 },
    { name: 'priority', type: 'boolean', description: 'High priority', required: false, default: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const now = new Date();
      const endTime = new Date(now.getTime() + (params.duration || 60) * 60000);
      
      const scheduleData = {
        eventTypeId: 1, // Campaign event
        campaignId: params.campaignId,
        displayGroupId: params.displayGroupId,
        fromDt: now.toISOString(),
        toDt: endTime.toISOString(),
        isPriority: params.priority ? 1 : 0,
        displayOrder: params.priority ? 1 : 10
      };
      
      const response = await client.post('/schedule', scheduleData);
      const schedule = response.data;
      
      return `✅ Campagne ${params.campaignId} programmée immédiatement (Event ID: ${schedule.eventId})`;
    } catch (error: any) {
      return `Erreur lors de la programmation: ${error.message}`;
    }
  }
};

const scheduleCreate: ToolDefinition = {
  name: 'schedule_create',
  description: 'Create a new scheduled event',
  parameters: [
    { name: 'campaignId', type: 'number', description: 'Campaign ID', required: true },
    { name: 'displayGroupId', type: 'number', description: 'Display group ID', required: true },
    { name: 'fromDt', type: 'string', description: 'Start date/time (ISO format)', required: true },
    { name: 'toDt', type: 'string', description: 'End date/time (ISO format)', required: true },
    { name: 'isPriority', type: 'boolean', description: 'Priority event', required: false, default: false },
    { name: 'recurrenceType', type: 'string', description: 'Recurrence type (Minute, Hour, Day, Week, Month)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const scheduleData = {
        eventTypeId: 1,
        campaignId: params.campaignId,
        displayGroupId: params.displayGroupId,
        fromDt: params.fromDt,
        toDt: params.toDt,
        isPriority: params.isPriority ? 1 : 0,
        ...(params.recurrenceType && { recurrenceType: params.recurrenceType })
      };
      
      const response = await client.post('/schedule', scheduleData);
      const schedule = response.data;
      
      return `✅ Événement programmé avec succès (ID: ${schedule.eventId})`;
    } catch (error: any) {
      return `Erreur lors de la création de la programmation: ${error.message}`;
    }
  }
};

const scheduleDelete: ToolDefinition = {
  name: 'schedule_delete',
  description: 'Delete a scheduled event',
  parameters: [
    { name: 'eventId', type: 'number', description: 'Event ID to delete', required: true }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      await client.delete(`/schedule/${params.eventId}`);
      return `✅ Programmation ${params.eventId} supprimée avec succès`;
    } catch (error: any) {
      return `Erreur lors de la suppression: ${error.message}`;
    }
  }
};

export const scheduleTools: ToolDefinition[] = [
  scheduleList,
  scheduleNow,
  scheduleCreate,
  scheduleDelete
];