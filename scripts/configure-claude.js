#!/usr/bin/env node
/**
 * Configure Claude Desktop for Xibo MCP Server
 * @author Xtranumerik Inc.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

function getClaudeConfigPath() {
  const platform = os.platform();
  const homeDir = os.homedir();
  
  if (platform === 'darwin') { // macOS
    return path.join(homeDir, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  } else if (platform === 'win32') { // Windows
    return path.join(homeDir, 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
  } else { // Linux
    return path.join(homeDir, '.config', 'Claude', 'claude_desktop_config.json');
  }
}

function loadEnvConfig() {
  const envPath = path.join(rootDir, '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env file not found. Please run npm run setup first.');
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const config = {};
  
  envContent.split('\\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      config[match[1]] = match[2].replace(/^['\"](.*)['\"]$/, '$1');
    }
  });
  
  return config;
}

function generateClaudeConfig(envConfig) {
  const projectPath = path.resolve(rootDir);
  
  return {
    mcpServers: {
      \"xibo-mcp\": {
        command: \"node\",
        args: [\"dist/index.js\"],
        cwd: projectPath,
        env: {
          XIBO_API_URL: envConfig.XIBO_API_URL || '',
          XIBO_CLIENT_ID: envConfig.XIBO_CLIENT_ID || '',
          XIBO_CLIENT_SECRET: envConfig.XIBO_CLIENT_SECRET || '',
          XIBO_GRANT_TYPE: envConfig.XIBO_GRANT_TYPE || 'client_credentials',
          COMPANY_NAME: envConfig.COMPANY_NAME || 'Xtranumerik Inc.',
          LOGO_PATH: envConfig.LOGO_PATH || '/assets/logo-xtranumerik.png',
          GEO_ZONES: envConfig.GEO_ZONES || '',
          DEFAULT_EXCLUDE_CITIES: envConfig.DEFAULT_EXCLUDE_CITIES || '',
          REGION_PERMISSIONS: envConfig.REGION_PERMISSIONS || '',
          DEFAULT_TAGS: envConfig.DEFAULT_TAGS || '',
          MCP_SERVER_NAME: envConfig.MCP_SERVER_NAME || 'xibo-mcp',
          MCP_SERVER_VERSION: envConfig.MCP_SERVER_VERSION || '1.0.0',
          LOG_LEVEL: envConfig.LOG_LEVEL || 'info',
          ENABLE_CACHE: envConfig.ENABLE_CACHE || 'true',
          CACHE_TTL: envConfig.CACHE_TTL || '300'
        }
      }
    }
  };
}

function backupExistingConfig(configPath) {
  if (fs.existsSync(configPath)) {
    const backupPath = `${configPath}.backup.${Date.now()}`;
    fs.copyFileSync(configPath, backupPath);
    console.log(chalk.yellow(`📋 Existing config backed up to: ${backupPath}`));
    return true;
  }
  return false;
}

function mergeWithExistingConfig(configPath, newConfig) {
  if (fs.existsSync(configPath)) {
    try {
      const existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // Merge mcpServers
      if (existingConfig.mcpServers) {
        newConfig.mcpServers = {
          ...existingConfig.mcpServers,
          ...newConfig.mcpServers
        };
      }
      
      // Merge other properties
      return {
        ...existingConfig,
        ...newConfig
      };
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not parse existing config, creating new one'));
      return newConfig;
    }
  }
  return newConfig;
}

function main() {
  console.log(chalk.cyan('🤖 Configuring Claude Desktop for Xibo MCP'));
  console.log(chalk.cyan('=' .repeat(45)));
  
  try {
    // Load environment configuration
    console.log('📖 Loading configuration...');
    const envConfig = loadEnvConfig();
    
    // Get Claude config path
    const configPath = getClaudeConfigPath();
    const configDir = path.dirname(configPath);
    
    // Create config directory if it doesn't exist
    if (!fs.existsSync(configDir)) {
      console.log(`📁 Creating Claude config directory: ${configDir}`);
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // Backup existing config
    const hadExisting = backupExistingConfig(configPath);
    
    // Generate new configuration
    console.log('⚙️  Generating Claude Desktop configuration...');
    const newConfig = generateClaudeConfig(envConfig);
    
    // Merge with existing config if present
    const finalConfig = mergeWithExistingConfig(configPath, newConfig);
    
    // Write configuration
    fs.writeFileSync(configPath, JSON.stringify(finalConfig, null, 2));
    
    console.log(chalk.green('✅ Claude Desktop configured successfully!'));
    console.log();
    console.log(chalk.blue('📍 Configuration saved to:'));
    console.log(chalk.gray(`   ${configPath}`));
    console.log();
    console.log(chalk.blue('📋 Next steps:'));
    console.log('   1. Restart Claude Desktop if it\\'s running');
    console.log('   2. Make sure your Xibo MCP server is built: npm run build');
    console.log('   3. Test the connection by asking Claude to list your displays');
    console.log();
    console.log(chalk.yellow('💡 Example commands to try with Claude:'));
    console.log('   \"Montre-moi tous mes écrans Xibo\"');
    console.log('   \"Liste les écrans publicitaires de Montréal\"');
    console.log('   \"Mets cette pub sur tous les écrans sauf ceux à Québec\"');
    console.log();
    
    if (hadExisting) {
      console.log(chalk.yellow('ℹ️  Your previous Claude config was backed up and merged'));
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Configuration failed:'), error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}