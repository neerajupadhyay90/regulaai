#!/usr/bin/env python3
"""
RegulaAI — Microsoft Fabric IQ Setup Script
Seeds regulation clause embeddings into Fabric Lakehouse for RAG-powered analysis.

Requirements:
  pip install azure-identity requests pandas pyarrow

Usage:
  python scripts/setup-fabric.py

Environment variables required:
  FABRIC_WORKSPACE_ID
  FABRIC_LAKEHOUSE_ID
  AZURE_CLIENT_ID (or use az login)
  AZURE_TENANT_ID
  AZURE_CLIENT_SECRET
"""

import os
import json
import requests
import pandas as pd
from datetime import datetime

# ─── Regulation Clause Data ────────────────────────────────────────────────────
REGULATION_CLAUSES = {
    "GDPR": [
        {"id": "Art.5", "title": "Principles of data processing", "requirement": "Data must be processed lawfully, fairly, transparently, for specified purposes, minimised, accurate, kept no longer than necessary, and protected.", "category": "core_principles", "fine_tier": "high"},
        {"id": "Art.6", "title": "Lawful basis for processing", "requirement": "Processing requires a valid legal basis: consent, contract, legal obligation, vital interests, public task, or legitimate interests.", "category": "lawful_basis", "fine_tier": "high"},
        {"id": "Art.7", "title": "Conditions for consent", "requirement": "Consent must be freely given, specific, informed, and unambiguous. Withdrawal must be as easy as giving consent.", "category": "consent", "fine_tier": "high"},
        {"id": "Art.13", "title": "Privacy notice transparency", "requirement": "Data subjects must be informed about controller identity, purposes, legal basis, retention periods, and their rights at time of collection.", "category": "transparency", "fine_tier": "medium"},
        {"id": "Art.17", "title": "Right to erasure", "requirement": "Data subjects have the right to request deletion of their personal data under specific circumstances. Must respond within 30 days.", "category": "data_rights", "fine_tier": "medium"},
        {"id": "Art.25", "title": "Data protection by design and default", "requirement": "Privacy must be embedded into systems from the start, with maximum privacy settings as default.", "category": "technical_measures", "fine_tier": "medium"},
        {"id": "Art.32", "title": "Security of processing", "requirement": "Appropriate technical and organisational measures to ensure data security, including encryption, pseudonymisation, and access controls.", "category": "security", "fine_tier": "medium"},
        {"id": "Art.33", "title": "Breach notification to authority", "requirement": "Personal data breaches must be reported to supervisory authority within 72 hours of becoming aware.", "category": "breach_response", "fine_tier": "medium"},
        {"id": "Art.35", "title": "Data Protection Impact Assessment", "requirement": "DPIA required for high-risk processing activities, especially involving new technologies or large-scale sensitive data.", "category": "risk_assessment", "fine_tier": "medium"},
        {"id": "Art.37", "title": "Data Protection Officer appointment", "requirement": "DPO must be appointed for public authorities, large-scale systematic monitoring, or large-scale sensitive data processing.", "category": "governance", "fine_tier": "medium"},
        {"id": "Art.44", "title": "International data transfers", "requirement": "Personal data may only be transferred to third countries with adequate protection, SCCs, or other approved mechanisms.", "category": "data_transfers", "fine_tier": "high"},
    ],
    "HIPAA": [
        {"id": "164.308(a)(1)", "title": "Security management process", "requirement": "Implement policies and procedures to prevent, detect, contain, and correct security violations.", "category": "administrative", "fine_tier": "high"},
        {"id": "164.308(a)(3)", "title": "Workforce security", "requirement": "Implement policies to ensure workforce members have appropriate access to ePHI and prevent unauthorized access.", "category": "access_control", "fine_tier": "medium"},
        {"id": "164.308(a)(5)", "title": "Security awareness training", "requirement": "Implement security awareness and training program for all workforce members.", "category": "training", "fine_tier": "medium"},
        {"id": "164.308(a)(6)", "title": "Security incident procedures", "requirement": "Implement policies and procedures to address security incidents and document response.", "category": "incident_response", "fine_tier": "medium"},
        {"id": "164.310", "title": "Physical safeguards", "requirement": "Implement physical measures to protect electronic information systems and equipment from unauthorized access.", "category": "physical", "fine_tier": "medium"},
        {"id": "164.312(a)(1)", "title": "Access control", "requirement": "Implement technical policies to allow only authorized persons to access ePHI systems.", "category": "technical", "fine_tier": "high"},
        {"id": "164.312(b)", "title": "Audit controls", "requirement": "Implement hardware, software, and procedural mechanisms that record and examine activity in ePHI systems.", "category": "audit", "fine_tier": "medium"},
        {"id": "164.312(e)(1)", "title": "Transmission security", "requirement": "Implement technical security measures to guard against unauthorized access to ePHI transmitted over networks.", "category": "encryption", "fine_tier": "high"},
        {"id": "164.524", "title": "Access of individuals to PHI", "requirement": "Individuals have the right to access and obtain copies of their PHI within 30 days of request.", "category": "patient_rights", "fine_tier": "medium"},
        {"id": "164.530(b)", "title": "Workforce training", "requirement": "Train all workforce members on privacy policies and procedures as needed for them to carry out their functions.", "category": "training", "fine_tier": "medium"},
    ],
    "SOC2": [
        {"id": "CC1.1", "title": "COSO Principle 1 — Integrity and values", "requirement": "The entity demonstrates a commitment to integrity and ethical values.", "category": "control_environment", "fine_tier": "low"},
        {"id": "CC2.1", "title": "Communication of objectives", "requirement": "The entity communicates objectives and changes affecting internal control to personnel.", "category": "communication", "fine_tier": "low"},
        {"id": "CC6.1", "title": "Logical access security", "requirement": "Restrict logical access to systems to authorized users based on least privilege.", "category": "access_control", "fine_tier": "high"},
        {"id": "CC6.2", "title": "Authentication", "requirement": "Prior to issuing credentials, user identity is registered and authenticated.", "category": "authentication", "fine_tier": "high"},
        {"id": "CC6.6", "title": "Logical access boundaries", "requirement": "Implement controls to protect against threats from sources outside the boundaries of the system.", "category": "network_security", "fine_tier": "high"},
        {"id": "CC7.1", "title": "System monitoring", "requirement": "Detect and monitor for configuration and vulnerability management on an ongoing basis.", "category": "monitoring", "fine_tier": "medium"},
        {"id": "CC7.2", "title": "Anomaly detection", "requirement": "Monitor system components for anomalies that are indicative of malicious acts or errors.", "category": "monitoring", "fine_tier": "medium"},
        {"id": "CC7.4", "title": "Security incident response", "requirement": "Respond to identified security incidents by executing defined incident response programs.", "category": "incident_response", "fine_tier": "medium"},
        {"id": "CC8.1", "title": "Change management", "requirement": "Authorize, design, develop, test, and approve changes to infrastructure and software before implementation.", "category": "change_management", "fine_tier": "medium"},
        {"id": "A1.1", "title": "Capacity management", "requirement": "Maintain availability commitments and system performance through capacity management.", "category": "availability", "fine_tier": "medium"},
    ],
    "ISO27001": [
        {"id": "A.5.1", "title": "Information security policies", "requirement": "Define and approve information security policies, communicate to employees and relevant parties.", "category": "policies", "fine_tier": "medium"},
        {"id": "A.6.1", "title": "Internal organization", "requirement": "Define roles, responsibilities, and authorities for information security within the organization.", "category": "organization", "fine_tier": "low"},
        {"id": "A.8.1", "title": "Asset management", "requirement": "Identify information assets and define appropriate protection responsibilities.", "category": "assets", "fine_tier": "medium"},
        {"id": "A.9.1", "title": "Access control policy", "requirement": "Establish, document, and review access control policy based on business and security requirements.", "category": "access_control", "fine_tier": "high"},
        {"id": "A.9.4", "title": "System and application access control", "requirement": "Prevent unauthorized access to systems and applications through access restriction and secure logon procedures.", "category": "access_control", "fine_tier": "high"},
        {"id": "A.12.1", "title": "Operational procedures and responsibilities", "requirement": "Document, implement, and maintain operating procedures for information processing facilities.", "category": "operations", "fine_tier": "medium"},
        {"id": "A.12.6", "title": "Technical vulnerability management", "requirement": "Obtain timely information about technical vulnerabilities, assess exposure, and take appropriate action.", "category": "vulnerability_management", "fine_tier": "high"},
        {"id": "A.16.1", "title": "Information security incident management", "requirement": "Establish responsibilities and procedures for consistent and effective management of security incidents.", "category": "incident_management", "fine_tier": "medium"},
        {"id": "A.17.1", "title": "Business continuity planning", "requirement": "Determine requirements for information security and continuity of information security management.", "category": "business_continuity", "fine_tier": "medium"},
        {"id": "A.18.1", "title": "Compliance with legal requirements", "requirement": "Identify and document relevant legal, regulatory, and contractual requirements for information security.", "category": "compliance", "fine_tier": "medium"},
    ],
    "DPDP": [
        {"id": "S.4", "title": "Lawful processing of personal data", "requirement": "Personal data may only be processed for a lawful purpose for which the Data Principal has given consent or for specified legitimate uses.", "category": "lawful_basis", "fine_tier": "high"},
        {"id": "S.5", "title": "Notice to Data Principal", "requirement": "Before seeking consent, provide a notice specifying personal data to be collected, purpose of processing, and how to exercise rights.", "category": "transparency", "fine_tier": "medium"},
        {"id": "S.6", "title": "Consent requirements", "requirement": "Consent must be free, specific, informed, unconditional, and unambiguous with a clear affirmative action.", "category": "consent", "fine_tier": "high"},
        {"id": "S.8(1)", "title": "Data accuracy obligation", "requirement": "Data Fiduciary must ensure completeness, accuracy, and consistency of personal data used for decisions affecting the individual.", "category": "data_quality", "fine_tier": "medium"},
        {"id": "S.8(2)", "title": "Security safeguards", "requirement": "Implement appropriate technical and organisational measures to ensure reasonable security of personal data.", "category": "security", "fine_tier": "high"},
        {"id": "S.8(3)", "title": "Breach notification", "requirement": "Notify the Data Protection Board and affected Data Principals in the event of a personal data breach.", "category": "breach_response", "fine_tier": "high"},
        {"id": "S.9", "title": "Processing of children's data", "requirement": "Obtain verifiable parental consent before processing personal data of children under 18.", "category": "children", "fine_tier": "high"},
        {"id": "S.10", "title": "Significant Data Fiduciary obligations", "requirement": "Significant Data Fiduciaries must appoint a DPO, conduct Data Audits, and perform Data Protection Impact Assessments.", "category": "governance", "fine_tier": "medium"},
        {"id": "S.12", "title": "Right to information", "requirement": "Data Principal has right to obtain summary of personal data being processed and a list of Data Fiduciaries it has been shared with.", "category": "data_rights", "fine_tier": "medium"},
        {"id": "S.13", "title": "Right to correction and erasure", "requirement": "Data Principal has right to correction, completion, updating, and erasure of personal data where purpose has been served.", "category": "data_rights", "fine_tier": "medium"},
    ]
}

def get_access_token():
    """Get Azure access token for Fabric API"""
    tenant_id = os.environ.get("AZURE_TENANT_ID")
    client_id = os.environ.get("AZURE_CLIENT_ID")
    client_secret = os.environ.get("AZURE_CLIENT_SECRET")

    if not all([tenant_id, client_id, client_secret]):
        print("⚠️  Azure credentials not set. Skipping Fabric upload.")
        print("   Set: AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET")
        return None

    url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
    response = requests.post(url, data={
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret,
        "scope": "https://api.fabric.microsoft.com/.default"
    })
    response.raise_for_status()
    return response.json()["access_token"]


def flatten_clauses():
    """Flatten all regulation clauses into a single list"""
    rows = []
    for regulation, clauses in REGULATION_CLAUSES.items():
        for clause in clauses:
            rows.append({
                "regulation": regulation,
                "clause_id": clause["id"],
                "title": clause["title"],
                "requirement": clause["requirement"],
                "category": clause["category"],
                "fine_tier": clause["fine_tier"],
                "created_at": datetime.utcnow().isoformat()
            })
    return rows


def save_local_json():
    """Save clauses locally as JSON for development use"""
    rows = flatten_clauses()
    output_path = "demo/regulation-clauses.json"
    with open(output_path, "w") as f:
        json.dump(rows, f, indent=2)
    print(f"✅ Saved {len(rows)} clauses to {output_path}")
    return rows


def upload_to_fabric(rows, token):
    """Upload clause data to Microsoft Fabric Lakehouse"""
    workspace_id = os.environ.get("FABRIC_WORKSPACE_ID")
    lakehouse_id = os.environ.get("FABRIC_LAKEHOUSE_ID")

    if not workspace_id or not lakehouse_id:
        print("⚠️  FABRIC_WORKSPACE_ID or FABRIC_LAKEHOUSE_ID not set. Skipping upload.")
        return

    print(f"📤 Uploading {len(rows)} clauses to Microsoft Fabric...")

    df = pd.DataFrame(rows)

    # Fabric Lakehouse REST API endpoint for table creation
    endpoint = f"https://api.fabric.microsoft.com/v1/workspaces/{workspace_id}/lakehouses/{lakehouse_id}/tables/regulation_clauses/rows"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Upload in batches of 50
    batch_size = 50
    for i in range(0, len(rows), batch_size):
        batch = rows[i:i+batch_size]
        response = requests.post(endpoint, json={"rows": batch}, headers=headers)
        if response.status_code in [200, 201]:
            print(f"  ✅ Batch {i//batch_size + 1}: {len(batch)} rows uploaded")
        else:
            print(f"  ❌ Batch {i//batch_size + 1} failed: {response.status_code} — {response.text}")

    print("✅ Fabric upload complete!")


def main():
    print("🛡️  RegulaAI — Fabric IQ Setup Script")
    print("=" * 50)

    # Count clauses
    total = sum(len(v) for v in REGULATION_CLAUSES.values())
    print(f"📋 Preparing {total} regulation clauses across {len(REGULATION_CLAUSES)} frameworks")

    # Always save locally
    rows = save_local_json()

    # Try Fabric upload
    token = get_access_token()
    if token:
        upload_to_fabric(rows, token)
    else:
        print("\n💡 To upload to Fabric, set Azure credentials and re-run.")
        print("   Local JSON saved to demo/regulation-clauses.json for development use.")

    print("\n✅ Setup complete!")
    print("   The backend will use local clauses as fallback when Fabric is unavailable.")


if __name__ == "__main__":
    main()
