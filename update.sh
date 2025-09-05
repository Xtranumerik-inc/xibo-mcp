#!/bin/bash

# Xtranumerik MCP for Xibo - Script de Mise à Jour Ultra-Facile
# Professional Digital Signage Management v2.0.0
# ==========================================

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
 \\ \/ / |_ _ __ __ _ _ __  _   _ _ __ ___   ___ _ __(_) | __
  \  /| __| '__/ _` | '_ \| | | | '_ ` _ \ / _ \ '__| | |/ /
  /  \| |_| | | (_| | | | | |_| | | | | | |  __/ |  | |   < 
 /_/\_\\__|_|  \__,_|_| |_|\__,_|_| |_| |_|\___|_|  |_|_|\_\
                                                            
            MISE À JOUR ULTRA-FACILE v2.0.0
            Professional Edition by Xtranumerik Inc.
            🚀 Actualisation automatique des 117 outils MCP
EOF
echo -e "${NC}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Xtranumerik MCP - Mise à Jour v2.0${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Backup existing .env if it exists
if [ -f ".env" ]; then
    echo -e "${YELLOW}💾 Sauvegarde de votre configuration...${NC}"
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}✅ Configuration sauvegardée${NC}"
fi

# Stop existing server if running
echo -e "\n${BLUE}🛑 Arrêt du serveur existant...${NC}"
pkill -f "node.*xibo-mcp" 2>/dev/null || echo -e "${YELLOW}   Aucun serveur en cours d'exécution${NC}"

# Get current directory
CURRENT_DIR=$(pwd)
PARENT_DIR=$(dirname "$CURRENT_DIR")
PROJECT_NAME=$(basename "$CURRENT_DIR")

echo -e "\n${BLUE}📁 Répertoire actuel: $CURRENT_DIR${NC}"

# Clean update process
echo -e "\n${MAGENTA}🧹 Mise à jour propre en cours...${NC}"

# Save current directory and move to parent
cd "$PARENT_DIR"

# Remove old directory
echo -e "${BLUE}🗑️  Suppression de l'ancienne version...${NC}"
rm -rf "$PROJECT_NAME"

# Clone fresh repository
echo -e "${BLUE}📥 Téléchargement de la dernière version...${NC}"
git clone https://github.com/Xtranumerik-inc/xibo-mcp.git "$PROJECT_NAME"

# Move back to project directory
cd "$PROJECT_NAME"

# Restore .env if backup exists
if [ -f "../.env.backup."* ]; then
    echo -e "${BLUE}🔄 Restauration de votre configuration...${NC}"
    cp ../.env.backup.* .env 2>/dev/null || echo -e "${YELLOW}   Configuration par défaut utilisée${NC}"
    echo -e "${GREEN}✅ Configuration restaurée${NC}"
fi

# Check Node.js version
echo -e "\n${BLUE}🔍 Vérification des prérequis...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé. Veuillez installer Node.js 18+ d'abord.${NC}"
    echo -e "${YELLOW}💡 Visitez: https://nodejs.org${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ requis. Version actuelle: $(node -v)${NC}"
    echo -e "${YELLOW}💡 Visitez: https://nodejs.org${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) détecté${NC}"

# Install dependencies
echo -e "\n${BLUE}📦 Installation des dépendances...${NC}"
npm install --silent

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors de l'installation des dépendances${NC}"
    exit 1
fi

# Create necessary directories
echo -e "\n${BLUE}📁 Création de la structure...${NC}"
mkdir -p dist
mkdir -p logs
mkdir -p assets
mkdir -p data/images
mkdir -p data/cache
mkdir -p data/tokens
mkdir -p docs
mkdir -p config/templates

# Build TypeScript
echo -e "\n${BLUE}🔨 Compilation du projet...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors de la compilation${NC}"
    exit 1
fi

# Validate tools
echo -e "\n${BLUE}🧪 Validation des 117 outils MCP...${NC}"
npm run validate

# Configuration check
if [ ! -f ".env" ]; then
    echo -e "\n${YELLOW}⚠️  Aucun fichier de configuration détecté${NC}"
    echo -e "${BLUE}⚙️  Lancement de l'assistant de configuration...${NC}"
    node scripts/setup.js
fi

# Success message
echo -e "\n${GREEN}🎉========================================${NC}"
echo -e "${GREEN}✅ Mise à Jour Terminée avec Succès!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${CYAN}📊 Serveur MCP Xtranumerik v2.0.0:${NC}"
echo -e "   🏢 Société: Xtranumerik Inc."
echo -e "   📦 Version: Professional Edition v2.0.0"
echo -e "   🛠️  Outils disponibles: 117 outils MCP"
echo -e "   📊 Outils de base: 32 (authentification client)"
echo -e "   🚀 Outils avancés: 85 (authentification OAuth2)"
echo -e "   🌍 Optimisé pour: Québec/Montréal"

echo -e "\n${BLUE}🚀 Pour démarrer maintenant:${NC}"
echo -e "   ${YELLOW}npm start${NC}"

echo -e "\n${MAGENTA}💡 Nouvelles fonctionnalités v2.0:${NC}"
echo -e "   • Diffusion géographique intelligente"
echo -e "   • Alertes d'urgence géo-ciblées"
echo -e "   • Menu boards dynamiques restaurants"
echo -e "   • Analytics et rapports avancés"
echo -e "   • Automatisation professionnelle"
echo -e "   • Synchronisation multi-CMS"
echo -e "   • Support bilingue complet"

echo -e "\n${CYAN}🍁 Exemples de commandes à tester:${NC}"
echo -e '   🚨 "Diffuse cette alerte d'\''urgence dans la région de Québec"'
echo -e '   🍽️  "Crée un menu board pour mon restaurant avec prix dynamiques"'
echo -e '   📊 "Montre-moi les statistiques de diffusion de cette semaine"'
echo -e '   🤖 "Configure une automatisation pour les alertes météo"'

echo -e "\n${GREEN}🔧 Mise à jour ultra-facile terminée!${NC}"
echo -e "${GREEN}Profitez de la puissance de 117 outils MCP pour Xibo!${NC}\n"