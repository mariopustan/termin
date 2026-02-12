import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.APP_PORT || '3000', 10),
  environment: process.env.NODE_ENV || 'development',
  timezone: 'Europe/Berlin',
  corsOrigin: process.env.CORS_ORIGIN || 'https://termin.demo-itw.de',
}));

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'salesfunnel',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'salesfunnel',
}));

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || '',
}));

export const caldavConfig = registerAs('caldav', () => ({
  nextcloud: {
    serverUrl: process.env.NEXTCLOUD_CALDAV_URL || '',
    username: process.env.NEXTCLOUD_USERNAME || '',
    password: process.env.NEXTCLOUD_APP_PASSWORD || '',
    calendarName: process.env.NEXTCLOUD_CALENDAR_NAME || 'personal',
  },
  icloud: {
    serverUrl: 'https://caldav.icloud.com',
    username: process.env.ICLOUD_APPLE_ID || '',
    password: process.env.ICLOUD_APP_PASSWORD || '',
    calendarName: process.env.ICLOUD_CALENDAR_NAME || '',
  },
  syncIntervalMinutes: parseInt(process.env.CALDAV_SYNC_INTERVAL || '2', 10),
  lookAheadDays: parseInt(process.env.CALDAV_LOOK_AHEAD_DAYS || '14', 10),
}));

export const zoomConfig = registerAs('zoom', () => ({
  accountId: process.env.ZOOM_ACCOUNT_ID || '',
  clientId: process.env.ZOOM_CLIENT_ID || '',
  clientSecret: process.env.ZOOM_CLIENT_SECRET || '',
  userId: process.env.ZOOM_USER_ID || 'me',
}));

export const mailConfig = registerAs('mail', () => ({
  host: process.env.MAIL_HOST || 'localhost',
  port: parseInt(process.env.MAIL_PORT || '587', 10),
  user: process.env.MAIL_USER || '',
  password: process.env.MAIL_PASSWORD || '',
  from: process.env.MAIL_FROM || 'noreply@demo-itw.de',
  internalRecipient: process.env.MAIL_INTERNAL_RECIPIENT || '',
}));

export const slotConfig = registerAs('slot', () => ({
  durationMinutes: 30,
  dayStartHour: 9,
  dayStartMinute: 30,
  dayEndHour: 16,
  dayEndMinute: 0,
  minAdvanceHours: parseInt(process.env.SLOT_MIN_ADVANCE_HOURS || '2', 10),
  maxAdvanceDays: parseInt(process.env.SLOT_MAX_ADVANCE_DAYS || '14', 10),
}));
