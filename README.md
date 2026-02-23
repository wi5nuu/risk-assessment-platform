# OCTAVE Allegro Risk Assessment Platform

> A full-stack, AI-assisted cybersecurity risk assessment platform built on the OCTAVE Allegro methodology. Designed for teams performing structured risk assessments, compliance audits, and security governance.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Role-Based Access Control](#role-based-access-control)
- [Available Scripts](#available-scripts)
- [Contributing](#contributing)

---

## Overview

This platform guides organizations through the 8-step **OCTAVE Allegro** risk assessment lifecycle — from establishing risk criteria to selecting mitigation approaches. It includes a full audit module for post-assessment compliance tracking, AI-powered advisory, and structured reporting.

---

## Features

### 🧙 8-Step OCTAVE Allegro Wizard
A guided, step-by-step assessment workflow:
| Step | Name |
|------|------|
| 1 | Establish Risk Measurement Criteria |
| 2 | Develop Information Asset Profiles |
| 3 | Identify Information Asset Containers |
| 4 | Identify Areas of Concern |
| 5 | Identify Threat Scenarios |
| 6 | Identify Risks |
| 7 | Analyze Risks |
| 8 | Select Mitigation Approach |

- Progress is auto-saved per step.
- On completion of Step 8, the project status is automatically set to `completed` and the user is redirected to the Audit Dashboard.

### 🔒 Audit & Compliance Module
After an assessment, a dedicated audit workspace provides:
- **Checklist**: OCTAVE Allegro-aligned control items, auto-populated. Auto-generated items are injected from detected vulnerabilities.
- **Evidence Upload**: Upload files per control item or for the entire checklist. Supports PDF, DOCX, XLSX, PNG, JPG, CSV, and TXT.
- **Compliance Dashboard**: Calculates and visualizes overall compliance scores by category.
- **Findings Management**: Document audit findings with severity, status, and recommendations. Auto-generate from non-compliant items.
- **AI Advisor**: Gemini-powered assistant for control guidance and risk recommendations.
- **Audit Report**: Exportable PDF report summarizing the audit, findings, and compliance posture.

### 🤖 AI-Powered Risk Analysis
- Integration with **Google Gemini** for risk narrative generation and remediation suggestions.
- Context-aware responses based on the organization's specific assets and threat scenarios.

### 📊 Risk Register
- Centralized register of all identified risks across projects.
- View risks by project, category, asset, and likelihood/impact scores.

### 🛡️ Role-Based Access Control (RBAC)
Three distinct user roles with granular permissions. See [Role-Based Access Control](#role-based-access-control).

### 👤 User & Organization Management (Admin)
- Admin panel for managing team members.
- Invite users, assign roles, and manage organization settings.

### 🔐 Authentication & Security
- Supabase Authentication with email/password.
- IP-based login change detection with security alerts.
- Role-specific welcome messages on login.
- Row Level Security (RLS) enforced at the database level.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS + `tailwindcss-animate` |
| **UI Components** | Radix UI + shadcn/ui |
| **Icons** | Lucide React |
| **Animations** | Framer Motion |
| **State Management** | Zustand |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |
| **Backend & Auth** | Supabase (PostgreSQL + Storage + Auth) |
| **AI** | Google Gemini (`@google/generative-ai`) |
| **PDF Export** | jsPDF + jspdf-autotable + html2canvas |
| **Notifications** | Sonner |
| **Testing** | Jest + jest-environment-jsdom |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin panel (user management, settings)
│   ├── ai-advisor/         # Standalone AI advisor page
│   ├── api/                # API routes (auth, AI, risk engine)
│   ├── audit/[projectId]/  # Audit workspace per project
│   ├── auth/               # Login, register, forgot password
│   ├── dashboard/          # Project dashboard (overview)
│   ├── projects/           # Project list and details
│   ├── risk-register/      # Consolidated risk register
│   ├── settings/           # User settings
│   └── wizard/[projectId]/ # 8-step OCTAVE Allegro wizard
│
├── components/
│   ├── audit/              # Audit module components
│   │   ├── AIAdvisor.tsx
│   │   ├── AuditChecklist.tsx
│   │   ├── AuditFindings.tsx
│   │   ├── AuditReport.tsx
│   │   ├── ComplianceDashboard.tsx
│   │   └── EvidenceUpload.tsx
│   ├── layout/             # Main app layout and navigation
│   ├── landing/            # Landing page sections
│   ├── risk/               # Risk matrix and scoring components
│   ├── ui/                 # shadcn/ui base components
│   └── wizard/             # Wizard container + 8 step components
│
├── hooks/
│   ├── useAuth.ts          # Auth state + RBAC helpers
│   └── ...
│
├── lib/
│   ├── risk-engine/        # Pure risk score calculation logic
│   └── supabase/           # Supabase client (browser + server)
│
├── types/
│   ├── database.ts         # Auto-generated Supabase types
│   └── index.ts            # Application-level types
│
sql/
├── schema.sql              # Full database schema
├── audit_module.sql        # Audit-specific tables
├── rls_fixes.sql           # Row Level Security policies
├── rbac_migration.sql      # RBAC role migration
└── fix_*.sql               # Incremental schema migrations
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- A [Supabase](https://supabase.com) project

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd risk-assessment-platform

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.local.example .env.local

# 4. Add your environment variables (see below)

# 5. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Environment Variables

Create a `.env.local` file in the root directory with the following:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Gemini AI
GOOGLE_GEMINI_API_KEY=your-gemini-api-key

# App URL (used for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ **Never commit `.env.local` to version control.** It is included in `.gitignore`.

---

## Database Setup

### Initial Setup

1. Go to your Supabase project → SQL Editor.
2. Run the schema files **in order**:

```sql
-- Run these in the Supabase SQL Editor:
-- 1. Main schema
\i sql/schema.sql

-- 2. Audit module tables
\i sql/audit_module.sql

-- 3. RLS policies
\i sql/rls_fixes.sql

-- 4. RBAC migration
\i sql/rbac_migration.sql
```

### Evidence Storage Bucket

Run `sql/fix_audit_evidence_checklist_relation.sql` to create the required storage bucket and apply evidence-related schema changes.

### Regenerate Types (after schema changes)

```bash
npm run db:generate
```

---

## Role-Based Access Control

The platform enforces three roles at both the application and database (RLS) level:

| Capability | Admin | Auditor | Auditee |
|-----------|:-----:|:-------:|:-------:|
| View projects & audit workspaces | ✅ | ✅ | ✅ |
| Run the OCTAVE Allegro Wizard | ✅ | ✅ | ❌ |
| Set compliance status on controls | ✅ | ✅ | ❌ |
| Write auditor comments | ❌ | ✅ | ❌ |
| Upload evidence files | ✅ | ✅ | ✅ |
| Manage audit findings | ✅ | ✅ | ❌ |
| Manage users & organization | ✅ | ❌ | ❌ |
| Generate audit reports | ✅ | ✅ | ✅ |

> Roles are enforced via the `useAuth` hook on the frontend and Supabase Row Level Security policies on the backend.

---

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run db:generate  # Regenerate Supabase TypeScript types
```

---

## Contributing

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes and ensure the type check passes:
   ```bash
   npm run type-check
   ```
3. Open a Pull Request with a clear description of the changes.

> All new database changes should include the corresponding `.sql` migration file in the `sql/` directory.
