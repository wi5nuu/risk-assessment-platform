# OCTAVE Allegro Risk Assessment Platform

A production-grade, AI-assisted cybersecurity risk assessment platform strictly following the official OCTAVE Allegro methodology developed by Carnegie Mellon University.

## Features

### Core Methodology (OCTAVE Allegro 8 Steps)

1. **Step 1: Establish Risk Measurement Criteria**
   - Define impact criteria (Financial, Reputational, Legal, Operational)
   - Define likelihood criteria (1-5 scale)
   - Customizable for organization context

2. **Step 2: Develop Information Asset Profile**
   - Asset inventory management
   - Security attributes (CIA: Confidentiality, Integrity, Availability)
   - Impact value assignment
   - Asset classification

3. **Step 3: Identify Information Asset Containers**
   - Container mapping (Physical, Technical, People, Process)
   - Asset-container relationships
   - Security controls documentation

4. **Step 4: Identify Areas of Concern**
   - Concern documentation per container
   - Category classification (Confidentiality, Integrity, Availability, Compliance, Operational)
   - Priority assignment

5. **Step 5: Identify Threat Scenarios**
   - Threat actor profiling
   - Attack vector documentation
   - Motivation and capability assessment
   - Likelihood estimation

6. **Step 6: Identify Risks**
   - Risk-vulnerability-threat mapping
   - Automatic risk score calculation
   - Impact breakdown tracking

7. **Step 7: Analyze Risks**
   - Existing controls assessment
   - Control effectiveness rating
   - Residual risk calculation
   - Root cause analysis

8. **Step 8: Select Mitigation Approach**
   - Treatment strategy selection (Mitigate, Transfer, Accept, Avoid)
   - Mitigation plan development
   - Implementation tracking

### Risk Engine

- **Formula**: Risk Score = Likelihood × Impact
- **Impact Calculation**: Maximum of (Financial, Reputational, Legal, Operational)
- **Risk Classification**:
  - 1-5: Low (Green)
  - 6-10: Medium (Yellow)
  - 11-15: High (Orange)
  - 16-25: Critical (Red)
- **Residual Risk**: Calculated based on control effectiveness

### Visualizations

- **5×5 Risk Matrix Heatmap**: Interactive visualization of risk distribution
- **Risk Register**: Enterprise-grade table with filtering and sorting
- **Dashboard**: Project overview and risk statistics

### Security Features

- Row Level Security (RLS) with PostgreSQL
- Role-Based Access Control (Admin, Auditor, Viewer)
- Input validation with Zod
- CSRF protection
- Secure HTTP headers
- JWT-based authentication

### AI Features (Optional)

- Mitigation recommendation generation
- Executive summary generation
- Technical-to-management language translation

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth with JWT
- **Validation**: Zod
- **Testing**: Jest
- **Deployment**: Vercel

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard page
│   │   ├── risk-register/     # Risk register page
│   │   ├── wizard/            # OCTAVE wizard
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── risk/             # Risk components (Matrix, Register)
│   │   └── wizard/           # Wizard components
│   ├── lib/
│   │   ├── risk-engine/      # Risk calculation engine
│   │   ├── supabase/         # Supabase clients
│   │   ├── validation/       # Zod schemas
│   │   └── utils.ts          # Utility functions
│   ├── types/
│   │   ├── database.ts       # Database types
│   │   └── index.ts          # Application types
│   └── __tests__/            # Unit tests
├── sql/
│   └── schema.sql            # Database schema
├── public/                   # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
├── jest.config.js
└── README.md
```

## Database Schema

### Core Tables

- `organizations` - Organization data
- `user_profiles` - User profiles with roles
- `projects` - Risk assessment projects
- `risk_measurement_criteria` - Step 1 criteria
- `assets` - Information assets (Step 2)
- `containers` - Asset containers (Step 3)
- `asset_container_mapping` - Many-to-many mapping
- `concerns` - Areas of concern (Step 4)
- `threat_scenarios` - Threat scenarios (Step 5)
- `risks` - Identified risks (Step 6)
- `risk_analysis` - Risk analysis data (Step 7)
- `mitigation_plans` - Mitigation plans (Step 8)
- `audit_logs` - Audit trail
- `attachments` - File attachments

### Key Features

- UUID primary keys
- Foreign key constraints with ON DELETE rules
- 3NF normalization
- Row Level Security (RLS) policies
- Soft delete strategy
- Automatic timestamp updates

## Risk Calculation

### Input Validation

```typescript
// Likelihood: 1-5 integer
// Impact: 1-5 integer
validateLikelihood(3) // true
validateImpact(5)     // true
```

### Score Calculation

```typescript
const score = calculateRiskScore(likelihood, impact)
// Example: calculateRiskScore(4, 5) = 20
```

### Level Determination

```typescript
const level = determineRiskLevel(score)
// 1-5   → 'low'
// 6-10  → 'medium'
// 11-15 → 'high'
// 16-25 → 'critical'
```

### Residual Risk

```typescript
const residual = calculateResidualRisk(
  inherentLikelihood,
  inherentImpact,
  controlEffectiveness // 1-5
)
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd octave-allegro-risk
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

4. Set up the database:
- Run `sql/schema.sql` in Supabase SQL Editor

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## API Endpoints

### Risks

- `GET /api/risks?projectId={id}` - List risks
- `POST /api/risks` - Create risk
- `PATCH /api/risks` - Update risk
- `DELETE /api/risks?id={id}` - Delete risk

### Reports

- `GET /api/reports?projectId={id}&type={type}` - Generate report

## Security

### Authentication Flow

1. User signs in via Supabase Auth
2. JWT token stored in cookies
3. Middleware validates token on protected routes
4. RLS policies enforce data access control

### Role-Based Access

- **Admin**: Full access to all features
- **Auditor**: Can create projects and assessments
- **Viewer**: Read-only access to reports

### Security Headers

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Content-Security-Policy: Configured

## Methodology Compliance

This platform strictly adheres to the OCTAVE Allegro methodology:

- Asset-centric risk identification
- No risk without associated information asset
- Threat scenarios linked to containers
- Risk originates from vulnerability + threat + asset
- Sequential step enforcement
- Audit trail per step completion

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- OCTAVE Allegro methodology by Carnegie Mellon University
- Software Engineering Institute (SEI)
- Supabase team for the excellent backend platform

## Support

For support, please contact your system administrator or open an issue in the repository.
