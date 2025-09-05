/**
 * Type definitions for Xibo MCP Server v2.0
 * Complete API coverage with 117 tools support
 * @author Xtranumerik Inc.
 */

// ========== AUTHENTICATION TYPES ==========

export type AuthMode = 'client_credentials' | 'direct_user';

export interface XiboAuthConfig {
  apiUrl: string;
  clientId?: string;
  clientSecret?: string;
  username?: string;
  password?: string;
  grantType?: 'client_credentials' | 'authorization_code';
  authMode?: AuthMode;
}

export interface XiboTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

// OAuth2 User Authentication Types
export interface UserTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  created_at: number;
}

export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  encrypted: boolean;
}

// Direct User Authentication Types
export interface DirectUserSession {
  sessionId: string;
  userId: number;
  username: string;
  expires_at: number;
  csrf_token?: string;
  permissions?: UserPermissionSet;
}

export interface UserPermissionSet {
  isAdmin: boolean;
  canManageUsers: boolean;
  canManageDisplays: boolean;
  canManageLayouts: boolean;
  canManageMedia: boolean;
  canManageCampaigns: boolean;
  canManageSchedules: boolean;
  canManageDatasets: boolean;
  canManageNotifications: boolean;
  canViewReports: boolean;
  canManageSystem: boolean;
  level: 'viewer' | 'editor' | 'admin' | 'super_admin';
  groupIds: number[];
  folderAccess: number[];
}

export interface DirectAuthResponse {
  success: boolean;
  sessionId?: string;
  userId?: number;
  username?: string;
  csrfToken?: string;
  permissions?: UserPermissionSet;
  requiresMFA?: boolean;
  mfaToken?: string;
  error?: string;
}

export interface MFAChallenge {
  token: string;
  method: 'totp' | 'sms' | 'email';
  expiresIn: number;
}

// ========== CORE XIBO TYPES ==========

// Display Types (Enhanced)
export interface Display {
  displayId: number;
  display: string;
  description?: string;
  tags?: string[];
  licensed: boolean;
  defaultLayoutId: number;
  displayGroupId: number;
  currentLayoutId?: number;
  screenShotRequested?: boolean;
  storageAvailableSpace?: number;
  storageTotalSpace?: number;
  address?: string;
  city?: string;
  country?: string;
  postcode?: string;
  latitude?: number;
  longitude?: number;
  lastAccessed?: string;
  clientType?: string;
  clientVersion?: string;
  clientCode?: string;
  mediaInventoryStatus?: number;
  loggedIn?: boolean;
  lastCommandSuccess?: boolean;
  displayTypeId?: number;
  screenSize?: string;
  overrideConfig?: string;
  newCmsAddress?: string;
  newCmsKey?: string;
  orientation?: number;
  wakeOnLanEnabled?: boolean;
  wakeOnLanTime?: string;
  broadcastAddress?: string;
  secureOn?: string;
  cidr?: string;
  geoLocation?: string;
  venueId?: number;
  xmrChannel?: string;
  xmrPubKey?: string;
  authCode?: string;
  commercialLicence?: boolean;
  teamViewerSerial?: string;
  webkeySerial?: string;
  createdDt?: string;
  modifiedDt?: string;
  folderId?: number;
  ref1?: string;
  ref2?: string;
  ref3?: string;
  ref4?: string;
  ref5?: string;
}

// Layout Types (Enhanced)
export interface Layout {
  layoutId: number;
  layout: string;
  description?: string;
  userId: number;
  backgroundImageId?: number;
  backgroundColor?: string;
  width: number;
  height: number;
  createdDt?: string;
  modifiedDt?: string;
  status: number;
  statusMessage?: string;
  regions?: Region[];
  tags?: string[];
  code?: string;
  folderId?: number;
  permissionsFolderId?: number;
  publishedStatusId: number;
  publishedStatus?: string;
  publishedDate?: string;
  autoApplyTransitions?: boolean;
  enableStat?: boolean;
  backgroundzIndex?: number;
  schemaVersion?: number;
  templateId?: number;
  backgroundImageIdOriginal?: number;
  resolutionId?: number;
}

// Region Types (Enhanced)
export interface Region {
  regionId: number;
  layoutId: number;
  ownerId: number;
  name: string;
  width: number;
  height: number;
  top: number;
  left: number;
  zIndex: number;
  duration?: number;
  isDrawer?: boolean;
  playlists?: Playlist[];
  transitionIn?: string;
  transitionOut?: string;
  transitionInDuration?: number;
  transitionOutDuration?: number;
  transitionInDirection?: string;
  transitionOutDirection?: string;
}

// ========== ADVANCED USER MANAGEMENT TYPES ==========

// User Types (Enhanced)
export interface User {
  userId: number;
  userName: string;
  userTypeId: number;
  email?: string;
  lastAccessed?: string;
  retired: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
  homePageId?: number;
  homeFolderId?: number;
  isPasswordChangeRequired?: boolean;
  newUserWizard?: boolean;
  hideNavigation?: boolean;
  showContentFrom?: string;
  folderId?: number;
  ref1?: string;
  ref2?: string;
  ref3?: string;
  ref4?: string;
  ref5?: string;
  createdDt?: string;
  modifiedDt?: string;
  disableUserCheck?: boolean;
  isTwoFactorAuthenticationEnabled?: boolean;
  twoFactorTypeId?: number;
}

export interface UserGroup {
  groupId: number;
  group: string;
  isUserSpecific: boolean;
  isEveryone: boolean;
  libraryQuota?: number;
  isSystemNotification?: boolean;
  isDisplayNotification?: boolean;
  features?: string[];
  description?: string;
}

export interface UserPermission {
  permissionId: number;
  entityId: number;
  groupId: number;
  objectId: number;
  view: boolean;
  edit: boolean;
  delete: boolean;
}

// ========== FOLDER AND PERMISSION TYPES ==========

export interface Folder {
  folderId: number;
  folderName: string;
  parentId: number;
  isRoot?: boolean;
  children?: Folder[];
  permissionsFolderId?: number;
  folderPath?: string;
  deepFolderPath?: string;
  deepFolderIds?: number[];
  selected?: boolean;
}

export interface FolderPermission {
  folderId: number;
  groupId: number;
  view: boolean;
  edit: boolean;
  delete: boolean;
}

// ========== STATISTICS AND ANALYTICS TYPES ==========

export interface Statistic {
  statId: number;
  type: string;
  fromDt: string;
  toDt: string;
  scheduleId?: number;
  displayId?: number;
  campaignId?: number;
  layoutId?: number;
  mediaId?: number;
  widgetId?: number;
  tag?: string;
  duration: number;
  count: number;
  engagements?: number;
  tagFilter?: string;
  statDate?: string;
}

export interface ProofOfPlay {
  layoutName: string;
  displayName: string;
  startTime: string;
  endTime: string;
  duration: number;
  widgetName?: string;
  mediaName?: string;
  type: string;
}

export interface DisplayAvailability {
  displayId: number;
  displayName: string;
  availability: number;
  uptime: number;
  downtime: number;
  startDt: string;
  endDt: string;
}

export interface BandwidthUsage {
  displayId: number;
  displayName: string;
  bytesRequested: number;
  bytesDownloaded: number;
  monthName?: string;
  size?: number;
}

// ========== DATASET AND SYNC TYPES ==========

export interface Dataset {
  dataSetId: number;
  dataSet: string;
  description?: string;
  code?: string;
  userId: number;
  lastDataEdit?: string;
  isLookup?: boolean;
  isRemote?: boolean;
  method?: 'GET' | 'POST';
  uri?: string;
  postData?: string;
  authentication?: string;
  username?: string;
  password?: string;
  refreshRate?: number;
  clearRate?: number;
  truncateOnEmpty?: boolean;
  lastSync?: string;
  dataRoot?: string;
  lastClear?: string;
  summarize?: string;
  summarizeField?: string;
  sourceId?: number;
  ignoreFirstRow?: boolean;
  rowLimit?: number;
  limitPolicy?: string;
  csvSeparator?: string;
  folderId?: number;
  permissionsFolderId?: number;
  columns?: DataSetColumn[];
}

export interface DataSetColumn {
  dataSetColumnId: number;
  dataSetId: number;
  heading: string;
  dataTypeId: number;
  dataSetColumnTypeId: number;
  listContent?: string;
  columnOrder: number;
  formula?: string;
  remoteField?: string;
  showFilter?: boolean;
  showSort?: boolean;
}

export interface DataSetData {
  id: number;
  [key: string]: any; // Dynamic properties based on dataset columns
}

// ========== TEMPLATE AND WIDGET TYPES ==========

export interface Template {
  templateId: number;
  template: string;
  description?: string;
  xml: string;
  userId: number;
  createdDt?: string;
  modifiedDt?: string;
  tags?: string[];
  folderId?: number;
  width?: number;
  height?: number;
}

export interface Widget {
  widgetId: number;
  playlistId: number;
  type: string;
  duration: number;
  displayOrder: number;
  useDuration?: boolean;
  calculatedDuration?: number;
  fromDt?: string;
  toDt?: string;
  transitionIn?: string;
  transitionOut?: string;
  transitionDurationIn?: number;
  transitionDurationOut?: number;
  widgetOptions?: WidgetOption[];
  mediaIds?: number[];
  audio?: Audio[];
  permissions?: string[];
  module?: Module;
}

export interface WidgetOption {
  widgetOptionId: number;
  widgetId: number;
  type: string;
  option: string;
  value: string;
}

// ========== NOTIFICATION AND ALERT TYPES ==========

export interface Notification {
  notificationId: number;
  subject: string;
  body?: string;
  createDt: string;
  releaseDt: string;
  isEmail: boolean;
  isInterrupt: boolean;
  isSystem: boolean;
  userId?: number;
  email?: boolean;
  interrupt?: boolean;
  filename?: string;
  originalFileName?: string;
  nonusers?: string;
  read?: boolean;
}

export interface EmergencyAlert {
  alertId: number;
  title: string;
  message: string;
  alertType: 'warning' | 'danger' | 'info' | 'success';
  severity: 'low' | 'medium' | 'high' | 'critical';
  regions?: string[];
  displayIds?: number[];
  duration?: number;
  priority: number;
  createdAt: string;
  expiresAt?: string;
  active: boolean;
}

// ========== SYSTEM AND AUTOMATION TYPES ==========

export interface Command {
  commandId: number;
  command: string;
  code: string;
  description?: string;
  userId: number;
  availableOn?: string;
  commandString?: string;
  validationString?: string;
  type?: string;
}

export interface Tag {
  tagId: number;
  tag: string;
  isSystem?: boolean;
  options?: string;
  isRequired?: boolean;
  cnt?: number; // Usage count
}

export interface DayPart {
  dayPartId: number;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  exceptions?: string;
  userId: number;
}

export interface AutomationAction {
  actionId: number;
  name: string;
  displayName: string;
  description: string;
  actionType: 'content' | 'display' | 'notification' | 'system';
  triggers: string[];
  targetType: string;
  active: boolean;
  created: string;
  lastModified: string;
  executions: number;
  lastExecution?: string;
}

export interface AutomationTrigger {
  triggerId: number;
  actionId: number;
  triggerType: string;
  triggerValue: string;
  recurrence: string;
  timezone: string;
  active: boolean;
  nextExecution?: string;
}

export interface AutomationWorkflow {
  workflowId: number;
  name: string;
  description: string;
  triggerEvent: string;
  steps: WorkflowStep[];
  errorHandling: 'stop' | 'continue' | 'retry';
  status: 'active' | 'inactive' | 'error';
  executions: number;
  successRate: number;
}

export interface WorkflowStep {
  stepId: number;
  name: string;
  type: string;
  action: string;
  condition?: string;
  delay?: number;
  onError?: string;
  order: number;
}

// ========== MENU BOARD TYPES ==========

export interface MenuBoard {
  menuId: number;
  name: string;
  restaurant: string;
  menuType: 'breakfast' | 'lunch' | 'dinner' | 'drinks' | 'desserts' | 'full';
  language: 'french' | 'english' | 'bilingual';
  priceFormat: 'cad' | 'usd' | 'both';
  template: 'modern' | 'classic' | 'elegant' | 'casual';
  layoutId: number;
  datasetId: number;
  active: boolean;
  createdAt: string;
  modifiedAt: string;
}

export interface MenuItem {
  id: string;
  category: string;
  name_fr?: string;
  name_en?: string;
  description_fr?: string;
  description_en?: string;
  price: string;
  available: 'Oui' | 'Non';
  special?: string;
  promotion?: string;
  scheduled?: string;
}

export interface MenuPromotion {
  promoId: number;
  title: string;
  promoType: 'discount' | 'combo' | 'happy_hour' | 'special';
  itemIds: string[];
  discount?: number;
  comboPrice?: number;
  validUntil?: string;
  active: boolean;
}

// ========== SYNC AND INTEGRATION TYPES ==========

export interface SyncConfiguration {
  syncId: number;
  name: string;
  sourceCmsUrl: string;
  targetCmsUrl: string;
  syncType: 'layouts' | 'media' | 'campaigns' | 'displays' | 'all';
  includeRegions: string[];
  lastSync?: string;
  status: 'active' | 'inactive' | 'error';
  itemsSynced: number;
}

export interface ExternalConnector {
  connectorId: number;
  name: string;
  type: 'api' | 'database' | 'social' | 'weather' | 'rss';
  endpoint: string;
  apiKey?: string;
  refreshInterval: number;
  active: boolean;
  lastConnection?: string;
  status: 'connected' | 'disconnected' | 'error';
}

export interface Webhook {
  webhookId: number;
  name: string;
  url: string;
  method: 'POST' | 'PUT';
  events: string[];
  secret?: string;
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

// ========== TRANSITION AND EFFECTS TYPES ==========

export interface Transition {
  transitionId: number;
  name: string;
  displayName: string;
  type: 'in' | 'out';
  duration: number;
  description: string;
  cssClass?: string;
  available: boolean;
}

export interface Resolution {
  resolutionId: number;
  name: string;
  width: number;
  height: number;
  ratio: string;
  category: string;
  recommended: boolean;
}

// ========== GEOGRAPHIC AND REGIONAL TYPES ==========

export interface GeoZone {
  name: string;
  cities: string[];
  tags?: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
    radius?: number;
  };
}

export interface RegionPermission {
  regions: string[];
  permissions: string[];
  clientType?: 'internal' | 'external';
}

export interface GeoTargeting {
  includeRegions?: string[];
  excludeRegions?: string[];
  includeCities?: string[];
  excludeCities?: string[];
  tags?: string[];
  radius?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// ========== EXISTING TYPES (Enhanced) ==========

export interface Playlist {
  playlistId: number;
  name: string;
  tags?: string[];
  regionId?: number;
  isDynamic?: boolean;
  filterMediaName?: string;
  filterMediaTags?: string[];
  filterExactTags?: boolean;
  filterLogicalOperator?: 'AND' | 'OR';
  maxNumberOfItems?: number;
  folderId?: number;
  permissionsFolderId?: number;
  widgets?: Widget[];
  enableStat?: boolean;
  ownerId?: number;
  duration?: number;
  requiresDurationUpdate?: boolean;
  createdDt?: string;
  modifiedDt?: string;
}

export interface Media {
  mediaId: number;
  name: string;
  mediaType: string;
  storedAs: string;
  fileName: string;
  fileSize?: number;
  duration?: number;
  retired: boolean;
  isEdited?: boolean;
  ownerId: number;
  md5?: string;
  width?: number;
  height?: number;
  orientation?: string;
  createdDt?: string;
  modifiedDt?: string;
  enableStat?: boolean;
  folderId?: number;
  permissionsFolderId?: number;
  tags?: string[];
  originalFileName?: string;
  valid?: boolean;
  expires?: string;
  released?: boolean;
  apiRef?: string;
}

export interface Campaign {
  campaignId: number;
  campaign: string;
  isLayoutSpecific: boolean;
  numberLayouts: number;
  totalDuration: number;
  folderId?: number;
  permissionsFolderId?: number;
  cyclePlaybackEnabled?: boolean;
  playCount?: number;
  type?: string;
  startDt?: string;
  endDt?: string;
  targetType?: string;
  target?: number;
  plays?: number;
  spend?: number;
  impressions?: number;
  lastPopId?: string;
  listPlayOrder?: string;
  ref1?: string;
  ref2?: string;
  ref3?: string;
  ref4?: string;
  ref5?: string;
  createdAt?: string;
  modifiedAt?: string;
  modifiedBy?: string;
  ownerId?: number;
}

export interface Schedule {
  eventId: number;
  eventTypeId: number;
  fromDt: string;
  toDt: string;
  campaignId?: number;
  commandId?: number;
  displayGroupId?: number;
  userId: number;
  isPriority: boolean;
  displayOrder?: number;
  dayPartId?: number;
  isGeoAware?: boolean;
  geoLocation?: string;
  recurrenceType?: string;
  recurrenceDetail?: string;
  recurrenceRange?: string;
  recurrenceRepeatsOn?: string;
  lastRecurrenceWatermark?: string;
  syncTimezone?: boolean;
  syncGroupId?: number;
  shareOfVoice?: number;
  isCustom?: boolean;
  maxPlaysPerHour?: number;
  parentCampaignId?: number;
  actionType?: string;
  actionTriggerCode?: string;
  actionLayoutCode?: string;
}

export interface DisplayGroup {
  displayGroupId: number;
  displayGroup: string;
  description?: string;
  isDisplaySpecific: boolean;
  isDynamic: boolean;
  dynamicCriteria?: string;
  dynamicCriteriaTags?: string;
  userId: number;
  tags?: string[];
  folderId?: number;
  permissionsFolderId?: number;
  ref1?: string;
  ref2?: string;
  ref3?: string;
  ref4?: string;
  ref5?: string;
  createdDt?: string;
  modifiedDt?: string;
  bandwidthLimit?: number;
}

export interface Module {
  moduleId: number;
  module: string;
  name: string;
  description?: string;
  enabled: boolean;
  regionSpecific: boolean;
  validExtensions?: string;
  previewEnabled: boolean;
  assignable: boolean;
  renderAs?: string;
  settings?: any[];
  defaultDuration?: number;
  installName?: string;
  showIn?: string;
  schemaVersion?: number;
  class?: string;
  type?: string;
}

export interface Audio {
  mediaId?: number;
  volume?: number;
  loop?: boolean;
}

// ========== BROADCAST AND ADVANCED TARGETING TYPES ==========

export interface BroadcastConfig {
  media: string | number;
  targets: {
    include?: {
      tags?: string[];
      cities?: string[];
      groups?: string[];
      displayIds?: number[];
      regions?: string[];
    };
    exclude?: {
      tags?: string[];
      cities?: string[];
      groups?: string[];
      displayIds?: number[];
      regions?: string[];
    };
  };
  geoTargeting?: GeoTargeting;
  regions?: {
    client_controlled?: string[];
    internal_only?: string[];
  };
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  schedule?: {
    fromDt?: string;
    toDt?: string;
    recurrence?: string;
    dayParts?: number[];
  };
  conditions?: {
    weather?: string[];
    timeRange?: string;
    displayStatus?: string;
  };
}

// ========== API RESPONSE TYPES ==========

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

export interface ApiError {
  error: {
    message: string;
    code: string;
    data?: any;
  };
  help?: string;
}

export interface PagedResponse<T> {
  data: T[];
  recordsTotal?: number;
  recordsFiltered?: number;
  draw?: number;
}

export interface XiboApiResponse<T> {
  data: T;
  recordsTotal?: number;
  recordsFiltered?: number;
  draw?: number;
}

// ========== MCP TOOL TYPES ==========

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required?: boolean;
  default?: any;
  enum?: any[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameter[];
  handler: (params: any) => Promise<any>;
  category?: string;
  requiresAuth?: 'client_credentials' | 'user_auth' | 'direct_user' | 'both';
  version?: string;
}

// ========== CONFIGURATION TYPES ==========

export interface MCPConfig {
  serverName: string;
  serverVersion: string;
  serverPort?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  logFile?: string;
  cacheEnabled?: boolean;
  cacheTTL?: number;
  rateLimitRequests?: number;
  rateLimitWindow?: number;
}

export interface XiboMCPConfig extends XiboAuthConfig, MCPConfig {
  authMode: AuthMode;
  companyName?: string;
  logoPath?: string;
  geoZones?: Record<string, GeoZone>;
  defaultExcludeCities?: string[];
  regionPermissions?: Record<string, RegionPermission>;
  defaultTags?: string[];
  features?: {
    geoTargeting?: boolean;
    emergencyAlerts?: boolean;
    menuBoards?: boolean;
    automation?: boolean;
    multiCmsSync?: boolean;
    advancedAnalytics?: boolean;
  };
}

// ========== REPORTING TYPES ==========

export interface Report {
  reportId: number;
  reportName: string;
  reportCategory: string;
  description?: string;
  createdDt?: string;
  userId?: number;
  filterCriteria?: any;
  reportSchedule?: ReportSchedule;
}

export interface ReportSchedule {
  reportScheduleId: number;
  name: string;
  reportId: number;
  filterCriteria?: any;
  schedule?: string;
  lastSavedReportId?: number;
  lastRunDt?: string;
  previousRunDt?: string;
  userId: number;
  isActive: boolean;
  fromDt?: string;
  toDt?: string;
  hour?: number;
  minute?: number;
  message?: string;
}

// ========== AUDIT AND LOGGING TYPES ==========

export interface AuditLog {
  logId: number;
  logDate: string;
  userId: number;
  userName?: string;
  message: string;
  entity: string;
  entityId: number;
  objectAfter?: string;
  ip?: string;
  method?: string;
  route?: string;
  userAgent?: string;
}

export interface SystemLog {
  logId: number;
  runNo: string;
  logDate: string;
  channel: string;
  type: string;
  page: string;
  function: string;
  message: string;
  displayId?: number;
  scheduleId?: number;
}

// ========== TASK AND JOB TYPES ==========

export interface Task {
  taskId: number;
  name: string;
  class: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  lastRunDt?: string;
  nextRunDt?: string;
  lastRunMessage?: string;
  lastRunDuration?: number;
  runNow?: boolean;
  configFile: string;
}

// ========== VERSION AND SYSTEM INFO TYPES ==========

export interface SystemInfo {
  version: string;
  dbVersion: string;
  environment: string;
  libraryLocation: string;
  timeZone: string;
  theme: string;
  isTrial?: boolean;
  logo?: string;
  productName?: string;
  features?: string[];
}

export interface Version {
  version: string;
  XmdsVersion: string;
  XlfVersion: string;
  dbVersion: string;
}