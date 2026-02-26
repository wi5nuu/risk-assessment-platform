import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const PW = 210 // A4 width in mm
const PH = 297
const ML = 18 // margin left
const MR = 18
const TW = PW - ML - MR // text width

let doc: jsPDF
let y = 20

function newPageIfNeeded(need: number = 15) {
    if (y > PH - 25 - need) { doc.addPage(); y = 20 }
}

function sectionTitle(title: string) {
    newPageIfNeeded(20)
    doc.setFillColor(15, 23, 42)
    doc.rect(ML - 4, y - 5, TW + 8, 11, 'F')
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(title, ML, y + 2)
    y += 16
}

function subTitle(title: string) {
    newPageIfNeeded(12)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 41, 59)
    doc.text(title, ML, y)
    y += 7
}

function subSubTitle(title: string) {
    newPageIfNeeded(10)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bolditalic')
    doc.setTextColor(71, 85, 105)
    doc.text(title, ML + 4, y)
    y += 6
}

function para(text: string) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(51, 65, 85)
    const lines = doc.splitTextToSize(text, TW)
    lines.forEach((line: string) => {
        newPageIfNeeded(6)
        doc.text(line, ML, y)
        y += 4.8
    })
    y += 3
}

function bullet(text: string) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(51, 65, 85)
    const lines = doc.splitTextToSize(text, TW - 8)
    lines.forEach((line: string, i: number) => {
        newPageIfNeeded(6)
        if (i === 0) doc.text('•', ML + 2, y)
        doc.text(line, ML + 8, y)
        y += 4.8
    })
}

function numberedItem(num: string, text: string) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(51, 65, 85)
    const lines = doc.splitTextToSize(text, TW - 10)
    lines.forEach((line: string, i: number) => {
        newPageIfNeeded(6)
        if (i === 0) { doc.setFont('helvetica', 'bold'); doc.text(num, ML + 2, y); doc.setFont('helvetica', 'normal') }
        doc.text(line, ML + 10, y)
        y += 4.8
    })
}

function table(headers: string[], rows: string[][], color: number[] = [99, 102, 241]) {
    newPageIfNeeded(30)
    autoTable(doc, {
        startY: y,
        head: [headers],
        body: rows,
        margin: { left: ML, right: MR },
        styles: { fontSize: 8, cellPadding: 2.5 },
        headStyles: { fillColor: color as any, textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        theme: 'grid',
    })
    y = (doc as any).lastAutoTable.finalY + 8
}

// =====================================================
// MAIN EXPORT
// =====================================================
export function generateReportPDF(fullName: string, studentId: string) {
    doc = new jsPDF()
    y = 20

    // ==================== COVER PAGE ====================
    doc.setFillColor(15, 23, 42)
    doc.rect(0, 0, PW, PH, 'F')
    doc.setFillColor(234, 179, 8)
    doc.rect(20, 40, 4, 80, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('PRESIDENT UNIVERSITY', 30, 50)
    doc.setFontSize(10)
    doc.setTextColor(148, 163, 184)
    doc.text('Faculty of Computer Science \u2022 Information Technology', 30, 58)

    doc.setFontSize(28)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text('CYBER SECURITY', 30, 80)
    doc.text('RISK MANAGEMENT', 30, 92)
    doc.text('AND AUDIT', 30, 104)

    doc.setFontSize(14)
    doc.setTextColor(234, 179, 8)
    doc.text('MINI PROJECT REPORT', 30, 118)

    doc.setFillColor(99, 102, 241)
    doc.roundedRect(28, 132, 130, 14, 3, 3, 'F')
    doc.setFontSize(12)
    doc.setTextColor(255, 255, 255)
    doc.text('Risk Shield System', 35, 141)

    const members = [
        ['001202400138', 'Wisnu Alfian Nur Ashar'],
        ['001202400034', 'Muhammad Ilham Maulana'],
        ['001202400079', 'Christofer Sofian Rialdi Sitompul'],
        ['001202400081', 'Muhammad Ahda Briliantama'],
        ['001202400043', 'Rafa Basia Hanif'],
    ]
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Created by:', 30, 165)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(203, 213, 225)
    members.forEach((m, i) => doc.text(`${m[0]}  \u2014  ${m[1]}`, 30, 175 + i * 8))

    doc.setTextColor(100, 116, 139)
    doc.setFontSize(10)
    doc.text('Bekasi, 2026', 30, 225)
    doc.setFontSize(7)
    doc.setTextColor(71, 85, 105)
    doc.text('CONFIDENTIAL \u2014 For authorized personnel only', 30, PH - 15)
    doc.text(`Downloaded by: ${fullName} (${studentId}) on ${new Date().toLocaleString('id-ID')}`, 30, PH - 9)

    // ==================== TABLE OF CONTENTS ====================
    doc.addPage()
    y = 25
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 23, 42)
    doc.text('Table of Contents', ML, y)
    y += 12

    const tocItems = [
        ['Cyber Security Risk Assessment and Audit Framework', ''],
        ['   Definition & Importance', ''],
        ['   Frameworks Used', ''],
        ['   Risk Assessment Process', ''],
        ['   Implementation in Your System', ''],
        ['   Compliance & Standards', ''],
        ['   Challenges & Lessons Learned', ''],
        ['1. Introduction', ''],
        ['   1.1 Overview', ''],
        ['2. Getting Started', ''],
        ['   2.1 Cautions & Warnings', ''],
        ['   2.2 Set-up Considerations', ''],
        ['   2.3 User Access Considerations', ''],
        ['   2.4 Accessing the System', ''],
        ['   2.5 System Organization & Navigation', ''],
        ['   2.6 Exiting the System', ''],
        ['3. Using the System', ''],
        ['   3.1 Dashboard', ''],
        ['   3.2 Risk Assessment Wizard (8-Step OCTAVE Allegro)', ''],
        ['   3.3 Security Audit Center', ''],
        ['   3.4 AI Security Advisor', ''],
        ['   3.5 Report Generation', ''],
        ['   3.6 Profile Settings', ''],
        ['   3.7 Admin Control Panel', ''],
        ['4. Troubleshooting & Support', ''],
        ['   4.1 Error Messages', ''],
        ['   4.2 Special Considerations', ''],
        ['   4.3 Support', ''],
    ]
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 41, 59)
    tocItems.forEach(item => {
        const isBold = !item[0].startsWith('   ')
        doc.setFont('helvetica', isBold ? 'bold' : 'normal')
        doc.text(item[0], ML, y)
        y += 5.5
    })

    // ==================== FRAMEWORK THEORY ====================
    doc.addPage()
    y = 20
    sectionTitle('CYBER SECURITY RISK ASSESSMENT AND AUDIT FRAMEWORK')

    subTitle('Definition & Importance')
    para('A Cyber Security Risk Assessment and Audit Framework is a structured, methodological approach that organizations use to systematically identify, evaluate, and mitigate cybersecurity threats targeting their critical information assets. It serves as the backbone of an organization\'s security posture, transforming ad-hoc security practices into a repeatable, auditable process.')
    para('This framework is essential for organizations because it provides:')
    bullet('Proactive Threat Management: Instead of reacting to breaches after they occur, a framework enables organizations to anticipate and prepare for threats before they materialize, reducing the attack surface and minimizing potential damage.')
    bullet('Evidence-Based Compliance: It shifts the organizational mindset from subjective security claims ("we are secure") to verifiable, auditable evidence of security controls, which is critical for regulatory compliance and stakeholder trust.')
    bullet('Regulatory Alignment: It ensures that the organization complies with legal obligations such as data protection laws (GDPR), industry standards (PCI-DSS), and national frameworks (NIST).')
    y += 3
    para('In the context of our system, Risk Shield System, the framework automates the entire lifecycle of risk assessment and security auditing. It helps organizations:')
    numberedItem('1.', 'Identify critical information assets and their containers (physical, technical, people).')
    numberedItem('2.', 'Assess threats and vulnerabilities targeting those assets.')
    numberedItem('3.', 'Analyze the likelihood and impact of identified risks across Financial, Reputational, Legal, and Operational domains.')
    numberedItem('4.', 'Mitigate risks through structured treatment plans (Mitigate, Transfer, Accept, Avoid).')
    numberedItem('5.', 'Audit the effectiveness of implemented security controls through evidence-based verification.')
    y += 5

    subTitle('Frameworks Used')
    para('Our system is built upon the OCTAVE Allegro (Operationally Critical Threat, Asset, and Vulnerability Evaluation) methodology, developed by the Software Engineering Institute (SEI) at Carnegie Mellon University. OCTAVE Allegro is a streamlined, asset-focused risk assessment methodology designed to produce consistent, actionable results.')
    para('Why we chose OCTAVE Allegro over alternatives (NIST CSF, ISO 27005, FAIR, COBIT):')
    bullet('Asset-Centric Approach: Unlike threat-centric frameworks, OCTAVE Allegro starts by identifying what matters most to the organization — its critical information assets. This is more intuitive and practical for organizations that may not have deep technical expertise.')
    bullet('Structured 8-Step Roadmap: The methodology provides a clear, sequential, and repeatable process that can be directly translated into a software wizard, making it ideal for automation in our web-based platform.')
    bullet('Qualitative Risk Analysis: It uses qualitative scales (1\u20135) for likelihood and impact, which are easier for non-technical stakeholders (managers, auditors) to understand compared to quantitative methods like FAIR.')
    bullet('Broad Applicability: It is applicable to organizations of any size and industry, making our system versatile for various use cases.')
    bullet('Comprehensive Scope: It covers the full lifecycle from asset identification to mitigation planning, while also integrating with audit verification processes.')
    y += 3
    para('Additionally, we integrated concepts from:')
    bullet('OWASP Top 10: A pre-populated library of 19 critical web application vulnerabilities (e.g., SQL Injection, Broken Authentication, IDOR, SSRF) is embedded in the system for threat identification in Step 5.')
    bullet('GRC (Governance, Risk, and Compliance) Principles: The platform automates workflows related to governance (role-based access management), risk (assessment engine with scoring), and compliance (audit checklists and evidence collection).')
    y += 5

    // Risk Assessment Process
    subTitle('Risk Assessment Process')
    para('The risk assessment process in Risk Shield System follows the OCTAVE Allegro 8-step lifecycle, implemented as a guided wizard in our web application:')

    table(['Step', 'Name', 'Description'], [
        ['Step 1', 'Establish Risk Measurement Criteria', 'Define qualitative impact scales across 4 domains: Financial (revenue loss), Reputational (brand damage), Legal (regulatory penalties), and Operational (service disruption). Each domain has 5 severity levels (1=Negligible to 5=Catastrophic).'],
        ['Step 2', 'Develop Information Asset Profile', 'Identify and catalog critical information assets. Each asset is classified by type (Data, System, Application, Network, Physical, Service, Personnel) and assigned CIA values (Confidentiality, Integrity, Availability) on a 1\u20135 scale.'],
        ['Step 3', 'Identify Information Asset Containers', 'Map where each asset resides. Containers are categorized as Physical (servers, filing cabinets), Technical (databases, cloud services), People (administrators, users), or Processes (workflows, procedures).'],
        ['Step 4', 'Identify Areas of Concern', 'Document specific security concerns for each container, categorized by CIA dimensions (which aspect is threatened) and assigned a priority level (Low, Medium, High).'],
        ['Step 5', 'Identify Threat Scenarios', 'Develop detailed threat scenarios specifying the threat actor (external attacker, insider, natural disaster), threat vector (network, physical, social engineering), motivation (financial, espionage, disruption), and capability level.'],
        ['Step 6', 'Identify & Analyze Risks', 'For each threat scenario, create a risk entry with Likelihood (1\u20135) and Impact (1\u20135). The system auto-calculates Risk Score = Likelihood \u00d7 Impact and assigns Risk Level: Low (\u22646), Medium (\u226412), High (\u226416), Critical (\u226425).'],
        ['Step 7', 'Analyze Risks (Detailed)', 'Perform root cause analysis, identify existing controls, evaluate control effectiveness, and calculate residual risk scores after applying existing security measures.'],
        ['Step 8', 'Select Mitigation Approach', 'Define treatment strategies (Mitigate, Transfer, Accept, Avoid) for each risk. Each plan includes description, priority, estimated cost, timeline, and responsible party.'],
    ], [99, 102, 241])

    subTitle('Risk Audit Process')
    para('After the risk assessment is complete, the system transitions into the Audit phase with the following steps:')
    numberedItem('1.', 'Checklist Generation: The system automatically generates audit checklists based on the identified vulnerabilities and the OCTAVE Allegro control requirements.')
    numberedItem('2.', 'Evidence Collection: Auditors can upload evidence files (PDF, JPG, PNG, DOCX, up to 10MB) directly linked to specific audit items to prove control implementation.')
    numberedItem('3.', 'Compliance Scoring: The system calculates real-time compliance percentages based on the status (Compliant, Non-Compliant, Partial, Not Applicable) of each audit item.')
    numberedItem('4.', 'Findings Generation: Non-compliant controls are automatically flagged as audit findings, categorized by severity (Low, Medium, High, Critical).')
    numberedItem('5.', 'AI-Assisted Review: Google Gemini AI can be invoked to provide an executive-level summary of overall risk posture and generate specific, technical remediation recommendations.')
    y += 5

    // Implementation
    subTitle('Implementation in Your System')
    para('Risk Shield System is a full-stack, production-deployed web application built with modern cloud-native technologies:')

    table(['Component', 'Technology', 'Purpose'], [
        ['Frontend Framework', 'Next.js 14 (React 18)', 'Server-side rendering, file-based routing, API routes, middleware.'],
        ['UI Component Library', 'shadcn/ui + Radix UI', 'Accessible, professionally styled UI components (Buttons, Cards, Dialogs, Tables).'],
        ['Styling', 'Tailwind CSS', 'Utility-first CSS framework for responsive, consistent design across all devices.'],
        ['Backend & Database', 'Supabase (PostgreSQL)', 'Managed PostgreSQL with built-in Authentication, Row-Level Security, Storage, and real-time capabilities.'],
        ['AI Engine', 'Google Gemini Pro (gemini-1.5-flash)', 'Generative AI for automated executive risk summaries and technical mitigation recommendations.'],
        ['Report Generation', 'jsPDF + jspdf-autotable', 'Client-side PDF generation with professional formatting, tables, and charts.'],
        ['Data Visualization', 'Recharts', 'Interactive charts (Pie, Area, Bar) and a 5\u00d75 Risk Matrix Heatmap on the dashboard.'],
        ['Deployment', 'Vercel + Custom Domain', 'Production deployed at https://www.riskshieldsystem.my.id with global CDN.'],
    ], [15, 23, 42])

    para('Security tools and technologies implemented:')
    bullet('Row-Level Security (RLS): Supabase RLS policies enforce database-level data isolation. Each organization can only access its own data, acting as a built-in firewall at the PostgreSQL level.')
    bullet('Encryption (TLS/SSL + HSTS): All data in transit is encrypted via TLS. The system enforces HSTS (HTTP Strict Transport Security) with max-age=63072000 (2 years), includeSubDomains, and preload, ensuring browsers always connect via HTTPS.')
    bullet('Content Security Policy (CSP): A strict CSP header is enforced via Next.js middleware to prevent XSS, clickjacking, and data injection attacks. Only trusted origins (Supabase, Google Fonts, Google APIs) are whitelisted.')
    bullet('7 Security Headers enforced on every request: Strict-Transport-Security, X-XSS-Protection (mode=block), X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy (strict-origin-when-cross-origin), Permissions-Policy (camera/mic/geo disabled), Content-Security-Policy.')
    bullet('Input Sanitization (DOMPurify): All user inputs are sanitized using the DOMPurify library with zero allowed HTML tags, preventing XSS attacks. A recursive sanitizer handles nested objects.')
    bullet('Honey-pot Bot Detection: A hidden field on the login form detects automated bot submissions and silently rejects them.')
    bullet('JWT Session Management: Supabase Auth manages JWT-based sessions with automatic token refresh and secure HttpOnly cookie handling.')
    bullet('Autonomous Integrity Scanner: A custom-built scanner (integrity-checker.ts) programmatically verifies the application\'s security posture by validating environment variables and header configurations.')
    bullet('Security Event Logger: A dedicated logging module records events (LOGIN_FAILURE, UNAUTHORIZED_ACCESS, SENSITIVE_CHANGE, BOT_DETECTION) to the audit_logs table with user ID, IP address, and timestamp.')
    bullet('MFA Readiness: The Admin Security Command Center includes an MFA Security Roadmap section, preparing the system architecture for future Multi-Factor Authentication implementation.')
    bullet('AI-Based Threat Analysis: Google Gemini AI analyzes risk data to identify patterns and provide proactive security recommendations, translating complex technical gaps into management-friendly language.')
    y += 5

    // Compliance
    subTitle('Compliance & Standards')
    para('The Risk Shield System framework aligns with the following legal regulations and industry best practices:')

    table(['Standard', 'How Our System Aligns'], [
        ['ISO 27001', 'Our risk assessment process (identify, assess, treat, monitor) directly maps to the Plan-Do-Check-Act (PDCA) cycle required by ISO 27001. The audit module verifies control implementation.'],
        ['NIST 800-53', 'Security controls identified during the audit phase are comparable to NIST 800-53 control families: Access Control (AC), Audit & Accountability (AU), Risk Assessment (RA), and System & Information Integrity (SI).'],
        ['OWASP Top 10', 'The system\'s pre-populated vulnerability library is derived from OWASP Top 10 categories, ensuring that the most critical web application risks are consistently evaluated during threat scenario development.'],
        ['GDPR', 'The system implements data minimization and access control principles. RLS ensures that personal data is only accessible to authorized organization members. All security events are logged for accountability.'],
    ], [34, 197, 94])

    para('Auditing and monitoring processes:')
    bullet('Audit Logs: Every significant action (login, data modification, report generation, role change) is logged in the audit_logs table with user ID, IP address, user agent, and timestamp.')
    bullet('Security Event Logging: Failed login attempts, unauthorized access attempts, and bot detection events are recorded for forensic analysis.')
    bullet('Real-time Dashboard: The Compliance Pulse on the dashboard provides continuous monitoring of the organization\'s OCTAVE Allegro compliance health percentage.')
    y += 5

    // Challenges
    subTitle('Challenges & Lessons Learned')
    para('During the development of Risk Shield System, we encountered several significant challenges:')

    table(['Challenge', 'Difficulty', 'Solution & Improvement'], [
        ['Role-Based Access Control', 'Initially all users had equal access to all features.', 'Implemented granular RBAC (Admin, Auditor, Auditee) with Supabase RLS for database-level enforcement and Next.js middleware for route-level protection.'],
        ['AI Integration Reliability', 'Gemini API responses were sometimes inconsistent or hallucinated risk scores.', 'Added robust error handling, fallback messages, and enforced that AI NEVER modifies calculated risk scores \u2014 it only provides advisory recommendations.'],
        ['Real-time Data Synchronization', 'Profile updates (avatar, name) were not immediately reflected across UI components.', 'Implemented a centralized useAuth hook with cache-busting mechanisms and event-driven state propagation for instant UI synchronization.'],
        ['Identity Verification', 'Re-authentication for sensitive operations failed due to email sync issues between Auth session and profile table.', 'Resolved by always fetching the canonical email from the active Supabase Auth session, not from the user_profiles table.'],
        ['Evidence Upload Integrity', 'Foreign key violations occurred when uploading audit evidence files.', 'Corrected the uploaded_by field to reference the profile ID (UUID from user_profiles) instead of the Auth user ID (UUID from auth.users).'],
    ], [239, 68, 68])

    // ==================== 1. INTRODUCTION ====================
    sectionTitle('1. Introduction')
    para('This User Manual (UM) provides the information necessary for Administrators, Auditors, and Auditees to effectively use the Risk Shield System (RSS).')
    para('The document covers the full lifecycle of the system: from initial login and registration, through the 8-step OCTAVE Allegro risk assessment wizard, to the audit verification and reporting modules. All instructions are accompanied by descriptions of the user interface and expected system behavior.')
    para('Security Consideration: This manual is intended for authorized users only. Access to the system requires valid credentials issued by the organization\'s administrator. All actions within the system are logged in the audit trail for security compliance purposes.')

    subTitle('1.1 Overview')
    para('Risk Shield System is a web-based, AI-assisted Governance, Risk, and Compliance (GRC) platform designed for cybersecurity risk assessment and security audit verification. It automates the OCTAVE Allegro methodology to guide users through a structured, repeatable process of identifying, analyzing, and mitigating cybersecurity risks.')
    para('Key features:')
    bullet('8-Step Risk Assessment Wizard: A guided process following the complete OCTAVE Allegro lifecycle with auto-save functionality.')
    bullet('AI Security Advisor: Powered by Google Gemini Pro, providing intelligent risk analysis summaries and actionable mitigation recommendations.')
    bullet('Audit & Evidence Management: Upload, store, and link evidence files to specific audit controls with real-time compliance scoring.')
    bullet('Interactive Dashboard: Real-time 5\u00d75 risk matrix heatmap, risk distribution charts, strategic timeline, compliance pulse, and AI advisor summary card.')
    bullet('Professional Report Generation: One-click export of comprehensive risk assessment and audit reports in PDF, DOCX, and CSV formats.')
    bullet('Role-Based Access Control (RBAC): Granular permissions for Admin, Auditor, and Auditee roles enforced at both the application and database levels.')
    y += 3
    para('Architecture: The system is a client-server web application built on the Next.js 14 framework with a Supabase (PostgreSQL) cloud backend. It is accessed through any modern web browser (Chrome, Firefox, Edge, Safari) via a responsive Graphical User Interface (GUI).')
    para('System Environment:')
    bullet('The application is deployed and hosted at https://www.riskshieldsystem.my.id with a custom domain.')
    bullet('The database and authentication services are hosted on Supabase cloud infrastructure.')
    bullet('No local installation is required for end-users; only a web browser and an internet connection are needed.')
    y += 5

    // ==================== 2. GETTING STARTED ====================
    sectionTitle('2. Getting Started')

    subTitle('2.1 Cautions & Warnings')
    bullet('Unauthorized Access: Unauthorized access to the system is strictly prohibited. All access attempts are logged and audited. Any attempt to bypass security controls will be recorded in the system\'s audit log and may result in legal action.')
    bullet('Data Sensitivity: Risk assessment data and audit findings contain sensitive organizational information. Users must not share their credentials or export reports to unauthorized parties.')
    bullet('Session Timeout: For security purposes, user sessions will expire after a period of inactivity. Users will be automatically redirected to the login page.')
    bullet('AI Advisory Disclaimer: The AI Security Advisor provides recommendations only. All AI-generated content must be reviewed by a qualified professional before implementation. The AI does not modify any risk scores or assessment data.')
    y += 3

    subTitle('2.2 Set-up Considerations')
    para('For End-Users (No Setup Required): The system is cloud-hosted and accessed via a web browser. No local installation or configuration is needed.')
    para('Minimum Requirements:')
    bullet('A modern web browser (Google Chrome 90+, Mozilla Firefox 85+, Microsoft Edge 90+, or Apple Safari 14+).')
    bullet('A stable internet connection.')
    bullet('Screen resolution of 1280\u00d7720 or higher (responsive design adapts to mobile devices).')
    y += 2
    para('For Developers/Administrators (Local Setup):')
    numberedItem('1.', 'Clone the repository: git clone https://github.com/wi5nuu/risk-assessment-platform.git')
    numberedItem('2.', 'Install dependencies: npm install')
    numberedItem('3.', 'Configure environment variables in .env.local (Supabase URL, Anon Key, Service Role Key, Google AI API Key).')
    numberedItem('4.', 'Initialize the database by running SQL scripts in the sql/ directory.')
    numberedItem('5.', 'Run the development server: npm run dev')
    y += 3

    subTitle('2.3 User Access Considerations')
    para('The system implements Role-Based Access Control (RBAC) with three distinct roles:')

    table(['Role', 'Access Level', 'Description'], [
        ['Admin', 'Full Access', 'Can manage all users, organizations, projects, risks, and audit data. Has access to Admin Control panel, Security Command Center, Users Management, and Organization Profile.'],
        ['Auditor', 'Read + Audit', 'Can view all projects and risk data within their organization. Can create and manage audit checklists, upload evidence, write audit findings, and add comments. Cannot create new projects.'],
        ['Auditee', 'Read + Input', 'Can view assigned projects and input data into the risk assessment wizard. Can upload evidence when requested. Cannot manage users, create projects, or modify audit findings.'],
    ], [99, 102, 241])

    subTitle('2.4 Accessing the System')
    para('Step 1: Navigate to the System')
    para('Open your web browser and go to: https://www.riskshieldsystem.my.id')
    para('Step 2: Login')
    bullet('On the Landing Page, click the "Login" button at the top-right corner.')
    bullet('Enter your Work Email address.')
    bullet('Enter your Security Password.')
    bullet('Click "Sign In with Password".')
    y += 2
    para('Alternative Login (Magic Link): Enter your email and click "Email Magic Link". A secure login link will be sent to your inbox.')
    para('Step 3: Registration (New Organization):')
    bullet('Click "Register Organization" on the login page.')
    bullet('Fill in: First Name, Last Name, Organization Name, Email, and Password.')
    bullet('Click "Create Account". A confirmation email will be sent \u2014 click the verification link.')
    y += 2
    para('Changing Password: Navigate to Profile Settings > Security Credentials, enter current password, new password, and confirm. Click "Update Security Key".')
    para('Forgot Password: Click "Forgot password?" on the login page, enter your email, and follow the password reset instructions.')
    y += 3

    subTitle('2.5 System Organization & Navigation')
    para('After logging in, the user is directed to the Dashboard. The system is organized through a left-side navigation bar (Sidebar):')

    table(['Section', 'Menu Items', 'Description'], [
        ['Main', 'Dashboard, Risk Assessment, Security Audit', 'Central overview, project management, and audit center.'],
        ['AI & Reporting', 'AI Security Advisor, Risk Register', 'AI-powered advisory and consolidated risk view.'],
        ['Admin Control', 'Admin Overview, Security Command Center, Users Management, Organization Profile, Project Report', '(Admin only) System administration and team management.'],
        ['Account', 'Profile Settings, Log Out', 'User profile management and session termination.'],
    ], [15, 23, 42])

    subTitle('2.6 Exiting the System')
    para('To properly exit the system:')
    numberedItem('1.', 'Click on your avatar/profile icon in the top-right corner of the navigation bar.')
    numberedItem('2.', 'Select "Sign Out" from the dropdown menu.')
    numberedItem('3.', 'You will be redirected to the Landing Page, confirming a successful logout.')
    y += 2
    para('Alternatively, click "Log Out" in the left sidebar under the Account section.')
    para('Important: Always use the Sign Out function rather than simply closing the browser tab to ensure your session is properly terminated and security tokens are invalidated.')
    y += 5

    // ==================== 3. USING THE SYSTEM ====================
    sectionTitle('3. Using the System')
    para('The following sub-sections provide detailed, step-by-step instructions on how to use the various functions and features of the Risk Shield System (RSS).')

    subTitle('3.1 Dashboard')
    para('The Dashboard is the central command center of Risk Shield System. Upon successful login, the user is presented with a comprehensive overview of their organization\'s cybersecurity posture:')
    bullet('Welcome Banner: Personalized greeting with the user\'s first name and a dynamic background.')
    bullet('Statistics Cards: Four summary cards showing Total Projects, Critical Risks, High Risks, and Total Risks across all projects.')
    bullet('Recent Projects: A list of the 5 most recent risk assessment projects with progress indicators and status badges.')
    bullet('Risk Matrix Heatmap: A 5\u00d75 interactive matrix showing the distribution of risks across Likelihood (Y-axis) and Impact (X-axis). Colors range from green (Low) to red (Critical). Clicking a cell reveals the risks in that position.')
    bullet('Strategic Timeline: Shows the primary active project, days remaining until deadline, current velocity (progress percentage), and team assignments.')
    bullet('AI Security Advisor Card: Provides real-time strategic advice based on the current risk posture, powered by Google Gemini AI.')
    bullet('Top Vulnerable Assets: Lists the highest-impact assets requiring immediate protection.')
    bullet('Risk Distribution Chart: A pie chart showing the proportion of Critical, High, Medium, and Low risks.')
    bullet('Risk Posture Trend: An area chart showing the security trajectory over the last 7 weeks.')
    bullet('Compliance Pulse: A summary card showing the overall OCTAVE Allegro compliance health percentage.')
    y += 5

    subTitle('3.2 Risk Assessment Wizard (8-Step OCTAVE Allegro)')
    para('The Wizard is the core feature of the system, guiding users through the complete 8-step OCTAVE Allegro risk assessment process.')
    para('Accessing the Wizard:')
    numberedItem('1.', 'Navigate to "Risk Assessment" (Projects) from the sidebar.')
    numberedItem('2.', 'Click "New Assessment" to create a new project, or click "Open" on an existing project.')
    numberedItem('3.', 'The wizard opens with a Step Indicator at the top showing progress (Steps 1\u20138).')
    y += 3

    subSubTitle('3.2.1 Step 1: Risk Measurement Criteria')
    para('Define impact scales for each of the 4 domains (Financial, Reputational, Legal, Operational) at 5 severity levels (1\u20135). Also define Likelihood scales. Click "Save & Continue" to proceed.')
    subSubTitle('3.2.2 Step 2: Critical Asset Profile')
    para('Add critical information assets. For each asset, specify: Name, Type (Data/System/Application/Network/Physical/Service/Personnel), Description, Owner, and CIA values (1\u20135). The system calculates an Overall Criticality Score.')
    subSubTitle('3.2.3 Step 3: Information Asset Containers')
    para('Create containers (Physical, Technical, People, Process) and map them to assets. This defines where each asset is stored, processed, or transmitted.')
    subSubTitle('3.2.4 Step 4: Areas of Concern')
    para('For each container, document security concerns categorized by CIA dimension (Confidentiality, Integrity, or Availability) and priority level (Low, Medium, High).')
    subSubTitle('3.2.5 Step 5: Threat Scenarios')
    para('Develop detailed threat scenarios. Specify: Threat Actor (External Attacker, Insider, Natural Disaster), Threat Vector (Network, Physical, Social Engineering), Motivation, Capability Level, and link each scenario to a specific asset and container.')
    subSubTitle('3.2.6 Step 6: Risk Identification & Analysis')
    para('For each threat scenario, create a risk entry with Likelihood (1\u20135) and Impact (1\u20135). The system auto-calculates: Risk Score = Likelihood \u00d7 Impact, and assigns a Risk Level: Low (\u22646), Medium (\u226412), High (\u226416), Critical (\u226425). Impact is broken down into Financial, Reputational, Legal, and Operational sub-scores.')
    subSubTitle('3.2.7 Step 7: Detailed Risk Analysis')
    para('Perform root cause analysis, document existing controls (firewalls, policies, training), and assess control effectiveness. Calculate residual risk after existing controls are accounted for.')
    subSubTitle('3.2.8 Step 8: Mitigation Strategy')
    para('Define treatment strategies for each risk: Mitigate (reduce likelihood/impact), Transfer (insurance/outsource), Accept (risk is within tolerance), or Avoid (eliminate the activity). Each plan includes mitigation description, priority, estimated cost, timeline, and responsible party.')
    y += 5

    subTitle('3.3 Security Audit Center')
    para('Accessing: Navigate to "Security Audit" from the sidebar, then select a project to audit.')
    para('Features:')
    bullet('Audit Checklist: Auto-generated checklist items based on OCTAVE Allegro controls. Each item can be marked as Compliant, Non-Compliant, Partial, or Not Applicable by authorized Auditors.')
    bullet('Evidence Upload: Upload supporting evidence files (PDF, JPG, PNG, DOCX, up to 10MB) linked to specific audit items. Evidence is stored securely in Supabase Storage with RLS protection.')
    bullet('Audit Findings: Non-compliant items are automatically flagged. Auditors can add detailed findings with severity classifications (Low, Medium, High, Critical) and remediation timelines.')
    bullet('Compliance Score: Real-time calculation of the organization\'s overall compliance percentage, displayed on both the Audit Center and Dashboard.')
    y += 3

    subTitle('3.4 AI Security Advisor')
    para('Accessing: Navigate to "AI & Reporting > AI Security Advisor" from the sidebar.')
    para('Features:')
    bullet('Executive Summary: AI generates a high-level, management-readable summary of the organization\'s overall risk posture based on all assessment data.')
    bullet('Mitigation Recommendations: For each identified risk, the AI provides specific, technical remediation steps with implementation priorities.')
    bullet('Technical Translation: AI translates complex security gaps into language suitable for executive reporting and board presentations.')
    y += 2
    para('Important: AI recommendations are advisory only. The AI never modifies calculated risk scores or assessment data. All AI-generated content should be reviewed by qualified security professionals before implementation.')
    y += 3

    subTitle('3.5 Report Generation')
    para('Accessing: Navigate to any project and click the "Export Report" button, or use the Risk Register for consolidated views.')
    para('Available Formats:')
    bullet('PDF: Professional, paginated report with cover page, table of contents, risk matrix visualization, and detailed findings. Generated client-side using jsPDF.')
    bullet('DOCX (Word): Editable format for further customization and integration with organizational document templates.')
    bullet('CSV (Excel): Raw data export for advanced analysis, pivot tables, and custom visualizations.')
    y += 3

    subTitle('3.6 Profile Settings')
    para('Accessing: Navigate to "Account > Profile Settings" from the sidebar.')
    para('Features:')
    bullet('Avatar Upload: Upload a profile photo (JPG, PNG, WEBP, max 5MB). The system replaces existing photos and refreshes the UI instantly across all components.')
    bullet('Display Identity: Update your first name and last name, reflected throughout the system.')
    bullet('Security Credentials: Change your password. Requires current password verification for security. Input is automatically trimmed to prevent whitespace errors.')
    bullet('Change Email: Update your login email address. Requires identity verification (current password) and email confirmation via a verification link sent to the new address.')
    y += 3

    subTitle('3.7 Admin Control Panel (Admin Only)')
    para('Accessing: Navigate to "Admin Control" from the sidebar. This section is only visible to users with the Admin role.')
    para('Features:')
    bullet('Admin Overview: Dashboard summary of system-wide statistics, user counts, and organizational metrics.')
    bullet('Security Command Center: System integrity scanner, active session forensics, security event logs, and MFA readiness roadmap.')
    bullet('Users Management: View all registered users within the organization. Assign roles (Admin, Auditor, Auditee), activate or deactivate user accounts.')
    bullet('Organization Profile: Update organization details including name, industry, size, address, and contact information.')
    bullet('Project Report: Download the official Mini Project Report with identity verification (restricted to authorized team members).')
    y += 5

    // ==================== 4. TROUBLESHOOTING ====================
    sectionTitle('4. Troubleshooting & Support')

    subTitle('4.1 Error Messages')
    para('The following table lists common error messages, their likely causes, and corrective actions:')

    table(['Error Message', 'Likely Cause', 'Corrective Action'], [
        ['"Invalid login credentials"', 'Incorrect email or password, or accidental whitespace.', 'Verify credentials. The system auto-trims whitespace. Try again or use Magic Link login.'],
        ['"Email not confirmed"', 'Account registered but email not verified.', 'Check inbox (and spam folder) for confirmation email. Click the verification link.'],
        ['"Identity verification failed"', 'Wrong password during re-authentication for sensitive operations.', 'Enter your CURRENT password, not the new one. Check for typos.'],
        ['"Failed to upload image"', 'File too large or unsupported format.', 'Ensure file is JPG, PNG, or WEBP and under 5MB.'],
        ['"You don\'t have permission"', 'User role lacks access to the requested feature.', 'Contact your administrator to adjust role permissions.'],
        ['"Foreign key violation"', 'Database integrity error during evidence upload.', 'System-level issue. Contact administrator. The uploaded_by field must reference a valid profile ID.'],
        ['"No projects found"', 'User profile linked to different organization than project data.', 'Contact administrator to verify your organization assignment.'],
    ], [239, 68, 68])

    subTitle('4.2 Special Considerations')
    bullet('Browser Compatibility: The system is optimized for modern browsers. Internet Explorer is NOT supported.')
    bullet('Mobile Usage: The system is responsive and accessible on tablets and smartphones, but the full desktop experience is recommended for complex tasks like the 8-step wizard.')
    bullet('Data Persistence: All data is automatically saved to the cloud database. Data is persisted when you click "Save & Continue" or submit a form \u2014 there is no separate "Save" button.')
    bullet('AI Availability: The AI Security Advisor requires a valid Google Gemini API key. If the AI service is temporarily unavailable, all risk assessment and audit functions continue to work normally without AI recommendations.')
    bullet('Concurrent Users: The system supports multiple concurrent users within the same organization. Real-time data synchronization ensures all users see the latest information.')
    y += 5

    subTitle('4.3 Support')
    para('For technical support or to report issues, please contact the development team:')

    table(['Contact Name', 'Organization', 'Student ID', 'Email', 'Role', 'Responsibility'], [
        ['Wisnu Alfian Nur Ashar', 'President University', '001202400138', 'wisnualfian117@gmail.com', 'Lead Developer', 'System architecture, backend, deployment'],
        ['Muhammad Ilham Maulana', 'President University', '001202400034', 'ilham36677@gmail.com', 'Developer', 'Frontend development, UI/UX design'],
        ['Christofer S.R. Sitompul', 'President University', '001202400079', 'refotsirhc2@gmail.com', 'Developer', 'Database design, SQL schema'],
        ['Muhammad Ahda B.', 'President University', '001202400081', 'muhahdabriliantama01@gmail.com', 'Developer', 'Testing, documentation'],
        ['Rafa Basia Hanif', 'President University', '001202400043', 'rafabasia2208@gmail.com', 'Developer', 'Risk engine, report generation'],
    ], [15, 23, 42])

    para('Reporting Issues:')
    numberedItem('1.', 'Navigate to the Support page from the sidebar.')
    numberedItem('2.', 'Describe the issue in detail, including steps to reproduce the error.')
    numberedItem('3.', 'Include any error messages displayed on screen.')
    numberedItem('4.', 'The support team will respond within 24\u201348 hours.')
    y += 3
    para('Security Incident Handling:')
    numberedItem('1.', 'Immediately change your password via Profile Settings > Security Credentials.')
    numberedItem('2.', 'Notify the system administrator via email.')
    numberedItem('3.', 'Document the incident (time, date, actions observed).')
    numberedItem('4.', 'The administrator will review the audit_logs table for forensic analysis.')

    // ==================== PAGE FOOTERS ====================
    const totalPages = doc.internal.pages.length - 1
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(7)
        doc.setTextColor(148, 163, 184)
        if (i > 1) { // skip cover page
            doc.text(`Risk Shield System \u2014 Mini Project Report \u2014 Page ${i - 1}/${totalPages - 1}`, PW / 2, PH - 8, { align: 'center' })
        }
    }

    // Footer on cover
    doc.setPage(1)

    doc.save('Mini_Project_Report_Risk_Shield_System.pdf')
}
