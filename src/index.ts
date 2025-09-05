#!/usr/bin/env node
/**
 * Xtranumerik MCP Server for Xibo Digital Signage
 * Professional Edition v2.0.0 - Complete OAuth2 API Integration
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

// ========== CORE TOOLS (32 tools) ==========
import { displayTools } from './tools/displays.js';
import { layoutTools } from './tools/layouts.js';
import { mediaTools } from './tools/media.js';
import { campaignTools } from './tools/campaigns.js';
import { playlistTools } from './tools/playlists.js';
import { scheduleTools } from './tools/schedules.js';
import { displayGroupTools } from './tools/display-groups.js';
import { broadcastTools } from './tools/broadcast.js';

// ========== ADVANCED TOOLS (100+ tools) - OAuth2 Enhanced ==========
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

// ========== NEW OAUTH2 & PROFESSIONAL TOOLS (30+ tools) ==========
import { systemAdminTools } from './tools/system-admin.js';
import { analyticsReportTools } from './tools/analytics-reports.js';

import { ToolDefinition } from './types.js';

// ASCII Art Logo - Enhanced
const LOGO = `
\u001b[36m __  ___                                           _ _    
 \\ \\/ / |_ _ __ __ _ _ __  _   _ _ __ ___   ___ _ __(_) | __
  \\  /| __| '__/ _\` | '_ \\| | | | '_ \` _ \\ / _ \\ '__| | |/ /
  /  \\| |_| | | (_| | | | | |_| | | | | | |  __/ |  | |   < 
 /_/\\_\\\\__|_|  \\__,_|_| |_|\\__,_|_| |_| |_|\\___|_|  |_|_|\\_\\
\u001b[0m                                                            
\u001b[32m            MCP Server for Xibo Digital Signage
            Professional Edition v2.0.0 by Xtranumerik Inc.
            Complete OAuth2 API Integration - 150+ Tools Available\u001b[0m
`;

class XiboMCPServer {
  private server: Server;
  private xiboClient: XiboClient;
  private config: any;
  private tools: Map<string, ToolDefinition> = new Map();

  constructor() {
    // Load configuration
    this.config = getConfig();
    
    // Initialize Xibo client with comprehensive OAuth2 support
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
      { name: 'Displays', tools: displayTools, count: displayTools.length, description: 'Gestion complète des écrans et groupes' },
      { name: 'Layouts', tools: layoutTools, count: layoutTools.length, description: 'Création et gestion des mises en page' },
      { name: 'Media', tools: mediaTools, count: mediaTools.length, description: 'Gestion des médias et fichiers' },
      { name: 'Campaigns', tools: campaignTools, count: campaignTools.length, description: 'Campagnes publicitaires' },
      { name: 'Playlists', tools: playlistTools, count: playlistTools.length, description: 'Listes de lecture dynamiques' },
      { name: 'Schedules', tools: scheduleTools, count: scheduleTools.length, description: 'Programmation et calendrier' },
      { name: 'Display Groups', tools: displayGroupTools, count: displayGroupTools.length, description: 'Groupes d\'écrans' },
      { name: 'Broadcasting', tools: broadcastTools, count: broadcastTools.length, description: 'Diffusion intelligente géo-ciblée' }
    ];

    // Advanced tool categories (OAuth2 Required)
    const advancedToolCategories = [
      { name: 'Users & Groups', tools: userTools, count: userTools.length, description: 'Gestion utilisateurs et permissions', oauth: true },
      { name: 'Folders & Security', tools: folderTools, count: folderTools.length, description: 'Organisation et sécurité', oauth: true },
      { name: 'Statistics & Analytics', tools: statisticsTools, count: statisticsTools.length, description: 'Analytics de base', oauth: true },
      { name: 'Datasets & Sync', tools: datasetTools, count: datasetTools.length, description: 'Données dynamiques et synchronisation', oauth: true },
      { name: 'Templates & Widgets', tools: templateTools, count: templateTools.length, description: 'Templates avancés et widgets', oauth: true },
      { name: 'Notifications & Alerts', tools: notificationTools, count: notificationTools.length, description: 'Alertes d\'urgence et notifications', oauth: true },
      { name: 'System Configuration', tools: systemTools, count: systemTools.length, description: 'Configuration système de base', oauth: true },
      { name: 'Transitions & Effects', tools: transitionTools, count: transitionTools.length, description: 'Effets visuels professionnels', oauth: true },
      { name: 'Multi-CMS Sync', tools: syncTools, count: syncTools.length, description: 'Synchronisation multi-CMS', oauth: true },
      { name: 'Menu Boards', tools: menuboardTools, count: menuboardTools.length, description: 'Menus dynamiques restaurants', oauth: true },
      { name: 'Automation & Workflows', tools: automationTools, count: automationTools.length, description: 'Workflows et automatisation', oauth: true }
    ];

    // Professional OAuth2 tool categories (NEW)
    const professionalToolCategories = [
      { name: 'System Administration', tools: systemAdminTools, count: systemAdminTools.length, description: 'Administration système complète', oauth: true, professional: true },
      { name: 'Analytics & Reports', tools: analyticsReportTools, count: analyticsReportTools.length, description: 'Rapports et analytics avancés', oauth: true, professional: true }
    ];

    let coreToolsCount = 0;
    let advancedToolsCount = 0;
    let professionalToolsCount = 0;

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

    // Load professional OAuth2 tools
    professionalToolCategories.forEach(category => {
      category.tools.forEach(tool => {
        this.tools.set(tool.name, tool);
        professionalToolsCount++;
      });
    });

    const totalTools = coreToolsCount + advancedToolsCount + professionalToolsCount;
    const totalCategories = coreToolCategories.length + advancedToolCategories.length + professionalToolCategories.length;

    console.log(`✅ Loaded ${totalTools} tools across ${totalCategories} categories`);
    console.log(`   📊 Core Tools: ${coreToolsCount} (Client Credentials)`);
    console.log(`   🚀 Advanced Tools: ${advancedToolsCount} (OAuth2 User Auth)`);
    console.log(`   💎 Professional Tools: ${professionalToolsCount} (OAuth2 Full API)`);
    
    console.log('\n📋 Core Tool Categories:');
    coreToolCategories.forEach(category => {
      console.log(`   • ${category.name}: ${category.count} tools - ${category.description}`);
    });
    
    console.log('\n🚀 Advanced Tool Categories (OAuth2):');
    advancedToolCategories.forEach(category => {
      console.log(`   • ${category.name}: ${category.count} tools - ${category.description}`);
    });

    console.log('\n💎 Professional Tool Categories (OAuth2 Full API):');
    professionalToolCategories.forEach(category => {
      console.log(`   • ${category.name}: ${category.count} tools - ${category.description}`);
    });
    
    console.log('\n🎯 Comprehensive API Features:');
    console.log('   ✅ User Management (Create, Edit, Delete, Permissions)');
    console.log('   ✅ OAuth2 Application Management');
    console.log('   ✅ System Administration (Settings, Maintenance, Logs)');
    console.log('   ✅ Security & Audit (IP Control, Rate Limiting, Access Logs)');
    console.log('   ✅ Advanced Analytics & Reports (Custom, Scheduled)');
    console.log('   ✅ Performance Monitoring (System, Display, Bandwidth)');
    console.log('   ✅ Backup & Restore Operations');
    console.log('   ✅ Webhook Management');
    console.log('   ✅ File Upload/Download (All formats)');
    console.log('   ✅ Global Search & Export/Import');
    console.log('   ✅ Health Checks & API Documentation');
    
    console.log('\n🔐 Authentication Capabilities:');
    console.log('   • Client Credentials Grant (Basic API access)');
    console.log('   • OAuth2 User Authentication (Full API access)');
    console.log('   • Token Management & Refresh');
    console.log('   • Application Scope Control');
    console.log('   • Rate Limiting & Security Controls');
    
    console.log('\n📊 Complete OAuth2 Coverage:');
    console.log('   🔹 All CRUD operations (Create, Read, Update, Delete)');
    console.log('   🔹 Advanced filtering and search');
    console.log('   🔹 Bulk operations and batch processing');
    console.log('   🔹 Real-time monitoring and alerts');
    console.log('   🔹 Professional reporting and analytics');
    console.log('   🔹 Multi-format export/import (JSON, CSV, Excel, PDF)');
    console.log('   🔹 Automated workflows and scheduling');
    console.log('   🔹 Geographic targeting and filtering');
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = Array.from(this.tools.values()).map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: (tool as any).parameters || {
          type: 'object',
          properties: {},
          required: []
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
        // Pass enhanced Xibo client and config to tool handler
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
    console.log('='.repeat(70));
    
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

      // Check authentication mode and capabilities
      const authMode = this.xiboClient.getAuthMode();
      const authStatus = this.xiboClient.getAuthStatus();
      
      console.log(`🔐 Authentication: ${authMode === 'user_tokens' ? 'OAuth2 User (Full API Access)' : 'Client Credentials (Core Features)'}`);
      
      if (authMode === 'user_tokens' && authStatus.userInfo) {
        console.log(`👤 Authenticated as: ${authStatus.userInfo.username}`);
        if (authStatus.tokenStats) {
          console.log(`🔑 Token expires: ${new Date(authStatus.tokenStats.expiresAt).toLocaleString()}`);
        }
      } else if (authMode === 'client_credentials') {
        console.log('💡 Run "npm run auth-user" for complete OAuth2 API access');
      }

      // Start the server
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      console.log('✅ Xibo MCP Server is running!');
      console.log('\n📝 Server Information:');
      console.log(`   🏢 Company: ${this.config.companyName}`);
      console.log(`   🖥️  Server: Xibo MCP Professional v2.0.0`);
      console.log(`   🌐 Xibo API: ${this.config.apiUrl}`);
      console.log(`   🛠️  Tools Available: ${this.tools.size}/150+`);
      console.log(`   🔐 Auth Mode: ${authMode === 'user_tokens' ? 'Full OAuth2 Access' : 'Client Credentials'}`);
      
      // Show available features based on auth mode
      if (authMode === 'user_tokens') {
        console.log('\n💎 Professional Features Active:');
        console.log('   ✅ Complete user management');
        console.log('   ✅ System administration');
        console.log('   ✅ OAuth2 application management');
        console.log('   ✅ Advanced security controls');
        console.log('   ✅ Professional analytics & reports');
        console.log('   ✅ Backup & restore operations');
        console.log('   ✅ Performance monitoring');
        console.log('   ✅ Webhook management');
      } else {
        console.log('\n📊 Core Features Active:');
        console.log('   ✅ Display management');
        console.log('   ✅ Content management');
        console.log('   ✅ Basic scheduling');
        console.log('   ✅ Geographic broadcasting');
      }
      
      console.log('\n💬 Ready to receive commands from Claude!');
      console.log('\n💡 Example professional commands:');
      console.log('   👥 "Créer un utilisateur admin pour Montréal avec permissions limitées"');
      console.log('   📊 "Génère un rapport complet de performance pour cette semaine"');
      console.log('   🔧 "Mets le système en maintenance avec un message personnalisé"');
      console.log('   💾 "Crée une sauvegarde complète incluant tous les médias"');
      console.log('   🔐 "Liste toutes les applications OAuth2 et leurs tokens actifs"');
      console.log('   📈 "Montre les métriques de performance des écrans de Québec"');
      console.log('   🚨 "Configure une alerte automatique si un écran est hors ligne"');
      console.log('   🔍 "Affiche les logs de sécurité des dernières 24h"');
      
      console.log('\n🌍 Fonctionnalités géographiques avancées:');
      console.log('   🇨🇦 Filtrage intelligent Québec/Montréal');
      console.log('   🌡️  Intégration météo Environnement Canada');
      console.log('   🕐 Gestion fuseau horaire EST/EDT');
      console.log('   🍁 Contenu saisonnier adapté au Québec');
      
      console.log('\n🔐 Sécurité et conformité:');
      console.log('   • Contrôle d\'accès basé sur les rôles');
      console.log('   • Audit complet des actions utilisateur');
      console.log('   • Limitation de débit par utilisateur/IP');
      console.log('   • Sauvegarde automatique et chiffrée');
      console.log('   • Conformité RGPD et lois québécoises');
      
      console.log('\n' + '='.repeat(70));
      
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