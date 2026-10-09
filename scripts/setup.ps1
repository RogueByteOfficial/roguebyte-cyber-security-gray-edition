# RogueByte Cyber Lab - Automated Windows PowerShell Setup Script
# Owner & Creator: SidoDev-Dz

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  RogueByte Cyber Lab (Black Gray Edition v1) Setup" -ForegroundColor Green
Write-Host "  Creator: SidoDev-Dz" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[!] Node.js not detected. Please install Node.js LTS (v20+)." -ForegroundColor Red
    Exit 1
}
$nodeVersion = node -v
Write-Host "[+] Node.js $nodeVersion verified." -ForegroundColor Green

# 2. Check npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "[!] npm not detected. Please install npm." -ForegroundColor Red
    Exit 1
}

# 3. Install packages
Write-Host "[*] Installing dependencies..." -ForegroundColor Cyan
npm install

# 4. Prepare data directory
if (-not (Test-Path "data")) {
    New-Item -ItemType Directory -Path "data" | Out-Null
}

# 5. Build
Write-Host "[*] Building application..." -ForegroundColor Cyan
npm run build

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Installation Completed Successfully!" -ForegroundColor Green
Write-Host "  Run: npm run dev" -ForegroundColor Yellow
Write-Host "  Local URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
