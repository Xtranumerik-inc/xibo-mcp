# 🚀 Xtranumerik MCP for Xibo Digital Signage

<div align="center">
  <img src="assets/banner.png" alt="Xtranumerik MCP for Xibo" width="600">
  
  [![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/Xtranumerik-inc/xibo-mcp)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
  [![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
  [![MCP](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io)
  [![Tools](https://img.shields.io/badge/tools-117-orange.svg)](docs/COMPLETE-API-REFERENCE.md)
  [![Quebec](https://img.shields.io/badge/optimized-Quebec%2FMontreal-red.svg)](docs/QUEBEC-FEATURES.md)
</div>

## 📋 Description

**Professional Edition v2.0** - The most comprehensive MCP (Model Context Protocol) server for Xibo Digital Signage CMS. This server provides complete API integration with **117 specialized tools**, allowing natural language control of your entire digital signage network through Claude.

### ✨ Version 2.0 Professional Features

- 🎯 **117 Professional Tools**: Complete Xibo 4.x API coverage with advanced features
- 🇫🇷 **Quebec/Montreal Optimized**: Intelligent geographic filtering and French-Canadian support  
- 🔐 **Dual Authentication**: Client credentials (32 tools) + OAuth2 user authentication (85 advanced tools)
- 🚨 **Emergency Alerts**: Geo-targeted emergency broadcasting with regional filtering
- 🍽️ **Menu Boards**: Dynamic restaurant menu management with Quebec cuisine templates
- 📊 **Advanced Analytics**: Comprehensive reporting and performance metrics
- 🤖 **Automation & Workflows**: Professional automation with triggers and conditions
- 🌍 **Multi-CMS Sync**: Synchronize content across multiple Xibo instances
- 🎭 **Visual Effects**: Professional transitions and visual effects
- 📱 **Bilingual Support**: Native French/English with Quebec localization

## 🚀 Quick Installation

```bash
git clone https://github.com/Xtranumerik-inc/xibo-mcp.git
cd xibo-mcp
chmod +x install.sh
./install.sh
```

## 📦 Manual Installation

1. **Clone the repository**
```bash
git clone https://github.com/Xtranumerik-inc/xibo-mcp.git
cd xibo-mcp
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your Xibo credentials
```

4. **Build the project**
```bash
npm run build
```

5. **Start the server**
```bash
npm start
```

6. **Optional: Setup OAuth2 for advanced features**
```bash
npm run auth-user
```

## ⚙️ Configuration

### Required Environment Variables

```env
XIBO_API_URL=https://your-xibo-instance.com
XIBO_CLIENT_ID=your_client_id
XIBO_CLIENT_SECRET=your_client_secret
```

### Quebec Geographic Configuration

```env
# Geographic zones for intelligent filtering
GEO_ZONES='{
  "quebec_region": ["Quebec City", "Levis", "Beauport"],
  "montreal_region": ["Montreal", "Laval", "Longueuil"],
  "national": ["all"]
}'

# Default Quebec exclusions
DEFAULT_EXCLUDE_CITIES=Quebec City,Levis
```

### Advanced Features Configuration

```env
# Region permissions for professional features
REGION_PERMISSIONS='{
  "client_a": {"regions": ["region_1"], "permissions": ["view", "edit_content"]},
  "internal": {"regions": ["all"], "permissions": ["all"]}
}'

# Professional tags
DEFAULT_TAGS=publicitaire,information,urgence,promotion,quebec,montreal
```

## 💬 Professional Commands Examples

Once configured with Claude Desktop, you can use natural language commands:

### Quebec Geographic Targeting 🍁
```
"Mets cette publicité dans tous mes écrans publicitaires sauf ceux à Québec"
"Diffuse cette vidéo urgente sur TOUS les écrans de Montréal"
"Montre-moi les statistiques de mes écrans de la région de Québec"
"Configure une alerte d'urgence pour la tempête de neige dans Québec"
```

### Emergency Management 🚨
```
"Diffuse cette alerte d'urgence dans toute la région de Montréal"
"Crée une notification d'évacuation pour les écrans du centre-ville"
"Programme une alerte météo pour demain matin dans tout le Québec"
```

### Menu Boards & Restaurant Management 🍽️
```
"Crée un menu board pour mon restaurant avec les prix de la poutine"
"Mets à jour les prix du menu du midi pour tous mes restaurants"
"Ajoute le menu du temps des sucres à tous les écrans de Québec"
```

### Advanced Analytics & Reports 📊
```
"Génère un rapport de diffusion pour cette semaine"
"Montre-moi les statistiques d'engagement par région"
"Exporte les données de preuve de diffusion du mois dernier"
```

### Automation & Workflows 🤖
```
"Configure un workflow qui change le contenu selon la météo"
"Crée une automatisation pour les alertes de circulation"
"Programme une séquence de contenu saisonnier québécois"
```

## 🛠️ Complete Tool Suite (117 Tools)

### Core Tools (32 - Client Credentials)
- **Displays**: Management, screenshots, authorization, wake-on-LAN
- **Layouts**: Creation, editing, publishing, preview
- **Media**: Upload, management, tagging, organization
- **Campaigns**: Creation, assignment, management
- **Playlists**: Creation, nested playlists, content reordering
- **Schedules**: Programming, recurring events, priority management
- **Display Groups**: Organization and bulk management
- **Broadcasting**: Intelligent geographic filtering

### Advanced Professional Tools (85 - OAuth2 Required)
- **Users & Groups**: Advanced user management and permissions
- **Folders & Permissions**: Security and organization
- **Statistics & Reports**: Comprehensive analytics and reporting
- **Datasets**: Dynamic data integration and synchronization
- **Templates & Widgets**: Advanced templates and custom widgets
- **Notifications & Alerts**: Emergency alerts with geo-targeting
- **System Configuration**: Advanced system management
- **Transitions & Effects**: Professional visual effects
- **Sync & Integrations**: Multi-CMS synchronization
- **Menu Boards**: Restaurant and menu management
- **Automation**: Workflows, triggers, and advanced automation

## 📁 Project Structure

```
xibo-mcp/
├── src/
│   ├── index.ts                 # MCP server entry point (v2.0)
│   ├── xibo-client.ts          # Dual authentication Xibo client
│   ├── types.ts                # Complete TypeScript definitions
│   └── tools/                  # 11 tool modules (117 tools total)
│       ├── displays.js         # Display management (4 tools)
│       ├── layouts.js          # Layout management (4 tools)
│       ├── media.js            # Media management (4 tools)
│       ├── campaigns.js        # Campaign management (3 tools)
│       ├── playlists.js        # Playlist management (3 tools)
│       ├── schedules.js        # Schedule management (4 tools)
│       ├── display-groups.js   # Group management (2 tools)
│       ├── broadcast.js        # Geographic broadcasting (8 tools)
│       ├── users.js            # User management (12 tools) *OAuth2
│       ├── folders.js          # Folder management (8 tools) *OAuth2
│       ├── statistics.js       # Analytics & reports (15 tools) *OAuth2
│       ├── datasets.js         # Dataset management (10 tools) *OAuth2
│       ├── templates.js        # Template management (9 tools) *OAuth2
│       ├── notifications.js    # Emergency alerts (8 tools) *OAuth2
│       ├── system.js           # System config (9 tools) *OAuth2
│       ├── transitions.js      # Visual effects (7 tools) *OAuth2
│       ├── sync.js             # Multi-CMS sync (6 tools) *OAuth2
│       ├── menuboards.js       # Menu boards (5 tools) *OAuth2
│       └── actions.js          # Automation (5 tools) *OAuth2
├── scripts/
│   ├── setup.js               # Interactive setup wizard
│   ├── oauth-user-setup.js    # OAuth2 user authentication setup
│   ├── validate-tools.js      # Tool validation script
│   └── configure-claude.js    # Claude Desktop configuration
├── docs/
│   ├── API-REFERENCE.md       # Core tools reference (32 tools)
│   ├── COMPLETE-API-REFERENCE.md # Complete reference (117 tools)
│   ├── QUEBEC-FEATURES.md     # Quebec-specific features
│   ├── OAUTH2-SETUP.md        # OAuth2 setup guide
│   └── DEVELOPMENT-CONTEXT.md # Development context
└── config/                    # Configuration and templates
```

## 🍁 Quebec & Montreal Optimizations

### Geographic Intelligence
- **Smart Filtering**: Automatic Quebec City/Montreal region detection
- **Bilingual Support**: Native French/English with Quebec terminology
- **Weather Integration**: Environment Canada API integration
- **Time Zones**: Automatic EST/EDT handling
- **Cultural Content**: Quebec-specific templates and examples

### Local Features
- **Quebec Cuisine**: Poutine, tourtière, sugar shack menus pre-configured
- **Emergency Alerts**: Integration with Quebec emergency systems
- **Seasonal Content**: Automatic seasonal Quebec content suggestions
- **Regional Targeting**: Intelligent content distribution by Quebec regions

## 🚀 Getting Started

### Authentication Modes

1. **Basic Mode (32 Core Tools)**
   - Client credentials authentication
   - Essential display management
   - Basic content distribution

2. **Professional Mode (117 Tools)**
   - OAuth2 user authentication required
   - Advanced features and analytics
   - Complete administrative control

### First Steps

1. Install using `./install.sh`
2. Configure basic authentication in `.env`
3. Start server with `npm start`
4. Test basic commands in Claude Desktop
5. Run `npm run auth-user` for advanced features

## 📊 Performance & Scaling

- **Enterprise Ready**: Handles thousands of displays
- **Optimized API**: Intelligent caching and rate limiting
- **Quebec Focused**: Optimized for Canadian networks
- **Reliable**: Professional error handling and logging

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🏢 About Xtranumerik Inc.

Xtranumerik Inc. specializes in digital signage solutions and advanced content management systems for the Quebec and Canadian markets. This MCP server represents our commitment to providing professional, enterprise-grade tools optimized for French-Canadian environments.

## 📞 Support

- 📧 Email: support@xtranumerik.ca
- 🌐 Website: [www.xtranumerik.ca](https://www.xtranumerik.ca)
- 📖 Documentation: [Complete Documentation](docs/)
- 🐛 Issues: [GitHub Issues](https://github.com/Xtranumerik-inc/xibo-mcp/issues)
- 💬 Community: [GitHub Discussions](https://github.com/Xtranumerik-inc/xibo-mcp/discussions)
- 📱 Professional Support: Available for enterprise customers

---

<div align="center">
  <strong>🍁 Made with ❤️ in Quebec by <a href="https://www.xtranumerik.ca">Xtranumerik Inc.</a></strong>
  <br>
  <em>Professional Digital Signage Solutions for Canada</em>
</div>