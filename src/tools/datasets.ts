/**
 * Dataset management tools for Xibo MCP Server
 * Dynamic data management, CSV import/export, RSS feeds
 * @author Xtranumerik Inc.
 */

import { ToolDefinition, Dataset, DatasetColumn } from '../types.js';
import XiboClient from '../xibo-client.js';

// ========== DATASET MANAGEMENT TOOLS ==========

const datasetList: ToolDefinition = {
  name: 'dataset_list',
  description: 'List all datasets with their information and data',
  parameters: [
    { name: 'dataSet', type: 'string', description: 'Filter by dataset name', required: false },
    { name: 'start', type: 'number', description: 'Starting position for pagination', required: false },
    { name: 'length', type: 'number', description: 'Number of results to return', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    const queryParams: any = {
      start: params.start || 0,
      length: params.length || 50
    };
    
    if (params.dataSet) queryParams.dataSet = params.dataSet;

    try {
      const response = await client.get<{data: Dataset[], recordsTotal: number}>('/dataset', queryParams);
      const datasets = response.data.data;
      const total = response.data.recordsTotal;

      if (!datasets || datasets.length === 0) {
        return 'Aucun dataset trouvé.';
      }

      let result = `📊 **Datasets trouvés: ${datasets.length}/${total}**\n\n`;
      
      for (let i = 0; i < datasets.length; i++) {
        const dataset = datasets[i];
        result += `**${i + 1}. ${dataset.dataSet}** (ID: ${dataset.dataSetId})\n`;
        result += `   📝 Description: ${dataset.description || 'Aucune description'}\n`;
        result += `   🏷️  Code: ${dataset.code || 'N/A'}\n`;
        result += `   🔄 Dernière synchro: ${dataset.lastSync ? new Date(dataset.lastSync).toLocaleString('fr-FR') : 'Jamais'}\n`;
        
        // Get column count
        try {
          const columnsResponse = await client.get(`/dataset/${dataset.dataSetId}/column`);
          const columns = columnsResponse.data.data || [];
          result += `   📋 Colonnes: ${columns.length}\n`;
        } catch (error) {
          result += `   📋 Colonnes: Information indisponible\n`;
        }
        
        // Get row count
        try {
          const dataResponse = await client.get(`/dataset/${dataset.dataSetId}/data`, { start: 0, length: 1 });
          const rowCount = dataResponse.data.recordsTotal || 0;
          result += `   📊 Lignes de données: ${rowCount}\n`;
        } catch (error) {
          result += `   📊 Lignes de données: Information indisponible\n`;
        }
        
        if (dataset.isRemote === 1) {
          result += `   🌐 Source distante: Oui\n`;
          if (dataset.uri) {
            result += `   🔗 URI: ${dataset.uri}\n`;
          }
        }
        
        result += '\n';
      }

      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des datasets: ${error.message}`;
    }
  }
};

const datasetCreate: ToolDefinition = {
  name: 'dataset_create',
  description: 'Create a new dataset',
  parameters: [
    { name: 'dataSet', type: 'string', description: 'Dataset name', required: true },
    { name: 'description', type: 'string', description: 'Dataset description', required: false },
    { name: 'code', type: 'string', description: 'Unique code for the dataset', required: false },
    { name: 'isRemote', type: 'number', description: '1 for remote dataset, 0 for local (default)', required: false },
    { name: 'uri', type: 'string', description: 'Remote URI (required if isRemote=1)', required: false },
    { name: 'method', type: 'string', description: 'HTTP method for remote (GET, POST)', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const datasetData: any = {
        dataSet: params.dataSet,
        description: params.description || '',
        code: params.code || params.dataSet.toLowerCase().replace(/\s+/g, '_'),
        isRemote: params.isRemote || 0
      };
      
      if (params.isRemote === 1) {
        if (!params.uri) {
          return '❌ URI est requis pour un dataset distant';
        }
        datasetData.uri = params.uri;
        datasetData.method = params.method || 'GET';
      }
      
      const response = await client.post('/dataset', datasetData);
      const newDataset = response.data;
      
      return `✅ Dataset "${params.dataSet}" créé avec succès (ID: ${newDataset.dataSetId})`;
    } catch (error: any) {
      return `Erreur lors de la création du dataset: ${error.message}`;
    }
  }
};

const datasetImportCsv: ToolDefinition = {
  name: 'dataset_import_csv',
  description: 'Import data from CSV content into a dataset',
  parameters: [
    { name: 'dataSetId', type: 'number', description: 'Dataset ID to import into', required: true },
    { name: 'csvData', type: 'string', description: 'CSV content with headers', required: true },
    { name: 'overwrite', type: 'number', description: '1 to overwrite existing data, 0 to append', required: false },
    { name: 'ignoreFirstRow', type: 'number', description: '1 to ignore first row (headers), 0 to include', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const importData = {
        csvData: params.csvData,
        overwrite: params.overwrite || 0,
        ignoreFirstRow: params.ignoreFirstRow !== undefined ? params.ignoreFirstRow : 1
      };
      
      const response = await client.post(`/dataset/${params.dataSetId}/import`, importData);
      
      let result = `✅ Import CSV terminé pour le dataset ${params.dataSetId}\n\n`;
      
      if (response.data.added) {
        result += `📈 Lignes ajoutées: ${response.data.added}\n`;
      }
      if (response.data.updated) {
        result += `🔄 Lignes mises à jour: ${response.data.updated}\n`;
      }
      if (response.data.ignored) {
        result += `⚠️  Lignes ignorées: ${response.data.ignored}\n`;
      }
      
      return result;
    } catch (error: any) {
      return `Erreur lors de l'import CSV: ${error.message}`;
    }
  }
};

const datasetExport: ToolDefinition = {
  name: 'dataset_export',
  description: 'Export dataset data in various formats',
  parameters: [
    { name: 'dataSetId', type: 'number', description: 'Dataset ID to export', required: true },
    { name: 'format', type: 'string', description: 'Export format: csv, json, xml', required: false },
    { name: 'includeHeaders', type: 'number', description: '1 to include column headers', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const format = params.format?.toLowerCase() || 'csv';
      
      // Get dataset info
      const datasetResponse = await client.get(`/dataset/${params.dataSetId}`);
      const dataset = datasetResponse.data;
      
      // Get columns
      const columnsResponse = await client.get(`/dataset/${params.dataSetId}/column`);
      const columns = columnsResponse.data.data || [];
      
      // Get data
      const dataResponse = await client.get(`/dataset/${params.dataSetId}/data`, {
        start: 0,
        length: 10000 // Export all data
      });
      const rows = dataResponse.data.data || [];
      
      let result = `📤 **Export du dataset "${dataset.dataSet}"**\n\n`;
      result += `📊 **Statistiques:**\n`;
      result += `   📋 Colonnes: ${columns.length}\n`;
      result += `   📊 Lignes: ${rows.length}\n`;
      result += `   📄 Format: ${format.toUpperCase()}\n\n`;
      
      if (format === 'csv') {
        result += `📄 **Données CSV:**\n`;
        result += '```csv\n';
        
        // Headers
        if (params.includeHeaders !== 0) {
          const headers = columns.map((col: any) => col.heading).join(',');
          result += `${headers}\n`;
        }
        
        // Data rows
        rows.forEach((row: any) => {
          const values = columns.map((col: any) => {
            const value = row[col.dataSetColumnId] || '';
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(',');
          result += `${values}\n`;
        });
        
        result += '```\n';
        
      } else if (format === 'json') {
        result += `📄 **Données JSON:**\n`;
        result += '```json\n';
        
        const jsonData = {
          dataset: {
            id: dataset.dataSetId,
            name: dataset.dataSet,
            description: dataset.description
          },
          columns: columns.map((col: any) => ({
            id: col.dataSetColumnId,
            heading: col.heading,
            dataTypeId: col.dataTypeId,
            dataSetColumnTypeId: col.dataSetColumnTypeId
          })),
          data: rows.map((row: any) => {
            const rowData: any = {};
            columns.forEach((col: any) => {
              rowData[col.heading] = row[col.dataSetColumnId] || null;
            });
            return rowData;
          })
        };
        
        result += JSON.stringify(jsonData, null, 2);
        result += '\n```\n';
        
      } else if (format === 'xml') {
        result += `📄 **Données XML:**\n`;
        result += '```xml\n';
        result += `<?xml version="1.0" encoding="UTF-8"?>\n`;
        result += `<dataset id="${dataset.dataSetId}" name="${dataset.dataSet}">\n`;
        result += `  <columns>\n`;
        
        columns.forEach((col: any) => {
          result += `    <column id="${col.dataSetColumnId}" heading="${col.heading}" />\n`;
        });
        
        result += `  </columns>\n`;
        result += `  <data>\n`;
        
        rows.forEach((row: any) => {
          result += `    <row>\n`;
          columns.forEach((col: any) => {
            const value = row[col.dataSetColumnId] || '';
            result += `      <${col.heading}><![CDATA[${value}]]></${col.heading}>\n`;
          });
          result += `    </row>\n`;
        });
        
        result += `  </data>\n`;
        result += `</dataset>\n`;
        result += '```\n';
      }
      
      return result;
    } catch (error: any) {
      return `Erreur lors de l'export: ${error.message}`;
    }
  }
};

const datasetAddColumn: ToolDefinition = {
  name: 'dataset_add_column',
  description: 'Add a new column to a dataset',
  parameters: [
    { name: 'dataSetId', type: 'number', description: 'Dataset ID', required: true },
    { name: 'heading', type: 'string', description: 'Column heading/name', required: true },
    { name: 'dataTypeId', type: 'number', description: 'Data type ID (1=String, 2=Number, 3=Date, 4=External Image, 5=Library Image)', required: false },
    { name: 'dataSetColumnTypeId', type: 'number', description: 'Column type ID (1=Value, 2=Formula)', required: false },
    { name: 'listContent', type: 'string', description: 'List of possible values (comma-separated)', required: false },
    { name: 'columnOrder', type: 'number', description: 'Display order of the column', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      const columnData: any = {
        heading: params.heading,
        dataTypeId: params.dataTypeId || 1, // Default to String
        dataSetColumnTypeId: params.dataSetColumnTypeId || 1, // Default to Value
        listContent: params.listContent || '',
        columnOrder: params.columnOrder || 1
      };
      
      const response = await client.post(`/dataset/${params.dataSetId}/column`, columnData);
      const newColumn = response.data;
      
      return `✅ Colonne "${params.heading}" ajoutée au dataset ${params.dataSetId} (ID: ${newColumn.dataSetColumnId})`;
    } catch (error: any) {
      return `Erreur lors de l'ajout de la colonne: ${error.message}`;
    }
  }
};

const datasetUpdateData: ToolDefinition = {
  name: 'dataset_update_data',
  description: 'Update or insert data rows in a dataset',
  parameters: [
    { name: 'dataSetId', type: 'number', description: 'Dataset ID', required: true },
    { name: 'rowId', type: 'number', description: 'Row ID to update (omit for new row)', required: false },
    { name: 'data', type: 'string', description: 'JSON string with column data: {"column1": "value1", "column2": "value2"}', required: true }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      // Parse the data JSON
      let rowData;
      try {
        rowData = JSON.parse(params.data);
      } catch (e) {
        return `❌ Erreur: Le paramètre 'data' doit être un JSON valide. Exemple: {"nom": "Jean", "age": "30"}`;
      }
      
      // Get dataset columns to map headings to column IDs
      const columnsResponse = await client.get(`/dataset/${params.dataSetId}/column`);
      const columns = columnsResponse.data.data || [];
      
      // Build the update data with column IDs
      const updateData: any = {};
      
      Object.entries(rowData).forEach(([heading, value]) => {
        const column = columns.find((col: any) => col.heading === heading);
        if (column) {
          updateData[column.dataSetColumnId] = value;
        } else {
          console.warn(`Colonne "${heading}" non trouvée dans le dataset`);
        }
      });
      
      if (Object.keys(updateData).length === 0) {
        return `❌ Aucune colonne valide trouvée. Colonnes disponibles: ${columns.map((c: any) => c.heading).join(', ')}`;
      }
      
      let result: string;
      
      if (params.rowId) {
        // Update existing row
        await client.put(`/dataset/${params.dataSetId}/data/${params.rowId}`, updateData);
        result = `✅ Ligne ${params.rowId} mise à jour dans le dataset ${params.dataSetId}`;
      } else {
        // Insert new row
        const response = await client.post(`/dataset/${params.dataSetId}/data`, updateData);
        result = `✅ Nouvelle ligne ajoutée au dataset ${params.dataSetId} (ID: ${response.data.id})`;
      }
      
      result += `\n📊 Colonnes mises à jour: ${Object.keys(rowData).join(', ')}`;
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la mise à jour des données: ${error.message}`;
    }
  }
};

const datasetClear: ToolDefinition = {
  name: 'dataset_clear',
  description: 'Clear all data from a dataset (keep structure)',
  parameters: [
    { name: 'dataSetId', type: 'number', description: 'Dataset ID to clear', required: true },
    { name: 'confirm', type: 'string', description: 'Type "YES" to confirm deletion', required: true }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    if (params.confirm !== 'YES') {
      return `⚠️  Confirmation requise. Utilisez confirm="YES" pour supprimer toutes les données du dataset.`;
    }
    
    try {
      // Get current row count
      const dataResponse = await client.get(`/dataset/${params.dataSetId}/data`, { start: 0, length: 1 });
      const rowCount = dataResponse.data.recordsTotal || 0;
      
      if (rowCount === 0) {
        return `✅ Dataset ${params.dataSetId} est déjà vide`;
      }
      
      // Delete all data rows
      await client.delete(`/dataset/${params.dataSetId}/data`);
      
      return `✅ Toutes les données supprimées du dataset ${params.dataSetId} (${rowCount} lignes supprimées)`;
    } catch (error: any) {
      return `Erreur lors de la suppression des données: ${error.message}`;
    }
  }
};

const datasetRemoteSync: ToolDefinition = {
  name: 'dataset_remote_sync',
  description: 'Synchronize a remote dataset with its data source',
  parameters: [
    { name: 'dataSetId', type: 'number', description: 'Remote dataset ID to synchronize', required: true }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      // Check if it's a remote dataset
      const datasetResponse = await client.get(`/dataset/${params.dataSetId}`);
      const dataset = datasetResponse.data;
      
      if (dataset.isRemote !== 1) {
        return `❌ Le dataset "${dataset.dataSet}" n'est pas un dataset distant`;
      }
      
      // Trigger synchronization
      const response = await client.post(`/dataset/${params.dataSetId}/synchronize`, {});
      
      let result = `🔄 Synchronisation déclenchée pour le dataset "${dataset.dataSet}"\n\n`;
      
      if (response.data.success) {
        result += `✅ Synchronisation réussie\n`;
        
        if (response.data.added) {
          result += `📈 Lignes ajoutées: ${response.data.added}\n`;
        }
        if (response.data.updated) {
          result += `🔄 Lignes mises à jour: ${response.data.updated}\n`;
        }
        if (response.data.unchanged) {
          result += `➖ Lignes inchangées: ${response.data.unchanged}\n`;
        }
        
        result += `🕒 Dernière synchronisation: ${new Date().toLocaleString('fr-FR')}`;
      } else {
        result += `❌ Erreur lors de la synchronisation: ${response.data.message || 'Erreur inconnue'}`;
      }
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la synchronisation: ${error.message}`;
    }
  }
};

const datasetRssConfigure: ToolDefinition = {
  name: 'dataset_rss_configure',
  description: 'Configure RSS feed settings for a dataset',
  parameters: [
    { name: 'dataSetId', type: 'number', description: 'Dataset ID to configure RSS for', required: true },
    { name: 'titleColumnId', type: 'number', description: 'Column ID for RSS title', required: false },
    { name: 'summaryColumnId', type: 'number', description: 'Column ID for RSS summary', required: false },
    { name: 'contentColumnId', type: 'number', description: 'Column ID for RSS content', required: false },
    { name: 'publishedDateColumnId', type: 'number', description: 'Column ID for published date', required: false }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    
    try {
      // Get dataset and columns information
      const datasetResponse = await client.get(`/dataset/${params.dataSetId}`);
      const dataset = datasetResponse.data;
      
      const columnsResponse = await client.get(`/dataset/${params.dataSetId}/column`);
      const columns = columnsResponse.data.data || [];
      
      // Configure RSS settings
      const rssData: any = {
        titleColumnId: params.titleColumnId,
        summaryColumnId: params.summaryColumnId,
        contentColumnId: params.contentColumnId,
        publishedDateColumnId: params.publishedDateColumnId
      };
      
      // Remove undefined values
      Object.keys(rssData).forEach(key => {
        if (rssData[key] === undefined) {
          delete rssData[key];
        }
      });
      
      await client.put(`/dataset/${params.dataSetId}/rss`, rssData);
      
      let result = `✅ Configuration RSS mise à jour pour le dataset "${dataset.dataSet}"\n\n`;
      
      result += `📊 **Configuration RSS:**\n`;
      
      Object.entries(rssData).forEach(([key, columnId]) => {
        const column = columns.find((col: any) => col.dataSetColumnId == columnId);
        const columnName = column ? column.heading : `ID ${columnId}`;
        
        const fieldName = key.replace('ColumnId', '').replace(/([A-Z])/g, ' $1').toLowerCase();
        result += `   ${fieldName}: ${columnName}\n`;
      });
      
      result += `\n🔗 **URL du flux RSS:**\n`;
      result += `   ${dataset.uri || 'Non configuré'}/rss\n`;
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la configuration RSS: ${error.message}`;
    }
  }
};

export const datasetTools: ToolDefinition[] = [
  datasetList,
  datasetCreate,
  datasetImportCsv,
  datasetExport,
  datasetAddColumn,
  datasetUpdateData,
  datasetClear,
  datasetRemoteSync,
  datasetRssConfigure
];