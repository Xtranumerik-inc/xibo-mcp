/**
 * Dataset management tools for Xibo MCP Server
 * Advanced data management with sync capabilities
 * @author Xtranumerik Inc.
 */

import { XiboClient } from '../xibo-client.js';

export const datasetTools = [
  {
    name: 'dataset_list',
    description: 'List all datasets with filtering and search capabilities',
    parameters: [
      { name: 'folderId', type: 'number', description: 'Filter by folder ID', required: false },
      { name: 'name', type: 'string', description: 'Filter by dataset name', required: false },
      { name: 'code', type: 'string', description: 'Filter by dataset code', required: false },
      { name: 'userId', type: 'number', description: 'Filter by owner user ID', required: false },
      { name: 'isRemote', type: 'boolean', description: 'Filter by remote datasets', required: false },
      { name: 'isLookup', type: 'boolean', description: 'Filter by lookup datasets', required: false },
      { name: 'tags', type: 'string', description: 'Filter by tags (comma-separated)', required: false },
      { name: 'exactTags', type: 'boolean', description: 'Require exact tag matches', required: false, default: false },
      { name: 'start', type: 'number', description: 'Pagination start', required: false },
      { name: 'length', type: 'number', description: 'Number of results to return', required: false }
    ],
    handler: async (params: any, client: XiboClient) => {
      const queryParams: any = {};
      
      if (params.folderId) queryParams.folderId = params.folderId;
      if (params.name) queryParams.name = params.name;
      if (params.code) queryParams.code = params.code;
      if (params.userId) queryParams.userId = params.userId;
      if (params.isRemote !== undefined) queryParams.isRemote = params.isRemote ? 1 : 0;
      if (params.isLookup !== undefined) queryParams.isLookup = params.isLookup ? 1 : 0;
      if (params.tags) queryParams.tags = params.tags;
      if (params.exactTags) queryParams.exactTags = 1;
      if (params.start) queryParams.start = params.start;
      if (params.length) queryParams.length = params.length;
      
      const response = await client.get('/dataset', queryParams);
      return {
        success: true,
        data: response.data,
        total: response.data.recordsTotal || response.data.data?.length || 0
      };
    }
  },
  
  {
    name: 'dataset_get',
    description: 'Get detailed information about a specific dataset',
    parameters: [
      { name: 'dataSetId', type: 'number', description: 'Dataset ID', required: true },
      { name: 'includeColumns', type: 'boolean', description: 'Include column definitions', required: false, default: true },
      { name: 'includeData', type: 'boolean', description: 'Include dataset data', required: false, default: false },
      { name: 'limit', type: 'number', description: 'Limit data rows returned', required: false, default: 100 }
    ],
    handler: async (params: any, client: XiboClient) => {
      const dataset = await client.get(`/dataset/${params.dataSetId}`);
      
      const result: any = {
        success: true,
        dataset: dataset.data
      };
      
      if (params.includeColumns) {
        const columns = await client.get(`/dataset/${params.dataSetId}/column`);
        result.columns = columns.data;
      }
      
      if (params.includeData === true) {
        const queryParams: any = {};
        if (params.limit) queryParams.length = params.limit;
        
        const data = await client.get(`/dataset/${params.dataSetId}/data`, queryParams);
        result.data = data.data;
      }
      
      return result;
    }
  }
];