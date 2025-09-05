/**
 * Notification and alert management tools for Xibo MCP Server
 * @author Xtranumerik Inc.
 */

import { XiboClient } from '../xibo-client.js';
import { EmergencyAlert } from '../types.js';

export const notificationTools = [
  {
    name: 'notification_list',
    description: 'List notifications with filtering options',
    parameters: {
      type: 'object',
      properties: {
        subject: { type: 'string', description: 'Filter by subject' },
        userId: { type: 'number', description: 'Filter by user ID' },
        isEmail: { type: 'boolean', description: 'Filter by email notifications' },
        isInterrupt: { type: 'boolean', description: 'Filter by interrupt notifications' },
        isSystem: { type: 'boolean', description: 'Filter by system notifications' },
        read: { type: 'boolean', description: 'Filter by read status' },
        start: { type: 'number', description: 'Pagination start' },
        length: { type: 'number', description: 'Number of results' }
      }
    },
    handler: async (params: any, client: XiboClient) => {
      const queryParams: any = {};
      
      if (params.subject) queryParams.subject = params.subject;
      if (params.userId) queryParams.userId = params.userId;
      if (params.isEmail !== undefined) queryParams.isEmail = params.isEmail ? 1 : 0;
      if (params.isInterrupt !== undefined) queryParams.isInterrupt = params.isInterrupt ? 1 : 0;
      if (params.isSystem !== undefined) queryParams.isSystem = params.isSystem ? 1 : 0;
      if (params.read !== undefined) queryParams.read = params.read ? 1 : 0;
      if (params.start) queryParams.start = params.start;
      if (params.length) queryParams.length = params.length;
      
      const response = await client.get('/notification', queryParams);
      return {
        success: true,
        data: response.data,
        total: response.data.recordsTotal || response.data.data?.length || 0
      };
    }
  },
  
  {
    name: 'emergency_alert_create',
    description: 'Create and broadcast emergency alert with geo-targeting',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Alert title', required: true },
        message: { type: 'string', description: 'Alert message', required: true },
        alertType: { 
          type: 'string', 
          enum: ['warning', 'danger', 'info', 'success'],
          description: 'Alert type',
          default: 'warning'
        },
        severity: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'critical'],
          description: 'Alert severity',
          default: 'medium'
        },
        duration: { type: 'number', description: 'Duration in seconds', default: 300 },
        priority: { type: 'number', description: 'Display priority (1-10)', default: 5 },
        regions: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Target regions for geographic filtering'
        },
        displayIds: {
          type: 'array',
          items: { type: 'number' },
          description: 'Specific display IDs to target'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Display tags to target'
        },
        expiresAt: { type: 'string', description: 'Alert expiration (ISO date)' },
        scheduleDate: { type: 'string', description: 'Schedule for later (ISO date)' }
      },
      required: ['title', 'message']
    },
    handler: async (params: any, client: XiboClient) => {
      try {
        // Create notification first
        const notification = {
          subject: params.title,
          body: params.message,
          isEmail: params.alertType === 'critical' ? 1 : 0,
          isInterrupt: ['high', 'critical'].includes(params.severity) ? 1 : 0,
          isSystem: 1,
          releaseDt: params.scheduleDate || new Date().toISOString()
        };
        
        const notificationResponse = await client.post('/notification', notification);
        
        // Get target displays based on criteria
        let targetDisplays: number[] = [];
        
        if (params.displayIds) {
          targetDisplays = params.displayIds;
        } else {
          // Get displays based on regions and tags
          const displayParams: any = {};
          if (params.tags) {
            displayParams.tags = params.tags.join(',');
          }
          
          const displaysResponse = await client.get('/display', displayParams);
          const allDisplays = displaysResponse.data.data || [];
          
          // Filter by regions if specified
          if (params.regions && params.regions.length > 0) {
            targetDisplays = allDisplays
              .filter((display: any) => {
                const displayRegion = getDisplayRegion(display);
                return params.regions.some((region: string) => 
                  displayRegion.toLowerCase().includes(region.toLowerCase())
                );
              })
              .map((display: any) => display.displayId);
          } else {
            targetDisplays = allDisplays.map((display: any) => display.displayId);
          }
        }
        
        // Create emergency layout if not exists
        let emergencyLayoutId: number;
        try {
          const layouts = await client.get('/layout', { layout: 'Emergency Alert Template' });
          if (layouts.data.data && layouts.data.data.length > 0) {
            emergencyLayoutId = layouts.data.data[0].layoutId;
          } else {
            // Create emergency layout
            const emergencyLayout = {
              name: 'Emergency Alert Template',
              description: 'Auto-generated emergency alert layout',
              width: 1920,
              height: 1080,
              backgroundColor: params.alertType === 'danger' ? '#dc3545' : '#ffc107'
            };
            
            const layoutResponse = await client.post('/layout', emergencyLayout);
            emergencyLayoutId = layoutResponse.data.layoutId;
          }
        } catch {
          // Create emergency layout
          const emergencyLayout = {
            name: 'Emergency Alert Template',
            description: 'Auto-generated emergency alert layout',
            width: 1920,
            height: 1080,
            backgroundColor: params.alertType === 'danger' ? '#dc3545' : '#ffc107'
          };
          
          const layoutResponse = await client.post('/layout', emergencyLayout);
          emergencyLayoutId = layoutResponse.data.layoutId;
        }
        
        // Schedule alert on target displays
        const schedulePromises = targetDisplays.map((displayId: number) => {
          const scheduleData = {
            eventTypeId: 1, // Layout event
            campaignId: emergencyLayoutId,
            displayGroupId: displayId,
            fromDt: params.scheduleDate || new Date().toISOString(),
            toDt: params.expiresAt || new Date(Date.now() + (params.duration * 1000)).toISOString(),
            userId: 1,
            isPriority: params.priority > 7 ? 1 : 0,
            displayOrder: params.priority,
            isGeoAware: params.regions ? 1 : 0
          };
          
          return client.post('/schedule', scheduleData);
        });
        
        await Promise.all(schedulePromises);
        
        // Create alert record
        const alertRecord: EmergencyAlert = {
          alertId: notificationResponse.data.notificationId,
          title: params.title,
          message: params.message,
          alertType: params.alertType,
          severity: params.severity,
          regions: params.regions,
          displayIds: targetDisplays,
          duration: params.duration,
          priority: params.priority,
          createdAt: new Date().toISOString(),
          expiresAt: params.expiresAt,
          active: true
        };
        
        return {
          success: true,
          alert: alertRecord,
          notification: notificationResponse.data,
          targetsCount: targetDisplays.length,
          message: `Emergency alert created and scheduled on ${targetDisplays.length} displays`
        };
        
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          success: false,
          error: `Failed to create emergency alert: ${errorMessage}`
        };
      }
    }
  }
];

/**
 * Helper function to determine display region
 */
function getDisplayRegion(display: any): string {
  // Try to determine region from display properties
  if (display.city) return display.city;
  if (display.address) {
    // Extract region from address
    const addressParts = display.address.split(',');
    return addressParts[addressParts.length - 1]?.trim() || 'Unknown';
  }
  if (display.tags) {
    // Look for region tags
    const regionTags = display.tags.filter((tag: string) => 
      tag.toLowerCase().includes('region') || 
      tag.toLowerCase().includes('zone') ||
      tag.toLowerCase().includes('area')
    );
    if (regionTags.length > 0) {
      return regionTags[0];
    }
  }
  
  return 'Unknown';
}