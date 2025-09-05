/**
 * Gestionnaire de tokens OAuth2 sécurisé pour Xibo MCP
 * Gestion automatique du refresh et stockage crypté
 * @author Xtranumerik Inc.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface TokenData {
  access_token: EncryptedData;
  refresh_token?: EncryptedData | null;
  expires_at: number | null;
  username: string;
  xibo_url: string;
  created_at: string;
}

export interface EncryptedData {
  iv: string;
  data: string;
  authTag: string;
}

export interface AuthConfig {
  apiUrl: string;
  clientId: string;
  clientSecret: string;
}

export class TokenManager {
  private tokenPath: string;
  private config: AuthConfig;
  private currentTokens: TokenData | null = null;

  constructor(config: AuthConfig) {
    this.config = config;
    this.tokenPath = path.join(__dirname, '..', '..', '.user-tokens');
    this.loadTokens();
  }

  /**
   * Chiffrer un token de manière sécurisée
   */
  private encryptToken(token: string): EncryptedData {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(this.config.clientSecret, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
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

  /**
   * Déchiffrer un token
   */
  private decryptToken(encryptedData: EncryptedData): string | null {
    try {
      const algorithm = 'aes-256-gcm';
      const key = crypto.scryptSync(this.config.clientSecret, 'salt', 32);
      const iv = Buffer.from(encryptedData.iv, 'hex');
      
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      decipher.setAAD(Buffer.from('xibo-mcp-token'));
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
      
      let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Erreur lors du déchiffrement du token:', error);
      return null;
    }
  }

  /**
   * Charger les tokens depuis le fichier
   */
  private loadTokens(): void {
    if (!fs.existsSync(this.tokenPath)) {
      this.currentTokens = null;
      return;
    }

    try {
      const data = fs.readFileSync(this.tokenPath, 'utf-8');
      this.currentTokens = JSON.parse(data);
    } catch (error) {
      console.error('Erreur lors du chargement des tokens:', error);
      this.currentTokens = null;
    }
  }

  /**
   * Sauvegarder les tokens
   */
  private saveTokens(tokens: TokenData): void {
    try {
      fs.writeFileSync(this.tokenPath, JSON.stringify(tokens, null, 2));
      this.currentTokens = tokens;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des tokens:', error);
      throw error;
    }
  }

  /**
   * Vérifier si un token est expiré
   */
  private isTokenExpired(): boolean {
    if (!this.currentTokens || !this.currentTokens.expires_at) {
      return true;
    }

    // Ajouter une marge de 5 minutes pour éviter les tokens expirés en cours d'utilisation
    const marginMs = 5 * 60 * 1000; // 5 minutes
    return Date.now() >= (this.currentTokens.expires_at - marginMs);
  }

  /**
   * Rafraîchir le token d'accès
   */
  private async refreshAccessToken(): Promise<string | null> {
    if (!this.currentTokens || !this.currentTokens.refresh_token) {
      return null;
    }

    try {
      const refreshToken = this.decryptToken(this.currentTokens.refresh_token);
      if (!refreshToken) {
        return null;
      }

      const tokenUrl = this.currentTokens.xibo_url.replace(/\/$/, '') + '/api/authorize/access_token';
      
      const formData = new URLSearchParams();
      formData.append('grant_type', 'refresh_token');
      formData.append('refresh_token', refreshToken);
      formData.append('client_id', this.config.clientId);
      formData.append('client_secret', this.config.clientSecret);

      const response = await axios.post(tokenUrl, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      if (response.data.access_token) {
        // Mettre à jour les tokens
        const updatedTokens: TokenData = {
          ...this.currentTokens,
          access_token: this.encryptToken(response.data.access_token),
          refresh_token: response.data.refresh_token ? 
            this.encryptToken(response.data.refresh_token) : this.currentTokens.refresh_token,
          expires_at: response.data.expires_in ? 
            Date.now() + (response.data.expires_in * 1000) : null
        };

        this.saveTokens(updatedTokens);
        return response.data.access_token;
      }

    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
    }

    return null;
  }

  /**
   * Obtenir un token d'accès valide
   */
  public async getValidAccessToken(): Promise<string | null> {
    if (!this.currentTokens) {
      return null;
    }

    // Si le token n'est pas expiré, le retourner
    if (!this.isTokenExpired()) {
      return this.decryptToken(this.currentTokens.access_token);
    }

    // Essayer de rafraîchir le token
    const refreshedToken = await this.refreshAccessToken();
    if (refreshedToken) {
      return refreshedToken;
    }

    // Token expiré et impossible à rafraîchir
    console.warn('Token expiré et impossible à rafraîchir. Veuillez vous reconnecter avec: npm run auth-user');
    return null;
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  public isAuthenticated(): boolean {
    return this.currentTokens !== null && !this.isTokenExpired();
  }

  /**
   * Obtenir les informations de l'utilisateur connecté
   */
  public getUserInfo(): { username: string; xiboUrl: string } | null {
    if (!this.currentTokens) {
      return null;
    }

    return {
      username: this.currentTokens.username,
      xiboUrl: this.currentTokens.xibo_url
    };
  }

  /**
   * Déconnecter l'utilisateur (supprimer les tokens)
   */
  public logout(): void {
    if (fs.existsSync(this.tokenPath)) {
      try {
        fs.unlinkSync(this.tokenPath);
        this.currentTokens = null;
      } catch (error) {
        console.error('Erreur lors de la suppression des tokens:', error);
      }
    }
  }

  /**
   * Obtenir des statistiques sur les tokens
   */
  public getTokenStats(): {
    isAuthenticated: boolean;
    username?: string;
    expiresAt?: Date;
    timeUntilExpiry?: string;
  } {
    if (!this.currentTokens) {
      return { isAuthenticated: false };
    }

    const stats: any = {
      isAuthenticated: !this.isTokenExpired(),
      username: this.currentTokens.username
    };

    if (this.currentTokens.expires_at) {
      stats.expiresAt = new Date(this.currentTokens.expires_at);
      
      const timeLeft = this.currentTokens.expires_at - Date.now();
      if (timeLeft > 0) {
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        stats.timeUntilExpiry = `${hours}h ${minutes}m`;
      } else {
        stats.timeUntilExpiry = 'Expiré';
      }
    }

    return stats;
  }
}