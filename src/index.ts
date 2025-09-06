#!/usr/bin/env node
/**
 * Xtranumerik MCP Server for Xibo Digital Signage
 * Professional Edition v2.0.0 - Complete OAuth2 API Integration + Direct User Auth
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
import { getConfig, isDirectUserMode } from './config/index.js';
import XiboClient from './xibo-client.js';
import { DirectUserAuth } from './auth/direct-auth.js';
import { PermissionDetector } from './auth/permission-detector.js';

// ========== CORE TOOLS (32 tools) ==========
import { displayTools } from './tools/displays.js';
import { layoutTools } from './tools/layouts.js';
import { mediaTools } from './tools/media.js';
import { campaignTools } from './tools/campaigns.js';
import { playlistTools } from './tools/playlists.js';
import { scheduleTools } from './tools/schedules.js';
import { displayGroupTools } from './tools/display-groups.js';
import { broadcastTools } from './tools/broadcast.js';

// ========== ADVANCED TOOLS (77 tools) - OAuth2 Enhanced ==========
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

// ========== PROFESSIONAL OAUTH2 TOOLS (8 tools) ==========
import { systemAdminTools } from './tools/system-admin.js';
import { analyticsReportTools } from './tools/analytics-reports.js';
import { oauth2SecurityTools } from './tools/oauth2-security.js';

import { ToolDefinition, UserPermissionSet } from './types.js';

// ASCII Art Logo - Enhanced with correct count
const LOGO = `
\\u001b[36m __  ___                                           _ _    
 \\\\ \\/ / |_ _ __ __ _ _ __  _   _ _ __ ___   ___ _ __(_) | __
  \\  /| __| '__/ _\` | '_ \\| | | | '_ \` _ \\ / _ \\ '__| | |/ /
  /  \\| |_| | | (_| | | | | |_| | | | | | |  __/ |  | |   < 
 /_/\\_\\\\__|_|  \\__,_|_| |_|\\__,_|_| |_| |_|\\___|_|  |_|_|\\_\\
\\u001b[0m                                                            
\\u001b[32m            MCP Server for Xibo Digital Signage
            Professional Edition v2.0.0 by Xtranumerik Inc.
            Complete OAuth2 + Direct User Authentication - 117 Tools Available\\u001b[0m
`;

class XiboMCPServer {
  private server: Server;
  private xiboClient: XiboClient;
  private directAuth: DirectUserAuth | null = null;
  private permissionDetector: PermissionDetector | null = null;
  private config: any;
  private allTools: Map<string, ToolDefinition> = new Map();
  private availableTools: Map<string, ToolDefinition> = new Map();
  private userPermissions: UserPermissionSet | null = null;

  constructor() {
    // Load configuration
    this.config = getConfig();
    
    // Initialize authentication based on mode
    if (isDirectUserMode()) {
      this.directAuth = new DirectUserAuth(
        this.config.apiUrl,
        this.config.username!,
        this.config.password!
      );
    }
    
    // Initialize Xibo client with comprehensive OAuth2 support
    this.xiboClient = new XiboClient({
      apiUrl: this.config.apiUrl,
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      username: this.config.username,
      password: this.config.password,
      authMode: this.config.authMode,
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

    this.loadAllTools();
    this.setupHandlers();
  }

  private loadAllTools(): void {
    console.log('🛠️  Loading all 117 MCP tools...');

    // Core tool categories (32 tools) - Compatible with Client Credentials & Direct User
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

    // Advanced tool categories (77 tools) - OAuth2 Required or Direct User with permissions
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

    // Professional OAuth2 tool categories (8 tools) - Complete API Coverage
    const professionalToolCategories = [
      { name: 'System Administration', tools: systemAdminTools, count: systemAdminTools.length, description: 'Administration système complète', icon: '🔧', oauth: true, professional: true },
      { name: 'Analytics & Reports', tools: analyticsReportTools, count: analyticsReportTools.length, description: 'Rapports et analytics avancés', icon: '📈', oauth: true, professional: true },
      { name: 'OAuth2 & Security', tools: oauth2SecurityTools, count: oauth2SecurityTools.length, description: 'Gestion OAuth2 et sécurité avancée', icon: '🔐', oauth: true, professional: true }
    ];

    // Load all tools into the complete collection
    let totalToolsLoaded = 0;
    [...coreToolCategories, ...advancedToolCategories, ...professionalToolCategories].forEach(category => {
      console.log(`   📦 Loading ${category.name}: ${category.count} tools`);
      category.tools.forEach((tool: any) => {
        this.allTools.set(tool.name, tool);
        totalToolsLoaded++;
      });
    });

    console.log(`✅ Loaded ${totalToolsLoaded} total tools for dynamic filtering`);
    
    // Ensure we have expected number of tools
    if (totalToolsLoaded !== 117) {
      console.warn(`⚠️  Expected 117 tools but loaded ${totalToolsLoaded}. Check tool exports.`);
    }
  }

  private async initializeAuthentication(): Promise<void> {
    console.log('🔐 Initializing authentication...');

    if (isDirectUserMode() && this.directAuth) {
      console.log('🔑 Using Direct User Authentication mode');
      console.log('   ✅ Compatible with all 117 tools based on user permissions');
      
      const authResult = await this.directAuth.authenticate();
      if (authResult.success) {
        console.log(`✅ Direct authentication successful for user: ${authResult.username}`);
        
        // Get user permissions from direct auth
        this.userPermissions = this.directAuth.getUserPermissions();
        
        if (!this.userPermissions) {
          console.log('⚠️  No specific permissions detected, using default viewer permissions');
          this.userPermissions = PermissionDetector.createViewerPermissions();
        }
      } else {
        console.error('❌ Direct authentication failed:', authResult.error);
        
        // Fallback to basic viewer permissions
        console.log('🔄 Falling back to viewer-only permissions');
        this.userPermissions = PermissionDetector.createViewerPermissions();
      }
    } else {
      console.log('🔑 Using Client Credentials mode');
      console.log('   ℹ️  Limited to core tools (32) + accessible advanced tools');
      
      // For client credentials, try to detect permissions from API
      try {
        const isConnected = await this.xiboClient.testConnection();
        if (isConnected) {
          // Try to determine permissions based on what endpoints we can access
          this.userPermissions = await this.detectClientCredentialPermissions();
        }
      } catch (error) {
        console.log('⚠️  Could not detect permissions, using default editor permissions');
        this.userPermissions = PermissionDetector.createEditorPermissions();
      }
    }

    // Initialize permission detector
    this.permissionDetector = new PermissionDetector(this.userPermissions!);
    
    // Filter available tools based on permissions
    this.filterAvailableTools();

    // Show permission summary
    const summary = this.permissionDetector.getPermissionSummary();
    console.log(`👤 User Permission Level: ${summary.level}`);
    console.log(`🔧 Available Tools: ${summary.availableTools}/${summary.totalTools}`);
    console.log(`📊 Available Categories: ${summary.categories.length}`);
    
    if (summary.restrictions.length > 0) {
      console.log(`🚫 Restrictions: ${summary.restrictions.join(', ')}`);
    }
  }

  private async detectClientCredentialPermissions(): Promise<UserPermissionSet> {
    // Try to access various endpoints to determine permission level
    const permissions = PermissionDetector.createEditorPermissions();

    try {
      // Test user management access
      await this.xiboClient.request('GET', '/user');
      permissions.canManageUsers = true;
      permissions.level = 'admin';
      console.log('✅ User management access detected');
    } catch (error) {
      console.log('ℹ️  No user management access');
    }

    try {
      // Test system settings access
      await this.xiboClient.request('GET', '/settings');
      permissions.canManageSystem = true;
      permissions.level = 'super_admin';
      console.log('✅ System administration access detected');
    } catch (error) {
      console.log('ℹ️  No system administration access');
    }

    try {
      // Test reports access
      await this.xiboClient.request('GET', '/report');
      permissions.canViewReports = true;
      console.log('✅ Reports access detected');
    } catch (error) {
      console.log('ℹ️  No reports access');
    }

    return permissions;
  }

  private filterAvailableTools(): void {
    if (!this.permissionDetector) return;

    this.availableTools.clear();
    
    // Filter tools based on user permissions
    const availableToolNames = this.permissionDetector.getAvailableTools();
    
    availableToolNames.forEach(toolName => {
      const tool = this.allTools.get(toolName);
      if (tool) {
        this.availableTools.set(toolName, tool);
      }
    });

    console.log(`🔧 Filtered tools: ${this.availableTools.size} tools available for current user`);
  }

  private setupHandlers(): void {
    // List available tools (filtered by permissions)
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = Array.from(this.availableTools.values()).map(tool => ({
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
      
      // Check if tool is available for current user
      const tool = this.availableTools.get(name);

      if (!tool) {
        // Check if tool exists but is not available due to permissions
        const fullTool = this.allTools.get(name);
        if (fullTool) {
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Tool "${name}" requires higher permissions. Current level: ${this.userPermissions?.level || 'unknown'}`
          );
        } else {
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Tool "${name}" not found`
          );
        }
      }

      try {
        // Pass enhanced clients and config to tool handler
        // ✅ TOUS les outils reçoivent _directAuth pour compatibilité directe
        const result = await tool.handler({ 
          ...args, 
          _xiboClient: this.xiboClient, 
          _directAuth: this.directAuth,
          _permissions: this.userPermissions,
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
      // Initialize authentication and permissions
      await this.initializeAuthentication();

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

      // Show authentication details
      const authMode = this.config.authMode;
      console.log(`🔐 Authentication Mode: ${authMode === 'direct_user' ? 'Direct User' : 'Client Credentials'}`);
      
      if (this.directAuth && this.directAuth.isSessionValid()) {
        const session = this.directAuth.getSession();
        console.log(`👤 Authenticated as: ${session?.username}`);
        console.log(`🔑 Session expires: ${new Date(session?.expires_at || 0).toLocaleString()}`);
      }

      // Start the server
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      console.log('✅ Xibo MCP Server is running!');
      console.log('\n📝 Server Information:');
      console.log(`   🏢 Company: ${this.config.companyName}`);
      console.log(`   🖥️  Server: Xibo MCP Professional v2.0.0`);
      console.log(`   🌐 Xibo API: ${this.config.apiUrl}`);
      console.log(`   🛠️  Tools Available: ${this.availableTools.size}/117`);
      console.log(`   🔐 Auth Mode: ${authMode === 'direct_user' ? 'Direct User Authentication ✅' : 'Client Credentials'}`);
      console.log(`   👤 Permission Level: ${this.userPermissions?.level || 'unknown'}`);
      
      // Show available features based on permission level
      if (this.permissionDetector) {
        // Get permission summary for display purposes (commented out to avoid unused variable warning)
        // const summary = this.permissionDetector.getPermissionSummary();
        const toolCounts = this.permissionDetector.getToolCountByCategory();
        
        console.log('\n💎 Available Features:');
        Object.entries(toolCounts).forEach(([category, count]) => {
          console.log(`   ✅ ${category}: ${count} tools`);
        });

        if (this.permissionDetector.isBasicToolsOnly()) {
          console.log('\n💡 To unlock more tools:');
          console.log('   • Use OAuth2 authentication for advanced features');
          console.log('   • Request higher permissions from your Xibo administrator');
          console.log('   • Upgrade to a user account with more privileges');
        }
      }
      
      console.log('\n💬 Ready to receive commands from Claude!');
      console.log('\n💡 Command Examples (based on your permissions):');
      
      if (this.userPermissions?.level === 'super_admin') {
        console.log('   👥 "Créer un utilisateur admin avec permissions limitées à Montréal"');
        console.log('   🔐 "Liste toutes les applications OAuth2 et leurs tokens actifs"');
        console.log('   📊 "Génère un rapport complet de performance pour la dernière semaine"');
        console.log('   🔧 "Mets le système en maintenance avec un message personnalisé"');
        console.log('   💾 "Crée une sauvegarde complète incluant tous les médias"');
      } else if (this.userPermissions?.level === 'admin') {
        console.log('   👥 "Liste tous les utilisateurs et leurs dernières connexions"');
        console.log('   📊 "Génère des statistiques d\'utilisation des écrans"');
        console.log('   🚨 "Crée une alerte d\'urgence pour la région de Montréal"');
        console.log('   📈 "Affiche les rapports de performance des campagnes"');
      } else if (this.userPermissions?.level === 'editor') {
        console.log('   📺 "Affiche l\'état de tous mes écrans"');
        console.log('   📄 "Crée une nouvelle mise en page pour les promotions"');
        console.log('   🎬 "Upload et assigne ce média à la campagne été"');
        console.log('   📅 "Programme cette campagne pour le weekend"');
      } else {
        console.log('   📺 "Affiche la liste des écrans disponibles"');
        console.log('   📄 "Montre les mises en page existantes"');
        console.log('   🎬 "Liste les médias dans la bibliothèque"');
        console.log('   📊 "Affiche les campagnes actives"');
      }
      
      console.log('\n🌍 Fonctionnalités géographiques et culturelles:');
      console.log('   🇨🇦 Filtrage intelligent par région (Québec, Montréal, National)');
      console.log('   🌡️  Intégration météo Environnement et Changement climatique Canada');
      console.log('   🕐 Gestion automatique des fuseaux horaires EST/EDT');
      console.log('   🍁 Contenu saisonnier adapté aux saisons québécoises');
      console.log('   🍽️  Menus de restaurants dynamiques avec prix en CAD');
      console.log('   🚨 Alertes d\'urgence géo-ciblées pour situations critiques');
      
      console.log('\n🔐 Direct User Authentication:');
      console.log('   ✅ Compatible avec les 117 outils selon vos permissions');
      console.log('   🔑 Session management automatique avec refresh');
      console.log('   🛡️  Extraction automatique des permissions utilisateur');
      console.log('   🍪 Support complet des cookies de session Xibo');
      
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