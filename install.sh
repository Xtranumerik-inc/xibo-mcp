#!/bin/bash

# Xtranumerik MCP for Xibo - Installation Script
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
                                                            
            MCP Server for Xibo Digital Signage
            Professional Edition v2.0.0 by Xtranumerik Inc.
            🚀 117 outils MCP - Contrôle complet de Xibo
EOF
echo -e "${NC}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Xtranumerik MCP for Xibo - Installation v2.0${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${BLUE}🚀 Bienvenue dans l'installation du serveur MCP professionnel de Xtranumerik v2.0${NC}"
echo -e "${BLUE}   Ce serveur offre 117 outils MCP pour un contrôle complet de Xibo${NC}\n"

echo -e "${MAGENTA}🎯 Nouveautés version 2.0:${NC}"
echo -e "   • 32 outils de base (authentification client)"
echo -e "   • 85 outils avancés (authentification OAuth2 utilisateur)"
echo -e "   • Filtrage géographique Québec/Montréal intelligent"
echo -e "   • Alertes d'urgence avec géo-ciblage"
echo -e "   • Menu boards dynamiques pour restaurants"
echo -e "   • Analytics et rapports avancés"
echo -e "   • Automatisation et workflows professionnels"
echo -e "   • Synchronisation multi-CMS"
echo -e "   • Support bilingue français/anglais optimisé\n"

# Check Node.js version
echo -e "${BLUE}🔍 Vérification des prérequis...${NC}"
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

# Check if .env exists
if [ -f ".env" ]; then
    echo -e "\n${YELLOW}⚠️  Fichier .env détecté${NC}"
    read -p "   Voulez-vous garder votre configuration existante? [Y/n]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        echo -e "${BLUE}⚙️  Configuration interactive...${NC}"
        node scripts/setup.js
    else
        echo -e "${GREEN}✅ Configuration existante conservée${NC}"
    fi
else
    # Run setup script
    echo -e "\n${BLUE}⚙️  Lancement de l'assistant de configuration...${NC}"
    node scripts/setup.js
fi

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

# Optional: Configure Claude Desktop
echo -e "\n${YELLOW}🤖 Configuration de Claude Desktop${NC}"
echo -e "${YELLOW}   (Recommandé pour utiliser le serveur MCP)${NC}"
read -p "   Configurer Claude Desktop automatiquement? [Y/n]: " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    npm run configure-claude
fi

# Optional: OAuth2 User Authentication Setup
echo -e "\n${CYAN}🔐 Configuration OAuth2 Utilisateur (Optionnel)${NC}"
echo -e "${CYAN}   (Requis pour les 85 outils avancés)${NC}"
read -p "   Configurer l'authentification OAuth2 maintenant? [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run auth-user
fi

# Success message with comprehensive information
echo -e "\n${GREEN}🎉========================================${NC}"
echo -e "${GREEN}✅ Installation Terminée avec Succès!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${CYAN}📊 Résumé de l'Installation v2.0:${NC}"
echo -e "   🏢 Société: Xtranumerik Inc."
echo -e "   📦 Serveur MCP: Xibo Digital Signage v2.0.0"
echo -e "   🛠️  Outils disponibles: 117 outils MCP"
echo -e "   📊 Outils de base: 32 (authentification client)"
echo -e "   🚀 Outils avancés: 85 (authentification OAuth2)"
echo -e "   🌍 Zones géographiques: Québec/Montréal configurées"
echo -e "   🎯 Fonctionnalité clé: Diffusion intelligente géo-ciblée"

echo -e "\n${BLUE}📋 Prochaines étapes:${NC}"
echo -e "   1. ${YELLOW}npm start${NC} - Démarrer le serveur MCP"
echo -e "   2. Ouvrir Claude Desktop (si configuré)"
echo -e "   3. Tester avec une commande simple"
echo -e "   4. ${YELLOW}npm run auth-user${NC} - Pour accéder aux outils avancés"

echo -e "\n${MAGENTA}🎯 Fonctionnalités Professionnelles v2.0:${NC}"
echo -e "   • 32 outils de base (authentification client)"
echo -e "   • 85 outils avancés (authentification OAuth2)"
echo -e "   • Diffusion géographique Québec/Montréal"
echo -e "   • Alertes d'urgence et notifications"
echo -e "   • Menu boards et automatisation"
echo -e "   • Analytics et rapports avancés"
echo -e "   • Synchronisation multi-CMS"
echo -e "   • Gestion avancée utilisateurs et permissions"
echo -e "   • Workflows et automatisation professionnels"
echo -e "   • Transitions et effets visuels"

echo -e "\n${CYAN}💡 Exemples de commandes à tester:${NC}"
echo -e '   🍁 "Mets cette publicité dans tous mes écrans sauf ceux à Québec"'
echo -e '   📊 "Montre-moi les statistiques de diffusion de cette semaine"'
echo -e '   📅 "Programme cette campagne pour demain matin de 9h à 17h"'
echo -e '   🎨 "Crée une mise en page avec des transitions élégantes"'
echo -e '   🚨 "Diffuse cette alerte d'\''urgence dans la région de Québec"'
echo -e '   🍽️  "Crée un menu board pour mon restaurant avec prix dynamiques"'
echo -e '   🤖 "Configure une automatisation pour les alertes météo"'

echo -e "\n${YELLOW}📚 Documentation disponible:${NC}"
echo -e "   📖 README.md - Guide de démarrage rapide"
echo -e "   📝 docs/API-REFERENCE.md - Référence des 32 outils de base"
echo -e "   📋 docs/COMPLETE-API-REFERENCE.md - Référence des 117 outils"
echo -e "   🔧 .env.example - Exemple de configuration"
echo -e "   📊 docs/DEVELOPMENT-CONTEXT.md - Contexte développement"
echo -e "   🔐 docs/OAUTH2-SETUP.md - Guide OAuth2 utilisateur"

echo -e "\n${GREEN}🍁 Optimisations Québécoises:${NC}"
echo -e "   🌍 Filtrage géographique intelligent Québec/Montréal"
echo -e "   🇫🇷 Support bilingue français/anglais natif"
echo -e "   🌨️  Intégration Environnement Canada"
echo -e "   🕐 Fuseau horaire EST/EDT automatique"
echo -e "   🍽️  Templates menus québécois (poutine, tourtière, etc.)"
echo -e "   🚨 Alertes d'urgence géo-ciblées"

echo -e "\n${GREEN}🆘 Support Xtranumerik:${NC}"
echo -e "   📧 Email: support@xtranumerik.ca"
echo -e "   🌐 Site: https://www.xtranumerik.ca"
echo -e "   📞 Support technique disponible"
echo -e "   💬 Communauté: GitHub Discussions"

echo -e "\n${BLUE}🚀 Pour démarrer maintenant:${NC}"
echo -e "   ${YELLOW}npm start${NC}"

echo -e "\n${GREEN}Merci d'avoir choisi Xtranumerik pour vos solutions d'affichage dynamique!${NC}"
echo -e "${GREEN}Profitez de la puissance de 117 outils MCP pour Xibo!${NC}\n"