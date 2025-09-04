/**
 * Type definitions for Xibo MCP Server
 * @author Xtranumerik Inc.
 */

// OAuth Types
export interface XiboAuthConfig {
  apiUrl: string;
  clientId: string;
  clientSecret: string;
  grantType?: 'client_credentials' | 'access_code';
}

export interface XiboTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

// Display Types
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
  lastAccessed?: string;
  clientType?: string;
  clientVersion?: string;
  clientCode?: string;
  mediaInventoryStatus?: number;
  loggedIn?: boolean;
  lastCommandSuccess?: boolean;
}

// Layout Types
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
}

// Region Types
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
}

// Playlist Types
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
}

// Widget Types
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

// Media Types
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
}

// Campaign Types
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
}

// Schedule Types
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
}

// Display Group Types
export interface DisplayGroup {
  displayGroupId: number;
  displayGroup: string;
  description?: string;
  isDisplaySpecific: boolean;
  isDynamic: boolean;
  dynamicCriteria?: string;
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
}

// Dataset Types
export interface Dataset {
  dataSetId: number;
  dataSet: string;
  description?: string;
  code?: string;
  userId: number;
  lastDataEdit?: string;
  isLookup?: boolean;
  isRemote?: boolean;
  method?: string;
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
}

// Module Types
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
}

// Audio Types
export interface Audio {
  mediaId?: number;
  volume?: number;
  loop?: boolean;
}

// Command Types
export interface Command {
  commandId: number;
  command: string;
  code: string;
  description?: string;
  userId: number;
  availableOn?: string;
  commandString?: string;
  validationString?: string;
}

// Action Types
export interface Action {
  actionId: number;
  ownerId: number;
  triggerType: string;
  triggerCode?: string;
  actionType: string;
  source: string;
  sourceId: number;
  target: string;
  targetId: number;
  widgetId?: number;
  layoutCode?: string;
  navigateToId?: number;
}

// Notification Types
export interface Notification {
  notificationId: number;
  subject: string;
  body?: string;
  createDt: string;
  releaseDt: string;
  isEmail: boolean;
  isInterrupt: boolean;
  isSystem: boolean;
  filename?: string;
  originalFileName?: string;
  nonusers?: string;
}

// Tag Types
export interface Tag {
  tagId: number;
  tag: string;
  isSystem?: boolean;
  options?: string;
  isRequired?: boolean;
}

// Folder Types
export interface Folder {
  folderId: number;
  folderName: string;
  parentId: number;
  isRoot?: boolean;
  children?: Folder[];
  permissionsFolderId?: number;
}

// Report Types
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

// Statistic Types
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
}

// User Types
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
  ref1?: string;
  ref2?: string;
  ref3?: string;
  ref4?: string;
  ref5?: string;
}

// Geographic Configuration Types
export interface GeoZone {
  name: string;
  cities: string[];
  tags?: string[];
}

export interface RegionPermission {
  regions: string[];
  permissions: string[];
}

// Broadcast Types (for intelligent broadcasting)
export interface BroadcastConfig {
  media: string | number;
  targets: {
    include?: {
      tags?: string[];
      cities?: string[];
      groups?: string[];
      displayIds?: number[];
    };
    exclude?: {
      tags?: string[];
      cities?: string[];
      groups?: string[];
      displayIds?: number[];
    };
  };
  regions?: {
    client_controlled?: string[];
    internal_only?: string[];
  };
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  schedule?: {
    fromDt?: string;
    toDt?: string;
    recurrence?: string;
  };
}

// API Response Types
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
  meta: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
}

// MCP Tool Parameter Types
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
}

// Configuration Types
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
  companyName?: string;
  logoPath?: string;
  geoZones?: Record<string, GeoZone>;
  defaultExcludeCities?: string[];
  regionPermissions?: Record<string, RegionPermission>;
  defaultTags?: string[];
}
