/**
 * Permission Detection System for Xibo MCP
 * Dynamically detects user permissions and filters available tools
 * @author Xtranumerik Inc.
 */

import { UserPermissionSet, ToolDefinition } from '../types.js';

export interface PermissionCategory {
  name: string;
  tools: string[];
  requiredPermissions: (keyof UserPermissionSet)[];
  minLevel: 'viewer' | 'editor' | 'admin' | 'super_admin';
  description: string;
}

export class PermissionDetector {
  private static readonly TOOL_CATEGORIES: PermissionCategory[] = [
    // Basic Tools (available to all authenticated users)
    {
      name: 'basic_displays',
      tools: ['display_list', 'display_get', 'display_status'],
      requiredPermissions: [],
      minLevel: 'viewer',
      description: 'Basic display information viewing'
    },
    {
      name: 'basic_layouts',
      tools: ['layout_list', 'layout_get'],
      requiredPermissions: [],
      minLevel: 'viewer',
      description: 'Basic layout information viewing'
    },
    {
      name: 'basic_media',
      tools: ['media_list', 'media_get'],
      requiredPermissions: [],
      minLevel: 'viewer',
      description: 'Basic media library viewing'
    },
    {
      name: 'basic_campaigns',
      tools: ['campaign_list', 'campaign_get'],
      requiredPermissions: [],
      minLevel: 'viewer',
      description: 'Basic campaign information viewing'
    },

    // Editor Level Tools
    {
      name: 'display_management',
      tools: [
        'display_edit', 'display_delete', 'display_screenshot', 
        'display_command_send', 'display_settings_update', 'display_wake_on_lan'
      ],
      requiredPermissions: ['canManageDisplays'],
      minLevel: 'editor',
      description: 'Full display management capabilities'
    },
    {
      name: 'layout_management',
      tools: [
        'layout_create', 'layout_edit', 'layout_delete', 'layout_publish',
        'layout_retire', 'layout_copy', 'layout_import'
      ],
      requiredPermissions: ['canManageLayouts'],
      minLevel: 'editor',
      description: 'Full layout creation and management'
    },
    {
      name: 'media_management',
      tools: [
        'media_upload', 'media_edit', 'media_delete', 'media_replace',
        'media_copy', 'media_tag', 'media_move'
      ],
      requiredPermissions: ['canManageMedia'],
      minLevel: 'editor',
      description: 'Full media library management'
    },
    {
      name: 'campaign_management',
      tools: [
        'campaign_create', 'campaign_edit', 'campaign_delete',
        'campaign_assign_layouts', 'campaign_schedule'
      ],
      requiredPermissions: ['canManageCampaigns'],
      minLevel: 'editor',
      description: 'Campaign creation and management'
    },
    {
      name: 'schedule_management',
      tools: [
        'schedule_create', 'schedule_edit', 'schedule_delete',
        'schedule_list_events', 'daypart_create', 'daypart_assign'
      ],
      requiredPermissions: ['canManageSchedules'],
      minLevel: 'editor',
      description: 'Scheduling and daypart management'
    },
    {
      name: 'playlist_management',
      tools: ['playlist_create', 'playlist_edit', 'playlist_delete', 'playlist_assign_widgets'],
      requiredPermissions: ['canManageLayouts'], // Playlists are tied to layouts
      minLevel: 'editor',
      description: 'Playlist creation and widget assignment'
    },
    {
      name: 'display_groups',
      tools: ['displaygroup_create', 'displaygroup_edit', 'displaygroup_delete', 'displaygroup_assign_displays'],
      requiredPermissions: ['canManageDisplays'],
      minLevel: 'editor',
      description: 'Display group management'
    },

    // Broadcasting Tools (require content management)
    {
      name: 'broadcasting',
      tools: [
        'broadcast_image', 'broadcast_video', 'broadcast_content',
        'broadcast_emergency', 'broadcast_schedule', 'broadcast_cancel'
      ],
      requiredPermissions: ['canManageLayouts', 'canManageCampaigns'],
      minLevel: 'editor',
      description: 'Content broadcasting and emergency alerts'
    },

    // Admin Level Tools
    {
      name: 'user_management',
      tools: [
        'user_list', 'user_get', 'user_create', 'user_edit', 'user_delete',
        'user_change_password', 'usergroup_create', 'usergroup_assign'
      ],
      requiredPermissions: ['canManageUsers'],
      minLevel: 'admin',
      description: 'User account and group management'
    },
    {
      name: 'advanced_analytics',
      tools: [
        'stats_display_usage', 'stats_layout_performance', 'stats_media_popularity',
        'stats_campaign_effectiveness', 'stats_proof_of_play', 'stats_bandwidth_usage',
        'stats_display_availability', 'report_generate', 'report_schedule'
      ],
      requiredPermissions: ['canViewReports'],
      minLevel: 'admin',
      description: 'Advanced analytics and reporting'
    },
    {
      name: 'dataset_management',
      tools: [
        'dataset_list', 'dataset_create', 'dataset_edit', 'dataset_delete',
        'dataset_import_csv', 'dataset_data_add', 'dataset_sync', 'dataset_column_add'
      ],
      requiredPermissions: ['canManageDatasets'],
      minLevel: 'admin',
      description: 'Dynamic dataset management and synchronization'
    },
    {
      name: 'notification_system',
      tools: [
        'notification_create', 'notification_send', 'notification_schedule',
        'alert_emergency_create', 'alert_emergency_broadcast', 'notification_template_create'
      ],
      requiredPermissions: ['canManageNotifications'],
      minLevel: 'admin',
      description: 'Notification system and emergency alerts'
    },
    {
      name: 'folder_permissions',
      tools: [
        'folder_create', 'folder_edit', 'folder_delete', 'folder_move',
        'folder_permission_set', 'folder_permission_list', 'permission_grant'
      ],
      requiredPermissions: ['canManageUsers'], // Folder permissions require user management
      minLevel: 'admin',
      description: 'Folder structure and permission management'
    },

    // Super Admin Tools
    {
      name: 'system_administration',
      tools: [
        'system_settings_get', 'system_settings_update', 'system_maintenance_mode',
        'system_log_get', 'system_backup', 'system_update_check',
        'system_modules_list', 'system_modules_install', 'system_health_check'
      ],
      requiredPermissions: ['canManageSystem'],
      minLevel: 'super_admin',
      description: 'System-level configuration and maintenance'
    },
    {
      name: 'advanced_system_config',
      tools: [
        'setting_display_profile_create', 'command_create', 'command_assign',
        'resolution_create', 'transition_create', 'module_config_update'
      ],
      requiredPermissions: ['canManageSystem'],
      minLevel: 'super_admin',
      description: 'Advanced system configuration and customization'
    },

    // OAuth2-only Advanced Features (require elevated permissions)
    {
      name: 'templates_widgets',
      tools: [
        'template_create', 'template_edit', 'template_export', 'template_import',
        'widget_create_advanced', 'widget_effects_add', 'template_marketplace_browse'
      ],
      requiredPermissions: ['canManageLayouts'],
      minLevel: 'admin',
      description: 'Advanced template and widget management'
    },
    {
      name: 'menu_boards',
      tools: [
        'menuboard_create', 'menuboard_edit', 'menuboard_update_prices',
        'menuboard_add_promotion', 'menuboard_schedule_update', 'menuboard_sync_pos'
      ],
      requiredPermissions: ['canManageLayouts', 'canManageDatasets'],
      minLevel: 'admin',
      description: 'Dynamic menu board management for restaurants'
    },
    {
      name: 'sync_integrations',
      tools: [
        'sync_cms_configure', 'sync_cms_execute', 'sync_schedule',
        'connector_external_add', 'webhook_create', 'api_integration_setup'
      ],
      requiredPermissions: ['canManageSystem'],
      minLevel: 'super_admin',
      description: 'Multi-CMS synchronization and external integrations'
    },
    {
      name: 'automation_workflows',
      tools: [
        'automation_create', 'automation_trigger_setup', 'automation_schedule',
        'workflow_create', 'workflow_condition_add', 'automation_execute'
      ],
      requiredPermissions: ['canManageSystem'],
      minLevel: 'super_admin',
      description: 'Workflow automation and smart triggers'
    },
    {
      name: 'transitions_effects',
      tools: [
        'transition_apply', 'effect_add', 'animation_create',
        'transition_custom_create', 'effect_template_save'
      ],
      requiredPermissions: ['canManageLayouts'],
      minLevel: 'admin',
      description: 'Professional visual transitions and effects'
    }
  ];

  private permissions: UserPermissionSet;

  constructor(permissions: UserPermissionSet) {
    this.permissions = permissions;
  }

  /**
   * Get all available tool categories for the current user
   */
  getAvailableCategories(): PermissionCategory[] {
    return PermissionDetector.TOOL_CATEGORIES.filter(category => 
      this.hasPermissionForCategory(category)
    );
  }

  /**
   * Get all available tool names for the current user
   */
  getAvailableTools(): string[] {
    const availableCategories = this.getAvailableCategories();
    const tools: string[] = [];

    availableCategories.forEach(category => {
      tools.push(...category.tools);
    });

    return [...new Set(tools)]; // Remove duplicates
  }

  /**
   * Check if user has permission for a specific tool
   */
  hasPermissionForTool(toolName: string): boolean {
    const category = PermissionDetector.TOOL_CATEGORIES.find(cat =>
      cat.tools.includes(toolName)
    );

    return category ? this.hasPermissionForCategory(category) : false;
  }

  /**
   * Filter tool definitions based on user permissions
   */
  filterToolDefinitions(tools: ToolDefinition[]): ToolDefinition[] {
    const availableTools = this.getAvailableTools();
    
    return tools.filter(tool => availableTools.includes(tool.name));
  }

  /**
   * Get permission summary for debugging/logging
   */
  getPermissionSummary(): {
    level: string;
    totalTools: number;
    availableTools: number;
    categories: string[];
    restrictions: string[];
  } {
    const availableCategories = this.getAvailableCategories();
    const restrictions: string[] = [];

    // Identify major restrictions
    if (!this.permissions.canManageUsers) restrictions.push('User Management');
    if (!this.permissions.canManageSystem) restrictions.push('System Administration');
    if (!this.permissions.canManageDisplays) restrictions.push('Display Management');
    if (!this.permissions.canViewReports) restrictions.push('Advanced Analytics');

    const totalPossibleTools = PermissionDetector.TOOL_CATEGORIES
      .reduce((total, cat) => total + cat.tools.length, 0);

    const availableToolCount = this.getAvailableTools().length;

    return {
      level: this.permissions.level,
      totalTools: totalPossibleTools,
      availableTools: availableToolCount,
      categories: availableCategories.map(cat => cat.name),
      restrictions
    };
  }

  /**
   * Check if user meets level requirement
   */
  private meetsLevelRequirement(requiredLevel: string): boolean {
    const levels = ['viewer', 'editor', 'admin', 'super_admin'];
    const userLevelIndex = levels.indexOf(this.permissions.level);
    const requiredLevelIndex = levels.indexOf(requiredLevel);

    return userLevelIndex >= requiredLevelIndex;
  }

  /**
   * Check if user has permission for a category
   */
  private hasPermissionForCategory(category: PermissionCategory): boolean {
    // Check level requirement
    if (!this.meetsLevelRequirement(category.minLevel)) {
      return false;
    }

    // Check specific permissions
    if (category.requiredPermissions.length > 0) {
      return category.requiredPermissions.every(permission => 
        this.permissions[permission] === true
      );
    }

    return true;
  }

  /**
   * Create default viewer permissions
   */
  static createViewerPermissions(): UserPermissionSet {
    return {
      isAdmin: false,
      canManageUsers: false,
      canManageDisplays: false,
      canManageLayouts: false,
      canManageMedia: false,
      canManageCampaigns: false,
      canManageSchedules: false,
      canManageDatasets: false,
      canManageNotifications: false,
      canViewReports: false,
      canManageSystem: false,
      level: 'viewer',
      groupIds: [],
      folderAccess: []
    };
  }

  /**
   * Create default editor permissions
   */
  static createEditorPermissions(): UserPermissionSet {
    return {
      isAdmin: false,
      canManageUsers: false,
      canManageDisplays: true,
      canManageLayouts: true,
      canManageMedia: true,
      canManageCampaigns: true,
      canManageSchedules: true,
      canManageDatasets: false,
      canManageNotifications: false,
      canViewReports: false,
      canManageSystem: false,
      level: 'editor',
      groupIds: [],
      folderAccess: []
    };
  }

  /**
   * Create default admin permissions
   */
  static createAdminPermissions(): UserPermissionSet {
    return {
      isAdmin: true,
      canManageUsers: true,
      canManageDisplays: true,
      canManageLayouts: true,
      canManageMedia: true,
      canManageCampaigns: true,
      canManageSchedules: true,
      canManageDatasets: true,
      canManageNotifications: true,
      canViewReports: true,
      canManageSystem: false,
      level: 'admin',
      groupIds: [],
      folderAccess: []
    };
  }

  /**
   * Create super admin permissions (all tools available)
   */
  static createSuperAdminPermissions(): UserPermissionSet {
    return {
      isAdmin: true,
      canManageUsers: true,
      canManageDisplays: true,
      canManageLayouts: true,
      canManageMedia: true,
      canManageCampaigns: true,
      canManageSchedules: true,
      canManageDatasets: true,
      canManageNotifications: true,
      canViewReports: true,
      canManageSystem: true,
      level: 'super_admin',
      groupIds: [],
      folderAccess: []
    };
  }

  /**
   * Get tool count by category for current user
   */
  getToolCountByCategory(): Record<string, number> {
    const availableCategories = this.getAvailableCategories();
    const counts: Record<string, number> = {};

    availableCategories.forEach(category => {
      counts[category.name] = category.tools.length;
    });

    return counts;
  }

  /**
   * Check if this is a fallback to basic tools (OAuth2 failed)
   */
  isBasicToolsOnly(): boolean {
    const availableTools = this.getAvailableTools();
    const basicTools = PermissionDetector.TOOL_CATEGORIES
      .filter(cat => cat.minLevel === 'viewer')
      .reduce((tools, cat) => [...tools, ...cat.tools], [] as string[]);

    // If we only have basic tools and the user level is viewer, likely fallback mode
    return availableTools.length <= basicTools.length && this.permissions.level === 'viewer';
  }
}