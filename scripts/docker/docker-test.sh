#!/bin/bash

# Docker Health Check and Test Script
echo "================================================"
echo "Docker Configuration Test for Nepal Reforms"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

echo -e "\n${YELLOW}1. Checking Docker Installation${NC}"
docker --version
print_status $? "Docker is installed"

echo -e "\n${YELLOW}2. Checking Docker Compose${NC}"
docker-compose --version
print_status $? "Docker Compose is installed"

echo -e "\n${YELLOW}3. Checking Environment Files${NC}"
if [ -f ".env.local" ]; then
    print_status 0 ".env.local file exists"
    
    # Check for required environment variables
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        print_status 0 "NEXT_PUBLIC_SUPABASE_URL is set"
    else
        print_status 1 "NEXT_PUBLIC_SUPABASE_URL is missing"
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        print_status 0 "NEXT_PUBLIC_SUPABASE_ANON_KEY is set"
    else
        print_status 1 "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing"
    fi
    
    if grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local; then
        print_status 0 "SUPABASE_SERVICE_ROLE_KEY is set"
    else
        print_status 1 "SUPABASE_SERVICE_ROLE_KEY is missing"
    fi
else
    print_status 1 ".env.local file is missing"
fi

echo -e "\n${YELLOW}4. Testing Docker Build${NC}"
echo "Building development Docker image..."
docker-compose -f docker-compose.yml build web-dev
print_status $? "Docker image built successfully"

echo -e "\n${YELLOW}5. Testing Container Startup${NC}"
echo "Starting containers..."
docker-compose -f docker-compose.yml up -d web-dev
print_status $? "Container started successfully"

# Wait for container to be ready
echo "Waiting for container to be ready..."
sleep 10

echo -e "\n${YELLOW}6. Checking Container Status${NC}"
container_status=$(docker-compose -f docker-compose.yml ps -q web-dev)
if [ -n "$container_status" ]; then
    print_status 0 "Container is running"
    
    # Check container health
    health_status=$(docker inspect --format='{{.State.Health.Status}}' $container_status 2>/dev/null)
    if [ "$health_status" = "healthy" ]; then
        print_status 0 "Container is healthy"
    else
        print_status 1 "Container health check failed (Status: $health_status)"
    fi
else
    print_status 1 "Container is not running"
fi

echo -e "\n${YELLOW}7. Testing Application Endpoints${NC}"
# Test health endpoint
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health)
if [ "$response" = "200" ]; then
    print_status 0 "Health endpoint is responding (Status: $response)"
else
    print_status 1 "Health endpoint failed (Status: $response)"
fi

# Test main page
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)
if [ "$response" = "200" ]; then
    print_status 0 "Main page is accessible (Status: $response)"
else
    print_status 1 "Main page is not accessible (Status: $response)"
fi

echo -e "\n${YELLOW}8. Container Logs (Last 20 lines)${NC}"
docker-compose -f docker-compose.yml logs --tail=20 web-dev

echo -e "\n${YELLOW}9. Cleanup${NC}"
echo "Stopping containers..."
docker-compose -f docker-compose.yml down
print_status $? "Containers stopped"

echo -e "\n================================================"
echo "Test Complete!"
echo "================================================"
