/**
 * Folder and permission management tools for Xibo MCP Server
 * @author Xtranumerik Inc.
 */

import { XiboClient } from '../xibo-client.js';
import { Folder } from '../types.js';

export const folderTools = [
  {
    name: 'folder_list',
    description: 'List folders with hierarchy and permissions',
    parameters: {
      type: 'object',
      properties: {
        parentId: { type: 'number', description: 'Parent folder ID (0 for root)' },
        name: { type: 'string', description: 'Filter by folder name' },
        includeEmpty: { type: 'boolean', description: 'Include empty folders', default: true },
        maxDepth: { type: 'number', description: 'Maximum depth to traverse', default: 5 }
      }
    },
    handler: async (params: any, client: XiboClient) => {
      const queryParams: any = {};
      
      if (params.parentId !== undefined) queryParams.parentId = params.parentId;
      if (params.name) queryParams.name = params.name;
      
      const response = await client.get('/folder', queryParams);
      
      // Process folder data to build hierarchy
      const folders = response.data.data || [];
      const processedFolders = folders.map((folder: Folder) => ({
        folderId: folder.folderId,
        folderName: folder.folderName,
        parentId: folder.parentId,
        isRoot: folder.isRoot,
        text: folder.folderName, // For tree display
        id: folder.folderId, // For tree display
        children: [],
        permissionClass: folder.permissionsFolderId ? 'restricted' : 'open',
        hasPermissions: Boolean(folder.permissionsFolderId),
        path: buildFolderPath(folder, folders)
      }));
      
      // Build hierarchy if not filtering by specific parent
      let result;
      if (params.parentId === undefined) {
        result = buildFolderHierarchy(processedFolders, params.maxDepth || 5);
      } else {
        result = processedFolders;
      }
      
      return {
        success: true,
        data: result,
        total: folders.length
      };
    }
  }
];

/**
 * Build folder hierarchy from flat list
 */
function buildFolderHierarchy(folders: any[], maxDepth: number, currentDepth = 0): any[] {
  if (currentDepth >= maxDepth) return [];
  
  const folderMap = new Map();
  const rootFolders: any[] = [];
  
  // Create folder map
  folders.forEach(folder => {
    folderMap.set(folder.id, { ...folder, children: [] });
  });
  
  // Build hierarchy
  folders.forEach(folder => {
    if (folder.parentId === 0 || !folderMap.has(folder.parentId)) {
      rootFolders.push(folderMap.get(folder.id));
    } else {
      const parent = folderMap.get(folder.parentId);
      if (parent) {
        parent.children.push(folderMap.get(folder.id));
      }
    }
  });
  
  return rootFolders;
}

/**
 * Build folder path string
 */
function buildFolderPath(folder: Folder, allFolders: Folder[]): string {
  if (folder.isRoot) return '/';
  
  const path: string[] = [];
  let current = folder;
  
  while (current && !current.isRoot && path.length < 10) {
    path.unshift(current.folderName);
    current = allFolders.find(f => f.folderId === current.parentId) as Folder;
  }
  
  return '/' + path.join('/');
}