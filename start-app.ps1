$ErrorActionPreference = 'Stop'

Set-Location $PSScriptRoot

if (-not (Test-Path '.env')) {
  Write-Host 'The .env file is missing.' -ForegroundColor Red
  Write-Host 'Copy .env.example to .env and enter the local database and login values before starting the demo.'
  exit 1
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Host 'Docker is not installed or is not available from this terminal.' -ForegroundColor Red
  exit 1
}

docker info *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Docker Desktop is not running. Start Docker Desktop and run this command again.' -ForegroundColor Red
  exit 1
}

if (-not (Test-Path 'node_modules')) {
  Write-Host 'Installing the root development tools...'
  npm install
}

if (-not (Test-Path 'backend/node_modules') -or -not (Test-Path 'frontend/node_modules')) {
  Write-Host 'Installing application dependencies and preparing the database...'
  npm run setup
}

Write-Host ''
Write-Host 'Starting the PawConnect application...' -ForegroundColor Cyan
Write-Host 'Web application: http://localhost:5173'
Write-Host 'API health check: http://localhost:5000/api/health'
Write-Host 'Press Ctrl+C to stop the frontend and backend.'
Write-Host ''

npm run dev
