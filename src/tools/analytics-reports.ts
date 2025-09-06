/**
 * Analytics and Reporting tools for Xibo MCP Server
 * Complete data insights and performance monitoring
 * @author Xtranumerik Inc.
 */

import { ToolDefinition } from '../types.js';
import XiboClient from '../xibo-client.js';

// ========== REPORT GENERATION TOOLS ==========

const reportGenerate: ToolDefinition = {
  name: 'report_generate',
  description: 'Generate various types of reports with customizable parameters',
  parameters: [
    { name: 'reportType', type: 'string', description: 'Report type: proofofplay, summary, availability, bandwidth, usage', required: true },
    { name: 'fromDate', type: 'string', description: 'Start date (YYYY-MM-DD)', required: true },
    { name: 'toDate', type: 'string', description: 'End date (YYYY-MM-DD)', required: true },
    { name: 'displayIds', type: 'string', description: 'Comma-separated display IDs', required: false },
    { name: 'tags', type: 'string', description: 'Filter by tags (comma-separated)', required: false },
    { name: 'format', type: 'string', description: 'Output format: json, csv, excel, pdf', required: false, default: 'json' },
    { name: 'groupBy', type: 'string', description: 'Group by: day, week, month, display, layout', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const report = await client.generateReport({
        reportType: params.reportType,
        fromDate: params.fromDate,
        toDate: params.toDate,
        displayIds: params.displayIds,
        tags: params.tags,
        format: params.format || 'json',
        groupBy: params.groupBy
      });
      
      let result = `📊 **Rapport généré: ${params.reportType}**\n\n`;
      
      // Format the report based on type
      if (report.data) {
        result += `**Période:** ${params.fromDate} au ${params.toDate}\n`;
        if (params.displayIds) {
          result += `**Écrans:** ${params.displayIds}\n`;
        }
        if (params.tags) {
          result += `**Tags:** ${params.tags}\n`;
        }
        result += `**Format:** ${params.format}\n\n`;
        
        // Display report data summary
        if (Array.isArray(report.data)) {
          result += `**Résultats:** ${report.data.length} entrées\n\n`;
          
          // Show first few entries as examples
          report.data.slice(0, 5).forEach((entry: any, index: number) => {
            result += `**${index + 1}.** `;
            if (entry.displayName) result += `${entry.displayName} - `;
            if (entry.date) result += `${entry.date} - `;
            if (entry.duration) result += `Durée: ${entry.duration}s`;
            if (entry.plays) result += ` (${entry.plays} lectures)`;
            result += `\n`;
          });
          
          if (report.data.length > 5) {
            result += `\n... et ${report.data.length - 5} autres entrées`;
          }
        } else if (typeof report.data === 'object') {
          result += `**Données du rapport:**\n`;
          Object.keys(report.data).forEach(key => {
            result += `   ${key}: ${report.data[key]}\n`;
          });
        }
        
        result += `\n✅ **Rapport généré avec succès**`;
      } else {
        result += `⚠️ Aucune donnée disponible pour cette période`;
      }
      
      return result;
    } catch (error: any) {
      return `❌ Erreur lors de la génération du rapport: ${error.message}`;
    }
  }
};

const reportList: ToolDefinition = {
  name: 'report_list',
  description: 'List available reports and their status',
  parameters: [
    { name: 'limit', type: 'number', description: 'Maximum number of reports to return', required: false, default: 10 },
    { name: 'status', type: 'string', description: 'Filter by status: completed, pending, failed', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const reports = await client.listReports();
      
      let result = `📋 **Liste des rapports**\n\n`;
      
      if (reports.data && Array.isArray(reports.data)) {
        let filteredReports = reports.data;
        
        // Filter by status if specified
        if (params.status) {
          filteredReports = reports.data.filter((report: any) => 
            report.status === params.status
          );
        }
        
        // Limit results
        const limit = params.limit || 10;
        filteredReports = filteredReports.slice(0, limit);
        
        if (filteredReports.length === 0) {
          result += `Aucun rapport trouvé`;
          if (params.status) {
            result += ` avec le statut "${params.status}"`;
          }
        } else {
          result += `**Rapports (${filteredReports.length}):**\n\n`;
          
          filteredReports.forEach((report: any, index: number) => {
            const statusEmoji = report.status === 'completed' ? '✅' : 
                               report.status === 'pending' ? '⏳' : 
                               report.status === 'failed' ? '❌' : '📄';
            
            result += `**${index + 1}. ${report.name || `Rapport ${report.id}`}**\n`;
            result += `   Statut: ${statusEmoji} ${report.status || 'unknown'}\n`;
            if (report.type) result += `   Type: ${report.type}\n`;
            if (report.createdAt) result += `   Créé: ${report.createdAt}\n`;
            if (report.size) result += `   Taille: ${report.size}\n`;
            result += `\n`;
          });
        }
      } else {
        result += `Aucun rapport disponible`;
      }
      
      return result;
    } catch (error: any) {
      return `❌ Erreur lors de la récupération des rapports: ${error.message}`;
    }
  }
};

const reportSchedule: ToolDefinition = {
  name: 'report_schedule',
  description: 'Schedule automated report generation',
  parameters: [
    { name: 'reportType', type: 'string', description: 'Report type to schedule', required: true },
    { name: 'schedule', type: 'string', description: 'Schedule: daily, weekly, monthly', required: true },
    { name: 'recipients', type: 'string', description: 'Email recipients (comma-separated)', required: true },
    { name: 'format', type: 'string', description: 'Output format: json, csv, excel, pdf', required: false, default: 'pdf' },
    { name: 'enabled', type: 'boolean', description: 'Enable the scheduled report', required: false, default: true }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const schedule = await client.scheduleReport({
        reportType: params.reportType,
        schedule: params.schedule,
        recipients: params.recipients,
        format: params.format || 'pdf',
        enabled: params.enabled !== false
      });
      
      let result = `⏰ **Rapport programmé**\n\n`;
      
      result += `**Détails de la programmation:**\n`;
      result += `   Type de rapport: ${params.reportType}\n`;
      result += `   Fréquence: ${params.schedule}\n`;
      result += `   Destinataires: ${params.recipients}\n`;
      result += `   Format: ${params.format || 'pdf'}\n`;
      result += `   Statut: ${params.enabled !== false ? '✅ Activé' : '⏸️ Désactivé'}\n\n`;
      
      if (schedule.data && schedule.data.id) {
        result += `✅ **Programmation créée avec succès**\n`;
        result += `   ID: ${schedule.data.id}\n`;
        if (schedule.data.nextRun) {
          result += `   Prochaine exécution: ${schedule.data.nextRun}\n`;
        }
      }
      
      return result;
    } catch (error: any) {
      return `❌ Erreur lors de la programmation du rapport: ${error.message}`;
    }
  }
};

// ========== ANALYTICS DASHBOARD TOOLS ==========

const analyticsDashboard: ToolDefinition = {
  name: 'analytics_dashboard',
  description: 'Get comprehensive analytics dashboard data',
  parameters: [
    { name: 'period', type: 'string', description: 'Time period: today, week, month, year', required: false, default: 'week' },
    { name: 'metrics', type: 'string', description: 'Specific metrics (comma-separated): displays, layouts, media, bandwidth', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const dashboard = await client.getAnalyticsDashboard({
        period: params.period || 'week',
        metrics: params.metrics
      });
      
      let result = `📈 **Tableau de bord analytique**\n\n`;
      
      result += `**Période:** ${params.period || 'week'}\n\n`;
      
      if (dashboard.data) {
        // Display summary metrics
        if (dashboard.data.summary) {
          result += `**Résumé général:**\n`;
          Object.keys(dashboard.data.summary).forEach(key => {
            const value = dashboard.data.summary[key];
            result += `   ${key}: ${typeof value === 'number' ? value.toLocaleString() : value}\n`;
          });
          result += `\n`;
        }
        
        // Display specific metrics
        if (dashboard.data.displays) {
          result += `**Écrans:**\n`;
          result += `   Total: ${dashboard.data.displays.total || 0}\n`;
          result += `   Actifs: ${dashboard.data.displays.active || 0}\n`;
          result += `   En ligne: ${dashboard.data.displays.online || 0}\n\n`;
        }
        
        if (dashboard.data.content) {
          result += `**Contenu:**\n`;
          result += `   Layouts: ${dashboard.data.content.layouts || 0}\n`;
          result += `   Médias: ${dashboard.data.content.media || 0}\n`;
          result += `   Campagnes: ${dashboard.data.content.campaigns || 0}\n\n`;
        }
        
        if (dashboard.data.performance) {
          result += `**Performance:**\n`;
          result += `   Taux de disponibilité: ${dashboard.data.performance.uptime || 'N/A'}%\n`;
          result += `   Bande passante utilisée: ${dashboard.data.performance.bandwidth || 'N/A'}\n`;
          result += `   Temps de réponse moyen: ${dashboard.data.performance.responseTime || 'N/A'}ms\n\n`;
        }
        
        result += `✅ **Données récupérées avec succès**`;
      } else {
        result += `⚠️ Aucune donnée analytique disponible`;
      }
      
      return result;
    } catch (error: any) {
      return `❌ Erreur lors de la récupération du tableau de bord: ${error.message}`;
    }
  }
};

const performanceMetrics: ToolDefinition = {
  name: 'performance_metrics',
  description: 'Get detailed performance metrics and system statistics',
  parameters: [
    { name: 'timeframe', type: 'string', description: 'Time frame: hour, day, week, month', required: false, default: 'day' },
    { name: 'displayId', type: 'string', description: 'Specific display ID to analyze', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const metrics = await client.getPerformanceMetrics({
        timeframe: params.timeframe || 'day',
        displayId: params.displayId
      });
      
      let result = `⚡ **Métriques de performance**\n\n`;
      
      result += `**Période d'analyse:** ${params.timeframe || 'day'}\n`;
      if (params.displayId) {
        result += `**Écran ciblé:** ${params.displayId}\n`;
      }
      result += `\n`;
      
      if (metrics.data) {
        // System performance
        if (metrics.data.system) {
          result += `**Performance système:**\n`;
          if (metrics.data.system.cpu) result += `   CPU: ${metrics.data.system.cpu}%\n`;
          if (metrics.data.system.memory) result += `   Mémoire: ${metrics.data.system.memory}%\n`;
          if (metrics.data.system.disk) result += `   Disque: ${metrics.data.system.disk}%\n`;
          if (metrics.data.system.uptime) result += `   Uptime: ${metrics.data.system.uptime}\n`;
          result += `\n`;
        }
        
        // Network performance
        if (metrics.data.network) {
          result += `**Performance réseau:**\n`;
          if (metrics.data.network.bandwidth) result += `   Bande passante: ${metrics.data.network.bandwidth}\n`;
          if (metrics.data.network.latency) result += `   Latence: ${metrics.data.network.latency}ms\n`;
          if (metrics.data.network.errors) result += `   Erreurs: ${metrics.data.network.errors}\n`;
          result += `\n`;
        }
        
        // Display performance
        if (metrics.data.displays) {
          result += `**Performance des écrans:**\n`;
          if (Array.isArray(metrics.data.displays)) {
            metrics.data.displays.slice(0, 5).forEach((display: any) => {
              result += `   ${display.name || display.id}: `;
              result += `${display.status || 'unknown'} - `;
              result += `${display.uptime || 'N/A'} uptime\n`;
            });
          } else {
            Object.keys(metrics.data.displays).forEach(key => {
              result += `   ${key}: ${metrics.data.displays[key]}\n`;
            });
          }
          result += `\n`;
        }
        
        result += `✅ **Métriques collectées avec succès**`;
      } else {
        result += `⚠️ Aucune métrique de performance disponible`;
      }
      
      return result;
    } catch (error: any) {
      return `❌ Erreur lors de la récupération des métriques: ${error.message}`;
    }
  }
};

const usageStats: ToolDefinition = {
  name: 'usage_stats',
  description: 'Get detailed usage statistics and trends',
  parameters: [
    { name: 'period', type: 'string', description: 'Analysis period: day, week, month, quarter, year', required: false, default: 'month' },
    { name: 'category', type: 'string', description: 'Stats category: all, displays, content, users, bandwidth', required: false, default: 'all' }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const stats = await client.getUsageStats({
        period: params.period || 'month',
        category: params.category || 'all'
      });
      
      let result = `📊 **Statistiques d'utilisation**\n\n`;
      
      result += `**Période:** ${params.period || 'month'}\n`;
      result += `**Catégorie:** ${params.category || 'all'}\n\n`;
      
      if (stats.data) {
        // Usage trends
        if (stats.data.trends) {
          result += `**Tendances d'utilisation:**\n`;
          Object.keys(stats.data.trends).forEach(trend => {
            const value = stats.data.trends[trend];
            const emoji = typeof value === 'number' && value > 0 ? '📈' : 
                         typeof value === 'number' && value < 0 ? '📉' : '📊';
            result += `   ${emoji} ${trend}: ${value}\n`;
          });
          result += `\n`;
        }
        
        // Content statistics
        if (stats.data.content) {
          result += `**Statistiques de contenu:**\n`;
          if (stats.data.content.totalLayouts) result += `   Layouts totaux: ${stats.data.content.totalLayouts}\n`;
          if (stats.data.content.totalMedia) result += `   Médias totaux: ${stats.data.content.totalMedia}\n`;
          if (stats.data.content.mostUsed) {
            result += `   Plus utilisé: ${stats.data.content.mostUsed}\n`;
          }
          result += `\n`;
        }
        
        // User activity
        if (stats.data.users) {
          result += `**Activité utilisateur:**\n`;
          if (stats.data.users.activeUsers) result += `   Utilisateurs actifs: ${stats.data.users.activeUsers}\n`;
          if (stats.data.users.totalSessions) result += `   Sessions totales: ${stats.data.users.totalSessions}\n`;
          if (stats.data.users.averageSessionTime) result += `   Durée moyenne de session: ${stats.data.users.averageSessionTime}\n`;
          result += `\n`;
        }
        
        // Bandwidth usage
        if (stats.data.bandwidth) {
          result += `**Utilisation de la bande passante:**\n`;
          if (stats.data.bandwidth.total) result += `   Total utilisé: ${stats.data.bandwidth.total}\n`;
          if (stats.data.bandwidth.peak) result += `   Pic d'utilisation: ${stats.data.bandwidth.peak}\n`;
          if (stats.data.bandwidth.average) result += `   Moyenne: ${stats.data.bandwidth.average}\n`;
          result += `\n`;
        }
        
        result += `✅ **Statistiques calculées avec succès**`;
      } else {
        result += `⚠️ Aucune statistique d'utilisation disponible`;
      }
      
      return result;
    } catch (error: any) {
      return `❌ Erreur lors de la récupération des statistiques: ${error.message}`;
    }
  }
};

export const analyticsReportTools: ToolDefinition[] = [
  reportGenerate,
  reportList,
  reportSchedule,
  analyticsDashboard,
  performanceMetrics,
  usageStats
];