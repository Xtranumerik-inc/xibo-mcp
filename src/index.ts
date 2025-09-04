#!/usr/bin/env node
/**
 * Xtranumerik MCP Server for Xibo Digital Signage
 * Professional Edition v1.0.0
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
import { displayTools } from './tools/displays.js';
import { layoutTools } from './tools/layouts.js';
import { mediaTools } from './tools/media.js';
import { campaignTools } from './tools/campaigns.js';
import { playlistTools } from './tools/playlists.js';
import { scheduleTools } from './tools/schedules.js';
import { displayGroupTools } from './tools/display-groups.js';
import { broadcastTools } from './tools/broadcast.js';
import { ToolDefinition } from './types.js';

// ASCII Art Logo
const LOGO = `
\u001b[36m __  ___                                           _ _    
 \\ \\/ / |_ _ __ __ _ _ __  _   _ _ __ ___   ___ _ __(_) | __
  \\  /| __| '__/ _\` | '_ \\| | | | '_ \` _ \\ / _ \\ '__| | |/ /
  /  \\| |_| | | (_| | | | | |_| | | | | | |  __/ |  | |   < 
 /_/\\_\\\\__|_|  \\__,_|_| |_|\\__,_|_| |_| |_|\\___|_|  |_|_|\\_\\
\u001b[0m                                                            
\u001b[32m            MCP Server for Xibo Digital Signage
            Professional Edition by Xtranumerik Inc.
            Version 1.0.0\u001b[0m
`;

class XiboMCPServer {
  private server: Server;
  private xiboClient: XiboClient;
  private config: any;
  private tools: Map<string, ToolDefinition> = new Map();

  constructor() {
    // Load configuration
    this.config = getConfig();
    
    // Initialize Xibo client
    this.xiboClient = new XiboClient({
      apiUrl: this.config.apiUrl,
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      grantType: this.config.grantType
    });

    // Initialize MCP server
    this.server = new Server(
      {
        name: `${this.config.companyName} - Xibo MCP`,
        version: this.config.serverVersion
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

    // Load all tool categories
    const toolCategories = [
      { name: 'Displays', tools: displayTools, count: displayTools.length },
      { name: 'Layouts', tools: layoutTools, count: layoutTools.length },
      { name: 'Media', tools: mediaTools, count: mediaTools.length },
      { name: 'Campaigns', tools: campaignTools, count: campaignTools.length },
      { name: 'Playlists', tools: playlistTools, count: playlistTools.length },
      { name: 'Schedules', tools: scheduleTools, count: scheduleTools.length },
      { name: 'Display Groups', tools: displayGroupTools, count: displayGroupTools.length },
      { name: 'Broadcasting', tools: broadcastTools, count: broadcastTools.length }
    ];

    let totalTools = 0;
    toolCategories.forEach(category => {
      category.tools.forEach(tool => {
        this.tools.set(tool.name, tool);
        totalTools++;
      });
    });

    console.log(`✅ Loaded ${totalTools} tools across ${toolCategories.length} categories`);
    console.log('\n📊 Tool Categories:');
    toolCategories.forEach(category => {
      console.log(`   - ${category.name}: ${category.count} tools`);
    });
    console.log('\n🎯 Key Features:');
    console.log('   - Complete Xibo API integration');
    console.log('   - Intelligent geographic broadcasting');
    console.log('   - Natural language control');
    console.log('   - Professional Xtranumerik branding');
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
        // Pass Xibo client to tool handler
        const result = await tool.handler({ ...args, _xiboClient: this.xiboClient, _config: this.config });
        
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
    console.log('='.repeat(50));
    
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

      // Start the server
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      console.log('✅ Xibo MCP Server is running!');
      console.log('\n📝 Server Information:');
      console.log(`   Company: ${this.config.companyName}`);
      console.log(`   Server: ${this.config.serverName} v${this.config.serverVersion}`);
      console.log(`   Xibo API: ${this.config.apiUrl}`);
      console.log(`   Tools Available: ${this.tools.size}`);
      console.log('\n💬 Ready to receive commands from Claude!');
      console.log('\n💡 Example commands to try:');
      console.log('   "Mets cette publicité dans tous mes écrans sauf ceux à Québec"');
      console.log('   "Montre-moi l\'état de tous les écrans publicitaires"');
      console.log('   "Programme cette campagne pour demain matin"');
      console.log('   "Crée une nouvelle mise en page avec 3 régions"');
      console.log('   "Diffuse ce message urgent sur TOUS les écrans"');
      console.log('\n🎯 Fonctionnalités clés disponibles:');
      console.log('   - Diffusion intelligente avec filtres géographiques');
      console.log('   - Gestion complète des écrans et groupes');
      console.log('   - Création et programmation de campagnes');
      console.log('   - Gestion des médias et playlists');
      console.log('   - Contrôle des layouts et régions');
      console.log('\n' + '='.repeat(50));
      
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