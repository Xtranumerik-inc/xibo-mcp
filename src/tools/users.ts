/**
 * User management tools for Xibo MCP Server
 * Complete user and group management with permissions
 * @author Xtranumerik Inc.
 */

import { ToolDefinition, User, UserGroup } from '../types.js';
import XiboClient from '../xibo-client.js';

// ========== USER MANAGEMENT TOOLS ==========

const userList: ToolDefinition = {
  name: 'user_list',
  description: 'List all users with filtering options',
  parameters: [
    { name: 'userName', type: 'string', description: 'Filter by username', required: false },
    { name: 'userTypeId', type: 'number', description: 'Filter by user type ID', required: false },
    { name: 'retired', type: 'number', description: 'Filter retired users (0=active, 1=retired)', required: false },
    { name: 'start', type: 'number', description: 'Starting position for pagination', required: false },
    { name: 'length', type: 'number', description: 'Number of results to return', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {
      start: params.start || 0,
      length: params.length || 50
    };
    
    if (params.userName) queryParams.userName = params.userName;
    if (params.userTypeId) queryParams.userTypeId = params.userTypeId;
    if (params.retired !== undefined) queryParams.retired = params.retired;

    try {
      const response = await client.get<{data: User[], recordsTotal: number}>('/user', queryParams);
      const users = response.data.data;
      const total = response.data.recordsTotal;

      if (!users || users.length === 0) {
        return 'Aucun utilisateur trouvé.';
      }

      let result = `👥 **Utilisateurs trouvés: ${users.length}/${total}**\n\n`;
      
      users.forEach((user, index) => {
        const status = user.retired === 0 ? '✅ Actif' : '❌ Retiré';
        result += `**${index + 1}. ${user.userName}** (ID: ${user.userId})\n`;
        result += `   Email: ${user.email}\n`;
        result += `   Status: ${status}\n`;
        result += `   Type: ${user.userType}\n`;
        if (user.lastAccessed) {
          result += `   Dernière connexion: ${new Date(user.lastAccessed).toLocaleString('fr-FR')}\n`;
        }
        result += `\n`;
      });

      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des utilisateurs: ${error.message}`;
    }
  }
};

const userGet: ToolDefinition = {
  name: 'user_get',
  description: 'Get detailed information about a specific user',
  parameters: [
    { name: 'userId', type: 'number', description: 'User ID to retrieve', required: true }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const response = await client.get<User>(`/user/${params.userId}`);
      const user = response.data;
      
      let result = `👤 **Détails de l'utilisateur**\n\n`;
      result += `**Nom d'utilisateur:** ${user.userName}\n`;
      result += `**Email:** ${user.email}\n`;
      result += `**Nom complet:** ${user.firstName} ${user.lastName}\n`;
      result += `**Status:** ${user.retired === 0 ? '✅ Actif' : '❌ Retiré'}\n`;
      result += `**Type:** ${user.userType}\n`;
      result += `**Téléphone:** ${user.phone || 'Non défini'}\n`;
      
      if (user.lastAccessed) {
        result += `**Dernière connexion:** ${new Date(user.lastAccessed).toLocaleString('fr-FR')}\n`;
      }
      
      result += `**Créé le:** ${new Date(user.createdDt).toLocaleString('fr-FR')}\n`;
      result += `**Modifié le:** ${new Date(user.modifiedDt).toLocaleString('fr-FR')}\n`;
      
      if (user.homePage) {
        result += `**Page d'accueil:** ${user.homePage}\n`;
      }
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération de l'utilisateur: ${error.message}`;
    }
  }
};

const userCreate: ToolDefinition = {
  name: 'user_create',
  description: 'Create a new user account',
  parameters: [
    { name: 'userName', type: 'string', description: 'Username (unique)', required: true },
    { name: 'email', type: 'string', description: 'Email address', required: true },
    { name: 'password', type: 'string', description: 'Password', required: true },
    { name: 'firstName', type: 'string', description: 'First name', required: false },
    { name: 'lastName', type: 'string', description: 'Last name', required: false },
    { name: 'userTypeId', type: 'number', description: 'User type ID (1=Super Admin, 2=Group Admin, 3=User)', required: false },
    { name: 'phone', type: 'string', description: 'Phone number', required: false },
    { name: 'libraryQuota', type: 'number', description: 'Library quota in KB', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const userData: any = {
        userName: params.userName,
        email: params.email,
        password: params.password,
        userTypeId: params.userTypeId || 3, // Default to User
        firstName: params.firstName || '',
        lastName: params.lastName || '',
        phone: params.phone || '',
        libraryQuota: params.libraryQuota || 0
      };
      
      const response = await client.post('/user', userData);
      const newUser = response.data;
      
      return `✅ Utilisateur "${params.userName}" créé avec succès (ID: ${newUser.userId})`;
    } catch (error: any) {
      return `Erreur lors de la création de l'utilisateur: ${error.message}`;
    }
  }
};

const userUpdate: ToolDefinition = {
  name: 'user_update',
  description: 'Update user information',
  parameters: [
    { name: 'userId', type: 'number', description: 'User ID to update', required: true },
    { name: 'userName', type: 'string', description: 'New username', required: false },
    { name: 'email', type: 'string', description: 'New email', required: false },
    { name: 'firstName', type: 'string', description: 'First name', required: false },
    { name: 'lastName', type: 'string', description: 'Last name', required: false },
    { name: 'userTypeId', type: 'number', description: 'User type ID', required: false },
    { name: 'phone', type: 'string', description: 'Phone number', required: false },
    { name: 'retired', type: 'number', description: 'Retirement status (0=active, 1=retired)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      // Get current user data first
      const currentResponse = await client.get<User>(`/user/${params.userId}`);
      const currentUser = currentResponse.data;
      
      const updateData: any = {
        userName: params.userName || currentUser.userName,
        email: params.email || currentUser.email,
        firstName: params.firstName || currentUser.firstName,
        lastName: params.lastName || currentUser.lastName,
        userTypeId: params.userTypeId || currentUser.userTypeId,
        phone: params.phone || currentUser.phone,
        retired: params.retired !== undefined ? params.retired : currentUser.retired
      };
      
      await client.put(`/user/${params.userId}`, updateData);
      
      return `✅ Utilisateur ID ${params.userId} mis à jour avec succès`;
    } catch (error: any) {
      return `Erreur lors de la mise à jour de l'utilisateur: ${error.message}`;
    }
  }
};

const userDelete: ToolDefinition = {
  name: 'user_delete',
  description: 'Delete a user account (or retire it)',
  parameters: [
    { name: 'userId', type: 'number', description: 'User ID to delete', required: true },
    { name: 'deleteAllItems', type: 'number', description: 'Delete all user items (0=reassign, 1=delete)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const queryParams: any = {};
      if (params.deleteAllItems !== undefined) {
        queryParams.deleteAllItems = params.deleteAllItems;
      }
      
      await client.delete(`/user/${params.userId}`, { params: queryParams });
      
      return `✅ Utilisateur ID ${params.userId} supprimé avec succès`;
    } catch (error: any) {
      return `Erreur lors de la suppression de l'utilisateur: ${error.message}`;
    }
  }
};

const userSetPassword: ToolDefinition = {
  name: 'user_set_password',
  description: 'Change user password',
  parameters: [
    { name: 'userId', type: 'number', description: 'User ID', required: true },
    { name: 'password', type: 'string', description: 'New password', required: true },
    { name: 'oldPassword', type: 'string', description: 'Current password (required for own password)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const passwordData: any = {
        password: params.password
      };
      
      if (params.oldPassword) {
        passwordData.oldPassword = params.oldPassword;
      }
      
      await client.put(`/user/${params.userId}/password`, passwordData);
      
      return `✅ Mot de passe changé avec succès pour l'utilisateur ID ${params.userId}`;
    } catch (error: any) {
      return `Erreur lors du changement de mot de passe: ${error.message}`;
    }
  }
};

const userForceLogout: ToolDefinition = {
  name: 'user_force_logout',
  description: 'Force logout a user from all sessions',
  parameters: [
    { name: 'userId', type: 'number', description: 'User ID to logout', required: true }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      await client.post(`/user/${params.userId}/logout`, {});
      
      return `✅ Utilisateur ID ${params.userId} déconnecté de force de toutes les sessions`;
    } catch (error: any) {
      return `Erreur lors de la déconnexion forcée: ${error.message}`;
    }
  }
};

// ========== USER GROUP MANAGEMENT TOOLS ==========

const usergroupList: ToolDefinition = {
  name: 'usergroup_list',
  description: 'List all user groups',
  parameters: [
    { name: 'group', type: 'string', description: 'Filter by group name', required: false },
    { name: 'start', type: 'number', description: 'Starting position', required: false },
    { name: 'length', type: 'number', description: 'Number of results', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {
      start: params.start || 0,
      length: params.length || 50
    };
    
    if (params.group) queryParams.group = params.group;

    try {
      const response = await client.get<{data: UserGroup[], recordsTotal: number}>('/group', queryParams);
      const groups = response.data.data;
      const total = response.data.recordsTotal;

      if (!groups || groups.length === 0) {
        return 'Aucun groupe d\'utilisateurs trouvé.';
      }

      let result = `👥 **Groupes d'utilisateurs: ${groups.length}/${total}**\n\n`;
      
      groups.forEach((group, index) => {
        result += `**${index + 1}. ${group.group}** (ID: ${group.groupId})\n`;
        result += `   Description: ${group.description || 'Aucune description'}\n`;
        if (group.libraryQuota) {
          result += `   Quota bibliothèque: ${group.libraryQuota} KB\n`;
        }
        result += `\n`;
      });

      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des groupes: ${error.message}`;
    }
  }
};

const usergroupCreate: ToolDefinition = {
  name: 'usergroup_create',
  description: 'Create a new user group',
  parameters: [
    { name: 'group', type: 'string', description: 'Group name', required: true },
    { name: 'description', type: 'string', description: 'Group description', required: false },
    { name: 'libraryQuota', type: 'number', description: 'Library quota in KB', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const groupData: any = {
        group: params.group,
        description: params.description || '',
        libraryQuota: params.libraryQuota || 0
      };
      
      const response = await client.post('/group', groupData);
      const newGroup = response.data;
      
      return `✅ Groupe "${params.group}" créé avec succès (ID: ${newGroup.groupId})`;
    } catch (error: any) {
      return `Erreur lors de la création du groupe: ${error.message}`;
    }
  }
};

const usergroupAssignUsers: ToolDefinition = {
  name: 'usergroup_assign_users',
  description: 'Assign users to a group or manage group membership',
  parameters: [
    { name: 'groupId', type: 'number', description: 'Group ID', required: true },
    { name: 'userIds', type: 'string', description: 'Comma-separated list of user IDs to assign', required: true }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const userIds = params.userIds.split(',').map((id: string) => parseInt(id.trim()));
      
      const assignData = {
        userId: userIds
      };
      
      await client.post(`/group/${params.groupId}/members/assign`, assignData);
      
      return `✅ Utilisateurs [${params.userIds}] assignés au groupe ID ${params.groupId}`;
    } catch (error: any) {
      return `Erreur lors de l'assignation des utilisateurs: ${error.message}`;
    }
  }
};

const usergroupSetPermissions: ToolDefinition = {
  name: 'usergroup_set_permissions',
  description: 'Set permissions for a user group on specific objects',
  parameters: [
    { name: 'groupId', type: 'number', description: 'Group ID', required: true },
    { name: 'objectId', type: 'number', description: 'Object ID to set permissions for', required: true },
    { name: 'objectType', type: 'string', description: 'Object type (layout, media, campaign, etc.)', required: true },
    { name: 'view', type: 'number', description: 'View permission (0=deny, 1=allow)', required: false },
    { name: 'edit', type: 'number', description: 'Edit permission (0=deny, 1=allow)', required: false },
    { name: 'delete', type: 'number', description: 'Delete permission (0=deny, 1=allow)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const permissionData: any = {
        groupId: params.groupId,
        view: params.view || 0,
        edit: params.edit || 0,
        delete: params.delete || 0
      };
      
      // Endpoint varies based on object type
      const endpoint = `/permissions/${params.objectType}/${params.objectId}`;
      
      await client.post(endpoint, permissionData);
      
      const permissions = [];
      if (params.view) permissions.push('lecture');
      if (params.edit) permissions.push('modification');
      if (params.delete) permissions.push('suppression');
      
      return `✅ Permissions [${permissions.join(', ')}] définies pour le groupe ${params.groupId} sur ${params.objectType} ${params.objectId}`;
    } catch (error: any) {
      return `Erreur lors de la définition des permissions: ${error.message}`;
    }
  }
};

export const userTools: ToolDefinition[] = [
  userList,
  userGet,
  userCreate,
  userUpdate,
  userDelete,
  userSetPassword,
  userForceLogout,
  usergroupList,
  usergroupCreate,
  usergroupAssignUsers,
  usergroupSetPermissions
];