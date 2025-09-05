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

# Function to check for OAuth2 tokens
check_oauth2_tokens() {
    local has_tokens=false
    local token_info=""
    
    # Check for encrypted token files
    if [ -d "data/tokens" ] && [ -n "$(ls -A data/tokens 2>/dev/null)" ]; then
        token_info="Tokens utilisateur OAuth2 détectés dans data/tokens/"
        has_tokens=true
    fi
    
    # Check for user tokens in .env
    if [ -f ".env" ]; then
        if grep -q "XIBO_USER_TOKEN" .env 2>/dev/null; then
            token_info="Configuration OAuth2 utilisateur détectée dans .env"
            has_tokens=true
        fi
    fi
    
    echo "$has_tokens|$token_info"
}

# Backup existing configuration and tokens
echo -e "${YELLOW}💾 Sauvegarde de votre configuration...${NC}"

# Backup .env if it exists
if [ -f ".env" ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}✅ Fichier .env sauvegardé${NC}"
fi

# Backup tokens if they exist
if [ -d "data/tokens" ]; then
    cp -r data/tokens data/tokens.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
    echo -e "${GREEN}✅ Tokens utilisateur sauvegardés${NC}"
fi

# Check current authentication status
echo -e "\n${BLUE}🔍 Vérification de l'authentification actuelle...${NC}"
auth_check=$(check_oauth2_tokens)
has_tokens=$(echo "$auth_check" | cut -d'|' -f1)
token_info=$(echo "$auth_check" | cut -d'|' -f2)

if [ "$has_tokens" = "true" ]; then
    echo -e "${GREEN}✅ $token_info${NC}"
    CURRENT_AUTH_MODE="oauth2"
    echo -e "${GREEN}   Mode actuel: OAuth2 (117 outils disponibles)${NC}"
else
    echo -e "${YELLOW}⚠️  Aucun token utilisateur OAuth2 détecté${NC}"
    CURRENT_AUTH_MODE="manual"
    echo -e "${YELLOW}   Mode actuel: Manuel (32 outils de base)${NC}"
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

# Restore tokens if backup exists
if [ -d "../data/tokens.backup."* ]; then
    echo -e "${BLUE}🔄 Restauration des tokens utilisateur...${NC}"
    mkdir -p data/tokens
    cp -r ../data/tokens.backup.*/. data/tokens/ 2>/dev/null || echo -e "${YELLOW}   Aucun token à restaurer${NC}"
    echo -e "${GREEN}✅ Tokens utilisateur restaurés${NC}"
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

# ========================================
# VÉRIFICATION ET CONFIGURATION D'AUTHENTIFICATION
# ========================================

# Re-check authentication after restoration
echo -e "\n${CYAN}🔐 Vérification de l'authentification après mise à jour...${NC}"
auth_check_after=$(check_oauth2_tokens)
has_tokens_after=$(echo "$auth_check_after" | cut -d'|' -f1)
token_info_after=$(echo "$auth_check_after" | cut -d'|' -f2)

if [ "$has_tokens_after" = "true" ]; then
    echo -e "${GREEN}✅ $token_info_after${NC}"
    echo -e "${GREEN}✅ Authentification OAuth2 fonctionnelle (117 outils disponibles)${NC}"
    FINAL_AUTH_MODE="oauth2"
    
elif [ -f ".env" ] && grep -q "XIBO_CLIENT_ID\|XIBO_CLIENT_SECRET" .env 2>/dev/null; then
    echo -e "${GREEN}✅ Configuration Client Credentials détectée${NC}"
    echo -e "${GREEN}   Mode Manuel: 32 outils de base disponibles${NC}"
    FINAL_AUTH_MODE="manual"
    
else
    # No authentication configured
    echo -e "\n${YELLOW}⚠️  Aucune authentification configurée après la mise à jour${NC}"
    echo -e "${CYAN}🔐 Configuration de l'authentification requise${NC}\n"
    
    echo -e "${YELLOW}Deux modes d'authentification disponibles:${NC}\n"
    
    echo -e "${GREEN}📊 Mode Manuel (Authentification Client):${NC}"
    echo -e "   • 32 outils de base disponibles"
    echo -e "   • Gestion des écrans, layouts, médias"
    echo -e "   • Configuration rapide avec Client ID/Secret (2 minutes)\n"
    
    echo -e "${GREEN}🚀 Mode OAuth2 (Authentification Utilisateur Complète):${NC}"
    echo -e "   • TOUS les 117 outils disponibles"
    echo -e "   • Gestion avancée des utilisateurs et permissions"
    echo -e "   • Configuration avec compte utilisateur Xibo (5 minutes)\n"
    
    echo -e "${YELLOW}Quel mode souhaitez-vous configurer?${NC}"
    echo -e "   ${GREEN}1)${NC} OAuth2 - Accès Complet (117 outils) ${MAGENTA}[Recommandé]${NC}"
    echo -e "   ${GREEN}2)${NC} Manuel - Fonctions de Base (32 outils)"
    echo -e "   ${GREEN}3)${NC} Ignorer pour l'instant (configurer plus tard)"
    
    while true; do
        read -p "   Votre choix [1-3]: " -n 1 -r
        echo
        case $REPLY in
            1)
                echo -e "${GREEN}✅ Configuration OAuth2 sélectionnée${NC}\n"
                echo -e "${CYAN}⚙️  Lancement de l'assistant OAuth2...${NC}"
                npm run auth-user
                FINAL_AUTH_MODE="oauth2"
                break
                ;;
            2)
                echo -e "${GREEN}✅ Configuration Manuel sélectionnée${NC}\n"
                echo -e "${BLUE}⚙️  Lancement de l'assistant de configuration...${NC}"
                node scripts/setup.js
                FINAL_AUTH_MODE="manual"
                break
                ;;
            3)
                echo -e "${YELLOW}⚠️  Configuration ignorée${NC}"
                echo -e "${YELLOW}   Vous pouvez configurer plus tard avec:${NC}"
                echo -e "${YELLOW}   - 'npm run auth-user' pour OAuth2 (117 outils)${NC}"
                echo -e "${YELLOW}   - 'node scripts/setup.js' pour Manuel (32 outils)${NC}"
                FINAL_AUTH_MODE="none"
                break
                ;;
            *)
                echo -e "${RED}   Veuillez choisir 1, 2 ou 3${NC}"
                ;;
        esac
    done
fi

# ========================================
# MESSAGE DE SUCCÈS
# ========================================

echo -e "\n${GREEN}🎉========================================${NC}"
echo -e "${GREEN}✅ Mise à Jour Terminée avec Succès!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${CYAN}📊 Serveur MCP Xtranumerik v2.0.0:${NC}"
echo -e "   🏢 Société: Xtranumerik Inc."
echo -e "   📦 Version: Professional Edition v2.0.0"

# Show tools available based on final auth mode
case $FINAL_AUTH_MODE in
    "oauth2")
        echo -e "   🛠️  Outils disponibles: 117 outils MCP (Accès Complet)"
        echo -e "   🔐 Mode d'authentification: OAuth2 Utilisateur"
        ;;
    "manual")
        echo -e "   🛠️  Outils disponibles: 32 outils MCP (Fonctions de Base)"
        echo -e "   🔐 Mode d'authentification: Client Credentials"
        ;;
    "none")
        echo -e "   🛠️  Outils disponibles: Configuration requise"
        echo -e "   🔐 Mode d'authentification: Non configuré"
        ;;
esac

echo -e "   🌍 Optimisé pour: Québec/Montréal"

echo -e "\n${BLUE}📋 Prochaines étapes:${NC}"
echo -e "   1. ${YELLOW}npm start${NC} - Démarrer le serveur MCP"
echo -e "   2. Ouvrir Claude Desktop"
echo -e "   3. Tester avec une commande simple"

if [ "$FINAL_AUTH_MODE" = "manual" ]; then
    echo -e "   4. ${YELLOW}npm run auth-user${NC} - Pour passer en mode OAuth2 (117 outils)"
elif [ "$FINAL_AUTH_MODE" = "none" ]; then
    echo -e "   4. ${YELLOW}npm run auth-user${NC} - Pour OAuth2 (117 outils)"
    echo -e "      ${YELLOW}node scripts/setup.js${NC} - Pour Manuel (32 outils)"
fi

# Show capabilities based on final auth mode
if [ "$FINAL_AUTH_MODE" = "oauth2" ]; then
    echo -e "\n${MAGENTA}🚀 Accès Complet Disponible - 117 Outils:${NC}"
    echo -e "   • 32 outils de base (écrans, layouts, médias, campagnes)"
    echo -e "   • 85 outils avancés (utilisateurs, analytics, alertes, automation)"
    echo -e "   • Gestion avancée utilisateurs et permissions"
    echo -e "   • Analytics et rapports détaillés"
    echo -e "   • Alertes d'urgence géo-ciblées"
    echo -e "   • Menu boards et automatisation"
    echo -e "   • Workflows et synchronisation multi-CMS"
    echo -e "   • Transitions et effets visuels professionnels"
    
    echo -e "\n${CYAN}💡 Exemples de commandes OAuth2 à tester:${NC}"
    echo -e '   🚨 "Diffuse cette alerte d'\''urgence dans la région de Québec"'
    echo -e '   🍽️  "Crée un menu board pour mon restaurant avec prix dynamiques"'
    echo -e '   👥 "Liste tous les utilisateurs avec leurs permissions"'
    echo -e '   📊 "Génère un rapport de performance des écrans de Montréal"'
    echo -e '   🤖 "Configure une automatisation pour les alertes météo"'
    
elif [ "$FINAL_AUTH_MODE" = "manual" ]; then
    echo -e "\n${MAGENTA}📊 Fonctions de Base Disponibles - 32 Outils:${NC}"
    echo -e "   • Gestion complète des écrans et groupes"
    echo -e "   • Création et modification des layouts"
    echo -e "   • Upload et gestion des médias"
    echo -e "   • Campagnes et programmation"
    echo -e "   • Diffusion intelligente avec filtrage géographique"
    echo -e "   • Broadcasting et alertes de base"
    
    echo -e "\n${CYAN}💡 Exemples de commandes de base à tester:${NC}"
    echo -e '   🍁 "Mets cette publicité dans tous mes écrans sauf ceux à Québec"'
    echo -e '   📅 "Programme cette campagne pour demain matin de 9h à 17h"'
    echo -e '   🎨 "Crée une mise en page avec des transitions élégantes"'
    echo -e '   📊 "Montre-moi les statistiques de mes écrans"'
else
    echo -e "\n${YELLOW}⚠️  Configuration d'authentification requise pour utiliser les outils MCP${NC}"
fi

echo -e "\n${MAGENTA}💡 Nouvelles fonctionnalités v2.0:${NC}"
echo -e "   • Diffusion géographique intelligente"
echo -e "   • Alertes d'urgence géo-ciblées"
echo -e "   • Menu boards dynamiques restaurants"
echo -e "   • Analytics et rapports avancés"
echo -e "   • Automatisation professionnelle"
echo -e "   • Synchronisation multi-CMS"
echo -e "   • Support bilingue complet"

echo -e "\n${GREEN}🍁 Optimisations Québécoises:${NC}"
echo -e "   🌍 Filtrage géographique intelligent Québec/Montréal"
echo -e "   🇫🇷 Support bilingue français/anglais natif"
echo -e "   🌨️  Intégration Environnement Canada"
echo -e "   🕐 Fuseau horaire EST/EDT automatique"

echo -e "\n${BLUE}🚀 Pour démarrer maintenant:${NC}"
echo -e "   ${YELLOW}npm start${NC}"

echo -e "\n${GREEN}🔧 Mise à jour ultra-facile terminée!${NC}"
if [ "$FINAL_AUTH_MODE" = "oauth2" ]; then
    echo -e "${GREEN}Profitez de la puissance de 117 outils MCP pour Xibo!${NC}\n"
elif [ "$FINAL_AUTH_MODE" = "manual" ]; then
    echo -e "${GREEN}Profitez des 32 outils de base MCP pour Xibo!${NC}\n"
else
    echo -e "${GREEN}Configurez l'authentification pour profiter des outils MCP!${NC}\n"
fi