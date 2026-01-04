# PowerShell deployment script untuk Apartment Management Website
# Usage: .\scripts\deploy.ps1 [frontend|backend|all]

param(
    [Parameter(Position=0)]
    [ValidateSet("frontend", "backend", "all")]
    [string]$DeployType = "all"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting deployment process..." -ForegroundColor Green

# Check if Vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

# Deploy Frontend
if ($DeployType -eq "frontend" -or $DeployType -eq "all") {
    Write-Host "📦 Building frontend..." -ForegroundColor Cyan
    npm install
    npm run build
    
    Write-Host "🚀 Deploying frontend to Vercel..." -ForegroundColor Cyan
    vercel --prod --yes
}

# Deploy Backend
if ($DeployType -eq "backend" -or $DeployType -eq "all") {
    Write-Host "📦 Building backend..." -ForegroundColor Cyan
    Set-Location backend
    npm install
    npm run build
    
    Write-Host "🚀 Deploying backend to Vercel..." -ForegroundColor Cyan
    vercel --prod --yes
    Set-Location ..
}

Write-Host "✅ Deployment completed!" -ForegroundColor Green

