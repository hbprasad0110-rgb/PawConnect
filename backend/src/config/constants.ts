export const appConfig = {
  name: 'PawConnect',
  serviceName: 'pawconnect-api',
  apiPrefix: '/api',
  jsonBodyLimit: '1mb',
  auth: {
    cookieName: 'pc_token',
    tokenLifetime: '8h',
    sessionDurationMs: 8 * 60 * 60 * 1000,
    passwordResetLifetimeMs: 30 * 60 * 1000,
    passwordResetCooldownMs: 60 * 1000,
  },
  database: {
    poolMin: 0,
    poolMax: 10,
  },
  animals: {
    defaultPageSize: 20,
    maximumPageSize: 50,
  },
  appointments: {
    closedWeekday: 0,
    openingHour: 10,
    closingHour: 18,
  },
} as const;
