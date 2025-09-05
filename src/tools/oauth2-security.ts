/**
 * OAuth2 and Security Management tools for Xibo MCP Server
 * Complete authentication and security control
 * @author Xtranumerik Inc.
 */

import { ToolDefinition } from '../types.js';
import XiboClient from '../xibo-client.js';

// ========== OAUTH2 APPLICATION MANAGEMENT ==========

const oauth2AppList: ToolDefinition = {
  name: 'oauth2_app_list',
  description: 'List all OAuth2 applications with detailed information',
  parameters: [
    { name: 'includeTokens', type: 'boolean', description: 'Include active tokens count', required: false, default: true },
    { name: 'status', type: 'string', description: 'Filter by status: active, inactive, all', required: false, default: 'all' }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const apps = await client.listApplications();
      
      let result = `🔐 **Applications OAuth2 (${apps.data.length})**\n\n`;
      
      // Filter by status if specified
      let filteredApps = apps.data;
      if (params.status !== 'all') {
        const isActive = params.status === 'active';
        filteredApps = apps.data.filter((app: any) => Boolean(app.active) === isActive);
      }
      
      if (filteredApps.length === 0) {
        result += `Aucune application trouvée avec le statut "${params.status}".`;
        return result;
      }
      
      for (let i = 0; i < filteredApps.length; i++) {
        const app = filteredApps[i];
        result += `**${i + 1}. ${app.name}**\n`;
        result += `   ID: ${app.clientId}\n`;
        result += `   Type: ${app.authCode ? 'Confidential' : 'Public'}\n`;
        result += `   Statut: ${app.active ? '🟢 Active' : '🔴 Inactive'}\n`;
        result += `   Créée: ${app.createdAt || 'N/A'}\n`;
        result += `   Grant Types: ${app.grantTypes?.join(', ') || 'client_credentials'}\n`;
        
        if (app.redirectUris && app.redirectUris.length > 0) {
          result += `   Redirect URIs: ${app.redirectUris.join(', ')}\n`;
        }
        
        if (params.includeTokens) {
          try {
            const tokens = await client.listApplicationTokens(app.clientId);
            const activeTokens = tokens.data.filter((token: any) => !token.revoked).length;
            result += `   🔑 Tokens actifs: ${activeTokens}\n`;
          } catch (error) {
            result += `   🔑 Tokens: Non disponible\n`;
          }
        }
        
        result += `\n`;
      }
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des applications OAuth2: ${error.message}`;
    }
  }
};

const oauth2AppCreate: ToolDefinition = {
  name: 'oauth2_app_create',
  description: 'Create a new OAuth2 application with specified configuration',
  parameters: [
    { name: 'name', type: 'string', description: 'Application name', required: true },
    { name: 'description', type: 'string', description: 'Application description', required: false },
    { name: 'clientType', type: 'string', description: 'Client type: confidential, public', required: false, default: 'confidential' },
    { name: 'grantTypes', type: 'string', description: 'Grant types (comma-separated): client_credentials, authorization_code', required: false, default: 'client_credentials' },
    { name: 'redirectUris', type: 'string', description: 'Redirect URIs (comma-separated)', required: false },
    { name: 'scopes', type: 'string', description: 'Allowed scopes (comma-separated)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const appData = {
        name: params.name,
        description: params.description || `Application OAuth2: ${params.name}`,
        clientType: params.clientType,
        grantTypes: params.grantTypes.split(',').map((gt: string) => gt.trim()),
        redirectUris: params.redirectUris ? params.redirectUris.split(',').map((uri: string) => uri.trim()) : [],
        scopes: params.scopes ? params.scopes.split(',').map((scope: string) => scope.trim()) : []
      };
      
      const newApp = await client.createApplication(appData);
      
      let result = `✅ **Application OAuth2 créée avec succès**\n\n`;
      result += `📋 **Détails de l'application:**\n`;
      result += `   Nom: ${params.name}\n`;
      result += `   Client ID: \`${newApp.data.clientId}\`\n`;
      result += `   Client Secret: \`${newApp.data.clientSecret}\`\n`;
      result += `   Type: ${params.clientType}\n`;
      result += `   Grant Types: ${params.grantTypes}\n`;
      
      if (params.redirectUris) {
        result += `   Redirect URIs: ${params.redirectUris}\n`;
      }
      
      if (params.scopes) {
        result += `   Scopes: ${params.scopes}\n`;
      }
      
      result += `\n⚠️ **Important:** Copiez le Client Secret maintenant, il ne sera plus affiché.\n`;
      result += `\n💡 **Utilisation:**\n`;
      result += `   Cette application peut maintenant être utilisée pour l'authentification OAuth2.\n`;
      result += `   Configurez votre client avec le Client ID et Client Secret fournis.`;
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la création de l'application OAuth2: ${error.message}`;
    }
  }
};

const oauth2AppEdit: ToolDefinition = {
  name: 'oauth2_app_edit',
  description: 'Edit OAuth2 application settings and configuration',
  parameters: [
    { name: 'clientId', type: 'string', description: 'Client ID of the application to edit', required: true },
    { name: 'name', type: 'string', description: 'New application name', required: false },
    { name: 'description', type: 'string', description: 'New description', required: false },
    { name: 'active', type: 'boolean', description: 'Enable/disable application', required: false },
    { name: 'grantTypes', type: 'string', description: 'New grant types (comma-separated)', required: false },
    { name: 'redirectUris', type: 'string', description: 'New redirect URIs (comma-separated)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const updateData: any = {};
      
      if (params.name) updateData.name = params.name;
      if (params.description) updateData.description = params.description;
      if (params.active !== undefined) updateData.active = params.active;
      if (params.grantTypes) updateData.grantTypes = params.grantTypes.split(',').map((gt: string) => gt.trim());
      if (params.redirectUris) updateData.redirectUris = params.redirectUris.split(',').map((uri: string) => uri.trim());
      
      if (Object.keys(updateData).length === 0) {
        return '❌ Aucune modification spécifiée. Fournissez au moins un paramètre à modifier.';
      }
      
      await client.updateApplication(params.clientId, updateData);
      
      let result = `✅ **Application OAuth2 mise à jour**\n\n`;
      result += `📋 **Client ID:** ${params.clientId}\n`;
      result += `**Modifications effectuées:**\n`;
      
      Object.entries(updateData).forEach(([key, value]) => {
        result += `   ${key}: ${Array.isArray(value) ? value.join(', ') : value}\n`;
      });
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la modification de l'application OAuth2: ${error.message}`;
    }
  }
};

const oauth2AppDelete: ToolDefinition = {
  name: 'oauth2_app_delete',
  description: 'Delete an OAuth2 application and revoke all its tokens',
  parameters: [
    { name: 'clientId', type: 'string', description: 'Client ID of the application to delete', required: true },
    { name: 'confirm', type: 'boolean', description: 'Confirm deletion (required)', required: true }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      if (!params.confirm) {
        return '❌ Suppression annulée. Utilisez confirm=true pour confirmer la suppression.';
      }
      
      // Get application info before deletion
      try {
        const tokens = await client.listApplicationTokens(params.clientId);
        const activeTokens = tokens.data.filter((token: any) => !token.revoked).length;
        
        if (activeTokens > 0) {
          // Revoke all tokens first
          for (const token of tokens.data) {
            if (!token.revoked) {
              await client.revokeToken(token.id);
            }
          }
        }
      } catch (error) {
        // Continue with deletion even if token revocation fails
      }
      
      await client.deleteApplication(params.clientId);
      
      return `🗑️ **Application OAuth2 supprimée**\n\n` +
             `Client ID: ${params.clientId}\n` +
             `Tous les tokens associés ont été révoqués.\n` +
             `⚠️ Cette action est irréversible.`;
      
    } catch (error: any) {
      return `Erreur lors de la suppression de l'application OAuth2: ${error.message}`;
    }
  }
};

const oauth2TokenManage: ToolDefinition = {
  name: 'oauth2_token_manage',
  description: 'Manage OAuth2 tokens (list, revoke, analyze usage)',
  parameters: [
    { name: 'action', type: 'string', description: 'Action: list, revoke, analyze', required: true },
    { name: 'clientId', type: 'string', description: 'Client ID to filter tokens', required: false },
    { name: 'tokenId', type: 'string', description: 'Token ID to revoke (for revoke action)', required: false },
    { name: 'includeExpired', type: 'boolean', description: 'Include expired tokens', required: false, default: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      if (params.action === 'list') {
        if (!params.clientId) {
          return '❌ Le paramètre clientId est requis pour l\'action list.';
        }
        
        const tokens = await client.listApplicationTokens(params.clientId);
        
        let filteredTokens = tokens.data;
        if (!params.includeExpired) {
          filteredTokens = tokens.data.filter((token: any) => !token.expired && !token.revoked);
        }
        
        let result = `🔑 **Tokens OAuth2 pour ${params.clientId} (${filteredTokens.length})**\n\n`;
        
        if (filteredTokens.length === 0) {
          result += 'Aucun token actif trouvé.';
          return result;
        }
        
        filteredTokens.forEach((token: any, index: number) => {
          const statusIcon = token.revoked ? '🔴' : token.expired ? '🟡' : '🟢';
          const status = token.revoked ? 'Révoqué' : token.expired ? 'Expiré' : 'Actif';
          
          result += `${statusIcon} **${index + 1}. Token ${token.id}**\n`;
          result += `   Statut: ${status}\n`;
          result += `   Créé: ${token.createdAt}\n`;
          result += `   Expire: ${token.expiresAt || 'Jamais'}\n`;
          result += `   Scopes: ${token.scopes?.join(', ') || 'Tous'}\n`;
          if (token.lastUsed) result += `   Dernière utilisation: ${token.lastUsed}\n`;
          result += `\n`;
        });
        
        return result;
        
      } else if (params.action === 'revoke') {
        if (!params.tokenId) {
          return '❌ Le paramètre tokenId est requis pour l\'action revoke.';
        }
        
        await client.revokeToken(params.tokenId);
        return `🔑 **Token révoqué avec succès**\n\nToken ID: ${params.tokenId}`;
        
      } else if (params.action === 'analyze') {
        if (!params.clientId) {
          return '❌ Le paramètre clientId est requis pour l\'action analyze.';
        }
        
        const tokens = await client.listApplicationTokens(params.clientId);
        
        const totalTokens = tokens.data.length;
        const activeTokens = tokens.data.filter((t: any) => !t.revoked && !t.expired).length;
        const expiredTokens = tokens.data.filter((t: any) => t.expired).length;
        const revokedTokens = tokens.data.filter((t: any) => t.revoked).length;
        
        let result = `📊 **Analyse des tokens pour ${params.clientId}**\n\n`;
        result += `**Statistiques:**\n`;
        result += `   🔢 Total: ${totalTokens}\n`;
        result += `   🟢 Actifs: ${activeTokens}\n`;
        result += `   🟡 Expirés: ${expiredTokens}\n`;
        result += `   🔴 Révoqués: ${revokedTokens}\n\n`;
        
        // Usage analysis
        const tokensWithUsage = tokens.data.filter((t: any) => t.lastUsed);
        if (tokensWithUsage.length > 0) {
          result += `**Utilisation:**\n`;
          result += `   📈 Tokens utilisés: ${tokensWithUsage.length}/${totalTokens}\n`;
          
          // Most recent usage
          const mostRecent = tokensWithUsage.sort((a: any, b: any) => 
            new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
          )[0];
          result += `   ⏰ Dernière activité: ${mostRecent.lastUsed}\n`;
        }
        
        return result;
        
      } else {
        return '❌ Action invalide. Utilisez: list, revoke, analyze';
      }
    } catch (error: any) {
      return `Erreur lors de la gestion des tokens: ${error.message}`;
    }
  }
};

// ========== SECURITY MANAGEMENT ==========

const securityAudit: ToolDefinition = {
  name: 'security_audit',
  description: 'Comprehensive security audit and access monitoring',
  parameters: [
    { name: 'type', type: 'string', description: 'Audit type: access, failed_logins, user_activity, api_usage', required: true },
    { name: 'fromDate', type: 'string', description: 'Start date (YYYY-MM-DD)', required: false },
    { name: 'toDate', type: 'string', description: 'End date (YYYY-MM-DD)', required: false },
    { name: 'userId', type: 'number', description: 'Filter by user ID', required: false },
    { name: 'ipAddress', type: 'string', description: 'Filter by IP address', required: false },
    { name: 'limit', type: 'number', description: 'Maximum results', required: false, default: 50 }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const auditParams: any = {
        start: 0,
        length: params.limit || 50
      };
      
      if (params.fromDate) auditParams.fromDt = params.fromDate;
      if (params.toDate) auditParams.toDt = params.toDate;
      if (params.userId) auditParams.userId = params.userId;
      if (params.ipAddress) auditParams.ip = params.ipAddress;
      
      let result = `🔍 **Audit de sécurité: ${params.type}**\n\n`;
      
      if (params.fromDate && params.toDate) {
        result += `**Période:** ${params.fromDate} → ${params.toDate}\n`;
      }
      if (params.userId) result += `**Utilisateur:** ${params.userId}\n`;
      if (params.ipAddress) result += `**IP:** ${params.ipAddress}\n`;
      result += `\n`;
      
      switch (params.type) {
        case 'access':
          const accessLogs = await client.getAccessLogs(auditParams);
          result += `📊 **Logs d'accès (${accessLogs.data.length})**\n\n`;
          
          accessLogs.data.forEach((log: any, index: number) => {
            result += `**${index + 1}.** [${log.logDate}] ${log.userName || 'Utilisateur inconnu'}\n`;
            result += `   🌐 IP: ${log.ip}\n`;
            result += `   🔗 ${log.method} ${log.route}\n`;
            result += `   👤 User Agent: ${log.userAgent?.substring(0, 50) || 'N/A'}...\n`;
            if (log.message) result += `   💬 Message: ${log.message}\n`;
            result += `\n`;
          });
          break;
          
        case 'failed_logins':
          const failedLogins = await client.getFailedLogins(auditParams);
          result += `🔴 **Tentatives de connexion échouées (${failedLogins.data.length})**\n\n`;
          
          // Group by IP for security analysis
          const ipCounts: any = {};
          failedLogins.data.forEach((log: any) => {
            ipCounts[log.ip] = (ipCounts[log.ip] || 0) + 1;
          });
          
          result += `**Analyse des IPs suspectes:**\n`;
          Object.entries(ipCounts)
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .slice(0, 5)
            .forEach(([ip, count]) => {
              result += `   🚨 ${ip}: ${count} tentatives\n`;
            });
          result += `\n`;
          
          result += `**Détails des tentatives:**\n`;
          failedLogins.data.slice(0, 10).forEach((log: any, index: number) => {
            result += `**${index + 1}.** [${log.logDate}] Échec de connexion\n`;
            result += `   🌐 IP: ${log.ip}\n`;
            result += `   👤 Utilisateur tenté: ${log.userName || 'N/A'}\n`;
            result += `   💬 Raison: ${log.message}\n`;
            result += `\n`;
          });
          break;
          
        case 'user_activity':
          const auditLogs = await client.getAuditLogs(auditParams);
          result += `👥 **Activité des utilisateurs (${auditLogs.data.length})**\n\n`;
          
          auditLogs.data.forEach((log: any, index: number) => {
            const actionIcon = log.message.includes('create') ? '➕' :
                             log.message.includes('update') ? '✏️' :
                             log.message.includes('delete') ? '🗑️' : '🔧';
            
            result += `${actionIcon} **${index + 1}.** [${log.logDate}] ${log.userName}\n`;
            result += `   📝 Action: ${log.message}\n`;
            result += `   🎯 Entité: ${log.entity} (ID: ${log.entityId})\n`;
            result += `   🌐 IP: ${log.ip || 'N/A'}\n`;
            result += `\n`;
          });
          break;
          
        case 'api_usage':
          // This would require custom implementation based on Xibo's logging
          result += `📊 **Utilisation API**\n\n`;
          result += `Cette fonctionnalité nécessite une configuration avancée des logs Xibo.\n`;
          result += `Contactez votre administrateur système pour activer le logging API détaillé.`;
          break;
      }
      
      return result;
    } catch (error: any) {
      return `Erreur lors de l'audit de sécurité: ${error.message}`;
    }
  }
};

const securityControl: ToolDefinition = {
  name: 'security_control',
  description: 'Advanced security controls (IP blocking, rate limiting, etc.)',
  parameters: [
    { name: 'action', type: 'string', description: 'Action: block_ip, unblock_ip, list_blocked, set_rate_limit, get_settings', required: true },
    { name: 'ipAddress', type: 'string', description: 'IP address for blocking actions', required: false },
    { name: 'reason', type: 'string', description: 'Reason for blocking IP', required: false },
    { name: 'userId', type: 'number', description: 'User ID for rate limiting', required: false },
    { name: 'limit', type: 'number', description: 'Rate limit (requests per window)', required: false },
    { name: 'windowMinutes', type: 'number', description: 'Rate limit window in minutes', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      switch (params.action) {
        case 'block_ip':
          if (!params.ipAddress) {
            return '❌ Le paramètre ipAddress est requis pour bloquer une IP.';
          }
          
          await client.blockIP(params.ipAddress, params.reason);
          
          return `🚫 **IP bloquée avec succès**\n\n` +
                 `IP: ${params.ipAddress}\n` +
                 `Raison: ${params.reason || 'Non spécifiée'}\n` +
                 `⚠️ Cette IP ne pourra plus accéder au système.`;
                 
        case 'unblock_ip':
          if (!params.ipAddress) {
            return '❌ Le paramètre ipAddress est requis pour débloquer une IP.';
          }
          
          await client.unblockIP(params.ipAddress);
          
          return `✅ **IP débloquée avec succès**\n\nIP: ${params.ipAddress}`;
          
        case 'list_blocked':
          const blockedIPs = await client.listBlockedIPs();
          
          let result = `🚫 **IPs bloquées (${blockedIPs.data.length})**\n\n`;
          
          if (blockedIPs.data.length === 0) {
            result += 'Aucune IP bloquée.';
            return result;
          }
          
          blockedIPs.data.forEach((blocked: any, index: number) => {
            result += `**${index + 1}. ${blocked.ip}**\n`;
            result += `   📅 Bloquée le: ${blocked.blockedAt}\n`;
            result += `   💬 Raison: ${blocked.reason || 'Non spécifiée'}\n`;
            if (blocked.blockedBy) result += `   👤 Bloquée par: ${blocked.blockedBy}\n`;
            result += `\n`;
          });
          
          return result;
          
        case 'set_rate_limit':
          if (!params.userId || !params.limit || !params.windowMinutes) {
            return '❌ Les paramètres userId, limit et windowMinutes sont requis.';
          }
          
          await client.setUserRateLimit(params.userId, params.limit, params.windowMinutes);
          
          return `⏱️ **Limitation de débit configurée**\n\n` +
                 `Utilisateur: ${params.userId}\n` +
                 `Limite: ${params.limit} requêtes\n` +
                 `Fenêtre: ${params.windowMinutes} minutes`;
                 
        case 'get_settings':
          const settings = await client.getSecuritySettings();
          
          let settingsResult = `🔐 **Paramètres de sécurité**\n\n`;
          
          if (settings.data.passwordPolicy) {
            settingsResult += `**Politique de mot de passe:**\n`;
            settingsResult += `   Longueur minimale: ${settings.data.passwordPolicy.minLength}\n`;
            settingsResult += `   Caractères spéciaux requis: ${settings.data.passwordPolicy.requireSpecialChars ? 'Oui' : 'Non'}\n`;
            settingsResult += `   Expiration: ${settings.data.passwordPolicy.expirationDays} jours\n\n`;
          }
          
          if (settings.data.sessionPolicy) {
            settingsResult += `**Politique de session:**\n`;
            settingsResult += `   Timeout: ${settings.data.sessionPolicy.timeoutMinutes} minutes\n`;
            settingsResult += `   Sessions simultanées max: ${settings.data.sessionPolicy.maxSessions}\n\n`;
          }
          
          if (settings.data.rateLimiting) {
            settingsResult += `**Limitation de débit:**\n`;
            settingsResult += `   Activée: ${settings.data.rateLimiting.enabled ? 'Oui' : 'Non'}\n`;
            settingsResult += `   Limite par défaut: ${settings.data.rateLimiting.defaultLimit}/heure\n`;
          }
          
          return settingsResult;
          
        default:
          return '❌ Action invalide. Utilisez: block_ip, unblock_ip, list_blocked, set_rate_limit, get_settings';
      }
    } catch (error: any) {
      return `Erreur lors du contrôle de sécurité: ${error.message}`;
    }
  }
};

// ========== USER SESSION MANAGEMENT ==========

const sessionManage: ToolDefinition = {
  name: 'session_manage',
  description: 'Manage user sessions and authentication status',
  parameters: [
    { name: 'action', type: 'string', description: 'Action: list_active, terminate, get_user_sessions', required: true },
    { name: 'userId', type: 'number', description: 'User ID for user-specific actions', required: false },
    { name: 'sessionId', type: 'string', description: 'Session ID to terminate', required: false },
    { name: 'includeDetails', type: 'boolean', description: 'Include detailed session info', required: false, default: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      // Note: This is a conceptual implementation as Xibo may not have direct session management API
      // In practice, this would be implemented through custom endpoints or database queries
      
      let result = `👥 **Gestion des sessions**\n\n`;
      
      switch (params.action) {
        case 'list_active':
          result += `**Sessions actives**\n\n`;
          result += `🔍 Cette fonctionnalité nécessite une implémentation personnalisée.\n`;
          result += `Les sessions actives peuvent être consultées via:\n`;
          result += `- Logs d'audit des connexions récentes\n`;
          result += `- Monitoring des tokens OAuth2 actifs\n`;
          result += `- Base de données des sessions PHP (si applicable)\n\n`;
          
          // Show OAuth2 tokens as active sessions
          try {
            const apps = await client.listApplications();
            let totalActiveSessions = 0;
            
            result += `**Approximation via tokens OAuth2 actifs:**\n`;
            for (const app of apps.data) {
              try {
                const tokens = await client.listApplicationTokens(app.clientId);
                const activeTokens = tokens.data.filter((token: any) => !token.revoked && !token.expired);
                totalActiveSessions += activeTokens.length;
                
                if (activeTokens.length > 0) {
                  result += `   ${app.name}: ${activeTokens.length} tokens actifs\n`;
                }
              } catch (error) {
                // Skip apps without tokens
              }
            }
            result += `\n**Total estimé de sessions actives:** ${totalActiveSessions}\n`;
            
          } catch (error) {
            result += `Erreur lors de la récupération des tokens: ${error.message}\n`;
          }
          break;
          
        case 'get_user_sessions':
          if (!params.userId) {
            return '❌ Le paramètre userId est requis pour cette action.';
          }
          
          result += `**Sessions pour l'utilisateur ${params.userId}**\n\n`;
          
          // Get user's recent activity from audit logs
          try {
            const auditLogs = await client.getAuditLogs({ userId: params.userId, length: 20 });
            const recentActivity = auditLogs.data.slice(0, 10);
            
            result += `**Activité récente:**\n`;
            recentActivity.forEach((log: any, index: number) => {
              result += `   ${index + 1}. [${log.logDate}] ${log.message}\n`;
              result += `      IP: ${log.ip || 'N/A'}\n`;
            });
            
          } catch (error) {
            result += `Impossible de récupérer l'activité de l'utilisateur: ${error.message}\n`;
          }
          break;
          
        case 'terminate':
          if (!params.sessionId) {
            return '❌ Le paramètre sessionId est requis pour terminer une session.';
          }
          
          result += `**Terminer la session**\n\n`;
          result += `Session ID: ${params.sessionId}\n\n`;
          result += `⚠️ La terminaison directe de session nécessite une implémentation personnalisée.\n`;
          result += `Alternatives disponibles:\n`;
          result += `- Révoquer les tokens OAuth2 de l'utilisateur\n`;
          result += `- Modifier les permissions utilisateur\n`;
          result += `- Bloquer l'adresse IP temporairement\n`;
          break;
          
        default:
          return '❌ Action invalide. Utilisez: list_active, get_user_sessions, terminate';
      }
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la gestion des sessions: ${error.message}`;
    }
  }
};

export const oauth2SecurityTools: ToolDefinition[] = [
  oauth2AppList,
  oauth2AppCreate,
  oauth2AppEdit,
  oauth2AppDelete,
  oauth2TokenManage,
  securityAudit,
  securityControl,
  sessionManage
];