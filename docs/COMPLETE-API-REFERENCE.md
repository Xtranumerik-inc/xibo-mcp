# 📖 Référence API Complète - Xtranumerik MCP pour Xibo v2.0

**117 Outils Professionnels** | **Intégration API Complète Xibo 4.x** | **Optimisé Québec/Montréal**

---

## 🎯 Vue d'Ensemble

Cette documentation couvre les **117 outils MCP** disponibles dans le serveur professionnel Xtranumerik pour Xibo Digital Signage. Les outils sont organisés en **11 catégories fonctionnelles** avec support complet pour le marché québécois.

### 🔐 Types d'Authentification

- **📊 Outils Core (32)** - Client Credentials : Fonctionnalités de base
- **🚀 Outils Avancés (85)** - OAuth2 User Auth : Fonctionnalités professionnelles complètes

---

## 🏢 OUTILS CORE - CLIENT CREDENTIALS (32 outils)

### 📺 1. DISPLAYS - Gestion des Écrans (8 outils)

#### `display_list` - Lister les Écrans
**Description:** Liste tous les écrans avec filtrage avancé  
**Paramètres:**
- `tags` (string) - Filtrer par tags
- `city` (string) - Filtrer par ville  
- `licensed` (boolean) - Filtrer par statut de licence
- `loggedIn` (boolean) - Filtrer par statut en ligne
- `display` (string) - Rechercher par nom

**Exemple:**
```
display_list city="Montreal" licensed=true
```

#### `display_get` - Détails d'un Écran
**Paramètres:**
- `displayId` (number, requis) - ID de l'écran

#### `display_authorize` - Autoriser/Désautoriser
**Paramètres:**
- `displayId` (number, requis) - ID de l'écran
- `authorize` (boolean, requis) - true pour autoriser

#### `display_screenshot` - Capture d'Écran
**Paramètres:**
- `displayId` (number, requis) - ID de l'écran

#### `display_wol` - Wake-on-LAN
**Paramètres:**
- `displayId` (number, requis) - ID de l'écran

#### `display_edit` - Modifier l'Écran
**Paramètres:**
- `displayId` (number, requis) - ID de l'écran
- `display` (string) - Nouveau nom
- `city` (string) - Nouvelle ville
- `tags` (string) - Nouveaux tags

#### `displays_by_zone` - Écrans par Zone Géographique
**Paramètres:**
- `zone` (string, requis) - quebec_region, montreal_region, national
- `exclude` (boolean) - Exclure cette zone

#### `display_command` - Envoyer Commande
**Paramètres:**
- `displayId` (number, requis) - ID de l'écran
- `command` (string, requis) - Commande à exécuter

---

### 🖼️ 2. LAYOUTS - Mises en Page (6 outils)

#### `layout_list` - Lister les Layouts
**Paramètres:**
- `layout` (string) - Filtrer par nom
- `tags` (string) - Filtrer par tags
- `retired` (boolean) - Inclure les layouts retirés

#### `layout_create` - Créer un Layout
**Paramètres:**
- `name` (string, requis) - Nom du layout
- `width` (number) - Largeur (défaut: 1920)
- `height` (number) - Hauteur (défaut: 1080)
- `backgroundColor` (string) - Couleur de fond

#### `layout_get` - Détails d'un Layout
**Paramètres:**
- `layoutId` (number, requis) - ID du layout

#### `layout_publish` - Publier un Layout
**Paramètres:**
- `layoutId` (number, requis) - ID du layout

#### `layout_copy` - Copier un Layout
**Paramètres:**
- `layoutId` (number, requis) - ID du layout source
- `name` (string, requis) - Nom de la copie

#### `layout_delete` - Supprimer un Layout
**Paramètres:**
- `layoutId` (number, requis) - ID du layout

---

### 📁 3. MEDIA - Gestion des Médias (6 outils)

#### `media_list` - Lister les Médias
**Paramètres:**
- `name` (string) - Filtrer par nom
- `tags` (string) - Filtrer par tags
- `type` (string) - image, video, audio
- `retired` (boolean) - Inclure les médias retirés

#### `media_upload` - Télécharger un Média
**Paramètres:**
- `filePath` (string, requis) - Chemin vers le fichier
- `name` (string) - Nom optionnel
- `tags` (string) - Tags

#### `media_get` - Détails d'un Média
**Paramètres:**
- `mediaId` (number, requis) - ID du média

#### `media_delete` - Supprimer un Média
**Paramètres:**
- `mediaId` (number, requis) - ID du média
- `force` (boolean) - Forcer la suppression

#### `media_edit` - Modifier un Média
**Paramètres:**
- `mediaId` (number, requis) - ID du média
- `name` (string) - Nouveau nom
- `tags` (string) - Nouveaux tags

#### `media_usage` - Utilisation d'un Média
**Paramètres:**
- `mediaId` (number, requis) - ID du média

---

### 📢 4. CAMPAIGNS - Campagnes (4 outils)

#### `campaign_list` - Lister les Campagnes
**Paramètres:**
- `campaign` (string) - Filtrer par nom

#### `campaign_create` - Créer une Campagne
**Paramètres:**
- `name` (string, requis) - Nom de la campagne

#### `campaign_assign_layout` - Assigner un Layout
**Paramètres:**
- `campaignId` (number, requis) - ID de la campagne
- `layoutId` (number, requis) - ID du layout

#### `campaign_delete` - Supprimer une Campagne
**Paramètres:**
- `campaignId` (number, requis) - ID de la campagne

---

### 🎵 5. PLAYLISTS - Listes de Lecture (3 outils)

#### `playlist_list` - Lister les Playlists
**Paramètres:**
- `name` (string) - Filtrer par nom
- `tags` (string) - Filtrer par tags

#### `playlist_create` - Créer une Playlist
**Paramètres:**
- `name` (string, requis) - Nom de la playlist
- `tags` (string) - Tags

#### `playlist_add_media` - Ajouter un Média
**Paramètres:**
- `playlistId` (number, requis) - ID de la playlist
- `mediaId` (number, requis) - ID du média

---

### 📅 6. SCHEDULES - Programmations (3 outils)

#### `schedule_list` - Lister les Programmations
**Paramètres:**
- `displayGroupId` (number) - Filtrer par groupe
- `fromDt` (string) - Date de début (YYYY-MM-DD)
- `toDt` (string) - Date de fin (YYYY-MM-DD)

#### `schedule_now` - Programmer Immédiatement
**Paramètres:**
- `campaignId` (number, requis) - ID de la campagne
- `displayGroupId` (number, requis) - ID du groupe d'écrans

#### `schedule_delete` - Supprimer une Programmation
**Paramètres:**
- `eventId` (number, requis) - ID de l'événement

---

### 👥 7. DISPLAY GROUPS - Groupes d'Écrans (2 outils)

#### `displaygroup_list` - Lister les Groupes
**Paramètres:**
- `displayGroup` (string) - Filtrer par nom

#### `displaygroup_create` - Créer un Groupe
**Paramètres:**
- `name` (string, requis) - Nom du groupe
- `description` (string) - Description

---

## 🎯 8. BROADCASTING - Diffusion Intelligente (10 outils)

**⭐ FONCTIONNALITÉ PRINCIPALE:** "Mets cette pub dans tous mes écrans sauf ceux à Québec"

### `broadcast_ad` - Diffusion Intelligente Géo-Ciblée
**Description:** L'outil principal pour la diffusion avec filtrage géographique  
**Paramètres:**
- `mediaId` (number, requis) - ID du média à diffuser
- `includeTags` (string) - Tags à inclure (séparés par virgule)
- `excludeTags` (string) - Tags à exclure
- `includeCities` (string) - Villes à inclure
- `excludeCities` (string) - **Villes à exclure (Québec, Montréal)**
- `includeZones` (string) - Zones géographiques à inclure
- `excludeZones` (string) - Zones géographiques à exclure
- `priority` (string) - low, normal, high, urgent

**Exemple Québec:**
```
broadcast_ad mediaId=123 excludeCities="Quebec City,Levis" includeTags="publicitaire" priority="high"
```

### `broadcast_to_zone` - Diffusion par Zone
**Paramètres:**
- `mediaId` (number, requis) - ID du média
- `zone` (string, requis) - montreal_region, quebec_region, national
- `exclude` (boolean) - Exclure cette zone

### `broadcast_urgent` - Diffusion Urgente
**Paramètres:**
- `mediaId` (number, requis) - ID du média urgent
- `message` (string) - Description du message

### `broadcast_schedule` - Programmer une Diffusion
**Paramètres:**
- `mediaId` (number, requis) - ID du média
- `scheduleDt` (string, requis) - Date/heure (YYYY-MM-DD HH:MM)
- `duration` (number) - Durée en minutes

### `broadcast_recurring` - Diffusion Récurrente
**Paramètres:**
- `mediaId` (number, requis) - ID du média
- `recurrenceType` (string, requis) - daily, weekly, monthly
- `startTime` (string, requis) - Heure de début (HH:MM)

### `broadcast_conditional` - Diffusion Conditionnelle
**Paramètres:**
- `mediaId` (number, requis) - ID du média
- `condition` (string, requis) - Condition de diffusion
- `conditionValue` (string, requis) - Valeur de la condition

### `broadcast_interrupt` - Interruption d'Urgence
**Paramètres:**
- `mediaId` (number, requis) - ID du média d'urgence
- `interruptLevel` (string) - normal, high, emergency

### `broadcast_preview` - Aperçu de Diffusion
**Paramètres:**
- `mediaId` (number, requis) - ID du média
- `targets` (string, requis) - Cibles de diffusion

### `broadcast_status` - Statut de Diffusion
**Paramètres:**
- `broadcastId` (number, requis) - ID de la diffusion

### `broadcast_cancel` - Annuler une Diffusion
**Paramètres:**
- `broadcastId` (number, requis) - ID de la diffusion

---

## 🚀 OUTILS AVANCÉS - OAUTH2 USER AUTH (85 outils)

### 👥 9. USERS & GROUPS - Gestion Utilisateurs (11 outils)

#### `user_list` - Lister les Utilisateurs
**Paramètres:**
- `userName` (string) - Filtrer par nom d'utilisateur
- `userTypeId` (number) - Filtrer par type d'utilisateur
- `retired` (boolean) - Inclure les utilisateurs retraités

#### `user_get` - Détails d'un Utilisateur
**Paramètres:**
- `userId` (number, requis) - ID de l'utilisateur

#### `user_create` - Créer un Utilisateur
**Paramètres:**
- `userName` (string, requis) - Nom d'utilisateur
- `email` (string, requis) - Adresse email
- `userTypeId` (number, requis) - Type d'utilisateur
- `firstName` (string) - Prénom
- `lastName` (string) - Nom de famille

#### `user_update` - Modifier un Utilisateur
**Paramètres:**
- `userId` (number, requis) - ID de l'utilisateur
- `email` (string) - Nouvelle adresse email
- `firstName` (string) - Nouveau prénom

#### `user_delete` - Supprimer un Utilisateur
**Paramètres:**
- `userId` (number, requis) - ID de l'utilisateur

#### `user_set_password` - Changer Mot de Passe
**Paramètres:**
- `userId` (number, requis) - ID de l'utilisateur
- `newPassword` (string, requis) - Nouveau mot de passe

#### `user_force_logout` - Forcer Déconnexion
**Paramètres:**
- `userId` (number, requis) - ID de l'utilisateur

#### `usergroup_list` - Lister les Groupes d'Utilisateurs
**Paramètres:**
- `group` (string) - Filtrer par nom de groupe

#### `usergroup_create` - Créer un Groupe
**Paramètres:**
- `group` (string, requis) - Nom du groupe
- `libraryQuota` (number) - Quota de bibliothèque

#### `usergroup_assign_users` - Assigner Utilisateurs à un Groupe
**Paramètres:**
- `groupId` (number, requis) - ID du groupe
- `userIds` (string, requis) - IDs des utilisateurs (séparés par virgule)

#### `usergroup_set_permissions` - Définir Permissions du Groupe
**Paramètres:**
- `groupId` (number, requis) - ID du groupe
- `permissions` (string, requis) - Permissions (JSON)

---

### 📁 10. FOLDERS & PERMISSIONS - Organisation (6 outils)

#### `folder_list` - Lister les Dossiers avec Hiérarchie
**Paramètres:**
- `folderId` (number) - Dossier parent
- `depth` (number) - Profondeur de la hiérarchie

#### `folder_create` - Créer un Dossier
**Paramètres:**
- `folderName` (string, requis) - Nom du dossier
- `parentId` (number) - ID du dossier parent

#### `folder_share` - Partager un Dossier
**Paramètres:**
- `folderId` (number, requis) - ID du dossier
- `groupId` (number, requis) - ID du groupe
- `permissions` (string, requis) - view,edit,delete

#### `folder_set_permissions` - Permissions Détaillées
**Paramètres:**
- `folderId` (number, requis) - ID du dossier
- `permissionMatrix` (string, requis) - Matrice des permissions (JSON)

#### `folder_move_content` - Déplacer du Contenu
**Paramètres:**
- `sourceFolderId` (number, requis) - Dossier source
- `targetFolderId` (number, requis) - Dossier destination
- `contentType` (string, requis) - Type de contenu

#### `permission_audit` - Auditer les Permissions
**Paramètres:**
- `entityType` (string, requis) - Type d'entité
- `entityId` (number, requis) - ID de l'entité

---

### 📊 11. STATISTICS & REPORTS - Analytics (9 outils)

#### `stats_display_usage` - Statistiques Utilisation Écrans
**Paramètres:**
- `displayIds` (string) - IDs des écrans (séparés par virgule)
- `fromDt` (string, requis) - Date de début (YYYY-MM-DD)
- `toDt` (string, requis) - Date de fin (YYYY-MM-DD)
- `region` (string) - Filtrer par région (quebec, montreal)

#### `stats_media_performance` - Performance des Médias
**Paramètres:**
- `mediaIds` (string) - IDs des médias
- `fromDt` (string, requis) - Date de début
- `toDt` (string, requis) - Date de fin

#### `stats_campaign_analytics` - Analytics des Campagnes
**Paramètres:**
- `campaignIds` (string) - IDs des campagnes
- `fromDt` (string, requis) - Date de début
- `toDt` (string, requis) - Date de fin
- `includeEngagement` (boolean) - Inclure les statistiques d'engagement

#### `stats_bandwidth` - Statistiques de Bande Passante
**Paramètres:**
- `displayIds` (string) - IDs des écrans
- `fromDt` (string, requis) - Date de début
- `toDt` (string, requis) - Date de fin

#### `report_proof_of_play` - Rapport Preuve de Diffusion
**Paramètres:**
- `displayIds` (string) - IDs des écrans
- `fromDt` (string, requis) - Date de début
- `toDt` (string, requis) - Date de fin
- `format` (string) - csv, json, pdf

#### `report_display_availability` - Rapport Disponibilité Écrans
**Paramètres:**
- `displayIds` (string) - IDs des écrans
- `fromDt` (string, requis) - Date de début
- `toDt` (string, requis) - Date de fin

#### `report_media_inventory` - Inventaire des Médias
**Paramètres:**
- `folderId` (number) - Dossier spécifique
- `includeUsage` (boolean) - Inclure l'utilisation
- `format` (string) - Format du rapport

#### `auditlog_search` - Rechercher dans l'Audit
**Paramètres:**
- `entity` (string) - Type d'entité
- `fromDt` (string, requis) - Date de début
- `toDt` (string, requis) - Date de fin
- `userId` (number) - Utilisateur spécifique

#### `auditlog_export` - Exporter les Logs d'Audit
**Paramètres:**
- `fromDt` (string, requis) - Date de début
- `toDt` (string, requis) - Date de fin
- `format` (string, requis) - csv, json

---

### 🗃️ 12. DATASETS - Données Dynamiques (9 outils)

#### `dataset_list` - Lister les Datasets
**Paramètres:**
- `dataSet` (string) - Filtrer par nom
- `userId` (number) - Filtrer par propriétaire

#### `dataset_create` - Créer un Dataset
**Paramètres:**
- `dataSet` (string, requis) - Nom du dataset
- `description` (string) - Description
- `code` (string) - Code unique

#### `dataset_import_csv` - Importer un CSV
**Paramètres:**
- `datasetId` (number, requis) - ID du dataset
- `csvData` (string, requis) - Données CSV
- `overwrite` (boolean) - Remplacer les données existantes

#### `dataset_export` - Exporter un Dataset
**Paramètres:**
- `datasetId` (number, requis) - ID du dataset
- `format` (string, requis) - csv, json, xml

#### `dataset_add_column` - Ajouter une Colonne
**Paramètres:**
- `datasetId` (number, requis) - ID du dataset
- `heading` (string, requis) - Nom de la colonne
- `dataTypeId` (number, requis) - Type de données

#### `dataset_update_data` - Mettre à Jour les Données
**Paramètres:**
- `datasetId` (number, requis) - ID du dataset
- `rowData` (string, requis) - Données de la ligne (JSON)

#### `dataset_clear` - Vider un Dataset
**Paramètres:**
- `datasetId` (number, requis) - ID du dataset

#### `dataset_remote_sync` - Synchronisation Externe
**Paramètres:**
- `datasetId` (number, requis) - ID du dataset
- `remoteUrl` (string, requis) - URL de la source externe
- `syncInterval` (number) - Intervalle de synchronisation (minutes)

#### `dataset_rss_configure` - Configuration RSS
**Paramètres:**
- `datasetId` (number, requis) - ID du dataset
- `rssUrl` (string, requis) - URL du flux RSS
- `refreshRate` (number) - Taux de rafraîchissement

---

### 🎨 13. TEMPLATES & WIDGETS - Templates Avancés (10 outils)

#### `template_list` - Lister les Templates
**Paramètres:**
- `template` (string) - Filtrer par nom
- `tags` (string) - Filtrer par tags

#### `template_import` - Importer un Template
**Paramètres:**
- `templateFile` (string, requis) - Fichier template
- `name` (string, requis) - Nom du template

#### `template_export` - Exporter un Template
**Paramètres:**
- `templateId` (number, requis) - ID du template
- `format` (string) - Format d'export

#### `template_apply` - Appliquer un Template
**Paramètres:**
- `templateId` (number, requis) - ID du template
- `layoutId` (number, requis) - ID du layout cible

#### `widget_list` - Lister les Widgets Disponibles
**Paramètres:**
- `type` (string) - Type de widget
- `enabled` (boolean) - Widgets activés seulement

#### `widget_configure` - Configurer un Widget
**Paramètres:**
- `widgetId` (number, requis) - ID du widget
- `configuration` (string, requis) - Configuration (JSON)

#### `widget_weather` - Widget Météo avec Géolocalisation
**Paramètres:**
- `playlistId` (number, requis) - ID de la playlist
- `location` (string, requis) - Location (Montreal, Quebec City)
- `apiKey` (string, requis) - Clé API météo
- `language` (string) - fr, en (défaut: fr)

**Exemple Québec:**
```
widget_weather playlistId=123 location="Montreal" language="fr"
```

#### `widget_stocks` - Widget Bourse/Finance
**Paramètres:**
- `playlistId` (number, requis) - ID de la playlist
- `symbols` (string, requis) - Symboles boursiers (séparés par virgule)
- `currency` (string) - CAD, USD

#### `widget_social` - Widget Réseaux Sociaux
**Paramètres:**
- `playlistId` (number, requis) - ID de la playlist
- `platform` (string, requis) - twitter, facebook, instagram
- `accountId` (string, requis) - ID du compte

#### `widget_emergency` - Widget Alertes Urgence (Xibo 4.2+)
**Paramètres:**
- `playlistId` (number, requis) - ID de la playlist
- `alertSources` (string, requis) - Sources d'alertes
- `geoFilter` (string) - Filtrage géographique

---

### 🔔 14. NOTIFICATIONS & ALERTS - Alertes Avancées (8 outils)

#### `notification_list` - Lister les Notifications
**Paramètres:**
- `read` (number) - Statut de lecture (0=non lu, 1=lu)
- `start` (number) - Position de départ
- `length` (number) - Nombre de résultats

#### `notification_send` - Envoyer une Notification
**Paramètres:**
- `subject` (string, requis) - Sujet de la notification
- `body` (string, requis) - Corps du message
- `userId` (number) - ID utilisateur spécifique
- `email` (number) - Envoyer par email (1=oui)

#### `notification_broadcast` - Diffuser à Tous les Utilisateurs
**Paramètres:**
- `subject` (string, requis) - Sujet de la diffusion
- `body` (string, requis) - Message de diffusion
- `email` (number) - Envoyer par email

#### `alert_emergency_create` - Créer une Alerte d'Urgence
**Paramètres:**
- `title` (string, requis) - Titre de l'alerte
- `message` (string, requis) - Message d'alerte
- `alertType` (string) - warning, danger, info, success
- `displayIds` (string) - IDs des écrans ciblés
- `priority` (number) - Niveau de priorité (1-10)

#### `alert_schedule` - Programmer une Alerte
**Paramètres:**
- `title` (string, requis) - Titre de l'alerte
- `message` (string, requis) - Message d'alerte
- `scheduleDt` (string, requis) - Date/heure programmée
- `duration` (number) - Durée d'affichage

#### `alert_geo_target` - Alerte Géo-Ciblée ⭐
**Description:** Support spécial pour les régions du Québec et Montréal  
**Paramètres:**
- `title` (string, requis) - Titre de l'alerte
- `message` (string, requis) - Message d'alerte
- `includeRegions` (string) - montreal, quebec, laval
- `excludeRegions` (string) - Régions à exclure
- `tags` (string) - Tags des écrans à cibler

**Exemple Québec:**
```
alert_geo_target title="Alerte Tempête" message="Tempête de neige prévue" includeRegions="quebec,montreal" excludeRegions="laval"
```

#### `task_list` - Lister les Tâches Système
**Paramètres:**
- `status` (string) - pending, running, completed, failed
- `start` (number) - Position de départ

#### `task_run_now` - Exécuter une Tâche Immédiatement
**Paramètres:**
- `taskId` (number, requis) - ID de la tâche

---

### ⚙️ 15. SYSTEM CONFIG - Configuration Système (9 outils)

#### `command_list` - Lister les Commandes Système
**Paramètres:**
- `command` (string) - Filtrer par nom de commande
- `start` (number) - Position de départ

#### `command_create` - Créer une Commande Personnalisée
**Paramètres:**
- `command` (string, requis) - Nom de la commande
- `code` (string, requis) - Code à exécuter
- `type` (string) - android, windows, webos

#### `command_execute` - Exécuter une Commande
**Paramètres:**
- `commandId` (number, requis) - ID de la commande
- `displayId` (number) - ID de l'écran cible
- `scheduleNow` (number) - Exécuter immédiatement (1=oui)

#### `tag_list` - Lister tous les Tags
**Paramètres:**
- `tag` (string) - Filtrer par nom de tag
- `start` (number) - Position de départ

#### `tag_create` - Créer de Nouveaux Tags
**Paramètres:**
- `tags` (string, requis) - Tags séparés par virgules
- `description` (string) - Description d'utilisation

#### `tag_bulk_assign` - Attribution en Masse de Tags
**Paramètres:**
- `itemType` (string, requis) - layout, media, display, campaign
- `itemIds` (string, requis) - IDs des items (séparés par virgule)
- `tags` (string, requis) - Tags à assigner
- `replaceExisting` (number) - Remplacer les tags existants (1=oui)

#### `daypart_list` - Lister les Périodes (Dayparts)
**Paramètres:**
- `dayPart` (string) - Filtrer par nom
- `start` (number) - Position de départ

#### `daypart_create` - Créer une Période
**Paramètres:**
- `name` (string, requis) - Nom de la période
- `startTime` (string, requis) - Heure de début (HH:MM)
- `endTime` (string, requis) - Heure de fin (HH:MM)
- `exceptions` (string) - Dates d'exception

#### `daypart_assign` - Assigner une Période à du Contenu
**Paramètres:**
- `dayPartId` (number, requis) - ID de la période
- `campaignId` (number) - ID de la campagne
- `displayGroupId` (number, requis) - ID du groupe d'écrans
- `startDate` (string, requis) - Date de début

---

### 🎭 16. TRANSITIONS & EFFECTS - Effets Visuels (7 outils)

#### `transition_list` - Lister les Transitions Disponibles
**Paramètres:**
- `type` (string) - in, out, both

#### `transition_apply` - Appliquer des Transitions
**Paramètres:**
- `layoutId` (number, requis) - ID du layout
- `regionId` (number) - ID de la région spécifique
- `transitionIn` (string) - Transition d'entrée
- `transitionOut` (string) - Transition de sortie
- `duration` (number) - Durée en millisecondes

#### `effect_fade` - Appliquer des Effets de Fondu
**Paramètres:**
- `layoutId` (number, requis) - ID du layout
- `fadeType` (string) - in, out, both
- `duration` (number) - Durée du fondu

#### `effect_slide` - Appliquer des Transitions de Glissement
**Paramètres:**
- `layoutId` (number, requis) - ID du layout
- `direction` (string, requis) - left, right, top, bottom
- `slideType` (string) - in, out, both

#### `effect_zoom` - Appliquer des Effets de Zoom
**Paramètres:**
- `layoutId` (number, requis) - ID du layout
- `zoomType` (string) - in, out, both
- `intensity` (string) - subtle, normal, dramatic

#### `resolution_list` - Lister les Résolutions Disponibles
**Paramètres:**
- `displayId` (number) - Écran spécifique

#### `resolution_set` - Définir la Résolution d'un Layout
**Paramètres:**
- `layoutId` (number) - ID du layout à modifier
- `width` (number, requis) - Largeur en pixels
- `height` (number, requis) - Hauteur en pixels
- `backgroundColor` (string) - Couleur de fond

---

### 🔄 17. SYNC & INTEGRATIONS - Synchronisation (6 outils)

#### `sync_multi_cms` - Synchronisation Multi-CMS
**Paramètres:**
- `sourceCmsUrl` (string, requis) - URL du CMS source
- `targetCmsUrl` (string, requis) - URL du CMS cible
- `syncType` (string) - layouts, media, campaigns, all
- `includeRegions` (string) - quebec, montreal, all
- `dryRun` (number) - Mode aperçu (1=oui)

#### `sync_content` - Synchroniser du Contenu Spécifique
**Paramètres:**
- `contentType` (string, requis) - layout, media, campaign
- `contentId` (number, requis) - ID du contenu
- `targetLocation` (string, requis) - quebec, montreal, national
- `syncMode` (string) - copy, move, link

#### `connector_list` - Lister les Connecteurs Disponibles
**Paramètres:**
- `type` (string) - api, database, social, weather, rss

#### `connector_configure` - Configurer un Connecteur Externe
**Paramètres:**
- `connectorName` (string, requis) - Nom du connecteur
- `apiKey` (string) - Clé API
- `endpoint` (string) - Point de terminaison
- `refreshInterval` (number) - Intervalle de rafraîchissement
- `testConnection` (number) - Tester après configuration

#### `api_webhook_create` - Créer un Webhook API
**Paramètres:**
- `name` (string, requis) - Nom du webhook
- `url` (string, requis) - URL de destination
- `events` (string, requis) - Événements surveillés (séparés par virgule)
- `secret` (string) - Secret de sécurité
- `method` (string) - POST, PUT

#### `api_webhook_test` - Tester un Webhook
**Paramètres:**
- `webhookId` (number) - ID du webhook
- `url` (string) - URL directe à tester
- `eventType` (string) - Type d'événement à simuler

---

### 🍽️ 18. MENU BOARDS - Menus Dynamiques (5 outils)

#### `menuboard_create` - Créer un Menu Board Dynamique
**Paramètres:**
- `name` (string, requis) - Nom du menu
- `restaurant` (string, requis) - Nom du restaurant
- `menuType` (string) - breakfast, lunch, dinner, full
- `language` (string) - french, english, bilingual
- `template` (string) - modern, classic, elegant

**Exemple Québec:**
```
menuboard_create name="Menu Principal" restaurant="Chez Mario" menuType="full" language="bilingual"
```

#### `menuboard_update_prices` - Mettre à Jour les Prix
**Paramètres:**
- `datasetId` (number, requis) - ID du dataset du menu
- `updateType` (string, requis) - single, bulk, percentage
- `itemId` (string) - ID de l'item pour mise à jour simple
- `priceAdjustment` (number) - Ajustement de prix
- `category` (string) - Catégorie pour mise à jour en lot

#### `menuboard_schedule_items` - Programmer des Items Saisonniers
**Paramètres:**
- `datasetId` (number, requis) - ID du dataset
- `scheduleType` (string, requis) - daily, weekly, seasonal, limited_time
- `itemIds` (string, requis) - IDs des items à programmer
- `startDate` (string) - Date de début
- `timeSlots` (string) - breakfast, lunch, dinner

#### `menuboard_category_manage` - Gérer les Catégories
**Paramètres:**
- `datasetId` (number, requis) - ID du dataset
- `action` (string, requis) - list, create, reorder, rename, delete
- `categoryName` (string) - Nom de la catégorie
- `categoryOrder` (string) - Nouvel ordre (séparé par virgules)

#### `menuboard_promotion` - Créer des Promotions
**Paramètres:**
- `datasetId` (number, requis) - ID du dataset
- `promoType` (string, requis) - discount, combo, happy_hour, special
- `title` (string, requis) - Titre de la promotion
- `itemIds` (string, requis) - IDs des items en promotion
- `discount` (number) - Pourcentage de rabais
- `validUntil` (string) - Date de fin

---

### 🤖 19. AUTOMATION - Automatisation (5 outils)

#### `action_list` - Lister les Actions d'Automatisation
**Paramètres:**
- `category` (string) - content, display, notification, system
- `active` (number) - Statut actif (1=actif, 0=inactif)

#### `action_create` - Créer une Action Personnalisée
**Paramètres:**
- `name` (string, requis) - Nom de l'action
- `displayName` (string, requis) - Nom affiché
- `actionType` (string, requis) - content, display, notification, system
- `triggers` (string, requis) - Déclencheurs (séparés par virgule)
- `targetType` (string, requis) - layout, display, campaign, all

#### `action_trigger_config` - Configurer les Déclencheurs
**Paramètres:**
- `actionId` (number, requis) - ID de l'action
- `triggerType` (string, requis) - time, date, event, weather, threshold
- `triggerValue` (string, requis) - Valeur du déclencheur
- `recurrence` (string) - once, daily, weekly, monthly
- `timezone` (string) - America/Montreal

#### `action_conditional` - Créer une Logique Conditionnelle
**Paramètres:**
- `actionId` (number, requis) - ID de l'action
- `conditionType` (string, requis) - time_range, display_status, weather, location
- `condition` (string, requis) - Expression de la condition
- `thenAction` (string, requis) - Action si condition vraie
- `elseAction` (string) - Action si condition fausse

#### `workflow_create` - Créer un Workflow d'Automatisation
**Paramètres:**
- `name` (string, requis) - Nom du workflow
- `description` (string, requis) - Description
- `triggerEvent` (string, requis) - Événement déclencheur initial
- `steps` (string, requis) - Étapes du workflow (JSON)
- `errorHandling` (string) - stop, continue, retry

---

## 🍁 EXEMPLES SPÉCIFIQUES QUÉBEC/MONTRÉAL

### 🎯 Cas d'Usage Principal
```bash
# "Mets cette publicité dans tous mes écrans sauf ceux à Québec"
broadcast_ad mediaId=123 excludeCities="Quebec City,Levis,Beauport" includeTags="publicitaire" priority="high"

# Ou par zone géographique
broadcast_ad mediaId=123 excludeZones="quebec_region" includeTags="publicitaire"
```

### 🌨️ Alertes Météo Automatisées
```bash
# Configurer une alerte automatique pour tempête
action_create name="alerte_tempete" displayName="Alerte Tempête Québec" actionType="notification" triggers="weather" targetType="all"

action_trigger_config actionId=123 triggerType="weather" triggerValue="blizzard" timezone="America/Montreal"

alert_geo_target title="Alerte Tempête" message="Tempête de neige importante prévue" includeRegions="quebec,montreal"
```

### 🍽️ Menu Board Restaurant Québécois
```bash
# Créer un menu bilingue
menuboard_create name="Menu Cabane à Sucre" restaurant="Érablière Charbonneau" menuType="full" language="bilingual" template="classic"

# Programmer menu spécial temps des sucres
menuboard_schedule_items datasetId=456 scheduleType="seasonal" itemIds="1,2,3" startDate="2024-03-01" endDate="2024-04-30"

# Promotion 5 à 7 québécoise
menuboard_promotion datasetId=456 promoType="happy_hour" title="5 à 7 Québécois" itemIds="4,5,6" discount=25
```

### 📊 Analytics par Région
```bash
# Statistiques des écrans de Montréal
stats_display_usage displayIds="1,2,3,4,5" fromDt="2024-01-01" toDt="2024-01-31" region="montreal"

# Rapport de performance pour la région de Québec
report_proof_of_play displayIds="10,11,12,13" fromDt="2024-01-01" toDt="2024-01-31" format="pdf"
```

### 🔄 Synchronisation Multi-Sites
```bash
# Synchroniser contenu entre Montréal et Québec
sync_content contentType="campaign" contentId=789 targetLocation="montreal" syncMode="copy"

# Sync complet avec filtrage régional
sync_multi_cms sourceCmsUrl="https://montreal.xibo.ca" targetCmsUrl="https://quebec.xibo.ca" syncType="all" includeRegions="quebec"
```

---

## 📊 RÉSUMÉ TECHNIQUE

### 🎯 Distribution des Outils
- **Total: 117 outils**
- **Core (Client Credentials): 32 outils** (27%)
- **Avancés (OAuth2): 85 outils** (73%)

### 🔐 Authentification
- **Client Credentials:** Fonctionnalités de base, accès limité
- **OAuth2 User Auth:** Accès complet, fonctionnalités professionnelles

### 🍁 Spécialisation Québec/Montréal
- Filtrage géographique intelligent
- Support bilingue français/anglais
- Intégration Environnement Canada
- Fuseau horaire EST/EDT automatique
- Contenu saisonnier adapté

### 🚀 Fonctionnalités Avancées
- Alertes d'urgence géo-ciblées
- Menu boards dynamiques pour restaurants
- Analytics et rapports détaillés
- Automatisation et workflows
- Synchronisation multi-CMS
- Widgets spécialisés (météo, bourse, etc.)

---

## 📞 Support Xtranumerik

**🏢 Xtranumerik Inc.**  
📧 **Email:** support@xtranumerik.ca  
🌐 **Site web:** https://www.xtranumerik.ca  
📖 **Documentation:** [GitHub Repository](https://github.com/Xtranumerik-inc/xibo-mcp)

---

*Xtranumerik MCP pour Xibo - Professional Edition v2.0*  
*Made with ❤️ in Québec, Canada*