# Contributing to RegulaAI

Thank you for your interest! We're actively looking for collaborators during the Agents League Hackathon (deadline June 14, 2026).

## Quick setup

```bash
git clone https://github.com/YOUR_USERNAME/regulaai.git
cd regulaai
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cd backend && npm install && npm run dev &
cd ../frontend && npm install && npm run dev
```

Open http://localhost:5173

## What we need most

| Area | Priority | Skills |
|---|---|---|
| Azure Foundry integration | 🔴 High | Azure AI, Node.js |
| Microsoft Fabric setup | 🔴 High | Azure Fabric, Python |
| GDPR/HIPAA domain review | 🟡 Medium | Legal/compliance knowledge |
| UI polish | 🟢 Low | React, Tailwind |
| More regulation frameworks | 🟢 Low | Legal research |

## How to contribute

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Make changes + write tests
4. Submit a PR with a clear description

## Folder structure

```
backend/src/agents/     ← Core reasoning logic (most impactful)
backend/src/config/     ← Foundry + Fabric integration
frontend/src/pages/     ← UI pages
frontend/src/components/← Reusable components
demo/                   ← Sample data and scripts
scripts/                ← Setup and deployment scripts
```

## Questions?

Join the [Agents League Discord](https://aka.ms/agentsleague/discord) and ping us!
