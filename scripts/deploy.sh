#!/bin/bash

# Deployment script untuk Apartment Management Website
# Usage: ./scripts/deploy.sh [frontend|backend|all]

set -e

DEPLOY_TYPE=${1:-all}

echo "🚀 Starting deployment process..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Deploy Frontend
if [ "$DEPLOY_TYPE" == "frontend" ] || [ "$DEPLOY_TYPE" == "all" ]; then
    echo "📦 Building frontend..."
    npm install
    npm run build
    
    echo "🚀 Deploying frontend to Vercel..."
    vercel --prod --yes
fi

# Deploy Backend
if [ "$DEPLOY_TYPE" == "backend" ] || [ "$DEPLOY_TYPE" == "all" ]; then
    echo "📦 Building backend..."
    cd backend
    npm install
    npm run build
    
    echo "🚀 Deploying backend to Vercel..."
    vercel --prod --yes
    cd ..
fi

echo "✅ Deployment completed!"

