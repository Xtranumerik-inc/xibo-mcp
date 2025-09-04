# 🚀 Xtranumerik MCP for Xibo Digital Signage

<div align="center">
  <img src="assets/banner.png" alt="Xtranumerik MCP for Xibo" width="600">
  
  [![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/Xtranumerik-inc/xibo-mcp)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
  [![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
  [![MCP](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io)
</div>

## 📋 Description

Professional MCP (Model Context Protocol) server for Xibo Digital Signage CMS. This server provides complete API integration with Xibo, allowing natural language control of your digital signage network through Claude.

### ✨ Key Features

- 🎯 **Complete API Coverage**: Full integration with all Xibo CMS API endpoints
- 🌍 **Geographic Targeting**: Smart content distribution with location-based filtering
- 📊 **Hierarchical Management**: Handle nested playlists and complex layouts
- 🔐 **Permission Control**: Separate client and internal region management
- 🚀 **Natural Language**: Control everything with simple French or English commands
- 🎨 **Professional Branding**: Appears in Xibo with Xtranumerik branding

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

## ⚙️ Configuration

### Required Environment Variables

```env
XIBO_API_URL=https://your-xibo-instance.com
XIBO_CLIENT_ID=your_client_id
XIBO_CLIENT_SECRET=your_client_secret
```

### Optional Configuration

```env
# Geographic zones for targeting
GEO_ZONES='{"quebec":["Quebec City","Levis"],"montreal":["Montreal","Laval"]}'

# Region permissions
REGION_PERMISSIONS='{"client_a":{"regions":["region_1"]},"internal":{"regions":["all"]}}'

# Default tags
DEFAULT_TAGS=publicitaire,information,urgence
```

## 💬 Example Commands

Once configured with Claude Desktop, you can use natural language commands:

### Content Distribution
```
"Mets cette publicité dans tous mes écrans publicitaires sauf ceux à Québec"
"Diffuse cette vidéo urgente sur TOUS les écrans immédiatement"
"Remplace la playlist du client A dans toutes les régions 2"
```

### Display Management
```
"Montre-moi l'état de tous les écrans de Montréal"
"Redémarre les écrans du centre commercial"
"Prends une capture d'écran de l'afficheur principal"
```

### Scheduling
```
"Programme cette campagne pour demain de 9h à 17h"
"Annule toutes les programmations de Noël"
"Vérifie s'il y a des conflits dans le calendrier de la semaine prochaine"
```

### Content Management
```
"Crée une nouvelle mise en page avec 3 régions"
"Ajoute cette vidéo à la playlist principale"
"Exporte les statistiques de diffusion du mois"
```

## 🛠️ Available Tools

The MCP server exposes 100+ tools covering all Xibo functionality:

- **Displays**: List, edit, authorize, screenshot, wake-on-LAN, etc.
- **Layouts**: Create, edit, publish, preview, import/export
- **Media**: Upload, manage, tag, organize in folders
- **Campaigns**: Create, assign layouts, manage
- **Playlists**: Create, nested playlists, reorder content
- **Schedules**: Create, recurring events, priority management
- **Reports**: Proof of play, usage statistics, performance metrics
- **Smart Broadcasting**: Geographic filtering, bulk updates, intelligent targeting

## 📁 Project Structure

```
xibo-mcp/
├── src/
│   ├── index.ts           # MCP server entry point
│   ├── xibo-client.ts     # Xibo API client with OAuth
│   ├── tools/             # All MCP tools
│   └── config/            # Configuration files
├── scripts/
│   ├── setup.js           # Interactive setup wizard
│   └── register-app.js    # Xibo app registration
├── assets/                # Branding assets
├── docs/                  # Documentation
└── tests/                 # Test files
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🏢 About Xtranumerik Inc.

Xtranumerik Inc. specializes in digital signage solutions and advanced content management systems. This MCP server represents our commitment to providing professional, enterprise-grade tools for the Xibo community.

## 📞 Support

- 📧 Email: support@xtranumerik.ca
- 🌐 Website: [www.xtranumerik.ca](https://www.xtranumerik.ca)
- 📖 Documentation: [docs/](docs/)
- 🐛 Issues: [GitHub Issues](https://github.com/Xtranumerik-inc/xibo-mcp/issues)

---

<div align="center">
  Made with ❤️ by <a href="https://www.xtranumerik.ca">Xtranumerik Inc.</a>
</div>