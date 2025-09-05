/**
 * Templates and Widgets tools for Xibo MCP Server
 * Layout templates and specialized widgets management
 * @author Xtranumerik Inc.
 */

import { ToolDefinition, Template, Widget } from '../types.js';
import XiboClient from '../xibo-client.js';

// ========== TEMPLATE MANAGEMENT TOOLS ==========

const templateList: ToolDefinition = {
  name: 'template_list',
  description: 'List all available layout templates',
  parameters: [
    { name: 'tags', type: 'string', description: 'Filter by tags', required: false },
    { name: 'template', type: 'string', description: 'Filter by template name', required: false },
    { name: 'start', type: 'number', description: 'Starting position', required: false },
    { name: 'length', type: 'number', description: 'Number of results', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {
      start: params.start || 0,
      length: params.length || 50
    };
    
    if (params.tags) queryParams.tags = params.tags;
    if (params.template) queryParams.template = params.template;

    try {
      const response = await client.get<{data: Template[], recordsTotal: number}>('/template', queryParams);
      const templates = response.data.data || [];
      const total = response.data.recordsTotal || 0;

      if (templates.length === 0) {
        return 'Aucun template trouvé.';
      }

      let result = `🎨 **Templates disponibles: ${templates.length}/${total}**\n\n`;
      
      templates.forEach((template: any, index: number) => {
        result += `**${index + 1}. ${template.template}** (ID: ${template.templateId})\n`;
        result += `   📝 Description: ${template.description || 'Aucune description'}\n`;
        result += `   📐 Résolution: ${template.width}x${template.height}\n`;
        
        if (template.tags) {
          result += `   🏷️  Tags: ${template.tags}\n`;
        }
        
        if (template.thumbnail) {
          result += `   🖼️  Aperçu disponible: Oui\n`;
        }
        
        result += `   📅 Créé: ${new Date(template.createdDt).toLocaleDateString('fr-FR')}\n`;
        result += '\n';
      });

      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des templates: ${error.message}`;
    }
  }
};

const templateImport: ToolDefinition = {
  name: 'template_import',
  description: 'Import a layout template from file or URL',
  parameters: [
    { name: 'name', type: 'string', description: 'Template name', required: true },
    { name: 'template', type: 'string', description: 'Template content (XML/JSON)', required: false },
    { name: 'useCompany', type: 'number', description: 'Use company specific template (1=yes, 0=no)', required: false },
    { name: 'replaceExisting', type: 'number', description: 'Replace existing template (1=yes, 0=no)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const importData: any = {
        name: params.name,
        useCompany: params.useCompany || 0,
        replaceExisting: params.replaceExisting || 0
      };
      
      if (params.template) {
        importData.template = params.template;
      }
      
      const response = await client.post('/template/import', importData);
      const result = response.data;
      
      return `✅ Template "${params.name}" importé avec succès (ID: ${result.templateId || 'N/A'})`;
    } catch (error: any) {
      return `Erreur lors de l'import du template: ${error.message}`;
    }
  }
};

const templateExport: ToolDefinition = {
  name: 'template_export',
  description: 'Export a layout template for backup or sharing',
  parameters: [
    { name: 'templateId', type: 'number', description: 'Template ID to export', required: true },
    { name: 'format', type: 'string', description: 'Export format: json, xml', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const format = params.format?.toLowerCase() || 'json';
      
      // Get template details
      const templateResponse = await client.get(`/template/${params.templateId}`);
      const template = templateResponse.data;
      
      // Export template data
      const exportResponse = await client.get(`/template/${params.templateId}/export`);
      const exportData = exportResponse.data;
      
      let result = `📤 **Export du template "${template.template}"**\n\n`;
      result += `📊 **Informations:**\n`;
      result += `   ID: ${template.templateId}\n`;
      result += `   Résolution: ${template.width}x${template.height}\n`;
      result += `   Créé: ${new Date(template.createdDt).toLocaleDateString('fr-FR')}\n\n`;
      
      if (format === 'xml') {
        result += `📄 **Template XML:**\n`;
        result += '```xml\n';
        result += exportData.template || 'Données XML non disponibles';
        result += '\n```\n';
      } else {
        result += `📄 **Template JSON:**\n`;
        result += '```json\n';
        result += JSON.stringify(exportData, null, 2);
        result += '\n```\n';
      }
      
      return result;
    } catch (error: any) {
      return `Erreur lors de l'export: ${error.message}`;
    }
  }
};

const templateApply: ToolDefinition = {
  name: 'template_apply',
  description: 'Apply a template to create a new layout',
  parameters: [
    { name: 'templateId', type: 'number', description: 'Template ID to apply', required: true },
    { name: 'name', type: 'string', description: 'Name for the new layout', required: true },
    { name: 'description', type: 'string', description: 'Description for the layout', required: false },
    { name: 'folderId', type: 'number', description: 'Folder ID for the layout', required: false },
    { name: 'tags', type: 'string', description: 'Tags for the layout', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const layoutData: any = {
        name: params.name,
        description: params.description || '',
        templateId: params.templateId
      };
      
      if (params.folderId) layoutData.folderId = params.folderId;
      if (params.tags) layoutData.tags = params.tags;
      
      const response = await client.post('/layout', layoutData);
      const newLayout = response.data;
      
      return `✅ Layout "${params.name}" créé à partir du template (ID: ${newLayout.layoutId})`;
    } catch (error: any) {
      return `Erreur lors de l'application du template: ${error.message}`;
    }
  }
};

// ========== WIDGET MANAGEMENT TOOLS ==========

const widgetList: ToolDefinition = {
  name: 'widget_list',
  description: 'List available widget modules and types',
  parameters: [
    { name: 'type', type: 'string', description: 'Filter by widget type', required: false },
    { name: 'enabled', type: 'number', description: 'Filter by enabled status (1=enabled, 0=disabled)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {};
    if (params.type) queryParams.type = params.type;
    if (params.enabled !== undefined) queryParams.enabled = params.enabled;

    try {
      const response = await client.get('/module', queryParams);
      const modules = response.data.data || [];

      if (modules.length === 0) {
        return 'Aucun module/widget trouvé.';
      }

      let result = `🧩 **Modules/Widgets disponibles: ${modules.length}**\n\n`;
      
      // Group by category
      const categories: any = {};
      
      modules.forEach((module: any) => {
        const category = module.class || 'Autre';
        if (!categories[category]) categories[category] = [];
        categories[category].push(module);
      });
      
      Object.entries(categories).forEach(([category, categoryModules]: [string, any]) => {
        result += `📂 **${category}:**\n`;
        
        categoryModules.forEach((module: any, index: number) => {
          const status = module.enabled === 1 ? '✅' : '❌';
          result += `   ${status} ${module.name} (${module.type})\n`;
          
          if (module.description) {
            result += `      📝 ${module.description}\n`;
          }
        });
        
        result += '\n';
      });

      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des widgets: ${error.message}`;
    }
  }
};

const widgetConfigure: ToolDefinition = {
  name: 'widget_configure',
  description: 'Configure widget settings and properties',
  parameters: [
    { name: 'widgetId', type: 'number', description: 'Widget ID to configure', required: true },
    { name: 'duration', type: 'number', description: 'Widget duration in seconds', required: false },
    { name: 'useDuration', type: 'number', description: 'Use duration setting (1=yes, 0=no)', required: false },
    { name: 'properties', type: 'string', description: 'JSON string with widget properties', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const configData: any = {};
      
      if (params.duration !== undefined) configData.duration = params.duration;
      if (params.useDuration !== undefined) configData.useDuration = params.useDuration;
      
      // Parse properties if provided
      if (params.properties) {
        try {
          const properties = JSON.parse(params.properties);
          Object.assign(configData, properties);
        } catch (e) {
          return `❌ Erreur: 'properties' doit être un JSON valide`;
        }
      }
      
      await client.put(`/playlist/widget/${params.widgetId}`, configData);
      
      let result = `✅ Widget ${params.widgetId} configuré avec succès\n\n`;
      result += `🔧 **Paramètres appliqués:**\n`;
      
      Object.entries(configData).forEach(([key, value]) => {
        result += `   ${key}: ${value}\n`;
      });
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la configuration du widget: ${error.message}`;
    }
  }
};

// ========== SPECIALIZED WIDGET TOOLS ==========

const widgetWeather: ToolDefinition = {
  name: 'widget_weather',
  description: 'Create and configure a weather widget with geolocation',
  parameters: [
    { name: 'playlistId', type: 'number', description: 'Playlist ID to add widget to', required: true },
    { name: 'location', type: 'string', description: 'Location for weather (city, coordinates)', required: true },
    { name: 'units', type: 'string', description: 'Units: metric, imperial, kelvin', required: false },
    { name: 'duration', type: 'number', description: 'Display duration in seconds', required: false },
    { name: 'templateId', type: 'string', description: 'Weather template ID', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const widgetData: any = {
        type: 'weather',
        duration: params.duration || 60,
        useDuration: 1,
        // Weather-specific properties
        location: params.location,
        units: params.units || 'metric',
        templateId: params.templateId || 'weather-template-1'
      };
      
      const response = await client.post(`/playlist/widget/${params.playlistId}`, widgetData);
      const newWidget = response.data;
      
      let result = `🌤️  Widget météo créé avec succès (ID: ${newWidget.widgetId})\n\n`;
      result += `📍 **Configuration:**\n`;
      result += `   Localisation: ${params.location}\n`;
      result += `   Unités: ${params.units || 'metric'}\n`;
      result += `   Durée: ${params.duration || 60} secondes\n`;
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la création du widget météo: ${error.message}`;
    }
  }
};

const widgetStocks: ToolDefinition = {
  name: 'widget_stocks',
  description: 'Create a financial stocks/market data widget',
  parameters: [
    { name: 'playlistId', type: 'number', description: 'Playlist ID to add widget to', required: true },
    { name: 'symbols', type: 'string', description: 'Stock symbols (comma-separated, e.g., AAPL,GOOGL,TSLA)', required: true },
    { name: 'duration', type: 'number', description: 'Display duration in seconds', required: false },
    { name: 'showChange', type: 'number', description: 'Show price change (1=yes, 0=no)', required: false },
    { name: 'updateInterval', type: 'number', description: 'Update interval in minutes', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const widgetData: any = {
        type: 'finance',
        duration: params.duration || 30,
        useDuration: 1,
        // Stock-specific properties
        symbols: params.symbols,
        showChange: params.showChange !== undefined ? params.showChange : 1,
        updateInterval: params.updateInterval || 15
      };
      
      const response = await client.post(`/playlist/widget/${params.playlistId}`, widgetData);
      const newWidget = response.data;
      
      let result = `📈 Widget bourse créé avec succès (ID: ${newWidget.widgetId})\n\n`;
      result += `💹 **Configuration:**\n`;
      result += `   Symboles: ${params.symbols}\n`;
      result += `   Durée: ${params.duration || 30} secondes\n`;
      result += `   Afficher variations: ${params.showChange !== 0 ? 'Oui' : 'Non'}\n`;
      result += `   Mise à jour: ${params.updateInterval || 15} minutes\n`;
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la création du widget bourse: ${error.message}`;
    }
  }
};

const widgetSocial: ToolDefinition = {
  name: 'widget_social',
  description: 'Create a social media feed widget (Twitter, Instagram, etc.)',
  parameters: [
    { name: 'playlistId', type: 'number', description: 'Playlist ID to add widget to', required: true },
    { name: 'platform', type: 'string', description: 'Social platform: twitter, instagram, facebook', required: true },
    { name: 'searchTerm', type: 'string', description: 'Hashtag or search term (without #)', required: true },
    { name: 'resultType', type: 'string', description: 'Type: recent, popular, mixed', required: false },
    { name: 'numItems', type: 'number', description: 'Number of posts to display', required: false },
    { name: 'duration', type: 'number', description: 'Display duration in seconds', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const widgetData: any = {
        type: 'twitter', // Default to Twitter, adjust based on platform
        duration: params.duration || 45,
        useDuration: 1,
        // Social media specific properties
        searchTerm: params.searchTerm,
        resultType: params.resultType || 'recent',
        numTweets: params.numItems || 5
      };
      
      // Adjust widget type based on platform
      if (params.platform.toLowerCase() === 'instagram') {
        widgetData.type = 'instagram';
      } else if (params.platform.toLowerCase() === 'facebook') {
        widgetData.type = 'facebook';
      }
      
      const response = await client.post(`/playlist/widget/${params.playlistId}`, widgetData);
      const newWidget = response.data;
      
      let result = `📱 Widget ${params.platform} créé avec succès (ID: ${newWidget.widgetId})\n\n`;
      result += `🔍 **Configuration:**\n`;
      result += `   Plateforme: ${params.platform}\n`;
      result += `   Recherche: #${params.searchTerm}\n`;
      result += `   Type: ${params.resultType || 'recent'}\n`;
      result += `   Nombre d'éléments: ${params.numItems || 5}\n`;
      result += `   Durée: ${params.duration || 45} secondes\n`;
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la création du widget social: ${error.message}`;
    }
  }
};

const widgetEmergency: ToolDefinition = {
  name: 'widget_emergency',
  description: 'Create an emergency alert widget (new in Xibo 4.2)',
  parameters: [
    { name: 'playlistId', type: 'number', description: 'Playlist ID to add widget to', required: true },
    { name: 'alertTitle', type: 'string', description: 'Emergency alert title', required: true },
    { name: 'alertMessage', type: 'string', description: 'Emergency alert message', required: true },
    { name: 'alertType', type: 'string', description: 'Alert type: warning, danger, info, success', required: false },
    { name: 'duration', type: 'number', description: 'Display duration in seconds', required: false },
    { name: 'priority', type: 'number', description: 'Alert priority (1-10, 10=highest)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const widgetData: any = {
        type: 'alert',
        duration: params.duration || 0, // 0 = infinite until manually stopped
        useDuration: params.duration ? 1 : 0,
        // Emergency alert specific properties
        alertTitle: params.alertTitle,
        alertMessage: params.alertMessage,
        alertType: params.alertType || 'warning',
        priority: params.priority || 8
      };
      
      const response = await client.post(`/playlist/widget/${params.playlistId}`, widgetData);
      const newWidget = response.data;
      
      // Get alert type emoji and color
      const alertIcons: any = {
        warning: '⚠️',
        danger: '🚨',
        info: 'ℹ️',
        success: '✅'
      };
      
      const icon = alertIcons[params.alertType || 'warning'] || '⚠️';
      
      let result = `${icon} Widget d'alerte d'urgence créé avec succès (ID: ${newWidget.widgetId})\n\n`;
      result += `🚨 **Configuration d'urgence:**\n`;
      result += `   Titre: ${params.alertTitle}\n`;
      result += `   Message: ${params.alertMessage}\n`;
      result += `   Type: ${params.alertType || 'warning'}\n`;
      result += `   Priorité: ${params.priority || 8}/10\n`;
      result += `   Durée: ${params.duration ? `${params.duration} secondes` : 'Illimitée'}\n`;
      
      result += `\n💡 **Important:** Cette alerte sera affichée selon sa priorité et peut interrompre d'autres contenus.`;
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la création de l'alerte d'urgence: ${error.message}`;
    }
  }
};

export const templateTools: ToolDefinition[] = [
  templateList,
  templateImport,
  templateExport,
  templateApply,
  widgetList,
  widgetConfigure,
  widgetWeather,
  widgetStocks,
  widgetSocial,
  widgetEmergency
];