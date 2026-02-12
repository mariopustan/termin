export interface TimeSlot {
  start: string;
  end: string;
}

export interface DaySlots {
  date: string;
  dayOfWeek: string;
  slots: TimeSlot[];
  totalAvailable: number;
}

export interface SlotsResponse {
  data: DaySlots;
  meta: {
    lastSyncAt: string | null;
    timezone: string;
  };
}

export interface SlotsRangeResponse {
  data: DaySlots[];
  meta: {
    lastSyncAt: string | null;
    timezone: string;
    from: string;
    to: string;
  };
}
