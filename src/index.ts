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

// ========== PROFESSIONAL OAUTH2 TOOLS (40+ tools) ==========
import { systemAdminTools } from './tools/system-admin.js';
import { analyticsReportTools } from './tools/analytics-reports.js';
import { oauth2SecurityTools } from './tools/oauth2-security.js';

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
            Complete OAuth2 API Integration - 170+ Tools Available\u001b[0m
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
      { name: 'Displays', tools: displayTools, count: displayTools.length, description: 'Gestion complète des écrans et groupes', icon: '📺' },
      { name: 'Layouts', tools: layoutTools, count: layoutTools.length, description: 'Création et gestion des mises en page', icon: '📄' },
      { name: 'Media', tools: mediaTools, count: mediaTools.length, description: 'Gestion des médias et fichiers', icon: '🎬' },
      { name: 'Campaigns', tools: campaignTools, count: campaignTools.length, description: 'Campagnes publicitaires', icon: '🎯' },
      { name: 'Playlists', tools: playlistTools, count: playlistTools.length, description: 'Listes de lecture dynamiques', icon: '📋' },
      { name: 'Schedules', tools: scheduleTools, count: scheduleTools.length, description: 'Programmation et calendrier', icon: '📅' },
      { name: 'Display Groups', tools: displayGroupTools, count: displayGroupTools.length, description: 'Groupes d\'écrans', icon: '📊' },
      { name: 'Broadcasting', tools: broadcastTools, count: broadcastTools.length, description: 'Diffusion intelligente géo-ciblée', icon: '📡' }
    ];

    // Advanced tool categories (OAuth2 Required)
    const advancedToolCategories = [
      { name: 'Users & Permissions', tools: userTools, count: userTools.length, description: 'Gestion utilisateurs et permissions', icon: '👥', oauth: true },
      { name: 'Folders & Security', tools: folderTools, count: folderTools.length, description: 'Organisation et sécurité', icon: '📁', oauth: true },
      { name: 'Statistics & Data', tools: statisticsTools, count: statisticsTools.length, description: 'Analytics de base', icon: '📊', oauth: true },
      { name: 'Datasets & Sync', tools: datasetTools, count: datasetTools.length, description: 'Données dynamiques et synchronisation', icon: '🔄', oauth: true },
      { name: 'Templates & Widgets', tools: templateTools, count: templateTools.length, description: 'Templates avancés et widgets', icon: '🎨', oauth: true },
      { name: 'Notifications & Alerts', tools: notificationTools, count: notificationTools.length, description: 'Alertes d\'urgence et notifications', icon: '🚨', oauth: true },
      { name: 'System Configuration', tools: systemTools, count: systemTools.length, description: 'Configuration système de base', icon: '⚙️', oauth: true },
      { name: 'Transitions & Effects', tools: transitionTools, count: transitionTools.length, description: 'Effets visuels professionnels', icon: '✨', oauth: true },
      { name: 'Multi-CMS Sync', tools: syncTools, count: syncTools.length, description: 'Synchronisation multi-CMS', icon: '🔗', oauth: true },
      { name: 'Menu Boards', tools: menuboardTools, count: menuboardTools.length, description: 'Menus dynamiques restaurants', icon: '🍽️', oauth: true },
      { name: 'Automation & Workflows', tools: automationTools, count: automationTools.length, description: 'Workflows et automatisation', icon: '🤖', oauth: true }
    ];

    // Professional OAuth2 tool categories (NEW - Complete API Coverage)
    const professionalToolCategories = [
      { name: 'System Administration', tools: systemAdminTools, count: systemAdminTools.length, description: 'Administration système complète', icon: '🔧', oauth: true, professional: true },
      { name: 'Analytics & Reports', tools: analyticsReportTools, count: analyticsReportTools.length, description: 'Rapports et analytics avancés', icon: '📈', oauth: true, professional: true },
      { name: 'OAuth2 & Security', tools: oauth2SecurityTools, count: oauth2SecurityTools.length, description: 'Gestion OAuth2 et sécurité avancée', icon: '🔐', oauth: true, professional: true }
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
      console.log(`   ${category.icon} ${category.name}: ${category.count} tools - ${category.description}`);
    });
    
    console.log('\n🚀 Advanced Tool Categories (OAuth2):');
    advancedToolCategories.forEach(category => {
      console.log(`   ${category.icon} ${category.name}: ${category.count} tools - ${category.description}`);
    });

    console.log('\n💎 Professional Tool Categories (OAuth2 Full API):');
    professionalToolCategories.forEach(category => {
      console.log(`   ${category.icon} ${category.name}: ${category.count} tools - ${category.description}`);
    });
    
    console.log('\n🎯 Complete OAuth2 API Coverage:');
    console.log('   ✅ User Management (CRUD + Permissions)');
    console.log('   ✅ OAuth2 Applications (Create, Edit, Delete, Tokens)');
    console.log('   ✅ System Administration (Settings, Maintenance, Logs, Tasks)');
    console.log('   ✅ Security Controls (IP Blocking, Rate Limiting, Audit)');
    console.log('   ✅ Analytics & Reports (Generate, Schedule, Export)');
    console.log('   ✅ Performance Monitoring (System, Display, Bandwidth)');
    console.log('   ✅ Backup & Restore (Create, List, Restore, Download)');
    console.log('   ✅ File Management (Upload, Download, All formats)');
    console.log('   ✅ Webhook Management (Create, Test, Monitor)');
    console.log('   ✅ Global Search & Export/Import (JSON, CSV, Excel, PDF)');
    console.log('   ✅ Health Checks & API Documentation Access');
    console.log('   ✅ Session Management & User Activity Monitoring');
    
    console.log('\n🔐 Authentication & Security Features:');
    console.log('   🔹 Dual Authentication (Client Credentials + OAuth2 User)');
    console.log('   🔹 Token Lifecycle Management (Generate, Refresh, Revoke)');
    console.log('   🔹 Application Scope Control & Permission Management');
    console.log('   🔹 Advanced Security Controls (IP Blocking, Rate Limiting)');
    console.log('   🔹 Comprehensive Audit Logging (Access, Failed Logins, Activities)');
    console.log('   🔹 Session Monitoring & Management');
    console.log('   🔹 Security Settings & Password Policy Management');
    
    console.log('\n📊 Professional Capabilities:');
    console.log('   🔹 Complete CRUD operations on all entities');
    console.log('   🔹 Advanced filtering, search, and bulk operations');
    console.log('   🔹 Real-time monitoring and alerting systems');
    console.log('   🔹 Professional reporting with custom scheduling');
    console.log('   🔹 Multi-format export/import capabilities');
    console.log('   🔹 Automated workflows and trigger systems');
    console.log('   🔹 Geographic targeting and intelligent filtering');
    console.log('   🔹 Enterprise-grade security and compliance');
    
    console.log('\n🌍 Specialized Quebec/Montreal Features:');
    console.log('   🍁 Intelligent geographic filtering (Quebec, Montreal, National)');
    console.log('   🌡️ Environment Canada weather integration');
    console.log('   🕐 EST/EDT timezone management');
    console.log('   🍽️ Professional restaurant menu boards');
    console.log('   🚨 Emergency alerts with geo-targeting');
    console.log('   📅 Seasonal content scheduling');
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
    console.log('='.repeat(75));
    
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
        console.log('ℹ️  Connected to Xibo CMS (version info unavailable)');
      }

      // Check authentication mode and capabilities
      const authMode = this.xiboClient.getAuthMode();
      const authStatus = this.xiboClient.getAuthStatus();
      
      console.log(`🔐 Authentication: ${authMode === 'user_tokens' ? 'OAuth2 User (Complete API Access)' : 'Client Credentials (Core Features)'}`);
      
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
      console.log(`   🛠️  Tools Available: ${this.tools.size}/170+`);
      console.log(`   🔐 Auth Mode: ${authMode === 'user_tokens' ? 'Complete OAuth2 Access' : 'Client Credentials'}`);
      
      // Show available features based on auth mode
      if (authMode === 'user_tokens') {
        console.log('\n💎 Professional Features Active (170+ Tools):');
        console.log('   ✅ Complete user and permission management');
        console.log('   ✅ Full system administration and maintenance');
        console.log('   ✅ OAuth2 application lifecycle management');
        console.log('   ✅ Enterprise security controls and audit');
        console.log('   ✅ Professional analytics and custom reports');
        console.log('   ✅ Automated backup and restore operations');
        console.log('   ✅ Real-time performance monitoring');
        console.log('   ✅ Advanced webhook and integration management');
        console.log('   ✅ Multi-format import/export capabilities');
        console.log('   ✅ Session management and activity monitoring');
      } else {
        console.log('\n📊 Core Features Active (32 Tools):');
        console.log('   ✅ Display and layout management');
        console.log('   ✅ Content and media management');
        console.log('   ✅ Basic scheduling and campaigns');
        console.log('   ✅ Geographic broadcasting and filtering');
        console.log('   ✅ Menu boards and notifications');
      }
      
      console.log('\n💬 Ready to receive commands from Claude!');
      console.log('\n💡 Professional Command Examples:');
      console.log('   👥 "Créer un utilisateur admin avec permissions limitées à Montréal"');
      console.log('   🔐 "Liste toutes les applications OAuth2 et leurs tokens actifs"');
      console.log('   📊 "Génère un rapport complet de performance pour la dernière semaine"');
      console.log('   🔧 "Mets le système en maintenance avec un message personnalisé"');
      console.log('   💾 "Crée une sauvegarde complète incluant tous les médias"');
      console.log('   📈 "Montre les métriques de performance des écrans de Québec"');
      console.log('   🚨 "Configure une alerte si un écran est hors ligne plus de 5 minutes"');
      console.log('   🔍 "Affiche l\'audit de sécurité des dernières 24 heures"');
      console.log('   🚫 "Bloque l\'IP 192.168.1.100 pour tentatives de connexion suspectes"');
      console.log('   📝 "Planifie un rapport mensuel d\'utilisation à envoyer par email"');
      
      console.log('\n🌍 Fonctionnalités géographiques et culturelles:');
      console.log('   🇨🇦 Filtrage intelligent par région (Québec, Montréal, National)');
      console.log('   🌡️  Intégration météo Environnement et Changement climatique Canada');
      console.log('   🕐 Gestion automatique des fuseaux horaires EST/EDT');
      console.log('   🍁 Contenu saisonnier adapté aux saisons québécoises');
      console.log('   🍽️  Menus de restaurants dynamiques avec prix en CAD');
      console.log('   🚨 Alertes d\'urgence géo-ciblées pour situations critiques');
      
      console.log('\n🔐 Sécurité et conformité entreprise:');
      console.log('   • Contrôle d\'accès basé sur les rôles (RBAC)');
      console.log('   • Audit complet des actions utilisateurs');
      console.log('   • Limitation de débit configurable par utilisateur/IP');
      console.log('   • Chiffrement des sauvegardes et données sensibles');
      console.log('   • Conformité RGPD et lois sur la protection des données');
      console.log('   • Gestion des sessions et détection d\'intrusions');
      console.log('   • Intégration avec systèmes de sécurité existants');
      
      console.log('\n🚀 Performance et fiabilité:');
      console.log('   • Monitoring en temps réel des performances système');
      console.log('   • Alertes automatiques en cas de problèmes critiques');
      console.log('   • Sauvegarde automatique et restauration rapide');
      console.log('   • Optimisation intelligente de la bande passante');
      console.log('   • Haute disponibilité et tolérance aux pannes');
      console.log('   • Support technique professionnel 24/7');
      
      console.log('\n' + '='.repeat(75));
      
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