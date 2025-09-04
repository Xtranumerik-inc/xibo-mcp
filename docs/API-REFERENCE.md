# 📖 Référence API - Xtranumerik MCP pour Xibo

## 🎯 Outils de Diffusion Intelligente (Fonctionnalité Principale)

### `broadcast_ad` - Diffusion Intelligente avec Filtres Géographiques

**Description:** L'outil principal pour "Mets cette pub dans tous mes écrans sauf ceux à Québec"

**Paramètres:**
- `mediaId` (number, requis) - ID du média à diffuser
- `includeTags` (string, optionnel) - Tags à inclure (séparés par virgule)
- `excludeTags` (string, optionnel) - Tags à exclure (séparés par virgule) 
- `includeCities` (string, optionnel) - Villes à inclure (séparées par virgule)
- `excludeCities` (string, optionnel) - Villes à exclure (séparées par virgule)
- `includeZones` (string, optionnel) - Zones géographiques à inclure
- `excludeZones` (string, optionnel) - Zones géographiques à exclure
- `priority` (string, optionnel) - Priorité: low, normal, high, urgent
- `duration` (number, optionnel) - Durée en secondes
- `layoutId` (number, optionnel) - ID du layout cible

**Exemple d'utilisation:**
```
broadcast_ad mediaId=123 excludeCities="Quebec City,Levis" includeTags="publicitaire" priority="high"
```

### `broadcast_to_zone` - Diffusion par Zone

**Description:** Raccourci pour diffuser dans une zone géographique spécifique

**Paramètres:**
- `mediaId` (number, requis) - ID du média
- `zone` (string, requis) - Zone: montreal_region, quebec_region, national
- `exclude` (boolean, optionnel) - Exclure cette zone au lieu de l'inclure
- `priority` (string, optionnel) - Priorité de diffusion

### `broadcast_urgent` - Diffusion Urgente

**Description:** Diffuse un message urgent sur tous les écrans immédiatement

**Paramètres:**
- `mediaId` (number, requis) - ID du média urgent
- `message` (string, optionnel) - Description du message

## 📺 Gestion des Écrans (Displays)

### `display_list` - Lister les Écrans
- `tags` (string) - Filtrer par tags
- `city` (string) - Filtrer par ville
- `licensed` (boolean) - Filtrer par statut de licence
- `loggedIn` (boolean) - Filtrer par statut en ligne
- `display` (string) - Rechercher par nom

### `display_get` - Détails d'un Écran
- `displayId` (number, requis) - ID de l'écran

### `display_authorize` - Autoriser/Désautoriser
- `displayId` (number, requis) - ID de l'écran
- `authorize` (boolean, requis) - true pour autoriser

### `display_screenshot` - Capture d'Écran
- `displayId` (number, requis) - ID de l'écran

### `display_wol` - Wake-on-LAN
- `displayId` (number, requis) - ID de l'écran

### `display_edit` - Modifier l'Écran
- `displayId` (number, requis) - ID de l'écran
- `display` (string) - Nouveau nom
- `description` (string) - Nouvelle description
- `address` (string) - Nouvelle adresse
- `city` (string) - Nouvelle ville
- `country` (string) - Nouveau pays
- `tags` (string) - Nouveaux tags

### `displays_by_zone` - Écrans par Zone
- `zone` (string, requis) - Nom de la zone géographique
- `exclude` (boolean) - Exclure cette zone

## 🖼️ Gestion des Mises en Page (Layouts)

### `layout_list` - Lister les Layouts
- `layout` (string) - Filtrer par nom
- `tags` (string) - Filtrer par tags
- `retired` (boolean) - Inclure les layouts retirés

### `layout_create` - Créer un Layout
- `name` (string, requis) - Nom du layout
- `description` (string) - Description
- `width` (number) - Largeur en pixels (défaut: 1920)
- `height` (number) - Hauteur en pixels (défaut: 1080)
- `backgroundColor` (string) - Couleur de fond (hex)
- `tags` (string) - Tags

### `layout_get` - Détails d'un Layout
- `layoutId` (number, requis) - ID du layout

### `layout_publish` - Publier un Layout
- `layoutId` (number, requis) - ID du layout

## 📁 Gestion des Médias

### `media_list` - Lister les Médias
- `name` (string) - Filtrer par nom
- `tags` (string) - Filtrer par tags
- `type` (string) - Filtrer par type (image, video, audio)
- `retired` (boolean) - Inclure les médias retirés

### `media_upload` - Télécharger un Média
- `filePath` (string, requis) - Chemin vers le fichier
- `name` (string) - Nom optionnel
- `tags` (string) - Tags

### `media_get` - Détails d'un Média
- `mediaId` (number, requis) - ID du média

### `media_delete` - Supprimer un Média
- `mediaId` (number, requis) - ID du média
- `force` (boolean) - Forcer la suppression même si utilisé

### `media_edit` - Modifier un Média
- `mediaId` (number, requis) - ID du média
- `name` (string) - Nouveau nom
- `tags` (string) - Nouveaux tags
- `duration` (number) - Nouvelle durée
- `retired` (boolean) - Marquer comme retiré

## 📋 Gestion des Campagnes

### `campaign_list` - Lister les Campagnes
- `campaign` (string) - Filtrer par nom

### `campaign_create` - Créer une Campagne
- `name` (string, requis) - Nom de la campagne

### `campaign_assign_layout` - Assigner un Layout
- `campaignId` (number, requis) - ID de la campagne
- `layoutId` (number, requis) - ID du layout
- `displayOrder` (number) - Ordre d'affichage

### `campaign_delete` - Supprimer une Campagne
- `campaignId` (number, requis) - ID de la campagne

## 🎵 Gestion des Playlists

### `playlist_list` - Lister les Playlists
- `name` (string) - Filtrer par nom
- `tags` (string) - Filtrer par tags

### `playlist_create` - Créer une Playlist
- `name` (string, requis) - Nom de la playlist
- `tags` (string) - Tags

### `playlist_add_media` - Ajouter un Média
- `playlistId` (number, requis) - ID de la playlist
- `mediaId` (number, requis) - ID du média
- `duration` (number) - Durée en secondes

## 📅 Gestion des Programmations

### `schedule_list` - Lister les Programmations
- `displayGroupId` (number) - Filtrer par groupe
- `fromDt` (string) - Date de début (YYYY-MM-DD)
- `toDt` (string) - Date de fin (YYYY-MM-DD)

### `schedule_now` - Programmer Immédiatement
- `campaignId` (number, requis) - ID de la campagne
- `displayGroupId` (number, requis) - ID du groupe d'écrans
- `duration` (number) - Durée en minutes (défaut: 60)
- `priority` (boolean) - Haute priorité

### `schedule_create` - Créer une Programmation
- `campaignId` (number, requis) - ID de la campagne
- `displayGroupId` (number, requis) - ID du groupe
- `fromDt` (string, requis) - Date/heure de début (ISO)
- `toDt` (string, requis) - Date/heure de fin (ISO)
- `isPriority` (boolean) - Événement prioritaire
- `recurrenceType` (string) - Type de récurrence

### `schedule_delete` - Supprimer une Programmation
- `eventId` (number, requis) - ID de l'événement

## 📺 Groupes d'Écrans

### `displaygroup_list` - Lister les Groupes
- `displayGroup` (string) - Filtrer par nom

### `displaygroup_create` - Créer un Groupe
- `name` (string, requis) - Nom du groupe
- `description` (string) - Description
- `tags` (string) - Tags

## 🌍 Zones Géographiques Prédéfinies

- `quebec_region` - Région de Québec (Quebec City, Levis, Beauport)
- `montreal_region` - Région de Montréal (Montreal, Laval, Longueuil)  
- `national` - Tous les écrans

## 📝 Exemples d'Utilisation

### Cas d'Usage Principal
```
"Mets cette publicité dans tous mes écrans publicitaires sauf ceux à Québec"
→ broadcast_ad mediaId=123 includeTags="publicitaire" excludeZones="quebec_region"
```

### Autres Exemples
```
"Montre-moi tous les écrans de Montréal"
→ displays_by_zone zone="montreal_region"

"Programme cette campagne pour demain matin"
→ schedule_create campaignId=456 displayGroupId=789 fromDt="2024-01-02T09:00:00" toDt="2024-01-02T17:00:00"

"Diffuse ce message urgent partout"
→ broadcast_urgent mediaId=999 message="Message d'urgence"
```

## 🔧 Codes d'Erreur Communs

- **401 Unauthorized** - Token d'accès invalide ou expiré
- **404 Not Found** - Ressource non trouvée
- **403 Forbidden** - Permissions insuffisantes
- **400 Bad Request** - Paramètres invalides
- **500 Internal Server Error** - Erreur du serveur Xibo

## 🏢 Support Xtranumerik

Pour toute question ou support technique, contactez Xtranumerik Inc.:
- 📧 Email: support@xtranumerik.ca
- 🌐 Site web: https://www.xtranumerik.ca