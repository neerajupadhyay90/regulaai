const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { ComplianceReasoningAgent } = require('../agents/complianceAgent');
const { extractTextFromFile } = require('../utils/fileParser');
const { saveReport } = require('../utils/database');
const { logger } = require('../utils/logger');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const agent = new ComplianceReasoningAgent();

const SUPPORTED_REGULATIONS = ['GDPR', 'HIPAA', 'SOC2', 'ISO27001', 'DPDP'];

/**
 * POST /api/analyze
 * Run compliance analysis on uploaded document or text
 */
router.post('/', upload.single('document'), async (req, res) => {
  try {
    const { regulation, policyText, companyContext } = req.body;

    // Validate regulation
    if (!regulation || !SUPPORTED_REGULATIONS.includes(regulation)) {
      return res.status(400).json({
        error: 'Invalid regulation',
        supported: SUPPORTED_REGULATIONS
      });
    }

    // Get policy text — either from file upload or direct text
    let finalPolicyText = policyText || '';

    if (req.file) {
      logger.info(`Processing uploaded file: ${req.file.originalname} (${req.file.mimetype})`);
      finalPolicyText = await extractTextFromFile(req.file);
    }

    if (!finalPolicyText && !companyContext) {
      return res.status(400).json({ error: 'Provide a document upload, policyText, or companyContext' });
    }

    // Run the reasoning agent pipeline
    const reportId = uuidv4();
    logger.info(`Starting analysis ${reportId} for ${regulation}`);

    const report = await agent.analyze({
      regulation,
      policyText: finalPolicyText,
      companyContext: companyContext || ''
    });

    report.reportId = reportId;

    // Persist to Cosmos DB (non-blocking)
    saveReport(reportId, report).catch(err =>
      logger.warn('Failed to save report to database:', err.message)
    );

    logger.info(`Analysis ${reportId} complete. Score: ${report.overallScore}`);
    res.json(report);

  } catch (err) {
    logger.error('Analysis failed:', err);
    res.status(500).json({ error: 'Analysis failed', message: err.message });
  }
});

module.exports = router;
