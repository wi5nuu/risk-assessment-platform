# OCTAVE Allegro Risk Assessment Platform - Deployment Guide

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Vercel account

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ocrnmhyawvxhpssadhmz.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_mzLs6tXUswXDCR14M9zOeg_Vcs_rrCs
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Application Configuration
NEXT_PUBLIC_APP_NAME="OCTAVE Allegro Risk Assessment Platform"
NEXT_PUBLIC_APP_VERSION=1.0.0

# Gemini AI Service (Required for AI features)
GOOGLE_AI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_GOOGLE_AI_PROJECT_ID=gen-lang-client-0356530426
NEXT_PUBLIC_GOOGLE_AI_PROJECT_NUMBER=877194259061
```

## Database Setup

1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Run the schema from `sql/schema.sql`
4. Enable Row Level Security (RLS) policies

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Vercel Deployment

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option 2: Git Integration

1. Push code to GitHub/GitLab/Bitbucket
2. Import project in Vercel Dashboard
3. Configure environment variables
4. Deploy

## Post-Deployment Checklist

- [ ] Verify database connection
- [ ] Test authentication flow
- [ ] Verify RLS policies are working
- [ ] Test all 8 OCTAVE steps
- [ ] Verify risk calculations
- [ ] Test PDF report generation
- [ ] Check security headers
- [ ] Run Lighthouse audit

## Security Considerations

1. **Never commit `.env.local` to git**
2. Use strong passwords for Supabase
3. Enable 2FA on all accounts
4. Regularly rotate API keys
5. Monitor audit logs

## Troubleshooting

### Build Errors
- Check Node.js version (18+)
- Clear `.next` folder and rebuild
- Verify all dependencies installed

### Database Connection Issues
- Verify Supabase URL and keys
- Check RLS policies
- Ensure database is not paused

### Authentication Issues
- Verify Supabase Auth is enabled
- Check redirect URLs in Supabase Dashboard
- Clear browser cookies/cache

## Support

For issues and feature requests, please contact your system administrator.
