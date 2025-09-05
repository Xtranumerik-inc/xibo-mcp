/**
 * Transitions and visual effects tools for Xibo MCP Server
 * Layout transitions, effects, and display resolution management
 * @author Xtranumerik Inc.
 */

import { ToolDefinition } from '../types.js';
import XiboClient from '../xibo-client.js';

// ========== TRANSITION MANAGEMENT TOOLS ==========

const transitionList: ToolDefinition = {
  name: 'transition_list',
  description: 'List all available transitions and their configurations',
  parameters: [
    { name: 'type', type: 'string', description: 'Filter by transition type: in, out, both', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      // Get transitions from system info or predefined list
      const predefinedTransitions = {
        'in': [
          { name: 'fadeIn', displayName: 'Fondu entrant', duration: 1000 },
          { name: 'slideInLeft', displayName: 'Glissement depuis la gauche', duration: 800 },
          { name: 'slideInRight', displayName: 'Glissement depuis la droite', duration: 800 },
          { name: 'slideInTop', displayName: 'Glissement depuis le haut', duration: 800 },
          { name: 'slideInBottom', displayName: 'Glissement depuis le bas', duration: 800 },
          { name: 'zoomIn', displayName: 'Zoom entrant', duration: 600 },
          { name: 'bounceIn', displayName: 'Rebond entrant', duration: 1200 },
          { name: 'rotateIn', displayName: 'Rotation entrante', duration: 800 }
        ],
        'out': [
          { name: 'fadeOut', displayName: 'Fondu sortant', duration: 1000 },
          { name: 'slideOutLeft', displayName: 'Glissement vers la gauche', duration: 800 },
          { name: 'slideOutRight', displayName: 'Glissement vers la droite', duration: 800 },
          { name: 'slideOutTop', displayName: 'Glissement vers le haut', duration: 800 },
          { name: 'slideOutBottom', displayName: 'Glissement vers le bas', duration: 800 },
          { name: 'zoomOut', displayName: 'Zoom sortant', duration: 600 },
          { name: 'bounceOut', displayName: 'Rebond sortant', duration: 1200 },
          { name: 'rotateOut', displayName: 'Rotation sortante', duration: 800 }
        ]
      };

      let result = `🎭 **Transitions disponibles**\n\n`;
      
      if (!params.type || params.type === 'in' || params.type === 'both') {
        result += `➡️ **Transitions d'entrée (${predefinedTransitions.in.length}):**\n`;
        predefinedTransitions.in.forEach((transition: any, index: number) => {
          result += `   ${index + 1}. **${transition.displayName}**\n`;
          result += `      🔧 Code: \`${transition.name}\`\n`;
          result += `      ⏱️  Durée: ${transition.duration}ms\n\n`;
        });
      }
      
      if (!params.type || params.type === 'out' || params.type === 'both') {
        result += `⬅️ **Transitions de sortie (${predefinedTransitions.out.length}):**\n`;
        predefinedTransitions.out.forEach((transition: any, index: number) => {
          result += `   ${index + 1}. **${transition.displayName}**\n`;
          result += `      🔧 Code: \`${transition.name}\`\n`;
          result += `      ⏱️  Durée: ${transition.duration}ms\n\n`;
        });
      }
      
      result += `💡 **Conseils d'utilisation:**\n`;
      result += `   - Les transitions courtes (600ms) sont plus dynamiques\n`;
      result += `   - Les transitions longues (1200ms) sont plus élégantes\n`;
      result += `   - Combinez entrée et sortie pour des effets fluides\n`;
      result += `   - Évitez trop d'effets sur un même écran\n`;
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des transitions: ${error.message}`;
    }
  }
};

const transitionApply: ToolDefinition = {
  name: 'transition_apply',
  description: 'Apply transition effects to layouts or regions',
  parameters: [
    { name: 'layoutId', type: 'number', description: 'Layout ID to apply transitions to', required: true },
    { name: 'regionId', type: 'number', description: 'Specific region ID (optional)', required: false },
    { name: 'transitionIn', type: 'string', description: 'Entrance transition name', required: false },
    { name: 'transitionOut', type: 'string', description: 'Exit transition name', required: false },
    { name: 'duration', type: 'number', description: 'Transition duration in milliseconds', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      // Get layout details
      const layoutResponse = await client.get(`/layout/${params.layoutId}`);
      const layout = layoutResponse.data;
      
      if (!params.transitionIn && !params.transitionOut) {
        return '❌ Vous devez spécifier au moins une transition (transitionIn ou transitionOut)';
      }
      
      // Get regions for this layout
      const regionsResponse = await client.get(`/layout/${params.layoutId}/region`);
      const regions = regionsResponse.data || [];
      
      let targetRegions = regions;
      if (params.regionId) {
        targetRegions = regions.filter((r: any) => r.regionId === params.regionId);
        if (targetRegions.length === 0) {
          return `❌ Région ${params.regionId} non trouvée dans le layout ${params.layoutId}`;
        }
      }
      
      const results: any[] = [];
      
      // Apply transitions to target regions
      for (const region of targetRegions) {
        try {
          const updateData: any = {
            regionId: region.regionId,
            ownerId: region.ownerId,
            width: region.width,
            height: region.height,
            top: region.top,
            left: region.left,
            zIndex: region.zIndex
          };
          
          // Add transition properties
          if (params.transitionIn) {
            updateData.transitionIn = params.transitionIn;
            updateData.transitionInDuration = params.duration || 1000;
          }
          
          if (params.transitionOut) {
            updateData.transitionOut = params.transitionOut;
            updateData.transitionOutDuration = params.duration || 1000;
          }
          
          await client.put(`/layout/${params.layoutId}/region/${region.regionId}`, updateData);
          
          results.push({
            regionId: region.regionId,
            success: true,
            name: region.name || `Région ${region.regionId}`
          });
        } catch (error: any) {
          results.push({
            regionId: region.regionId,
            success: false,
            error: error.message,
            name: region.name || `Région ${region.regionId}`
          });
        }
      }
      
      let result = `🎭 **Transitions appliquées**\n\n`;
      result += `📋 **Configuration:**\n`;
      result += `   Layout: ${layout.layout} (${params.layoutId})\n`;
      result += `   Régions ciblées: ${targetRegions.length}\n`;
      
      if (params.transitionIn) {
        result += `   ➡️  Entrée: ${params.transitionIn}\n`;
      }
      if (params.transitionOut) {
        result += `   ⬅️  Sortie: ${params.transitionOut}\n`;
      }
      
      result += `   ⏱️  Durée: ${params.duration || 1000}ms\n\n`;
      
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      result += `📊 **Résumé:**\n`;
      result += `   ✅ Succès: ${successful.length}\n`;
      result += `   ❌ Échecs: ${failed.length}\n\n`;
      
      if (successful.length > 0) {
        result += `✅ **Régions mises à jour:**\n`;
        successful.forEach((item: any, index: number) => {
          result += `   ${index + 1}. ${item.name}\n`;
        });
        result += '\n';
      }
      
      if (failed.length > 0) {
        result += `❌ **Échecs:**\n`;
        failed.forEach((item: any, index: number) => {
          result += `   ${index + 1}. ${item.name}: ${item.error}\n`;
        });
        result += '\n';
      }
      
      result += `💡 **Prochaine étape:** Publiez le layout pour voir les transitions en action`;
      
      return result;
    } catch (error: any) {
      return `Erreur lors de l'application des transitions: ${error.message}`;
    }
  }
};

// ========== SPECIFIC EFFECT TOOLS ==========

const effectFade: ToolDefinition = {
  name: 'effect_fade',
  description: 'Apply fade effects (in/out) to layout regions',
  parameters: [
    { name: 'layoutId', type: 'number', description: 'Layout ID', required: true },
    { name: 'fadeType', type: 'string', description: 'Fade type: in, out, both', required: false },
    { name: 'duration', type: 'number', description: 'Fade duration in milliseconds (default: 1000)', required: false },
    { name: 'regionId', type: 'number', description: 'Specific region ID (optional)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const fadeType = params.fadeType || 'both';
      const duration = params.duration || 1000;
      
      let transitionIn = null;
      let transitionOut = null;
      
      if (fadeType === 'in' || fadeType === 'both') {
        transitionIn = 'fadeIn';
      }
      if (fadeType === 'out' || fadeType === 'both') {
        transitionOut = 'fadeOut';
      }
      
      // Use the transition_apply logic
      const applyParams = {
        ...params,
        transitionIn,
        transitionOut,
        duration,
        _xiboClient: client
      };
      
      const result = await transitionApply.handler(applyParams);
      
      return `🌫️ **Effet de fondu appliqué**\n\n` + result;
    } catch (error: any) {
      return `Erreur lors de l'application de l'effet de fondu: ${error.message}`;
    }
  }
};

const effectSlide: ToolDefinition = {
  name: 'effect_slide',
  description: 'Apply slide transition effects from specified direction',
  parameters: [
    { name: 'layoutId', type: 'number', description: 'Layout ID', required: true },
    { name: 'direction', type: 'string', description: 'Slide direction: left, right, top, bottom', required: true },
    { name: 'slideType', type: 'string', description: 'Slide type: in, out, both', required: false },
    { name: 'duration', type: 'number', description: 'Slide duration in milliseconds', required: false },
    { name: 'regionId', type: 'number', description: 'Specific region ID (optional)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const slideType = params.slideType || 'both';
      const duration = params.duration || 800;
      const direction = params.direction.toLowerCase();
      
      // Validate direction
      const validDirections = ['left', 'right', 'top', 'bottom'];
      if (!validDirections.includes(direction)) {
        return `❌ Direction invalide. Utilisez: ${validDirections.join(', ')}`;
      }
      
      let transitionIn = null;
      let transitionOut = null;
      
      if (slideType === 'in' || slideType === 'both') {
        const directionMap: any = {
          'left': 'slideInLeft',
          'right': 'slideInRight', 
          'top': 'slideInTop',
          'bottom': 'slideInBottom'
        };
        transitionIn = directionMap[direction];
      }
      
      if (slideType === 'out' || slideType === 'both') {
        const directionMap: any = {
          'left': 'slideOutLeft',
          'right': 'slideOutRight',
          'top': 'slideOutTop', 
          'bottom': 'slideOutBottom'
        };
        transitionOut = directionMap[direction];
      }
      
      // Use the transition_apply logic
      const applyParams = {
        ...params,
        transitionIn,
        transitionOut,
        duration,
        _xiboClient: client
      };
      
      const result = await transitionApply.handler(applyParams);
      
      return `📱 **Effet de glissement appliqué (${direction})**\n\n` + result;
    } catch (error: any) {
      return `Erreur lors de l'application de l'effet de glissement: ${error.message}`;
    }
  }
};

const effectZoom: ToolDefinition = {
  name: 'effect_zoom',
  description: 'Apply zoom effects (in/out) to layout regions',
  parameters: [
    { name: 'layoutId', type: 'number', description: 'Layout ID', required: true },
    { name: 'zoomType', type: 'string', description: 'Zoom type: in, out, both', required: false },
    { name: 'duration', type: 'number', description: 'Zoom duration in milliseconds', required: false },
    { name: 'intensity', type: 'string', description: 'Zoom intensity: subtle, normal, dramatic', required: false },
    { name: 'regionId', type: 'number', description: 'Specific region ID (optional)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const zoomType = params.zoomType || 'both';
      const intensity = params.intensity || 'normal';
      
      // Adjust duration based on intensity
      let duration = params.duration;
      if (!duration) {
        const durationMap: any = {
          'subtle': 400,
          'normal': 600,
          'dramatic': 1000
        };
        duration = durationMap[intensity] || 600;
      }
      
      let transitionIn = null;
      let transitionOut = null;
      
      if (zoomType === 'in' || zoomType === 'both') {
        transitionIn = 'zoomIn';
      }
      if (zoomType === 'out' || zoomType === 'both') {
        transitionOut = 'zoomOut';
      }
      
      // Use the transition_apply logic
      const applyParams = {
        ...params,
        transitionIn,
        transitionOut,
        duration,
        _xiboClient: client
      };
      
      const result = await transitionApply.handler(applyParams);
      
      return `🔍 **Effet de zoom appliqué (${intensity})**\n\n` + result;
    } catch (error: any) {
      return `Erreur lors de l'application de l'effet de zoom: ${error.message}`;
    }
  }
};

// ========== RESOLUTION MANAGEMENT TOOLS ==========

const resolutionList: ToolDefinition = {
  name: 'resolution_list',
  description: 'List available display resolutions and current settings',
  parameters: [
    { name: 'displayId', type: 'number', description: 'Specific display ID to check resolution', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      // Standard resolutions commonly used
      const standardResolutions = [
        { name: '4K Ultra HD', width: 3840, height: 2160, ratio: '16:9' },
        { name: '1440p (2K)', width: 2560, height: 1440, ratio: '16:9' },
        { name: '1080p Full HD', width: 1920, height: 1080, ratio: '16:9' },
        { name: '720p HD', width: 1280, height: 720, ratio: '16:9' },
        { name: 'Portrait 1080p', width: 1080, height: 1920, ratio: '9:16' },
        { name: 'Portrait 720p', width: 720, height: 1280, ratio: '9:16' },
        { name: 'Ultra-wide 3440x1440', width: 3440, height: 1440, ratio: '21:9' },
        { name: 'Square 1080x1080', width: 1080, height: 1080, ratio: '1:1' }
      ];

      let result = `📺 **Résolutions disponibles**\n\n`;
      
      if (params.displayId) {
        // Get specific display information
        try {
          const displayResponse = await client.get(`/display/${params.displayId}`);
          const display = displayResponse.data;
          
          result += `🎯 **Écran ciblé:** ${display.display}\n`;
          result += `   📐 Résolution actuelle: ${display.width || 'N/A'} x ${display.height || 'N/A'}\n`;
          result += `   📊 Status: ${display.licensed ? '✅ Licencié' : '❌ Non licencié'}\n`;
          result += `   🔌 En ligne: ${display.loggedIn ? '✅ Oui' : '❌ Non'}\n\n`;
        } catch (error) {
          result += `⚠️ **Impossible de récupérer les infos de l'écran ${params.displayId}**\n\n`;
        }
      }
      
      result += `📋 **Résolutions standards:**\n`;
      standardResolutions.forEach((res: any, index: number) => {
        result += `   ${index + 1}. **${res.name}**\n`;
        result += `      📐 ${res.width} x ${res.height} (${res.ratio})\n`;
        
        // Add usage recommendations
        if (res.ratio === '16:9') {
          result += `      💡 Idéal pour: Écrans horizontaux, vidéos\n`;
        } else if (res.ratio === '9:16') {
          result += `      💡 Idéal pour: Écrans verticaux, portraits\n`;
        } else if (res.ratio === '21:9') {
          result += `      💡 Idéal pour: Écrans ultra-larges\n`;
        } else if (res.ratio === '1:1') {
          result += `      💡 Idéal pour: Contenus carrés, réseaux sociaux\n`;
        }
        
        result += '\n';
      });
      
      result += `🔧 **Configuration recommandée pour Québec/Montréal:**\n`;
      result += `   • Écrans intérieurs: 1920x1080 (Full HD)\n`;
      result += `   • Écrans extérieurs: 3840x2160 (4K)\n`;
      result += `   • Totems verticaux: 1080x1920 (Portrait)\n`;
      result += `   • Écrans ultra-larges: 3440x1440\n`;
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des résolutions: ${error.message}`;
    }
  }
};

const resolutionSet: ToolDefinition = {
  name: 'resolution_set',
  description: 'Set or update display resolution settings',
  parameters: [
    { name: 'layoutId', type: 'number', description: 'Layout ID to update resolution for', required: false },
    { name: 'width', type: 'number', description: 'Width in pixels', required: true },
    { name: 'height', type: 'number', description: 'Height in pixels', required: true },
    { name: 'description', type: 'string', description: 'Description of the resolution change', required: false },
    { name: 'backgroundColor', type: 'string', description: 'Background color (hex)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      if (params.layoutId) {
        // Update specific layout resolution
        const layoutResponse = await client.get(`/layout/${params.layoutId}`);
        const layout = layoutResponse.data;
        
        const updateData = {
          layoutId: params.layoutId,
          layout: layout.layout,
          description: params.description || layout.description,
          tags: layout.tags,
          width: params.width,
          height: params.height,
          backgroundColor: params.backgroundColor || layout.backgroundColor,
          backgroundImageId: layout.backgroundImageId,
          backgroundzIndex: layout.backgroundzIndex
        };
        
        await client.put(`/layout/${params.layoutId}`, updateData);
        
        // Calculate aspect ratio
        const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
        const divisor = gcd(params.width, params.height);
        const ratioW = params.width / divisor;
        const ratioH = params.height / divisor;
        
        let result = `📺 **Résolution mise à jour**\n\n`;
        result += `📋 **Layout:** ${layout.layout} (${params.layoutId})\n`;
        result += `📐 **Nouvelle résolution:** ${params.width} x ${params.height}\n`;
        result += `📊 **Ratio:** ${ratioW}:${ratioH}\n`;
        
        if (params.backgroundColor) {
          result += `🎨 **Fond:** ${params.backgroundColor}\n`;
        }
        
        // Add resolution category
        let category = 'Personnalisée';
        if (params.width === 1920 && params.height === 1080) category = 'Full HD (1080p)';
        else if (params.width === 3840 && params.height === 2160) category = '4K Ultra HD';
        else if (params.width === 1280 && params.height === 720) category = 'HD (720p)';
        else if (params.width === 1080 && params.height === 1920) category = 'Portrait 1080p';
        else if (params.width === 2560 && params.height === 1440) category = '2K (1440p)';
        
        result += `🏷️ **Catégorie:** ${category}\n\n`;
        
        result += `✅ **Changements appliqués avec succès**\n`;
        result += `💡 **Prochaines étapes:**\n`;
        result += `   1. Vérifiez les régions du layout\n`;
        result += `   2. Ajustez le contenu si nécessaire\n`;
        result += `   3. Publiez le layout\n`;
        
        return result;
      } else {
        // Create resolution template information
        const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
        const divisor = gcd(params.width, params.height);
        const ratioW = params.width / divisor;
        const ratioH = params.height / divisor;
        
        let result = `📺 **Configuration de résolution**\n\n`;
        result += `📐 **Résolution:** ${params.width} x ${params.height}\n`;
        result += `📊 **Ratio:** ${ratioW}:${ratioH}\n`;
        
        // Resolution recommendations
        result += `\n💡 **Recommandations pour cette résolution:**\n`;
        
        if (params.width >= 3840) {
          result += `   🎯 Qualité: Ultra haute définition (4K+)\n`;
          result += `   📺 Usage: Écrans premium, zones VIP\n`;
          result += `   ⚡ Performance: Nécessite matériel puissant\n`;
        } else if (params.width >= 1920) {
          result += `   🎯 Qualité: Haute définition\n`;
          result += `   📺 Usage: Écrans standard, polyvalent\n`;
          result += `   ⚡ Performance: Équilibré\n`;
        } else {
          result += `   🎯 Qualité: Définition standard\n`;
          result += `   📺 Usage: Écrans économiques, affichage simple\n`;
          result += `   ⚡ Performance: Faible consommation\n`;
        }
        
        result += `\n🔧 **Pour appliquer cette résolution:**\n`;
        result += `   Utilisez layoutId pour mettre à jour un layout existant\n`;
        
        return result;
      }
    } catch (error: any) {
      return `Erreur lors de la configuration de la résolution: ${error.message}`;
    }
  }
};

export const transitionTools: ToolDefinition[] = [
  transitionList,
  transitionApply,
  effectFade,
  effectSlide,
  effectZoom,
  resolutionList,
  resolutionSet
];