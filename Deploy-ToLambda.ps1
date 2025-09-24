# Nepal Reforms Platform - AWS Lambda Deployment Script for Windows
# PowerShell version with better error handling and features

param(
    [string]$Region = "us-east-1",
    [string]$Repository = "nepal-reforms",
    [string]$FunctionName = "nepal-reforms-platform",
    [string]$ImageTag = "latest",
    [switch]$SkipBuild = $false,
    [switch]$UpdateEnvVars = $false
)

# Color output functions
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Host "`n" -NoNewline
Write-Info "================================================"
Write-Info "  Nepal Reforms Platform - AWS Lambda Deployment"
Write-Info "================================================"
Write-Host "`n" -NoNewline

# Check prerequisites
Write-Info "Checking prerequisites..."

# Check AWS CLI
try {
    $awsVersion = aws --version 2>$null
    Write-Success "✓ AWS CLI installed: $awsVersion"
} catch {
    Write-Error "✗ AWS CLI is not installed"
    Write-Host "  Download from: https://awscli.amazonaws.com/AWSCLIV2.msi"
    exit 1
}

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Success "✓ Docker installed: $dockerVersion"
    
    # Check if Docker is running
    docker info > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "✗ Docker is not running"
        Write-Host "  Please start Docker Desktop and try again"
        exit 1
    }
    Write-Success "✓ Docker is running"
} catch {
    Write-Error "✗ Docker is not installed"
    Write-Host "  Download from: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
    exit 1
}

# Get AWS Account ID
Write-Host "`n" -NoNewline
Write-Info "Step 1: Getting AWS configuration..."
$AccountId = aws sts get-caller-identity --query Account --output text 2>$null

if ([string]::IsNullOrEmpty($AccountId)) {
    Write-Error "Failed to get AWS Account ID"
    Write-Host "Please configure AWS CLI first: aws configure"
    exit 1
}

$EcrUri = "$AccountId.dkr.ecr.$Region.amazonaws.com/$Repository"

Write-Success "AWS Account ID: $AccountId"
Write-Success "ECR URI: $EcrUri"

# Create ECR Repository
Write-Host "`n" -NoNewline
Write-Info "Step 2: Setting up ECR repository..."
$ecrExists = aws ecr describe-repositories --repository-names $Repository --region $Region 2>$null
if ($LASTEXITCODE -ne 0) {
    aws ecr create-repository --repository-name $Repository --region $Region > $null
    Write-Success "✓ ECR repository created"
} else {
    Write-Success "✓ ECR repository already exists"
}

# Login to ECR
Write-Host "`n" -NoNewline
Write-Info "Step 3: Logging in to Amazon ECR..."
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin "$AccountId.dkr.ecr.$Region.amazonaws.com"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to login to ECR"
    exit 1
}
Write-Success "✓ Successfully logged in to ECR"

# Build Docker image
if (-not $SkipBuild) {
    Write-Host "`n" -NoNewline
    Write-Info "Step 4: Building Docker image for Lambda..."
    Write-Warning "This may take a few minutes..."
    
    docker build -f Dockerfile.lambda -t "${Repository}:${ImageTag}" .
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker build failed"
        exit 1
    }
    Write-Success "✓ Docker image built successfully"
} else {
    Write-Warning "Skipping Docker build (using existing image)"
}

# Tag and push image
Write-Host "`n" -NoNewline
Write-Info "Step 5: Tagging image for ECR..."
docker tag "${Repository}:${ImageTag}" "${EcrUri}:${ImageTag}"
Write-Success "✓ Image tagged"

Write-Host "`n" -NoNewline
Write-Info "Step 6: Pushing image to ECR..."
Write-Warning "This may take a few minutes depending on your internet speed..."
docker push "${EcrUri}:${ImageTag}"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to push image to ECR"
    exit 1
}
Write-Success "✓ Image pushed successfully"

# Check if Lambda function exists
Write-Host "`n" -NoNewline
Write-Info "Step 7: Setting up Lambda function..."
$functionExists = aws lambda get-function --function-name $FunctionName --region $Region 2>$null

if ($LASTEXITCODE -eq 0) {
    # Update existing function
    Write-Info "Updating existing Lambda function..."
    
    aws lambda update-function-code `
        --function-name $FunctionName `
        --image-uri "${EcrUri}:${ImageTag}" `
        --region $Region > $null
    
    aws lambda wait function-updated --function-name $FunctionName --region $Region
    
    aws lambda update-function-configuration `
        --function-name $FunctionName `
        --timeout 30 `
        --memory-size 1024 `
        --region $Region > $null
    
    Write-Success "✓ Lambda function updated"
} else {
    # Create new function
    Write-Info "Creating new Lambda function..."
    
    # Create IAM role
    Write-Info "Creating IAM role..."
    
    $trustPolicy = @'
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
'@
    
    $trustPolicy | Out-File -FilePath trust-policy.json -Encoding UTF8
    
    aws iam create-role `
        --role-name nepal-reforms-lambda-role `
        --assume-role-policy-document file://trust-policy.json 2>$null
    
    aws iam attach-role-policy `
        --role-name nepal-reforms-lambda-role `
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    
    Remove-Item trust-policy.json
    
    # Wait for role to propagate
    Start-Sleep -Seconds 10
    
    # Create Lambda function
    aws lambda create-function `
        --function-name $FunctionName `
        --package-type Image `
        --code ImageUri="${EcrUri}:${ImageTag}" `
        --role "arn:aws:iam::${AccountId}:role/nepal-reforms-lambda-role" `
        --timeout 30 `
        --memory-size 1024 `
        --region $Region > $null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to create Lambda function"
        exit 1
    }
    
    Write-Success "✓ Lambda function created"
}

# Update environment variables if requested
if ($UpdateEnvVars) {
    Write-Host "`n" -NoNewline
    Write-Info "Step 8: Updating environment variables..."
    
    # Read .env.local file
    if (Test-Path .env.local) {
        $envVars = @{}
        Get-Content .env.local | ForEach-Object {
            if ($_ -match '^([^=]+)=(.*)$') {
                $envVars[$matches[1]] = $matches[2]
            }
        }
        
        $envString = ($envVars.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ','
        
        aws lambda update-function-configuration `
            --function-name $FunctionName `
            --environment "Variables={$envString}" `
            --region $Region > $null
        
        Write-Success "✓ Environment variables updated"
    } else {
        Write-Warning "No .env.local file found"
    }
}

# Create or get Function URL
Write-Host "`n" -NoNewline
Write-Info "Step 9: Setting up Function URL..."
$urlConfig = aws lambda get-function-url-config --function-name $FunctionName --region $Region 2>$null

if ($LASTEXITCODE -ne 0) {
    # Create function URL
    $functionUrl = aws lambda create-function-url-config `
        --function-name $FunctionName `
        --auth-type NONE `
        --region $Region `
        --query FunctionUrl `
        --output text
} else {
    # Get existing URL
    $functionUrl = aws lambda get-function-url-config `
        --function-name $FunctionName `
        --region $Region `
        --query FunctionUrl `
        --output text
}

# Display success message
Write-Host "`n" -NoNewline
Write-Success "================================================"
Write-Success "  DEPLOYMENT COMPLETED SUCCESSFULLY!"
Write-Success "================================================"
Write-Host "`n" -NoNewline
Write-Info "Lambda Function URL:"
Write-Host $functionUrl -ForegroundColor Yellow
Write-Host "`n" -NoNewline
Write-Info "Test your deployment:"
Write-Host "Invoke-WebRequest -Uri ${functionUrl}api/health" -ForegroundColor Yellow
Write-Host "`n" -NoNewline

# Optional: Test the deployment
$testDeployment = Read-Host "Would you like to test the deployment now? (y/n)"
if ($testDeployment -eq 'y') {
    Write-Info "Testing deployment..."
    try {
        $response = Invoke-WebRequest -Uri "${functionUrl}api/health" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Success "✓ Health check passed!"
        } else {
            Write-Warning "Health check returned status: $($response.StatusCode)"
        }
    } catch {
        Write-Error "Health check failed: $_"
    }
}
