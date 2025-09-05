#!/usr/bin/env node
/**
 * Interactive setup script for Xibo MCP Server
 * @author Xtranumerik Inc.
 */

import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// ASCII Logo
const logo = `
${chalk.cyan(`
 __  ___                                           _ _    
 \\ \\/ / |_ _ __ __ _ _ __  _   _ _ __ ___   ___ _ __(_) | __
  \\  /| __| '__/ _\` | '_ \\| | | | '_ \` _ \\ / _ \\ '__| | |/ /
  /  \\| |_| | | (_| | | | | |_| | | | | | |  __/ |  | |   < 
 /_/\\_\\\\__|_|  \\__,_|_| |_|\\__,_|_| |_| |_|\\___|_|  |_|_|\\_\\
`)}
${chalk.green(`            MCP Server for Xibo Digital Signage`)}
${chalk.green(`            Configuration Wizard`)}
${chalk.blue(`            by Xtranumerik Inc.`)}
`;

function showWelcome() {
  console.clear();
  console.log(logo);
  console.log(chalk.yellow('='.repeat(60)));
  console.log(chalk.yellow('  Welcome to the Xibo MCP Configuration Wizard'));
  console.log(chalk.yellow('='.repeat(60)));
  console.log();
  console.log('This wizard will help you configure your Xibo MCP server.');
  console.log('Make sure you have:');
  console.log(chalk.cyan('  ✓') + ' Access to your Xibo CMS admin panel');
  console.log(chalk.cyan('  ✓') + ' OAuth client credentials (or we can help create them)');
  console.log(chalk.cyan('  ✓') + ' Network access to your Xibo instance');
  console.log();
}

async function promptBasicConfig() {
  console.log(chalk.blue('📋 Basic Configuration'));
  console.log(chalk.gray('='.repeat(25)));
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'xiboUrl',
      message: 'Enter your Xibo CMS URL:',
      default: 'https://your-xibo-instance.com',
      validate: (input) => {
        try {
          new URL(input);
          return true;
        } catch {
          return 'Please enter a valid URL (e.g., https://your-xibo.com)';
        }
      },
      filter: (input) => input.replace(/\/$/, '') // Remove trailing slash - Fixed regex
    },
    {
      type: 'input',
      name: 'clientId',
      message: 'Enter your Xibo OAuth Client ID:',
      validate: (input) => input.length >= 5 || 'Client ID must be at least 5 characters'
    },
    {
      type: 'password',
      name: 'clientSecret',
      message: 'Enter your Xibo OAuth Client Secret:',
      mask: '*',
      validate: (input) => input.length >= 10 || 'Client Secret must be at least 10 characters'
    }
  ]);

  return answers;
}

function generateEnvFile(config) {
  const envContent = `# Xibo CMS Configuration
XIBO_API_URL=${config.basic.xiboUrl}
XIBO_CLIENT_ID=${config.basic.clientId}
XIBO_CLIENT_SECRET=${config.basic.clientSecret}
XIBO_GRANT_TYPE=client_credentials

# Company Branding
COMPANY_NAME=Xtranumerik Inc.
LOGO_PATH=/assets/logo-xtranumerik.png

# Geographic Configuration
GEO_ZONES='{"quebec_region":["Quebec City","Levis","Beauport"],"montreal_region":["Montreal","Laval","Longueuil"],"national":["all"]}'
DEFAULT_EXCLUDE_CITIES=Quebec City,Levis

# Region Permissions
REGION_PERMISSIONS='{"client_a":{"regions":["region_1","region_3"],"permissions":["view","edit_content"]},"internal":{"regions":["all"],"permissions":["all"]}}'

# Default Tags
DEFAULT_TAGS=publicitaire,information,urgence,promotion

# MCP Server Configuration
MCP_SERVER_NAME=xibo-mcp
MCP_SERVER_VERSION=2.0.0
MCP_SERVER_PORT=3000

# Logging
LOG_LEVEL=info
LOG_FILE=xibo-mcp.log

# Cache Settings
ENABLE_CACHE=true
CACHE_TTL=300

# API Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
`;

  const envPath = path.join(rootDir, '.env');
  fs.writeFileSync(envPath, envContent);
  
  return envPath;
}

function showSummary(config, envPath) {
  console.log();
  console.log(chalk.green('✅ Configuration Complete!'));
  console.log(chalk.green('='.repeat(30)));
  console.log();
  console.log('📁 Configuration saved to:', chalk.cyan(envPath));
  console.log('🏢 Company:', chalk.yellow('Xtranumerik Inc.'));
  console.log('🌐 Xibo URL:', chalk.yellow(config.basic.xiboUrl));
  console.log();
  console.log(chalk.blue('📋 Next steps:'));
  console.log('   1. Review your .env file');
  console.log('   2. Run: npm run build');
  console.log('   3. Start the server: npm start');
  console.log('   4. Configure Claude Desktop with: npm run configure-claude');
  console.log();
  console.log(chalk.yellow('🍁 Quebec/Montreal optimizations enabled!'));
  console.log(chalk.yellow('💡 Need help? Check the README.md file'));
}

async function main() {
  try {
    showWelcome();
    
    const basicConfig = await promptBasicConfig();
    
    const fullConfig = {
      basic: basicConfig
    };
    
    const envPath = generateEnvFile(fullConfig);
    showSummary(fullConfig, envPath);
    
  } catch (error) {
    console.error(chalk.red('❌ Setup failed:'), error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}