export const PermissionActions = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  VIEW: 'view',
  BULK: 'bulk',
} as const;

export type PermissionActionType =
  (typeof PermissionActions)[keyof typeof PermissionActions];

export const PermissionResources = {
  PERSONAL_ACCESS_TOKEN: 'personal_access_token',
  SESSION: 'session',
  COMMENT: 'comment',
  FAVORITE: 'favorite',
  EPISODE: 'episode',
  MOVIE: 'movie',
  NOTIFICATION: 'notification',
  RATING: 'rating',
  REVIEW_VOTE: 'review_vote',
  PERMISSION: 'permission',
  ROLE: 'role',
  SETTING: 'setting',
  USER: 'user',
  VIEW_LOG: 'view_log',
  WATCH_HISTORY: 'watch_history',
  WATCHLIST: 'watchlist',
  REPORT: 'report',
  ANALYTICS: 'analytics',
} as const;

export type PermissionResourceType =
  (typeof PermissionResources)[keyof typeof PermissionResources];

export type PermissionType =
  `${PermissionResourceType}.${PermissionActionType}`;
