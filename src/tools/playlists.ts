/**
 * Playlist management tools for Xibo MCP Server
 * @author Xtranumerik Inc.
 */

import { ToolDefinition, Playlist } from '../types.js';
import XiboClient from '../xibo-client.js';

const playlistList: ToolDefinition = {
  name: 'playlist_list',
  description: 'List all playlists',
  parameters: [
    { name: 'name', type: 'string', description: 'Filter by playlist name', required: false },
    { name: 'tags', type: 'string', description: 'Filter by tags', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {};
    if (params.name) queryParams.name = params.name;
    if (params.tags) queryParams.tags = params.tags;

    try {
      const response = await client.get<Playlist[]>('/playlist', queryParams);
      const playlists = response.data;

      if (!playlists || playlists.length === 0) {
        return 'Aucune playlist trouvée.';
      }

      let result = `🎵 **Playlists trouvées: ${playlists.length}**\n\n`;
      
      playlists.forEach((playlist, index) => {
        const type = playlist.isDynamic ? '🔄 Dynamique' : '📋 Statique';
        result += `**${index + 1}. ${playlist.name}** (ID: ${playlist.playlistId})\n`;
        result += `   Type: ${type}\n`;
        if (playlist.widgets) result += `   Widgets: ${playlist.widgets.length}\n`;
        if (playlist.tags && playlist.tags.length > 0) result += `   Tags: ${playlist.tags.join(', ')}\n`;
        result += `\n`;
      });

      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des playlists: ${error.message}`;
    }
  }
};

const playlistCreate: ToolDefinition = {
  name: 'playlist_create',
  description: 'Create a new playlist',
  parameters: [
    { name: 'name', type: 'string', description: 'Playlist name', required: true },
    { name: 'tags', type: 'string', description: 'Tags (comma-separated)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const data: any = { name: params.name };
      if (params.tags) data.tags = params.tags;
      
      const response = await client.post('/playlist', data);
      const playlist = response.data;
      
      return `✅ Playlist "${params.name}" créée avec succès (ID: ${playlist.playlistId})`;
    } catch (error: any) {
      return `Erreur lors de la création de la playlist: ${error.message}`;
    }
  }
};

const playlistAddMedia: ToolDefinition = {
  name: 'playlist_add_media',
  description: 'Add media to a playlist',
  parameters: [
    { name: 'playlistId', type: 'number', description: 'Playlist ID', required: true },
    { name: 'mediaId', type: 'number', description: 'Media ID to add', required: true },
    { name: 'duration', type: 'number', description: 'Duration in seconds', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const data: any = {
        type: 'image', // This would need to be determined from media
        duration: params.duration || 10,
        mediaIds: [params.mediaId]
      };
      
      await client.post(`/playlist/widget/${params.playlistId}`, data);
      
      return `✅ Média ${params.mediaId} ajouté à la playlist ${params.playlistId}`;
    } catch (error: any) {
      return `Erreur lors de l'ajout: ${error.message}`;
    }
  }
};

export const playlistTools: ToolDefinition[] = [
  playlistList,
  playlistCreate,
  playlistAddMedia
];