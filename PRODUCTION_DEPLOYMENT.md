# Production Deployment Configuration

## Overview
This document outlines the production deployment configuration for the Nepal Reforms platform, including environment variables, Vercel settings, and performance optimizations.

## Environment Variables

### Required for Production

#### Supabase Configuration
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (client-accessible)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key (client-accessible)
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-only, admin operations)

#### Site Configuration
- `NEXT_PUBLIC_SITE_URL`: Production domain URL (e.g., https://nepal-reforms.vercel.app)
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`: Development redirect URL for auth callbacks

### Optional Environment Variables
- `ANALYZE`: Set to 'true' to enable bundle analysis during build
- `RESEND_API_KEY`: For email functionality (if using Resend)

## Vercel Configuration (vercel.json)

### Performance Optimizations
- **Static Asset Caching**: 1-year cache for hashed static files with immutable headers
- **API Route Caching**: 2-5 minute cache for API responses with stale-while-revalidate
- **Brotli Compression**: Enabled for static assets to reduce bandwidth usage
- **Function Timeout**: 30-second timeout for API routes

### Security Headers
- `X-Frame-Options: DENY` - Prevents clickjacking attacks
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information

### Redirects and Rewrites
- `/home` → `/` (permanent redirect)
- `/dashboard` → `/admin` (temporary redirect)
- Health check endpoint rewrite for monitoring

## Next.js Configuration Optimizations

### Production Features
- **Image Optimization**: Enabled with WebP/AVIF support for better performance
- **Compression**: Gzip/Brotli compression enabled
- **Bundle Analysis**: Available via `ANALYZE=true` environment variable
- **Tree Shaking**: Enhanced for Recharts and Lucide React libraries

### Development vs Production
- ESLint and TypeScript errors only ignored in development
- Image optimization enabled in production
- Enhanced webpack optimizations for production builds

## Edge Middleware Enhancements

### Lightweight Operations
- **Authentication**: Session management via Supabase middleware
- **Geolocation**: Country detection for analytics (no heavy processing)
- **Security Headers**: Added at edge level for all responses

### Performance Considerations
- Minimal processing to maintain edge performance
- No database calls or heavy computations in middleware
- Efficient pattern matching for route exclusions

## Deployment Checklist

### Before Deployment
1. ✅ Set all required environment variables in Vercel dashboard
2. ✅ Verify `NEXT_PUBLIC_SITE_URL` points to production domain
3. ✅ Ensure Supabase RLS policies are properly configured
4. ✅ Test authentication flow with production URLs
5. ✅ Run bundle analysis to verify size optimizations

### Post-Deployment Verification
1. ✅ Check Core Web Vitals in Vercel Analytics
2. ✅ Verify caching headers are properly set
3. ✅ Test authentication and database operations
4. ✅ Monitor function execution times and errors
5. ✅ Validate security headers using security scanners

## Performance Metrics

### Expected Improvements
- **Bundle Size**: 70-80% reduction through tree shaking and dynamic imports
- **Cache Hit Rate**: 85%+ for static assets and API responses
- **First Contentful Paint**: <1.5s on 3G networks
- **Time to Interactive**: <3s on average connections

### Monitoring
- Use Vercel Analytics for Core Web Vitals tracking
- Monitor function execution times and error rates
- Track cache hit rates and bandwidth usage
- Set up alerts for performance degradation

## Security Considerations

### Environment Variable Scoping
- `NEXT_PUBLIC_*` variables are client-accessible (use for non-sensitive data)
- Server-only variables (like `SUPABASE_SERVICE_ROLE_KEY`) are never exposed to client
- All database operations use appropriate client types based on context

### Supabase Security
- Row Level Security (RLS) enabled for all tables
- Anonymous key used for client operations (limited permissions)
- Service role key used only in server contexts for admin operations
- All client queries filtered through RLS policies

## Troubleshooting

### Common Issues
1. **Environment Variables**: Ensure proper scoping (NEXT_PUBLIC_ vs server-only)
2. **Caching**: Clear Vercel cache if updates aren't reflecting
3. **Authentication**: Verify redirect URLs match environment settings
4. **Performance**: Use bundle analyzer to identify large dependencies

### Debug Tools
- Bundle analyzer: `ANALYZE=true npm run build`
- Vercel logs: Check function logs in Vercel dashboard
- Network tab: Verify caching headers and response times
- Lighthouse: Regular performance audits
