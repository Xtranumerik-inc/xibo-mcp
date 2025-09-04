#!/bin/bash

# Xtranumerik MCP for Xibo - Installation Script
# Professional Digital Signage Management
# ==========================================

set -e

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
MAGENTA='\\033[0;35m'
CYAN='\\033[0;36m'
NC='\\033[0m' # No Color

# ASCII Art Logo
echo -e \"${CYAN}\"
cat << \"EOF\"
 __  ___                                           _ _    
 \\ \\/ / |_ _ __ __ _ _ __  _   _ _ __ ___   ___ _ __(_) | __
  \\  /| __| '__/ _` | '_ \\| | | | '_ ` _ \\ / _ \\ '__| | |/ /
  /  \\| |_| | | (_| | | | | |_| | | | | | |  __/ |  | |   < 
 /_/\\_\\\\__|_|  \\__,_|_| |_|\\__,_|_| |_| |_|\\___|_|  |_|_|\\_\\
                                                            
            MCP Server for Xibo Digital Signage
            Professional Edition v1.0.0 by Xtranumerik Inc.
EOF
echo -e \"${NC}\"

echo -e \"${GREEN}========================================${NC}\"
echo -e \"${GREEN}  Xtranumerik MCP for Xibo - Installation${NC}\"
echo -e \"${GREEN}========================================${NC}\\n\"

echo -e \"${BLUE}🚀 Bienvenue dans l'installation du serveur MCP professionnel de Xtranumerik${NC}\"
echo -e \"${BLUE}   Ce serveur offre un contrôle complet de Xibo en langage naturel${NC}\\n\"

# Check Node.js version
echo -e \"${BLUE}🔍 Vérification des prérequis...${NC}\"
if ! command -v node &> /dev/null; then
    echo -e \"${RED}❌ Node.js n'est pas installé. Veuillez installer Node.js 18+ d'abord.${NC}\"
    echo -e \"${YELLOW}💡 Visitez: https://nodejs.org${NC}\"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ \"$NODE_VERSION\" -lt 18 ]; then
    echo -e \"${RED}❌ Node.js version 18+ requis. Version actuelle: $(node -v)${NC}\"
    echo -e \"${YELLOW}💡 Visitez: https://nodejs.org${NC}\"
    exit 1
fi

echo -e \"${GREEN}✅ Node.js $(node -v) détecté${NC}\"

# Install dependencies
echo -e \"\\n${BLUE}📦 Installation des dépendances...${NC}\"
npm install --silent

if [ $? -ne 0 ]; then
    echo -e \"${RED}❌ Erreur lors de l'installation des dépendances${NC}\"
    exit 1
fi

# Create necessary directories
echo -e \"\\n${BLUE}📁 Création de la structure...${NC}\"
mkdir -p dist
mkdir -p logs
mkdir -p assets
mkdir -p data/images
mkdir -p docs

# Check if .env exists
if [ -f \".env\" ]; then
    echo -e \"\\n${YELLOW}⚠️  Fichier .env détecté${NC}\"
    read -p \"   Voulez-vous garder votre configuration existante? [Y/n]: \" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        echo -e \"${BLUE}⚙️  Configuration interactive...${NC}\"
        node scripts/setup.js
    else
        echo -e \"${GREEN}✅ Configuration existante conservée${NC}\"
    fi
else
    # Run setup script
    echo -e \"\\n${BLUE}⚙️  Lancement de l'assistant de configuration...${NC}\"
    node scripts/setup.js
fi

# Build TypeScript
echo -e \"\\n${BLUE}🔨 Compilation du projet...${NC}\"
npm run build

if [ $? -ne 0 ]; then
    echo -e \"${RED}❌ Erreur lors de la compilation${NC}\"
    exit 1
fi

# Optional: Configure Claude Desktop
echo -e \"\\n${YELLOW}🤖 Configuration de Claude Desktop${NC}\"
echo -e \"${YELLOW}   (Recommandé pour utiliser le serveur MCP)${NC}\"
read -p \"   Configurer Claude Desktop automatiquement? [Y/n]: \" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    npm run configure-claude
fi

# Success message with comprehensive information
echo -e \"\\n${GREEN}🎉========================================${NC}\"
echo -e \"${GREEN}✅ Installation Terminée avec Succès!${NC}\"
echo -e \"${GREEN}========================================${NC}\\n\"

echo -e \"${CYAN}📊 Résumé de l'Installation:${NC}\"
echo -e \"   🏢 Société: Xtranumerik Inc.\"
echo -e \"   📦 Serveur MCP: Xibo Digital Signage v1.0.0\"
echo -e \"   🛠️  Outils disponibles: 25+ outils MCP\"
echo -e \"   🌍 Zones géographiques: Configurées\"
echo -e \"   🎯 Fonctionnalité clé: Diffusion intelligente\"

echo -e \"\\n${BLUE}📋 Prochaines étapes:${NC}\"
echo -e \"   1. ${YELLOW}npm start${NC} - Démarrer le serveur MCP\"
echo -e \"   2. Ouvrir Claude Desktop (si configuré)\"
echo -e \"   3. Tester avec une commande simple\"

echo -e \"\\n${MAGENTA}🎯 Fonctionnalités Principales:${NC}\"
echo -e \"   • Diffusion géographique intelligente\"
echo -e \"   • Gestion complète des écrans Xibo\" 
echo -e \"   • Contrôle en langage naturel\"
echo -e \"   • Programmation avancée de contenu\"
echo -e \"   • Gestion multi-niveaux des playlists\"

echo -e \"\\n${CYAN}💡 Exemples de commandes à tester:${NC}\"
echo -e '   \"Mets cette pub dans tous mes écrans sauf ceux à Québec\"'
echo -e '   \"Montre-moi l'\\'état de tous les écrans publicitaires\"'
echo -e '   \"Programme cette campagne pour demain matin\"'
echo -e '   \"Crée une nouvelle mise en page avec 3 régions\"'
echo -e '   \"Diffuse ce message urgent sur TOUS les écrans\"'

echo -e \"\\n${YELLOW}📚 Documentation disponible:${NC}\"
echo -e \"   📖 README.md - Guide de démarrage rapide\"
echo -e \"   📝 docs/API-REFERENCE.md - Référence complète des outils\"
echo -e \"   🔧 .env.example - Exemple de configuration\"

echo -e \"\\n${GREEN}🆘 Support Xtranumerik:${NC}\"
echo -e \"   📧 Email: support@xtranumerik.ca\"
echo -e \"   🌐 Site: https://www.xtranumerik.ca\"
echo -e \"   📞 Support technique disponible\"

echo -e \"\\n${BLUE}🚀 Pour démarrer maintenant:${NC}\"
echo -e \"   ${YELLOW}npm start${NC}\"

echo -e \"\\n${GREEN}Merci d'avoir choisi Xtranumerik pour vos solutions d'affichage dynamique!${NC}\\n\"