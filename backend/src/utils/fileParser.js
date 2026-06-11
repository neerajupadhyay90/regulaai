const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { logger } = require('./logger');

/**
 * Extract plain text from uploaded file buffer
 * Supports: PDF, DOCX, TXT
 */
async function extractTextFromFile(file) {
  const { buffer, mimetype, originalname } = file;

  try {
    // PDF
    if (mimetype === 'application/pdf' || originalname.endsWith('.pdf')) {
      const data = await pdfParse(buffer);
      return data.text;
    }

    // DOCX
    if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      originalname.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    // Plain text
    if (mimetype === 'text/plain' || originalname.endsWith('.txt')) {
      return buffer.toString('utf-8');
    }

    throw new Error(`Unsupported file type: ${mimetype}`);
  } catch (err) {
    logger.error('File parsing error:', err);
    throw new Error(`Could not parse file: ${err.message}`);
  }
}

module.exports = { extractTextFromFile };
