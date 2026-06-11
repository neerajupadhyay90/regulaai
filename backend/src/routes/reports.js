const express = require('express');
const { getReport, listReports } = require('../utils/database');
const { logger } = require('../utils/logger');

const router = express.Router();

// GET /api/reports/:id
router.get('/:id', async (req, res) => {
  try {
    const report = await getReport(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    logger.error('Failed to fetch report:', err);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// GET /api/reports
router.get('/', async (req, res) => {
  try {
    const reports = await listReports();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list reports' });
  }
});

module.exports = router;
