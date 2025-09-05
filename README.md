# 🚀 Xtranumerik MCP Server for Xibo v2.0.0

**Professional MCP server for Xibo Digital Signage with 117 complete tools**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/Xtranumerik-inc/xibo-mcp)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-18%2B-brightgreen.svg)](https://nodejs.org/)

---

## 📋 Table of Contents

- [🎯 Features](#-features)
- [⚡ Quick Installation](#-quick-installation)
- [🔐 Authentication Modes](#-authentication-modes)
- [🤖 AI-friendly Installation](#-ai-friendly-installation)
- [💡 Usage Examples](#-usage-examples)
- [📊 Available Tools](#-available-tools)
- [🌍 Regional Optimizations](#-regional-optimizations)
- [🆘 Support](#-support)

---

## 🎯 Features

### 🚀 **117 Complete MCP Tools**
- **32 basic tools** (client authentication)
- **85 advanced tools** (OAuth2 user authentication)
- **Dual authentication** with automatic fallback
- **Complete Xibo 4.x control**

### 🌍 **Regional Optimization**
- Smart geographic filtering for regional targeting
- Native bilingual support (French/English)
- Timezone management (EST/EDT automatic)
- Geo-targeted emergency alerts
- Regional display management

### 🎨 **Professional Features**
- Dynamic menu boards for restaurants
- Advanced analytics and reporting
- Automation and workflows
- Visual transitions and effects
- Multi-CMS synchronization

---

## ⚡ Quick Installation

### 📦 **Standard Installation (Interactive)**

```bash
# Clone the project
git clone https://github.com/Xtranumerik-inc/xibo-mcp.git
cd xibo-mcp

# Launch installation
chmod +x install.sh
./install.sh
```

**The script will immediately ask you:**
1. **OAuth2** (117 tools) or **Manual** (32 tools)?
2. Configure your Xibo server
3. Setup Claude Desktop (optional)

### 🤖 **AI-friendly Installation (Automatic)**

```bash
# Automatic installation Manual mode
AI_INSTALL=true AUTH_MODE=manual ./install.sh

# Automatic installation OAuth2 mode
AI_INSTALL=true AUTH_MODE=oauth2 ./install.sh

# Default automatic installation (Manual)
AI_INSTALL=true ./install.sh
```

---

## 🔐 Authentication Modes

### 📊 **Manual Mode (Client Credentials)**
```bash
# Quick installation
AUTH_MODE=manual ./install.sh
```

**Advantages:**
- ✅ 2-minute configuration
- ✅ 32 basic tools available
- ✅ Complete management of screens, layouts, media
- ✅ Campaigns and scheduling
- ✅ Smart geo-targeted broadcasting

**Available tools:** 32
- Displays, Layouts, Media, Campaigns
- Playlists, Schedules, Display Groups
- Broadcasting with regional filtering

### 🚀 **OAuth2 Mode (User Authentication)**
```bash
# Complete installation
AUTH_MODE=oauth2 ./install.sh
```

**Advantages:**
- ✅ ALL 117 tools available
- ✅ Advanced user and permission management
- ✅ Detailed analytics and reports
- ✅ Geo-targeted emergency alerts
- ✅ Menu boards and automation
- ✅ Professional workflows

**Available tools:** 117 (32 + 85 advanced)
- All basic tools +
- Users & Groups, Folders & Permissions
- Statistics & Reports, Datasets
- Templates & Widgets, Notifications & Alerts
- System Configuration, Transitions & Effects
- Sync & Integrations, Menu Boards, Automation

---

## 🤖 AI-friendly Installation

### Supported Environment Variables

| Variable | Values | Description |
|----------|--------|-------------|
| `AI_INSTALL` | `true/false` | Non-interactive mode |
| `AUTH_MODE` | `oauth2/manual` | Auth mode pre-selection |

### AI Usage Examples

```bash
# 1. Complete automatic installation (117 tools)
AI_INSTALL=true AUTH_MODE=oauth2 ./install.sh

# 2. Basic automatic installation (32 tools)
AI_INSTALL=true AUTH_MODE=manual ./install.sh

# 3. Default installation (Manual, 32 tools)
AI_INSTALL=true ./install.sh

# 4. With custom configuration
export AI_INSTALL=true
export AUTH_MODE=oauth2
export XIBO_API_URL="https://my-xibo.com"
./install.sh
```

**Important notes for AI:**
- AI mode preserves existing `.env` files
- OAuth2 configuration requires `npm run auth-user` post-installation
- Manual configurations can be done after installation

---

## 💡 Usage Examples

### 🌍 **Typical Regional Commands**

```javascript
// Smart geo-targeted broadcasting
"Put this advertisement on all my screens except those in Region A"
→ broadcast_ad + geographic filtering

// Regional analytics
"Show me statistics for my displays in Region B"
→ stats_display_usage + geo filtering

// Emergency alerts (OAuth2 required)
"Broadcast this emergency alert in the northern region"
→ alert_emergency_create + notification_broadcast

// Dynamic menu boards (OAuth2 required)
"Change menu prices for lunch time"
→ menuboard_update_prices + daypart_assign
```

### 📊 **Claude Desktop Integration**

1. Script automatically configures Claude Desktop
2. Restart Claude after installation
3. Test with: `"List my regional displays"`

---

## 📊 Available Tools

### 🔧 **32 Basic Tools (Manual Mode)**

| Module | Tools | Description |
|--------|-------|-------------|
| **Displays** | 6 tools | Complete screen management |
| **Layouts** | 4 tools | Layout creation and modification |
| **Media** | 5 tools | Media upload and management |
| **Campaigns** | 3 tools | Advertising campaigns |
| **Playlists** | 3 tools | Dynamic playlists |
| **Schedules** | 4 tools | Scheduling and calendar |
| **Display Groups** | 3 tools | Screen groups |
| **Broadcasting** | 4 tools | Geo-targeted broadcasting |

### 🚀 **85 Advanced Tools (OAuth2 Mode)**

| Module | Tools | Description |
|--------|-------|-------------|
| **Users & Groups** | 11 tools | User and permission management |
| **Folders & Permissions** | 6 tools | Organization and security |
| **Statistics & Reports** | 9 tools | Detailed analytics and reports |
| **Datasets** | 9 tools | Dynamic data and sync |
| **Templates & Widgets** | 10 tools | Advanced templates and widgets |
| **Notifications & Alerts** | 8 tools | Geo-targeted emergency alerts |
| **System Configuration** | 9 tools | Advanced system configuration |
| **Transitions & Effects** | 7 tools | Professional visual effects |
| **Sync & Integrations** | 6 tools | Multi-CMS synchronization |
| **Menu Boards** | 5 tools | Dynamic restaurant menus |
| **Automation** | 5 tools | Workflows and automation |

---

## 🌍 Regional Optimizations

### 🗺️ **Smart Geographic Filtering**
- Automatic detection of regional displays
- Natural commands: *"except those in Region X"*
- Support for administrative regions
- Customizable geographic zones

### 🌐 **Native Bilingual Support**
- French/English interface
- Localized templates
- Regional menu specialties
- Cultural customization options

### ⚡ **Regional Integrations**
- Weather service integration
- Automatic timezone management
- Geo-targeted emergency alerts
- Regional postal code support

---

## 🔧 Post-Installation Configuration

### 📋 **Manual → OAuth2 Upgrade**
```bash
# To upgrade from 32 to 117 tools
npm run auth-user
```

### ⚙️ **Manual Configuration**
```bash
# Complete reconfiguration
node scripts/setup.js

# Connection test
npm run test-auth

# Claude Desktop configuration
npm run configure-claude
```

### 🚀 **Starting**
```bash
# Start MCP server
npm start

# Test functionality
"List my displays"
```

---

## 🆘 Support and Documentation

### 📚 **Complete Documentation**
- `docs/API-REFERENCE.md` - 32 basic tools
- `docs/COMPLETE-API-REFERENCE.md` - 117 complete tools
- `docs/OAUTH2-SETUP.md` - Detailed OAuth2 guide

### 🔧 **Technical Support**
- **Email:** support@xtranumerik.ca
- **Website:** https://www.xtranumerik.ca
- **GitHub:** Issues and Discussions
- **Phone support available**

### 🐛 **Common Troubleshooting**

**Issue:** OAuth2 not working
```bash
# Solution
npm run auth-user
# Follow interactive instructions
```

**Issue:** Xibo connection error
```bash
# Check configuration
node scripts/test-auth.js
```

**Issue:** Claude doesn't see the server
```bash
# Reconfigure Claude Desktop
npm run configure-claude
# Restart Claude
```

---

## 🎯 Roadmap v2.1

- [ ] Web administration interface
- [ ] Teams/Slack integration
- [ ] Pre-defined alert templates
- [ ] Xibo Cloud support
- [ ] Complementary REST API

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

**Developed with ❤️ by Xtranumerik Inc.**

---

*Professional MCP server for Xibo Digital Signage - Control your displays with AI power and 117 specialized tools!*