/**
 * Statistics and reporting tools for Xibo MCP Server
 * Analytics, monitoring and audit capabilities
 * @author Xtranumerik Inc.
 */

import { ToolDefinition } from '../types.js';
import XiboClient from '../xibo-client.js';

// ========== STATISTICS TOOLS ==========

const statsDisplayUsage: ToolDefinition = {
  name: 'stats_display_usage',
  description: 'Get display usage statistics and status information',
  parameters: [
    { name: 'displayId', type: 'number', description: 'Specific display ID (optional for all displays)', required: false },
    { name: 'fromDt', type: 'string', description: 'Start date (YYYY-MM-DD)', required: false },
    { name: 'toDt', type: 'string', description: 'End date (YYYY-MM-DD)', required: false },
    { name: 'tags', type: 'string', description: 'Filter by display tags', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {};
    if (params.displayId) queryParams.displayId = params.displayId;
    if (params.fromDt) queryParams.fromDt = params.fromDt;
    if (params.toDt) queryParams.toDt = params.toDt;
    if (params.tags) queryParams.tags = params.tags;

    try {
      // Get display statistics
      const statsResponse = await client.get('/stats/display', queryParams);
      const stats = statsResponse.data;
      
      // Get display status
      const displaysResponse = await client.get('/display', { 
        start: 0, 
        length: 1000,
        tags: params.tags 
      });
      const displays = displaysResponse.data.data;
      
      let result = `📊 **Statistiques d'utilisation des écrans**\n\n`;
      
      if (params.fromDt && params.toDt) {
        result += `📅 **Période:** ${params.fromDt} → ${params.toDt}\n\n`;
      }
      
      // Display status summary
      const statusCounts = displays.reduce((acc: any, display: any) => {
        const status = display.loggedIn === 1 ? 'en_ligne' : 'hors_ligne';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      result += `📈 **Résumé des états:**\n`;
      result += `   🟢 En ligne: ${statusCounts.en_ligne || 0} écrans\n`;
      result += `   🔴 Hors ligne: ${statusCounts.hors_ligne || 0} écrans\n`;
      result += `   📺 Total: ${displays.length} écrans\n\n`;
      
      // Detailed display information
      result += `📋 **Détails par écran:**\n\n`;
      
      displays.forEach((display: any, index: number) => {
        const status = display.loggedIn === 1 ? '🟢 En ligne' : '🔴 Hors ligne';
        const lastAccess = display.lastAccessed ? 
          new Date(display.lastAccessed).toLocaleString('fr-FR') : 'Jamais';
        
        result += `**${index + 1}. ${display.display}** (ID: ${display.displayId})\n`;
        result += `   Status: ${status}\n`;
        result += `   Dernière connexion: ${lastAccess}\n`;
        
        if (display.clientAddress) {
          result += `   Adresse IP: ${display.clientAddress}\n`;
        }
        
        if (display.macAddress) {
          result += `   Adresse MAC: ${display.macAddress}\n`;
        }
        
        if (display.tags) {
          result += `   Tags: ${display.tags}\n`;
        }
        
        result += '\n';
      });
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des statistiques: ${error.message}`;
    }
  }
};

const statsMediaPerformance: ToolDefinition = {
  name: 'stats_media_performance',
  description: 'Analyze media performance and usage statistics',
  parameters: [
    { name: 'mediaId', type: 'number', description: 'Specific media ID', required: false },
    { name: 'type', type: 'string', description: 'Media type filter', required: false },
    { name: 'fromDt', type: 'string', description: 'Start date (YYYY-MM-DD)', required: false },
    { name: 'toDt', type: 'string', description: 'End date (YYYY-MM-DD)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {
      start: 0,
      length: 100
    };
    if (params.mediaId) queryParams.mediaId = params.mediaId;
    if (params.type) queryParams.type = params.type;
    if (params.fromDt) queryParams.fromDt = params.fromDt;
    if (params.toDt) queryParams.toDt = params.toDt;

    try {
      // Get media library stats
      const mediaResponse = await client.get('/library', queryParams);
      const mediaItems = mediaResponse.data.data;
      const totalMedia = mediaResponse.data.recordsTotal;
      
      let result = `📊 **Performance des médias**\n\n`;
      
      if (params.fromDt && params.toDt) {
        result += `📅 **Période:** ${params.fromDt} → ${params.toDt}\n\n`;
      }
      
      // Media type distribution
      const typeStats = mediaItems.reduce((acc: any, media: any) => {
        const type = media.mediaType || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      
      result += `📈 **Distribution par type:**\n`;
      Object.entries(typeStats).forEach(([type, count]) => {
        result += `   📄 ${type}: ${count} fichiers\n`;
      });
      result += `   📚 Total: ${totalMedia} médias\n\n`;
      
      // Storage usage
      const totalSize = mediaItems.reduce((sum: number, media: any) => {
        return sum + (media.fileSize || 0);
      }, 0);
      
      const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
      const sizeGB = (totalSize / 1024 / 1024 / 1024).toFixed(2);
      
      result += `💾 **Utilisation du stockage:**\n`;
      result += `   📊 Taille totale: ${sizeMB} MB (${sizeGB} GB)\n`;
      result += `   📊 Moyenne par fichier: ${(totalSize / mediaItems.length / 1024).toFixed(2)} KB\n\n`;
      
      // Top media by size
      const topMedia = mediaItems
        .sort((a: any, b: any) => (b.fileSize || 0) - (a.fileSize || 0))
        .slice(0, 10);
      
      result += `🏆 **Top 10 médias les plus volumineux:**\n\n`;
      
      topMedia.forEach((media: any, index: number) => {
        const sizeMB = ((media.fileSize || 0) / 1024 / 1024).toFixed(2);
        result += `**${index + 1}. ${media.name}**\n`;
        result += `   Type: ${media.mediaType}\n`;
        result += `   Taille: ${sizeMB} MB\n`;
        result += `   Créé: ${new Date(media.createdDt).toLocaleDateString('fr-FR')}\n`;
        result += '\n';
      });
      
      return result;
    } catch (error: any) {
      return `Erreur lors de l'analyse des médias: ${error.message}`;
    }
  }
};

const statsCampaignAnalytics: ToolDefinition = {
  name: 'stats_campaign_analytics',
  description: 'Get campaign performance analytics and engagement metrics',
  parameters: [
    { name: 'campaignId', type: 'number', description: 'Specific campaign ID', required: false },
    { name: 'fromDt', type: 'string', description: 'Start date (YYYY-MM-DD)', required: false },
    { name: 'toDt', type: 'string', description: 'End date (YYYY-MM-DD)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {};
    if (params.campaignId) queryParams.campaignId = params.campaignId;
    if (params.fromDt) queryParams.fromDt = params.fromDt;
    if (params.toDt) queryParams.toDt = params.toDt;

    try {
      // Get campaigns
      const campaignResponse = await client.get('/campaign', {
        start: 0,
        length: 100,
        ...queryParams
      });
      const campaigns = campaignResponse.data.data;
      
      let result = `📊 **Analytics des campagnes**\n\n`;
      
      if (params.fromDt && params.toDt) {
        result += `📅 **Période:** ${params.fromDt} → ${params.toDt}\n\n`;
      }
      
      result += `📈 **Résumé:**\n`;
      result += `   🎯 Nombre de campagnes: ${campaigns.length}\n\n`;
      
      // Analyze campaigns
      campaigns.forEach((campaign: any, index: number) => {
        result += `**${index + 1}. ${campaign.campaign}** (ID: ${campaign.campaignId})\n`;
        result += `   📊 Layouts: ${campaign.numberLayouts || 0}\n`;
        
        if (campaign.startDt && campaign.endDt) {
          const start = new Date(campaign.startDt).toLocaleDateString('fr-FR');
          const end = new Date(campaign.endDt).toLocaleDateString('fr-FR');
          result += `   📅 Période: ${start} → ${end}\n`;
        }
        
        const status = campaign.isLayoutSpecific === 1 ? 'Spécifique' : 'Général';
        result += `   🏷️  Type: ${status}\n`;
        
        if (campaign.tags) {
          result += `   🏷️  Tags: ${campaign.tags}\n`;
        }
        
        result += '\n';
      });
      
      return result;
    } catch (error: any) {
      return `Erreur lors de l'analyse des campagnes: ${error.message}`;
    }
  }
};

const statsBandwidth: ToolDefinition = {
  name: 'stats_bandwidth',
  description: 'Monitor bandwidth usage and data transfer statistics',
  parameters: [
    { name: 'displayId', type: 'number', description: 'Specific display ID', required: false },
    { name: 'fromDt', type: 'string', description: 'Start date (YYYY-MM-DD)', required: false },
    { name: 'toDt', type: 'string', description: 'End date (YYYY-MM-DD)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {};
    if (params.displayId) queryParams.displayId = params.displayId;
    if (params.fromDt) queryParams.fromDt = params.fromDt;
    if (params.toDt) queryParams.toDt = params.toDt;

    try {
      // Get bandwidth statistics
      const statsResponse = await client.get('/stats/bandwidth', queryParams);
      const bandwidthData = statsResponse.data;
      
      let result = `📊 **Statistiques de bande passante**\n\n`;
      
      if (params.fromDt && params.toDt) {
        result += `📅 **Période:** ${params.fromDt} → ${params.toDt}\n\n`;
      }
      
      if (Array.isArray(bandwidthData) && bandwidthData.length > 0) {
        let totalBytes = 0;
        
        result += `📈 **Utilisation détaillée:**\n\n`;
        
        bandwidthData.forEach((stat: any, index: number) => {
          const bytesTransferred = stat.size || 0;
          totalBytes += bytesTransferred;
          
          const sizeMB = (bytesTransferred / 1024 / 1024).toFixed(2);
          
          result += `**${index + 1}. Display ${stat.displayId || 'Inconnu'}**\n`;
          result += `   📊 Données transférées: ${sizeMB} MB\n`;
          
          if (stat.statDate) {
            result += `   📅 Date: ${new Date(stat.statDate).toLocaleDateString('fr-FR')}\n`;
          }
          
          result += '\n';
        });
        
        const totalMB = (totalBytes / 1024 / 1024).toFixed(2);
        const totalGB = (totalBytes / 1024 / 1024 / 1024).toFixed(2);
        
        result += `📊 **Total général:**\n`;
        result += `   📈 Bande passante totale: ${totalMB} MB (${totalGB} GB)\n`;
        result += `   📊 Moyenne par écran: ${(totalBytes / bandwidthData.length / 1024 / 1024).toFixed(2)} MB\n`;
        
      } else {
        result += '📊 Aucune donnée de bande passante disponible pour la période sélectionnée.\n';
        result += '\n💡 **Suggestions:**\n';
        result += '   - Vérifiez que les écrans sont configurés pour rapporter les statistiques\n';
        result += '   - Essayez une période différente\n';
        result += '   - Vérifiez que XMR est configuré correctement\n';
      }
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des stats de bande passante: ${error.message}`;
    }
  }
};

// ========== REPORTING TOOLS ==========

const reportProofOfPlay: ToolDefinition = {
  name: 'report_proof_of_play',
  description: 'Generate proof of play report showing what content was displayed when',
  parameters: [
    { name: 'displayId', type: 'number', description: 'Specific display ID', required: false },
    { name: 'fromDt', type: 'string', description: 'Start date (YYYY-MM-DD)', required: true },
    { name: 'toDt', type: 'string', description: 'End date (YYYY-MM-DD)', required: true },
    { name: 'layoutId', type: 'number', description: 'Specific layout ID', required: false },
    { name: 'mediaId', type: 'number', description: 'Specific media ID', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {
      fromDt: params.fromDt,
      toDt: params.toDt,
      start: 0,
      length: 1000
    };
    if (params.displayId) queryParams.displayId = params.displayId;
    if (params.layoutId) queryParams.layoutId = params.layoutId;
    if (params.mediaId) queryParams.mediaId = params.mediaId;

    try {
      const response = await client.get('/stats/proofofplay', queryParams);
      const proofData = response.data.data || [];
      const total = response.data.recordsTotal || 0;
      
      let result = `📋 **Rapport de preuve de diffusion**\n\n`;
      result += `📅 **Période:** ${params.fromDt} → ${params.toDt}\n`;
      result += `📊 **Entrées trouvées:** ${proofData.length}/${total}\n\n`;
      
      if (proofData.length === 0) {
        result += '❌ Aucune donnée de diffusion trouvée pour cette période.\n\n';
        result += '💡 **Vérifications suggérées:**\n';
        result += '   - Les écrans étaient-ils en ligne pendant cette période?\n';
        result += '   - Le reporting est-il activé dans les paramètres des écrans?\n';
        result += '   - XMR est-il configuré et fonctionnel?\n';
        return result;
      }
      
      // Group by display
      const byDisplay = proofData.reduce((acc: any, item: any) => {
        const displayName = item.display || `Display ${item.displayId}`;
        if (!acc[displayName]) acc[displayName] = [];
        acc[displayName].push(item);
        return acc;
      }, {});
      
      Object.entries(byDisplay).forEach(([displayName, items]: [string, any]) => {
        result += `📺 **${displayName}:**\n\n`;
        
        items.forEach((item: any, index: number) => {
          const startTime = new Date(item.start).toLocaleString('fr-FR');
          const endTime = item.end ? new Date(item.end).toLocaleString('fr-FR') : 'En cours';
          const duration = item.duration ? `${Math.round(item.duration / 60)} min` : 'N/A';
          
          result += `   ${index + 1}. **${item.layout || item.media || 'Contenu inconnu'}**\n`;
          result += `      ⏰ Début: ${startTime}\n`;
          result += `      ⏱️  Fin: ${endTime}\n`;
          result += `      ⌛ Durée: ${duration}\n`;
          
          if (item.type) {
            result += `      🏷️  Type: ${item.type}\n`;
          }
          
          result += '\n';
        });
        
        result += '\n';
      });
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la génération du rapport: ${error.message}`;
    }
  }
};

const reportDisplayAvailability: ToolDefinition = {
  name: 'report_display_availability',
  description: 'Generate display availability report with uptime statistics',
  parameters: [
    { name: 'displayId', type: 'number', description: 'Specific display ID', required: false },
    { name: 'fromDt', type: 'string', description: 'Start date (YYYY-MM-DD)', required: true },
    { name: 'toDt', type: 'string', description: 'End date (YYYY-MM-DD)', required: true }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      // Get display list with last accessed info
      const displaysResponse = await client.get('/display', {
        start: 0,
        length: 1000,
        displayId: params.displayId
      });
      const displays = displaysResponse.data.data;
      
      let result = `📊 **Rapport de disponibilité des écrans**\n\n`;
      result += `📅 **Période:** ${params.fromDt} → ${params.toDt}\n\n`;
      
      if (displays.length === 0) {
        result += 'Aucun écran trouvé.\n';
        return result;
      }
      
      const now = new Date();
      const startDate = new Date(params.fromDt);
      const endDate = new Date(params.toDt);
      const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      result += `📈 **Résumé de disponibilité:**\n\n`;
      
      displays.forEach((display: any, index: number) => {
        const isOnline = display.loggedIn === 1;
        const lastAccessed = display.lastAccessed ? new Date(display.lastAccessed) : null;
        
        result += `**${index + 1}. ${display.display}** (ID: ${display.displayId})\n`;
        result += `   📍 Status actuel: ${isOnline ? '🟢 En ligne' : '🔴 Hors ligne'}\n`;
        
        if (lastAccessed) {
          const daysSinceAccess = Math.ceil((now.getTime() - lastAccessed.getTime()) / (1000 * 60 * 60 * 24));
          result += `   ⏰ Dernière connexion: ${lastAccessed.toLocaleString('fr-FR')}\n`;
          result += `   📊 Il y a: ${daysSinceAccess} jour(s)\n`;
          
          // Simple availability calculation based on last access
          let availabilityPercent = 0;
          if (daysSinceAccess <= 1) availabilityPercent = 95;
          else if (daysSinceAccess <= 3) availabilityPercent = 80;
          else if (daysSinceAccess <= 7) availabilityPercent = 60;
          else if (daysSinceAccess <= 30) availabilityPercent = 30;
          
          if (isOnline) availabilityPercent = Math.max(availabilityPercent, 90);
          
          const statusIcon = availabilityPercent >= 90 ? '🟢' : 
                           availabilityPercent >= 70 ? '🟡' : '🔴';
          
          result += `   ${statusIcon} Disponibilité estimée: ${availabilityPercent}%\n`;
        } else {
          result += `   ⚠️  Aucune donnée de connexion disponible\n`;
          result += `   🔴 Disponibilité estimée: 0%\n`;
        }
        
        if (display.clientAddress) {
          result += `   🌐 Adresse IP: ${display.clientAddress}\n`;
        }
        
        result += '\n';
      });
      
      // Calculate overall availability
      const onlineCount = displays.filter((d: any) => d.loggedIn === 1).length;
      const overallAvailability = Math.round((onlineCount / displays.length) * 100);
      const availabilityIcon = overallAvailability >= 90 ? '🟢' : 
                              overallAvailability >= 70 ? '🟡' : '🔴';
      
      result += `📊 **Disponibilité globale:**\n`;
      result += `   ${availabilityIcon} ${overallAvailability}% (${onlineCount}/${displays.length} écrans en ligne)\n`;
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la génération du rapport: ${error.message}`;
    }
  }
};

const reportMediaInventory: ToolDefinition = {
  name: 'report_media_inventory',
  description: 'Generate comprehensive media inventory report',
  parameters: [
    { name: 'type', type: 'string', description: 'Filter by media type', required: false },
    { name: 'folderId', type: 'number', description: 'Filter by folder', required: false },
    { name: 'tags', type: 'string', description: 'Filter by tags', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {
      start: 0,
      length: 1000
    };
    if (params.type) queryParams.type = params.type;
    if (params.folderId) queryParams.folderId = params.folderId;
    if (params.tags) queryParams.tags = params.tags;

    try {
      const response = await client.get('/library', queryParams);
      const mediaItems = response.data.data;
      const total = response.data.recordsTotal;
      
      let result = `📋 **Inventaire des médias**\n\n`;
      result += `📊 **Total:** ${mediaItems.length}/${total} éléments\n\n`;
      
      // Media type breakdown
      const typeStats = mediaItems.reduce((acc: any, media: any) => {
        const type = media.mediaType || 'unknown';
        acc[type] = {
          count: (acc[type]?.count || 0) + 1,
          size: (acc[type]?.size || 0) + (media.fileSize || 0)
        };
        return acc;
      }, {});
      
      result += `📈 **Répartition par type:**\n`;
      let totalSize = 0;
      
      Object.entries(typeStats).forEach(([type, stats]: [string, any]) => {
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        totalSize += stats.size;
        result += `   📄 ${type}: ${stats.count} fichiers (${sizeMB} MB)\n`;
      });
      
      const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
      const totalSizeGB = (totalSize / 1024 / 1024 / 1024).toFixed(2);
      
      result += `\n💾 **Espace total utilisé:** ${totalSizeMB} MB (${totalSizeGB} GB)\n\n`;
      
      // Recent uploads
      const recentMedia = mediaItems
        .sort((a: any, b: any) => new Date(b.createdDt).getTime() - new Date(a.createdDt).getTime())
        .slice(0, 10);
      
      result += `🕒 **10 médias les plus récents:**\n\n`;
      
      recentMedia.forEach((media: any, index: number) => {
        const sizeMB = ((media.fileSize || 0) / 1024 / 1024).toFixed(2);
        const createdDate = new Date(media.createdDt).toLocaleDateString('fr-FR');
        
        result += `**${index + 1}. ${media.name}**\n`;
        result += `   📄 Type: ${media.mediaType}\n`;
        result += `   💾 Taille: ${sizeMB} MB\n`;
        result += `   📅 Créé: ${createdDate}\n`;
        
        if (media.tags) {
          result += `   🏷️  Tags: ${media.tags}\n`;
        }
        
        result += '\n';
      });
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la génération de l'inventaire: ${error.message}`;
    }
  }
};

// ========== AUDIT TOOLS ==========

const auditlogSearch: ToolDefinition = {
  name: 'auditlog_search',
  description: 'Search and analyze audit log entries',
  parameters: [
    { name: 'fromDt', type: 'string', description: 'Start date (YYYY-MM-DD)', required: false },
    { name: 'toDt', type: 'string', description: 'End date (YYYY-MM-DD)', required: false },
    { name: 'userName', type: 'string', description: 'Filter by username', required: false },
    { name: 'entity', type: 'string', description: 'Entity type (Display, Layout, Media, etc.)', required: false },
    { name: 'message', type: 'string', description: 'Search in log messages', required: false },
    { name: 'length', type: 'number', description: 'Number of results (default 100)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {
      start: 0,
      length: params.length || 100
    };
    if (params.fromDt) queryParams.fromDt = params.fromDt;
    if (params.toDt) queryParams.toDt = params.toDt;
    if (params.userName) queryParams.userName = params.userName;
    if (params.entity) queryParams.entity = params.entity;
    if (params.message) queryParams.message = params.message;

    try {
      const response = await client.get('/auditlog', queryParams);
      const logEntries = response.data.data;
      const total = response.data.recordsTotal;
      
      let result = `🔍 **Recherche dans le journal d'audit**\n\n`;
      
      if (params.fromDt && params.toDt) {
        result += `📅 **Période:** ${params.fromDt} → ${params.toDt}\n`;
      }
      if (params.userName) {
        result += `👤 **Utilisateur:** ${params.userName}\n`;
      }
      if (params.entity) {
        result += `📁 **Type d'entité:** ${params.entity}\n`;
      }
      
      result += `📊 **Résultats:** ${logEntries.length}/${total} entrées\n\n`;
      
      if (logEntries.length === 0) {
        result += 'Aucune entrée trouvée pour les critères spécifiés.\n';
        return result;
      }
      
      logEntries.forEach((entry: any, index: number) => {
        const timestamp = new Date(entry.logDate).toLocaleString('fr-FR');
        
        result += `**${index + 1}.** ${timestamp}\n`;
        result += `   👤 Utilisateur: ${entry.userName || 'Système'}\n`;
        result += `   📁 Entité: ${entry.entity || 'N/A'}\n`;
        result += `   💬 Message: ${entry.message}\n`;
        
        if (entry.objectAfter) {
          result += `   🔄 Action: Modification\n`;
        }
        
        result += '\n';
      });
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la recherche dans l'audit: ${error.message}`;
    }
  }
};

const auditlogExport: ToolDefinition = {
  name: 'auditlog_export',
  description: 'Export audit log data for external analysis',
  parameters: [
    { name: 'fromDt', type: 'string', description: 'Start date (YYYY-MM-DD)', required: true },
    { name: 'toDt', type: 'string', description: 'End date (YYYY-MM-DD)', required: true },
    { name: 'format', type: 'string', description: 'Export format: csv, json', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {
      fromDt: params.fromDt,
      toDt: params.toDt,
      start: 0,
      length: 10000 // Export all entries in the period
    };

    try {
      const response = await client.get('/auditlog', queryParams);
      const logEntries = response.data.data;
      const total = response.data.recordsTotal;
      
      let result = `📤 **Export du journal d'audit**\n\n`;
      result += `📅 **Période:** ${params.fromDt} → ${params.toDt}\n`;
      result += `📊 **Entrées exportées:** ${logEntries.length}/${total}\n\n`;
      
      const format = params.format?.toLowerCase() || 'json';
      
      if (format === 'csv') {
        result += `📄 **Format CSV:**\n`;
        result += '```csv\n';
        result += 'Date,Utilisateur,Entité,ID Objet,Message\n';
        
        logEntries.forEach((entry: any) => {
          const date = new Date(entry.logDate).toISOString();
          const user = (entry.userName || 'Système').replace(/,/g, ';');
          const entity = (entry.entity || '').replace(/,/g, ';');
          const objectId = entry.objectId || '';
          const message = (entry.message || '').replace(/,/g, ';').replace(/\n/g, ' ');
          
          result += `"${date}","${user}","${entity}","${objectId}","${message}"\n`;
        });
        
        result += '```\n';
      } else {
        result += `📄 **Format JSON:**\n`;
        result += '```json\n';
        result += JSON.stringify({
          exportDate: new Date().toISOString(),
          period: { from: params.fromDt, to: params.toDt },
          totalEntries: logEntries.length,
          entries: logEntries.map((entry: any) => ({
            date: entry.logDate,
            user: entry.userName || 'Système',
            entity: entry.entity,
            objectId: entry.objectId,
            message: entry.message
          }))
        }, null, 2);
        result += '\n```\n';
      }
      
      result += `\n💡 **Conseil:** Copiez les données ci-dessus dans un fichier .${format} pour une analyse externe.\n`;
      
      return result;
    } catch (error: any) {
      return `Erreur lors de l'export: ${error.message}`;
    }
  }
};

export const statisticsTools: ToolDefinition[] = [
  statsDisplayUsage,
  statsMediaPerformance,
  statsCampaignAnalytics,
  statsBandwidth,
  reportProofOfPlay,
  reportDisplayAvailability,
  reportMediaInventory,
  auditlogSearch,
  auditlogExport
];