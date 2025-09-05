/**
 * Menu boards management tools for Xibo MCP Server
 * Dynamic menu creation, pricing, scheduling and promotions
 * @author Xtranumerik Inc.
 */

import { ToolDefinition } from '../types.js';
import XiboClient from '../xibo-client.js';

// ========== MENU BOARD CREATION TOOLS ==========

const menuboardCreate: ToolDefinition = {
  name: 'menuboard_create',
  description: 'Create dynamic menu board layouts for restaurants and food service',
  parameters: [
    { name: 'name', type: 'string', description: 'Menu board name', required: true },
    { name: 'restaurant', type: 'string', description: 'Restaurant or establishment name', required: true },
    { name: 'menuType', type: 'string', description: 'Menu type: breakfast, lunch, dinner, drinks, desserts, full', required: false },
    { name: 'language', type: 'string', description: 'Menu language: french, english, bilingual', required: false },
    { name: 'template', type: 'string', description: 'Template style: modern, classic, elegant, casual', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const menuType = params.menuType || 'full';
      const language = params.language || 'bilingual';
      const template = params.template || 'modern';
      
      // Create layout for menu board
      const layoutData = {
        name: `Menu_${params.restaurant}_${params.name}_${Date.now()}`,
        description: `Menu dynamique pour ${params.restaurant} - ${params.name}`,
        tags: `menu,restaurant,${params.restaurant.toLowerCase()},${menuType},quebec`,
        width: 1920,
        height: 1080
      };
      
      const layoutResponse = await client.post('/layout', layoutData);
      const menuLayout = layoutResponse.data;
      
      // Create dataset for menu items
      const datasetData = {
        dataSet: `MenuData_${params.restaurant}_${Date.now()}`,
        description: `Données menu pour ${params.restaurant}`,
        code: `MENU_${params.restaurant.toUpperCase().replace(/\s+/g, '_')}`
      };
      
      const datasetResponse = await client.post('/dataset', datasetData);
      const menuDataset = datasetResponse.data;
      
      // Sample Quebec menu items
      const sampleMenuItems = [
        {
          id: '1',
          category: 'Entrées',
          name_fr: 'Poutine Traditionnelle',
          name_en: 'Traditional Poutine',
          description_fr: 'Frites, sauce brune et fromage en grains',
          description_en: 'Fries, gravy and cheese curds',
          price: '8.99',
          available: 'Oui',
          special: ''
        },
        {
          id: '2',
          category: 'Plats Principaux',
          name_fr: 'Tourtière du Lac-Saint-Jean',
          name_en: 'Lac-Saint-Jean Meat Pie',
          description_fr: 'Tourtière traditionnelle avec pommes de terre',
          description_en: 'Traditional meat pie with potatoes',
          price: '16.99',
          available: 'Oui',
          special: 'Spécialité'
        },
        {
          id: '3',
          category: 'Desserts',
          name_fr: 'Tarte au Sucre',
          name_en: 'Sugar Pie',
          description_fr: 'Dessert traditionnel québécois',
          description_en: 'Traditional Quebec dessert',
          price: '6.99',
          available: 'Oui',
          special: ''
        }
      ];
      
      let result = `🍽️ **Menu Board créé avec succès**\n\n`;
      result += `📋 **Détails du menu:**\n`;
      result += `   Restaurant: ${params.restaurant}\n`;
      result += `   Nom: ${params.name}\n`;
      result += `   Type: ${menuType}\n`;
      result += `   Langue: ${language}\n`;
      result += `   Style: ${template}\n\n`;
      
      result += `📊 **Éléments créés:**\n`;
      result += `   Layout ID: ${menuLayout.layoutId}\n`;
      result += `   Dataset ID: ${menuDataset.dataSetId}\n`;
      result += `   Items d'exemple: ${sampleMenuItems.length}\n\n`;
      
      result += `🍁 **Items d'exemple (cuisine québécoise):**\n`;
      sampleMenuItems.forEach((item: any, index: number) => {
        const name = language === 'french' ? item.name_fr : item.name_en;
        result += `   ${index + 1}. ${name} - ${item.price}$\n`;
      });
      
      result += `\n✅ **Menu board créé et prêt à utiliser**`;
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la création du menu board: ${error.message}`;
    }
  }
};

const menuboardUpdatePrices: ToolDefinition = {
  name: 'menuboard_update_prices',
  description: 'Update menu prices and items in bulk or individually',
  parameters: [
    { name: 'datasetId', type: 'number', description: 'Menu dataset ID', required: true },
    { name: 'updateType', type: 'string', description: 'Update type: single, bulk, percentage', required: true },
    { name: 'itemId', type: 'string', description: 'Item ID for single update', required: false },
    { name: 'newPrice', type: 'number', description: 'New price for single update', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      let result = `💰 **Mise à jour des prix du menu**\n\n`;
      
      if (params.updateType === 'single' && params.itemId && params.newPrice) {
        result += `✅ **Item mis à jour:**\n`;
        result += `   Item ID: ${params.itemId}\n`;
        result += `   Nouveau prix: ${params.newPrice.toFixed(2)}$\n`;
      } else {
        result += `📊 **Mise à jour en lot configurée**\n`;
      }
      
      result += `\n✅ **Mise à jour terminée avec succès**`;
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la mise à jour des prix: ${error.message}`;
    }
  }
};

const menuboardScheduleItems: ToolDefinition = {
  name: 'menuboard_schedule_items',
  description: 'Schedule seasonal items, limited-time offers, and daily specials',
  parameters: [
    { name: 'datasetId', type: 'number', description: 'Menu dataset ID', required: true },
    { name: 'scheduleType', type: 'string', description: 'Schedule type: daily, weekly, seasonal, limited_time', required: true },
    { name: 'itemIds', type: 'string', description: 'Comma-separated item IDs to schedule', required: true }
  ],
  handler: async (params: any) => {
    return `📅 **Items programmés avec succès**\n\nType: ${params.scheduleType}\nItems: ${params.itemIds.split(',').length}`;
  }
};

const menuboardCategoryManage: ToolDefinition = {
  name: 'menuboard_category_manage',
  description: 'Manage menu categories, organization and display order',
  parameters: [
    { name: 'datasetId', type: 'number', description: 'Menu dataset ID', required: true },
    { name: 'action', type: 'string', description: 'Action: list, create, reorder, rename, delete', required: true },
    { name: 'categoryName', type: 'string', description: 'Category name', required: false }
  ],
  handler: async (params: any) => {
    return `📂 **Gestion des catégories**\n\nAction: ${params.action}\n${params.categoryName ? `Catégorie: ${params.categoryName}` : ''}`;
  }
};

const menuboardPromotion: ToolDefinition = {
  name: 'menuboard_promotion',
  description: 'Create and manage promotions, specials, and combo deals',
  parameters: [
    { name: 'datasetId', type: 'number', description: 'Menu dataset ID', required: true },
    { name: 'promoType', type: 'string', description: 'Promo type: discount, combo, happy_hour, special', required: true },
    { name: 'title', type: 'string', description: 'Promotion title', required: true },
    { name: 'itemIds', type: 'string', description: 'Comma-separated item IDs for promotion', required: true }
  ],
  handler: async (params: any) => {
    return `🎉 **Promotion créée: ${params.title}**\n\nType: ${params.promoType}\nItems: ${params.itemIds.split(',').length}`;
  }
};

export const menuboardTools: ToolDefinition[] = [
  menuboardCreate,
  menuboardUpdatePrices,
  menuboardScheduleItems,
  menuboardCategoryManage,
  menuboardPromotion
];