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
      const reportParams: any = {
        fromDt: params.fromDate,
        toDt: params.toDate,
        format: params.format
      };
      
      if (params.displayIds) {
        reportParams.displayId = params.displayIds.split(',').map((id: string) => parseInt(id.trim()));
      }
      if (params.tags) reportParams.tags = params.tags;
      if (params.groupBy) reportParams.groupBy = params.groupBy;
      
      const report = await client.generateReport(params.reportType, reportParams);
      
      let result = `📊 **Rapport généré: ${params.reportType}**\n\n`;
      result += `**Période:** ${params.fromDate} → ${params.toDate}\n`;
      result += `**Format:** ${params.format.toUpperCase()}\n`;
      
      if (params.displayIds) result += `**Écrans:** ${params.displayIds}\n`;
      if (params.tags) result += `**Tags:** ${params.tags}\n`;
      if (params.groupBy) result += `**Groupé par:** ${params.groupBy}\n`;
      
      result += `\n**Résultats:**\n`;
      
      // Process report data based on type
      switch (params.reportType) {
        case 'proofofplay':
          if (report.data.data) {
            result += `   Diffusions: ${report.data.data.length}\n`;
            result += `   Durée totale: ${Math.round(report.data.data.reduce((sum: number, item: any) => sum + (item.duration || 0), 0) / 60)} minutes\n`;
          }
          break;
          
        case 'summary':
          if (report.data.summary) {
            result += `   Écrans actifs: ${report.data.summary.activeDisplays || 0}\n`;
            result += `   Layouts diffusés: ${report.data.summary.layoutsPlayed || 0}\n`;
            result += `   Temps d'affichage total: ${report.data.summary.totalDuration || 0}h\n`;
          }
          break;
          
        case 'availability':
          if (report.data.data) {
            const avgAvailability = report.data.data.reduce((sum: number, item: any) => sum + (item.availability || 0), 0) / report.data.data.length;
            result += `   Disponibilité moyenne: ${avgAvailability.toFixed(2)}%\n`;
            result += `   Écrans analysés: ${report.data.data.length}\n`;
          }
          break;
          
        case 'bandwidth':
          if (report.data.data) {
            const totalBandwidth = report.data.data.reduce((sum: number, item: any) => sum + (item.bytesDownloaded || 0), 0);
            result += `   Bande passante totale: ${(totalBandwidth / 1024 / 1024).toFixed(2)} MB\n`;
            result += `   Écrans surveillés: ${report.data.data.length}\n`;
          }
          break;
      }
      
      if (report.data.reportId) {
        result += `\n**ID du rapport:** ${report.data.reportId}\n`;
        result += `**Statut:** ${report.data.status || 'Généré'}\n`;
      }
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la génération du rapport: ${error.message}`;
    }
  }
};

const reportList: ToolDefinition = {
  name: 'report_list',
  description: 'List available reports and report templates',
  parameters: [
    { name: 'category', type: 'string', description: 'Filter by category: system, display, content, usage', required: false },
    { name: 'includeScheduled', type: 'boolean', description: 'Include scheduled reports', required: false, default: true }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const reports = await client.listReports();
      
      let result = `📋 **Rapports disponibles (${reports.data.length})**\n\n`;
      
      // Group reports by category
      const reportsByCategory: any = {};
      reports.data.forEach((report: any) => {
        const category = report.reportCategory || 'general';
        if (!reportsByCategory[category]) reportsByCategory[category] = [];
        reportsByCategory[category].push(report);
      });
      
      // Filter by category if specified
      const categoriesToShow = params.category ? 
        { [params.category]: reportsByCategory[params.category] || [] } : 
        reportsByCategory;
      
      Object.entries(categoriesToShow).forEach(([category, categoryReports]: [string, any]) => {
        if (categoryReports.length === 0) return;
        
        const categoryIcon = {
          'system': '⚙️',
          'display': '📺',
          'content': '📄',
          'usage': '📊'
        }[category] || '📋';
        
        result += `${categoryIcon} **${category.toUpperCase()} (${categoryReports.length})**\n`;
        
        categoryReports.forEach((report: any, index: number) => {
          result += `   ${index + 1}. **${report.reportName}**\n`;
          result += `      ID: ${report.reportId}\n`;
          if (report.description) result += `      Description: ${report.description}\n`;
          if (report.createdDt) result += `      Créé: ${report.createdDt}\n`;
          
          // Check if this report has scheduled executions
          if (params.includeScheduled && report.reportSchedule) {
            result += `      📅 Planifié: ${report.reportSchedule.isActive ? 'Actif' : 'Inactif'}\n`;
            if (report.reportSchedule.lastRunDt) {
              result += `      ⏰ Dernière exécution: ${report.reportSchedule.lastRunDt}\n`;
            }
          }
          result += `\n`;
        });
      });
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des rapports: ${error.message}`;
    }
  }
};

const reportSchedule: ToolDefinition = {
  name: 'report_schedule',
  description: 'Schedule automatic report generation',
  parameters: [
    { name: 'reportId', type: 'number', description: 'Report ID to schedule', required: true },
    { name: 'scheduleName', type: 'string', description: 'Schedule name', required: true },
    { name: 'frequency', type: 'string', description: 'Frequency: daily, weekly, monthly', required: true },
    { name: 'time', type: 'string', description: 'Time to run (HH:MM)', required: true },
    { name: 'recipients', type: 'string', description: 'Email recipients (comma-separated)', required: false },
    { name: 'format', type: 'string', description: 'Report format: pdf, excel, csv', required: false, default: 'pdf' },
    { name: 'active', type: 'boolean', description: 'Schedule active', required: false, default: true }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const scheduleData = {
        name: params.scheduleName,
        reportId: params.reportId,
        schedule: params.frequency,
        hour: parseInt(params.time.split(':')[0]),
        minute: parseInt(params.time.split(':')[1]),
        isActive: params.active,
        format: params.format,
        filterCriteria: {
          recipients: params.recipients?.split(',').map((email: string) => email.trim())
        }
      };
      
      await client.scheduleReport(params.reportId, scheduleData);
      
      let result = `📅 **Rapport planifié avec succès**\n\n`;
      result += `**Nom:** ${params.scheduleName}\n`;
      result += `**Rapport:** ID ${params.reportId}\n`;
      result += `**Fréquence:** ${params.frequency}\n`;
      result += `**Heure:** ${params.time}\n`;
      result += `**Format:** ${params.format}\n`;
      result += `**Actif:** ${params.active ? 'Oui' : 'Non'}\n`;
      
      if (params.recipients) {
        result += `**Destinataires:** ${params.recipients}\n`;
      }
      
      result += `\n💡 Le rapport sera automatiquement généré et envoyé selon le planning défini.`;
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la planification du rapport: ${error.message}`;
    }
  }
};

// ========== ANALYTICS DASHBOARD TOOLS ==========

const analyticsDashboard: ToolDefinition = {
  name: 'analytics_dashboard',
  description: 'Get comprehensive analytics dashboard data',
  parameters: [
    { name: 'timeframe', type: 'string', description: 'Timeframe: today, week, month, quarter, year', required: false, default: 'week' },
    { name: 'includeCharts', type: 'boolean', description: 'Include chart data', required: false, default: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const dashboardData = await client.getAnalyticsDashboard(params.timeframe);
      
      let result = `📊 **Tableau de bord analytique**\n\n`;
      result += `📅 **Période:** ${params.timeframe}\n\n`;
      
      // Key metrics
      if (dashboardData.data.metrics) {
        const metrics = dashboardData.data.metrics;
        result += `**📈 Métriques clés:**\n`;
        
        if (metrics.totalDisplays) result += `   📺 Écrans totaux: ${metrics.totalDisplays}\n`;
        if (metrics.activeDisplays) result += `   🟢 Écrans actifs: ${metrics.activeDisplays}\n`;
        if (metrics.totalLayouts) result += `   📄 Layouts totaux: ${metrics.totalLayouts}\n`;
        if (metrics.totalMedia) result += `   🎬 Médias totaux: ${metrics.totalMedia}\n`;
        if (metrics.totalCampaigns) result += `   🎯 Campagnes totales: ${metrics.totalCampaigns}\n`;
        
        // Performance metrics
        if (metrics.averageUptime) result += `   ⏰ Uptime moyen: ${metrics.averageUptime}%\n`;
        if (metrics.totalImpressions) result += `   👀 Impressions: ${metrics.totalImpressions.toLocaleString()}\n`;
        if (metrics.totalPlayTime) result += `   ▶️ Temps de diffusion: ${Math.round(metrics.totalPlayTime / 3600)}h\n`;
        
        result += `\n`;
      }
      
      // Top performing content
      if (dashboardData.data.topContent) {
        result += `**🏆 Contenu le plus diffusé:**\n`;
        dashboardData.data.topContent.slice(0, 5).forEach((content: any, index: number) => {
          result += `   ${index + 1}. ${content.name} (${content.plays} diffusions)\n`;
        });
        result += `\n`;
      }
      
      // Display status summary
      if (dashboardData.data.displayStatus) {
        const status = dashboardData.data.displayStatus;
        result += `**📺 État des écrans:**\n`;
        result += `   🟢 En ligne: ${status.online || 0}\n`;
        result += `   🔴 Hors ligne: ${status.offline || 0}\n`;
        result += `   🟡 Attention: ${status.warning || 0}\n\n`;
      }
      
      // Bandwidth usage
      if (dashboardData.data.bandwidth) {
        const bandwidth = dashboardData.data.bandwidth;
        result += `**🌐 Utilisation bande passante:**\n`;
        result += `   📥 Téléchargé: ${(bandwidth.downloaded / 1024 / 1024).toFixed(2)} MB\n`;
        result += `   📊 Pic d'utilisation: ${bandwidth.peak || 'N/A'}\n\n`;
      }
      
      // Recent activity
      if (dashboardData.data.recentActivity) {
        result += `**🔔 Activité récente:**\n`;
        dashboardData.data.recentActivity.slice(0, 3).forEach((activity: any) => {
          result += `   • ${activity.message} (${activity.time})\n`;
        });
      }
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération du tableau de bord: ${error.message}`;
    }
  }
};

// ========== PERFORMANCE MONITORING TOOLS ==========

const performanceMetrics: ToolDefinition = {
  name: 'performance_metrics',
  description: 'Get detailed performance metrics and monitoring data',
  parameters: [
    { name: 'metric', type: 'string', description: 'Metric type: system, display, bandwidth, storage, response_time', required: true },
    { name: 'period', type: 'string', description: 'Time period: hour, day, week, month', required: false, default: 'day' },
    { name: 'displayId', type: 'number', description: 'Specific display ID', required: false },
    { name: 'aggregation', type: 'string', description: 'Data aggregation: avg, max, min, sum', required: false, default: 'avg' }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const metricsParams: any = {
        period: params.period,
        aggregation: params.aggregation
      };
      
      if (params.displayId) {
        metricsParams.displayId = params.displayId;
      }
      
      const metrics = await client.getPerformanceMetrics(params.metric, metricsParams);
      
      let result = `📈 **Métriques de performance: ${params.metric}**\n\n`;
      result += `**Période:** ${params.period}\n`;
      result += `**Agrégation:** ${params.aggregation}\n`;
      if (params.displayId) result += `**Écran:** ${params.displayId}\n`;
      result += `\n`;
      
      // Process different metric types
      switch (params.metric) {
        case 'system':
          if (metrics.data.cpu) result += `🖥️ **CPU:** ${metrics.data.cpu.toFixed(2)}%\n`;
          if (metrics.data.memory) result += `💾 **Mémoire:** ${metrics.data.memory.toFixed(2)}%\n`;
          if (metrics.data.disk) result += `💽 **Disque:** ${metrics.data.disk.toFixed(2)}%\n`;
          if (metrics.data.load) result += `⚡ **Charge:** ${metrics.data.load.toFixed(2)}\n`;
          break;
          
        case 'display':
          result += `📺 **Métriques d'affichage:**\n`;
          if (metrics.data.uptime) result += `   ⏰ Uptime: ${metrics.data.uptime.toFixed(2)}%\n`;
          if (metrics.data.responseTime) result += `   🕐 Temps de réponse: ${metrics.data.responseTime}ms\n`;
          if (metrics.data.errorRate) result += `   ❌ Taux d'erreur: ${metrics.data.errorRate.toFixed(2)}%\n`;
          if (metrics.data.contentChanges) result += `   🔄 Changements de contenu: ${metrics.data.contentChanges}\n`;
          break;
          
        case 'bandwidth':
          result += `🌐 **Utilisation bande passante:**\n`;
          if (metrics.data.download) result += `   📥 Download: ${(metrics.data.download / 1024).toFixed(2)} KB/s\n`;
          if (metrics.data.upload) result += `   📤 Upload: ${(metrics.data.upload / 1024).toFixed(2)} KB/s\n`;
          if (metrics.data.total) result += `   📊 Total: ${(metrics.data.total / 1024 / 1024).toFixed(2)} MB\n`;
          break;
          
        case 'storage':
          result += `💽 **Utilisation stockage:**\n`;
          if (metrics.data.used) result += `   📁 Utilisé: ${(metrics.data.used / 1024 / 1024).toFixed(2)} MB\n`;
          if (metrics.data.available) result += `   🆓 Disponible: ${(metrics.data.available / 1024 / 1024).toFixed(2)} MB\n`;
          if (metrics.data.percentage) result += `   📊 Pourcentage: ${metrics.data.percentage.toFixed(2)}%\n`;
          break;
          
        case 'response_time':
          result += `🕐 **Temps de réponse API:**\n`;
          if (metrics.data.average) result += `   📊 Moyenne: ${metrics.data.average}ms\n`;
          if (metrics.data.p95) result += `   📈 95e percentile: ${metrics.data.p95}ms\n`;
          if (metrics.data.max) result += `   🔺 Maximum: ${metrics.data.max}ms\n`;
          break;
      }
      
      // Trend information
      if (metrics.data.trend) {
        const trendIcon = metrics.data.trend > 0 ? '📈' : metrics.data.trend < 0 ? '📉' : '➡️';
        result += `\n${trendIcon} **Tendance:** ${metrics.data.trend > 0 ? '+' : ''}${metrics.data.trend.toFixed(2)}%\n`;
      }
      
      // Historical data points
      if (metrics.data.dataPoints && metrics.data.dataPoints.length > 0) {
        result += `\n**Points de données récents:**\n`;
        metrics.data.dataPoints.slice(-5).forEach((point: any) => {
          result += `   ${point.timestamp}: ${point.value}\n`;
        });
      }
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des métriques: ${error.message}`;
    }
  }
};

// ========== USAGE STATISTICS TOOLS ==========

const usageStatistics: ToolDefinition = {
  name: 'usage_statistics',
  description: 'Get comprehensive usage statistics and trends',
  parameters: [
    { name: 'type', type: 'string', description: 'Statistics type: general, content, displays, users, api', required: true },
    { name: 'fromDate', type: 'string', description: 'Start date (YYYY-MM-DD)', required: false },
    { name: 'toDate', type: 'string', description: 'End date (YYYY-MM-DD)', required: false },
    { name: 'groupBy', type: 'string', description: 'Group by: day, week, month', required: false, default: 'day' }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const statsParams: any = {
        type: params.type,
        groupBy: params.groupBy
      };
      
      if (params.fromDate) statsParams.fromDt = params.fromDate;
      if (params.toDate) statsParams.toDt = params.toDate;
      
      const stats = await client.getUsageStats(statsParams);
      
      let result = `📊 **Statistiques d'utilisation: ${params.type}**\n\n`;
      
      if (params.fromDate && params.toDate) {
        result += `**Période:** ${params.fromDate} → ${params.toDate}\n`;
      }
      result += `**Groupé par:** ${params.groupBy}\n\n`;
      
      // Process different statistics types
      switch (params.type) {
        case 'general':
          if (stats.data.summary) {
            const summary = stats.data.summary;
            result += `**📈 Résumé général:**\n`;
            result += `   👥 Utilisateurs actifs: ${summary.activeUsers || 0}\n`;
            result += `   📺 Écrans actifs: ${summary.activeDisplays || 0}\n`;
            result += `   📄 Layouts utilisés: ${summary.layoutsUsed || 0}\n`;
            result += `   🎬 Médias diffusés: ${summary.mediaPlayed || 0}\n`;
            result += `   🔗 Connexions API: ${summary.apiCalls || 0}\n\n`;
          }
          break;
          
        case 'content':
          if (stats.data.contentStats) {
            result += `**📄 Statistiques de contenu:**\n`;
            result += `   🎯 Campagnes actives: ${stats.data.contentStats.activeCampaigns}\n`;
            result += `   📄 Layouts diffusés: ${stats.data.contentStats.layoutsPlayed}\n`;
            result += `   ⏱️ Temps total de diffusion: ${Math.round(stats.data.contentStats.totalPlayTime / 3600)}h\n`;
            result += `   👀 Impressions totales: ${stats.data.contentStats.totalImpressions?.toLocaleString()}\n\n`;
          }
          
          if (stats.data.topContent) {
            result += `**🏆 Contenu le plus populaire:**\n`;
            stats.data.topContent.slice(0, 5).forEach((content: any, index: number) => {
              result += `   ${index + 1}. ${content.name} (${content.plays} diffusions)\n`;
            });
            result += `\n`;
          }
          break;
          
        case 'displays':
          if (stats.data.displayStats) {
            result += `**📺 Statistiques des écrans:**\n`;
            result += `   🟢 En ligne: ${stats.data.displayStats.online}\n`;
            result += `   🔴 Hors ligne: ${stats.data.displayStats.offline}\n`;
            result += `   ⏰ Uptime moyen: ${stats.data.displayStats.averageUptime}%\n`;
            result += `   🔄 Synchronisations: ${stats.data.displayStats.syncs}\n\n`;
          }
          break;
          
        case 'users':
          if (stats.data.userStats) {
            result += `**👥 Statistiques des utilisateurs:**\n`;
            result += `   👤 Utilisateurs actifs: ${stats.data.userStats.activeUsers}\n`;
            result += `   🔑 Connexions: ${stats.data.userStats.logins}\n`;
            result += `   📝 Actions: ${stats.data.userStats.actions}\n`;
            result += `   ⏰ Session moyenne: ${stats.data.userStats.averageSessionTime}min\n\n`;
          }
          break;
          
        case 'api':
          if (stats.data.apiStats) {
            result += `**🔗 Statistiques API:**\n`;
            result += `   📞 Appels totaux: ${stats.data.apiStats.totalCalls.toLocaleString()}\n`;
            result += `   ✅ Succès: ${stats.data.apiStats.successRate}%\n`;
            result += `   🕐 Temps de réponse moyen: ${stats.data.apiStats.averageResponseTime}ms\n`;
            result += `   🚫 Erreurs: ${stats.data.apiStats.errorCount}\n\n`;
          }
          break;
      }
      
      // Trend data
      if (stats.data.trends) {
        result += `**📈 Tendances:**\n`;
        Object.entries(stats.data.trends).forEach(([key, value]: [string, any]) => {
          const trendIcon = value > 0 ? '📈' : value < 0 ? '📉' : '➡️';
          result += `   ${trendIcon} ${key}: ${value > 0 ? '+' : ''}${value}%\n`;
        });
      }
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des statistiques: ${error.message}`;
    }
  }
};

// ========== ADVANCED ANALYTICS TOOLS ==========

const proofOfPlay: ToolDefinition = {
  name: 'proof_of_play',
  description: 'Generate detailed proof of play reports',
  parameters: [
    { name: 'fromDate', type: 'string', description: 'Start date (YYYY-MM-DD)', required: true },
    { name: 'toDate', type: 'string', description: 'End date (YYYY-MM-DD)', required: true },
    { name: 'displayIds', type: 'string', description: 'Comma-separated display IDs', required: false },
    { name: 'layoutIds', type: 'string', description: 'Comma-separated layout IDs', required: false },
    { name: 'mediaIds', type: 'string', description: 'Comma-separated media IDs', required: false },
    { name: 'detailed', type: 'boolean', description: 'Include detailed timing data', required: false, default: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const reportParams: any = {
        fromDt: params.fromDate,
        toDt: params.toDate,
        reportType: 'proofofplay'
      };
      
      if (params.displayIds) reportParams.displayId = params.displayIds.split(',').map((id: string) => parseInt(id.trim()));
      if (params.layoutIds) reportParams.layoutId = params.layoutIds.split(',').map((id: string) => parseInt(id.trim()));
      if (params.mediaIds) reportParams.mediaId = params.mediaIds.split(',').map((id: string) => parseInt(id.trim()));
      
      const report = await client.generateReport('proofofplay', reportParams);
      
      let result = `📊 **Rapport de diffusion (Proof of Play)**\n\n`;
      result += `**Période:** ${params.fromDate} → ${params.toDate}\n`;
      
      if (params.displayIds) result += `**Écrans:** ${params.displayIds}\n`;
      if (params.layoutIds) result += `**Layouts:** ${params.layoutIds}\n`;
      if (params.mediaIds) result += `**Médias:** ${params.mediaIds}\n`;
      
      if (report.data.data) {
        const plays = report.data.data;
        result += `\n**📈 Statistiques:**\n`;
        result += `   🎬 Diffusions totales: ${plays.length}\n`;
        
        // Calculate total duration
        const totalDuration = plays.reduce((sum: number, play: any) => sum + (play.duration || 0), 0);
        result += `   ⏱️ Durée totale: ${Math.round(totalDuration / 60)} minutes\n`;
        
        // Count unique displays
        const uniqueDisplays = [...new Set(plays.map((play: any) => play.displayId))];
        result += `   📺 Écrans utilisés: ${uniqueDisplays.length}\n`;
        
        // Count unique layouts
        const uniqueLayouts = [...new Set(plays.map((play: any) => play.layoutId))];
        result += `   📄 Layouts diffusés: ${uniqueLayouts.length}\n\n`;
        
        if (params.detailed) {
          result += `**📋 Détail des diffusions:**\n`;
          plays.slice(0, 10).forEach((play: any, index: number) => {
            result += `   ${index + 1}. ${play.layoutName || `Layout ${play.layoutId}`}\n`;
            result += `      📺 Écran: ${play.displayName || play.displayId}\n`;
            result += `      🕐 Début: ${play.startTime}\n`;
            result += `      🕕 Fin: ${play.endTime}\n`;
            result += `      ⏱️ Durée: ${play.duration}s\n\n`;
          });
          
          if (plays.length > 10) {
            result += `   ... et ${plays.length - 10} autres diffusions\n`;
          }
        }
      }
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la génération du rapport de diffusion: ${error.message}`;
    }
  }
};

export const analyticsReportTools: ToolDefinition[] = [
  reportGenerate,
  reportList,
  reportSchedule,
  analyticsDashboard,
  performanceMetrics,
  usageStatistics,
  proofOfPlay
];