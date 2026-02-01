# ZoneWise V2 - Deployment Checklist

## Pre-Deployment Verification

### Environment Variables

#### Required (Backend)
- [ ] `DATABASE_URL` - MySQL/TiDB connection string
- [ ] `JWT_SECRET` - Session cookie signing secret
- [ ] `OAUTH_SERVER_URL` - Manus OAuth backend
- [ ] `OWNER_OPEN_ID` - Owner's Manus ID
- [ ] `OWNER_NAME` - Owner's name
- [ ] `BUILT_IN_FORGE_API_URL` - Manus built-in APIs
- [ ] `BUILT_IN_FORGE_API_KEY` - Server-side API key

#### Required (Frontend)
- [ ] `VITE_APP_ID` - Manus OAuth application ID
- [ ] `VITE_OAUTH_PORTAL_URL` - Manus login portal
- [ ] `VITE_FRONTEND_FORGE_API_KEY` - Frontend API key
- [ ] `VITE_FRONTEND_FORGE_API_URL` - Frontend API URL
- [ ] `VITE_APP_TITLE` - Application title
- [ ] `VITE_APP_LOGO` - Application logo URL

#### Required (Supabase)
- [ ] `SUPABASE_URL` - Supabase project URL
- [ ] `SUPABASE_ANON_KEY` - Public anon key
- [ ] `SUPABASE_SERVICE_KEY` - Service role key (server-side only)

#### Optional (Analytics)
- [ ] `VITE_ANALYTICS_ENDPOINT` - Analytics endpoint
- [ ] `VITE_ANALYTICS_WEBSITE_ID` - Website ID

#### Optional (Stripe)
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key (if payments enabled)

### Database Setup

- [ ] Database accessible from deployment environment
- [ ] All migrations applied (`pnpm db:push`)
- [ ] Tables created:
  - [ ] `users`
  - [ ] `subscriptions`
  - [ ] `usage_tracking`
  - [ ] `properties`
  - [ ] `chatSessions`
  - [ ] `chatMessages`
  - [ ] `exports`
  - [ ] `teamMembers`

### Supabase Setup

- [ ] Supabase project created
- [ ] Tables exist:
  - [ ] `jurisdictions`
  - [ ] `zoning_districts`
- [ ] Row Level Security (RLS) configured
- [ ] API keys generated
- [ ] Connection tested from deployment environment

### Build Verification

```bash
# Test build locally
pnpm build

# Check for errors
# Verify output in dist/ directory
# Test production build locally
pnpm preview
```

- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] No missing dependencies
- [ ] Assets properly bundled

### Functionality Testing

#### Authentication
- [ ] Login flow works
- [ ] Logout works
- [ ] Session persistence works
- [ ] Protected routes redirect to login

#### Chat Interface
- [ ] Create new session
- [ ] Send messages
- [ ] Receive AI responses
- [ ] Tool calls execute correctly
- [ ] Activities display properly
- [ ] Session search works
- [ ] Session deletion works
- [ ] Session renaming works

#### Supabase Integration
- [ ] Jurisdiction queries work
- [ ] Zoning district search works
- [ ] Tool calling retrieves real data
- [ ] Error handling for failed queries

#### Property Analysis
- [ ] Property search works
- [ ] Zoning information displays
- [ ] 3D visualization loads
- [ ] Map view works
- [ ] Sun/shadow analysis works

#### Mobile Responsiveness
- [ ] Layout adapts to mobile screens
- [ ] Sidebars collapse properly
- [ ] Touch interactions work
- [ ] No horizontal scrolling
- [ ] Readable text sizes

### Performance

- [ ] Initial load < 3 seconds
- [ ] Time to interactive < 5 seconds
- [ ] No memory leaks
- [ ] Smooth scrolling
- [ ] Fast navigation between sessions

### Security

- [ ] API keys not exposed in frontend code
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] SQL injection prevention (using Drizzle ORM)
- [ ] XSS prevention (React escaping)
- [ ] CSRF protection (session cookies)

### Error Handling

- [ ] Network errors show user-friendly messages
- [ ] Database errors don't crash app
- [ ] LLM errors fallback gracefully
- [ ] Tool call failures handled
- [ ] 404 pages work
- [ ] 500 errors caught

## Deployment Steps

### 1. Prepare Environment

```bash
# Clone repository
git clone https://github.com/breverdbidder/zonewise-v2.git
cd zonewise-v2

# Install dependencies
pnpm install

# Set environment variables
# (Copy from .env.example and fill in values)
```

### 2. Database Migration

```bash
# Apply database schema
pnpm db:push

# Verify tables created
# Check database dashboard or run:
# SELECT table_name FROM information_schema.tables WHERE table_schema = 'your_db_name';
```

### 3. Build Application

```bash
# Build for production
pnpm build

# Output will be in dist/ directory
```

### 4. Deploy to Hosting

#### Option A: Manus Hosting (Recommended)
- [ ] Push code to GitHub
- [ ] Create checkpoint in Manus
- [ ] Click "Publish" button in Management UI
- [ ] Custom domain configured (if needed)

#### Option B: Custom Hosting (Vercel, Netlify, etc.)
- [ ] Configure build command: `pnpm build`
- [ ] Configure output directory: `dist`
- [ ] Set all environment variables
- [ ] Deploy

### 5. Post-Deployment Verification

- [ ] Visit deployed URL
- [ ] Test login
- [ ] Create test session
- [ ] Send test message
- [ ] Verify tool calling works
- [ ] Check analytics (if configured)
- [ ] Monitor error logs

### 6. Monitoring Setup

- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure uptime monitoring
- [ ] Set up database backups
- [ ] Configure log aggregation
- [ ] Set up performance monitoring

## Rollback Plan

If deployment fails:

1. **Immediate Rollback**
   ```bash
   # Revert to previous checkpoint
   git checkout <previous-commit>
   pnpm install
   pnpm build
   # Redeploy
   ```

2. **Database Rollback**
   ```bash
   # If migrations cause issues:
   # Restore database from backup
   # Or manually revert schema changes
   ```

3. **Communication**
   - Notify users of downtime
   - Post status updates
   - Provide ETA for fix

## Post-Deployment Tasks

- [ ] Update documentation with deployment URL
- [ ] Notify team of successful deployment
- [ ] Monitor for first 24 hours
- [ ] Collect user feedback
- [ ] Address any issues promptly

## Maintenance Schedule

### Daily
- Check error logs
- Monitor performance metrics
- Review user feedback

### Weekly
- Database backup verification
- Security updates check
- Performance optimization review

### Monthly
- Dependency updates
- Security audit
- Feature usage analysis
- Cost optimization review

## Support Contacts

- **Technical Issues**: [Your Email]
- **Database**: [DBA Contact]
- **Hosting**: [Hosting Provider Support]
- **Supabase**: support@supabase.io

## Emergency Procedures

### Database Down
1. Check Supabase status
2. Verify connection string
3. Check firewall rules
4. Contact Supabase support

### LLM API Down
1. Check Manus API status
2. Verify API keys
3. Test with curl
4. Fallback to cached responses

### Application Crash
1. Check error logs
2. Verify environment variables
3. Restart application
4. Rollback if needed

## Success Criteria

Deployment is successful when:
- [ ] All functionality tests pass
- [ ] No critical errors in logs
- [ ] Performance metrics meet targets
- [ ] Users can complete core workflows
- [ ] Monitoring systems operational

## Notes

- Keep this checklist updated with each deployment
- Document any issues encountered
- Share learnings with team
- Continuously improve deployment process
