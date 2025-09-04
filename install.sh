#!/bin/bash

# Xtranumerik MCP for Xibo - Installation Script
# =============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ASCII Art Logo
echo -e "${CYAN}"
cat << "EOF"
 __  ___                                           _ _    
 \ \/ / |_ _ __ __ _ _ __  _   _ _ __ ___   ___ _ __(_) | __
  \  /| __| '__/ _` | '_ \| | | | '_ ` _ \ / _ \ '__| | |/ /
  /  \| |_| | | (_| | | | | |_| | | | | | |  __/ |  | |   < 
 /_/\_\\__|_|  \__,_|_| |_|\__,_|_| |_| |_|\___|_|  |_|_|\_\
                                                            
            MCP Server for Xibo Digital Signage
            Professional Edition v1.0.0
EOF
echo -e "${NC}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Welcome to Xtranumerik MCP for Xibo  ${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Check Node.js version
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ is required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Install dependencies
echo -e "\n${BLUE}📦 Installing dependencies...${NC}"
npm install

# Create necessary directories
echo -e "\n${BLUE}📁 Creating directory structure...${NC}"
mkdir -p dist
mkdir -p logs
mkdir -p assets
mkdir -p data/images

# Run setup script
echo -e "\n${BLUE}⚙️  Starting configuration wizard...${NC}"
node scripts/setup.js

# Build TypeScript
echo -e "\n${BLUE}🔨 Building TypeScript files...${NC}"
npm run build

# Optional: Register in Xibo
echo -e "\n${YELLOW}📝 Would you like to register the application in Xibo CMS now?${NC}"
read -p "   (This requires admin access to your Xibo instance) [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run register-app
fi

# Configure Claude Desktop
echo -e "\n${YELLOW}🤖 Would you like to configure Claude Desktop automatically?${NC}"
read -p "   [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run configure-claude
fi

# Success message
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${CYAN}📋 Next steps:${NC}"
echo -e "   1. Review your configuration in ${YELLOW}.env${NC}"
echo -e "   2. Start the server: ${YELLOW}npm start${NC}"
echo -e "   3. Test with Claude Desktop"
echo -e "\n${CYAN}📚 Documentation:${NC}"
echo -e "   - README.md for quick start"
echo -e "   - docs/API-REFERENCE.md for all commands"
echo -e "   - docs/USE-CASES.md for examples"
echo -e "\n${MAGENTA}💡 Example commands to try with Claude:${NC}"
echo -e '   "Mets cette pub dans tous mes écrans sauf ceux à Québec"'
echo -e '   "Montre-moi l'\'état de tous les écrans publicitaires"'
echo -e '   "Programme cette campagne pour demain matin"'
echo -e "\n${GREEN}Thank you for choosing Xtranumerik!${NC}\n"