# RegulaAI — Autonomous Compliance Reasoning Agent

> **Upload your policy. Know your risk. Fix it before the fine.**

[![Agents League Hackathon](https://img.shields.io/badge/Microsoft-Agents%20League%202026-6366f1?style=flat-square&logo=microsoft)](https://innovationstudio.microsoft.com/hackathons/Agents-League-Hackathon)
[![Track](https://img.shields.io/badge/Track-Reasoning%20Agents-blue?style=flat-square)](https://innovationstudio.microsoft.com)
[![IQ](https://img.shields.io/badge/Microsoft%20IQ-Foundry%20%2B%20Fabric-0078d4?style=flat-square&logo=azure)](https://aka.ms/iq-series)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)

---

## What is RegulaAI?

RegulaAI is an autonomous multi-step compliance reasoning agent that ingests a company's internal policy documents and performs clause-by-clause analysis against major regulatory frameworks — **GDPR, HIPAA, SOC 2 Type II, ISO 27001, and India's DPDP Act 2023**.

A compliance audit that costs **$15,000–$50,000** and takes **2–4 weeks** at a law firm can be completed in under **60 seconds** — with full transparency into every finding and its regulatory basis.

---

## Demo

![RegulaAI Demo](./docs/demo-screenshot.png)

**[▶ Watch Demo Video](https://your-demo-link-here)**

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     RegulaAI System                      │
│                                                          │
│  ┌──────────────┐     ┌─────────────────────────────┐   │
│  │   React UI   │────▶│      Node.js Backend         │   │
│  │  (Frontend)  │     │   (Express + REST API)        │   │
│  └──────────────┘     └────────────┬────────────────┘   │
│                                    │                      │
│              ┌─────────────────────┼──────────────────┐  │
│              │                     │                   │  │
│              ▼                     ▼                   ▼  │
│  ┌──────────────────┐  ┌─────────────────┐  ┌───────────┐│
│  │  Azure AI Foundry│  │ Microsoft Fabric │  │  Azure    ││
│  │   (Foundry IQ)   │  │   (Fabric IQ)    │  │  Cosmos   ││
│  │                  │  │                  │  │    DB     ││
│  │ • Agent Loop     │  │ • Reg Embeddings │  │ • Reports ││
│  │ • Reasoning      │  │ • Vector Search  │  │ • History ││
│  │ • Orchestration  │  │ • RAG Pipeline   │  │           ││
│  └──────────────────┘  └─────────────────┘  └───────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## Features

- **Multi-step Reasoning Pipeline** — Not a single prompt. The agent plans, retrieves, reasons, and scores across multiple stages.
- **5 Regulatory Frameworks** — GDPR, HIPAA, SOC 2 Type II, ISO 27001, DPDP Act 2023
- **Severity Scoring** — Every finding rated Critical / High / Medium / Low based on fine exposure and breach likelihood
- **RAG-powered Analysis** — Full regulation texts stored as embeddings in Microsoft Fabric for precise clause matching
- **Actionable Reports** — Prioritized action plan with specific steps, deadlines, and article references
- **Export Ready** — Download reports as PDF or JSON for legal/engineering teams

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS, Vite |
| Backend | Node.js, Express.js |
| AI Orchestration | Azure AI Foundry (Foundry IQ) |
| Vector Store | Microsoft Fabric (Fabric IQ) |
| Database | Azure Cosmos DB |
| Document Parsing | pdf-parse, mammoth (DOCX) |
| Deployment | Azure Container Apps |

---

## Quick Start

### Prerequisites
- Node.js 18+
- Azure account with AI Foundry access
- Microsoft Fabric workspace

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/regulaai.git
cd regulaai
```

### 2. Install dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Configure environment
```bash
# Backend
cp backend/.env.example backend/.env
# Fill in your Azure credentials (see Configuration section)

# Frontend
cp frontend/.env.example frontend/.env
```

### 4. Run locally
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Configuration

### Backend `.env`
```env
# Azure AI Foundry (Foundry IQ)
AZURE_FOUNDRY_ENDPOINT=https://your-project.openai.azure.com/
AZURE_FOUNDRY_API_KEY=your_foundry_api_key
AZURE_FOUNDRY_DEPLOYMENT=gpt-4o

# Microsoft Fabric (Fabric IQ)
FABRIC_WORKSPACE_ID=your_workspace_id
FABRIC_LAKEHOUSE_ID=your_lakehouse_id
FABRIC_API_KEY=your_fabric_api_key

# Azure Cosmos DB
COSMOS_CONNECTION_STRING=your_cosmos_connection_string
COSMOS_DATABASE=regulaai
COSMOS_CONTAINER=reports

# App
PORT=3001
NODE_ENV=development
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:3001
```

---

## API Reference

### `POST /api/analyze`
Run a compliance analysis.

**Request:**
```json
{
  "regulation": "GDPR",
  "policyText": "string",
  "companyContext": "string (optional)"
}
```

**Response:**
```json
{
  "reportId": "uuid",
  "regulation": "GDPR",
  "overallScore": 62,
  "summary": "string",
  "stats": { "critical": 2, "high": 3, "medium": 2, "passed": 5 },
  "findings": [...],
  "actionPlan": [...],
  "generatedAt": "ISO timestamp"
}
```

### `GET /api/reports/:id`
Fetch a saved report by ID.

### `GET /api/health`
Health check endpoint.

---

## Microsoft IQ Integration

### Foundry IQ
Azure AI Foundry powers the multi-step reasoning agent loop:
- **Step 1**: Document parsing and intent extraction
- **Step 2**: Regulation retrieval via Fabric vector search
- **Step 3**: Clause-by-clause comparison reasoning
- **Step 4**: Severity scoring and gap identification
- **Step 5**: Action plan generation

### Fabric IQ
Microsoft Fabric stores and queries regulation texts:
- All 5 regulation frameworks are pre-chunked and embedded
- Vector similarity search matches policy clauses to relevant regulation articles
- Lakehouse stores historical reports and audit trails

---

## Project Structure

```
regulaai/
├── frontend/               # React app
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page views
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   └── package.json
├── backend/                # Express API
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── agents/         # Reasoning agent logic
│   │   ├── utils/          # Helpers (PDF parse, etc.)
│   │   └── config/         # Azure + Fabric config
│   ├── .env.example
│   └── package.json
├── docs/                   # Documentation & screenshots
├── .github/workflows/      # CI/CD
├── docker-compose.yml
└── README.md
```

---

## Roadmap

- [ ] Add SOX and PCI-DSS frameworks
- [ ] Slack / Teams integration for report delivery
- [ ] Scheduled re-analysis (policy drift detection)
- [ ] Multi-language support (Hindi, German, French)
- [ ] M365 Copilot plugin (Enterprise Agents track extension)

---

## Team

Built for the **Microsoft Agents League Hackathon 2026** (June 4–14).

- **Track**: Reasoning Agents
- **Microsoft IQ**: Foundry IQ + Fabric IQ
- **Motivation**: Compliance intelligence shouldn't be a luxury. Every team — regardless of size or budget — deserves legal-grade risk visibility.

---

## License

MIT © 2026 RegulaAI Team
