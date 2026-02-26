# AI-ASSISTED CYBERSECURITY RISK ASSESSMENT & SECURITY AUDIT PLATFORM

> A professional Governance, Risk, and Compliance (GRC) platform built to automate cybersecurity risk analysis and audit verification using the OCTAVE Allegro methodology, enhanced by Artificial Intelligence.

---

## 👥 Meet the Team

| NIM | Name | Email |
| :--- | :--- | :--- |
| 001202400138 | **WISNU ALFIAN NUR ASHAR** | wisnualfian117@gmail.com |
| 001202400034 | **MUHAMMAD ILHAM MAULANA** | ilham36677@gmail.com |
| 001202400079 | **CHRISTOFER SOFIAN RIALDI SITOMPUL** | refotsirhc2@gmail.com |
| 001202400081 | **MUHAMMAD AHDA BRILIANTAMA** | muhahdabriliantama01@gmail.com |
| 001202400043 | **RAFA BASIA HANIF** | - | rafabasia2208@gmail.com

---

## 🎯 Project Overview

This platform is designed to assist cybersecurity auditors in two major activities: **Risk Assessment** (identifying risks) and **Security Audit** (verifying controls). By utilizing the **OCTAVE Allegro** framework, it ensures that organizations can move beyond simple claims of security towards evidence-based compliance.

---

## 🛠️ Core Modules (The 11 Pillars)

### 1. User & Auditor Management
- **Role-Based Access Control (RBAC)**: Distinct permissions for **Administrators**, **Auditors**, and **Auditees**.
- **Secure Access**: Profile management and session monitoring to ensure system integrity.

### 2. Organization Profile
- **Asset Scope**: Definition of organizational boundaries and objectives.
- **Exposure Level**: Automated calculation of organizational risk exposure based on industry and size.

### 3. Asset Inventory
- **Critical Asset Identification**: Comprehensive database of information assets (Data, Systems, People, Containers).
- **CIA Valuations**: Assignment of **Confidentiality, Integrity, and Availability** values to each asset.
- **Criticality Scoring**: Weighted scoring system to prioritize high-value assets.

### 4. Threat & Vulnerability Identification
- **OWASP Library**: Pre-populated library of **19 critical vulnerabilities** (SQL Injection, IDOR, Broken Authentication, etc.).
- **Smart Mapping**: Logical mapping between technical vulnerabilities and business assets.

### 5. Risk Assessment Engine
- **Likelihood x Impact**: Automated calculation of risk scores across Financial, Reputational, Legal, and Operational domains.
- **Risk Matrix**: Dynamic visualization of the organization's risk landscape (Heatmap).
- **OCTAVE Allegro Lifecycle**: Guided 8-step wizard for thorough risk profiling.

### 6. Control Audit Checklist
- **Framework Compliance**: Automated checklist generation based on OCTAVE Allegro security controls.
- **Vulnerability-Triggered Controls**: Specific audit items are automatically added when certain vulnerabilities are detected.

### 7. Evidence Collection
- **Audit Verification**: Secure storage for files (PDF, JPG, PNG, DOCX) serving as proof of control implementation.
- **Direct Mapping**: Link evidence directly to specific audit checklist items for easy retrieval.

### 8. Compliance Scoring
- **Automated Calculation**: Real-time compliance percentage tracking.
- **Category Breakdown**: Visualization of compliance health across different security domains.

### 9. Audit Findings Generation
- **Automated Findings**: The system detects non-compliant controls and automatically drafts audit findings.
- **Severity Classification**: Findings are categorized from Low to Critical for immediate management attention.

### 10. AI Auditor Assistant
- **Gemini AI Integration**: Autonomous security advisor providing technical remediation steps.
- **Technical translation**: AI translates complex technical gaps into management-friendly language.
- **Mitigation Recommender**: Intelligent suggestions for risk treatment plans.

### 11. Report Generation
- **Professional Exports**: One-click generation of professional reports in **PDF, DOCX, and CSV**.
- **Executive & Technical Views**: Summarized reports for management and detailed findings for technical teams.

---

## 🚀 Technology Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14, React, Tailwind CSS |
| **UI Library** | shadcn/ui, Radix UI, Framer Motion |
| **Backend** | Supabase (PostgreSQL, Auth, Storage) |
| **AI Engine** | Google Gemini Pro |
| **Reporting** | jsPDF, AutoTable, Docx Generator |
| **Icons & Charts** | Lucide React, Recharts |

---

## 📝 Compliance & Methodology

The system is strictly aligned with:
- **OCTAVE Allegro**: The primary framework for information security risk assessment.
- **OWASP Top 10**: Integrated vulnerability library and control mapping.
- **GRC Principles**: Automated Governance, Risk, and Compliance workflows.

---

## 📥 Getting Started

1. **Clone & Install**: `npm install`
2. **Configure Environment**: Set up your Supabase and Gemini API keys in `.env.local`.
3. **Run Platform**: `npm run dev`
4. **Initialize Database**: Execute the SQL scripts in the `sql/` directory starting with `schema.sql`.

---

© 2026 Risk Shield System - **Team Final Project**
