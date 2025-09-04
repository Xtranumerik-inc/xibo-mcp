/**
 * Media management tools for Xibo MCP Server
 * @author Xtranumerik Inc.
 */

import { ToolDefinition, Media } from '../types.js';
import XiboClient from '../xibo-client.js';

const mediaList: ToolDefinition = {
  name: 'media_list',
  description: 'List all media files with optional filtering',
  parameters: [
    { name: 'name', type: 'string', description: 'Filter by media name', required: false },
    { name: 'tags', type: 'string', description: 'Filter by tags (comma-separated)', required: false },
    { name: 'type', type: 'string', description: 'Filter by media type (image, video, audio)', required: false },
    { name: 'retired', type: 'boolean', description: 'Include retired media', required: false, default: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {};
    if (params.name) queryParams.media = params.name;
    if (params.tags) queryParams.tags = params.tags;
    if (params.type) queryParams.type = params.type;
    if (params.retired) queryParams.retired = 1;

    try {
      const response = await client.get<Media[]>('/library', queryParams);
      const mediaFiles = response.data;

      if (!mediaFiles || mediaFiles.length === 0) {
        return 'Aucun média trouvé.';
      }

      let result = `📁 **Médias trouvés: ${mediaFiles.length}**\n\n`;
      
      mediaFiles.forEach((media, index) => {
        const typeIcon = media.mediaType.includes('image') ? '🖼️' : 
                        media.mediaType.includes('video') ? '🎥' : 
                        media.mediaType.includes('audio') ? '🎵' : '📄';
        const size = media.fileSize ? `${(media.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A';
        
        result += `${typeIcon} **${index + 1}. ${media.name}** (ID: ${media.mediaId})\n`;
        result += `   Type: ${media.mediaType}\n`;
        result += `   Taille: ${size}\n`;
        if (media.duration) result += `   Durée: ${media.duration}s\n`;
        if (media.width && media.height) result += `   Dimensions: ${media.width}x${media.height}px\n`;
        if (media.tags && media.tags.length > 0) result += `   Tags: ${media.tags.join(', ')}\n`;
        result += `\n`;
      });

      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des médias: ${error.message}`;
    }
  }
};

const mediaUpload: ToolDefinition = {
  name: 'media_upload',
  description: 'Upload a media file to Xibo library',
  parameters: [
    { name: 'filePath', type: 'string', description: 'Path to the file to upload', required: true },
    { name: 'name', type: 'string', description: 'Optional name for the media', required: false },
    { name: 'tags', type: 'string', description: 'Tags for the media (comma-separated)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const response = await client.uploadFile(params.filePath, params.name);
      const media = response.data;
      
      // Add tags if provided
      if (params.tags && media.mediaId) {
        await client.put(`/library/${media.mediaId}`, { tags: params.tags });
      }
      
      return `✅ Média "${params.name || params.filePath}" téléchargé avec succès (ID: ${media.mediaId})`;
    } catch (error: any) {
      return `Erreur lors du téléchargement: ${error.message}`;
    }
  }
};

const mediaGet: ToolDefinition = {
  name: 'media_get',
  description: 'Get detailed information about a media file',
  parameters: [
    { name: 'mediaId', type: 'number', description: 'The media ID', required: true }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const response = await client.get<Media>(`/library/${params.mediaId}`);
      const media = response.data;

      const typeIcon = media.mediaType.includes('image') ? '🖼️' : 
                      media.mediaType.includes('video') ? '🎥' : 
                      media.mediaType.includes('audio') ? '🎵' : '📄';
      
      let result = `${typeIcon} **Détails du média: ${media.name}**\n\n`;
      result += `**Informations générales:**\n`;
      result += `   ID: ${media.mediaId}\n`;
      result += `   Nom: ${media.name}\n`;
      result += `   Type: ${media.mediaType}\n`;
      result += `   Fichier: ${media.fileName}\n`;
      
      if (media.fileSize) {
        result += `   Taille: ${(media.fileSize / 1024 / 1024).toFixed(2)} MB\n`;
      }
      
      if (media.duration) {
        result += `   Durée: ${media.duration} secondes\n`;
      }
      
      if (media.width && media.height) {
        result += `   Dimensions: ${media.width}x${media.height}px\n`;
        result += `   Orientation: ${media.orientation || 'N/A'}\n`;
      }
      
      result += `\n**Statut:**\n`;
      result += `   Retiré: ${media.retired ? 'Oui' : 'Non'}\n`;
      result += `   Modifié: ${media.isEdited ? 'Oui' : 'Non'}\n`;
      
      if (media.createdDt) result += `   Créé le: ${media.createdDt}\n`;
      if (media.modifiedDt) result += `   Modifié le: ${media.modifiedDt}\n`;
      
      if (media.tags && media.tags.length > 0) {
        result += `\n**Tags:** ${media.tags.join(', ')}\n`;
      }

      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des détails du média: ${error.message}`;
    }
  }
};

const mediaDelete: ToolDefinition = {
  name: 'media_delete',
  description: 'Delete a media file from the library',
  parameters: [
    { name: 'mediaId', type: 'number', description: 'The media ID', required: true },
    { name: 'force', type: 'boolean', description: 'Force delete even if in use', required: false, default: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const queryParams = params.force ? { forceDelete: 1 } : {};
      await client.delete(`/library/${params.mediaId}`, { params: queryParams });
      
      return `✅ Média ${params.mediaId} supprimé avec succès.`;
    } catch (error: any) {
      return `Erreur lors de la suppression: ${error.message}`;
    }
  }
};

const mediaEdit: ToolDefinition = {
  name: 'media_edit',
  description: 'Edit media properties like name, tags, or duration',
  parameters: [
    { name: 'mediaId', type: 'number', description: 'The media ID', required: true },
    { name: 'name', type: 'string', description: 'New name', required: false },
    { name: 'tags', type: 'string', description: 'New tags (comma-separated)', required: false },
    { name: 'duration', type: 'number', description: 'New duration in seconds', required: false },
    { name: 'retired', type: 'boolean', description: 'Mark as retired', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const data: any = {};
      
      if (params.name) data.name = params.name;
      if (params.tags) data.tags = params.tags;
      if (params.duration) data.duration = params.duration;
      if (params.retired !== undefined) data.retired = params.retired ? 1 : 0;
      
      if (Object.keys(data).length === 0) {
        return 'Aucune modification spécifiée.';
      }
      
      await client.put(`/library/${params.mediaId}`, data);
      
      return `✅ Média ${params.mediaId} modifié avec succès.`;
    } catch (error: any) {
      return `Erreur lors de la modification: ${error.message}`;
    }
  }
};

export const mediaTools: ToolDefinition[] = [
  mediaList,
  mediaUpload,
  mediaGet,
  mediaDelete,
  mediaEdit
];