@echo off
setlocal enabledelayedexpansion

REM Build script for Nepal Reforms Platform Docker images
REM Usage: build.bat [development|production|lambda] [tag] [registry_url]

set MODE=%1
if "%MODE%"=="" set MODE=production

set IMAGE_TAG=%2
if "%IMAGE_TAG%"=="" set IMAGE_TAG=latest

set REGISTRY_URL=%3

echo Building Nepal Reforms Platform - Mode: %MODE%

if "%MODE%"=="development" goto :dev
if "%MODE%"=="dev" goto :dev
if "%MODE%"=="production" goto :prod  
if "%MODE%"=="prod" goto :prod
if "%MODE%"=="lambda" goto :lambda
if "%MODE%"=="all" goto :all
goto :invalid

:dev
echo Building development image...
docker build -f Dockerfile.dev -t nepal-reforms:dev-%IMAGE_TAG% .
if %errorlevel% neq 0 goto :error
echo Development image built successfully!
echo To run: docker-compose -f docker-compose.yml -f docker-compose.dev.yml up web-dev
goto :push

:prod
echo Building production image...
docker build -f Dockerfile -t nepal-reforms:prod-%IMAGE_TAG% .
if %errorlevel% neq 0 goto :error
echo Production image built successfully!
echo To run: docker-compose -f docker-compose.yml -f docker-compose.prod.yml up web
goto :push

:lambda
echo Building Lambda image...
docker build -f Dockerfile.lambda -t nepal-reforms:lambda-%IMAGE_TAG% .
if %errorlevel% neq 0 goto :error
echo Lambda image built successfully!
echo To test locally: docker run -p 9000:8080 nepal-reforms:lambda-%IMAGE_TAG%
goto :push

:all
echo Building all images...

echo Building development image...
docker build -f Dockerfile.dev -t nepal-reforms:dev-%IMAGE_TAG% .
if %errorlevel% neq 0 goto :error

echo Building production image...
docker build -f Dockerfile -t nepal-reforms:prod-%IMAGE_TAG% .
if %errorlevel% neq 0 goto :error

echo Building Lambda image...
docker build -f Dockerfile.lambda -t nepal-reforms:lambda-%IMAGE_TAG% .
if %errorlevel% neq 0 goto :error

echo All images built successfully!
goto :push

:push
if "%REGISTRY_URL%"=="" goto :success

echo Pushing to registry: %REGISTRY_URL%

if "%MODE%"=="development" goto :push_dev
if "%MODE%"=="dev" goto :push_dev
if "%MODE%"=="production" goto :push_prod
if "%MODE%"=="prod" goto :push_prod
if "%MODE%"=="lambda" goto :push_lambda
if "%MODE%"=="all" goto :push_all
goto :success

:push_dev
docker tag nepal-reforms:dev-%IMAGE_TAG% %REGISTRY_URL%/nepal-reforms:dev-%IMAGE_TAG%
docker push %REGISTRY_URL%/nepal-reforms:dev-%IMAGE_TAG%
goto :success

:push_prod
docker tag nepal-reforms:prod-%IMAGE_TAG% %REGISTRY_URL%/nepal-reforms:prod-%IMAGE_TAG%
docker push %REGISTRY_URL%/nepal-reforms:prod-%IMAGE_TAG%
goto :success

:push_lambda
docker tag nepal-reforms:lambda-%IMAGE_TAG% %REGISTRY_URL%/nepal-reforms:lambda-%IMAGE_TAG%
docker push %REGISTRY_URL%/nepal-reforms:lambda-%IMAGE_TAG%
goto :success

:push_all
docker tag nepal-reforms:dev-%IMAGE_TAG% %REGISTRY_URL%/nepal-reforms:dev-%IMAGE_TAG%
docker tag nepal-reforms:prod-%IMAGE_TAG% %REGISTRY_URL%/nepal-reforms:prod-%IMAGE_TAG%
docker tag nepal-reforms:lambda-%IMAGE_TAG% %REGISTRY_URL%/nepal-reforms:lambda-%IMAGE_TAG%
docker push %REGISTRY_URL%/nepal-reforms:dev-%IMAGE_TAG%
docker push %REGISTRY_URL%/nepal-reforms:prod-%IMAGE_TAG%
docker push %REGISTRY_URL%/nepal-reforms:lambda-%IMAGE_TAG%
goto :success

:success
echo Images pushed successfully!
echo Docker build complete!
goto :end

:invalid
echo Invalid mode: %MODE%
echo Usage: %0 [development^|production^|lambda^|all] [tag] [registry_url]
exit /b 1

:error
echo Build failed!
exit /b 1

:end
