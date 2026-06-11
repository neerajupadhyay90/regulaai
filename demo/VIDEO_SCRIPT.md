# RegulaAI — Demo Video Script
## Microsoft Agents League Hackathon 2026 | 3-Minute Demo

---

### SCENE 1 — THE HOOK (0:00–0:30)
**[Screen: Black screen, then slowly fade into a news headline about a GDPR fine]*

**Voiceover (you, confident and direct):**
> "Amazon — $887 million fine. Meta — $1.3 billion. WhatsApp — $266 million.
> All GDPR violations. All preventable.
> But here's the thing — most companies aren't Amazon.
> They're 10-person startups. 50-person SaaS companies.
> They can't afford a $50,000 law firm compliance audit.
> We built RegulaAI to fix that."

**[Screen: Cut to RegulaAI landing page]*

---

### SCENE 2 — WHAT IT IS (0:30–0:50)
**[Screen: Landing page hero visible]*

**Voiceover:**
> "RegulaAI is an autonomous reasoning agent that reads your company's policy document
> and performs a clause-by-clause compliance analysis against GDPR, HIPAA, SOC 2,
> ISO 27001, or India's DPDP Act.
> Not a chatbot. Not a summarizer.
> A five-step reasoning pipeline powered by Azure AI Foundry and Microsoft Fabric IQ."

**[Screen: Quick animation showing the 5 steps]*

---

### SCENE 3 — LIVE DEMO (0:50–2:20)
**[Screen: Navigate to /app — the analysis interface]*

**Voiceover:**
> "Let me show you. I have a real sample policy document from a hypothetical SaaS company —
> they operate in India but serve EU users."

**[Action: Select GDPR regulation — click it on screen]*

**Voiceover:**
> "I'll analyze it against GDPR — since they have EU users."

**[Action: Upload sample-policy.txt — drag and drop it dramatically]*

**Voiceover:**
> "I'm dropping their privacy policy here. Hit Analyze."

**[Action: Click Analyze button — watch the step indicator animate]*

**Voiceover (while loading):**
> "Watch the reasoning pipeline run.
> Step one — the agent parses and structures the document.
> Step two — it queries Microsoft Fabric, where we've stored all 99 GDPR articles as embeddings.
> Step three — clause-by-clause comparison.
> Step four — severity scoring.
> Step five — action plan generation."

**[Screen: Report appears — score: 38/100]*

**Voiceover:**
> "38 out of 100. Three critical violations."

**[Action: Scroll slowly through findings — pause on Art.37 DPO finding]*

**Voiceover:**
> "Article 37 — no Data Protection Officer appointed. That's a mandatory requirement
> when you process EU user data at scale.
> Fine exposure: up to €10 million.
> Remediation: appoint an external DPO service."

**[Action: Scroll to Art.6 finding — advertising data sharing]*

**Voiceover:**
> "Article 6 — they're sharing behavioral data with advertising partners
> but have no documented lawful basis. That's a direct violation.
> Fine exposure: up to €20 million — 4% of global turnover."

**[Action: Scroll to Action Plan section]*

**Voiceover:**
> "And here's the action plan — five prioritized steps with deadlines.
> This is what you'd hand to your legal team or engineering lead tomorrow morning."

---

### SCENE 4 — THE ARCHITECTURE (2:20–2:45)
**[Screen: Switch to a simple architecture diagram slide]*

**Voiceover:**
> "Under the hood: the reasoning agent is orchestrated through Azure AI Foundry — Foundry IQ.
> The regulation clause library — all five frameworks, 50+ clauses — is stored as vector embeddings
> in Microsoft Fabric, queried via semantic search. That's Fabric IQ.
> Reports are persisted in Azure Cosmos DB.
> The whole stack deploys to Azure Container Apps with one command."

---

### SCENE 5 — THE CLOSE (2:45–3:00)
**[Screen: Back to the report, score visible]*

**Voiceover:**
> "Compliance intelligence shouldn't be a luxury.
> A 10-person startup in Delhi deserves the same legal-grade risk visibility as a Fortune 500.
> That's why we built RegulaAI.
> Upload your policy. Know your risk. Fix it before the fine."

**[Screen: RegulaAI logo + GitHub link + hackathon badge]*

---

## Recording Tips

- **Resolution:** 1920×1080, 60fps
- **Tool:** Use OBS Studio (free) or Loom
- **Browser:** Chrome, zoom to 90% so UI fits cleanly
- **Mic:** Use a headset or external mic — audio quality matters more than video
- **Speed:** Speak slowly — you know the product, judges don't
- **Cursor:** Move deliberately, pause on key elements
- **Length:** Hard cap at 3:00 — judges watch hundreds, respect their time

## What NOT to do
- Don't spend more than 20 seconds on tech stack slides
- Don't show code — show the working product
- Don't apologize for anything ("this is just a prototype...")
- Don't read the screen — describe what's happening and why it matters
