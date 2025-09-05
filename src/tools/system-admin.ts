/**
 * System Administration tools for Xibo MCP Server
 * Complete system management and maintenance capabilities
 * @author Xtranumerik Inc.
 */

import { ToolDefinition } from '../types.js';
import XiboClient from '../xibo-client.js';

// ========== SYSTEM INFORMATION TOOLS ==========

const systemInfo: ToolDefinition = {
  name: 'system_info',
  description: 'Get comprehensive system information and version details',
  parameters: [
    { name: 'detailed', type: 'boolean', description: 'Include detailed system stats', required: false, default: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const systemData = await client.getSystemInfo();
      const healthData = await client.healthCheck();
      const versionData = await client.getApiVersion();
      
      let result = `🖥️ **Informations système Xibo**\n\n`;
      
      // Basic system info
      result += `**Version et build:**\n`;
      result += `   Version CMS: ${systemData.data.version || 'N/A'}\n`;
      result += `   Version DB: ${systemData.data.dbVersion || 'N/A'}\n`;
      result += `   Version API: ${versionData.data.version || 'N/A'}\n`;
      result += `   Environnement: ${systemData.data.environment || 'N/A'}\n\n`;
      
      // System status
      result += `**Statut du système:**\n`;
      result += `   État: ${healthData.data.status || 'Unknown'}\n`;
      result += `   Bibliothèque: ${systemData.data.libraryLocation || 'N/A'}\n`;
      result += `   Fuseau horaire: ${systemData.data.timeZone || 'N/A'}\n`;
      result += `   Thème: ${systemData.data.theme || 'Default'}\n\n`;
      
      // Features and licensing
      if (systemData.data.features) {
        result += `**Fonctionnalités disponibles:**\n`;
        systemData.data.features.forEach((feature: string) => {
          result += `   ✅ ${feature}\n`;
        });
        result += `\n`;
      }
      
      if (systemData.data.isTrial !== undefined) {
        result += `**Licence:**\n`;
        result += `   Type: ${systemData.data.isTrial ? 'Version d\'essai' : 'Licence complète'}\n`;
        if (systemData.data.productName) {
          result += `   Produit: ${systemData.data.productName}\n`;
        }
        result += `\n`;
      }
      
      if (params.detailed) {
        // Additional system stats
        try {
          const tasks = await client.getSystemTasks();
          result += `**Tâches système:**\n`;
          result += `   Tâches actives: ${tasks.data.filter((t: any) => t.status === 'running').length}\n`;
          result += `   Tâches en attente: ${tasks.data.filter((t: any) => t.status === 'pending').length}\n`;
          result += `   Total: ${tasks.data.length}\n\n`;
        } catch (error) {
          result += `**Tâches système:** Non disponibles\n\n`;
        }
      }
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des informations système: ${error.message}`;
    }
  }
};

const systemSettings: ToolDefinition = {
  name: 'system_settings',
  description: 'View and manage system configuration settings',
  parameters: [
    { name: 'action', type: 'string', description: 'Action: get, set', required: true },
    { name: 'setting', type: 'string', description: 'Setting name to get/set', required: false },
    { name: 'value', type: 'string', description: 'New value for setting (when action=set)', required: false },
    { name: 'category', type: 'string', description: 'Filter by category', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      if (params.action === 'get') {
        const settings = await client.getSystemSettings();
        
        let result = `⚙️ **Paramètres système**\n\n`;
        
        if (params.setting) {
          // Get specific setting
          const settingValue = settings.data[params.setting];
          if (settingValue !== undefined) {
            result += `**${params.setting}:** ${settingValue}\n`;
          } else {
            result += `❌ Paramètre "${params.setting}" non trouvé.\n`;
          }
        } else {
          // List all settings or by category
          const settingsToShow = Object.entries(settings.data);
          
          if (params.category) {
            result += `**Catégorie: ${params.category}**\n`;
          }
          
          let count = 0;
          settingsToShow.forEach(([key, value]: [string, any]) => {
            if (!params.category || key.toLowerCase().includes(params.category.toLowerCase())) {
              result += `   **${key}:** ${value}\n`;
              count++;
            }
          });
          
          result += `\n📊 **${count} paramètres affichés**\n`;
        }
        
        return result;
        
      } else if (params.action === 'set') {
        if (!params.setting || params.value === undefined) {
          return '❌ Les paramètres "setting" et "value" sont requis pour action=set';
        }
        
        const updateData = { [params.setting]: params.value };
        await client.updateSystemSettings(updateData);
        
        return `✅ Paramètre "${params.setting}" mis à jour avec la valeur: ${params.value}`;
        
      } else {
        return '❌ Action invalide. Utilisez "get" ou "set"';
      }
    } catch (error: any) {
      return `Erreur lors de la gestion des paramètres: ${error.message}`;
    }
  }
};

// ========== MAINTENANCE MODE TOOLS ==========

const maintenanceMode: ToolDefinition = {
  name: 'maintenance_mode',
  description: 'Control system maintenance mode',
  parameters: [
    { name: 'action', type: 'string', description: 'Action: status, enable, disable', required: true },
    { name: 'message', type: 'string', description: 'Maintenance message for users', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      if (params.action === 'status') {
        const status = await client.getMaintenanceStatus();
        
        let result = `🔧 **Mode maintenance**\n\n`;
        result += `**Statut:** ${status.data.enabled ? '🟡 Activé' : '🟢 Désactivé'}\n`;
        
        if (status.data.enabled && status.data.message) {
          result += `**Message:** ${status.data.message}\n`;
        }
        
        if (status.data.enabledAt) {
          result += `**Activé le:** ${status.data.enabledAt}\n`;
        }
        
        return result;
        
      } else if (params.action === 'enable') {
        await client.enableMaintenanceMode(params.message);
        
        let result = `🟡 **Mode maintenance activé**\n\n`;
        if (params.message) {
          result += `**Message:** ${params.message}\n`;
        }
        result += `⚠️ Le système est maintenant en maintenance.\n`;
        result += `Les utilisateurs verront un message de maintenance.\n`;
        
        return result;
        
      } else if (params.action === 'disable') {
        await client.disableMaintenanceMode();
        
        return `🟢 **Mode maintenance désactivé**\n\nLe système est de nouveau accessible aux utilisateurs.`;
        
      } else {
        return '❌ Action invalide. Utilisez: status, enable, disable';
      }
    } catch (error: any) {
      return `Erreur lors de la gestion du mode maintenance: ${error.message}`;
    }
  }
};

// ========== LOG MANAGEMENT TOOLS ==========

const systemLogs: ToolDefinition = {
  name: 'system_logs',
  description: 'View and manage system logs',
  parameters: [
    { name: 'action', type: 'string', description: 'Action: view, clear', required: true },
    { name: 'level', type: 'string', description: 'Log level filter: error, warning, info, debug', required: false },
    { name: 'limit', type: 'number', description: 'Maximum number of log entries', required: false, default: 50 },
    { name: 'since', type: 'string', description: 'Show logs since date (YYYY-MM-DD)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      if (params.action === 'view') {
        const queryParams: any = {
          start: 0,
          length: params.limit || 50
        };
        
        if (params.level) queryParams.level = params.level;
        if (params.since) queryParams.fromDt = params.since;
        
        const logs = await client.getSystemLogs(queryParams);
        
        let result = `📋 **Logs système (${logs.data.length})**\n\n`;
        
        if (params.level) {
          result += `🔍 **Filtre:** Niveau ${params.level}\n`;
        }
        if (params.since) {
          result += `📅 **Depuis:** ${params.since}\n`;
        }
        result += `\n`;
        
        logs.data.forEach((log: any, index: number) => {
          const levelIcons: Record<string, string> = {
            'error': '🔴',
            'warning': '🟡',
            'info': '🔵',
            'debug': '⚪'
          };
          const levelIcon = levelIcons[log.type] || '📄';
          
          result += `${levelIcon} **${index + 1}.** [${log.logDate}] ${log.channel || 'System'}\n`;
          result += `   📝 ${log.message}\n`;
          if (log.displayId) result += `   📺 Écran: ${log.displayId}\n`;
          result += `\n`;
        });
        
        return result;
        
      } else if (params.action === 'clear') {
        await client.clearSystemLogs();
        return `🗑️ **Logs système supprimés**\n\nTous les logs système ont été effacés.`;
        
      } else {
        return '❌ Action invalide. Utilisez: view, clear';
      }
    } catch (error: any) {
      return `Erreur lors de la gestion des logs: ${error.message}`;
    }
  }
};

// ========== TASK MANAGEMENT TOOLS ==========

const systemTasks: ToolDefinition = {
  name: 'system_tasks',
  description: 'Manage and monitor system tasks',
  parameters: [
    { name: 'action', type: 'string', description: 'Action: list, run, status', required: true },
    { name: 'taskName', type: 'string', description: 'Task name to run', required: false },
    { name: 'status', type: 'string', description: 'Filter by status: pending, running, completed, failed', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      if (params.action === 'list' || params.action === 'status') {
        const tasks = await client.getSystemTasks();
        
        let result = `⚙️ **Tâches système**\n\n`;
        
        // Filter tasks if status provided
        let filteredTasks = tasks.data;
        if (params.status) {
          filteredTasks = tasks.data.filter((task: any) => task.status === params.status);
          result += `🔍 **Filtre:** ${params.status}\n\n`;
        }
        
        // Summary
        const statusCounts = {
          pending: tasks.data.filter((t: any) => t.status === 'pending').length,
          running: tasks.data.filter((t: any) => t.status === 'running').length,
          completed: tasks.data.filter((t: any) => t.status === 'completed').length,
          failed: tasks.data.filter((t: any) => t.status === 'failed').length
        };
        
        result += `📊 **Résumé:**\n`;
        result += `   🟡 En attente: ${statusCounts.pending}\n`;
        result += `   🔵 En cours: ${statusCounts.running}\n`;
        result += `   🟢 Terminées: ${statusCounts.completed}\n`;
        result += `   🔴 Échouées: ${statusCounts.failed}\n\n`;
        
        // Task details
        filteredTasks.forEach((task: any, index: number) => {
          const statusIcons: Record<string, string> = {
            'pending': '🟡',
            'running': '🔵',
            'completed': '🟢',
            'failed': '🔴'
          };
          const statusIcon = statusIcons[task.status] || '⚪';
          
          result += `${statusIcon} **${index + 1}. ${task.name}**\n`;
          result += `   📄 Classe: ${task.class}\n`;
          result += `   📅 Dernière exécution: ${task.lastRunDt || 'Jamais'}\n`;
          result += `   ⏰ Prochaine exécution: ${task.nextRunDt || 'Non programmée'}\n`;
          if (task.lastRunMessage) {
            result += `   💬 Message: ${task.lastRunMessage}\n`;
          }
          if (task.lastRunDuration) {
            result += `   ⏱️ Durée: ${task.lastRunDuration}ms\n`;
          }
          result += `\n`;
        });
        
        return result;
        
      } else if (params.action === 'run') {
        if (!params.taskName) {
          return '❌ Le paramètre "taskName" est requis pour action=run';
        }
        
        const result = await client.runSystemTask(params.taskName);
        
        return `🚀 **Tâche lancée:** ${params.taskName}\n\n` +
               `**Résultat:** ${result.data.success ? 'Succès' : 'Échec'}\n` +
               `**Message:** ${result.data.message || 'Aucun message'}`;
        
      } else {
        return '❌ Action invalide. Utilisez: list, run, status';
      }
    } catch (error: any) {
      return `Erreur lors de la gestion des tâches: ${error.message}`;
    }
  }
};

// ========== BACKUP AND RESTORE TOOLS ==========

const systemBackup: ToolDefinition = {
  name: 'system_backup',
  description: 'Create, manage and restore system backups',
  parameters: [
    { name: 'action', type: 'string', description: 'Action: create, list, restore, delete, download', required: true },
    { name: 'backupId', type: 'string', description: 'Backup ID for restore/delete/download', required: false },
    { name: 'includeMedia', type: 'boolean', description: 'Include media files in backup', required: false, default: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      if (params.action === 'create') {
        const result = await client.createBackup(params.includeMedia);
        
        return `💾 **Sauvegarde créée**\n\n` +
               `**ID:** ${result.data.backupId}\n` +
               `**Média inclus:** ${params.includeMedia ? 'Oui' : 'Non'}\n` +
               `**Taille:** ${result.data.size || 'En cours...'}\n` +
               `**Statut:** ${result.data.status || 'En cours'}`;
               
      } else if (params.action === 'list') {
        const backups = await client.listBackups();
        
        let result = `💾 **Sauvegardes disponibles (${backups.data.length})**\n\n`;
        
        backups.data.forEach((backup: any, index: number) => {
          result += `**${index + 1}. ${backup.name || backup.backupId}**\n`;
          result += `   ID: ${backup.backupId}\n`;
          result += `   Créée: ${backup.createdAt || 'N/A'}\n`;
          result += `   Taille: ${backup.size || 'N/A'}\n`;
          result += `   Média: ${backup.includeMedia ? 'Inclus' : 'Exclu'}\n`;
          result += `   Statut: ${backup.status || 'Terminée'}\n\n`;
        });
        
        return result;
        
      } else if (params.action === 'restore') {
        if (!params.backupId) {
          return '❌ Le paramètre "backupId" est requis pour action=restore';
        }
        
        await client.restoreBackup(params.backupId);
        
        return `🔄 **Restauration lancée**\n\n` +
               `**Sauvegarde:** ${params.backupId}\n` +
               `⚠️ Cette opération peut prendre plusieurs minutes.\n` +
               `Le système sera temporairement indisponible.`;
               
      } else if (params.action === 'delete') {
        if (!params.backupId) {
          return '❌ Le paramètre "backupId" est requis pour action=delete';
        }
        
        await client.deleteBackup(params.backupId);
        return `🗑️ **Sauvegarde supprimée:** ${params.backupId}`;
        
      } else if (params.action === 'download') {
        if (!params.backupId) {
          return '❌ Le paramètre "backupId" est requis pour action=download';
        }
        
        await client.downloadBackup(params.backupId);
        
        return `📥 **Téléchargement préparé**\n\n` +
               `**Sauvegarde:** ${params.backupId}\n` +
               `**URL de téléchargement:** Disponible via l'API\n` +
               `💡 Utilisez l'interface web pour télécharger le fichier.`;
               
      } else {
        return '❌ Action invalide. Utilisez: create, list, restore, delete, download';
      }
    } catch (error: any) {
      return `Erreur lors de la gestion des sauvegardes: ${error.message}`;
    }
  }
};

// ========== HEALTH CHECK TOOLS ==========

const systemHealth: ToolDefinition = {
  name: 'system_health',
  description: 'Comprehensive system health check and monitoring',
  parameters: [
    { name: 'includeDetails', type: 'boolean', description: 'Include detailed component status', required: false, default: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      // Run multiple health checks
      const [health, systemInfo, tasks] = await Promise.all([
        client.healthCheck(),
        client.getSystemInfo(),
        client.getSystemTasks().catch(() => ({ data: [] }))
      ]);
      
      let result = `🏥 **Contrôle de santé système**\n\n`;
      
      // Overall status
      const overallStatus = health.data.status === 'healthy' ? '🟢 Sain' : 
                           health.data.status === 'warning' ? '🟡 Attention' : 
                           '🔴 Problème';
      
      result += `**État général:** ${overallStatus}\n`;
      result += `**Version:** ${systemInfo.data.version}\n`;
      result += `**Uptime:** ${health.data.uptime || 'N/A'}\n\n`;
      
      // Component status
      if (health.data.components && params.includeDetails) {
        result += `**État des composants:**\n`;
        Object.entries(health.data.components).forEach(([component, status]: [string, any]) => {
          const statusIcon = status.status === 'healthy' ? '🟢' : 
                           status.status === 'warning' ? '🟡' : '🔴';
          result += `   ${statusIcon} **${component}:** ${status.status}\n`;
          if (status.message) {
            result += `      ${status.message}\n`;
          }
        });
        result += `\n`;
      }
      
      // Task summary
      if (tasks.data.length > 0) {
        const failedTasks = tasks.data.filter((t: any) => t.status === 'failed').length;
        const runningTasks = tasks.data.filter((t: any) => t.status === 'running').length;
        
        result += `**Tâches système:**\n`;
        result += `   🔴 Échecs récents: ${failedTasks}\n`;
        result += `   🔵 En cours: ${runningTasks}\n\n`;
      }
      
      // Recommendations
      if (health.data.recommendations) {
        result += `**Recommandations:**\n`;
        health.data.recommendations.forEach((rec: string) => {
          result += `   💡 ${rec}\n`;
        });
      }
      
      return result;
    } catch (error: any) {
      return `❌ **Erreur lors du contrôle de santé**\n\n${error.message}`;
    }
  }
};

// ========== API DOCUMENTATION TOOL ==========

const apiDocumentation: ToolDefinition = {
  name: 'api_documentation',
  description: 'Get API version and documentation information',
  parameters: [
    { name: 'format', type: 'string', description: 'Format: summary, swagger, endpoints', required: false, default: 'summary' }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      if (params.format === 'summary') {
        const [version, health] = await Promise.all([
          client.getApiVersion(),
          client.healthCheck()
        ]);
        
        let result = `📚 **API Xibo CMS**\n\n`;
        result += `**Version API:** ${version.data.version}\n`;
        result += `**Version CMS:** ${version.data.cmsVersion}\n`;
        result += `**Version DB:** ${version.data.dbVersion}\n`;
        result += `**État API:** ${health.data.status}\n\n`;
        
        if (version.data.endpoints) {
          result += `**Endpoints disponibles:** ${version.data.endpoints.length}\n`;
          result += `**Documentation:** Swagger UI disponible\n`;
        }
        
        return result;
        
      } else if (params.format === 'swagger') {
        const swagger = await client.getApiDocumentation();
        
        // Get the API URL from client without accessing private property
        const apiUrl = (client as any).apiUrl || 'https://your-api-url';
        
        return `📚 **Documentation Swagger**\n\n` +
               `**OpenAPI Version:** ${swagger.data.openapi || swagger.data.swagger}\n` +
               `**API Title:** ${swagger.data.info?.title}\n` +
               `**API Description:** ${swagger.data.info?.description}\n` +
               `**Endpoints:** ${Object.keys(swagger.data.paths || {}).length}\n\n` +
               `💡 Accédez à Swagger UI sur: ${apiUrl}/swagger`;
               
      } else if (params.format === 'endpoints') {
        const swagger = await client.getApiDocumentation();
        
        let result = `🔗 **Endpoints API disponibles**\n\n`;
        
        if (swagger.data.paths) {
          Object.entries(swagger.data.paths).forEach(([path, methods]: [string, any]) => {
            result += `**${path}**\n`;
            Object.keys(methods).forEach(method => {
              result += `   ${method.toUpperCase()}\n`;
            });
            result += `\n`;
          });
        }
        
        return result;
      } else {
        return '❌ Format invalide. Utilisez: summary, swagger, endpoints';
      }
    } catch (error: any) {
      return `Erreur lors de la récupération de la documentation API: ${error.message}`;
    }
  }
};

export const systemAdminTools: ToolDefinition[] = [
  systemInfo,
  systemSettings,
  maintenanceMode,
  systemLogs,
  systemTasks,
  systemBackup,
  systemHealth,
  apiDocumentation
];