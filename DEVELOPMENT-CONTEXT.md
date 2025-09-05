# 🚀 Contexte de Développement - Xibo MCP Server v2.0

## 📋 État Actuel du Projet (2025-09-05)

### 🎯 Objectif Principal
Expansion du serveur MCP Xibo de **32 outils à 117+ outils** avec authentification utilisateur OAuth2 avancée pour contrôle complet de Xibo 4.x.

### ✅ Modules Complétés (5/11) - 45 nouveaux outils créés

#### 1. **Authentification OAuth2 Utilisateur** ✅ TERMINÉ
- **Fichiers créés:**
  - `scripts/auth-user.js` - Script d'authentification interactive avec 2FA
  - `src/auth/token-manager.ts` - Gestion sécurisée et refresh automatique des tokens
  - `src/xibo-client.ts` - MODIFIÉ pour supporter auth utilisateur + fallback client credentials

#### 2. **Module Users & Groups** ✅ TERMINÉ - 11 outils
- **Fichier:** `src/tools/users.ts`
- **Outils créés:**
  1. `user_list` - Lister utilisateurs avec filtres
  2. `user_get` - Détails utilisateur spécifique
  3. `user_create` - Créer nouvel utilisateur
  4. `user_update` - Modifier utilisateur
  5. `user_delete` - Supprimer utilisateur
  6. `user_set_password` - Changer mot de passe
  7. `user_force_logout` - Forcer déconnexion
  8. `usergroup_list` - Lister groupes utilisateurs
  9. `usergroup_create` - Créer groupe
  10. `usergroup_assign_users` - Assigner utilisateurs à groupe
  11. `usergroup_set_permissions` - Définir permissions groupe

#### 3. **Module Folders & Permissions** ✅ TERMINÉ - 6 outils
- **Fichier:** `src/tools/folders.ts`
- **Outils créés:**
  1. `folder_list` - Lister dossiers avec hiérarchie
  2. `folder_create` - Créer nouveau dossier
  3. `folder_share` - Partager dossier avec groupes/utilisateurs
  4. `folder_set_permissions` - Permissions détaillées
  5. `folder_move_content` - Déplacer contenu entre dossiers
  6. `permission_audit` - Auditer permissions

#### 4. **Module Statistics & Reports** ✅ TERMINÉ - 9 outils
- **Fichier:** `src/tools/statistics.ts`
- **Outils créés:**
  1. `stats_display_usage` - Statistiques utilisation écrans
  2. `stats_media_performance` - Performance médias
  3. `stats_campaign_analytics` - Analytics campagnes
  4. `stats_bandwidth` - Bande passante
  5. `report_proof_of_play` - Preuve de diffusion
  6. `report_display_availability` - Disponibilité écrans
  7. `report_media_inventory` - Inventaire médias
  8. `auditlog_search` - Rechercher dans audit
  9. `auditlog_export` - Exporter audit

#### 5. **Module Datasets** ✅ TERMINÉ - 9 outils
- **Fichier:** `src/tools/datasets.ts`
- **Outils créés:**
  1. `dataset_list` - Lister datasets
  2. `dataset_create` - Créer dataset
  3. `dataset_import_csv` - Importer CSV
  4. `dataset_export` - Exporter dataset
  5. `dataset_add_column` - Ajouter colonne
  6. `dataset_update_data` - MAJ données
  7. `dataset_clear` - Vider dataset
  8. `dataset_remote_sync` - Sync externe
  9. `dataset_rss_configure` - Config RSS

#### 6. **Module Templates & Widgets** ✅ TERMINÉ - 10 outils
- **Fichier:** `src/tools/templates.ts`
- **Outils créés:**
  1. `template_list` - Lister templates
  2. `template_import` - Importer template
  3. `template_export` - Exporter template
  4. `template_apply` - Appliquer template
  5. `widget_list` - Lister widgets
  6. `widget_configure` - Configurer widget
  7. `widget_weather` - Widget météo avec géolocalisation
  8. `widget_stocks` - Widget bourse/finance
  9. `widget_social` - Widget réseaux sociaux
  10. `widget_emergency` - Widget alertes urgence (Xibo 4.2)

### 🚧 Modules À Créer (6 modules restants) - 40 outils à implémenter

#### 7. **Module Notifications & Alerts** 📝 SUIVANT - 8 outils
- **Fichier à créer:** `src/tools/notifications.ts`
- **Outils à implémenter:**
  1. `notification_list` - Lister notifications
  2. `notification_send` - Envoyer notification
  3. `notification_broadcast` - Diffuser à tous
  4. `alert_emergency_create` - Alerte urgence
  5. `alert_schedule` - Programmer alerte
  6. `alert_geo_target` - Alerte géo-ciblée
  7. `task_list` - Lister tâches
  8. `task_run_now` - Exécuter tâche

#### 8. **Module System Config** ⏳ - 9 outils
- **Fichier à créer:** `src/tools/system.ts`
- **Outils à implémenter:**
  1. `command_list` - Lister commandes
  2. `command_create` - Créer commande
  3. `command_execute` - Exécuter commande
  4. `tag_list` - Lister tags
  5. `tag_create` - Créer tag
  6. `tag_bulk_assign` - Tags en masse
  7. `daypart_list` - Lister plages
  8. `daypart_create` - Créer plage
  9. `daypart_assign` - Assigner plage

#### 9. **Module Transitions & Effets** ⏳ - 7 outils
- **Fichier à créer:** `src/tools/transitions.ts`
- **Outils à implémenter:**
  1. `transition_list` - Lister transitions
  2. `transition_apply` - Appliquer transition
  3. `effect_fade` - Effet fondu
  4. `effect_slide` - Effet glissement
  5. `effect_zoom` - Effet zoom
  6. `resolution_list` - Lister résolutions
  7. `resolution_set` - Définir résolution

#### 10. **Module Sync & Integrations** ⏳ - 6 outils
- **Fichier à créer:** `src/tools/sync.ts`
- **Outils à implémenter:**
  1. `sync_multi_cms` - Sync multi-CMS
  2. `sync_content` - Sync contenu
  3. `connector_list` - Lister connecteurs
  4. `connector_configure` - Config connecteur
  5. `api_webhook_create` - Créer webhook
  6. `api_webhook_test` - Tester webhook

#### 11. **Module Menu Boards** ⏳ - 5 outils
- **Fichier à créer:** `src/tools/menuboards.ts`
- **Outils à implémenter:**
  1. `menuboard_create` - Créer menu
  2. `menuboard_update_prices` - MAJ prix
  3. `menuboard_schedule_items` - Programmer items
  4. `menuboard_category_manage` - Gérer catégories
  5. `menuboard_promotion` - Gérer promos

#### 12. **Module Automation** ⏳ - 5 outils
- **Fichier à créer:** `src/tools/actions.ts`
- **Outils à implémenter:**
  1. `action_list` - Lister actions
  2. `action_create` - Créer action
  3. `action_trigger_config` - Config déclencheurs
  4. `action_conditional` - Actions conditionnelles
  5. `workflow_create` - Créer workflow

### 📋 Tâches Restantes (TODO)

#### Phase Actuelle: Implémentation des modules
- [✅] Créer système authentification OAuth2
- [✅] Module Users & Groups (11 outils)
- [✅] Module Folders & Permissions (6 outils) 
- [✅] Module Statistics & Reports (9 outils)
- [✅] Module Datasets (9 outils)
- [✅] Module Templates & Widgets (10 outils)
- [📝] **SUIVANT: Module Notifications & Alerts (8 outils)**
- [⏳] Module System Config (9 outils)
- [⏳] Module Transitions (7 outils)
- [⏳] Module Sync & Integrations (6 outils)
- [⏳] Module Menu Boards (5 outils)
- [⏳] Module Automation (5 outils)

#### Phase Finale: Intégration et Documentation
- [⏳] Mettre à jour `src/index.ts` avec tous les nouveaux outils (117 total)
- [⏳] Mettre à jour `src/types.ts` avec nouvelles définitions
- [⏳] Créer documentation complète des 117 outils
- [⏳] Mettre à jour scripts d'installation
- [⏳] Mettre à jour `package.json` version 2.0.0

### 🎯 Objectifs de Performance

- **Modules complétés:** 6/12 (50%)
- **Nouveaux outils créés:** 45/85 (53%)
- **Total outils finaux:** 77/117 (66%)

### 🔧 Configuration Technique

#### Authentification
- **Mode actuel:** Dual auth (user tokens + client credentials fallback)
- **Script d'auth:** `npm run auth-user` (disponible)
- **Encryption:** AES-256-GCM pour tokens utilisateur
- **Refresh:** Automatique avec TokenManager

#### Structure des Outils
```typescript
// Chaque outil suit cette structure:
const toolName: ToolDefinition = {
  name: 'tool_name',
  description: 'Description en français',
  parameters: [
    { name: 'param', type: 'string', description: 'Description', required: true }
  ],
  handler: async (params: any) => {
    const client: XiboClient = params._xiboClient;
    // Logique de l'outil
  }
};
```

#### Conventions de Code
- **Langue:** Interface et messages en français
- **Emojis:** Utilisés pour améliorer la lisibilité
- **Gestion d'erreur:** try/catch avec messages descriptifs
- **Pagination:** Support start/length pour grandes listes
- **Format retour:** Markdown formaté pour Claude

### 🚀 Commandes Naturelles Cibles

Examples de commandes que le MCP final supportera:
```
"Mets cette pub partout sauf à Québec" 
→ broadcast_ad + alert_geo_target

"Montre-moi les stats de mes écrans à Montréal" 
→ stats_display_usage + filtrage géo

"Crée une alerte d'urgence pour la tempête" 
→ alert_emergency_create + notification_broadcast

"Change les prix du menu pour le lunch" 
→ menuboard_update_prices + daypart_assign

"Exporte le rapport de diffusion du mois" 
→ report_proof_of_play + auditlog_export
```

### 📈 Métriques Finales Attendues

- **117 outils MCP** (vs 32 actuellement = +265%)
- **12 catégories fonctionnelles** organisées
- **Support Xibo 4.x complet** avec nouvelles fonctionnalités
- **Authentification robuste** utilisateur + 2FA
- **Contrôle géographique avancé** (Québec/Montréal)
- **Widgets spécialisés** (météo, bourse, urgence)
- **Rapports et analytics** complets

---

## 🔄 Instructions de Reprise

**Si reprise après auto-compact:**

1. **Vérifier l'état actuel:**
   - Lire cette documentation contexte
   - Vérifier les modules dans `src/tools/`
   - Identifier le dernier module complété

2. **Continuer l'implémentation:**
   - Suivant: Module Notifications & Alerts (`src/tools/notifications.ts`)
   - Utiliser la structure des outils existants comme référence
   - Maintenir les conventions (français, emojis, gestion erreurs)

3. **Après tous les modules:**
   - Mettre à jour `src/index.ts` pour intégrer tous les outils
   - Mettre à jour types et documentation
   - Finaliser les scripts

**Rappel:** L'utilisateur veut "quelque chose de professionnel" avec le logo Xtranumerik et installation simple via git. Le focus principal reste la fonctionnalité géographique "sauf ceux à Québec".