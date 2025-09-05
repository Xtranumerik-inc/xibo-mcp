#!/usr/bin/env node
/**
 * Xtranumerik MCP Server for Xibo Digital Signage
 * Professional Edition v2.0.0 - Complete API Integration
 * @author Xtranumerik Inc.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import { getConfig } from './config/index.js';
import XiboClient from './xibo-client.js';

// Original 8 modules (32 tools)
import { displayTools } from './tools/displays.js';
import { layoutTools } from './tools/layouts.js';
import { mediaTools } from './tools/media.js';
import { campaignTools } from './tools/campaigns.js';
import { playlistTools } from './tools/playlists.js';
import { scheduleTools } from './tools/schedules.js';
import { displayGroupTools } from './tools/display-groups.js';
import { broadcastTools } from './tools/broadcast.js';

// New 11 advanced modules (85+ tools) - OAuth2 User Authentication Required
import { userTools } from './tools/users.js';
import { folderTools } from './tools/folders.js';
import { statisticsTools } from './tools/statistics.js';
import { datasetTools } from './tools/datasets.js';
import { templateTools } from './tools/templates.js';
import { notificationTools } from './tools/notifications.js';
import { systemTools } from './tools/system.js';
import { transitionTools } from './tools/transitions.js';
import { syncTools } from './tools/sync.js';
import { menuboardTools } from './tools/menuboards.js';
import { automationTools } from './tools/actions.js';

import { ToolDefinition } from './types.js';

// ASCII Art Logo - Enhanced
const LOGO = `
\u001b[36m __  ___                                           _ _    
 \\\\ \\\\/ / |_ _ __ __ _ _ __  _   _ _ __ ___   ___ _ __(_) | __
  \\\\  /| __| '__/ _\\` | '_ \\\\| | | | '_ \\` _ \\\\ / _ \\\\ '__| | |/ /
  /  \\\\| |_| | | (_| | | | | |_| | | | | | |  __/ |  | |   < 
 /_/\\\\_\\\\\\\\__|_|  \\\\__,_|_| |_|\\\\__,_|_| |_| |_|\\\\___|_|  |_|_|\\\\_\\\\
\u001b[0m                                                            
\u001b[32m            MCP Server for Xibo Digital Signage
            Professional Edition v2.0.0 by Xtranumerik Inc.
            Complete API Integration - 117 Tools Available\u001b[0m
`;

class XiboMCPServer {
  private server: Server;
  private xiboClient: XiboClient;
  private config: any;
  private tools: Map<string, ToolDefinition> = new Map();

  constructor() {
    // Load configuration
    this.config = getConfig();
    
    // Initialize Xibo client with dual authentication support
    this.xiboClient = new XiboClient({
      apiUrl: this.config.apiUrl,
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      grantType: this.config.grantType
    });

    // Initialize MCP server
    this.server = new Server(
      {
        name: `${this.config.companyName} - Xibo MCP Professional`,
        version: '2.0.0'
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupTools();
    this.setupHandlers();
  }

  private setupTools(): void {
    console.log('🛠️  Loading MCP tools...');

    // Core tool categories (32 original tools)
    const coreToolCategories = [
      { name: 'Displays', tools: displayTools, count: displayTools.length, description: 'Gestion complète des écrans' },
      { name: 'Layouts', tools: layoutTools, count: layoutTools.length, description: 'Création et gestion des mises en page' },
      { name: 'Media', tools: mediaTools, count: mediaTools.length, description: 'Gestion des médias et fichiers' },
      { name: 'Campaigns', tools: campaignTools, count: campaignTools.length, description: 'Campagnes publicitaires' },
      { name: 'Playlists', tools: playlistTools, count: playlistTools.length, description: 'Listes de lecture dynamiques' },
      { name: 'Schedules', tools: scheduleTools, count: scheduleTools.length, description: 'Programmation et calendrier' },
      { name: 'Display Groups', tools: displayGroupTools, count: displayGroupTools.length, description: 'Groupes d\\'écrans' },
      { name: 'Broadcasting', tools: broadcastTools, count: broadcastTools.length, description: 'Diffusion intelligente géo-ciblée' }
    ];

    // Advanced tool categories (85+ new tools) - OAuth2 Required
    const advancedToolCategories = [
      { name: 'Users & Groups', tools: userTools, count: userTools.length, description: 'Gestion utilisateurs et permissions', oauth: true },
      { name: 'Folders & Permissions', tools: folderTools, count: folderTools.length, description: 'Organisation et sécurité', oauth: true },
      { name: 'Statistics & Reports', tools: statisticsTools, count: statisticsTools.length, description: 'Analytics et rapports détaillés', oauth: true },
      { name: 'Datasets', tools: datasetTools, count: datasetTools.length, description: 'Données dynamiques et synchronisation', oauth: true },
      { name: 'Templates & Widgets', tools: templateTools, count: templateTools.length, description: 'Templates avancés et widgets', oauth: true },
      { name: 'Notifications & Alerts', tools: notificationTools, count: notificationTools.length, description: 'Alertes d\\'urgence et notifications', oauth: true },
      { name: 'System Configuration', tools: systemTools, count: systemTools.length, description: 'Configuration système avancée', oauth: true },
      { name: 'Transitions & Effects', tools: transitionTools, count: transitionTools.length, description: 'Effets visuels professionnels', oauth: true },
      { name: 'Sync & Integrations', tools: syncTools, count: syncTools.length, description: 'Synchronisation multi-CMS', oauth: true },
      { name: 'Menu Boards', tools: menuboardTools, count: menuboardTools.length, description: 'Menus dynamiques restaurants', oauth: true },
      { name: 'Automation', tools: automationTools, count: automationTools.length, description: 'Workflows et automatisation', oauth: true }
    ];

    let coreToolsCount = 0;
    let advancedToolsCount = 0;

    // Load core tools
    coreToolCategories.forEach(category => {
      category.tools.forEach(tool => {
        this.tools.set(tool.name, tool);
        coreToolsCount++;
      });
    });

    // Load advanced tools
    advancedToolCategories.forEach(category => {
      category.tools.forEach(tool => {
        this.tools.set(tool.name, tool);
        advancedToolsCount++;
      });
    });

    const totalTools = coreToolsCount + advancedToolsCount;
    const totalCategories = coreToolCategories.length + advancedToolCategories.length;

    console.log(`✅ Loaded ${totalTools} tools across ${totalCategories} categories`);
    console.log(`   📊 Core Tools: ${coreToolsCount} (Client Credentials)`);
    console.log(`   🚀 Advanced Tools: ${advancedToolsCount} (OAuth2 User Auth)`);
    
    console.log('\\n📋 Core Tool Categories:');
    coreToolCategories.forEach(category => {
      console.log(`   • ${category.name}: ${category.count} tools - ${category.description}`);
    });
    
    console.log('\\n🚀 Advanced Tool Categories (OAuth2):');
    advancedToolCategories.forEach(category => {
      console.log(`   • ${category.name}: ${category.count} tools - ${category.description}`);
    });
    
    console.log('\\n🎯 Key Professional Features:');
    console.log('   - Complete Xibo 4.x API integration (117 tools)');
    console.log('   - Dual authentication: Client Credentials + OAuth2 User');
    console.log('   - Intelligent Quebec/Montreal geographic filtering');
    console.log('   - Emergency alerts with geo-targeting');
    console.log('   - Professional menu boards for restaurants');
    console.log('   - Advanced analytics and reporting');
    console.log('   - Multi-CMS synchronization capabilities');
    console.log('   - Automated workflows and triggers');
    console.log('   - Natural language control in French/English');
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = Array.from(this.tools.values()).map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: {
          type: 'object',
          properties: tool.parameters.reduce((props, param) => {
            props[param.name] = {
              type: param.type,
              description: param.description,
              ...(param.enum && { enum: param.enum }),
              ...(param.default !== undefined && { default: param.default })
            };
            return props;
          }, {} as any),
          required: tool.parameters.filter(p => p.required).map(p => p.name)
        }
      }));

      return { tools };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const tool = this.tools.get(name);

      if (!tool) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Tool "${name}" not found`
        );
      }

      try {
        // Pass Xibo client and config to tool handler
        const result = await tool.handler({ 
          ...args, 
          _xiboClient: this.xiboClient, 
          _config: this.config 
        });
        
        return {
          content: [
            {
              type: 'text',
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error: any) {
        console.error(`Error executing tool "${name}":`, error.message);
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`
        );
      }
    });
  }

  async start(): Promise<void> {
    console.log(LOGO);
    console.log('🚀 Starting Xtranumerik MCP Server for Xibo...');
    console.log('='.repeat(60));
    
    try {
      // Test Xibo connection
      console.log('🔍 Testing connection to Xibo CMS...');
      const isConnected = await this.xiboClient.testConnection();
      
      if (!isConnected) {
        throw new Error('Failed to connect to Xibo CMS. Please check your configuration.');
      }

      // Get server info
      try {
        const serverInfo = await this.xiboClient.getServerInfo();
        if (serverInfo.version) {
          console.log(`ℹ️  Connected to Xibo CMS version ${serverInfo.version}`);
        }
      } catch (error) {
        // Server info not critical
        console.log('ℹ️  Connected to Xibo CMS (version info unavailable)');
      }

      // Check authentication mode
      const authMode = this.xiboClient.getAuthMode();
      console.log(`🔐 Authentication: ${authMode === 'user_tokens' ? 'OAuth2 User (Full Access)' : 'Client Credentials (Core Features)'}`);
      
      if (authMode === 'client_credentials') {
        console.log('💡 Run "npm run auth-user" for advanced features access');
      }

      // Start the server
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      console.log('✅ Xibo MCP Server is running!');
      console.log('\\n📝 Server Information:');
      console.log(`   🏢 Company: ${this.config.companyName}`);
      console.log(`   🖥️  Server: Xibo MCP Professional v2.0.0`);
      console.log(`   🌐 Xibo API: ${this.config.apiUrl}`);
      console.log(`   🛠️  Tools Available: ${this.tools.size}/117`);
      console.log(`   🔐 Auth Mode: ${authMode === 'user_tokens' ? 'Full Access' : 'Core Features'}`);
      
      console.log('\\n💬 Ready to receive commands from Claude!');
      console.log('\\n💡 Example commands to try:');
      console.log('   🍁 "Mets cette publicité dans tous mes écrans sauf ceux à Québec"');
      console.log('   📊 "Montre-moi les statistiques de mes écrans de Montréal"');
      console.log('   📅 "Programme cette campagne pour demain matin de 9h à 17h"');
      console.log('   🎨 "Crée une mise en page avec des transitions élégantes"');
      console.log('   🚨 "Diffuse cette alerte d\\'urgence dans la région de Québec"');
      console.log('   🍽️  "Crée un menu board pour mon restaurant avec prix dynamiques"');
      console.log('   🤖 "Configure une automatisation pour les alertes météo"');
      
      console.log('\\n🎯 Fonctionnalités professionnelles disponibles:');
      console.log('   🌍 Diffusion intelligente avec filtres géographiques');
      console.log('   📈 Analytics et rapports détaillés');
      console.log('   🚨 Alertes d\\'urgence géo-ciblées');
      console.log('   👥 Gestion avancée des utilisateurs et permissions');
      console.log('   🍽️  Menu boards dynamiques pour restaurants');
      console.log('   🔄 Synchronisation multi-CMS');
      console.log('   🤖 Workflows et automatisation avancés');
      console.log('   🎭 Transitions et effets visuels professionnels');
      
      console.log('\\n🍁 Optimisé pour le marché québécois:');
      console.log('   • Support complet français/anglais');
      console.log('   • Intégration Environnement Canada');
      console.log('   • Fuseau horaire EST/EDT automatique');
      console.log('   • Filtrage Québec/Montréal intelligent');
      console.log('   • Contenu saisonnier adapté');
      
      console.log('\\n' + '='.repeat(60));
      
    } catch (error: any) {
      console.error('❌ Failed to start server:', error.message);
      process.exit(1);
    }
  }
}

// Start the server
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new XiboMCPServer();
  server.start().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default XiboMCPServer;