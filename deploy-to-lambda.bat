@echo off
setlocal enabledelayedexpansion

REM ===========================================
REM   Nepal Reforms Platform - AWS Lambda Deploy
REM   Windows Deployment Script
REM ===========================================

echo.
echo ============================================
echo   Nepal Reforms Platform AWS Lambda Deploy
echo ============================================
echo.

REM Set configuration variables
set AWS_REGION=us-east-1
set ECR_REPOSITORY=nepal-reforms
set LAMBDA_FUNCTION_NAME=nepal-reforms-platform
set IMAGE_TAG=latest

REM Check if AWS CLI is installed
where aws >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: AWS CLI is not installed.
    echo Please install from: https://awscli.amazonaws.com/AWSCLIV2.msi
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running.
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

REM Get AWS Account ID
echo Step 1: Getting AWS Account ID...
for /f "tokens=*" %%i in ('aws sts get-caller-identity --query Account --output text') do set AWS_ACCOUNT_ID=%%i

if "%AWS_ACCOUNT_ID%"=="" (
    echo ERROR: Failed to get AWS Account ID.
    echo Please configure AWS CLI: aws configure
    pause
    exit /b 1
)

echo AWS Account ID: %AWS_ACCOUNT_ID%
set ECR_URI=%AWS_ACCOUNT_ID%.dkr.ecr.%AWS_REGION%.amazonaws.com/%ECR_REPOSITORY%
echo ECR URI: %ECR_URI%
echo.

REM Create ECR Repository
echo Step 2: Creating ECR repository...
aws ecr create-repository --repository-name %ECR_REPOSITORY% --region %AWS_REGION% >nul 2>&1
if %errorlevel% equ 0 (
    echo ECR repository created successfully.
) else (
    echo ECR repository already exists.
)
echo.

REM Login to ECR
echo Step 3: Logging in to Amazon ECR...
aws ecr get-login-password --region %AWS_REGION% | docker login --username AWS --password-stdin %AWS_ACCOUNT_ID%.dkr.ecr.%AWS_REGION%.amazonaws.com
if %errorlevel% neq 0 (
    echo ERROR: Failed to login to ECR
    pause
    exit /b 1
)
echo.

REM Build Docker image
echo Step 4: Building Docker image for Lambda...
docker build -f Dockerfile.lambda -t %ECR_REPOSITORY%:%IMAGE_TAG% .
if %errorlevel% neq 0 (
    echo ERROR: Docker build failed
    pause
    exit /b 1
)
echo Docker image built successfully!
echo.

REM Tag image for ECR
echo Step 5: Tagging image for ECR...
docker tag %ECR_REPOSITORY%:%IMAGE_TAG% %ECR_URI%:%IMAGE_TAG%
echo.

REM Push image to ECR
echo Step 6: Pushing image to ECR...
docker push %ECR_URI%:%IMAGE_TAG%
if %errorlevel% neq 0 (
    echo ERROR: Failed to push image to ECR
    pause
    exit /b 1
)
echo Image pushed successfully!
echo.

REM Check if Lambda function exists
echo Step 7: Checking if Lambda function exists...
aws lambda get-function --function-name %LAMBDA_FUNCTION_NAME% --region %AWS_REGION% >nul 2>&1
if %errorlevel% equ 0 (
    REM Update existing function
    echo Lambda function exists. Updating...
    aws lambda update-function-code --function-name %LAMBDA_FUNCTION_NAME% --image-uri %ECR_URI%:%IMAGE_TAG% --region %AWS_REGION% >nul
    
    echo Updating function configuration...
    aws lambda update-function-configuration --function-name %LAMBDA_FUNCTION_NAME% --timeout 30 --memory-size 1024 --region %AWS_REGION% >nul
    
    echo Lambda function updated successfully!
) else (
    REM Create new function
    echo Lambda function does not exist. Creating...
    
    REM First create IAM role
    call :create_iam_role
    
    REM Create Lambda function
    echo Creating Lambda function...
    aws lambda create-function ^
        --function-name %LAMBDA_FUNCTION_NAME% ^
        --package-type Image ^
        --code ImageUri=%ECR_URI%:%IMAGE_TAG% ^
        --role arn:aws:iam::%AWS_ACCOUNT_ID%:role/nepal-reforms-lambda-role ^
        --timeout 30 ^
        --memory-size 1024 ^
        --region %AWS_REGION% >nul
    
    if %errorlevel% neq 0 (
        echo ERROR: Failed to create Lambda function
        pause
        exit /b 1
    )
    
    echo Lambda function created successfully!
)
echo.

REM Create or get Function URL
echo Step 8: Setting up Function URL...
aws lambda get-function-url-config --function-name %LAMBDA_FUNCTION_NAME% --region %AWS_REGION% >nul 2>&1
if %errorlevel% neq 0 (
    echo Creating function URL...
    for /f "tokens=*" %%i in ('aws lambda create-function-url-config --function-name %LAMBDA_FUNCTION_NAME% --auth-type NONE --region %AWS_REGION% --query FunctionUrl --output text') do set FUNCTION_URL=%%i
) else (
    for /f "tokens=*" %%i in ('aws lambda get-function-url-config --function-name %LAMBDA_FUNCTION_NAME% --region %AWS_REGION% --query FunctionUrl --output text') do set FUNCTION_URL=%%i
)

echo.
echo ============================================
echo   DEPLOYMENT COMPLETED SUCCESSFULLY!
echo ============================================
echo.
echo Lambda Function URL: %FUNCTION_URL%
echo.
echo You can access your application at:
echo %FUNCTION_URL%
echo.
echo To test the deployment:
echo curl %FUNCTION_URL%api/health
echo.

pause
exit /b 0

:create_iam_role
echo Creating IAM role for Lambda...

REM Create trust policy file
echo { > trust-policy.json
echo   "Version": "2012-10-17", >> trust-policy.json
echo   "Statement": [ >> trust-policy.json
echo     { >> trust-policy.json
echo       "Effect": "Allow", >> trust-policy.json
echo       "Principal": { >> trust-policy.json
echo         "Service": "lambda.amazonaws.com" >> trust-policy.json
echo       }, >> trust-policy.json
echo       "Action": "sts:AssumeRole" >> trust-policy.json
echo     } >> trust-policy.json
echo   ] >> trust-policy.json
echo } >> trust-policy.json

REM Create the role
aws iam create-role --role-name nepal-reforms-lambda-role --assume-role-policy-document file://trust-policy.json >nul 2>&1

REM Attach policies
aws iam attach-role-policy --role-name nepal-reforms-lambda-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole >nul 2>&1

REM Clean up
del trust-policy.json

REM Wait for role to propagate
timeout /t 10 /nobreak >nul

exit /b 0
