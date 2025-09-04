/**
 * Xibo API Client with OAuth Authentication
 * @author Xtranumerik Inc.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';
import { XiboAuthConfig, XiboTokenResponse, ApiResponse, ApiError } from './types.js';

export class XiboClient {
  private axiosInstance: AxiosInstance;
  private config: XiboAuthConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private refreshToken: string | null = null;

  constructor(config: XiboAuthConfig) {
    this.config = {
      ...config,
      grantType: config.grantType || 'client_credentials'
    };

    // Remove trailing slash from API URL
    this.config.apiUrl = this.config.apiUrl.replace(/\/$/, '');

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
        if (this.accessToken) {
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
          // Token expired, try to refresh
          await this.authenticate(true);
          
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
   * Authenticate with Xibo CMS
   */
  private async authenticate(force: boolean = false): Promise<void> {
    if (!force && this.isTokenValid()) {
      return;
    }

    try {
      const authData = new URLSearchParams();
      authData.append('grant_type', this.config.grantType!);
      authData.append('client_id', this.config.clientId);
      authData.append('client_secret', this.config.clientSecret);

      if (this.refreshToken && this.config.grantType === 'access_code') {
        authData.append('refresh_token', this.refreshToken);
        authData.append('grant_type', 'refresh_token');
      }

      const response = await axios.post<XiboTokenResponse>(
        `${this.config.apiUrl}/api/authorize/access_token`,
        authData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token || null;
      
      // Calculate token expiry (slightly before actual expiry for safety)
      const expirySeconds = response.data.expires_in - 60;
      this.tokenExpiry = new Date(Date.now() + expirySeconds * 1000);

      console.log('✅ Successfully authenticated with Xibo CMS');
    } catch (error: any) {
      console.error('❌ Authentication failed:', error.response?.data || error.message);
      throw new Error(`Failed to authenticate with Xibo: ${error.message}`);
    }
  }

  /**
   * Check if current token is valid
   */
  private isTokenValid(): boolean {
    if (!this.accessToken || !this.tokenExpiry) {
      return false;
    }
    return new Date() < this.tokenExpiry;
  }

  /**
   * Ensure authenticated before making requests
   */
  private async ensureAuthenticated(): Promise<void> {
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

  // ========== PUBLIC API METHODS ==========

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

  /**
   * Upload file to Xibo
   */
  async uploadFile(filePath: string, name?: string): Promise<ApiResponse<any>> {
    const form = new FormData();
    const fileStream = fs.createReadStream(filePath);
    const fileName = name || path.basename(filePath);

    form.append('files[]', fileStream, fileName);
    form.append('name', fileName);

    const response = await this.axiosInstance.post('/library', form, {
      headers: {
        ...form.getHeaders()
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
   * Register application in Xibo (requires admin privileges)
   */
  async registerApplication(appConfig: {
    name: string;
    description?: string;
    logo?: string;
    redirectUri?: string;
    clientCredentials?: boolean;
    authCode?: boolean;
  }): Promise<any> {
    try {
      // This would typically be done through the Xibo admin interface
      // as it requires admin privileges
      const applicationData = {
        name: appConfig.name,
        description: appConfig.description || 'MCP Server for Xibo by Xtranumerik',
        redirectUri: appConfig.redirectUri || 'http://localhost:3000/callback',
        clientCredentials: appConfig.clientCredentials !== false ? 1 : 0,
        authCode: appConfig.authCode ? 1 : 0
      };

      const response = await this.post('/application', applicationData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to register application:', error.message);
      throw error;
    }
  }

  /**
   * Test connection to Xibo
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.ensureAuthenticated();
      const response = await this.get('/clock');
      console.log('✅ Connection to Xibo successful');
      console.log(`   Server time: ${response.data}`);
      return true;
    } catch (error: any) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Get server information
   */
  async getServerInfo(): Promise<any> {
    try {
      const response = await this.get('/about');
      return response.data;
    } catch (error) {
      // If /about endpoint doesn't exist, try /user/me as alternative
      const response = await this.get('/user/me');
      return { user: response.data };
    }
  }
}

export default XiboClient;
