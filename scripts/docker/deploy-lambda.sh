#!/bin/bash

# AWS Lambda deployment script for Nepal Reforms Platform
# This script builds and deploys the Docker image to AWS Lambda

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
ECR_REPOSITORY=${ECR_REPOSITORY:-nepal-reforms}
LAMBDA_FUNCTION_NAME=${LAMBDA_FUNCTION_NAME:-nepal-reforms-platform}
IMAGE_TAG=${IMAGE_TAG:-latest}

# Check if required tools are installed
command -v aws >/dev/null 2>&1 || { echo -e "${RED}AWS CLI is required but not installed.${NC}" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Docker is required but not installed.${NC}" >&2; exit 1; }

echo -e "${GREEN}Deploying Nepal Reforms Platform to AWS Lambda${NC}"

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to get AWS account ID. Please check your AWS credentials.${NC}"
    exit 1
fi

ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}"

echo -e "${YELLOW}AWS Account ID: ${AWS_ACCOUNT_ID}${NC}"
echo -e "${YELLOW}ECR Repository: ${ECR_URI}${NC}"
echo -e "${YELLOW}Lambda Function: ${LAMBDA_FUNCTION_NAME}${NC}"

# Create ECR repository if it doesn't exist
echo -e "${YELLOW}Creating ECR repository if it doesn't exist...${NC}"
aws ecr create-repository --repository-name ${ECR_REPOSITORY} --region ${AWS_REGION} 2>/dev/null || echo "Repository already exists"

# Get ECR login token and login to Docker
echo -e "${YELLOW}Logging in to ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Build the Docker image
echo -e "${YELLOW}Building Lambda Docker image...${NC}"
docker build -f Dockerfile.lambda -t ${ECR_REPOSITORY}:${IMAGE_TAG} .

# Tag the image for ECR
echo -e "${YELLOW}Tagging image for ECR...${NC}"
docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} ${ECR_URI}:${IMAGE_TAG}

# Push the image to ECR
echo -e "${YELLOW}Pushing image to ECR...${NC}"
docker push ${ECR_URI}:${IMAGE_TAG}

# Update or create Lambda function
echo -e "${YELLOW}Updating Lambda function...${NC}"

# Check if function exists
if aws lambda get-function --function-name ${LAMBDA_FUNCTION_NAME} --region ${AWS_REGION} >/dev/null 2>&1; then
    echo -e "${YELLOW}Updating existing Lambda function...${NC}"
    aws lambda update-function-code \
        --function-name ${LAMBDA_FUNCTION_NAME} \
        --image-uri ${ECR_URI}:${IMAGE_TAG} \
        --region ${AWS_REGION}
        
    # Update function configuration
    aws lambda update-function-configuration \
        --function-name ${LAMBDA_FUNCTION_NAME} \
        --timeout 30 \
        --memory-size 512 \
        --region ${AWS_REGION}
else
    echo -e "${YELLOW}Creating new Lambda function...${NC}"
    
    # Create execution role if it doesn't exist
    ROLE_NAME="nepal-reforms-lambda-role"
    ROLE_ARN=$(aws iam get-role --role-name ${ROLE_NAME} --query 'Role.Arn' --output text 2>/dev/null || true)
    
    if [ -z "$ROLE_ARN" ]; then
        echo -e "${YELLOW}Creating IAM role for Lambda...${NC}"
        
        # Create trust policy
        cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

        aws iam create-role \
            --role-name ${ROLE_NAME} \
            --assume-role-policy-document file://trust-policy.json
            
        aws iam attach-role-policy \
            --role-name ${ROLE_NAME} \
            --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
            
        # Wait for role to be available
        sleep 10
        
        ROLE_ARN=$(aws iam get-role --role-name ${ROLE_NAME} --query 'Role.Arn' --output text)
        
        rm trust-policy.json
    fi
    
    aws lambda create-function \
        --function-name ${LAMBDA_FUNCTION_NAME} \
        --package-type Image \
        --code ImageUri=${ECR_URI}:${IMAGE_TAG} \
        --role ${ROLE_ARN} \
        --timeout 30 \
        --memory-size 512 \
        --region ${AWS_REGION}
fi

# Wait for function to be updated
echo -e "${YELLOW}Waiting for function update to complete...${NC}"
aws lambda wait function-updated --function-name ${LAMBDA_FUNCTION_NAME} --region ${AWS_REGION}

# Get function URL (if it exists) or create one
FUNCTION_URL=$(aws lambda get-function-url-config --function-name ${LAMBDA_FUNCTION_NAME} --region ${AWS_REGION} --query 'FunctionUrl' --output text 2>/dev/null || true)

if [ -z "$FUNCTION_URL" ] || [ "$FUNCTION_URL" == "None" ]; then
    echo -e "${YELLOW}Creating function URL...${NC}"
    FUNCTION_URL=$(aws lambda create-function-url-config \
        --function-name ${LAMBDA_FUNCTION_NAME} \
        --auth-type NONE \
        --cors 'AllowCredentials=false,AllowMethods=["*"],AllowOrigins=["*"],ExposeHeaders=["date","keep-alive"],MaxAge=86400' \
        --region ${AWS_REGION} \
        --query 'FunctionUrl' --output text)
fi

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Function URL: ${FUNCTION_URL}${NC}"
echo -e "${YELLOW}Note: It may take a few minutes for the function to be fully available.${NC}"

# Test the deployment
echo -e "${YELLOW}Testing the deployment...${NC}"
sleep 5
curl -f "${FUNCTION_URL}api/health" && echo -e "\n${GREEN}Health check passed!${NC}" || echo -e "\n${RED}Health check failed!${NC}"
