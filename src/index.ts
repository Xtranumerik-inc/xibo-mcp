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

    // Load display tools for now (more to be added)
    const toolCategories = [
      displayTools
    ];

    let totalTools = 0;
    toolCategories.forEach(category => {
      category.forEach(tool => {
        this.tools.set(tool.name, tool);
        totalTools++;
      });
    });

    console.log(`✅ Loaded ${totalTools} tools`);
    console.log('\n📊 Available Tool Categories:');
    console.log('   - Displays: Control and monitor display devices');
    console.log('   - More categories coming soon...');
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