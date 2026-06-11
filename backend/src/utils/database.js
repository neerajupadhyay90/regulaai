const { CosmosClient } = require('@azure/cosmos');
const { logger } = require('./logger');

let container = null;
const inMemoryStore = {}; // fallback when Cosmos not configured

async function getContainer() {
  if (container) return container;
  if (!process.env.COSMOS_CONNECTION_STRING) return null;

  try {
    const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
    const db = client.database(process.env.COSMOS_DATABASE || 'regulaai');
    const { container: c } = await db.containers.createIfNotExists({
      id: process.env.COSMOS_CONTAINER || 'reports',
      partitionKey: { paths: ['/reportId'] }
    });
    container = c;
    logger.info('Cosmos DB connected');
    return container;
  } catch (err) {
    logger.warn('Cosmos DB unavailable, using in-memory store:', err.message);
    return null;
  }
}

async function saveReport(reportId, report) {
  const doc = { id: reportId, reportId, ...report };
  const c = await getContainer();
  if (c) {
    await c.items.upsert(doc);
  } else {
    inMemoryStore[reportId] = doc;
  }
}

async function getReport(reportId) {
  const c = await getContainer();
  if (c) {
    const { resource } = await c.item(reportId, reportId).read();
    return resource || null;
  }
  return inMemoryStore[reportId] || null;
}

async function listReports() {
  const c = await getContainer();
  if (c) {
    const { resources } = await c.items
      .query('SELECT c.reportId, c.regulation, c.overallScore, c.generatedAt FROM c ORDER BY c.generatedAt DESC OFFSET 0 LIMIT 20')
      .fetchAll();
    return resources;
  }
  return Object.values(inMemoryStore).map(r => ({
    reportId: r.reportId,
    regulation: r.regulation,
    overallScore: r.overallScore,
    generatedAt: r.generatedAt
  }));
}

module.exports = { saveReport, getReport, listReports };
