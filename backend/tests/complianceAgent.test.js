const { ComplianceReasoningAgent } = require('../src/agents/complianceAgent');

// Mock axios to avoid real API calls in tests
jest.mock('axios', () => ({
  post: jest.fn()
}));
const axios = require('axios');

describe('ComplianceReasoningAgent', () => {
  let agent;

  beforeEach(() => {
    agent = new ComplianceReasoningAgent();
    jest.clearAllMocks();
  });

  describe('getFallbackClauses', () => {
    test('returns GDPR clauses', () => {
      const clauses = agent.getFallbackClauses('GDPR');
      expect(clauses.length).toBeGreaterThan(0);
      expect(clauses[0]).toHaveProperty('id');
      expect(clauses[0]).toHaveProperty('title');
      expect(clauses[0]).toHaveProperty('requirement');
    });

    test('returns HIPAA clauses', () => {
      const clauses = agent.getFallbackClauses('HIPAA');
      expect(clauses.length).toBeGreaterThan(0);
    });

    test('returns SOC2 clauses', () => {
      const clauses = agent.getFallbackClauses('SOC2');
      expect(clauses.length).toBeGreaterThan(0);
    });

    test('returns ISO27001 clauses', () => {
      const clauses = agent.getFallbackClauses('ISO27001');
      expect(clauses.length).toBeGreaterThan(0);
    });

    test('returns DPDP clauses', () => {
      const clauses = agent.getFallbackClauses('DPDP');
      expect(clauses.length).toBeGreaterThan(0);
    });

    test('falls back to GDPR for unknown regulation', () => {
      const clauses = agent.getFallbackClauses('UNKNOWN');
      expect(clauses.length).toBeGreaterThan(0);
    });
  });

  describe('step5_generateReport', () => {
    test('calculates score correctly', async () => {
      const mockFindings = [
        { severity: 'critical', title: 'No DPO', clauseId: 'Art.37', description: 'Missing DPO', action: 'Appoint a DPO', deadline: 'Immediate' },
        { severity: 'high', title: 'No breach procedure', clauseId: 'Art.33', description: 'No 72hr breach plan', action: 'Create breach response plan', deadline: 'Within 30 days' },
        { severity: 'medium', title: 'Incomplete privacy notice', clauseId: 'Art.13', description: 'Privacy notice missing retention info', action: 'Update privacy notice', deadline: 'Within 90 days' }
      ];

      // Mock the summary call
      axios.post.mockResolvedValue({
        data: {
          content: [{ text: 'The organization shows significant compliance gaps. Immediate remediation is required.' }]
        }
      });

      const report = await agent.step5_generateReport(mockFindings, 'GDPR', {
        companyType: 'SaaS startup',
        dataTypes: ['email', 'user data'],
        controls: [],
        topics: ['privacy'],
        gaps: []
      });

      expect(report).toHaveProperty('overallScore');
      expect(report.overallScore).toBeLessThan(80); // critical gap should lower score
      expect(report).toHaveProperty('findings');
      expect(report).toHaveProperty('actionPlan');
      expect(report).toHaveProperty('stats');
      expect(report.stats.critical).toBe(1);
      expect(report.stats.high).toBe(1);
      expect(report.stats.medium).toBe(1);
    });

    test('sorts findings by severity', async () => {
      const mockFindings = [
        { severity: 'low', title: 'Minor gap', clauseId: 'A1', description: 'x', action: 'y', deadline: 'z' },
        { severity: 'critical', title: 'Critical gap', clauseId: 'A2', description: 'x', action: 'y', deadline: 'z' },
        { severity: 'high', title: 'High gap', clauseId: 'A3', description: 'x', action: 'y', deadline: 'z' }
      ];

      axios.post.mockResolvedValue({
        data: { content: [{ text: 'Summary text here.' }] }
      });

      const report = await agent.step5_generateReport(mockFindings, 'GDPR', {
        companyType: 'test', dataTypes: [], controls: [], topics: [], gaps: []
      });

      expect(report.findings[0].severity).toBe('critical');
      expect(report.findings[1].severity).toBe('high');
      expect(report.findings[2].severity).toBe('low');
    });
  });

  describe('callFoundry', () => {
    test('uses Anthropic fallback when Foundry not configured', async () => {
      delete process.env.AZURE_FOUNDRY_ENDPOINT;
      delete process.env.AZURE_FOUNDRY_API_KEY;

      axios.post.mockResolvedValue({
        data: { content: [{ text: '{"test": true}' }] }
      });

      const result = await agent.callFoundry('test prompt', 100);
      expect(result).toBe('{"test": true}');
      expect(axios.post).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.any(Object),
        expect.any(Object)
      );
    });
  });
});
