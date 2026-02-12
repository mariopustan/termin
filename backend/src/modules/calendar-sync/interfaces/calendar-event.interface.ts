export interface CalendarEvent {
  uid: string;
  summary: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
  source: CalendarSource;
}

export interface BusyPeriod {
  start: Date;
  end: Date;
  source: CalendarSource;
  eventUid?: string;
  eventSummary?: string;
}

export enum CalendarSource {
  NEXTCLOUD = 'nextcloud',
  ICLOUD = 'icloud',
}

export enum SyncStatus {
  PENDING = 'pending',
  SYNCING = 'syncing',
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface CalendarSyncState {
  calendarType: string;
  lastSyncAt: Date | null;
  lastSuccessfulSyncAt: Date | null;
  lastCtag: string | null;
  eventsCount: number;
  status: SyncStatus;
  errorMessage: string | null;
  consecutiveErrors: number;
}
