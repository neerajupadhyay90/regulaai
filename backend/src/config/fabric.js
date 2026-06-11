const axios = require('axios');
const { logger } = require('../utils/logger');

/**
 * Microsoft Fabric IQ Integration
 * Retrieves regulation clause embeddings via Fabric vector search
 */
async function getFabricEmbeddings(regulation, topics) {
  const workspaceId = process.env.FABRIC_WORKSPACE_ID;
  const lakehouseId = process.env.FABRIC_LAKEHOUSE_ID;
  const apiKey = process.env.FABRIC_API_KEY;

  if (!workspaceId || !lakehouseId || !apiKey) {
    throw new Error('Fabric credentials not configured');
  }

  const endpoint = `https://api.fabric.microsoft.com/v1/workspaces/${workspaceId}/lakehouses/${lakehouseId}/tables/regulation_clauses/query`;

  const query = {
    regulation: regulation,
    topics: topics,
    topK: 15,
    includeMetadata: true
  };

  const response = await axios.post(endpoint, query, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 15000
  });

  logger.info(`Fabric returned ${response.data.results?.length || 0} clause embeddings`);
  return response.data.results || [];
}

/**
 * Store a compliance report in Fabric Lakehouse for audit trail
 */
async function storeReportInFabric(reportId, report) {
  const workspaceId = process.env.FABRIC_WORKSPACE_ID;
  const lakehouseId = process.env.FABRIC_LAKEHOUSE_ID;
  const apiKey = process.env.FABRIC_API_KEY;

  if (!workspaceId || !lakehouseId || !apiKey) return;

  try {
    await axios.post(
      `https://api.fabric.microsoft.com/v1/workspaces/${workspaceId}/lakehouses/${lakehouseId}/tables/audit_reports/rows`,
      { rows: [{ reportId, regulation: report.regulation, score: report.overallScore, generatedAt: report.generatedAt }] },
      { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
    );
    logger.info(`Report ${reportId} stored in Fabric audit trail`);
  } catch (err) {
    logger.warn('Failed to store report in Fabric:', err.message);
  }
}

module.exports = { getFabricEmbeddings, storeReportInFabric };
