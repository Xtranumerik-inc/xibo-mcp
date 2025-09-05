/**
 * Direct User Authentication System for Xibo MCP
 * Handles username/password login with session management and MFA support
 * @author Xtranumerik Inc.
 */

import axios, { AxiosResponse } from 'axios';
import * as crypto from 'crypto';
import { DirectUserSession, DirectAuthResponse, UserPermissionSet } from '../types.js';

export class DirectUserAuth {
  private apiUrl: string;
  private username: string;
  private password: string;
  private session: DirectUserSession | null = null;
  private sessionTimeout: NodeJS.Timeout | null = null;

  constructor(apiUrl: string, username: string, password: string) {
    this.apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
    this.username = username;
    this.password = password;
  }

  /**
   * Perform direct user authentication
   */
  async authenticate(): Promise<DirectAuthResponse> {
    try {
      // First, try to get the login form to extract any CSRF tokens
      const loginFormResponse = await this.getLoginForm();
      const csrfToken = this.extractCsrfToken(loginFormResponse);

      // Attempt login
      const loginResponse = await this.performLogin(csrfToken);
      
      if (loginResponse.success) {
        await this.extractUserPermissions();
        this.setupSessionRefresh();
      }

      return loginResponse;
    } catch (error) {
      return {
        success: false,
        error: `Authentication failed: ${this.getErrorMessage(error)}`
      };
    }
  }

  /**
   * Get the login form to extract CSRF tokens and cookies
   */
  private async getLoginForm(): Promise<AxiosResponse> {
    try {
      const response = await axios.get(`${this.apiUrl}/login`, {
        timeout: 30000,
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 400
      });
      return response;
    } catch (error) {
      // Try alternative login endpoints
      const altEndpoints = ['/web/login', '/user/login', '/auth/login'];
      
      for (const endpoint of altEndpoints) {
        try {
          return await axios.get(`${this.apiUrl}${endpoint}`, {
            timeout: 30000,
            maxRedirects: 5,
            validateStatus: (status) => status >= 200 && status < 400
          });
        } catch (altError) {
          continue;
        }
      }
      throw error;
    }
  }

  /**
   * Extract CSRF token from HTML response
   */
  private extractCsrfToken(response: AxiosResponse): string | undefined {
    const html = response.data;
    if (typeof html !== 'string') return undefined;

    // Common CSRF token patterns
    const patterns = [
      /<meta name="csrf-token" content="([^"]+)"/i,
      /<input[^>]*name="csrf_token"[^>]*value="([^"]+)"/i,
      /<input[^>]*name="_token"[^>]*value="([^"]+)"/i,
      /<input[^>]*name="authenticity_token"[^>]*value="([^"]+)"/i,
      /window\.csrfToken\s*=\s*['"]([^'"]+)['"]/i
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return match[1];
    }

    return undefined;
  }

  /**
   * Perform the actual login request
   */
  private async performLogin(csrfToken?: string): Promise<DirectAuthResponse> {
    const loginData = {
      username: this.username,
      password: this.password,
      ...(csrfToken && { csrf_token: csrfToken, _token: csrfToken })
    };

    try {
      // Try different login endpoints
      const endpoints = [
        { url: '/login', method: 'POST' },
        { url: '/api/login', method: 'POST' },
        { url: '/api/session', method: 'POST' },
        { url: '/web/login', method: 'POST' },
        { url: '/user/login', method: 'POST' }
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await axios({
            method: endpoint.method,
            url: `${this.apiUrl}${endpoint.url}`,
            data: loginData,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken })
            },
            timeout: 30000,
            maxRedirects: 0, // Don't follow redirects automatically
            validateStatus: (status) => status >= 200 && status < 400
          });

          // Check for successful authentication
          const result = this.parseLoginResponse(response);
          if (result.success) {
            return result;
          }
        } catch (endpointError) {
          // If this is an MFA challenge, handle it
          if (axios.isAxiosError(endpointError) && endpointError.response?.status === 202) {
            return this.handleMFAChallenge(endpointError.response);
          }
          continue;
        }
      }

      return { success: false, error: 'No valid login endpoint found' };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 202) {
        return this.handleMFAChallenge(error.response);
      }
      throw error;
    }
  }

  /**
   * Parse login response and extract session information
   */
  private parseLoginResponse(response: AxiosResponse): DirectAuthResponse {
    const data = response.data;
    const headers = response.headers;
    const cookies = headers['set-cookie'];

    // Check for JSON response with session data
    if (data && typeof data === 'object') {
      if (data.success || data.authenticated || data.sessionId || data.user) {
        return this.createSessionFromResponse(data, cookies);
      }
    }

    // Check for successful redirect (common in web interfaces)
    if (response.status === 302 || response.status === 301) {
      const location = headers.location;
      if (location && !location.includes('/login')) {
        return this.createSessionFromRedirect(response, cookies);
      }
    }

    // Check for session cookies
    if (cookies) {
      const sessionCookie = this.extractSessionCookie(cookies);
      if (sessionCookie) {
        return this.createSessionFromCookie(sessionCookie, cookies);
      }
    }

    return { success: false, error: 'Authentication response not recognized' };
  }

  /**
   * Create session from JSON response
   */
  private createSessionFromResponse(data: any, cookies?: string[]): DirectAuthResponse {
    const sessionId = data.sessionId || data.session_id || this.extractSessionCookie(cookies || []) || this.generateSessionId();
    const userId = data.userId || data.user_id || data.user?.id || 0;
    const username = data.username || data.user?.username || this.username;
    const csrfToken = data.csrfToken || data.csrf_token || data.token;

    this.session = {
      sessionId,
      userId,
      username,
      expires_at: Date.now() + (8 * 60 * 60 * 1000), // 8 hours default
      csrf_token: csrfToken
    };

    return {
      success: true,
      sessionId,
      userId,
      username,
      csrfToken
    };
  }

  /**
   * Create session from redirect response
   */
  private createSessionFromRedirect(_response: AxiosResponse, cookies?: string[]): DirectAuthResponse {
    const sessionId = this.extractSessionCookie(cookies || []) || this.generateSessionId();
    
    this.session = {
      sessionId,
      userId: 0, // Will be populated later
      username: this.username,
      expires_at: Date.now() + (8 * 60 * 60 * 1000)
    };

    return {
      success: true,
      sessionId,
      username: this.username
    };
  }

  /**
   * Create session from cookie
   */
  private createSessionFromCookie(sessionCookie: string, _cookies: string[]): DirectAuthResponse {
    this.session = {
      sessionId: sessionCookie,
      userId: 0, // Will be populated later
      username: this.username,
      expires_at: Date.now() + (8 * 60 * 60 * 1000)
    };

    return {
      success: true,
      sessionId: sessionCookie,
      username: this.username
    };
  }

  /**
   * Extract session cookie from response
   */
  private extractSessionCookie(cookies: string[]): string | null {
    const sessionPatterns = [
      /PHPSESSID=([^;]+)/i,
      /JSESSIONID=([^;]+)/i,
      /session_id=([^;]+)/i,
      /xibo_session=([^;]+)/i,
      /laravel_session=([^;]+)/i
    ];

    for (const cookie of cookies) {
      for (const pattern of sessionPatterns) {
        const match = cookie.match(pattern);
        if (match) return match[1];
      }
    }

    return null;
  }

  /**
   * Handle MFA challenge
   */
  private async handleMFAChallenge(response: AxiosResponse): Promise<DirectAuthResponse> {
    const data = response.data;
    
    return {
      success: false,
      requiresMFA: true,
      mfaToken: data.mfaToken || data.token,
      error: 'MFA authentication required - not yet implemented in this version'
    };
  }

  /**
   * Extract user permissions from current session
   */
  private async extractUserPermissions(): Promise<void> {
    if (!this.session) return;

    try {
      // Try to get user information
      const userEndpoints = [
        '/api/user',
        '/api/user/me',
        '/api/users/me',
        '/user/me',
        '/me'
      ];

      for (const endpoint of userEndpoints) {
        try {
          const response = await this.authenticatedRequest('GET', endpoint);
          if (response.data) {
            this.session.permissions = this.parseUserPermissions(response.data);
            this.session.userId = response.data.userId || response.data.id || this.session.userId;
            break;
          }
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      console.warn('Could not extract user permissions:', this.getErrorMessage(error));
    }
  }

  /**
   * Parse user permissions from API response
   */
  private parseUserPermissions(userData: any): UserPermissionSet {
    const permissions: UserPermissionSet = {
      isAdmin: false,
      canManageUsers: false,
      canManageDisplays: false,
      canManageLayouts: false,
      canManageMedia: false,
      canManageCampaigns: false,
      canManageSchedules: false,
      canManageDatasets: false,
      canManageNotifications: false,
      canViewReports: false,
      canManageSystem: false,
      level: 'viewer',
      groupIds: [],
      folderAccess: []
    };

    // Parse based on common Xibo permission structures
    if (userData.userTypeId === 1 || userData.isAdmin || userData.isSuperAdmin) {
      // Super Admin
      Object.keys(permissions).forEach(key => {
        if (typeof permissions[key as keyof UserPermissionSet] === 'boolean') {
          (permissions as any)[key] = true;
        }
      });
      permissions.level = 'super_admin';
    } else if (userData.userTypeId === 2 || userData.isGroupAdmin) {
      // Group Admin
      permissions.isAdmin = true;
      permissions.canManageUsers = true;
      permissions.canManageDisplays = true;
      permissions.canManageLayouts = true;
      permissions.canManageMedia = true;
      permissions.canManageCampaigns = true;
      permissions.canManageSchedules = true;
      permissions.canViewReports = true;
      permissions.level = 'admin';
    } else if (userData.userTypeId === 3 || userData.canEdit) {
      // Editor
      permissions.canManageDisplays = true;
      permissions.canManageLayouts = true;
      permissions.canManageMedia = true;
      permissions.canManageCampaigns = true;
      permissions.canManageSchedules = true;
      permissions.level = 'editor';
    }

    // Extract group memberships
    if (userData.groups && Array.isArray(userData.groups)) {
      permissions.groupIds = userData.groups.map((g: any) => g.groupId || g.id);
    }

    // Extract folder access
    if (userData.folders && Array.isArray(userData.folders)) {
      permissions.folderAccess = userData.folders.map((f: any) => f.folderId || f.id);
    }

    return permissions;
  }

  /**
   * Make an authenticated request using the current session
   */
  async authenticatedRequest(method: string, endpoint: string, data?: any): Promise<AxiosResponse> {
    if (!this.session) {
      throw new Error('No active session');
    }

    const headers: any = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    // Add session authentication
    if (this.session.csrf_token) {
      headers['X-CSRF-TOKEN'] = this.session.csrf_token;
    }

    // Add session cookie
    headers['Cookie'] = `PHPSESSID=${this.session.sessionId}`;

    return await axios({
      method,
      url: `${this.apiUrl}${endpoint}`,
      data,
      headers,
      timeout: 30000
    });
  }

  /**
   * Setup automatic session refresh
   */
  private setupSessionRefresh(): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }

    // Refresh session every 6 hours (2 hours before expiry)
    this.sessionTimeout = setTimeout(async () => {
      try {
        await this.refreshSession();
        this.setupSessionRefresh(); // Setup next refresh
      } catch (error) {
        console.error('Session refresh failed:', this.getErrorMessage(error));
        this.session = null; // Clear invalid session
      }
    }, 6 * 60 * 60 * 1000);
  }

  /**
   * Refresh the current session
   */
  private async refreshSession(): Promise<void> {
    if (!this.session) return;

    try {
      // Try to ping a lightweight endpoint to keep session alive
      await this.authenticatedRequest('GET', '/api/user');
      this.session.expires_at = Date.now() + (8 * 60 * 60 * 1000);
    } catch (error) {
      // If ping fails, try to re-authenticate
      const authResult = await this.authenticate();
      if (!authResult.success) {
        throw new Error('Session refresh failed');
      }
    }
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Get current session
   */
  getSession(): DirectUserSession | null {
    return this.session;
  }

  /**
   * Check if session is valid
   */
  isSessionValid(): boolean {
    return this.session !== null && this.session.expires_at > Date.now();
  }

  /**
   * Logout and clear session
   */
  async logout(): Promise<void> {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }

    if (this.session) {
      try {
        // Try to properly logout
        await this.authenticatedRequest('POST', '/logout');
      } catch (error) {
        // Ignore logout errors
      }
      this.session = null;
    }
  }

  /**
   * Get user permissions
   */
  getUserPermissions(): UserPermissionSet | null {
    return this.session?.permissions || null;
  }

  /**
   * Extract error message from various error types
   */
  private getErrorMessage(error: any): string {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.response?.data?.error) {
      return error.response.data.error;
    }
    if (error?.message) {
      return error.message;
    }
    return 'Unknown error';
  }
}