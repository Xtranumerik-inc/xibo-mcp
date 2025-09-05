# 🔧 Guide de résolution des problèmes d'authentification Xibo

## Diagnostic du problème "invalid_client"

Lorsque vous obtenez l'erreur `{"error":"invalid_client","error_description":"Client authentication failed"}`, cela signifie que le serveur Xibo répond correctement mais refuse vos identifiants.

## ✅ Solutions vérifiées

### 1. Vérifiez la configuration de l'application dans Xibo CMS

**Étapes critiques:**

1. **Connectez-vous à votre CMS Xibo**: `https://acces.xtranumerik.com`
2. **Allez dans**: Administration > Applications
3. **Vérifiez votre application** et assurez-vous que:
   - ✅ **"Is Confidential"** est **COCHÉ** (essentiel selon la communauté Xibo)
   - ✅ **"Client Credentials"** grant type est **ACTIVÉ**
   - ✅ Le **Client ID** correspond exactement à celui dans `.env`
   - ✅ Le **Client Secret** correspond exactement à celui dans `.env`

### 2. Régénérez les identifiants si nécessaire

Si le problème persiste:
1. **Supprimez** l'ancienne application
2. **Créez une nouvelle application** avec:
   - Nom: "Xibo MCP Server"
   - ✅ **Cochez "Is Confidential"**
   - ✅ **Activez "Client Credentials" grant**
3. **Copiez** les nouveaux identifiants dans `.env`

### 3. Testez avec l'utilitaire intégré

```bash
npm run test-auth
```

Cet utilitaire teste:
- ✅ Connectivité serveur
- ✅ Multiples méthodes d'authentification
- ✅ Différents endpoints OAuth
- ✅ Mise à jour automatique du `.env`

## 🔍 Diagnostic technique

L'analyse des logs montre:

```
✅ Serveur accessible: https://acces.xtranumerik.com
✅ Endpoint correct: /api/authorize/access_token
❌ Authentification: invalid_client
```

Cela confirme que:
- Le serveur fonctionne
- L'endpoint OAuth est correct
- Le problème vient de la configuration de l'application Xibo

## 🚨 Points critiques selon la documentation Xibo

### Applications "Confidential"
Les applications serveur-à-serveur (comme ce MCP) doivent être marquées comme **"Confidential"** dans Xibo CMS.

### Grant Types
Assurez-vous que le grant type **"Client Credentials"** est activé pour votre application.

### Versions Xibo
Différentes versions de Xibo peuvent avoir des comportements légèrement différents:
- Xibo 2.x: `/api/authorize/access_token`
- Xibo 3.x: Même endpoint mais configuration différente

## 🛠️ Commandes de diagnostic

### Test complet d'authentification
```bash
npm run test-auth
```

### Build et test rapide
```bash
npm run build && npm start
```

### Test manuel avec curl
```bash
curl -X POST "https://acces.xtranumerik.com/api/authorize/access_token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=VOTRE_CLIENT_ID&client_secret=VOTRE_CLIENT_SECRET"
```

## 📞 Support

Si le problème persiste après avoir vérifié tous ces points:

1. **Vérifiez la version Xibo**: Admin > Système > Informations
2. **Consultez les logs Xibo**: Admin > Logs
3. **Contactez l'administrateur** du serveur Xibo
4. **Ouvrez un ticket** sur le forum Xibo Community

## ✅ Confirmation du correctif

Une fois l'application correctement configurée, vous devriez voir:

```
✅ SUCCESS! Status: 200
📄 Access Token: eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI...
⏰ Expires in: 3600 seconds
🎯 Working method: Form-encoded with client credentials in body on /api/authorize/access_token
```

---

**Fait avec ❤️ par Xtranumerik Inc.**