/**
 * Statistics and analytics tools for Xibo MCP Server
 * @author Xtranumerik Inc.
 */

import { XiboClient } from '../xibo-client.js';

export const statisticsTools = [
  {
    name: 'stats_display_usage',
    description: 'Get display usage statistics with regional filtering',
    parameters: {
      type: 'object',
      properties: {
        displayId: { type: 'number', description: 'Specific display ID' },
        fromDt: { type: 'string', description: 'Start date (ISO format)', required: true },
        toDt: { type: 'string', description: 'End date (ISO format)', required: true },
        region: { type: 'string', description: 'Filter by region' },
        tags: { type: 'string', description: 'Filter by display tags' },
        groupBy: {
          type: 'string',
          enum: ['hour', 'day', 'week', 'month'],
          description: 'Group results by time period',
          default: 'day'
        }
      },
      required: ['fromDt', 'toDt']
    },
    handler: async (params: any, client: XiboClient) => {
      const queryParams: any = {
        fromDt: params.fromDt,
        toDt: params.toDt,
        type: 'display'
      };
      
      if (params.displayId) queryParams.displayId = params.displayId;
      if (params.tags) queryParams.tags = params.tags;
      
      // Get statistics
      const response = await client.get('/stats', queryParams);
      const rawStats = response.data.data || [];
      
      // Process and group statistics
      const processedStats = processStatistics(rawStats, params.groupBy, params.region);
      
      return {
        success: true,
        statistics: processedStats,
        period: {
          from: params.fromDt,
          to: params.toDt,
          groupBy: params.groupBy
        },
        total: processedStats.length
      };
    }
  }
];

/**
 * Process statistics data
 */
function processStatistics(stats: any[], groupBy: string, region?: string): any[] {
  // Filter by region if specified
  let filteredStats = stats;
  if (region) {
    filteredStats = stats.filter(stat => {
      // Assume display name or tag contains region info
      const displayInfo = stat.display || stat.displayName || '';
      return displayInfo.toLowerCase().includes(region.toLowerCase());
    });
  }
  
  // Group by time period
  const grouped = new Map();
  
  filteredStats.forEach(stat => {
    const date = new Date(stat.statDate || stat.fromDt);
    let groupKey: string;
    
    switch (groupBy) {
      case 'hour':
        groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        groupKey = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default: // day
        groupKey = date.toISOString().split('T')[0];
    }
    
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, {
        period: groupKey,
        duration: 0,
        count: 0,
        displays: new Set(),
        layouts: new Set()
      });
    }
    
    const group = grouped.get(groupKey);
    group.duration += stat.duration || 0;
    group.count += stat.count || 1;
    if (stat.displayId) group.displays.add(stat.displayId);
    if (stat.layoutId) group.layouts.add(stat.layoutId);
  });
  
  // Convert to array and finalize
  return Array.from(grouped.values()).map(group => ({
    ...group,
    displayCount: group.displays.size,
    layoutCount: group.layouts.size,
    displays: undefined, // Remove Set objects
    layouts: undefined
  })).sort((a, b) => a.period.localeCompare(b.period));
}