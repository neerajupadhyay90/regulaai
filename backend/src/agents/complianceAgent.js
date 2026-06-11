const axios = require('axios');
const { logger } = require('../utils/logger');
const { getFabricEmbeddings } = require('../config/fabric');

/**
 * RegulaAI Compliance Reasoning Agent
 * Multi-step pipeline: Ingest → Retrieve → Reason → Score → Report
 */
class ComplianceReasoningAgent {
  constructor() {
    this.foundryEndpoint = process.env.AZURE_FOUNDRY_ENDPOINT;
    this.foundryApiKey = process.env.AZURE_FOUNDRY_API_KEY;
    this.deployment = process.env.AZURE_FOUNDRY_DEPLOYMENT || 'gpt-4o';
  }

  /**
   * Main agent entry point — runs the full reasoning pipeline
   */
  async analyze({ regulation, policyText, companyContext = '' }) {
    logger.info(`Starting compliance analysis for regulation: ${regulation}`);

    // Step 1: Parse and structure the input
    const parsedPolicy = await this.step1_parsePolicy(policyText, companyContext);
    logger.info('Step 1 complete: Policy parsed');

    // Step 2: Retrieve relevant regulation clauses from Fabric
    const regulationClauses = await this.step2_retrieveClauses(regulation, parsedPolicy.topics);
    logger.info(`Step 2 complete: Retrieved ${regulationClauses.length} clauses`);

    // Step 3: Multi-step clause-by-clause reasoning
    const gapAnalysis = await this.step3_reasonGaps(parsedPolicy, regulationClauses, regulation);
    logger.info(`Step 3 complete: Identified ${gapAnalysis.length} gaps`);

    // Step 4: Score and prioritize findings
    const scoredFindings = await this.step4_scoreFindings(gapAnalysis, regulation);
    logger.info('Step 4 complete: Findings scored');

    // Step 5: Generate structured action plan
    const report = await this.step5_generateReport(scoredFindings, regulation, parsedPolicy);
    logger.info('Step 5 complete: Report generated');

    return report;
  }

  // ─── STEP 1: Parse Policy ───────────────────────────────────────────────────
  async step1_parsePolicy(policyText, companyContext) {
    const prompt = `You are a compliance document analyst. Extract structured information from this company policy document.

POLICY DOCUMENT:
${policyText.slice(0, 4000)}

${companyContext ? `ADDITIONAL CONTEXT: ${companyContext}` : ''}

Extract and return as JSON (no markdown):
{
  "companyType": "description of company type",
  "dataTypes": ["list of personal/sensitive data types mentioned"],
  "controls": ["list of security/privacy controls mentioned"],
  "topics": ["list of compliance topic areas covered"],
  "gaps": ["obvious missing sections"],
  "summary": "2-sentence summary of the policy"
}`;

    const result = await this.callFoundry(prompt, 800);
    try {
      return JSON.parse(result.replace(/```json|```/g, '').trim());
    } catch {
      return {
        companyType: 'Technology company',
        dataTypes: ['personal data', 'user information'],
        controls: [],
        topics: ['data protection', 'privacy', 'security'],
        gaps: [],
        summary: policyText.slice(0, 200)
      };
    }
  }

  // ─── STEP 2: Retrieve Clauses from Fabric ───────────────────────────────────
  async step2_retrieveClauses(regulation, topics) {
    try {
      // In production: query Microsoft Fabric vector store
      const clauses = await getFabricEmbeddings(regulation, topics);
      if (clauses && clauses.length > 0) return clauses;
    } catch (err) {
      logger.warn('Fabric retrieval failed, using fallback clause library:', err.message);
    }

    // Fallback: built-in key clauses per regulation
    return this.getFallbackClauses(regulation);
  }

  getFallbackClauses(regulation) {
    const clauses = {
      GDPR: [
        { id: 'Art.5', title: 'Principles of data processing', requirement: 'Data must be processed lawfully, fairly, transparently, for specified purposes, minimized, accurate, kept no longer than necessary, and protected.' },
        { id: 'Art.6', title: 'Lawful basis for processing', requirement: 'Processing requires a valid legal basis: consent, contract, legal obligation, vital interests, public task, or legitimate interests.' },
        { id: 'Art.13', title: 'Privacy notice / transparency', requirement: 'Data subjects must be informed about identity of controller, purposes, legal basis, retention periods, and their rights at time of collection.' },
        { id: 'Art.17', title: 'Right to erasure', requirement: 'Data subjects have the right to request deletion of their personal data under specific circumstances.' },
        { id: 'Art.25', title: 'Data protection by design and default', requirement: 'Privacy must be embedded into systems and processes from the start, with maximum privacy settings as default.' },
        { id: 'Art.32', title: 'Security of processing', requirement: 'Appropriate technical and organisational measures must be implemented to ensure data security, including encryption and pseudonymisation.' },
        { id: 'Art.33', title: 'Breach notification to authority', requirement: 'Personal data breaches must be reported to the supervisory authority within 72 hours of becoming aware.' },
        { id: 'Art.35', title: 'Data Protection Impact Assessment', requirement: 'DPIA is required for high-risk processing activities, especially involving new technologies.' },
        { id: 'Art.37', title: 'Data Protection Officer', requirement: 'A DPO must be appointed for public authorities, large-scale systematic monitoring, or large-scale sensitive data processing.' }
      ],
      HIPAA: [
        { id: '164.308', title: 'Administrative safeguards', requirement: 'Must implement security management processes, assign security responsibility, workforce training, and contingency planning.' },
        { id: '164.310', title: 'Physical safeguards', requirement: 'Must control physical access to systems containing PHI, including workstation and device controls.' },
        { id: '164.312', title: 'Technical safeguards', requirement: 'Must implement access controls, audit controls, integrity controls, and transmission security for PHI.' },
        { id: '164.502', title: 'Uses and disclosures', requirement: 'PHI may only be used or disclosed as permitted, including treatment, payment, healthcare operations, or with authorization.' },
        { id: '164.524', title: 'Access of individuals to PHI', requirement: 'Individuals have the right to access and obtain copies of their PHI within 30 days of request.' },
        { id: '164.530', title: 'Organizational requirements', requirement: 'Must designate a privacy official, train workforce, and have a process to handle complaints and sanctions.' }
      ],
      SOC2: [
        { id: 'CC1', title: 'Control environment', requirement: 'Organization must demonstrate commitment to integrity, ethical values, competence, and accountability.' },
        { id: 'CC6', title: 'Logical and physical access controls', requirement: 'Restrict logical and physical access to authorized users and protect against unauthorized access.' },
        { id: 'CC7', title: 'System operations', requirement: 'Detect and monitor system vulnerabilities, manage incidents, and maintain business continuity.' },
        { id: 'CC8', title: 'Change management', requirement: 'Changes to infrastructure, data, software, and procedures must be authorized, tested, and documented.' },
        { id: 'A1', title: 'Availability', requirement: 'Systems must be available for operation and use as committed, with performance monitoring and incident response.' }
      ],
      ISO27001: [
        { id: 'A.5', title: 'Information security policies', requirement: 'Information security policy must be defined, approved by management, and communicated to employees.' },
        { id: 'A.6', title: 'Organization of information security', requirement: 'Roles, responsibilities, and segregation of duties for information security must be defined.' },
        { id: 'A.9', title: 'Access control', requirement: 'Access to information and systems must be restricted based on business and security requirements.' },
        { id: 'A.12', title: 'Operations security', requirement: 'Operating procedures must be documented, and systems protected against malware and data loss.' },
        { id: 'A.16', title: 'Information security incident management', requirement: 'Incidents must be reported, assessed, and responded to in a consistent and effective manner.' },
        { id: 'A.18', title: 'Compliance', requirement: 'Comply with legal, statutory, regulatory, and contractual requirements related to information security.' }
      ],
      DPDP: [
        { id: 'S.4', title: 'Lawful processing of personal data', requirement: 'Personal data may only be processed for a lawful purpose for which the Data Principal has given consent or for certain legitimate uses.' },
        { id: 'S.6', title: 'Notice to Data Principal', requirement: 'Data Fiduciary must provide clear notice about data collected, purpose of processing, and Data Principal rights.' },
        { id: 'S.8', title: 'General obligations of Data Fiduciary', requirement: 'Must ensure accuracy, completeness, and consistency of data; implement security safeguards; and notify breaches to the Board.' },
        { id: 'S.9', title: 'Processing of personal data of children', requirement: 'Must obtain verifiable parental consent before processing data of children under 18.' },
        { id: 'S.10', title: 'Significant Data Fiduciary obligations', requirement: 'Significant Data Fiduciaries must appoint a Data Protection Officer, conduct audits, and perform DPIAs.' },
        { id: 'S.13', title: 'Right to erasure', requirement: 'Data Principal has the right to erasure of personal data upon withdrawal of consent or where purpose has been served.' }
      ]
    };
    return clauses[regulation] || clauses.GDPR;
  }

  // ─── STEP 3: Reason Gaps ────────────────────────────────────────────────────
  async step3_reasonGaps(parsedPolicy, clauses, regulation) {
    const clauseSummary = clauses.map(c => `${c.id} — ${c.title}: ${c.requirement}`).join('\n');

    const prompt = `You are a senior compliance auditor performing clause-by-clause gap analysis.

REGULATION: ${regulation}
REGULATION CLAUSES:
${clauseSummary}

COMPANY POLICY ANALYSIS:
- Company type: ${parsedPolicy.companyType}
- Data types handled: ${(parsedPolicy.dataTypes || []).join(', ')}
- Controls in place: ${(parsedPolicy.controls || []).join(', ')}
- Topics covered: ${(parsedPolicy.topics || []).join(', ')}
- Obvious gaps: ${(parsedPolicy.gaps || []).join(', ')}

For EACH clause, determine if there is a gap. Return JSON array (no markdown):
[
  {
    "clauseId": "string",
    "clauseTitle": "string",
    "hasGap": true/false,
    "gapDescription": "specific description of what is missing or inadequate",
    "evidence": "what in the policy (or absence of it) shows this gap",
    "rawSeverity": "critical|high|medium|low|pass"
  }
]

Be specific. If a control is partially present, note that. Only flag real gaps.`;

    const result = await this.callFoundry(prompt, 1500);
    try {
      const parsed = JSON.parse(result.replace(/```json|```/g, '').trim());
      return parsed.filter(g => g.hasGap);
    } catch {
      logger.error('Failed to parse gap analysis JSON');
      return [];
    }
  }

  // ─── STEP 4: Score Findings ─────────────────────────────────────────────────
  async step4_scoreFindings(gapAnalysis, regulation) {
    if (gapAnalysis.length === 0) return [];

    const prompt = `You are a compliance risk scoring specialist. Score and enrich these compliance gaps for ${regulation}.

GAPS TO SCORE:
${JSON.stringify(gapAnalysis, null, 2)}

For each gap, return a JSON array (no markdown):
[
  {
    "clauseId": "string",
    "clauseTitle": "string",
    "severity": "critical|high|medium|low",
    "title": "short, clear gap title (max 8 words)",
    "description": "2-3 sentence explanation of the gap and why it matters for ${regulation} compliance",
    "fineExposure": "estimated fine range or regulatory consequence",
    "action": "specific, actionable remediation step the company should take",
    "deadline": "Immediate|Within 30 days|Within 90 days|Within 6 months"
  }
]

Scoring guidance:
- critical: directly violates core requirement, immediate fine/breach risk
- high: significant gap, likely to fail an audit
- medium: partial compliance, needs improvement
- low: best practice gap, low immediate risk`;

    const result = await this.callFoundry(prompt, 1500);
    try {
      return JSON.parse(result.replace(/```json|```/g, '').trim());
    } catch {
      return gapAnalysis.map(g => ({
        clauseId: g.clauseId,
        clauseTitle: g.clauseTitle,
        severity: g.rawSeverity || 'medium',
        title: g.clauseTitle,
        description: g.gapDescription,
        fineExposure: 'Unknown',
        action: 'Review and address this compliance gap',
        deadline: 'Within 90 days'
      }));
    }
  }

  // ─── STEP 5: Generate Report ─────────────────────────────────────────────────
  async step5_generateReport(findings, regulation, parsedPolicy) {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const sorted = findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    const stats = {
      critical: sorted.filter(f => f.severity === 'critical').length,
      high: sorted.filter(f => f.severity === 'high').length,
      medium: sorted.filter(f => f.severity === 'medium').length,
      low: sorted.filter(f => f.severity === 'low').length,
      passed: 0
    };

    // Score: start at 100, deduct per severity
    const score = Math.max(0, 100 - (stats.critical * 20) - (stats.high * 10) - (stats.medium * 5) - (stats.low * 2));
    stats.passed = Math.max(0, 9 - sorted.length);

    // Build prioritized action plan
    const actionPlan = sorted.slice(0, 5).map((f, i) => ({
      priority: i + 1,
      title: f.title,
      detail: f.action,
      deadline: f.deadline,
      clauseRef: f.clauseId
    }));

    const summaryPrompt = `Write a 2-sentence executive summary for a ${regulation} compliance report with score ${score}/100.
Stats: ${stats.critical} critical, ${stats.high} high, ${stats.medium} medium gaps found.
Company type: ${parsedPolicy.companyType}.
Be direct and professional. Return only the 2 sentences, no formatting.`;

    const summary = await this.callFoundry(summaryPrompt, 200);

    return {
      regulation,
      overallScore: score,
      summary: summary.trim(),
      stats,
      findings: sorted,
      actionPlan,
      generatedAt: new Date().toISOString(),
      companyProfile: parsedPolicy
    };
  }

  // ─── Azure Foundry API Call ──────────────────────────────────────────────────
  async callFoundry(prompt, maxTokens = 1000) {
    // If Azure Foundry credentials are available, use them
    if (this.foundryEndpoint && this.foundryApiKey) {
      try {
        const response = await axios.post(
          `${this.foundryEndpoint}openai/deployments/${this.deployment}/chat/completions?api-version=2024-02-15-preview`,
          {
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
            temperature: 0.2
          },
          {
            headers: {
              'api-key': this.foundryApiKey,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          }
        );
        return response.data.choices[0].message.content;
      } catch (err) {
        logger.warn('Foundry API failed, falling back to Anthropic:', err.message);
      }
    }

    // Fallback to Anthropic API (for development/demo)
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01'
        },
        timeout: 30000
      }
    );
    return response.data.content.map(c => c.text || '').join('');
  }
}

module.exports = { ComplianceReasoningAgent };
