/**
 * Folder management and permissions tools for Xibo MCP Server
 * Content organization and access control
 * @author Xtranumerik Inc.
 */

import { ToolDefinition, Folder } from '../types.js';
import XiboClient from '../xibo-client.js';

// ========== FOLDER MANAGEMENT TOOLS ==========

const folderList: ToolDefinition = {
  name: 'folder_list',
  description: 'List all folders with hierarchy information',
  parameters: [
    { name: 'folderId', type: 'number', description: 'Parent folder ID to list contents', required: false },
    { name: 'start', type: 'number', description: 'Starting position for pagination', required: false },
    { name: 'length', type: 'number', description: 'Number of results to return', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {
      start: params.start || 0,
      length: params.length || 100
    };
    
    if (params.folderId) queryParams.folderId = params.folderId;

    try {
      const response = await client.get<{data: Folder[], recordsTotal: number}>('/folder', queryParams);
      const folders = response.data.data;
      const total = response.data.recordsTotal;

      if (!folders || folders.length === 0) {
        return 'Aucun dossier trouvé.';
      }

      let result = `📁 **Dossiers trouvés: ${folders.length}/${total}**\n\n`;
      
      // Build folder hierarchy
      const buildHierarchy = (folders: Folder[], parentId: number = 1, depth: number = 0): string => {
        let hierarchyResult = '';
        const indent = '  '.repeat(depth);
        
        folders
          .filter(f => f.parentId === parentId)
          .forEach(folder => {
            const icon = folder.children && folder.children.length > 0 ? '📂' : '📁';
            hierarchyResult += `${indent}${icon} **${folder.text}** (ID: ${folder.id})\n`;
            
            if (folder.permissionsClass) {
              hierarchyResult += `${indent}   Permissions: ${folder.permissionsClass}\n`;
            }
            
            // Recursively add children
            if (folder.children && folder.children.length > 0) {
              hierarchyResult += buildHierarchy(folder.children, folder.id, depth + 1);
            }
            
            hierarchyResult += '\n';
          });
        
        return hierarchyResult;
      };
      
      result += buildHierarchy(folders);

      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des dossiers: ${error.message}`;
    }
  }
};

const folderCreate: ToolDefinition = {
  name: 'folder_create',
  description: 'Create a new folder in the content hierarchy',
  parameters: [
    { name: 'text', type: 'string', description: 'Folder name', required: true },
    { name: 'parentId', type: 'number', description: 'Parent folder ID (1 for root)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const folderData: any = {
        text: params.text,
        parentId: params.parentId || 1 // Default to root folder
      };
      
      const response = await client.post('/folder', folderData);
      const newFolder = response.data;
      
      return `✅ Dossier "${params.text}" créé avec succès (ID: ${newFolder.id})`;
    } catch (error: any) {
      return `Erreur lors de la création du dossier: ${error.message}`;
    }
  }
};

const folderShare: ToolDefinition = {
  name: 'folder_share',
  description: 'Share a folder with users or user groups',
  parameters: [
    { name: 'folderId', type: 'number', description: 'Folder ID to share', required: true },
    { name: 'groupIds', type: 'string', description: 'Comma-separated list of group IDs to share with', required: false },
    { name: 'userIds', type: 'string', description: 'Comma-separated list of user IDs to share with', required: false },
    { name: 'view', type: 'number', description: 'View permission (0=deny, 1=allow)', required: false },
    { name: 'edit', type: 'number', description: 'Edit permission (0=deny, 1=allow)', required: false },
    { name: 'delete', type: 'number', description: 'Delete permission (0=deny, 1=allow)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const shareData: any = {
        view: params.view || 1,
        edit: params.edit || 0,
        delete: params.delete || 0
      };
      
      const sharedWith = [];
      
      // Share with groups
      if (params.groupIds) {
        const groupIds = params.groupIds.split(',').map((id: string) => parseInt(id.trim()));
        for (const groupId of groupIds) {
          await client.post(`/folder/${params.folderId}/share/group/${groupId}`, shareData);
          sharedWith.push(`groupe ${groupId}`);
        }
      }
      
      // Share with users
      if (params.userIds) {
        const userIds = params.userIds.split(',').map((id: string) => parseInt(id.trim()));
        for (const userId of userIds) {
          await client.post(`/folder/${params.folderId}/share/user/${userId}`, shareData);
          sharedWith.push(`utilisateur ${userId}`);
        }
      }
      
      const permissions = [];
      if (params.view) permissions.push('lecture');
      if (params.edit) permissions.push('modification');
      if (params.delete) permissions.push('suppression');
      
      return `✅ Dossier ${params.folderId} partagé avec ${sharedWith.join(', ')} - Permissions: [${permissions.join(', ')}]`;
    } catch (error: any) {
      return `Erreur lors du partage du dossier: ${error.message}`;
    }
  }
};

const folderSetPermissions: ToolDefinition = {
  name: 'folder_set_permissions',
  description: 'Set detailed permissions on a folder for users or groups',
  parameters: [
    { name: 'folderId', type: 'number', description: 'Folder ID', required: true },
    { name: 'ownerId', type: 'number', description: 'User or Group ID', required: true },
    { name: 'ownerType', type: 'string', description: 'Owner type: "user" or "group"', required: true },
    { name: 'view', type: 'number', description: 'View permission (0=deny, 1=allow)', required: false },
    { name: 'edit', type: 'number', description: 'Edit permission (0=deny, 1=allow)', required: false },
    { name: 'delete', type: 'number', description: 'Delete permission (0=deny, 1=allow)', required: false },
    { name: 'modifyPermissions', type: 'number', description: 'Modify permissions (0=deny, 1=allow)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const permissionData: any = {
        view: params.view || 0,
        edit: params.edit || 0,
        delete: params.delete || 0,
        modifyPermissions: params.modifyPermissions || 0
      };
      
      const endpoint = params.ownerType === 'group' 
        ? `/folder/${params.folderId}/permissions/group/${params.ownerId}`
        : `/folder/${params.folderId}/permissions/user/${params.ownerId}`;
      
      await client.post(endpoint, permissionData);
      
      const permissions = [];
      if (params.view) permissions.push('lecture');
      if (params.edit) permissions.push('modification');  
      if (params.delete) permissions.push('suppression');
      if (params.modifyPermissions) permissions.push('gestion des permissions');
      
      return `✅ Permissions définies pour ${params.ownerType} ${params.ownerId} sur dossier ${params.folderId}: [${permissions.join(', ')}]`;
    } catch (error: any) {
      return `Erreur lors de la définition des permissions: ${error.message}`;
    }
  }
};

const folderMoveContent: ToolDefinition = {
  name: 'folder_move_content',
  description: 'Move content (layouts, media, etc.) between folders',
  parameters: [
    { name: 'contentType', type: 'string', description: 'Content type: layout, media, campaign, playlist', required: true },
    { name: 'contentId', type: 'number', description: 'Content ID to move', required: true },
    { name: 'targetFolderId', type: 'number', description: 'Target folder ID', required: true }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const moveData = {
        folderId: params.targetFolderId
      };
      
      // Different endpoints for different content types
      let endpoint = '';
      switch (params.contentType.toLowerCase()) {
        case 'layout':
          endpoint = `/layout/${params.contentId}`;
          break;
        case 'media':
          endpoint = `/library/${params.contentId}`;
          break;
        case 'campaign':
          endpoint = `/campaign/${params.contentId}`;
          break;
        case 'playlist':
          endpoint = `/playlist/${params.contentId}`;
          break;
        default:
          throw new Error(`Type de contenu non supporté: ${params.contentType}`);
      }
      
      await client.put(endpoint, moveData);
      
      return `✅ ${params.contentType} ${params.contentId} déplacé vers le dossier ${params.targetFolderId}`;
    } catch (error: any) {
      return `Erreur lors du déplacement: ${error.message}`;
    }
  }
};

const permissionAudit: ToolDefinition = {
  name: 'permission_audit',
  description: 'Audit permissions for a specific content item or folder',
  parameters: [
    { name: 'objectType', type: 'string', description: 'Object type: folder, layout, media, campaign, playlist', required: true },
    { name: 'objectId', type: 'number', description: 'Object ID to audit', required: true }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      // Get permissions for the object
      const endpoint = `/permissions/${params.objectType}/${params.objectId}`;
      const response = await client.get(endpoint);
      const permissions = response.data;
      
      let result = `🔐 **Audit des permissions - ${params.objectType} ${params.objectId}**\n\n`;
      
      if (!permissions || permissions.length === 0) {
        result += 'Aucune permission spécifique définie (utilise les permissions par défaut).\n';
        return result;
      }
      
      result += '**Permissions accordées:**\n\n';
      
      permissions.forEach((perm: any) => {
        const ownerType = perm.groupId ? 'Groupe' : 'Utilisateur';
        const ownerId = perm.groupId || perm.userId;
        const ownerName = perm.group || perm.userName || `ID ${ownerId}`;
        
        result += `**${ownerType}: ${ownerName}**\n`;
        result += `   👁️  Lecture: ${perm.view ? '✅ Oui' : '❌ Non'}\n`;
        result += `   ✏️  Modification: ${perm.edit ? '✅ Oui' : '❌ Non'}\n`;
        result += `   🗑️  Suppression: ${perm.delete ? '✅ Oui' : '❌ Non'}\n`;
        
        if (perm.modifyPermissions !== undefined) {
          result += `   ⚙️  Gestion permissions: ${perm.modifyPermissions ? '✅ Oui' : '❌ Non'}\n`;
        }
        
        result += '\n';
      });
      
      return result;
    } catch (error: any) {
      return `Erreur lors de l'audit des permissions: ${error.message}`;
    }
  }
};

export const folderTools: ToolDefinition[] = [
  folderList,
  folderCreate,
  folderShare,
  folderSetPermissions,
  folderMoveContent,
  permissionAudit
];