#!/usr/bin/env node
/**
 * Script d'authentification interactive OAuth2 pour utilisateurs Xibo
 * Support 2FA et stockage sécurisé des tokens
 * @author Xtranumerik Inc.
 */

import inquirer from 'inquirer';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOGO = `
${chalk.cyan('__  ___                                           _ _    ')}
${chalk.cyan('\\ \\/ / |_ _ __ __ _ _ __  _   _ _ __ ___   ___ _ __(_) | __')}
${chalk.cyan(' \\  /| __| \'__/ _` | \'_ \\| | | | \'_ ` _ \\ / _ \\ \'__| | |/ /')}
${chalk.cyan(' /  \\| |_| | | (_| | | | | |_| | | | | | |  __/ |  | |   < ')}
${chalk.cyan('/_/\\_\\\\__|_|  \\__,_|_| |_|\\__,_|_| |_| |_|\\___|_|  |_|_|\\_\\')}

${chalk.green('        Authentification utilisateur OAuth2 Xibo')}
${chalk.green('              Par Xtranumerik Inc.')}
`;

class XiboUserAuth {
  constructor() {
    this.configPath = path.join(__dirname, '..', '.env');
    this.tokenPath = path.join(__dirname, '..', '.user-tokens');
    this.config = this.loadConfig();
  }

  loadConfig() {
    if (!fs.existsSync(this.configPath)) {
      console.error(chalk.red('❌ Fichier .env non trouvé. Exécutez d\'abord npm run setup'));
      process.exit(1);
    }

    const config = {};
    const envContent = fs.readFileSync(this.configPath, 'utf-8');
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        config[key.trim()] = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '');
      }
    });

    return config;
  }

  encryptToken(token) {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(this.config.XIBO_CLIENT_SECRET || 'default-key', 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(Buffer.from('xibo-mcp-token'));
    
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      iv: iv.toString('hex'),
      data: encrypted,
      authTag: authTag.toString('hex')
    };
  }

  decryptToken(encryptedData) {
    try {
      const algorithm = 'aes-256-gcm';
      const key = crypto.scryptSync(this.config.XIBO_CLIENT_SECRET || 'default-key', 'salt', 32);
      
      const decipher = crypto.createDecipher(algorithm, key);
      decipher.setAAD(Buffer.from('xibo-mcp-token'));
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
      
      let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      return null;
    }
  }

  async promptUserCredentials() {
    console.log(LOGO);
    console.log(chalk.yellow('🔐 Authentification utilisateur Xibo\n'));

    const questions = [
      {
        type: 'input',
        name: 'xiboUrl',
        message: 'URL de votre Xibo CMS:',
        default: this.config.XIBO_API_URL || 'https://acces.xtranumerik.com',
        validate: (input) => {
          try {
            new URL(input);
            return true;
          } catch {
            return 'Veuillez entrer une URL valide';
          }
        }
      },
      {
        type: 'input',
        name: 'username',
        message: 'Nom d\'utilisateur:',
        validate: (input) => input.length > 0 || 'Le nom d\'utilisateur est requis'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Mot de passe:',
        mask: '*',
        validate: (input) => input.length > 0 || 'Le mot de passe est requis'
      }
    ];

    return inquirer.prompt(questions);
  }

  async authenticateUser(credentials) {
    console.log(chalk.cyan('\n🔍 Authentification en cours...\n'));

    const authUrl = credentials.xiboUrl.replace(/\/$/, '') + '/api/authorize/access_token';
    
    try {
      // Première tentative avec authorization code flow simulé
      const formData = new URLSearchParams();
      formData.append('grant_type', 'password');
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);
      formData.append('client_id', this.config.XIBO_CLIENT_ID);
      formData.append('client_secret', this.config.XIBO_CLIENT_SECRET);

      console.log(chalk.gray('📡 Tentative d\'authentification password grant...'));
      
      const response = await axios.post(authUrl, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      if (response.data.access_token) {
        console.log(chalk.green('✅ Authentification réussie !'));
        return response.data;
      }

    } catch (error) {
      console.log(chalk.yellow('⚠️  Password grant non supporté, tentative avec authorization code...'));
      
      // Fallback vers authorization code flow
      return this.handleAuthorizationCodeFlow(credentials);
    }

    throw new Error('Échec de l\'authentification');
  }

  async handleAuthorizationCodeFlow(credentials) {
    console.log(chalk.cyan('\n🔗 Utilisation du flow Authorization Code\n'));
    
    const authUrl = credentials.xiboUrl.replace(/\/$/, '') + '/api/authorize';
    const redirectUri = 'http://localhost:3000/callback';
    
    const authorizeUrl = `${authUrl}?response_type=code&client_id=${this.config.XIBO_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=all`;
    
    console.log(chalk.yellow('🌐 Veuillez vous connecter via votre navigateur:'));
    console.log(chalk.blue(authorizeUrl));
    console.log();
    
    const { authCode } = await inquirer.prompt([
      {
        type: 'input',
        name: 'authCode',
        message: 'Collez le code d\'autorisation reçu:',
        validate: (input) => input.length > 0 || 'Le code d\'autorisation est requis'
      }
    ]);

    // Exchange code for token
    const tokenUrl = credentials.xiboUrl.replace(/\/$/, '') + '/api/authorize/access_token';
    const formData = new URLSearchParams();
    formData.append('grant_type', 'authorization_code');
    formData.append('code', authCode);
    formData.append('redirect_uri', redirectUri);
    formData.append('client_id', this.config.XIBO_CLIENT_ID);
    formData.append('client_secret', this.config.XIBO_CLIENT_SECRET);

    const response = await axios.post(tokenUrl, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    });

    return response.data;
  }

  saveTokens(tokens, credentials) {
    const tokenData = {
      access_token: this.encryptToken(tokens.access_token),
      refresh_token: tokens.refresh_token ? this.encryptToken(tokens.refresh_token) : null,
      expires_at: tokens.expires_in ? Date.now() + (tokens.expires_in * 1000) : null,
      username: credentials.username,
      xibo_url: credentials.xiboUrl,
      created_at: new Date().toISOString()
    };

    fs.writeFileSync(this.tokenPath, JSON.stringify(tokenData, null, 2));
    console.log(chalk.green('💾 Tokens sauvegardés de manière sécurisée'));
  }

  async testApiAccess(tokens, xiboUrl) {
    console.log(chalk.cyan('\n🧪 Test d\'accès à l\'API...\n'));

    try {
      const testEndpoints = [
        { name: 'Utilisateurs', endpoint: '/user' },
        { name: 'Écrans', endpoint: '/display' },
        { name: 'Layouts', endpoint: '/layout' },
        { name: 'Médias', endpoint: '/media' },
        { name: 'Playlists', endpoint: '/playlist' }
      ];

      for (const test of testEndpoints) {
        try {
          const response = await axios.get(xiboUrl.replace(/\/$/, '') + '/api' + test.endpoint, {
            headers: {
              'Authorization': `Bearer ${tokens.access_token}`,
              'Accept': 'application/json'
            },
            timeout: 5000,
            params: { length: 1 }
          });

          console.log(chalk.green(`✅ ${test.name}: ${response.data.recordsTotal || response.data.length || 'OK'} éléments`));
        } catch (error) {
          console.log(chalk.yellow(`⚠️  ${test.name}: ${error.response ? error.response.status : 'Erreur'}`));
        }
      }

      console.log(chalk.green('\n🎉 Configuration terminée avec succès !'));
      console.log(chalk.cyan('Vous pouvez maintenant utiliser le MCP server avec tous les outils disponibles.'));

    } catch (error) {
      console.log(chalk.red(`❌ Erreur lors du test: ${error.message}`));
    }
  }

  async run() {
    try {
      const credentials = await this.promptUserCredentials();
      const tokens = await this.authenticateUser(credentials);
      
      this.saveTokens(tokens, credentials);
      await this.testApiAccess(tokens, credentials.xiboUrl);

      console.log(chalk.green('\n✨ Authentification utilisateur configurée !'));
      console.log(chalk.cyan('Redémarrez le serveur MCP pour utiliser les nouveaux tokens.'));

    } catch (error) {
      console.error(chalk.red(`❌ Erreur: ${error.message}`));
      process.exit(1);
    }
  }
}

// Vérifier si le script est exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  const auth = new XiboUserAuth();
  auth.run();
}

export default XiboUserAuth;