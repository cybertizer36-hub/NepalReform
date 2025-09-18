#!/bin/bash

# Build script for Nepal Reforms Platform Docker images
# Usage: ./build.sh [development|production|lambda]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
MODE=${1:-production}
IMAGE_TAG=${2:-latest}
REGISTRY_URL=${3:-}

echo -e "${GREEN}Building Nepal Reforms Platform - Mode: $MODE${NC}"

case $MODE in
    development|dev)
        echo -e "${YELLOW}Building development image...${NC}"
        docker build \
            -f Dockerfile.dev \
            -t nepal-reforms:dev-$IMAGE_TAG \
            .
        echo -e "${GREEN}Development image built successfully!${NC}"
        echo -e "${YELLOW}To run: docker-compose -f docker-compose.yml -f docker-compose.dev.yml up web-dev${NC}"
        ;;
        
    production|prod)
        echo -e "${YELLOW}Building production image...${NC}"
        docker build \
            -f Dockerfile \
            -t nepal-reforms:prod-$IMAGE_TAG \
            .
        echo -e "${GREEN}Production image built successfully!${NC}"
        echo -e "${YELLOW}To run: docker-compose -f docker-compose.yml -f docker-compose.prod.yml up web${NC}"
        ;;
        
    lambda)
        echo -e "${YELLOW}Building Lambda image...${NC}"
        docker build \
            -f Dockerfile.lambda \
            -t nepal-reforms:lambda-$IMAGE_TAG \
            .
        echo -e "${GREEN}Lambda image built successfully!${NC}"
        echo -e "${YELLOW}To test locally: docker run -p 9000:8080 nepal-reforms:lambda-$IMAGE_TAG${NC}"
        ;;
        
    all)
        echo -e "${YELLOW}Building all images...${NC}"
        
        echo -e "${YELLOW}Building development image...${NC}"
        docker build -f Dockerfile.dev -t nepal-reforms:dev-$IMAGE_TAG .
        
        echo -e "${YELLOW}Building production image...${NC}"
        docker build -f Dockerfile -t nepal-reforms:prod-$IMAGE_TAG .
        
        echo -e "${YELLOW}Building Lambda image...${NC}"
        docker build -f Dockerfile.lambda -t nepal-reforms:lambda-$IMAGE_TAG .
        
        echo -e "${GREEN}All images built successfully!${NC}"
        ;;
        
    *)
        echo -e "${RED}Invalid mode: $MODE${NC}"
        echo -e "${YELLOW}Usage: $0 [development|production|lambda|all] [tag] [registry_url]${NC}"
        exit 1
        ;;
esac

# Push to registry if URL provided
if [ ! -z "$REGISTRY_URL" ]; then
    echo -e "${YELLOW}Pushing to registry: $REGISTRY_URL${NC}"
    
    case $MODE in
        development|dev)
            docker tag nepal-reforms:dev-$IMAGE_TAG $REGISTRY_URL/nepal-reforms:dev-$IMAGE_TAG
            docker push $REGISTRY_URL/nepal-reforms:dev-$IMAGE_TAG
            ;;
        production|prod)
            docker tag nepal-reforms:prod-$IMAGE_TAG $REGISTRY_URL/nepal-reforms:prod-$IMAGE_TAG
            docker push $REGISTRY_URL/nepal-reforms:prod-$IMAGE_TAG
            ;;
        lambda)
            docker tag nepal-reforms:lambda-$IMAGE_TAG $REGISTRY_URL/nepal-reforms:lambda-$IMAGE_TAG
            docker push $REGISTRY_URL/nepal-reforms:lambda-$IMAGE_TAG
            ;;
        all)
            docker tag nepal-reforms:dev-$IMAGE_TAG $REGISTRY_URL/nepal-reforms:dev-$IMAGE_TAG
            docker tag nepal-reforms:prod-$IMAGE_TAG $REGISTRY_URL/nepal-reforms:prod-$IMAGE_TAG
            docker tag nepal-reforms:lambda-$IMAGE_TAG $REGISTRY_URL/nepal-reforms:lambda-$IMAGE_TAG
            docker push $REGISTRY_URL/nepal-reforms:dev-$IMAGE_TAG
            docker push $REGISTRY_URL/nepal-reforms:prod-$IMAGE_TAG
            docker push $REGISTRY_URL/nepal-reforms:lambda-$IMAGE_TAG
            ;;
    esac
    echo -e "${GREEN}Images pushed successfully!${NC}"
fi

echo -e "${GREEN}Docker build complete!${NC}"
