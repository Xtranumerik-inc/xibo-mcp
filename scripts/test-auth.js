#!/usr/bin/env node
/**
 * Authentication Testing Utility for Xibo MCP Server
 * @author Xtranumerik Inc.
 */

import dotenv from 'dotenv';
import axios from 'axios';
import inquirer from 'inquirer';
import chalk from 'chalk';

// Load environment variables
dotenv.config();

const XIBO_API_URL = process.env.XIBO_API_URL;
const XIBO_CLIENT_ID = process.env.XIBO_CLIENT_ID;
const XIBO_CLIENT_SECRET = process.env.XIBO_CLIENT_SECRET;

console.log(chalk.blue.bold('\n🔍 Xibo Authentication Testing Utility'));
console.log(chalk.blue('=====================================\n'));

/**
 * Test authentication with current credentials
 */
async function testCurrentCredentials() {
    console.log(chalk.yellow('Testing current credentials from .env file...\n'));
    
    if (!XIBO_API_URL || !XIBO_CLIENT_ID || !XIBO_CLIENT_SECRET) {
        console.log(chalk.red('❌ Missing credentials in .env file'));
        console.log('Required: XIBO_API_URL, XIBO_CLIENT_ID, XIBO_CLIENT_SECRET\n');
        return false;
    }

    console.log(chalk.gray(`API URL: ${XIBO_API_URL}`));
    console.log(chalk.gray(`Client ID: ${XIBO_CLIENT_ID.substring(0, 8)}...`));
    console.log(chalk.gray(`Client Secret: ${XIBO_CLIENT_SECRET.substring(0, 8)}...\n`));

    const endpoints = [
        '/api/authorize/access_token',
        '/api/oauth/token',
        '/oauth/token'
    ];

    const grantTypes = ['client_credentials', 'password'];

    for (const grantType of grantTypes) {
        console.log(chalk.cyan(`\n📋 Testing Grant Type: ${grantType}`));
        
        for (const endpoint of endpoints) {
            try {
                const authData = new URLSearchParams();
                authData.append('grant_type', grantType);
                authData.append('client_id', XIBO_CLIENT_ID);
                authData.append('client_secret', XIBO_CLIENT_SECRET);

                console.log(chalk.gray(`   🔗 Trying ${endpoint}...`));
                
                const response = await axios.post(
                    `${XIBO_API_URL.replace(/\/$/, '')}${endpoint}`,
                    authData,
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': 'application/json'
                        },
                        timeout: 10000
                    }
                );
                
                console.log(chalk.green(`   ✅ SUCCESS! Status: ${response.status}`));
                console.log(chalk.green(`   📄 Access Token: ${response.data.access_token?.substring(0, 20)}...`));
                
                if (response.data.expires_in) {
                    console.log(chalk.green(`   ⏰ Expires in: ${response.data.expires_in} seconds`));
                }
                
                return { success: true, endpoint, grantType, token: response.data.access_token };
                
            } catch (error) {
                const status = error.response?.status || 'NO_RESPONSE';
                const errorData = error.response?.data || error.message;
                console.log(chalk.red(`   ❌ FAILED (${status}): ${typeof errorData === 'object' ? JSON.stringify(errorData) : errorData}`));
            }
        }
    }
    
    console.log(chalk.red('\n❌ All authentication methods failed with current credentials'));
    return false;
}

/**
 * Test with custom credentials
 */
async function testCustomCredentials() {
    console.log(chalk.yellow('\n🔧 Test with custom credentials\n'));
    
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'apiUrl',
            message: 'Xibo API URL:',
            default: XIBO_API_URL
        },
        {
            type: 'input',
            name: 'clientId',
            message: 'Client ID:'
        },
        {
            type: 'password',
            name: 'clientSecret',
            message: 'Client Secret:',
            mask: '*'
        }
    ]);

    // Test the custom credentials
    const endpoint = '/api/authorize/access_token';
    
    try {
        const authData = new URLSearchParams();
        authData.append('grant_type', 'client_credentials');
        authData.append('client_id', answers.clientId);
        authData.append('client_secret', answers.clientSecret);

        console.log(chalk.gray(`\nTesting with ${endpoint}...`));
        
        const response = await axios.post(
            `${answers.apiUrl.replace(/\/$/, '')}${endpoint}`,
            authData,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                timeout: 10000
            }
        );
        
        console.log(chalk.green(`\n✅ SUCCESS! Custom credentials work!`));
        console.log(chalk.green(`   Status: ${response.status}`));
        console.log(chalk.green(`   Access Token: ${response.data.access_token?.substring(0, 20)}...`));
        
        const updateEnv = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'update',
                message: 'Update .env file with these working credentials?',
                default: true
            }
        ]);
        
        if (updateEnv.update) {
            const fs = await import('fs');
            const envContent = `# Xibo CMS Configuration\nXIBO_API_URL=${answers.apiUrl}\nXIBO_CLIENT_ID=${answers.clientId}\nXIBO_CLIENT_SECRET=${answers.clientSecret}\n\n# Company Branding\nCOMPANY_NAME=Xtranumerik Inc.\nLOGO_PATH=/assets/logo-xtranumerik.png\n\n# Geographic Configuration\nGEO_ZONES='{"quebec_region":["Quebec City","Levis","Beauport"],"montreal_region":["Montreal","Laval","Longueuil"],"national":["all"]}'\n\n# Default cities to exclude (comma-separated)\nDEFAULT_EXCLUDE_CITIES=Quebec City,Levis\n\n# Region Permissions\nREGION_PERMISSIONS='{"client_a":{"regions":["region_1","region_3"],"permissions":["view","edit_content"]},"internal":{"regions":["all"],"permissions":["all"]}}'\n\n# Default Tags (comma-separated)\nDEFAULT_TAGS=publicitaire,information,urgence,promotion\n\n# MCP Server Configuration\nMCP_SERVER_NAME=xibo-mcp\nMCP_SERVER_VERSION=1.0.0\nMCP_SERVER_PORT=3000\n\n# Logging\nLOG_LEVEL=info\nLOG_FILE=xibo-mcp.log\n\n# Cache Settings\nCACHE_TTL=300\nENABLE_CACHE=true\n\n# API Rate Limiting\nRATE_LIMIT_REQUESTS=100\nRATE_LIMIT_WINDOW=60\n`;
            
            fs.writeFileSync('.env', envContent);
            console.log(chalk.green('✅ Updated .env file with working credentials'));
        }
        
        return true;
        
    } catch (error) {
        const status = error.response?.status || 'NO_RESPONSE';
        const errorData = error.response?.data || error.message;
        console.log(chalk.red(`\n❌ Custom credentials failed (${status}): ${typeof errorData === 'object' ? JSON.stringify(errorData, null, 2) : errorData}`));
        return false;
    }
}

/**
 * Check server connectivity
 */
async function checkServerConnectivity() {
    console.log(chalk.yellow('\n🌐 Checking server connectivity...\n'));
    
    const url = XIBO_API_URL?.replace(/\/$/, '');
    const testUrls = [
        `${url}`,
        `${url}/api`,
        `${url}/web/about`
    ];
    
    for (const testUrl of testUrls) {
        try {
            console.log(chalk.gray(`Testing: ${testUrl}`));
            const response = await axios.get(testUrl, { timeout: 5000 });
            console.log(chalk.green(`✅ ${testUrl} - Status: ${response.status}`));
        } catch (error) {
            console.log(chalk.red(`❌ ${testUrl} - ${error.message}`));
        }
    }
}

/**
 * Main menu
 */
async function main() {
    while (true) {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    { name: '🔍 Test current credentials (.env file)', value: 'test-current' },
                    { name: '🔧 Test custom credentials', value: 'test-custom' },
                    { name: '🌐 Check server connectivity', value: 'check-server' },
                    { name: '❌ Exit', value: 'exit' }
                ]
            }
        ]);

        switch (answers.action) {
            case 'test-current':
                await testCurrentCredentials();
                break;
            case 'test-custom':
                await testCustomCredentials();
                break;
            case 'check-server':
                await checkServerConnectivity();
                break;
            case 'exit':
                console.log(chalk.blue('\n👋 Goodbye!'));
                process.exit(0);
        }

        console.log(chalk.gray('\n' + '='.repeat(50) + '\n'));
    }
}

// Handle errors
process.on('uncaughtException', (error) => {
    console.error(chalk.red('\n💥 Uncaught Exception:'), error.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error(chalk.red('\n💥 Unhandled Rejection:'), reason);
    process.exit(1);
});

// Start the utility
main().catch((error) => {
    console.error(chalk.red('\n💥 Fatal Error:'), error.message);
    process.exit(1);
});