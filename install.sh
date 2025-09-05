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

# AI Installation Mode Detection
AI_INSTALL=${AI_INSTALL:-false}
AUTH_MODE=${AUTH_MODE:-""}

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

# ========================================
# 🔐 CHOIX D'AUTHENTIFICATION AU DÉBUT
# ========================================

echo -e "${CYAN}🔐 Choix du Mode d'Authentification${NC}"
echo -e "${CYAN}=====================================${NC}\n"

echo -e "${YELLOW}Deux modes d'authentification disponibles:${NC}\n"

echo -e "${GREEN}📊 Mode Manuel (Authentification Client):${NC}"
echo -e "   • 32 outils de base disponibles"
echo -e "   • Gestion des écrans, layouts, médias"
echo -e "   • Campagnes et programmation"
echo -e "   • Diffusion intelligente géo-ciblée"
echo -e "   • Configuration rapide (2 minutes)\n"

echo -e "${GREEN}🚀 Mode OAuth2 (Authentification Utilisateur Complète):${NC}"
echo -e "   • TOUS les 117 outils disponibles"
echo -e "   • Gestion avancée des utilisateurs et permissions"
echo -e "   • Analytics et rapports détaillés"
echo -e "   • Alertes d'urgence géo-ciblées"
echo -e "   • Menu boards et automatisation"
echo -e "   • Workflows professionnels"
echo -e "   • Configuration avec compte utilisateur (5 minutes)\n"

# Handle AI installation mode
if [ "$AI_INSTALL" = "true" ]; then
    echo -e "${BLUE}🤖 Mode AI détecté - Installation automatique${NC}"
    if [ "$AUTH_MODE" = "oauth2" ]; then
        SELECTED_AUTH="oauth2"
        echo -e "${GREEN}   Mode sélectionné: OAuth2 (Accès Complet)${NC}\n"
    elif [ "$AUTH_MODE" = "manual" ]; then
        SELECTED_AUTH="manual"
        echo -e "${GREEN}   Mode sélectionné: Manuel (Fonctions de Base)${NC}\n"
    else
        SELECTED_AUTH="manual"
        echo -e "${YELLOW}   Mode par défaut: Manuel (spécifiez AUTH_MODE=oauth2 pour OAuth2)${NC}\n"
    fi
else
    # Interactive mode
    echo -e "${YELLOW}Quel mode souhaitez-vous utiliser?${NC}"
    echo -e "   ${GREEN}1)${NC} OAuth2 - Accès Complet (117 outils) ${MAGENTA}[Recommandé]${NC}"
    echo -e "   ${GREEN}2)${NC} Manuel - Fonctions de Base (32 outils)"
    
    while true; do
        read -p "   Votre choix [1-2]: " -n 1 -r
        echo
        case $REPLY in
            1)
                SELECTED_AUTH="oauth2"
                echo -e "${GREEN}✅ Sélectionné: OAuth2 - Accès Complet aux 117 outils${NC}\n"
                break
                ;;
            2)
                SELECTED_AUTH="manual"
                echo -e "${GREEN}✅ Sélectionné: Manuel - Fonctions de Base (32 outils)${NC}\n"
                break
                ;;
            *)
                echo -e "${RED}   Veuillez choisir 1 ou 2${NC}"
                ;;
        esac
    done
fi

# ========================================
# VÉRIFICATION DES PRÉREQUIS
# ========================================

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

# ========================================
# INSTALLATION DES DÉPENDANCES
# ========================================

# Install dependencies
echo -e "\n${BLUE}📦 Installation des dépendances...${NC}"
if [ "$AI_INSTALL" = "true" ]; then
    npm install --silent --no-progress
else
    npm install --silent
fi

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

# ========================================
# CONFIGURATION EN FONCTION DU MODE CHOISI
# ========================================

if [ "$SELECTED_AUTH" = "oauth2" ]; then
    echo -e "\n${CYAN}🔐 Configuration OAuth2 Utilisateur${NC}"
    echo -e "${CYAN}Cette configuration vous donne accès aux 117 outils${NC}\n"
    
    # Check if .env exists for OAuth2 mode
    if [ -f ".env" ]; then
        echo -e "${YELLOW}⚠️  Fichier .env détecté${NC}"
        if [ "$AI_INSTALL" = "true" ]; then
            echo -e "${BLUE}   Mode AI: Conservation de la configuration existante${NC}"
        else
            read -p "   Voulez-vous garder votre configuration existante? [Y/n]: " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Nn]$ ]]; then
                echo -e "${BLUE}⚙️  Configuration interactive...${NC}"
                node scripts/setup.js
            else
                echo -e "${GREEN}✅ Configuration existante conservée${NC}"
            fi
        fi
    else
        # OAuth2 setup - first run setup.js for basic config, then auth-user
        echo -e "${BLUE}⚙️  Étape 1/2: Configuration de base...${NC}"
        if [ "$AI_INSTALL" = "true" ]; then
            echo -e "${YELLOW}Mode AI: Veuillez configurer manuellement .env après l'installation${NC}"
        else
            node scripts/setup.js
        fi
    fi
    
    # OAuth2 user authentication
    echo -e "\n${CYAN}⚙️  Étape 2/2: Authentification utilisateur OAuth2...${NC}"
    if [ "$AI_INSTALL" = "true" ]; then
        echo -e "${YELLOW}Mode AI: Exécutez 'npm run auth-user' après l'installation pour configurer OAuth2${NC}"
    else
        echo -e "${CYAN}Configuration de votre compte utilisateur Xibo...${NC}"
        npm run auth-user
    fi
    
else
    # Manual mode - standard setup
    echo -e "\n${BLUE}⚙️  Configuration Manuel (Client Credentials)${NC}"
    echo -e "${BLUE}Cette configuration vous donne accès aux 32 outils de base${NC}\n"
    
    # Check if .env exists
    if [ -f ".env" ]; then
        echo -e "${YELLOW}⚠️  Fichier .env détecté${NC}"
        if [ "$AI_INSTALL" = "true" ]; then
            echo -e "${BLUE}   Mode AI: Conservation de la configuration existante${NC}"
        else
            read -p "   Voulez-vous garder votre configuration existante? [Y/n]: " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Nn]$ ]]; then
                echo -e "${BLUE}⚙️  Configuration interactive...${NC}"
                node scripts/setup.js
            else
                echo -e "${GREEN}✅ Configuration existante conservée${NC}"
            fi
        fi
    else
        # Run setup script
        echo -e "${BLUE}⚙️  Lancement de l'assistant de configuration...${NC}"
        if [ "$AI_INSTALL" = "true" ]; then
            echo -e "${YELLOW}Mode AI: Veuillez configurer manuellement .env après l'installation${NC}"
        else
            node scripts/setup.js
        fi
    fi
fi

# ========================================
# BUILD ET VALIDATION
# ========================================

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
# CONFIGURATION CLAUDE DESKTOP
# ========================================

# Optional: Configure Claude Desktop
echo -e "\n${YELLOW}🤖 Configuration de Claude Desktop${NC}"
echo -e "${YELLOW}   (Recommandé pour utiliser le serveur MCP)${NC}"

if [ "$AI_INSTALL" = "true" ]; then
    echo -e "${BLUE}Mode AI: Configuration Claude Desktop sautée (exécutez 'npm run configure-claude' si nécessaire)${NC}"
else
    read -p "   Configurer Claude Desktop automatiquement? [Y/n]: " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        npm run configure-claude
    fi
fi

# ========================================
# MESSAGE DE SUCCÈS
# ========================================

# Success message with comprehensive information
echo -e "\n${GREEN}🎉========================================${NC}"
echo -e "${GREEN}✅ Installation Terminée avec Succès!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${CYAN}📊 Résumé de l'Installation v2.0:${NC}"
echo -e "   🏢 Société: Xtranumerik Inc."
echo -e "   📦 Serveur MCP: Xibo Digital Signage v2.0.0"
echo -e "   🛠️  Outils disponibles: $(if [ "$SELECTED_AUTH" = "oauth2" ]; then echo "117 outils MCP (Accès Complet)"; else echo "32 outils MCP (Fonctions de Base)"; fi)"
echo -e "   🔐 Mode d'authentification: $(if [ "$SELECTED_AUTH" = "oauth2" ]; then echo "OAuth2 Utilisateur"; else echo "Client Credentials"; fi)"
echo -e "   🌍 Zones géographiques: Québec/Montréal configurées"
echo -e "   🎯 Fonctionnalité clé: Diffusion intelligente géo-ciblée"

echo -e "\n${BLUE}📋 Prochaines étapes:${NC}"
echo -e "   1. ${YELLOW}npm start${NC} - Démarrer le serveur MCP"
echo -e "   2. Ouvrir Claude Desktop (si configuré)"
echo -e "   3. Tester avec une commande simple"
if [ "$SELECTED_AUTH" = "manual" ]; then
    echo -e "   4. ${YELLOW}npm run auth-user${NC} - Pour passer en mode OAuth2 (117 outils)"
fi

if [ "$SELECTED_AUTH" = "oauth2" ]; then
    echo -e "\n${MAGENTA}🚀 Accès Complet Activé - 117 Outils Disponibles:${NC}"
    echo -e "   • 32 outils de base (écrans, layouts, médias, campagnes)"
    echo -e "   • 85 outils avancés (utilisateurs, analytics, alertes, automation)"
    echo -e "   • Gestion avancée utilisateurs et permissions"
    echo -e "   • Analytics et rapports détaillés"
    echo -e "   • Alertes d'urgence géo-ciblées"
    echo -e "   • Menu boards et automatisation"
    echo -e "   • Workflows et synchronisation multi-CMS"
    echo -e "   • Transitions et effets visuels professionnels"
else
    echo -e "\n${MAGENTA}📊 Fonctions de Base Activées - 32 Outils:${NC}"
    echo -e "   • Gestion complète des écrans et groupes"
    echo -e "   • Création et modification des layouts"
    echo -e "   • Upload et gestion des médias"
    echo -e "   • Campagnes et programmation"
    echo -e "   • Diffusion intelligente avec filtrage géographique"
    echo -e "   • Broadcasting et alertes de base"
fi

echo -e "\n${CYAN}💡 Exemples de commandes à tester:${NC}"
echo -e '   🍁 "Mets cette publicité dans tous mes écrans sauf ceux à Québec"'
echo -e '   📊 "Montre-moi les statistiques de diffusion de cette semaine"'
echo -e '   📅 "Programme cette campagne pour demain matin de 9h à 17h"'
echo -e '   🎨 "Crée une mise en page avec des transitions élégantes"'
if [ "$SELECTED_AUTH" = "oauth2" ]; then
    echo -e '   🚨 "Diffuse cette alerte d'\''urgence dans la région de Québec"'
    echo -e '   🍽️  "Crée un menu board pour mon restaurant avec prix dynamiques"'
    echo -e '   🤖 "Configure une automatisation pour les alertes météo"'
fi

echo -e "\n${YELLOW}📚 Documentation disponible:${NC}"
echo -e "   📖 README.md - Guide de démarrage rapide"
if [ "$SELECTED_AUTH" = "oauth2" ]; then
    echo -e "   📋 docs/COMPLETE-API-REFERENCE.md - Référence des 117 outils"
else
    echo -e "   📝 docs/API-REFERENCE.md - Référence des 32 outils de base"
fi
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

if [ "$AI_INSTALL" = "true" ]; then
    echo -e "\n${CYAN}🤖 Installation AI Mode Complétée${NC}"
    echo -e "   Variables utilisées:"
    echo -e "   - AI_INSTALL=$AI_INSTALL"
    echo -e "   - AUTH_MODE=$AUTH_MODE"
    echo -e "   Mode final: $(if [ "$SELECTED_AUTH" = "oauth2" ]; then echo "OAuth2"; else echo "Manuel"; fi)"
fi

echo -e "\n${GREEN}Merci d'avoir choisi Xtranumerik pour vos solutions d'affichage dynamique!${NC}"
echo -e "${GREEN}Profitez de la puissance $(if [ "$SELECTED_AUTH" = "oauth2" ]; then echo "des 117 outils MCP"; else echo "des 32 outils de base"; fi) pour Xibo!${NC}\n"