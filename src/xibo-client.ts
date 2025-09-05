/**
 * Xibo API Client with OAuth Authentication + Direct User Auth Support
 * Enhanced with all missing API endpoints for comprehensive CMS integration
 * @author Xtranumerik Inc.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';
import { XiboAuthConfig, XiboTokenResponse, ApiResponse, ApiError, User, UserGroup, SystemInfo, AuditLog, Webhook, Report, AuthMode } from './types.js';
import { TokenManager } from './auth/token-manager.js';
import { DirectUserAuth } from './auth/direct-auth.js';

export class XiboClient {
  private axiosInstance: AxiosInstance;
  private config: XiboAuthConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private refreshToken: string | null = null;
  private tokenManager: TokenManager | null = null;
  private directAuth: DirectUserAuth | null = null;
  private authMode: 'client_credentials' | 'user_tokens' | 'direct_user' = 'client_credentials';

  constructor(config: XiboAuthConfig) {
    this.config = {
      ...config,
      grantType: config.grantType || 'client_credentials',
      authMode: config.authMode || 'client_credentials'
    };

    // Remove trailing slash from API URL
    this.config.apiUrl = this.config.apiUrl.replace(/\/$/, '');

    // Initialize authentication based on mode
    this.initializeAuthentication();

    // Create axios instance with base configuration
    this.axiosInstance = axios.create({
      baseURL: `${this.config.apiUrl}/api`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Add request interceptor to include auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        await this.ensureAuthenticated();
        
        if (this.authMode === 'direct_user' && this.directAuth) {
          // For direct user auth, we might need session cookies or custom headers
          const session = this.directAuth.getSession();
          if (session) {
            // Add session cookie or custom auth header
            config.headers['Cookie'] = `PHPSESSID=${session.sessionId}`;
            if (session.csrf_token) {
              config.headers['X-CSRF-TOKEN'] = session.csrf_token;
            }
          }
        } else if (this.accessToken) {
          // Standard OAuth2 Bearer token
          config.headers['Authorization'] = `Bearer ${this.accessToken}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, try to refresh or re-authenticate
          await this.handleTokenExpiry();
          
          // Retry the original request
          if (error.config) {
            return this.axiosInstance.request(error.config);
          }
        }
        return Promise.reject(this.formatError(error));
      }
    );
  }

  /**
   * Initialize authentication based on configured mode
   */
  private initializeAuthentication(): void {
    try {
      if (this.config.authMode === 'direct_user') {
        // Initialize direct user authentication
        if (this.config.username && this.config.password) {
          this.directAuth = new DirectUserAuth(
            this.config.apiUrl,
            this.config.username,
            this.config.password
          );
          this.authMode = 'direct_user';
          console.log('🔐 Mode d\'authentification directe activé');
        } else {
          console.warn('⚠️  Direct user mode requested but no username/password provided');
          this.authMode = 'client_credentials';
        }
      } else if (this.config.clientId && this.config.clientSecret) {
        // Initialize token manager for OAuth2
        this.tokenManager = new TokenManager({
          apiUrl: this.config.apiUrl,
          clientId: this.config.clientId,
          clientSecret: this.config.clientSecret
        });

        // Check if user tokens are available
        if (this.tokenManager.isAuthenticated()) {
          this.authMode = 'user_tokens';
          console.log('🔐 Mode d\'authentification utilisateur OAuth2 activé');
          
          const userInfo = this.tokenManager.getUserInfo();
          if (userInfo) {
            console.log(`👤 Utilisateur connecté: ${userInfo.username}`);
          }
        } else {
          this.authMode = 'client_credentials';
          console.log('🔐 Mode d\'authentification client credentials activé');
        }
      }
    } catch (error) {
      console.log('⚠️  Authentication initialization failed, using client credentials');
      this.authMode = 'client_credentials';
    }
  }

  /**
   * Handle token expiry (try user token refresh first, then fallback)
   */
  private async handleTokenExpiry(): Promise<void> {
    if (this.authMode === 'direct_user' && this.directAuth) {
      try {
        // Try to refresh direct user session
        if (!this.directAuth.isSessionValid()) {
          const authResult = await this.directAuth.authenticate();
          if (!authResult.success) {
            throw new Error('Direct authentication refresh failed');
          }
        }
        return;
      } catch (error) {
        console.log('⚠️  Direct user session refresh failed');
        // Don't fallback for direct user mode, just fail
        throw error;
      }
    }

    if (this.authMode === 'user_tokens' && this.tokenManager) {
      try {
        const newToken = await this.tokenManager.getValidAccessToken();
        if (newToken) {
          this.accessToken = newToken;
          return;
        }
      } catch (error) {
        console.log('⚠️  User token refresh failed, falling back to client credentials');
      }
    }

    // Fallback to client credentials
    this.authMode = 'client_credentials';
    await this.authenticate(true);
  }

  /**
   * Authenticate with Xibo CMS (supports all auth modes)
   */
  private async authenticate(force: boolean = false): Promise<void> {
    // Handle direct user authentication
    if (this.authMode === 'direct_user' && this.directAuth) {
      if (force || !this.directAuth.isSessionValid()) {
        const authResult = await this.directAuth.authenticate();
        if (!authResult.success) {
          throw new Error(`Direct authentication failed: ${authResult.error}`);
        }
        console.log('✅ Direct user authentication successful');
      }
      return;
    }

    // Handle OAuth2 user token authentication
    if (this.authMode === 'user_tokens' && this.tokenManager) {
      try {
        const token = await this.tokenManager.getValidAccessToken();
        if (token) {
          this.accessToken = token;
          console.log('✅ User token authentication successful');
          return;
        }
      } catch (error) {
        console.log('⚠️  User authentication failed, falling back to client credentials');
        this.authMode = 'client_credentials';
      }
    }

    // Handle client credentials authentication
    if (!force && this.isTokenValid()) {
      return;
    }

    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error('Client credentials not configured for fallback authentication');
    }

    try {
      // Try different authentication endpoints and methods
      const authEndpoints = [
        '/api/authorize/access_token',
        '/api/oauth/token',
        '/api/auth/access_token'
      ];

      let authResponse: any = null;
      let lastError: any = null;

      for (const endpoint of authEndpoints) {
        try {
          const authData = new URLSearchParams();
          authData.append('grant_type', this.config.grantType!);
          authData.append('client_id', this.config.clientId);
          authData.append('client_secret', this.config.clientSecret);

          if (this.refreshToken && this.config.grantType === 'authorization_code') {
            authData.append('refresh_token', this.refreshToken);
            authData.append('grant_type', 'refresh_token');
          }

          console.log(`🔍 Trying authentication endpoint: ${endpoint}`);
          
          const response = await axios.post<XiboTokenResponse>(
            `${this.config.apiUrl}${endpoint}`,
            authData,
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
              },
              timeout: 10000
            }
          );
          
          authResponse = response;
          break;
        } catch (error: any) {
          lastError = error;
          console.log(`❌ Failed endpoint ${endpoint}: ${error.response?.data?.error || error.message}`);
          continue;
        }
      }

      if (!authResponse) {
        throw lastError || new Error('All authentication endpoints failed');
      }

      const response = authResponse;

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token || null;
      
      // Calculate token expiry (slightly before actual expiry for safety)
      const expirySeconds = response.data.expires_in - 60;
      this.tokenExpiry = new Date(Date.now() + expirySeconds * 1000);

      console.log('✅ Successfully authenticated with Xibo CMS (client credentials)');
    } catch (error: any) {
      console.error('❌ Authentication failed:', error.response?.data || error.message);
      throw new Error(`Failed to authenticate with Xibo: ${error.message}`);
    }
  }

  /**
   * Check if current token is valid
   */
  private isTokenValid(): boolean {
    if (this.authMode === 'direct_user' && this.directAuth) {
      return this.directAuth.isSessionValid();
    }
    
    if (!this.accessToken || !this.tokenExpiry) {
      return false;
    }
    return new Date() < this.tokenExpiry;
  }

  /**
   * Ensure authenticated before making requests
   */
  private async ensureAuthenticated(): Promise<void> {
    if (this.authMode === 'direct_user' && this.directAuth) {
      if (!this.directAuth.isSessionValid()) {
        const authResult = await this.directAuth.authenticate();
        if (!authResult.success) {
          throw new Error('Direct authentication failed');
        }
      }
      return;
    }

    if (this.authMode === 'user_tokens' && this.tokenManager) {
      const token = await this.tokenManager.getValidAccessToken();
      if (token) {
        this.accessToken = token;
        return;
      }
      // User token failed, fallback to client credentials
      this.authMode = 'client_credentials';
    }

    if (!this.isTokenValid()) {
      await this.authenticate();
    }
  }

  /**
   * Format error responses
   */
  private formatError(error: AxiosError): ApiError {
    if (error.response) {
      const data = error.response.data as any;
      return {
        error: {
          message: data?.error?.message || data?.message || error.message,
          code: data?.error?.code || error.code || 'UNKNOWN_ERROR',
          data: data
        },
        help: data?.help
      };
    }
    return {
      error: {
        message: error.message,
        code: error.code || 'NETWORK_ERROR'
      }
    };
  }

  /**
   * Get current authentication mode
   */
  public getAuthMode(): 'client_credentials' | 'user_tokens' | 'direct_user' {
    return this.authMode;
  }

  /**
   * Get authentication status and user info
   */
  public getAuthStatus(): {
    mode: string;
    isAuthenticated: boolean;
    userInfo?: any;
    tokenStats?: any;
    sessionInfo?: any;
  } {
    const status = {
      mode: this.authMode,
      isAuthenticated: false,
      userInfo: undefined as any,
      tokenStats: undefined as any,
      sessionInfo: undefined as any
    };

    if (this.authMode === 'direct_user' && this.directAuth) {
      status.isAuthenticated = this.directAuth.isSessionValid();
      const session = this.directAuth.getSession();
      if (session) {
        status.userInfo = { username: session.username, userId: session.userId };
        status.sessionInfo = {
          sessionId: session.sessionId,
          expiresAt: session.expires_at,
          permissions: session.permissions
        };
      }
    } else if (this.authMode === 'user_tokens' && this.tokenManager) {
      status.isAuthenticated = this.tokenManager.isAuthenticated();
      status.userInfo = this.tokenManager.getUserInfo() || undefined;
      status.tokenStats = this.tokenManager.getTokenStats() || undefined;
    } else {
      status.isAuthenticated = this.isTokenValid();
    }

    return status;
  }

  /**
   * Switch to user authentication mode (if user tokens are available)
   */
  public async switchToUserAuth(): Promise<boolean> {
    if (!this.tokenManager) {
      return false;
    }

    if (this.tokenManager.isAuthenticated()) {
      this.authMode = 'user_tokens';
      const token = await this.tokenManager.getValidAccessToken();
      if (token) {
        this.accessToken = token;
        return true;
      }
    }

    return false;
  }

  /**
   * Logout user (affects user tokens and direct user sessions)
   */
  public async logout(): Promise<void> {
    if (this.authMode === 'direct_user' && this.directAuth) {
      await this.directAuth.logout();
    }
    
    if (this.tokenManager) {
      this.tokenManager.logout();
    }
    
    if (this.authMode === 'user_tokens' || this.authMode === 'direct_user') {
      this.authMode = 'client_credentials';
      this.accessToken = null;
      this.tokenExpiry = null;
    }
  }

  // ========== GENERIC HTTP REQUEST METHOD ==========

  /**
   * Generic request method that can be used by other parts of the system
   */
  async request<T = any>(method: string, endpoint: string, data?: any, config?: any): Promise<T> {
    const response = await this.axiosInstance.request<T>({
      method,
      url: endpoint,
      data,
      ...config
    });
    return response.data;
  }

  // ========== BASIC HTTP METHODS ==========

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.get<T>(endpoint, { params });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.post<T>(endpoint, data, config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    // Xibo requires x-www-form-urlencoded for PUT requests
    const formData = new URLSearchParams();
    if (data) {
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key].toString());
        }
      });
    }

    const response = await this.axiosInstance.put<T>(endpoint, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  }

  /**
   * PATCH request for partial updates
   */
  async patch<T = any>(endpoint: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.patch<T>(endpoint, data, config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, config?: any): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.delete<T>(endpoint, config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  }

  // ========== USER MANAGEMENT METHODS ==========

  /**
   * Create a new user
   */
  async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.post('/user', userData);
  }

  /**
   * Update user information
   */
  async updateUser(userId: number, userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.put(`/user/${userId}`, userData);
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: number, options?: { deleteAll?: boolean; reassignUserId?: number }): Promise<ApiResponse<void>> {
    const params = options ? {
      deleteAll: options.deleteAll ? 1 : 0,
      reassignUserId: options.reassignUserId
    } : {};
    return this.delete(`/user/${userId}`, { params });
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId: number): Promise<ApiResponse<any[]>> {
    return this.get(`/user/${userId}/permissions`);
  }

  /**
   * Set user permissions
   */
  async setUserPermissions(userId: number, permissions: any[]): Promise<ApiResponse<void>> {
    return this.post(`/user/${userId}/permissions`, { permissions });
  }

  /**
   * Create user group
   */
  async createUserGroup(groupData: Partial<UserGroup>): Promise<ApiResponse<UserGroup>> {
    return this.post('/group', groupData);
  }

  /**
   * Update user group
   */
  async updateUserGroup(groupId: number, groupData: Partial<UserGroup>): Promise<ApiResponse<UserGroup>> {
    return this.put(`/group/${groupId}`, groupData);
  }

  /**
   * Delete user group
   */
  async deleteUserGroup(groupId: number): Promise<ApiResponse<void>> {
    return this.delete(`/group/${groupId}`);
  }

  /**
   * Add user to group
   */
  async addUserToGroup(userId: number, groupId: number): Promise<ApiResponse<void>> {
    return this.post(`/user/${userId}/group/assign`, { groupId });
  }

  /**
   * Remove user from group
   */
  async removeUserFromGroup(userId: number, groupId: number): Promise<ApiResponse<void>> {
    return this.post(`/user/${userId}/group/unassign`, { groupId });
  }

  // ========== SYSTEM ADMINISTRATION METHODS ==========

  /**
   * Get system information
   */
  async getSystemInfo(): Promise<ApiResponse<SystemInfo>> {
    return this.get('/about');
  }

  /**
   * Get system settings
   */
  async getSystemSettings(): Promise<ApiResponse<any>> {
    return this.get('/settings');
  }

  /**
   * Update system settings
   */
  async updateSystemSettings(settings: Record<string, any>): Promise<ApiResponse<void>> {
    return this.put('/settings', settings);
  }

  /**
   * Get system maintenance status
   */
  async getMaintenanceStatus(): Promise<ApiResponse<any>> {
    return this.get('/maintenance');
  }

  /**
   * Enable maintenance mode
   */
  async enableMaintenanceMode(message?: string): Promise<ApiResponse<void>> {
    return this.post('/maintenance/enable', { message });
  }

  /**
   * Disable maintenance mode
   */
  async disableMaintenanceMode(): Promise<ApiResponse<void>> {
    return this.post('/maintenance/disable');
  }

  /**
   * Get system logs
   */
  async getSystemLogs(params?: any): Promise<ApiResponse<any[]>> {
    return this.get('/log', params);
  }

  /**
   * Clear system logs
   */
  async clearSystemLogs(): Promise<ApiResponse<void>> {
    return this.delete('/log');
  }

  /**
   * Run system task
   */
  async runSystemTask(taskName: string): Promise<ApiResponse<any>> {
    return this.post(`/task/${taskName}/run`);
  }

  /**
   * Get system tasks status
   */
  async getSystemTasks(): Promise<ApiResponse<any[]>> {
    return this.get('/task');
  }

  // ========== OAUTH2 APPLICATION MANAGEMENT ==========

  /**
   * List OAuth2 applications
   */
  async listApplications(): Promise<ApiResponse<any[]>> {
    return this.get('/application');
  }

  /**
   * Create OAuth2 application
   */
  async createApplication(appData: any): Promise<ApiResponse<any>> {
    return this.post('/application', appData);
  }

  /**
   * Update OAuth2 application
   */
  async updateApplication(appId: number, appData: any): Promise<ApiResponse<any>> {
    return this.put(`/application/${appId}`, appData);
  }

  /**
   * Delete OAuth2 application
   */
  async deleteApplication(appId: number): Promise<ApiResponse<void>> {
    return this.delete(`/application/${appId}`);
  }

  /**
   * Generate new client secret
   */
  async regenerateClientSecret(appId: number): Promise<ApiResponse<{ clientSecret: string }>> {
    return this.post(`/application/${appId}/regenerate`);
  }

  /**
   * List access tokens for application
   */
  async listApplicationTokens(appId: number): Promise<ApiResponse<any[]>> {
    return this.get(`/application/${appId}/tokens`);
  }

  /**
   * Revoke access token
   */
  async revokeToken(tokenId: string): Promise<ApiResponse<void>> {
    return this.delete(`/token/${tokenId}`);
  }

  /**
   * List OAuth2 scopes
   */
  async listOAuthScopes(): Promise<ApiResponse<any[]>> {
    return this.get('/oauth/scopes');
  }

  // ========== SECURITY AND AUDIT ==========

  /**
   * Get audit logs
   */
  async getAuditLogs(params?: any): Promise<ApiResponse<AuditLog[]>> {
    return this.get('/auditlog', params);
  }

  /**
   * Get access logs
   */
  async getAccessLogs(params?: any): Promise<ApiResponse<any[]>> {
    return this.get('/log/access', params);
  }

  /**
   * Get failed login attempts
   */
  async getFailedLogins(params?: any): Promise<ApiResponse<any[]>> {
    return this.get('/log/login', params);
  }

  /**
   * Block IP address
   */
  async blockIP(ipAddress: string, reason?: string): Promise<ApiResponse<void>> {
    return this.post('/security/ip/block', { ip: ipAddress, reason });
  }

  /**
   * Unblock IP address
   */
  async unblockIP(ipAddress: string): Promise<ApiResponse<void>> {
    return this.delete(`/security/ip/block/${ipAddress}`);
  }

  /**
   * List blocked IPs
   */
  async listBlockedIPs(): Promise<ApiResponse<any[]>> {
    return this.get('/security/ip/blocked');
  }

  /**
   * Set rate limit for user
   */
  async setUserRateLimit(userId: number, limit: number, windowMinutes: number): Promise<ApiResponse<void>> {
    return this.post(`/user/${userId}/ratelimit`, { limit, windowMinutes });
  }

  /**
   * Get security settings
   */
  async getSecuritySettings(): Promise<ApiResponse<any>> {
    return this.get('/security/settings');
  }

  /**
   * Update security settings
   */
  async updateSecuritySettings(settings: any): Promise<ApiResponse<void>> {
    return this.put('/security/settings', settings);
  }

  // ========== TESTING AND CONNECTION METHODS ==========

  /**
   * Test connection to Xibo
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log(`🔍 Testing connection to Xibo CMS at: ${this.config.apiUrl}`);
      
      // Show authentication mode
      const authStatus = this.getAuthStatus();
      console.log(`🔐 Authentication mode: ${authStatus.mode}`);
      if (authStatus.userInfo) {
        console.log(`👤 User: ${authStatus.userInfo.username}`);
      }
      
      // First check if the server is reachable
      try {
        const healthResponse = await axios.get(`${this.config.apiUrl}/api`, { timeout: 5000 });
        console.log(`📡 Server responded with status: ${healthResponse.status}`);
      } catch (error: any) {
        console.log(`⚠️  Server health check failed: ${error.message}`);
      }
      
      await this.ensureAuthenticated();
      const response = await this.get('/clock');
      console.log('✅ Connection to Xibo successful');
      console.log(`   Server time: ${response.data}`);
      return true;
    } catch (error: any) {
      console.error('❌ Connection test failed:', error.response?.data || error.message);
      
      // If authentication fails, try debug mode
      if (error.message.includes('authenticate') || error.response?.status === 401) {
        console.log('\n🔍 Running authentication debug...');
        await this.debugAuthentication();
      }
      
      return false;
    }
  }

  /**
   * Test different authentication methods based on Xibo documentation
   */
  async debugAuthentication(): Promise<void> {
    console.log('\n🔍 Debug Authentication Process');
    console.log('================================');
    console.log(`Current mode: ${this.authMode}`);
    
    if (this.authMode === 'direct_user') {
      console.log('Direct user authentication mode - testing session...');
      if (this.directAuth) {
        const isValid = this.directAuth.isSessionValid();
        console.log(`Session valid: ${isValid}`);
        
        if (!isValid) {
          console.log('Attempting to re-authenticate...');
          const authResult = await this.directAuth.authenticate();
          console.log(`Re-authentication result: ${authResult.success}`);
          if (!authResult.success) {
            console.log(`Error: ${authResult.error}`);
          }
        }
      }
      return;
    }

    // OAuth2 debug (existing logic)
    const authMethods = [
      {
        name: 'Form-encoded with client credentials in body',
        method: 'form-body',
        grant_type: 'client_credentials'
      },
      {
        name: 'HTTP Basic Auth with client credentials',
        method: 'basic-auth',
        grant_type: 'client_credentials'
      },
      {
        name: 'Form-encoded with authorization header',
        method: 'form-header',
        grant_type: 'client_credentials'
      }
    ];

    const endpoints = [
      '/api/authorize/access_token',
      '/api/oauth/access_token',
      '/api/oauth/token',
      '/authorize/access_token'
    ];

    for (const authMethod of authMethods) {
      console.log(`\n📋 Testing: ${authMethod.name}`);
      
      for (const endpoint of endpoints) {
        try {
          let requestConfig: any = {
            timeout: 10000,
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Xibo-MCP/2.0'
            }
          };

          let requestData: any;

          // Configure authentication method based on Xibo documentation
          switch (authMethod.method) {
            case 'form-body':
              requestData = new URLSearchParams();
              requestData.append('grant_type', authMethod.grant_type);
              requestData.append('client_id', this.config.clientId!);
              requestData.append('client_secret', this.config.clientSecret!);
              requestConfig.headers['Content-Type'] = 'application/x-www-form-urlencoded';
              break;

            case 'basic-auth':
              requestData = new URLSearchParams();
              requestData.append('grant_type', authMethod.grant_type);
              requestConfig.headers['Content-Type'] = 'application/x-www-form-urlencoded';
              requestConfig.auth = {
                username: this.config.clientId!,
                password: this.config.clientSecret!
              };
              break;

            case 'form-header':
              requestData = new URLSearchParams();
              requestData.append('grant_type', authMethod.grant_type);
              requestConfig.headers['Content-Type'] = 'application/x-www-form-urlencoded';
              const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');
              requestConfig.headers['Authorization'] = `Basic ${credentials}`;
              break;
          }

          console.log(`   🔗 ${endpoint} (${authMethod.method})...`);
          
          const response = await axios.post(
            `${this.config.apiUrl}${endpoint}`,
            requestData,
            requestConfig
          );
          
          console.log(`   ✅ SUCCESS! Status: ${response.status}`);
          console.log(`   📄 Access Token: ${response.data.access_token?.substring(0, 30)}...`);
          console.log(`   ⏰ Expires in: ${response.data.expires_in} seconds`);
          console.log(`   🎯 Working method: ${authMethod.name} on ${endpoint}`);
          return response.data;
          
        } catch (error: any) {
          const status = error.response?.status || 'NO_RESPONSE';
          const errorData = error.response?.data || error.message;
          const errorMsg = typeof errorData === 'object' ? JSON.stringify(errorData) : errorData;
          console.log(`   ❌ FAILED (${status}): ${errorMsg}`);
        }
      }
    }
    
    console.log('\n❌ All authentication methods failed');
    console.log('\n🔧 Possible Solutions:');
    console.log('   1. For OAuth2: Try user authentication with: npm run auth-user');
    console.log('   2. For Direct User: Check username/password in .env file');
    console.log('   3. Check if application is configured correctly in Xibo CMS');
    console.log('   4. Verify the client ID and secret are correctly configured');
    console.log('   5. Ensure the Xibo server version supports the expected endpoints');
    console.log('   6. Verify there are no network/firewall issues');
  }

  /**
   * Get server information (enhanced)
   */
  async getServerInfo(): Promise<any> {
    try {
      const response = await this.get('/about');
      return response.data;
    } catch (error) {
      // Fallback to simpler endpoint
      try {
        const clockResponse = await this.get('/clock');
        return { 
          status: 'online',
          server_time: clockResponse.data 
        };
      } catch (fallbackError) {
        return { 
          status: 'unknown',
          error: 'Could not retrieve server info'
        };
      }
    }
  }
}

export default XiboClient;