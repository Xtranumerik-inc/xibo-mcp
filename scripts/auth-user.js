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
${chalk.cyan('\\\\ \\\\/ / |_ _ __ __ _ _ __  _   _ _ __ ___   ___ _ __(_) | __')}
${chalk.cyan(' \\\\  /| __| \'__/ _` | \'_ \\\\| | | | \'_ ` _ \\\\ / _ \\\\ \'__| | |/ /')}
${chalk.cyan(' /  \\\\| |_| | | (_| | | | | |_| | | | | | |  __/ |  | |   < ')}
${chalk.cyan('/_/\\\\_\\\\\\\\__|_|  \\\\__,_|_| |_|\\\\__,_|_| |_| |_|\\\\___|_|  |_|_|\\\\_\\\\')}

${chalk.green('        Authentification utilisateur OAuth2 Xibo')}
${chalk.green('              Par Xtranumerik Inc.')}
`;

class XiboUserAuth {
  constructor() {
    this.configPath = path.join(__dirname, '..', '.env');
    this.tokenDir = path.join(__dirname, '..', 'data', 'tokens');
    this.config = this.loadConfig();
  }

  loadConfig() {
    // Si .env n'existe pas, retourner config vide (on va la créer)
    if (!fs.existsSync(this.configPath)) {
      console.log(chalk.yellow('⚠️  Fichier .env non trouvé, création en cours...'));
      return {};
    }

    const config = {};
    const envContent = fs.readFileSync(this.configPath, 'utf-8');
    
    envContent.split('\\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        config[key.trim()] = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '');
      }
    });

    return config;
  }

  async promptClientCredentials() {
    if (this.config.XIBO_CLIENT_ID && this.config.XIBO_CLIENT_SECRET && this.config.XIBO_API_URL) {
      console.log(chalk.green('✅ Configuration Client ID/Secret trouvée dans .env'));
      return {
        clientId: this.config.XIBO_CLIENT_ID,
        clientSecret: this.config.XIBO_CLIENT_SECRET,
        apiUrl: this.config.XIBO_API_URL
      };
    }

    console.log(chalk.yellow('🔧 Configuration Client ID/Secret requise pour OAuth2\\n'));
    
    const questions = [
      {
        type: 'input',
        name: 'apiUrl',
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
        name: 'clientId',
        message: 'Client ID (depuis Applications dans Xibo):',
        default: this.config.XIBO_CLIENT_ID,
        validate: (input) => input.length > 0 || 'Le Client ID est requis'
      },
      {
        type: 'password',
        name: 'clientSecret', 
        message: 'Client Secret:',
        mask: '*',
        default: this.config.XIBO_CLIENT_SECRET,
        validate: (input) => input.length > 0 || 'Le Client Secret est requis'
      }
    ];

    return inquirer.prompt(questions);
  }

  createEnvFile(config, credentials) {
    const envContent = `# Xtranumerik MCP pour Xibo - Configuration OAuth2
# Généré automatiquement par auth-user.js

# Configuration de base
XIBO_API_URL=${credentials.apiUrl}
XIBO_CLIENT_ID=${credentials.clientId}
XIBO_CLIENT_SECRET=${credentials.clientSecret}
XIBO_GRANT_TYPE=password

# Informations société
COMPANY_NAME=Xtranumerik Inc.
TIMEZONE=America/Montreal

# Filtrage géographique Québec
QUEBEC_FILTER_ENABLED=true
MONTREAL_FILTER_ENABLED=true

# OAuth2 User Authentication activé
OAUTH2_USER_AUTH=true
OAUTH2_TOKEN_DIR=data/tokens

# Logging
LOG_LEVEL=info
LOG_FILE=logs/xibo-mcp.log
`;

    fs.writeFileSync(this.configPath, envContent);
    console.log(chalk.green('✅ Fichier .env créé avec la configuration OAuth2'));
  }

  encryptToken(token, clientSecret) {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(clientSecret || 'default-key', 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipherGCM(algorithm, key, iv);
    cipher.setAADParams(Buffer.from('xibo-mcp-token'));
    
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      iv: iv.toString('hex'),
      data: encrypted,
      authTag: authTag.toString('hex')
    };
  }

  decryptToken(encryptedData, clientSecret) {
    try {
      const algorithm = 'aes-256-gcm';
      const key = crypto.scryptSync(clientSecret || 'default-key', 'salt', 32);
      const iv = Buffer.from(encryptedData.iv, 'hex');
      
      const decipher = crypto.createDecipherGCM(algorithm, key, iv);
      decipher.setAADParams(Buffer.from('xibo-mcp-token'));
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
      
      let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      return null;
    }
  }

  async promptUserCredentials() {
    console.log(chalk.yellow('🔐 Authentification utilisateur Xibo\\n'));

    const questions = [
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

  async authenticateUser(userCredentials, clientConfig) {
    console.log(chalk.cyan('\\n🔍 Authentification en cours...\\n'));

    const authUrl = clientConfig.apiUrl.replace(/\\/$/, '') + '/api/authorize/access_token';
    
    try {
      // Première tentative avec password grant
      const formData = new URLSearchParams();
      formData.append('grant_type', 'password');
      formData.append('username', userCredentials.username);
      formData.append('password', userCredentials.password);
      formData.append('client_id', clientConfig.clientId);
      formData.append('client_secret', clientConfig.clientSecret);

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
      return this.handleAuthorizationCodeFlow(userCredentials, clientConfig);
    }

    throw new Error('Échec de l\'authentification');
  }

  async handleAuthorizationCodeFlow(userCredentials, clientConfig) {
    console.log(chalk.cyan('\\n🔗 Utilisation du flow Authorization Code\\n'));
    
    const authUrl = clientConfig.apiUrl.replace(/\\/$/, '') + '/api/authorize';
    const redirectUri = 'http://localhost:3000/callback';
    
    const authorizeUrl = `${authUrl}?response_type=code&client_id=${clientConfig.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=all`;
    
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
    const tokenUrl = clientConfig.apiUrl.replace(/\\/$/, '') + '/api/authorize/access_token';
    const formData = new URLSearchParams();
    formData.append('grant_type', 'authorization_code');
    formData.append('code', authCode);
    formData.append('redirect_uri', redirectUri);
    formData.append('client_id', clientConfig.clientId);
    formData.append('client_secret', clientConfig.clientSecret);

    const response = await axios.post(tokenUrl, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    });

    return response.data;
  }

  saveTokens(tokens, userCredentials, clientConfig) {
    // Créer le répertoire des tokens s'il n'existe pas
    if (!fs.existsSync(this.tokenDir)) {
      fs.mkdirSync(this.tokenDir, { recursive: true });
    }

    const tokenData = {
      access_token: this.encryptToken(tokens.access_token, clientConfig.clientSecret),
      refresh_token: tokens.refresh_token ? this.encryptToken(tokens.refresh_token, clientConfig.clientSecret) : null,
      expires_at: tokens.expires_in ? Date.now() + (tokens.expires_in * 1000) : null,
      username: userCredentials.username,
      xibo_url: clientConfig.apiUrl,
      client_id: clientConfig.clientId,
      created_at: new Date().toISOString()
    };

    const tokenFile = path.join(this.tokenDir, `${userCredentials.username}.json`);
    fs.writeFileSync(tokenFile, JSON.stringify(tokenData, null, 2));
    console.log(chalk.green('💾 Tokens sauvegardés de manière sécurisée dans data/tokens/'));
  }

  async testApiAccess(tokens, apiUrl) {
    console.log(chalk.cyan('\\n🧪 Test d\'accès à l\'API...\\n'));

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
          const response = await axios.get(apiUrl.replace(/\\/$/, '') + '/api' + test.endpoint, {
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

      console.log(chalk.green('\\n🎉 Configuration OAuth2 terminée avec succès !'));
      console.log(chalk.cyan('Vous pouvez maintenant utiliser le MCP server avec tous les 117 outils disponibles.'));

    } catch (error) {
      console.log(chalk.red(`❌ Erreur lors du test: ${error.message}`));
    }
  }

  async run() {
    try {
      console.log(LOGO);
      
      // Étape 1: Obtenir/vérifier les credentials client
      const clientConfig = await this.promptClientCredentials();
      
      // Étape 2: Créer/mettre à jour .env si nécessaire
      if (!fs.existsSync(this.configPath) || !this.config.XIBO_CLIENT_ID) {
        this.createEnvFile(this.config, clientConfig);
      }
      
      // Étape 3: Authentification utilisateur
      const userCredentials = await this.promptUserCredentials();
      const tokens = await this.authenticateUser(userCredentials, clientConfig);
      
      // Étape 4: Sauvegarder les tokens
      this.saveTokens(tokens, userCredentials, clientConfig);
      
      // Étape 5: Tester l'accès API
      await this.testApiAccess(tokens, clientConfig.apiUrl);

      console.log(chalk.green('\\n✨ Authentification OAuth2 utilisateur configurée !'));
      console.log(chalk.cyan('Le serveur MCP détectera automatiquement les tokens et activera les 117 outils.'));
      console.log(chalk.yellow('Redémarrez le serveur MCP avec: npm start'));

    } catch (error) {
      console.error(chalk.red(`❌ Erreur: ${error.message}`));
      console.log(chalk.yellow('\\n💡 Conseils de dépannage:'));
      console.log(chalk.yellow('   1. Vérifiez que votre Client ID/Secret sont corrects'));
      console.log(chalk.yellow('   2. Assurez-vous que l\'application Xibo autorise le grant_type "password"'));
      console.log(chalk.yellow('   3. Vérifiez que votre compte utilisateur a les bonnes permissions'));
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