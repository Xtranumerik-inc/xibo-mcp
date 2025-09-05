# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.1] - 2025-09-05

### 🔧 Fixed
- **CRITICAL**: Replaced deprecated crypto API (`createCipher`/`createDecipher`) with modern secure equivalents (`createCipherGCM`/`createDecipherGCM`)
- **CRITICAL**: Removed conflicting crypto dependency from package.json (now uses Node.js built-in crypto)
- Fixed OAuth2 grant type from `access_code` to `authorization_code` (correct OAuth2 standard)
- Corrected all Xibo API type definitions to match official API specifications
- Resolved TypeScript compilation errors preventing successful builds
- Fixed unused variable warnings and impossible comparisons

### 🌍 Changed  
- **BREAKING**: Generalized geographic filtering - removed Quebec-specific references
- Updated README.md to be region-agnostic while maintaining geographic capabilities
- Replaced Quebec/Montreal examples with generic "Region A/B" terminology
- Updated .env.example with generic city and region examples
- Changed package.json keywords to remove location-specific terms
- Maintained bilingual support as generic feature rather than Quebec-specific

### 🔒 Security
- Upgraded to modern GCM encryption with proper IV generation and authentication
- Resolved npm audit vulnerabilities by removing unnecessary crypto dependency
- Improved token encryption security with authenticated encryption

### 📚 Documentation
- Updated README.md with region-agnostic language while preserving functionality
- Added comprehensive changelog documenting all fixes
- Improved installation documentation for AI-friendly deployments

### ⚠️ Breaking Changes
- Geographic zone configuration format changed from Quebec-specific to generic regions
- Default tags changed from French (`publicitaire`, `urgence`) to English (`advertising`, `emergency`)
- Legacy `.env` files with Quebec-specific zones may need updating

### 🚀 Migration from v2.0.0
1. Update your `.env` file geographic zones:
   ```diff
   - GEO_ZONES='{"quebec_region":["Quebec City"],"montreal_region":["Montreal"]}'
   + GEO_ZONES='{"region_1":["City A"],"region_2":["City D"]}'
   ```

2. Update any hardcoded Quebec references in your configurations to generic regions

3. Run `npm install` to get the corrected dependencies

4. Rebuild with `npm run build` - should now compile without errors

## [2.0.0] - 2025-09-04

### 🚀 Added
- Initial release with 117 MCP tools for Xibo Digital Signage
- Dual authentication system (Client Credentials + OAuth2)
- Quebec-optimized geographic filtering
- Professional menu board management
- Advanced analytics and reporting
- Emergency alert system with geo-targeting
- Multi-CMS synchronization capabilities
- Automation and workflow tools

### 📊 Features
- 32 basic tools (Client Credentials mode)
- 85 advanced tools (OAuth2 mode) 
- Bilingual French/English support
- Regional display management
- Dynamic content scheduling
- Professional visual effects and transitions