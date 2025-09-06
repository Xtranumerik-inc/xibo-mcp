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
      result += `   Version CMS: ${systemData.data.version || versionData.data.version || 'N/A'}\n`;
      result += `   Version DB: ${systemData.data.dbVersion || 'N/A'}\n`;
      result += `   Version API: ${versionData.data.version || 'N/A'}\n`;
      result += `   Environnement: ${systemData.data.environment || versionData.data.environment || 'N/A'}\n\n`;
      
      // System status
      result += `**Statut du système:**\n`;
      result += `   État: ${healthData.data.status || 'Unknown'}\n`;
      result += `   Bibliothèque: ${systemData.data.libraryLocation || 'N/A'}\n`;
      result += `   Fuseau horaire: ${systemData.data.timeZone || 'N/A'}\n`;
      result += `   Thème: ${systemData.data.theme || 'Default'}\n\n`;
      
      // Features and licensing
      if (systemData.data.features) {
        result += `**Fonctionnalités disponibles:**\n`;
        if (Array.isArray(systemData.data.features)) {
          systemData.data.features.forEach((feature: string) => {
            result += `   ✅ ${feature}\n`;
          });
        } else {
          Object.keys(systemData.data.features).forEach((feature: string) => {
            result += `   ✅ ${feature}: ${systemData.data.features[feature]}\n`;
          });
        }
        result += `\n`;
      }
      
      if (systemData.data.isTrial !== undefined) {
        result += `**Licence:**\n`;
        result += `   Type: ${systemData.data.isTrial ? 'Version d\\'essai' : 'Licence complète'}\n`;
        if (systemData.data.productName || versionData.data.cms) {
          result += `   Produit: ${systemData.data.productName || versionData.data.cms}\n`;
        }
        result += `\n`;
      }
      
      if (params.detailed) {
        // Additional system stats
        try {
          const tasks = await client.getSystemTasks();
          result += `**Tâches système:**\n`;
          if (tasks.data && Array.isArray(tasks.data)) {
            result += `   Tâches actives: ${tasks.data.filter((t: any) => t.status === 'running').length}\n`;
            result += `   Tâches en attente: ${tasks.data.filter((t: any) => t.status === 'pending').length}\n`;
            result += `   Total: ${tasks.data.length}\n`;
          } else {
            result += `   Statut des tâches: Disponible\n`;
          }
          result += `\n`;
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

const systemHealth: ToolDefinition = {
  name: 'system_health',
  description: 'Perform comprehensive system health check',
  parameters: [
    { name: 'includeDetails', type: 'boolean', description: 'Include detailed health diagnostics', required: false, default: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const healthData = await client.healthCheck();
      const systemInfo = await client.getSystemInfo();
      
      let result = `🏥 **Vérification de santé système**\n\n`;
      
      // Overall status
      const status = healthData.data.status || 'unknown';
      const statusEmoji = status === 'healthy' ? '✅' : status === 'unhealthy' ? '❌' : '⚠️';
      result += `**État général:** ${statusEmoji} ${status.toUpperCase()}\n\n`;
      
      // Basic health metrics
      if (healthData.data.server_time) {
        result += `**Temps serveur:** ${healthData.data.server_time}\n`;
      }
      
      if (healthData.data.endpoint) {
        result += `**Point de contrôle:** ${healthData.data.endpoint}\n`;
      }
      
      // System connectivity
      result += `**Connectivité:**\n`;
      result += `   API accessible: ✅ Oui\n`;
      result += `   Authentification: ✅ Active\n`;
      
      if (systemInfo.data) {
        result += `   Base de données: ✅ Connectée\n`;
        if (systemInfo.data.libraryLocation) {
          result += `   Bibliothèque média: ✅ Accessible\n`;
        }
      }
      
      result += `\n`;
      
      if (params.includeDetails) {
        // Detailed diagnostics
        result += `**Diagnostics détaillés:**\n`;
        
        try {
          // Check system tasks
          const tasks = await client.getSystemTasks();
          if (tasks.data && Array.isArray(tasks.data)) {
            const runningTasks = tasks.data.filter((t: any) => t.status === 'running').length;
            const failedTasks = tasks.data.filter((t: any) => t.status === 'failed').length;
            
            result += `   Tâches en cours: ${runningTasks}\n`;
            result += `   Tâches échouées: ${failedTasks}\n`;
          }
        } catch (error) {
          result += `   Tâches système: ⚠️ Non accessible\n`;
        }
        
        try {
          // Check maintenance mode
          const maintenance = await client.getMaintenanceStatus();
          if (maintenance.data) {
            result += `   Mode maintenance: ${maintenance.data.enabled ? '🔧 Activé' : '✅ Désactivé'}\n`;
          }
        } catch (error) {
          result += `   Mode maintenance: ⚠️ Statut inconnu\n`;
        }
        
        // Authentication mode info
        const authStatus = client.getAuthStatus();
        result += `   Mode d'auth: ${authStatus.mode}\n`;
        result += `   Utilisateur connecté: ${authStatus.userInfo?.username || 'N/A'}\n`;
      }
      
      // Health recommendations
      if (status !== 'healthy') {
        result += `\n**Recommandations:**\n`;
        if (healthData.data.error) {
          result += `   ⚠ Erreur détectée: ${healthData.data.error}\n`;
        }
        result += `   ⚠ Vérifiez les logs système pour plus de détails\n`;
        result += `   ⚠ Contactez l'administrateur si le problème persiste\n`;
      }
      
      return result;
    } catch (error: any) {
      return `❌ **Erreur lors de la vérification de santé:** ${error.message}\n\n**Recommandations:**\n⚠ Vérifiez la connectivité réseau\n⚠ Validez les paramètres d'authentification\n⚠ Consultez les logs pour plus de détails`;
    }
  }
};

const systemVersion: ToolDefinition = {
  name: 'system_version',
  description: 'Get detailed version information for Xibo CMS and API',
  parameters: [],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const versionData = await client.getApiVersion();
      const systemData = await client.getSystemInfo();
      
      let result = `🔖 **Informations de version**\n\n`;
      
      // API Version
      result += `**API Xibo:**\n`;
      result += `   Version: ${versionData.data.version || 'Unknown'}\n`;
      if (versionData.data.build) {
        result += `   Build: ${versionData.data.build}\n`;
      }
      if (versionData.data.cms) {
        result += `   CMS: ${versionData.data.cms}\n`;
      }
      if (versionData.data.environment) {
        result += `   Environnement: ${versionData.data.environment}\n`;
      }
      result += `\n`;
      
      // System Version
      if (systemData.data) {
        result += `**Système CMS:**\n`;
        if (systemData.data.version) {
          result += `   Version CMS: ${systemData.data.version}\n`;
        }
        if (systemData.data.dbVersion) {
          result += `   Version DB: ${systemData.data.dbVersion}\n`;
        }
        if (systemData.data.productName) {
          result += `   Produit: ${systemData.data.productName}\n`;
        }
        if (systemData.data.releaseNotes) {
          result += `   Notes de version: ${systemData.data.releaseNotes}\n`;
        }
        result += `\n`;
      }
      
      // MCP Server Version
      result += `**Serveur MCP Xibo:**\n`;
      result += `   Version: 2.0.0\n`;
      result += `   Développeur: Xtranumerik Inc.\n`;
      result += `   Mode d'authentification: ${client.getAuthMode()}\n`;
      
      // Compatibility info
      result += `\n**Compatibilité:**\n`;
      if (versionData.data.version) {
        const version = versionData.data.version;
        if (version.startsWith('4.') || version.startsWith('3.')) {
          result += `   ✅ Version supportée\n`;
          result += `   ✅ Tous les outils MCP fonctionnels\n`;
        } else {
          result += `   ⚠️ Version non testée\n`;
          result += `   ⚠️ Certains outils peuvent ne pas fonctionner\n`;
        }
      } else {
        result += `   ❓ Version inconnue - compatibilité non vérifiée\n`;
      }
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des informations de version: ${error.message}`;
    }
  }
};

const systemMaintenance: ToolDefinition = {
  name: 'system_maintenance',
  description: 'Manage system maintenance mode',
  parameters: [
    { name: 'action', type: 'string', description: 'Action: status, enable, disable', required: true },
    { name: 'message', type: 'string', description: 'Maintenance message (for enable action)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      let result = `🔧 **Gestion du mode maintenance**\n\n`;
      
      switch (params.action.toLowerCase()) {
        case 'status':
          const status = await client.getMaintenanceStatus();
          result += `**Statut actuel:**\n`;
          if (status.data) {
            result += `   Mode: ${status.data.enabled ? '🔧 Activé' : '✅ Désactivé'}\n`;
            if (status.data.message) {
              result += `   Message: ${status.data.message}\n`;
            }
            if (status.data.enabledAt) {
              result += `   Activé le: ${status.data.enabledAt}\n`;
            }
          } else {
            result += `   Mode: ✅ Désactivé (par défaut)\n`;
          }
          break;
          
        case 'enable':
          const enableResponse = await client.enableMaintenanceMode(params.message);
          result += `**Mode maintenance activé** 🔧\n`;
          if (params.message) {
            result += `   Message: ${params.message}\n`;
          }
          result += `   Les utilisateurs verront une page de maintenance\n`;
          result += `   Seuls les administrateurs peuvent accéder au système\n`;
          break;
          
        case 'disable':
          const disableResponse = await client.disableMaintenanceMode();
          result += `**Mode maintenance désactivé** ✅\n`;
          result += `   Le système est à nouveau accessible à tous les utilisateurs\n`;
          break;
          
        default:
          return `❌ Action non reconnue. Actions disponibles: status, enable, disable`;
      }
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la gestion du mode maintenance: ${error.message}`;
    }
  }
};

const systemTasks: ToolDefinition = {
  name: 'system_tasks',
  description: 'View and manage system tasks',
  parameters: [
    { name: 'action', type: 'string', description: 'Action: list, run, status', required: false, default: 'list' },
    { name: 'taskName', type: 'string', description: 'Task name to run (required for run action)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      let result = `⚙️ **Gestion des tâches système**\n\n`;
      
      const action = params.action || 'list';
      
      switch (action.toLowerCase()) {
        case 'list':
        case 'status':
          const tasks = await client.getSystemTasks();
          if (tasks.data && Array.isArray(tasks.data)) {
            result += `**Tâches système (${tasks.data.length}):**\n\n`;
            
            const tasksByStatus: any = {};
            tasks.data.forEach((task: any) => {
              const status = task.status || 'unknown';
              if (!tasksByStatus[status]) {
                tasksByStatus[status] = [];
              }
              tasksByStatus[status].push(task);
            });
            
            // Summary by status
            result += `**Résumé:**\n`;
            Object.keys(tasksByStatus).forEach(status => {
              const count = tasksByStatus[status].length;
              const emoji = status === 'running' ? '🔄' : status === 'completed' ? '✅' : 
                           status === 'failed' ? '❌' : status === 'pending' ? '⏳' : '❓';
              result += `   ${emoji} ${status}: ${count}\n`;
            });
            result += `\n`;
            
            // Detail for each task
            tasks.data.slice(0, 10).forEach((task: any, index: number) => {
              const statusEmoji = task.status === 'running' ? '🔄' : task.status === 'completed' ? '✅' : 
                                 task.status === 'failed' ? '❌' : task.status === 'pending' ? '⏳' : '❓';
              result += `**${index + 1}. ${task.name || task.taskName || `Tâche ${task.id}`}**\n`;
              result += `   Statut: ${statusEmoji} ${task.status || 'unknown'}\n`;
              if (task.lastRunAt) {
                result += `   Dernière exécution: ${task.lastRunAt}\n`;
              }
              if (task.nextRunAt) {
                result += `   Prochaine exécution: ${task.nextRunAt}\n`;
              }
              if (task.description) {
                result += `   Description: ${task.description}\n`;
              }
              result += `\n`;
            });
            
            if (tasks.data.length > 10) {
              result += `... et ${tasks.data.length - 10} autres tâches\n`;
            }
          } else {
            result += `Aucune tâche système disponible ou format de réponse inattendu`;
          }
          break;
          
        case 'run':
          if (!params.taskName) {
            return `❌ Le nom de la tâche est requis pour l'action 'run'`;
          }
          
          const runResponse = await client.runSystemTask(params.taskName);
          result += `**Tâche exécutée: ${params.taskName}** ✅\n`;
          
          if (runResponse.data) {
            result += `\n**Résultat:**\n`;
            if (runResponse.data.message) {
              result += `   Message: ${runResponse.data.message}\n`;
            }
            if (runResponse.data.status) {
              result += `   Statut: ${runResponse.data.status}\n`;
            }
            if (runResponse.data.output) {
              result += `   Sortie: ${runResponse.data.output}\n`;
            }
          }
          break;
          
        default:
          return `❌ Action non reconnue. Actions disponibles: list, run, status`;
      }
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la gestion des tâches système: ${error.message}`;
    }
  }
};

export const systemAdminTools: ToolDefinition[] = [
  systemInfo,
  systemHealth,
  systemVersion,
  systemMaintenance,
  systemTasks
];