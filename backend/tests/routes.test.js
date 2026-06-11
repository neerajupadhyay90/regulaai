const request = require('supertest');
const app = require('../src/index');

jest.mock('../src/agents/complianceAgent', () => ({
  ComplianceReasoningAgent: jest.fn().mockImplementation(() => ({
    analyze: jest.fn().mockResolvedValue({
      regulation: 'GDPR',
      overallScore: 62,
      summary: 'Test summary sentence one. Test summary sentence two.',
      stats: { critical: 1, high: 2, medium: 2, low: 0, passed: 4 },
      findings: [],
      actionPlan: [],
      generatedAt: new Date().toISOString()
    })
  }))
}));

jest.mock('../src/utils/database', () => ({
  saveReport: jest.fn().mockResolvedValue(undefined),
  getReport: jest.fn().mockResolvedValue(null),
  listReports: jest.fn().mockResolvedValue([])
}));

describe('GET /api/health', () => {
  it('returns healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body).toHaveProperty('integrations');
  });
});

describe('POST /api/analyze', () => {
  it('rejects missing regulation', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .field('policyText', 'We collect user data.');
    expect(res.status).toBe(400);
  });

  it('rejects invalid regulation', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .field('regulation', 'INVALID')
      .field('policyText', 'We collect user data.');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('supported');
  });

  it('rejects empty body', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .field('regulation', 'GDPR');
    expect(res.status).toBe(400);
  });

  it('returns report for valid text input', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .field('regulation', 'GDPR')
      .field('policyText', 'We store user emails in our database. We use Google Analytics.');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('overallScore');
    expect(res.body).toHaveProperty('findings');
    expect(res.body).toHaveProperty('actionPlan');
  });
});

describe('GET /api/reports/:id', () => {
  it('returns 404 for unknown report', async () => {
    const res = await request(app).get('/api/reports/nonexistent-id');
    expect(res.status).toBe(404);
  });
});
