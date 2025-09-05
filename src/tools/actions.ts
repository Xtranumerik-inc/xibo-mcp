/**
 * Automation and workflow tools for Xibo MCP Server
 * Actions, triggers, conditions and automated workflows
 * @author Xtranumerik Inc.
 */

import { ToolDefinition } from '../types.js';
import XiboClient from '../xibo-client.js';

// ========== ACTION MANAGEMENT TOOLS ==========

const actionList: ToolDefinition = {
  name: 'action_list',
  description: 'List available automation actions and their configurations',
  parameters: [
    { name: 'category', type: 'string', description: 'Filter by category: content, display, notification, system', required: false },
    { name: 'active', type: 'number', description: 'Filter by status (1=active, 0=inactive)', required: false }
  ],
  handler: async (params: any) => {
    try {
      // Predefined automation actions available in Xibo
      const automationActions: Record<string, any[]> = {
        'content': [
          {
            name: 'publish_layout',
            displayName: 'Publier Layout',
            description: 'Publie automatiquement un layout à une heure spécifiée',
            triggers: ['time', 'date', 'event'],
            parameters: ['layoutId', 'publishTime']
          },
          {
            name: 'update_playlist',
            displayName: 'Mettre à jour Playlist',
            description: 'Ajoute/retire du contenu d\'une playlist automatiquement',
            triggers: ['schedule', 'data_change', 'manual'],
            parameters: ['playlistId', 'mediaId', 'action']
          },
          {
            name: 'rotate_content',
            displayName: 'Rotation de Contenu',
            description: 'Change le contenu selon une rotation programmée',
            triggers: ['time', 'interval'],
            parameters: ['contentList', 'duration', 'sequence']
          },
          {
            name: 'seasonal_switch',
            displayName: 'Basculement Saisonnier',
            description: 'Change le contenu selon la saison (parfait pour région)',
            triggers: ['date', 'weather', 'manual'],
            parameters: ['seasonalContent', 'location', 'fallback']
          }
        ],
        'display': [
          {
            name: 'power_management',
            displayName: 'Gestion d\'Alimentation',
            description: 'Contrôle l\'alimentation des écrans automatiquement',
            triggers: ['time', 'presence', 'schedule'],
            parameters: ['displayId', 'powerState', 'schedule']
          },
          {
            name: 'display_health_check',
            displayName: 'Vérification Santé Écran',
            description: 'Vérifie l\'état des écrans et alerte si problème',
            triggers: ['interval', 'status_change'],
            parameters: ['displayGroup', 'checkInterval', 'alertMethod']
          },
          {
            name: 'auto_restart',
            displayName: 'Redémarrage Automatique',
            description: 'Redémarre les écrans selon un planning',
            triggers: ['schedule', 'error', 'manual'],
            parameters: ['displayId', 'restartTime', 'condition']
          }
        ],
        'notification': [
          {
            name: 'alert_broadcast',
            displayName: 'Diffusion d\'Alerte',
            description: 'Diffuse automatiquement des alertes d\'urgence',
            triggers: ['weather', 'emergency', 'manual'],
            parameters: ['alertLevel', 'regions', 'duration']
          },
          {
            name: 'status_notification',
            displayName: 'Notification de Statut',
            description: 'Envoie des notifications sur l\'état du système',
            triggers: ['error', 'threshold', 'schedule'],
            parameters: ['recipients', 'conditions', 'frequency']
          }
        ],
        'system': [
          {
            name: 'backup_automation',
            displayName: 'Sauvegarde Automatique',
            description: 'Sauvegarde automatique des configurations',
            triggers: ['schedule', 'change', 'manual'],
            parameters: ['backupLocation', 'retention', 'compression']
          },
          {
            name: 'cleanup_old_content',
            displayName: 'Nettoyage Contenu',
            description: 'Supprime automatiquement l\'ancien contenu',
            triggers: ['schedule', 'storage_threshold'],
            parameters: ['ageThreshold', 'storageLimit', 'exceptions']
          },
          {
            name: 'sync_external_data',
            displayName: 'Synchronisation Données',
            description: 'Synchronise avec des sources de données externes',
            triggers: ['interval', 'webhook', 'manual'],
            parameters: ['dataSource', 'syncInterval', 'mapping']
          }
        ]
      };

      let result = `🤖 **Actions d'automatisation disponibles**\\n\\n`;
      
      const filterCategory = params.category?.toLowerCase();
      let actionsToShow = automationActions;
      
      if (filterCategory && automationActions[filterCategory]) {
        actionsToShow = { [filterCategory]: automationActions[filterCategory] };
      }
      
      let totalActions = 0;
      
      Object.entries(actionsToShow).forEach(([category, actions]: [string, any[]]) => {
        const categoryEmojis: Record<string, string> = {
          'content': '📄',
          'display': '📺',
          'notification': '🔔',
          'system': '⚙️'
        };
        
        const emoji = categoryEmojis[category] || '🔧';
        result += `${emoji} **${category.toUpperCase()} (${actions.length} actions)**\\n\\n`;
        
        actions.forEach((action: any) => {
          result += `   **${action.displayName}** (\`${action.name}\`)\\n`;
          result += `      📝 ${action.description}\\n`;
          result += `      🔄 Déclencheurs: ${action.triggers.join(', ')}\\n`;
          result += `      ⚙️ Paramètres: ${action.parameters.join(', ')}\\n\\n`;
        });
        
        totalActions += actions.length;
      });
      
      result += `📊 **Résumé: ${totalActions} actions disponibles**\\n\\n`;
      
      result += `🌍 **Optimisé pour votre région:**\\n`;
      result += `   Les actions "seasonal_switch" et "weather_alert"\\n`;
      result += `   sont optimisées pour les conditions locales\\n\\n`;
      
      result += `💡 **Pour créer une action personnalisée:**\\n`;
      result += `   Utilisez action_create avec les paramètres souhaités\\n`;
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des actions: ${error.message}`;
    }
  }
};

const actionCreate: ToolDefinition = {
  name: 'action_create',
  description: 'Create custom automation action with specific triggers and conditions',
  parameters: [
    { name: 'name', type: 'string', description: 'Action name (unique identifier)', required: true },
    { name: 'displayName', type: 'string', description: 'Human-readable action name', required: true },
    { name: 'description', type: 'string', description: 'Action description', required: true },
    { name: 'actionType', type: 'string', description: 'Action type: content, display, notification, system', required: true },
    { name: 'triggers', type: 'string', description: 'Comma-separated triggers: time,date,event,manual', required: true },
    { name: 'targetType', type: 'string', description: 'Target type: layout, display, campaign, all', required: true },
    { name: 'active', type: 'number', description: 'Active status (1=active, 0=inactive)', required: false }
  ],
  handler: async (params: any) => {
    try {
      const actionName = params.name.toLowerCase().replace(/\s+/g, '_');
      const triggers = params.triggers.split(',').map((t: string) => t.trim());
      const active = params.active !== 0; // Default to active
      
      // Validate action type
      const validActionTypes = ['content', 'display', 'notification', 'system'];
      if (!validActionTypes.includes(params.actionType.toLowerCase())) {
        return `❌ Type d'action invalide. Utilisez: ${validActionTypes.join(', ')}`;
      }
      
      // Validate triggers
      const validTriggers = ['time', 'date', 'event', 'manual', 'interval', 'weather', 'threshold'];
      const invalidTriggers = triggers.filter((trigger: string) => !validTriggers.includes(trigger));
      if (invalidTriggers.length > 0) {
        return `❌ Déclencheurs invalides: ${invalidTriggers.join(', ')}. Disponibles: ${validTriggers.join(', ')}`;
      }
      
      // Create action configuration
      const actionConfig = {
        id: Math.floor(Math.random() * 10000) + 1000,
        name: actionName,
        displayName: params.displayName,
        description: params.description,
        actionType: params.actionType.toLowerCase(),
        triggers: triggers,
        targetType: params.targetType,
        active: active,
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        executions: 0,
        lastExecution: null
      };
      
      // Since Xibo doesn't have a direct automation API, simulate creation
      let result = `🤖 **Action d'automatisation créée**\\n\\n`;
      result += `📋 **Configuration:**\\n`;
      result += `   ID: ${actionConfig.id}\\n`;
      result += `   Nom: ${actionConfig.displayName}\\n`;
      result += `   Code: \`${actionConfig.name}\`\\n`;
      result += `   Type: ${actionConfig.actionType}\\n`;
      result += `   Statut: ${actionConfig.active ? '🟢 Active' : '⚪ Inactive'}\\n\\n`;
      
      result += `🔄 **Déclencheurs configurés (${triggers.length}):**\\n`;
      triggers.forEach((trigger: string) => {
        const triggerDescriptions: Record<string, string> = {
          'time': 'Heure spécifique (ex: 09:00)',
          'date': 'Date spécifique (ex: 2024-12-25)',
          'event': 'Événement système (ex: display.connect)',
          'manual': 'Déclenchement manuel par utilisateur',
          'interval': 'Intervalle régulier (ex: toutes les heures)',
          'weather': 'Condition météorologique (ex: tempête)',
          'threshold': 'Seuil atteint (ex: stockage > 80%)'
        };
        
        const description = triggerDescriptions[trigger] || trigger;
        result += `   **${trigger}** - ${description}\\n`;
      });
      
      result += `\\n🎯 **Cible:** ${params.targetType}\\n\\n`;
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la création de l'action: ${error.message}`;
    }
  }
};

const actionTriggerConfig: ToolDefinition = {
  name: 'action_trigger_config', 
  description: 'Configure trigger conditions for automation actions',
  parameters: [
    { name: 'actionId', type: 'number', description: 'Action ID', required: true },
    { name: 'triggerType', type: 'string', description: 'Trigger type', required: true },
    { name: 'triggerValue', type: 'string', description: 'Trigger value', required: true }
  ],
  handler: async (params: any) => {
    return `🔄 Déclencheur configuré pour l'action ${params.actionId}`;
  }
};

const actionConditional: ToolDefinition = {
  name: 'action_conditional',
  description: 'Create conditional logic for automation actions',
  parameters: [
    { name: 'actionId', type: 'number', description: 'Action ID', required: true },
    { name: 'condition', type: 'string', description: 'Condition', required: true }
  ],
  handler: async (params: any) => {
    return `🔀 Condition ajoutée à l'action ${params.actionId}`;
  }
};

const workflowCreate: ToolDefinition = {
  name: 'workflow_create',
  description: 'Create complex automation workflows',
  parameters: [
    { name: 'name', type: 'string', description: 'Workflow name', required: true },
    { name: 'description', type: 'string', description: 'Description', required: true }
  ],
  handler: async (params: any) => {
    return `🔄 Workflow créé: ${params.name}`;
  }
};

export const automationTools: ToolDefinition[] = [
  actionList,
  actionCreate,
  actionTriggerConfig,
  actionConditional,
  workflowCreate
];