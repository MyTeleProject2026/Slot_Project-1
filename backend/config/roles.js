const ROLES = {
  USER: 'user',
  EMPLOYEE: 'employee',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  MAIN_ADMIN: 'main_admin'
};

const PERMISSIONS = {
  // User Management
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  BLOCK_USERS: 'block_users',
  // Admin Management
  VIEW_ADMINS: 'view_admins',
  CREATE_ADMINS: 'create_admins',
  EDIT_ADMINS: 'edit_admins',
  DELETE_ADMINS: 'delete_admins',
  MANAGE_ADMIN_BALANCE: 'manage_admin_balance',
  // Transactions
  VIEW_TRANSACTIONS: 'view_transactions',
  APPROVE_DEPOSITS: 'approve_deposits',
  APPROVE_WITHDRAWALS: 'approve_withdrawals',
  PROCESS_TRANSACTIONS: 'process_transactions',
  // Games
  VIEW_GAMES: 'view_games',
  CONTROL_GAMES: 'control_games',
  ADJUST_RTP: 'adjust_rtp',
  ADJUST_WIN_RATE: 'adjust_win_rate',
  // System
  VIEW_SYSTEM: 'view_system',
  EDIT_SYSTEM: 'edit_system',
  VIEW_REPORTS: 'view_reports',
  EDIT_REPORTS: 'edit_reports',
  // Chat
  VIEW_CHAT: 'view_chat',
  REPLY_CHAT: 'reply_chat',
  MANAGE_CHAT: 'manage_chat',
  // All
  ALL: 'all'
};

const ROLE_PERMISSIONS = {
  [ROLES.MAIN_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.BLOCK_USERS,
    PERMISSIONS.VIEW_ADMINS,
    PERMISSIONS.CREATE_ADMINS,
    PERMISSIONS.EDIT_ADMINS,
    PERMISSIONS.VIEW_TRANSACTIONS,
    PERMISSIONS.APPROVE_DEPOSITS,
    PERMISSIONS.APPROVE_WITHDRAWALS,
    PERMISSIONS.VIEW_GAMES,
    PERMISSIONS.CONTROL_GAMES,
    PERMISSIONS.ADJUST_RTP,
    PERMISSIONS.ADJUST_WIN_RATE,
    PERMISSIONS.VIEW_SYSTEM,
    PERMISSIONS.EDIT_SYSTEM,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_CHAT,
    PERMISSIONS.REPLY_CHAT,
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.BLOCK_USERS,
    PERMISSIONS.VIEW_TRANSACTIONS,
    PERMISSIONS.APPROVE_DEPOSITS,
    PERMISSIONS.APPROVE_WITHDRAWALS,
    PERMISSIONS.VIEW_GAMES,
    PERMISSIONS.ADJUST_RTP,
    PERMISSIONS.ADJUST_WIN_RATE,
    PERMISSIONS.VIEW_CHAT,
    PERMISSIONS.REPLY_CHAT,
  ],
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_TRANSACTIONS,
    PERMISSIONS.VIEW_GAMES,
    PERMISSIONS.VIEW_CHAT,
    PERMISSIONS.REPLY_CHAT,
  ],
  [ROLES.USER]: []
};

const hasPermission = (role, permission) => {
  if (role === ROLES.MAIN_ADMIN) return true;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission) || permissions.includes(PERMISSIONS.ALL);
};

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission
};
