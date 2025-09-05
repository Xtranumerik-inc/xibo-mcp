/**
 * User and permission management tools for Xibo MCP Server
 * Enhanced user administration capabilities
 * @author Xtranumerik Inc.
 */

import { XiboClient } from '../xibo-client.js';
import { User, UserGroup } from '../types.js';

export const userTools = [
  {
    name: 'user_list',
    description: 'List all users with filtering and search capabilities',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'number', description: 'Filter by specific user ID' },
        userName: { type: 'string', description: 'Filter by username' },
        userTypeId: { type: 'number', description: 'Filter by user type ID' },
        retired: { type: 'boolean', description: 'Filter by retired status' },
        firstName: { type: 'string', description: 'Filter by first name' },
        lastName: { type: 'string', description: 'Filter by last name' },
        email: { type: 'string', description: 'Filter by email address' },
        groupId: { type: 'number', description: 'Filter by group membership' },
        start: { type: 'number', description: 'Pagination start' },
        length: { type: 'number', description: 'Number of results to return' }
      }
    },
    handler: async (params: any, client: XiboClient) => {
      const queryParams: any = {};
      
      if (params.userId) queryParams.userId = params.userId;
      if (params.userName) queryParams.userName = params.userName;
      if (params.userTypeId) queryParams.userTypeId = params.userTypeId;
      if (params.retired !== undefined) queryParams.retired = params.retired ? 1 : 0;
      if (params.firstName) queryParams.firstName = params.firstName;
      if (params.lastName) queryParams.lastName = params.lastName;
      if (params.email) queryParams.email = params.email;
      if (params.groupId) queryParams.groupId = params.groupId;
      if (params.start) queryParams.start = params.start;
      if (params.length) queryParams.length = params.length;
      
      const response = await client.get('/user', queryParams);
      
      // Process user data to include computed fields
      const processedUsers = response.data.data?.map((user: User) => {
        const processedUser: any = { ...user };
        
        // Convert boolean fields properly
        processedUser.retired = Boolean(user.retired);
        processedUser.isPasswordChangeRequired = Boolean(user.isPasswordChangeRequired);
        
        // Add user type information
        processedUser.userTypeName = getUserTypeName(user.userTypeId);
        
        return processedUser;
      }) || [];
      
      return {
        success: true,
        data: processedUsers,
        total: response.data.recordsTotal || processedUsers.length
      };
    }
  },
  
  {
    name: 'user_get',
    description: 'Get detailed information about a specific user',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'number', description: 'User ID', required: true },
        includeGroups: { type: 'boolean', description: 'Include group memberships', default: true },
        includePermissions: { type: 'boolean', description: 'Include user permissions', default: false }
      },
      required: ['userId']
    },
    handler: async (params: any, client: XiboClient) => {
      const user = await client.get(`/user/${params.userId}`);
      
      const result: any = {
        success: true,
        user: {
          ...user.data,
          retired: Boolean(user.data.retired),
          isPasswordChangeRequired: Boolean(user.data.isPasswordChangeRequired),
          userTypeName: getUserTypeName(user.data.userTypeId),
          lastAccessed: user.data.lastAccessed ? new Date(user.data.lastAccessed) : undefined,
          createdDt: user.data.createdDt ? new Date(user.data.createdDt) : undefined,
          modifiedDt: user.data.modifiedDt ? new Date(user.data.modifiedDt) : undefined,
          homePageName: user.data.homePageId ? getPageName(user.data.homePageId) : undefined
        }
      };
      
      if (params.includeGroups) {
        const groups = await client.get(`/user/${params.userId}/group`);
        result.groups = groups.data;
      }
      
      if (params.includePermissions) {
        const permissions = await client.get(`/user/${params.userId}/permissions`);
        result.permissions = permissions.data;
      }
      
      return result;
    }
  }
];

/**
 * Helper function to get user type name
 */
function getUserTypeName(userTypeId: number): string {
  const userTypes: Record<number, string> = {
    1: 'Super Admin',
    2: 'Group Admin', 
    3: 'User',
    4: 'Content Manager',
    5: 'Display Manager'
  };
  
  return userTypes[userTypeId] || 'Unknown';
}

/**
 * Helper function to get page name
 */
function getPageName(homePageId: number): string {
  const pages: Record<number, string> = {
    1: 'Dashboard',
    2: 'Layouts',
    3: 'Media',
    4: 'Campaigns',
    5: 'Displays'
  };
  
  return pages[homePageId] || 'Custom Page';
}