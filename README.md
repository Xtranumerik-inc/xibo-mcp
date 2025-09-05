# 🚀 Xtranumerik MCP Server pour Xibo v2.0.0

**Serveur MCP professionnel pour Xibo Digital Signage avec 117 outils complets**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/Xtranumerik-inc/xibo-mcp)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-18%2B-brightgreen.svg)](https://nodejs.org/)

---

## 📋 Table des Matières

- [🎯 Fonctionnalités](#-fonctionnalités)
- [⚡ Installation Rapide](#-installation-rapide)
- [🔐 Modes d'Authentification](#-modes-dauthentification)
- [🤖 Installation AI-friendly](#-installation-ai-friendly)
- [💡 Exemples d'Utilisation](#-exemples-dutilisation)
- [📊 Outils Disponibles](#-outils-disponibles)
- [🍁 Optimisations Québécoises](#-optimisations-québécoises)
- [🆘 Support](#-support)

---

## 🎯 Fonctionnalités

### 🚀 **117 Outils MCP Complets**
- **32 outils de base** (authentification client)
- **85 outils avancés** (authentification OAuth2 utilisateur)
- **Dual authentification** avec fallback automatique
- **Contrôle complet de Xibo 4.x**

### 🌍 **Optimisé pour le Québec**
- Filtrage géographique intelligent Québec/Montréal
- Support bilingue français/anglais natif
- Intégration Environnement Canada
- Fuseau horaire EST/EDT automatique
- Alertes d'urgence géo-ciblées

### 🎨 **Fonctionnalités Professionnelles**
- Menu boards dynamiques pour restaurants
- Analytics et rapports avancés
- Automatisation et workflows
- Transitions et effets visuels
- Synchronisation multi-CMS

---

## ⚡ Installation Rapide

### 📦 **Installation Standard (Interactif)**

```bash
# Cloner le projet
git clone https://github.com/Xtranumerik-inc/xibo-mcp.git
cd xibo-mcp

# Lancer l'installation
chmod +x install.sh
./install.sh
```

**Le script vous demandera immédiatement:**
1. **OAuth2** (117 outils) ou **Manuel** (32 outils) ?
2. Configuration de votre serveur Xibo
3. Setup Claude Desktop (optionnel)

### 🤖 **Installation AI-friendly (Automatique)**

```bash
# Installation automatique mode Manuel
AI_INSTALL=true AUTH_MODE=manual ./install.sh

# Installation automatique mode OAuth2
AI_INSTALL=true AUTH_MODE=oauth2 ./install.sh

# Installation automatique par défaut (Manuel)
AI_INSTALL=true ./install.sh
```

---

## 🔐 Modes d'Authentification

### 📊 **Mode Manuel (Client Credentials)**
```bash
# Installation rapide
AUTH_MODE=manual ./install.sh
```

**Avantages:**
- ✅ Configuration en 2 minutes
- ✅ 32 outils de base disponibles
- ✅ Gestion complète écrans, layouts, médias
- ✅ Campagnes et programmation
- ✅ Diffusion intelligente géo-ciblée

**Outils disponibles:** 32
- Displays, Layouts, Media, Campaigns
- Playlists, Schedules, Display Groups
- Broadcasting avec filtrage Québec/Montréal

### 🚀 **Mode OAuth2 (Authentification Utilisateur)**
```bash
# Installation complète
AUTH_MODE=oauth2 ./install.sh
```

**Avantages:**
- ✅ TOUS les 117 outils disponibles
- ✅ Gestion avancée utilisateurs et permissions
- ✅ Analytics et rapports détaillés
- ✅ Alertes d'urgence géo-ciblées
- ✅ Menu boards et automatisation
- ✅ Workflows professionnels

**Outils disponibles:** 117 (32 + 85 avancés)
- Tous les outils de base +
- Users & Groups, Folders & Permissions
- Statistics & Reports, Datasets
- Templates & Widgets, Notifications & Alerts
- System Configuration, Transitions & Effects
- Sync & Integrations, Menu Boards, Automation

---

## 🤖 Installation AI-friendly

### Variables d'Environnement Supportées

| Variable | Valeurs | Description |
|----------|---------|-------------|
| `AI_INSTALL` | `true/false` | Mode non-interactif |
| `AUTH_MODE` | `oauth2/manual` | Pré-sélection du mode d'auth |

### Exemples d'Usage AI

```bash
# 1. Installation complète automatique (117 outils)
AI_INSTALL=true AUTH_MODE=oauth2 ./install.sh

# 2. Installation de base automatique (32 outils)
AI_INSTALL=true AUTH_MODE=manual ./install.sh

# 3. Installation par défaut (Manuel, 32 outils)
AI_INSTALL=true ./install.sh

# 4. Avec configuration personnalisée
export AI_INSTALL=true
export AUTH_MODE=oauth2
export XIBO_API_URL="https://mon-xibo.com"
./install.sh
```

**Notes importantes pour AI:**
- Le mode AI conserve les fichiers `.env` existants
- Configuration OAuth2 nécessite `npm run auth-user` post-installation
- Les configurations manuelles peuvent être faites après installation

---

## 💡 Exemples d'Utilisation

### 🍁 **Commandes Québécoises Typiques**

```javascript
// Diffusion intelligente géo-ciblée
"Mets cette publicité dans tous mes écrans sauf ceux à Québec"
→ broadcast_ad + filtrage géographique

// Analytics régionaux
"Montre-moi les statistiques de mes écrans à Montréal"
→ stats_display_usage + filtrage géo

// Alertes d'urgence (OAuth2 requis)
"Diffuse cette alerte d'urgence dans la région de Québec"
→ alert_emergency_create + notification_broadcast

// Menu boards dynamiques (OAuth2 requis)
"Change les prix du menu pour le lunch"
→ menuboard_update_prices + daypart_assign
```

### 📊 **Intégration Claude Desktop**

1. Le script configure automatiquement Claude Desktop
2. Redémarrez Claude après installation
3. Testez avec: `"Liste mes écrans à Montréal"`

---

## 📊 Outils Disponibles

### 🔧 **32 Outils de Base (Mode Manuel)**

| Module | Outils | Description |
|--------|--------|-------------|
| **Displays** | 6 outils | Gestion complète des écrans |
| **Layouts** | 4 outils | Création et modification layouts |
| **Media** | 5 outils | Upload et gestion médias |
| **Campaigns** | 3 outils | Campagnes publicitaires |
| **Playlists** | 3 outils | Listes de lecture dynamiques |
| **Schedules** | 4 outils | Programmation et calendrier |
| **Display Groups** | 3 outils | Groupes d'écrans |
| **Broadcasting** | 4 outils | Diffusion géo-ciblée |

### 🚀 **85 Outils Avancés (Mode OAuth2)**

| Module | Outils | Description |
|--------|--------|-------------|
| **Users & Groups** | 11 outils | Gestion utilisateurs et permissions |
| **Folders & Permissions** | 6 outils | Organisation et sécurité |
| **Statistics & Reports** | 9 outils | Analytics et rapports détaillés |
| **Datasets** | 9 outils | Données dynamiques et sync |
| **Templates & Widgets** | 10 outils | Templates et widgets avancés |
| **Notifications & Alerts** | 8 outils | Alertes d'urgence géo-ciblées |
| **System Configuration** | 9 outils | Configuration système avancée |
| **Transitions & Effects** | 7 outils | Effets visuels professionnels |
| **Sync & Integrations** | 6 outils | Synchronisation multi-CMS |
| **Menu Boards** | 5 outils | Menus dynamiques restaurants |
| **Automation** | 5 outils | Workflows et automatisation |

---

## 🍁 Optimisations Québécoises

### 🌍 **Filtrage Géographique Intelligent**
- Détection automatique des écrans Québec/Montréal
- Commandes naturelles: *"sauf ceux à Québec"*
- Support des régions administratives du Québec

### 🇫🇷 **Support Bilingue Natif**
- Interface français/anglais
- Templates localisés québécois
- Menus spécialisés (poutine, tourtière, etc.)

### 🌨️ **Intégrations Locales**
- Environnement Canada (météo)
- Fuseau horaire EST/EDT automatique
- Alertes d'urgence géo-ciblées
- Support des codes postaux québécois

---

## 🔧 Configuration Post-Installation

### 📋 **Mode Manuel → OAuth2 (Upgrade)**
```bash
# Pour passer de 32 à 117 outils
npm run auth-user
```

### ⚙️ **Configuration Manuelle**
```bash
# Reconfiguration complète
node scripts/setup.js

# Test de connexion
npm run test-auth

# Configuration Claude Desktop
npm run configure-claude
```

### 🚀 **Démarrage**
```bash
# Démarrer le serveur MCP
npm start

# Test de fonctionnement
"Liste mes écrans"
```

---

## 🆘 Support et Documentation

### 📚 **Documentation Complète**
- `docs/API-REFERENCE.md` - 32 outils de base
- `docs/COMPLETE-API-REFERENCE.md` - 117 outils complets
- `docs/OAUTH2-SETUP.md` - Guide OAuth2 détaillé
- `DEVELOPMENT-CONTEXT.md` - Contexte développement

### 🔧 **Support Technique**
- **Email:** support@xtranumerik.ca
- **Site:** https://www.xtranumerik.ca
- **GitHub:** Issues et Discussions
- **Support téléphonique disponible**

### 🐛 **Dépannage Courant**

**Problème:** OAuth2 ne fonctionne pas
```bash
# Solution
npm run auth-user
# Suivre les instructions interactives
```

**Problème:** Erreur de connexion Xibo
```bash
# Vérifier la configuration
node scripts/test-auth.js
```

**Problème:** Claude ne voit pas le serveur
```bash
# Reconfigurer Claude Desktop
npm run configure-claude
# Redémarrer Claude
```

---

## 🎯 Roadmap v2.1

- [ ] Interface web d'administration
- [ ] Intégration Teams/Slack
- [ ] Templates d'alertes prédéfinis
- [ ] Support Xibo Cloud
- [ ] API REST complémentaire

---

## 📄 License

MIT License - voir [LICENSE](LICENSE) pour détails.

**Développé avec ❤️ par Xtranumerik Inc. pour la communauté québécoise.**

---

*Serveur MCP professionnel pour Xibo Digital Signage - Contrôlez vos écrans avec la puissance de l'IA et 117 outils spécialisés!*