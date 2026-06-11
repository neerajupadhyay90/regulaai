const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'RegulaAI Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    integrations: {
      foundryIQ: !!process.env.AZURE_FOUNDRY_ENDPOINT,
      fabricIQ: !!process.env.FABRIC_WORKSPACE_ID,
      cosmosDB: !!process.env.COSMOS_CONNECTION_STRING
    }
  });
});

module.exports = router;
