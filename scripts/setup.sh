#!/usr/bin/env bash
# RogueByte Cyber Lab - Automated Linux & WSL2 Setup Script
# Owner & Creator: SidoDev-Dz

set -e

echo "=========================================================="
echo "  RogueByte Cyber Lab (Black Gray Edition v1) Setup"
echo "  Creator: SidoDev-Dz"
echo "=========================================================="

# 1. Check Node.js
if ! command -v node &> /dev/null; then
    echo "[!] Node.js not found. Please install Node.js LTS (v20+)."
    exit 1
fi
echo "[+] Node.js version $(node -v) detected."

# 2. Check npm
if ! command -v npm &> /dev/null; then
    echo "[!] npm not found. Please install npm."
    exit 1
fi
echo "[+] npm version $(npm -v) detected."

# 3. Install dependencies
echo "[*] Installing project dependencies..."
npm install

# 4. Initialize Data Directory
echo "[*] Preparing persistent storage data directory..."
mkdir -p data

# 5. Build application assets
echo "[*] Verifying production build compilation..."
npm run build

echo "=========================================================="
echo "  Setup Complete!"
echo "  To start development server: npm run dev"
echo "  To run in production mode:   npm start"
echo "  Access local dashboard at:   http://localhost:3000"
echo "=========================================================="
