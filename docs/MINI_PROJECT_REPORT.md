# CYBER SECURITY RISK MANAGEMENT AND AUDIT — MINI PROJECT REPORT

## **Risk Shield System**

**Created by:**

| NIM | Name |
| :--- | :--- |
| 001202400138 | **WISNU ALFIAN NUR ASHAR** |
| 001202400034 | **MUHAMMAD ILHAM MAULANA** |
| 001202400079 | **CHRISTOFER SOFIAN RIALDI SITOMPUL** |
| 001202400081 | **MUHAMMAD AHDA BRILIANTAMA** |
| 001202400043 | **RAFA BASIA HANIF** |

> **Bekasi, 2026**

---

## Table of Contents

1. [Cyber Security Risk Assessment and Audit Framework](#cyber-security-risk-assessment-and-audit-framework)
2. [Introduction](#1-introduction)
3. [Getting Started](#2-getting-started)
4. [Using the System](#3-using-the-system)
5. [Troubleshooting & Support](#4-troubleshooting--support)

---

## CYBER SECURITY RISK ASSESSMENT AND AUDIT FRAMEWORK

### Definition & Importance

A **Cyber Security Risk Assessment and Audit Framework** is a structured approach that organizations use to systematically identify, evaluate, and mitigate cybersecurity threats to their information assets. It serves as the backbone of an organization's security posture by providing:

- **Proactive Threat Management**: Instead of reacting to breaches after they occur, a framework enables organizations to anticipate and prepare for threats before they materialize.
- **Evidence-Based Compliance**: It shifts the organizational mindset from subjective security claims ("we are secure") to verifiable, auditable evidence of security controls.
- **Regulatory Alignment**: It ensures that the organization complies with legal obligations such as data protection laws and industry-specific regulations.

In the context of our system, **Risk Shield System**, the framework automates the entire lifecycle of risk assessment and security auditing. It helps organizations:

1. **Identify** critical information assets and their containers (physical, technical, people).
2. **Assess** threats and vulnerabilities targeting those assets.
3. **Analyze** the likelihood and impact of identified risks across Financial, Reputational, Legal, and Operational domains.
4. **Mitigate** risks through structured treatment plans.
5. **Audit** the effectiveness of implemented security controls through evidence-based verification.

### Frameworks Used

Our system is built upon the **OCTAVE Allegro** (Operationally Critical Threat, Asset, and Vulnerability Evaluation) methodology, developed by the Software Engineering Institute (SEI) at Carnegie Mellon University.

**Why OCTAVE Allegro?**

We chose OCTAVE Allegro over alternatives (NIST CSF, ISO 27005, FAIR) for the following reasons:

1. **Asset-Centric Approach**: Unlike threat-centric frameworks, OCTAVE Allegro starts by identifying what matters most to the organization—its critical information assets. This is more intuitive and practical for organizations that may not have deep technical expertise.
2. **Structured 8-Step Roadmap**: The methodology provides a clear, sequential, and repeatable process that can be directly translated into a software wizard, making it ideal for automation.
3. **Qualitative Risk Analysis**: It uses qualitative scales (1–5) for likelihood and impact, which are easier for non-technical stakeholders (managers, auditors) to understand compared to quantitative methods like FAIR.
4. **Broad Applicability**: It is applicable to organizations of any size and industry, making our system versatile.
5. **Comprehensive Scope**: It covers the full lifecycle from asset identification to mitigation planning, while also integrating with audit verification processes.

Additionally, we integrated concepts from:
- **OWASP Top 10**: A pre-populated library of 19 critical web application vulnerabilities (e.g., SQL Injection, Broken Authentication, IDOR) is embedded in the system for threat identification.
- **GRC (Governance, Risk, and Compliance) Principles**: The platform automates workflows related to governance (role management), risk (assessment engine), and compliance (audit checklists and evidence collection).

### Risk Assessment Process

The risk assessment process in Risk Shield System follows the OCTAVE Allegro 8-step lifecycle, implemented as a guided wizard:

| Step | Name | Description |
| :---: | :--- | :--- |
| 1 | **Establish Criteria** | Define qualitative impact scales across 4 domains: Financial, Reputational, Legal, and Operational. Each domain has 5 severity levels (1=Negligible to 5=Catastrophic). |
| 2 | **Develop Asset Profile** | Identify and catalog critical information assets. Each asset is classified by type (Data, System, Application, Network, Physical, Service, Personnel) and assigned CIA (Confidentiality, Integrity, Availability) values. |
| 3 | **Identify Containers** | Map where each asset resides. Containers can be Physical (servers, files), Technical (databases, cloud), People (administrators), or Processes (workflows). |
| 4 | **Identify Areas of Concern** | Document specific security concerns for each container, categorized by CIA dimensions and assigned a priority level (Low, Medium, High). |
| 5 | **Identify Threat Scenarios** | Develop detailed threat scenarios by specifying the threat actor (external attacker, insider, etc.), threat vector, motivation, and capability. Each scenario is linked to a specific asset and container. |
| 6 | **Identify & Analyze Risks** | For each threat scenario, a risk entry is created with Likelihood (1–5) and Impact (1–5) scores. The system automatically calculates a **Risk Score = Likelihood × Impact** and assigns a Risk Level (Low, Medium, High, Critical). Impact is further broken down into Financial, Reputational, Legal, and Operational sub-scores. |
| 7 | **Analyze Risk (Detailed)** | Perform root cause analysis, identify existing controls, evaluate control effectiveness, and calculate residual risk scores. |
| 8 | **Select Mitigation Approach** | Define treatment strategies (Mitigate, Transfer, Accept, Avoid) for each risk. Each mitigation plan includes a description, priority, estimated cost, timeline, and responsible party. |

**Risk Audit Process:**

After the risk assessment is complete, the system transitions into the Audit phase:

1. **Checklist Generation**: The system automatically generates audit checklists based on the identified vulnerabilities and the OCTAVE Allegro control requirements.
2. **Evidence Collection**: Auditors can upload evidence files (PDF, JPG, PNG, DOCX) directly linked to specific audit items to prove control implementation.
3. **Compliance Scoring**: The system calculates real-time compliance percentages based on the status ("compliant", "non-compliant", "partial", "not-applicable") of each audit item.
4. **Findings Generation**: Non-compliant controls are automatically flagged as audit findings, categorized by severity (Low to Critical).
5. **AI-Assisted Review**: Google Gemini AI can be invoked to provide an executive-level summary of overall risk posture and generate specific, technical remediation recommendations for each identified risk.

### Implementation in Your System

**Architecture:**
Risk Shield System is a full-stack web application built with:

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| Frontend | **Next.js 14 (React)** | Server-side rendering, client-side interactivity, and routing. |
| UI Library | **shadcn/ui, Radix UI** | Accessible, pre-styled component library for professional interfaces. |
| Styling | **Tailwind CSS** | Utility-first CSS framework for rapid, responsive design. |
| Backend/Database | **Supabase (PostgreSQL)** | Managed PostgreSQL database with built-in Auth, Storage, and Row-Level Security (RLS). |
| AI Engine | **Google Gemini Pro (gemini-1.5-flash)** | Generative AI for automated risk analysis summaries and mitigation recommendations. |
| Reporting | **jsPDF, AutoTable** | Client-side generation of professional PDF and DOCX reports. |
| Data Visualization | **Recharts** | Interactive charts (Pie, Area, Bar) for the dashboard. |
| Security | **Supabase RLS, HSTS, CSP, DOMPurify, Honey-pot Bot Detection** | Multi-layered security to protect data and prevent unauthorized access. |
| Integrity Scanner | **Custom Autonomous Scanner** | Programmatic verification of security posture (environment keys, headers). |

**Tools and Technologies:**
- **Row-Level Security (RLS)**: Supabase RLS policies ensure that each organization can only access its own data. This acts as a built-in firewall at the database level.
- **Encryption (TLS/SSL)**: All data transmitted between the client and server is encrypted using TLS/SSL. The system enforces **HSTS (HTTP Strict Transport Security)** with a max-age of 2 years (`max-age=63072000; includeSubDomains; preload`), ensuring browsers always connect via HTTPS.
- **Content Security Policy (CSP)**: A strict CSP header is enforced via Next.js middleware to prevent Cross-Site Scripting (XSS), clickjacking, and data injection attacks. Only trusted sources (Supabase, Google Fonts, Google APIs) are whitelisted.
- **Security Headers**: The middleware enforces 7 security headers on every request:
  - `Strict-Transport-Security` (HSTS)
  - `X-XSS-Protection: 1; mode=block`
  - `X-Frame-Options: DENY` (prevents clickjacking)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` (disables camera, microphone, geolocation)
  - `Content-Security-Policy` (strict CSP)
- **Input Sanitization (DOMPurify)**: All user inputs are sanitized using the **DOMPurify** library, which strips dangerous HTML tags and attributes to prevent XSS attacks. The sanitizer has a recursive mode for sanitizing entire objects.
- **Honey-pot Bot Detection**: A hidden field on the login form detects automated bot submissions and silently ignores them.
- **Session Management**: Supabase Auth manages JWT-based sessions with automatic token refresh and secure cookie handling.
- **Autonomous Integrity Scanner**: A custom-built scanner (`integrity-checker.ts`) programmatically verifies the security posture of the application by checking environment variables and security header configurations.
- **Security Event Logger**: A dedicated logging module (`logger.ts`) records security events (LOGIN_FAILURE, UNAUTHORIZED_ACCESS, SENSITIVE_CHANGE, BOT_DETECTION) to the `audit_logs` table for forensic analysis.
- **MFA Readiness**: The Admin Security panel includes an MFA Security Roadmap section, preparing the system for future Multi-Factor Authentication implementation.
- **AI-Based Threat Detection**: Google Gemini AI analyzes risk data to identify patterns and provide proactive security recommendations, translating complex technical gaps into management-friendly language.

### Compliance & Standards

The Risk Shield System framework aligns with the following legal regulations and industry best practices:

| Standard | Alignment |
| :--- | :--- |
| **ISO 27001** | The system's risk assessment process (identify, assess, treat, monitor) directly maps to the Plan-Do-Check-Act (PDCA) cycle required by ISO 27001. |
| **NIST 800-53** | Security controls identified during the audit phase are comparable to NIST 800-53 control families (Access Control, Audit & Accountability, Risk Assessment). |
| **OWASP Top 10** | The system's pre-populated vulnerability library is derived from OWASP Top 10 categories, ensuring that web application risks are consistently evaluated. |
| **GDPR** | The system implements data minimization and access control principles. RLS ensures that personal data is only accessible to authorized organization members. |

**Auditing and Monitoring:**
- **Audit Logs**: Every significant action (login, data modification, report generation) is logged in the `audit_logs` table with user ID, IP address, and timestamp.
- **Security Event Logging**: Failed login attempts and suspicious activities are recorded for forensic analysis.
- **Real-time Dashboard**: The compliance pulse on the dashboard provides continuous monitoring of the organization's security posture.

### Challenges & Lessons Learned

| Challenge | Solution |
| :--- | :--- |
| **Role-Based Access Control** | Initially, all users had equal access. We implemented a granular RBAC system (Admin, Auditor, Auditee) with Supabase RLS to enforce data isolation. |
| **AI Integration Reliability** | Gemini API responses were sometimes inconsistent. We added robust error handling, fallback messages, and ensured that AI NEVER modifies calculated risk scores—it only provides advisory recommendations. |
| **Real-time Data Sync** | Profile updates (avatar, name) were not immediately reflected across all components. We implemented a centralized `useAuth` hook with cache-busting mechanisms for instant UI synchronization. |
| **Identity Verification** | Re-authentication for sensitive operations (password change, email change) initially failed due to email synchronization issues between the Auth session and the profile table. We resolved this by always fetching the email from the active session. |
| **Evidence Upload Integrity** | Foreign key violations occurred when uploading audit evidence because the `uploaded_by` field referenced the wrong user ID type. We corrected this to use the `profileId` instead of `auth.userId`. |

---

## 1. Introduction

This User Manual (UM) provides the information necessary for **Administrators, Auditors, and Auditees** to effectively use the **Risk Shield System (RSS)**.

The document covers the full lifecycle of the system: from initial login and registration, through the 8-step OCTAVE Allegro risk assessment wizard, to the audit verification and reporting modules. All instructions are accompanied by descriptions of the user interface and expected system behavior.

**Security Consideration**: This manual is intended for authorized users only. Access to the system requires valid credentials issued by the organization's administrator. All actions are logged for audit trail purposes.

### 1.1 Overview

**Risk Shield System** is a web-based, AI-assisted Governance, Risk, and Compliance (GRC) platform designed for cybersecurity risk assessment and security audit verification. It automates the **OCTAVE Allegro** methodology to guide users through a structured, repeatable process of identifying, analyzing, and mitigating cybersecurity risks.

**Key Features:**
- **8-Step Risk Assessment Wizard**: A guided process following the OCTAVE Allegro lifecycle.
- **AI Security Advisor**: Powered by Google Gemini Pro, it provides intelligent risk analysis summaries and actionable mitigation recommendations.
- **Audit & Evidence Management**: Upload, store, and link evidence files to specific audit controls.
- **Interactive Dashboard**: Real-time risk heatmap (5×5 matrix), risk distribution charts, compliance pulse, and project timeline tracking.
- **Professional Report Generation**: One-click export of comprehensive risk assessment and audit reports in PDF and DOCX formats.
- **Role-Based Access Control (RBAC)**: Granular permissions for Admin, Auditor, and Auditee roles.

**Architecture:**
The system is a **client-server web application** built on the Next.js 14 framework with a Supabase (PostgreSQL) cloud backend. It is accessed through any modern web browser (Chrome, Firefox, Edge, Safari) via a responsive **Graphical User Interface (GUI)**.

**System Environment:**
- The application is deployed and hosted at **https://www.riskshieldsystem.my.id** with a custom domain.
- The database and authentication services are hosted on Supabase cloud infrastructure.
- No local installation is required for end-users; only a web browser and an internet connection are needed.

---

## 2. Getting Started

### 2.1 Cautions & Warnings

- **Unauthorized Access**: Unauthorized access to the system is strictly prohibited. All access is logged and audited. Any attempt to bypass security controls will be recorded in the system's audit log.
- **Data Sensitivity**: Risk assessment data and audit findings contain sensitive organizational information. Users must not share their credentials or export reports to unauthorized parties.
- **Session Timeout**: For security purposes, user sessions will expire after a period of inactivity. Users will be automatically redirected to the login page.
- **AI Advisory**: The AI Security Advisor provides recommendations only. All AI-generated content must be reviewed by a qualified professional before implementation. The AI does not modify any risk scores or assessment data.

### 2.2 Set-up Considerations

**For End-Users (No Setup Required):**
The system is cloud-hosted and accessed via a web browser. No local installation or configuration is needed.

**Minimum Requirements:**
- A modern web browser (Google Chrome 90+, Mozilla Firefox 85+, Microsoft Edge 90+, or Apple Safari 14+).
- A stable internet connection.
- Screen resolution of 1280×720 or higher (responsive design adapts to mobile devices).

**For Developers/Administrators (Local Setup):**
1. Clone the repository: `git clone https://github.com/wi5nuu/risk-assessment-platform.git`
2. Install dependencies: `npm install`
3. Configure environment variables in `.env.local` (Supabase URL, Anon Key, Service Role Key, Google AI API Key).
4. Initialize the database by running SQL scripts in the `sql/` directory, starting with `schema.sql`.
5. Run the development server: `npm run dev`

### 2.3 User Access Considerations

The system implements **Role-Based Access Control (RBAC)** with three distinct roles:

| Role | Access Level | Description |
| :--- | :--- | :--- |
| **Admin** | Full Access | Can manage all users, organizations, projects, risks, and audit data. Has access to the Admin Control panel for user management and organization settings. |
| **Auditor** | Read + Audit | Can view all projects and risk data within their organization. Can create and manage audit checklists, upload evidence, and write audit findings. Cannot create new projects. |
| **Auditee** | Read + Input | Can view assigned projects and input data into the risk assessment wizard. Can upload evidence when requested by the auditor. Cannot manage users or modify audit findings. |

### 2.4 Accessing the System

**Step 1: Navigate to the System**
Open your web browser and go to the system URL (e.g., `https://www.riskshieldsystem.my.id`).

**Step 2: Login**
On the Landing Page, click the **"Login"** button at the top-right corner. You will be redirected to the Login Page.
- Enter your **Work Email** address.
- Enter your **Security Password**.
- Click **"Sign In with Password"**.

**Alternative Login (Magic Link):**
If you prefer passwordless access, enter your email and click **"Email Magic Link"**. A secure login link will be sent to your inbox.

**Step 3: Registration (New Organization)**
If your organization does not have an account:
- Click **"Register Organization"** on the login page.
- Fill in: First Name, Last Name, Organization Name, Email, and Password.
- Click **"Create Account"**.
- A confirmation email will be sent. Click the link in the email to verify your account.

**Changing Password:**
Navigate to **Profile Settings > Security Credentials**, enter your current password, new password, and confirm. Click **"Update Security Key"**.

**Forgot Password:**
Click **"Forgot password?"** on the login page, enter your email, and follow the instructions in the password reset email.

### 2.5 System Organization & Navigation

After logging in, the user is directed to the **Dashboard**. The system is organized through a **left-side navigation bar (Sidebar)** with the following sections:

| Section | Menu Items | Description |
| :--- | :--- | :--- |
| **Main** | Dashboard | Central overview with risk charts, heatmap, compliance pulse, and AI advisor summary. |
| **Risk Assessment** | Projects, Wizard | List of all risk assessment projects and the 8-step OCTAVE Allegro wizard. |
| **Security Audit** | Audit Center | Audit checklists, evidence uploads, and compliance tracking per project. |
| **AI & Reporting** | AI Security Advisor, Risk Register | AI-powered advisory and a consolidated view of all identified risks. |
| **Admin Control** | Admin Overview, Users Management, Organization Profile | (Admin only) User management, role assignment, and organization configuration. |
| **Account** | Profile Settings, Log Out | User profile management (avatar, name, email, password). |

### 2.6 Exiting the System

To properly exit the system:

1. Click on your **avatar/profile icon** in the top-right corner of the navigation bar.
2. Select **"Sign Out"** from the dropdown menu.
3. You will be redirected to the **Landing Page**, confirming a successful logout.

Alternatively, you can click **"Log Out"** in the left sidebar under the **Account** section.

> **Important**: Always use the Sign Out function rather than simply closing the browser tab to ensure your session is properly terminated.

---

## 3. Using the System

### 3.1 Dashboard

The Dashboard is the central command center of Risk Shield System. Upon login, the user sees:

- **Welcome Banner**: Personalized greeting with the user's first name and a background image.
- **Statistics Cards**: Four cards showing Total Projects, Critical Risks, High Risks, and Total Risks.
- **Recent Projects**: A list of the 5 most recent risk assessment projects with their progress indicators.
- **Risk Matrix Heatmap**: A 5×5 interactive matrix showing the distribution of risks across Likelihood (Y-axis) and Impact (X-axis). Colors range from green (Low) to red (Critical).
- **Strategic Timeline**: Shows the primary active project, days remaining until deadline, and current velocity (progress percentage).
- **AI Security Advisor Card**: Provides real-time strategic advice based on the current risk posture.
- **Top Vulnerable Assets**: Lists the highest-impact assets requiring immediate protection.
- **Risk Distribution Chart**: A pie chart showing the proportion of Critical, High, Medium, and Low risks.
- **Risk Posture Trend**: An area chart showing the security trajectory over the last 7 weeks.
- **Compliance Pulse**: A summary card showing the overall OCTAVE Allegro compliance health percentage.

### 3.2 Risk Assessment Wizard

The Wizard is the core feature of the system, guiding users through the 8-step OCTAVE Allegro process.

**Accessing the Wizard:**
1. Navigate to **Projects** from the sidebar.
2. Click **"New Assessment"** to create a new project, or click **"Open"** on an existing project.
3. The wizard opens with a **Step Indicator** at the top showing progress (Steps 1–8).

#### 3.2.1 Step 1: Risk Measurement Criteria
Define impact scales for each of the 4 domains (Financial, Reputational, Legal, Operational) at 5 severity levels. Also define Likelihood scales. Click **"Save & Continue"**.

#### 3.2.2 Step 2: Critical Asset Profile
Add critical information assets. For each asset, specify: Name, Type, Description, Owner, CIA values (1–5). The system calculates an **Overall Criticality Score**. Click **"Save & Continue"**.

#### 3.2.3 Step 3: Information Asset Containers
Create containers (Physical, Technical, People, Process) and map them to assets. This defines where each asset is stored, processed, or transmitted.

#### 3.2.4 Step 4: Areas of Concern
For each container, document security concerns categorized by CIA dimension and priority level (Low, Medium, High).

#### 3.2.5 Step 5: Threat Scenarios
Develop detailed threat scenarios. Specify: Threat Actor (e.g., External Attacker, Insider), Threat Vector, Motivation, Capability Level, and link each scenario to a specific asset and container.

#### 3.2.6 Step 6: Risk Identification & Analysis
For each threat scenario, create a risk entry with Likelihood (1–5) and Impact (1–5). The system auto-calculates: **Risk Score = Likelihood × Impact**, and assigns a **Risk Level** (Low ≤6, Medium ≤12, High ≤16, Critical ≤25).

#### 3.2.7 Step 7: Detailed Risk Analysis
Perform root cause analysis, document existing controls, and assess control effectiveness. Calculate residual risk after controls.

#### 3.2.8 Step 8: Mitigation Strategy
Define treatment strategies for each risk: Mitigate, Transfer, Accept, or Avoid. Include mitigation description, priority, estimated cost, timeline, and responsible party.

### 3.3 Security Audit Center

**Accessing Audit:**
1. Navigate to **Security Audit > Audit Center** from the sidebar.
2. Select a project to audit.

**Features:**
- **Audit Checklist**: Auto-generated checklist items based on OCTAVE Allegro controls. Each item can be marked as Compliant, Non-Compliant, Partial, or Not Applicable.
- **Evidence Upload**: Upload supporting files (PDF, JPG, PNG, DOCX, up to 10MB) linked to specific audit items. Evidence is stored securely in Supabase Storage.
- **Audit Findings**: Non-compliant items are flagged automatically. Auditors can add detailed findings with severity classifications.
- **Compliance Score**: Real-time calculation of the organization's compliance percentage.

### 3.4 AI Security Advisor

**Accessing AI Advisor:**
Navigate to **AI & Reporting > AI Security Advisor** from the sidebar.

**Features:**
- **Executive Summary**: AI generates a high-level summary of the organization's risk posture.
- **Mitigation Recommendations**: For each identified risk, the AI provides specific, technical remediation steps.
- **Technical Translation**: AI translates complex security gaps into management-readable language.

> **Note**: AI recommendations are advisory only. The AI never modifies calculated risk scores.

### 3.5 Report Generation

**Accessing Reports:**
Navigate to any project and click the **"Export Report"** button.

**Available Formats:**
- **PDF**: Professional, paginated report with cover page, table of contents, risk matrix visualization, and detailed findings.
- **DOCX (Word)**: Editable format for further customization.
- **CSV (Excel)**: Raw data export for advanced analysis.

### 3.6 Profile Settings

**Accessing Settings:**
Navigate to **Account > Profile Settings** from the sidebar.

**Features:**
- **Avatar Upload**: Upload a profile photo. The system replaces existing photos and refreshes the UI instantly.
- **Display Identity**: Update your first name and last name.
- **Security Credentials**: Change your password (requires current password verification).
- **Change Email**: Update your login email (requires identity verification and email confirmation).

### 3.7 Admin Control Panel (Admin Only)

**Accessing Admin Panel:**
Navigate to **Admin Control > Admin Overview** from the sidebar.

**Features:**
- **Users Management**: View all registered users, assign roles (Admin, Auditor, Auditee), activate/deactivate accounts.
- **Organization Profile**: Update organization details (name, industry, size, address, contact information).

---

## 4. Troubleshooting & Support

### 4.1 Error Messages

| Error Message | Likely Cause | Corrective Action |
| :--- | :--- | :--- |
| **"Invalid login credentials"** | Incorrect email or password, or extra whitespace in the input field. | Verify your email and password. The system auto-trims whitespace. Try again or use **Magic Link**. |
| **"Email not confirmed"** | Account was registered but email verification was not completed. | Check your inbox (including spam) for the confirmation email and click the verification link. |
| **"Identity verification failed"** | The password entered during re-authentication does not match the current account password. | Ensure you are entering your **current** password, not the new one. Check for typos and trailing spaces. |
| **"Failed to upload image"** | File size exceeds the limit or file type is not supported. | Ensure the file is JPG, PNG, or WEBP and is under 5MB. |
| **"You don't have permission"** | The user's role does not have access to the requested feature. | Contact your organization's administrator to adjust your role permissions. |
| **"Foreign key violation"** | A database integrity error during evidence upload. | This is a system-level issue. Contact the administrator. The `uploaded_by` field must reference a valid profile ID. |
| **"No projects found"** | The user's profile is linked to a different organization than the one containing the projects. | Contact the administrator to verify your organization assignment. |

### 4.2 Special Considerations

- **Browser Compatibility**: The system is optimized for modern browsers. Internet Explorer is not supported.
- **Mobile Usage**: The system is responsive and can be accessed on tablets and smartphones, but the full desktop experience is recommended for complex tasks like the 8-step wizard.
- **Data Persistence**: All data is automatically saved to the cloud database. There is no "Save" button for most forms—data is persisted when you click "Save & Continue" or submit a form.
- **AI Availability**: The AI Security Advisor requires a valid Google Gemini API key configured in the system. If the AI service is unavailable, risk assessment functions will continue to work normally without AI recommendations.

### 4.3 Support

For technical support or to report issues, please contact the development team:

| Contact | Organization | Phone | Email | Role | Responsibility |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Wisnu Alfian Nur Ashar | President University | - | wisnualfian117@gmail.com | Lead Developer | System architecture, backend, deployment |
| Muhammad Ilham Maulana | President University | - | ilham36677@gmail.com | Developer | Frontend development, UI/UX |
| Christofer Sofian Rialdi Sitompul | President University | - | refotsirhc2@gmail.com | Developer | Database design, SQL schema |
| Muhammad Ahda Briliantama | President University | - | muhahdabriliantama01@gmail.com | Developer | Testing, documentation |
| Rafa Basia Hanif | President University | - | rafabasia2208@gmail.com | Developer | Risk engine, reporting |

**Reporting Issues:**
1. Navigate to the **Support** page from the sidebar.
2. Describe the issue in detail, including the steps to reproduce the error.
3. Include any error messages displayed on screen.
4. The support team will respond within 24–48 hours.

**Security Incident Handling:**
If you suspect a security breach or unauthorized access:
1. Immediately change your password via **Profile Settings > Security Credentials**.
2. Notify the system administrator via email.
3. Document the incident (time, date, actions observed).
4. The administrator will review the `audit_logs` table for forensic analysis.

---

> **© 2026 Risk Shield System — President University, Bekasi**
