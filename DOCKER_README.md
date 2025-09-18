# Docker Configuration for Nepal Reforms Platform

This directory contains comprehensive Docker configuration for the Nepal Reforms Platform, supporting local development, production deployment, and AWS Lambda deployment.

## 📋 Overview

The Docker setup includes:
- **Development environment** with hot reload and debugging
- **Production-ready containers** with optimizations
- **AWS Lambda deployment** for serverless hosting
- **Multi-stage builds** for optimal image sizes
- **Health checks** and proper signal handling
- **Security best practices** with non-root users

## 🚀 Quick Start

### Local Development
```bash
# Clone and setup
cd NepalReform-main
cp .env.local.example .env.local
# Edit .env.local with your configuration

# Run development server with hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up web-dev

# Or using the build script
./scripts/docker/build.sh development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up web-dev
```

### Production
```bash
# Build and run production container
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up web

# Or using the build script
./scripts/docker/build.sh production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up web
```

### AWS Lambda
```bash
# Build Lambda image
./scripts/docker/build.sh lambda

# Deploy to AWS (requires AWS CLI configured)
./scripts/docker/deploy-lambda.sh
```

## 📁 File Structure

```
├── Dockerfile              # Main production Dockerfile
├── Dockerfile.dev         # Development Dockerfile with hot reload
├── Dockerfile.lambda      # AWS Lambda-specific Dockerfile
├── docker-compose.yml     # Base compose configuration
├── docker-compose.dev.yml # Development overrides
├── docker-compose.prod.yml# Production overrides
├── lambda-handler.js      # AWS Lambda handler
├── .dockerignore          # Files to exclude from Docker context
└── scripts/docker/        # Build and deployment scripts
    ├── build.sh           # Unix build script
    ├── build.bat          # Windows build script
    └── deploy-lambda.sh   # AWS Lambda deployment script
```

## 🛠️ Configuration Files

### Dockerfile (Production)
- Multi-stage build for optimal image size
- Non-root user for security
- Health checks and signal handling
- Optimized for Next.js standalone output

### Dockerfile.dev (Development)
- Hot reload support with volume mounting
- Development dependencies included
- File watching with polling for cross-platform compatibility
- Debug-friendly configuration

### Dockerfile.lambda (AWS Lambda)
- AWS Lambda Runtime Interface Emulator compatible
- Custom Lambda handler for Next.js
- Optimized for serverless cold starts
- Production dependencies only

## 🔧 Build Scripts

### Unix/Linux/macOS
```bash
# Build specific target
./scripts/docker/build.sh [development|production|lambda|all] [tag] [registry_url]

# Examples
./scripts/docker/build.sh development
./scripts/docker/build.sh production latest
./scripts/docker/build.sh all latest your-registry.com
```

### Windows
```cmd
# Build specific target
scripts\docker\build.bat [development|production|lambda|all] [tag] [registry_url]

# Examples
scripts\docker\build.bat development
scripts\docker\build.bat production latest
scripts\docker\build.bat all latest your-registry.com
```

## 🌐 Environment Variables

Required environment variables for all configurations:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site Configuration
NEXT_PUBLIC_SITE_URL=your-site-url

# Optional
RESEND_API_KEY=your-resend-api-key
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

## 📊 Health Checks

All containers include health check endpoints:
- **Endpoint**: `/api/health`
- **Method**: GET or HEAD
- **Response**: JSON with system status
- **Interval**: 30 seconds
- **Timeout**: 30 seconds
- **Retries**: 3

Example health check response:
```json
{
  "uptime": 123.456,
  "message": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "status": "healthy",
  "environment": "production",
  "version": "1.0.0"
}
```

## 🔒 Security Features

- **Non-root user**: All containers run as `nextjs` user (UID 1001)
- **Security headers**: CSP, HSTS, and other security headers
- **Minimal attack surface**: Production images exclude dev dependencies
- **Secret management**: Environment variables provided at runtime
- **Signal handling**: Proper SIGTERM handling with dumb-init

## ⚡ Performance Optimizations

- **Multi-stage builds**: Separate build and runtime stages
- **Layer caching**: Optimized layer ordering for better caching
- **Bundle optimization**: Tree shaking and code splitting
- **Image compression**: Alpine Linux base images
- **Resource limits**: Configurable CPU and memory limits

## 🚀 Deployment Options

### Local Development
```bash
# Start development server
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up web-dev

# Access at http://localhost:3001
```

### Production with Docker Compose
```bash
# Start production server
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up web

# Access at http://localhost:3000
```

### AWS Lambda Deployment
```bash
# Prerequisites
aws configure  # Setup AWS credentials
export AWS_REGION=us-east-1
export ECR_REPOSITORY=nepal-reforms
export LAMBDA_FUNCTION_NAME=nepal-reforms-platform

# Deploy
./scripts/docker/deploy-lambda.sh
```

### Manual Docker Run
```bash
# Development
docker run -p 3000:3000 --env-file .env.local nepal-reforms:dev-latest

# Production
docker run -p 3000:3000 --env-file .env.local nepal-reforms:prod-latest

# Lambda (local testing)
docker run -p 9000:8080 --env-file .env.local nepal-reforms:lambda-latest
```

## 🧪 Testing

### Local Testing
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test with different environments
NODE_ENV=development curl http://localhost:3000/api/health
NODE_ENV=production curl http://localhost:3000/api/health
```

### Lambda Testing
```bash
# Local Lambda testing
docker run -p 9000:8080 nepal-reforms:lambda-latest

# Test Lambda function
curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" \
  -d '{"httpMethod":"GET","path":"/api/health","queryStringParameters":{},"headers":{}}'
```

## 🔍 Troubleshooting

### Common Issues

**1. Build fails with permission errors**
```bash
# Fix file permissions
chmod +x scripts/docker/build.sh
chmod +x scripts/docker/deploy-lambda.sh
```

**2. Environment variables not loading**
```bash
# Verify .env.local exists and has correct format
cat .env.local | grep -v '^#' | grep '='
```

**3. Health check failing**
```bash
# Check container logs
docker logs [container-id]

# Test health endpoint manually
docker exec -it [container-id] wget -O- http://localhost:3000/api/health
```

**4. Hot reload not working in development**
```bash
# Ensure WATCHPACK_POLLING is set
echo "WATCHPACK_POLLING=true" >> .env.local
echo "CHOKIDAR_USEPOLLING=true" >> .env.local
```

**5. Lambda deployment fails**
```bash
# Check AWS credentials
aws sts get-caller-identity

# Check if ECR repository exists
aws ecr describe-repositories --repository-names nepal-reforms

# Check Lambda function logs
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/nepal-reforms
```

### Debug Mode

Enable debug logging:
```bash
# Development
DEBUG=* docker-compose -f docker-compose.yml -f docker-compose.dev.yml up web-dev

# Production
NODE_ENV=production DEBUG=* docker-compose up web
```

### Resource Monitoring

Monitor container resources:
```bash
# Real-time stats
docker stats

# Container inspection
docker inspect [container-id]

# System resource usage
docker system df
docker system prune  # Clean unused resources
```

## 📈 Optimization Tips

1. **Use .dockerignore**: Exclude unnecessary files to reduce build context
2. **Layer caching**: Order Dockerfile commands from least to most frequently changed
3. **Multi-stage builds**: Separate build dependencies from runtime
4. **Resource limits**: Set appropriate CPU and memory limits
5. **Health checks**: Implement proper health monitoring
6. **Logging**: Use structured logging with proper log levels

## 🤝 Contributing

When modifying Docker configuration:

1. Test all three targets (development, production, lambda)
2. Verify health checks work correctly
3. Test with minimal and full environment variables
4. Check image sizes with `docker images`
5. Validate security with `docker scan [image]`

## 📚 Additional Resources

- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [AWS Lambda Container Images](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
