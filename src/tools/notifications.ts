/**
 * Notifications and alerts tools for Xibo MCP Server
 * Emergency alerts, notifications, and task management
 * @author Xtranumerik Inc.
 */

import { ToolDefinition, Notification } from '../types.js';
import XiboClient from '../xibo-client.js';

// ========== NOTIFICATION MANAGEMENT TOOLS ==========

const notificationList: ToolDefinition = {
  name: 'notification_list',
  description: 'List all notifications with filtering options',
  parameters: [
    { name: 'read', type: 'number', description: 'Filter by read status (0=unread, 1=read)', required: false },
    { name: 'start', type: 'number', description: 'Starting position for pagination', required: false },
    { name: 'length', type: 'number', description: 'Number of results to return', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {
      start: params.start || 0,
      length: params.length || 50
    };
    
    if (params.read !== undefined) queryParams.read = params.read;

    try {
      const response = await client.get<{data: Notification[], recordsTotal: number}>('/notification', queryParams);
      const notifications = response.data.data || [];
      const total = response.data.recordsTotal || 0;

      if (notifications.length === 0) {
        return 'Aucune notification trouvée.';
      }

      let result = `🔔 **Notifications: ${notifications.length}/${total}**\n\n`;
      
      // Group by status
      const unreadCount = notifications.filter(n => n.read === 0).length;
      const readCount = notifications.filter(n => n.read === 1).length;
      
      result += `📊 **Résumé:**\n`;
      result += `   🟢 Non lues: ${unreadCount}\n`;
      result += `   ✅ Lues: ${readCount}\n\n`;
      
      notifications.forEach((notification: any, index: number) => {
        const status = notification.read === 0 ? '🟢 Non lu' : '✅ Lu';
        const timestamp = new Date(notification.createdDt).toLocaleString('fr-FR');
        
        result += `**${index + 1}.** ${status} - ${timestamp}\n`;
        result += `   📝 **${notification.subject || 'Notification'}**\n`;
        result += `   💬 ${notification.body || 'Aucun contenu'}\n`;
        
        if (notification.userId) {
          result += `   👤 Pour utilisateur ID: ${notification.userId}\n`;
        }
        
        if (notification.email) {
          result += `   📧 Email: ${notification.email ? 'Oui' : 'Non'}\n`;
        }
        
        result += '\n';
      });

      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des notifications: ${error.message}`;
    }
  }
};

const notificationSend: ToolDefinition = {
  name: 'notification_send',
  description: 'Send a notification to specific users',
  parameters: [
    { name: 'subject', type: 'string', description: 'Notification subject', required: true },
    { name: 'body', type: 'string', description: 'Notification message body', required: true },
    { name: 'userId', type: 'number', description: 'Specific user ID to notify', required: false },
    { name: 'userGroupId', type: 'number', description: 'User group ID to notify', required: false },
    { name: 'email', type: 'number', description: 'Send email notification (1=yes, 0=no)', required: false },
    { name: 'interrupt', type: 'number', description: 'Interrupt current activity (1=yes, 0=no)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const notificationData: any = {
        subject: params.subject,
        body: params.body,
        email: params.email || 0,
        interrupt: params.interrupt || 0
      };
      
      if (params.userId) {
        notificationData.userId = params.userId;
      } else if (params.userGroupId) {
        notificationData.userGroupId = params.userGroupId;
      } else {
        return '❌ Vous devez spécifier soit userId soit userGroupId';
      }
      
      const response = await client.post('/notification', notificationData);
      const newNotification = response.data;
      
      let result = `✅ Notification envoyée avec succès (ID: ${newNotification.notificationId || 'N/A'})\n\n`;
      result += `📝 **Détails:**\n`;
      result += `   Sujet: ${params.subject}\n`;
      result += `   Destinataire: ${params.userId ? `Utilisateur ${params.userId}` : `Groupe ${params.userGroupId}`}\n`;
      result += `   Email: ${params.email ? 'Oui' : 'Non'}\n`;
      result += `   Interruption: ${params.interrupt ? 'Oui' : 'Non'}\n`;
      
      return result;
    } catch (error: any) {
      return `Erreur lors de l'envoi de la notification: ${error.message}`;
    }
  }
};

const notificationBroadcast: ToolDefinition = {
  name: 'notification_broadcast',
  description: 'Broadcast a notification to all users',
  parameters: [
    { name: 'subject', type: 'string', description: 'Broadcast subject', required: true },
    { name: 'body', type: 'string', description: 'Broadcast message', required: true },
    { name: 'email', type: 'number', description: 'Send email to all users (1=yes, 0=no)', required: false },
    { name: 'interrupt', type: 'number', description: 'Interrupt all current activities (1=yes, 0=no)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      // Get all users first
      const usersResponse = await client.get('/user', { start: 0, length: 1000 });
      const users = usersResponse.data.data || [];
      const activeUsers = users.filter((user: any) => user.retired === 0);
      
      if (activeUsers.length === 0) {
        return '❌ Aucun utilisateur actif trouvé pour la diffusion';
      }
      
      const notificationData: any = {
        subject: params.subject,
        body: params.body,
        email: params.email || 0,
        interrupt: params.interrupt || 0,
        isSystem: 1, // System notification for broadcast
        broadcast: 1
      };
      
      // Send to all active users
      const results = [];
      for (const user of activeUsers) {
        try {
          const userNotificationData = {
            ...notificationData,
            userId: user.userId
          };
          
          await client.post('/notification', userNotificationData);
          results.push(`✅ ${user.userName}`);
        } catch (error) {
          results.push(`❌ ${user.userName}: ${error.message}`);
        }
      }
      
      let result = `📢 **Diffusion terminée**\n\n`;
      result += `📊 **Statistiques:**\n`;
      result += `   Utilisateurs ciblés: ${activeUsers.length}\n`;
      result += `   Succès: ${results.filter(r => r.startsWith('✅')).length}\n`;
      result += `   Échecs: ${results.filter(r => r.startsWith('❌')).length}\n\n`;
      
      result += `📝 **Message diffusé:**\n`;
      result += `   Sujet: ${params.subject}\n`;
      result += `   Contenu: ${params.body}\n`;
      result += `   Email: ${params.email ? 'Oui' : 'Non'}\n`;
      result += `   Interruption: ${params.interrupt ? 'Oui' : 'Non'}\n`;
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la diffusion: ${error.message}`;
    }
  }
};

// ========== ALERT MANAGEMENT TOOLS ==========

const alertEmergencyCreate: ToolDefinition = {
  name: 'alert_emergency_create',
  description: 'Create an emergency alert with high priority display',
  parameters: [
    { name: 'title', type: 'string', description: 'Emergency alert title', required: true },
    { name: 'message', type: 'string', description: 'Emergency alert message', required: true },
    { name: 'alertType', type: 'string', description: 'Alert type: warning, danger, info, success', required: false },
    { name: 'displayIds', type: 'string', description: 'Comma-separated display IDs (leave empty for all)', required: false },
    { name: 'duration', type: 'number', description: 'Display duration in seconds (0 = indefinite)', required: false },
    { name: 'priority', type: 'number', description: 'Priority level (1-10, 10=highest)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      // Get alert type styling
      const alertTypes: any = {
        warning: { emoji: '⚠️', color: '#FF9800', background: '#FFF3CD' },
        danger: { emoji: '🚨', color: '#F44336', background: '#F8D7DA' },
        info: { emoji: 'ℹ️', color: '#2196F3', background: '#D1ECF1' },
        success: { emoji: '✅', color: '#4CAF50', background: '#D4EDDA' }
      };
      
      const alertType = params.alertType?.toLowerCase() || 'warning';
      const alertStyle = alertTypes[alertType] || alertTypes.warning;
      
      // Create emergency layout with alert
      const layoutData = {
        name: `URGENCE_${params.title}_${Date.now()}`,
        description: `Alerte d'urgence: ${params.message}`,
        tags: 'urgence,alerte,emergency',
        width: 1920,
        height: 1080
      };
      
      const layoutResponse = await client.post('/layout', layoutData);
      const alertLayout = layoutResponse.data;
      
      // Add alert region to layout (this would need specific region creation)
      const regionData = {
        layoutId: alertLayout.layoutId,
        width: 1920,
        height: 300,
        top: 390, // Center vertically
        left: 0
      };
      
      // Create campaign for emergency alert
      const campaignData = {
        campaign: `ALERTE_URGENCE_${Date.now()}`,
        description: `Alerte d'urgence: ${params.title}`,
        startDt: new Date().toISOString(),
        // Set end time if duration specified
        endDt: params.duration && params.duration > 0 ? 
          new Date(Date.now() + (params.duration * 1000)).toISOString() : null,
        displayOrder: params.priority || 10
      };
      
      const campaignResponse = await client.post('/campaign', campaignData);
      const alertCampaign = campaignResponse.data;
      
      // Assign layout to campaign
      await client.post(`/campaign/${alertCampaign.campaignId}/layout/assign`, {
        layoutId: [alertLayout.layoutId]
      });
      
      // Schedule to displays
      let targetDisplays = 'tous les écrans';
      const scheduleData: any = {
        campaignId: alertCampaign.campaignId,
        displayOrder: params.priority || 10,
        isPriority: 1,
        syncTimezone: 0,
        fromDt: new Date().toISOString()
      };
      
      if (params.duration && params.duration > 0) {
        scheduleData.toDt = new Date(Date.now() + (params.duration * 1000)).toISOString();
      }
      
      if (params.displayIds) {
        const displayIds = params.displayIds.split(',').map(id => parseInt(id.trim()));
        scheduleData.displayGroupIds = displayIds;
        targetDisplays = `écrans [${params.displayIds}]`;
      }
      
      const scheduleResponse = await client.post('/schedule', scheduleData);
      
      let result = `${alertStyle.emoji} **ALERTE D'URGENCE CRÉÉE**\n\n`;
      result += `🚨 **Détails de l'alerte:**\n`;
      result += `   Titre: ${params.title}\n`;
      result += `   Message: ${params.message}\n`;
      result += `   Type: ${alertType.toUpperCase()}\n`;
      result += `   Priorité: ${params.priority || 10}/10\n`;
      result += `   Cibles: ${targetDisplays}\n`;
      result += `   Durée: ${params.duration ? `${params.duration} secondes` : 'Illimitée'}\n\n`;
      
      result += `📋 **Éléments créés:**\n`;
      result += `   Layout: ${alertLayout.layoutId}\n`;
      result += `   Campagne: ${alertCampaign.campaignId}\n`;
      result += `   Programmation: ${scheduleResponse.data?.eventId || 'Créée'}\n\n`;
      
      result += `⚡ **L'alerte est maintenant diffusée sur les écrans ciblés**`;
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la création de l'alerte d'urgence: ${error.message}`;
    }
  }
};

const alertSchedule: ToolDefinition = {
  name: 'alert_schedule',
  description: 'Schedule an alert for future display',
  parameters: [
    { name: 'title', type: 'string', description: 'Alert title', required: true },
    { name: 'message', type: 'string', description: 'Alert message', required: true },
    { name: 'scheduleDt', type: 'string', description: 'Schedule date/time (YYYY-MM-DD HH:MM)', required: true },
    { name: 'duration', type: 'number', description: 'Display duration in seconds', required: false },
    { name: 'displayIds', type: 'string', description: 'Comma-separated display IDs', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      // Parse and validate schedule date
      const scheduleDate = new Date(params.scheduleDt);
      if (isNaN(scheduleDate.getTime())) {
        return '❌ Format de date invalide. Utilisez: YYYY-MM-DD HH:MM';
      }
      
      if (scheduleDate <= new Date()) {
        return '❌ La date de programmation doit être dans le futur';
      }
      
      // Create layout for scheduled alert
      const layoutData = {
        name: `ALERTE_PROGRAMMEE_${params.title}_${Date.now()}`,
        description: `Alerte programmée: ${params.message}`,
        tags: 'alerte,programmee,scheduled',
        width: 1920,
        height: 1080
      };
      
      const layoutResponse = await client.post('/layout', layoutData);
      const alertLayout = layoutResponse.data;
      
      // Create campaign
      const campaignData = {
        campaign: `ALERTE_PROG_${Date.now()}`,
        description: `Alerte programmée: ${params.title}`,
        startDt: scheduleDate.toISOString(),
        endDt: params.duration ? 
          new Date(scheduleDate.getTime() + (params.duration * 1000)).toISOString() : null
      };
      
      const campaignResponse = await client.post('/campaign', campaignData);
      const alertCampaign = campaignResponse.data;
      
      // Assign layout to campaign
      await client.post(`/campaign/${alertCampaign.campaignId}/layout/assign`, {
        layoutId: [alertLayout.layoutId]
      });
      
      // Schedule the alert
      const scheduleData: any = {
        campaignId: alertCampaign.campaignId,
        displayOrder: 5,
        isPriority: 0,
        syncTimezone: 1,
        fromDt: scheduleDate.toISOString()
      };
      
      if (params.duration) {
        scheduleData.toDt = new Date(scheduleDate.getTime() + (params.duration * 1000)).toISOString();
      }
      
      if (params.displayIds) {
        const displayIds = params.displayIds.split(',').map(id => parseInt(id.trim()));
        scheduleData.displayGroupIds = displayIds;
      }
      
      const scheduleResponse = await client.post('/schedule', scheduleData);
      
      let result = `⏰ **Alerte programmée avec succès**\n\n`;
      result += `📅 **Détails de la programmation:**\n`;
      result += `   Titre: ${params.title}\n`;
      result += `   Message: ${params.message}\n`;
      result += `   Diffusion prévue: ${scheduleDate.toLocaleString('fr-FR')}\n`;
      result += `   Durée: ${params.duration ? `${params.duration} secondes` : 'Selon configuration'}\n`;
      result += `   Cibles: ${params.displayIds ? `Écrans [${params.displayIds}]` : 'Tous les écrans'}\n\n`;
      
      result += `📋 **Éléments créés:**\n`;
      result += `   Layout: ${alertLayout.layoutId}\n`;
      result += `   Campagne: ${alertCampaign.campaignId}\n`;
      result += `   Programmation: ${scheduleResponse.data?.eventId || 'Créée'}\n`;
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la programmation de l'alerte: ${error.message}`;
    }
  }
};

const alertGeoTarget: ToolDefinition = {
  name: 'alert_geo_target',
  description: 'Create geo-targeted alert (support for Quebec/Montreal regions)',
  parameters: [
    { name: 'title', type: 'string', description: 'Alert title', required: true },
    { name: 'message', type: 'string', description: 'Alert message', required: true },
    { name: 'includeRegions', type: 'string', description: 'Regions to include: montreal,quebec,laval,etc.', required: false },
    { name: 'excludeRegions', type: 'string', description: 'Regions to exclude: quebec,montreal,etc.', required: false },
    { name: 'tags', type: 'string', description: 'Display tags to target', required: false },
    { name: 'duration', type: 'number', description: 'Display duration in seconds', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      // Get all displays to filter by geography
      const displaysResponse = await client.get('/display', { start: 0, length: 1000 });
      const allDisplays = displaysResponse.data.data || [];
      
      // Define geographic regions (based on Quebec/Montreal context)
      const regionMaps: any = {
        quebec: ['quebec', 'ville-de-quebec', 'vieux-quebec', 'sainte-foy', 'limoilou'],
        montreal: ['montreal', 'centre-ville', 'plateau', 'rosemont', 'verdun'],
        laval: ['laval'],
        longueuil: ['longueuil'],
        gatineau: ['gatineau', 'hull'],
        sherbrooke: ['sherbrooke']
      };
      
      let targetDisplays = allDisplays;
      
      // Filter by included regions
      if (params.includeRegions) {
        const includeList = params.includeRegions.toLowerCase().split(',').map(s => s.trim());
        const includeKeywords: string[] = [];
        
        includeList.forEach(region => {
          if (regionMaps[region]) {
            includeKeywords.push(...regionMaps[region]);
          } else {
            includeKeywords.push(region);
          }
        });
        
        targetDisplays = targetDisplays.filter((display: any) => {
          const displayName = (display.display || '').toLowerCase();
          const displayTags = (display.tags || '').toLowerCase();
          const displayDescription = (display.description || '').toLowerCase();
          
          return includeKeywords.some(keyword => 
            displayName.includes(keyword) || 
            displayTags.includes(keyword) || 
            displayDescription.includes(keyword)
          );
        });
      }
      
      // Filter by excluded regions
      if (params.excludeRegions) {
        const excludeList = params.excludeRegions.toLowerCase().split(',').map(s => s.trim());
        const excludeKeywords: string[] = [];
        
        excludeList.forEach(region => {
          if (regionMaps[region]) {
            excludeKeywords.push(...regionMaps[region]);
          } else {
            excludeKeywords.push(region);
          }
        });
        
        targetDisplays = targetDisplays.filter((display: any) => {
          const displayName = (display.display || '').toLowerCase();
          const displayTags = (display.tags || '').toLowerCase();
          const displayDescription = (display.description || '').toLowerCase();
          
          return !excludeKeywords.some(keyword => 
            displayName.includes(keyword) || 
            displayTags.includes(keyword) || 
            displayDescription.includes(keyword)
          );
        });
      }
      
      // Filter by tags if specified
      if (params.tags) {
        const requiredTags = params.tags.toLowerCase().split(',').map(s => s.trim());
        targetDisplays = targetDisplays.filter((display: any) => {
          const displayTags = (display.tags || '').toLowerCase();
          return requiredTags.some(tag => displayTags.includes(tag));
        });
      }
      
      if (targetDisplays.length === 0) {
        return '❌ Aucun écran trouvé correspondant aux critères géographiques';
      }
      
      // Create geo-targeted layout
      const layoutData = {
        name: `ALERTE_GEO_${params.title}_${Date.now()}`,
        description: `Alerte géo-ciblée: ${params.message}`,
        tags: 'alerte,geo-ciblee,geographic',
        width: 1920,
        height: 1080
      };
      
      const layoutResponse = await client.post('/layout', layoutData);
      const alertLayout = layoutResponse.data;
      
      // Create campaign
      const campaignData = {
        campaign: `ALERTE_GEO_${Date.now()}`,
        description: `Alerte géo-ciblée: ${params.title}`,
        startDt: new Date().toISOString(),
        endDt: params.duration ? 
          new Date(Date.now() + (params.duration * 1000)).toISOString() : null
      };
      
      const campaignResponse = await client.post('/campaign', campaignData);
      const alertCampaign = campaignResponse.data;
      
      // Assign layout to campaign
      await client.post(`/campaign/${alertCampaign.campaignId}/layout/assign`, {
        layoutId: [alertLayout.layoutId]
      });
      
      // Schedule to targeted displays
      const displayIds = targetDisplays.map((d: any) => d.displayId);
      
      const scheduleData = {
        campaignId: alertCampaign.campaignId,
        displayOrder: 7,
        isPriority: 1,
        syncTimezone: 1,
        fromDt: new Date().toISOString(),
        toDt: params.duration ? 
          new Date(Date.now() + (params.duration * 1000)).toISOString() : null,
        displayGroupIds: displayIds
      };
      
      const scheduleResponse = await client.post('/schedule', scheduleData);
      
      let result = `🌍 **Alerte géo-ciblée créée avec succès**\n\n`;
      result += `📍 **Ciblage géographique:**\n`;
      
      if (params.includeRegions) {
        result += `   ✅ Inclure: ${params.includeRegions}\n`;
      }
      if (params.excludeRegions) {
        result += `   ❌ Exclure: ${params.excludeRegions}\n`;
      }
      if (params.tags) {
        result += `   🏷️  Tags requis: ${params.tags}\n`;
      }
      
      result += `   🎯 Écrans ciblés: ${targetDisplays.length}\n\n`;
      
      result += `📝 **Contenu de l'alerte:**\n`;
      result += `   Titre: ${params.title}\n`;
      result += `   Message: ${params.message}\n`;
      result += `   Durée: ${params.duration ? `${params.duration} secondes` : 'Selon configuration'}\n\n`;
      
      result += `📋 **Écrans concernés:**\n`;
      targetDisplays.slice(0, 10).forEach((display: any, index: number) => {
        result += `   ${index + 1}. ${display.display}\n`;
      });
      
      if (targetDisplays.length > 10) {
        result += `   ... et ${targetDisplays.length - 10} autres écrans\n`;
      }
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la création de l'alerte géo-ciblée: ${error.message}`;
    }
  }
};

// ========== TASK MANAGEMENT TOOLS ==========

const taskList: ToolDefinition = {
  name: 'task_list',
  description: 'List scheduled tasks and background processes',
  parameters: [
    { name: 'status', type: 'string', description: 'Filter by status: pending, running, completed, failed', required: false },
    { name: 'start', type: 'number', description: 'Starting position', required: false },
    { name: 'length', type: 'number', description: 'Number of results', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {
      start: params.start || 0,
      length: params.length || 50
    };
    
    if (params.status) queryParams.status = params.status;

    try {
      const response = await client.get('/task', queryParams);
      const tasks = response.data.data || [];
      const total = response.data.recordsTotal || 0;

      if (tasks.length === 0) {
        return 'Aucune tâche trouvée.';
      }

      let result = `⚙️ **Tâches: ${tasks.length}/${total}**\n\n`;
      
      // Group by status
      const statusGroups: any = {};
      tasks.forEach((task: any) => {
        const status = task.status || 'unknown';
        if (!statusGroups[status]) statusGroups[status] = [];
        statusGroups[status].push(task);
      });
      
      Object.entries(statusGroups).forEach(([status, statusTasks]: [string, any]) => {
        const statusEmojis: any = {
          pending: '⏳',
          running: '🔄',
          completed: '✅',
          failed: '❌',
          unknown: '❓'
        };
        
        const emoji = statusEmojis[status] || '❓';
        result += `${emoji} **${status.toUpperCase()}: ${statusTasks.length}**\n`;
        
        statusTasks.forEach((task: any, index: number) => {
          const lastRun = task.lastRunDt ? 
            new Date(task.lastRunDt).toLocaleString('fr-FR') : 'Jamais';
          
          result += `   ${index + 1}. ${task.name || `Tâche ${task.taskId}`}\n`;
          result += `      📋 Type: ${task.class || 'N/A'}\n`;
          result += `      ⏰ Dernière exécution: ${lastRun}\n`;
          
          if (task.nextRunDt) {
            const nextRun = new Date(task.nextRunDt).toLocaleString('fr-FR');
            result += `      ⏭️  Prochaine exécution: ${nextRun}\n`;
          }
          
          result += '\n';
        });
      });

      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des tâches: ${error.message}`;
    }
  }
};

const taskRunNow: ToolDefinition = {
  name: 'task_run_now',
  description: 'Execute a specific task immediately',
  parameters: [
    { name: 'taskId', type: 'number', description: 'Task ID to execute', required: true }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      // Get task details first
      const taskResponse = await client.get(`/task/${params.taskId}`);
      const task = taskResponse.data;
      
      // Execute the task
      const runResponse = await client.post(`/task/${params.taskId}/run`, {});
      
      let result = `▶️ **Tâche exécutée**\n\n`;
      result += `📋 **Détails:**\n`;
      result += `   Nom: ${task.name || `Tâche ${params.taskId}`}\n`;
      result += `   Type: ${task.class || 'N/A'}\n`;
      result += `   Status: Démarrée\n`;
      result += `   Heure d'exécution: ${new Date().toLocaleString('fr-FR')}\n`;
      
      if (runResponse.data.success) {
        result += `   ✅ Résultat: Succès\n`;
      } else {
        result += `   ⚠️  Résultat: ${runResponse.data.message || 'Status inconnu'}\n`;
      }
      
      return result;
    } catch (error: any) {
      return `Erreur lors de l'exécution de la tâche: ${error.message}`;
    }
  }
};

export const notificationTools: ToolDefinition[] = [
  notificationList,
  notificationSend,
  notificationBroadcast,
  alertEmergencyCreate,
  alertSchedule,
  alertGeoTarget,
  taskList,
  taskRunNow
];