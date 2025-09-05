#!/bin/bash

# Xtranumerik MCP for Xibo - Installation Script
# Professional Digital Signage Management v2.0.0
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
echo -e "${GREEN}========================================${NC}\\n"

echo -e "${BLUE}🚀 Bienvenue dans l'installation du serveur MCP professionnel de Xtranumerik v2.0${NC}"
echo -e "${BLUE}   Ce serveur offre 117 outils MCP pour un contrôle complet de Xibo${NC}\\n"

echo -e "${MAGENTA}🎯 Nouveautés version 2.0:${NC}"
echo -e "   • 32 outils de base (authentification client)"
echo -e "   • 85 outils avancés (authentification OAuth2 utilisateur)"
echo -e "   • 🆕 Mode d'authentification directe (username/password)"
echo -e "   • Filtrage dynamique des outils selon vos permissions"
echo -e "   • Filtrage géographique Québec/Montréal intelligent"
echo -e "   • Alertes d'urgence avec géo-ciblage"
echo -e "   • Menu boards dynamiques pour restaurants"
echo -e "   • Analytics et rapports avancés"
echo -e "   • Automatisation et workflows professionnels"
echo -e "   • Synchronisation multi-CMS"
echo -e "   • Support bilingue français/anglais optimisé\\n"

# ========================================
# 🔐 CHOIX D'AUTHENTIFICATION AU DÉBUT
# ========================================

echo -e "${CYAN}🔐 Choix du Mode d'Authentification${NC}"
echo -e "${CYAN}=====================================${NC}\\n"

echo -e "${YELLOW}Trois modes d'authentification disponibles:${NC}\\n"

echo -e "${GREEN}⚡ Mode Direct User (NOUVEAU - Recommandé):${NC}"
echo -e "   • Configuration ultra-simple: juste votre nom d'utilisateur et mot de passe Xibo!"
echo -e "   • Outils adaptés automatiquement selon vos permissions utilisateur"
echo -e "   • Détection automatique de votre niveau d'accès (admin, éditeur, viewer)"
echo -e "   • Session management avec auto-refresh"
echo -e "   • Support MFA (authentification multi-facteurs)"
echo -e "   • Configuration en 30 secondes!\\n"

echo -e "${GREEN}🚀 Mode OAuth2 (Authentification Utilisateur Complète):${NC}"
echo -e "   • TOUS les 117 outils disponibles (si vous avez les permissions)"
echo -e "   • Gestion avancée des utilisateurs et permissions"
echo -e "   • Analytics et rapports détaillés"
echo -e "   • Alertes d'urgence géo-ciblées"
echo -e "   • Menu boards et automatisation"
echo -e "   • Workflows professionnels"
echo -e "   • Configuration avec compte utilisateur Xibo (5 minutes)\\n"

echo -e "${GREEN}📊 Mode Manuel (Authentification Client):${NC}"
echo -e "   • 32 outils de base disponibles"
echo -e "   • Gestion des écrans, layouts, médias"
echo -e "   • Campagnes et programmation"
echo -e "   • Diffusion intelligente géo-ciblée"
echo -e "   • Configuration rapide avec Client ID/Secret (2 minutes)\\n"

# Handle AI installation mode
if [ "$AI_INSTALL" = "true" ]; then
    echo -e "${BLUE}🤖 Mode AI détecté - Installation automatique${NC}"
    if [ "$AUTH_MODE" = "direct_user" ]; then
        SELECTED_AUTH="direct_user"
        echo -e "${GREEN}   Mode sélectionné: Direct User (Configuration Simple)${NC}\\n"
    elif [ "$AUTH_MODE" = "oauth2" ]; then
        SELECTED_AUTH="oauth2"
        echo -e "${GREEN}   Mode sélectionné: OAuth2 (Accès Complet)${NC}\\n"
    elif [ "$AUTH_MODE" = "manual" ]; then
        SELECTED_AUTH="manual"
        echo -e "${GREEN}   Mode sélectionné: Manuel (Fonctions de Base)${NC}\\n"
    else
        SELECTED_AUTH="direct_user"
        echo -e "${YELLOW}   Mode par défaut: Direct User (spécifiez AUTH_MODE=oauth2 ou manual si nécessaire)${NC}\\n"
    fi
else
    # Interactive mode
    echo -e "${YELLOW}Quel mode souhaitez-vous utiliser?${NC}"
    echo -e "   ${GREEN}1)${NC} Direct User - Configuration Simple ${MAGENTA}[NOUVEAU - Recommandé]${NC}"
    echo -e "   ${GREEN}2)${NC} OAuth2 - Accès Complet (117 outils)"
    echo -e "   ${GREEN}3)${NC} Manuel - Fonctions de Base (32 outils)"
    
    while true; do
        read -p "   Votre choix [1-3]: " -n 1 -r
        echo
        case $REPLY in
            1)
                SELECTED_AUTH="direct_user"
                echo -e "${GREEN}✅ Sélectionné: Direct User - Configuration Simple${NC}\\n"
                break
                ;;
            2)
                SELECTED_AUTH="oauth2"
                echo -e "${GREEN}✅ Sélectionné: OAuth2 - Accès Complet aux 117 outils${NC}\\n"
                break
                ;;
            3)
                SELECTED_AUTH="manual"
                echo -e "${GREEN}✅ Sélectionné: Manuel - Fonctions de Base (32 outils)${NC}\\n"
                break
                ;;
            *)
                echo -e "${RED}   Veuillez choisir 1, 2 ou 3${NC}"
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
echo -e "\\n${BLUE}📦 Installation des dépendances...${NC}"
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
echo -e "\\n${BLUE}📁 Création de la structure...${NC}"
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

if [ "$SELECTED_AUTH" = "direct_user" ]; then
    echo -e "\\n${CYAN}⚡ Configuration Direct User${NC}"
    echo -e "${CYAN}Configuration ultra-simple avec vos identifiants Xibo${NC}"
    echo -e "${CYAN}Les outils s'adaptent automatiquement à vos permissions${NC}\\n"
    
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
                configure_direct_user
            else
                echo -e "${GREEN}✅ Configuration existante conservée${NC}"
            fi
        fi
    else
        if [ "$AI_INSTALL" = "true" ]; then
            echo -e "${YELLOW}Mode AI: Veuillez configurer .env manuellement après l'installation${NC}"
            echo -e "${YELLOW}       Copiez .env.example vers .env et configurez XIBO_AUTH_MODE=direct_user${NC}"
            echo -e "${YELLOW}       Ajoutez vos XIBO_USERNAME et XIBO_PASSWORD${NC}"
        else
            configure_direct_user
        fi
    fi

elif [ "$SELECTED_AUTH" = "oauth2" ]; then
    echo -e "\\n${CYAN}🔐 Configuration OAuth2 Utilisateur${NC}"
    echo -e "${CYAN}Cette configuration vous donne accès aux 117 outils${NC}"
    echo -e "${CYAN}Configuration directe avec votre compte utilisateur Xibo${NC}\\n"
    
    # OAuth2 mode - SEULEMENT auth-user (pas de setup.js)
    if [ "$AI_INSTALL" = "true" ]; then
        echo -e "${YELLOW}Mode AI: Exécutez 'npm run auth-user' après l'installation pour configurer OAuth2${NC}"
        echo -e "${YELLOW}       Le système créera automatiquement la configuration .env${NC}"
    else
        echo -e "${CYAN}⚙️  Authentification utilisateur OAuth2...${NC}"
        echo -e "${CYAN}Le script va vous guider pour configurer votre compte utilisateur Xibo${NC}"
        echo -e "${CYAN}et créer automatiquement le fichier .env avec les bonnes informations.${NC}\\n"
        npm run auth-user
    fi
    
else
    # Manual mode - SEULEMENT setup.js
    echo -e "\\n${BLUE}⚙️  Configuration Manuel (Client Credentials)${NC}"
    echo -e "${BLUE}Cette configuration vous donne accès aux 32 outils de base${NC}"
    echo -e "${BLUE}Configuration avec Client ID et Client Secret${NC}\\n"
    
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
        # Run setup script for manual mode
        echo -e "${BLUE}⚙️  Lancement de l'assistant de configuration...${NC}"
        if [ "$AI_INSTALL" = "true" ]; then
            echo -e "${YELLOW}Mode AI: Veuillez configurer manuellement .env après l'installation${NC}"
            echo -e "${YELLOW}       Copiez .env.example vers .env et remplissez les valeurs${NC}"
        else
            node scripts/setup.js
        fi
    fi
fi

# Function to configure Direct User mode
configure_direct_user() {
    echo -e "${BLUE}🔐 Configuration Direct User${NC}"
    echo -e "${BLUE}==============================${NC}\\n"
    
    # Gather Xibo connection details
    read -p "🌐 URL de votre serveur Xibo (ex: https://cms.exemple.com): " XIBO_URL
    read -p "👤 Nom d'utilisateur Xibo: " XIBO_USER
    read -s -p "🔑 Mot de passe Xibo: " XIBO_PASS
    echo
    
    # Validate inputs
    if [ -z "$XIBO_URL" ] || [ -z "$XIBO_USER" ] || [ -z "$XIBO_PASS" ]; then
        echo -e "${RED}❌ Tous les champs sont requis${NC}"
        return 1
    fi
    
    # Create .env file
    echo -e "\\n${BLUE}📝 Création du fichier de configuration...${NC}"
    
    cat > .env << EOF
# Xibo MCP Server Configuration - Direct User Mode
XIBO_API_URL=$XIBO_URL
XIBO_AUTH_MODE=direct_user
XIBO_USERNAME=$XIBO_USER
XIBO_PASSWORD=$XIBO_PASS

# Company Branding
COMPANY_NAME=Xtranumerik Inc.
LOGO_PATH=/assets/logo-xtranumerik.png

# Geographic Configuration (Quebec/Montreal optimized)
GEO_ZONES={"quebec":{"name":"Région de Québec","cities":["Quebec City","Lévis","Beauport","Charlesbourg"],"tags":["quebec","capitale"]},"montreal":{"name":"Région de Montréal","cities":["Montreal","Laval","Longueuil","Brossard","Saint-Laurent"],"tags":["montreal","metropole"]},"national":{"name":"National","cities":["all"],"tags":["canada","national"]}}

# Default Tags
DEFAULT_TAGS=advertising,information,emergency,promotion,seasonal,restaurant,menu,weather

# MCP Server Configuration
MCP_SERVER_NAME=xibo-mcp
MCP_SERVER_VERSION=2.0.0
MCP_SERVER_PORT=3000

# Logging
LOG_LEVEL=info
LOG_FILE=xibo-mcp.log

# Cache Settings
CACHE_TTL=300
ENABLE_CACHE=true

# API Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# Session Configuration (Direct User mode)
SESSION_TIMEOUT=480
MFA_ENABLED=true

# Timezone and Localization
TIMEZONE=America/Montreal
LOCALE=fr_CA
EOF
    
    echo -e "${GREEN}✅ Configuration Direct User créée avec succès${NC}"
    echo -e "${CYAN}   Mode: Authentification directe avec session management${NC}"
    echo -e "${CYAN}   Outils: Adaptés automatiquement selon vos permissions${NC}"
}

# ========================================
# BUILD ET VALIDATION
# ========================================

# Build TypeScript
echo -e "\\n${BLUE}🔨 Compilation du projet...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors de la compilation${NC}"
    exit 1
fi

# Validate tools
echo -e "\\n${BLUE}🧪 Validation des 117 outils MCP...${NC}"
npm run validate

# ========================================
# CONFIGURATION CLAUDE DESKTOP
# ========================================

# Optional: Configure Claude Desktop
echo -e "\\n${YELLOW}🤖 Configuration de Claude Desktop${NC}"
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
echo -e "\\n${GREEN}🎉========================================${NC}"
echo -e "${GREEN}✅ Installation Terminée avec Succès!${NC}"
echo -e "${GREEN}========================================${NC}\\n"

echo -e "${CYAN}📊 Résumé de l'Installation v2.0:${NC}"
echo -e "   🏢 Société: Xtranumerik Inc."
echo -e "   📦 Serveur MCP: Xibo Digital Signage v2.0.0"

case $SELECTED_AUTH in
    "direct_user")
        echo -e "   🛠️  Outils disponibles: Adaptés selon vos permissions utilisateur"
        echo -e "   🔐 Mode d'authentification: Direct User (Username/Password)"
        echo -e "   ⚡ Avantages: Configuration ultra-simple, détection automatique des permissions"
        ;;
    "oauth2")
        echo -e "   🛠️  Outils disponibles: 117 outils MCP (Accès Complet)"
        echo -e "   🔐 Mode d'authentification: OAuth2 Utilisateur"
        ;;
    "manual")
        echo -e "   🛠️  Outils disponibles: 32 outils MCP (Fonctions de Base)"
        echo -e "   🔐 Mode d'authentification: Client Credentials"
        ;;
esac

echo -e "   🌍 Zones géographiques: Québec/Montréal configurées"
echo -e "   🎯 Fonctionnalité clé: Diffusion intelligente géo-ciblée"

echo -e "\\n${BLUE}📋 Prochaines étapes:${NC}"
echo -e "   1. ${YELLOW}npm start${NC} - Démarrer le serveur MCP"
echo -e "   2. Ouvrir Claude Desktop (si configuré)"
echo -e "   3. Tester avec une commande simple"

case $SELECTED_AUTH in
    "direct_user")
        echo -e "   4. Les outils s'adaptent automatiquement à vos permissions!"
        if [ "$AI_INSTALL" = "true" ]; then
            echo -e "   5. ${YELLOW}Configurez .env${NC} avec XIBO_AUTH_MODE=direct_user"
        fi
        ;;
    "manual")
        echo -e "   4. ${YELLOW}npm run auth-user${NC} - Pour passer en mode OAuth2 (117 outils)"
        ;;
    "oauth2")
        if [ "$AI_INSTALL" = "true" ]; then
            echo -e "   4. ${YELLOW}npm run auth-user${NC} - Pour finaliser la configuration OAuth2"
        fi
        ;;
esac

# Mode-specific success messages
case $SELECTED_AUTH in
    "direct_user")
        echo -e "\\n${MAGENTA}⚡ Mode Direct User Configuré:${NC}"
        echo -e "   • Configuration ultra-simple avec username/password"
        echo -e "   • Détection automatique de votre niveau d'accès Xibo"
        echo -e "   • Outils filtrés dynamiquement selon vos permissions"
        echo -e "   • Session management avec auto-refresh"
        echo -e "   • Support MFA si activé sur votre compte"
        echo -e "   • Zero configuration OAuth2 requise!"
        ;;
    "oauth2")
        echo -e "\\n${MAGENTA}🚀 Accès Complet Configuré - 117 Outils Disponibles:${NC}"
        echo -e "   • 32 outils de base (écrans, layouts, médias, campagnes)"
        echo -e "   • 85 outils avancés (utilisateurs, analytics, alertes, automation)"
        echo -e "   • Gestion avancée utilisateurs et permissions"
        echo -e "   • Analytics et rapports détaillés"
        echo -e "   • Alertes d'urgence géo-ciblées"
        echo -e "   • Menu boards et automatisation"
        echo -e "   • Workflows et synchronisation multi-CMS"
        echo -e "   • Transitions et effets visuels professionnels"
        ;;
    "manual")
        echo -e "\\n${MAGENTA}📊 Fonctions de Base Configurées - 32 Outils:${NC}"
        echo -e "   • Gestion complète des écrans et groupes"
        echo -e "   • Création et modification des layouts"
        echo -e "   • Upload et gestion des médias"
        echo -e "   • Campagnes et programmation"
        echo -e "   • Diffusion intelligente avec filtrage géographique"
        echo -e "   • Broadcasting et alertes de base"
        ;;
esac

echo -e "\\n${CYAN}💡 Exemples de commandes à tester:${NC}"
echo -e '   🍁 \"Mets cette publicité dans tous mes écrans sauf ceux à Québec\"'
echo -e '   📊 \"Montre-moi les statistiques de diffusion de cette semaine\"'
echo -e '   📅 \"Programme cette campagne pour demain matin de 9h à 17h\"'
echo -e '   🎨 \"Crée une mise en page avec des transitions élégantes\"'

if [ "$SELECTED_AUTH" != "manual" ]; then
    echo -e '   🚨 \"Diffuse cette alerte d'\''urgence dans la région de Québec\"'
    echo -e '   🍽️  \"Crée un menu board pour mon restaurant avec prix dynamiques\"'
    echo -e '   🤖 \"Configure une automatisation pour les alertes météo\"'
fi

echo -e "\\n${YELLOW}📚 Documentation disponible:${NC}"
echo -e "   📖 README.md - Guide de démarrage rapide"
case $SELECTED_AUTH in
    "direct_user")
        echo -e "   📋 docs/DIRECT-USER-SETUP.md - Guide du mode Direct User"
        ;;
    "oauth2")
        echo -e "   📋 docs/COMPLETE-API-REFERENCE.md - Référence des 117 outils"
        ;;
    "manual")
        echo -e "   📝 docs/API-REFERENCE.md - Référence des 32 outils de base"
        ;;
esac
echo -e "   🔧 .env.example - Exemple de configuration"
echo -e "   📊 docs/DEVELOPMENT-CONTEXT.md - Contexte développement"
echo -e "   🔐 docs/OAUTH2-SETUP.md - Guide OAuth2 utilisateur"

echo -e "\\n${GREEN}🍁 Optimisations Québécoises:${NC}"
echo -e "   🌍 Filtrage géographique intelligent Québec/Montréal"
echo -e "   🇫🇷 Support bilingue français/anglais natif"
echo -e "   🌨️  Intégration Environnement Canada"
echo -e "   🕐 Fuseau horaire EST/EDT automatique"
echo -e "   🍽️  Templates menus québécois (poutine, tourtière, etc.)"
echo -e "   🚨 Alertes d'urgence géo-ciblées"

echo -e "\\n${GREEN}🆘 Support Xtranumerik:${NC}"
echo -e "   📧 Email: support@xtranumerik.ca"
echo -e "   🌐 Site: https://www.xtranumerik.ca"
echo -e "   📞 Support technique disponible"
echo -e "   💬 Communauté: GitHub Discussions"

echo -e "\\n${BLUE}🚀 Pour démarrer maintenant:${NC}"
echo -e "   ${YELLOW}npm start${NC}"

if [ "$AI_INSTALL" = "true" ]; then
    echo -e "\\n${CYAN}🤖 Installation AI Mode Complétée${NC}"
    echo -e "   Variables utilisées:"
    echo -e "   - AI_INSTALL=$AI_INSTALL"
    echo -e "   - AUTH_MODE=$AUTH_MODE"
    echo -e "   Mode final: $(case $SELECTED_AUTH in "direct_user") echo "Direct User";; "oauth2") echo "OAuth2";; "manual") echo "Manuel";; esac)"
    
    if [ "$SELECTED_AUTH" = "oauth2" ]; then
        echo -e "\\n${YELLOW}⚠️  Configuration OAuth2 requise:${NC}"
        echo -e "   Exécutez: ${YELLOW}npm run auth-user${NC} pour finaliser la configuration"
    elif [ "$SELECTED_AUTH" = "direct_user" ]; then
        echo -e "\\n${YELLOW}⚠️  Configuration Direct User requise:${NC}"
        echo -e "   Configurez .env avec XIBO_AUTH_MODE=direct_user"
        echo -e "   Ajoutez vos XIBO_USERNAME et XIBO_PASSWORD"
    fi
fi

echo -e "\\n${GREEN}Merci d'avoir choisi Xtranumerik pour vos solutions d'affichage dynamique!${NC}"
echo -e "${GREEN}Profitez de la puissance $(case $SELECTED_AUTH in "direct_user") echo "des outils adaptés à vos permissions";; "oauth2") echo "des 117 outils MCP";; "manual") echo "des 32 outils de base";; esac) pour Xibo!${NC}\\n"