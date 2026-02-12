import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { format, addDays, startOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import { ApiService } from '../../../../core/services/api.service';
import {
  ProductInterest,
  PRODUCT_LABELS,
  PRODUCT_DESCRIPTIONS,
} from '../../../../core/models/booking.model';
import { DaySlots, TimeSlot } from '../../../../core/models/time-slot.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

interface ProductCard {
  id: ProductInterest;
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-slot-picker',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './slot-picker.component.html',
  styleUrl: './slot-picker.component.scss',
})
export class SlotPickerComponent implements OnInit {
  products: ProductCard[] = [
    {
      id: ProductInterest.ENTERPRISE_API,
      label: PRODUCT_LABELS[ProductInterest.ENTERPRISE_API],
      description: PRODUCT_DESCRIPTIONS[ProductInterest.ENTERPRISE_API],
      icon: '{ }',
    },
    {
      id: ProductInterest.HR_PAYROLL_INTEGRATION,
      label: PRODUCT_LABELS[ProductInterest.HR_PAYROLL_INTEGRATION],
      description: PRODUCT_DESCRIPTIONS[ProductInterest.HR_PAYROLL_INTEGRATION],
      icon: '200+',
    },
    {
      id: ProductInterest.PORTALE,
      label: PRODUCT_LABELS[ProductInterest.PORTALE],
      description: PRODUCT_DESCRIPTIONS[ProductInterest.PORTALE],
      icon: 'Portal',
    },
    {
      id: ProductInterest.PAYROLL_SCANNER,
      label: PRODUCT_LABELS[ProductInterest.PAYROLL_SCANNER],
      description: PRODUCT_DESCRIPTIONS[ProductInterest.PAYROLL_SCANNER],
      icon: 'Scan',
    },
  ];

  selectedProduct: ProductInterest | null = null;
  weekDays: DaySlots[] = [];
  currentWeekStart: Date = new Date();
  selectedSlot: TimeSlot | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private readonly api: ApiService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const today = new Date();
    this.currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    if (today > this.currentWeekStart) {
      this.currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    }
  }

  selectProduct(product: ProductInterest): void {
    this.selectedProduct = product;
    this.selectedSlot = null;
    this.loadWeekSlots();
  }

  previousWeek(): void {
    const prevStart = addDays(this.currentWeekStart, -7);
    const today = startOfWeek(new Date(), { weekStartsOn: 1 });
    if (prevStart >= today) {
      this.currentWeekStart = prevStart;
      this.loadWeekSlots();
    }
  }

  nextWeek(): void {
    const nextStart = addDays(this.currentWeekStart, 7);
    const maxDate = addDays(new Date(), 14);
    if (nextStart <= maxDate) {
      this.currentWeekStart = nextStart;
      this.loadWeekSlots();
    }
  }

  canGoPrevious(): boolean {
    const prevStart = addDays(this.currentWeekStart, -7);
    const today = startOfWeek(new Date(), { weekStartsOn: 1 });
    return prevStart >= today;
  }

  canGoNext(): boolean {
    const nextStart = addDays(this.currentWeekStart, 7);
    const maxDate = addDays(new Date(), 14);
    return nextStart <= maxDate;
  }

  selectSlot(slot: TimeSlot): void {
    this.selectedSlot = slot;
  }

  confirmSelection(): void {
    if (!this.selectedProduct || !this.selectedSlot) return;

    this.router.navigate(['/buchen'], {
      queryParams: {
        product: this.selectedProduct,
        slot: this.selectedSlot.start,
      },
    });
  }

  formatTime(isoString: string): string {
    const date = new Date(isoString);
    return format(date, 'HH:mm');
  }

  formatDayHeader(dateStr: string): string {
    const date = new Date(dateStr + 'T12:00:00');
    return format(date, 'EEE', { locale: de });
  }

  formatDayDate(dateStr: string): string {
    const date = new Date(dateStr + 'T12:00:00');
    return format(date, 'dd.MM.', { locale: de });
  }

  getWeekLabel(): string {
    const end = addDays(this.currentWeekStart, 4);
    return `${format(this.currentWeekStart, 'dd.MM.', { locale: de })} - ${format(end, 'dd.MM.yyyy', { locale: de })}`;
  }

  isSelectedSlot(slot: TimeSlot): boolean {
    return this.selectedSlot?.start === slot.start;
  }

  private loadWeekSlots(): void {
    this.loading = true;
    this.error = null;
    this.weekDays = [];

    const weekEnd = addDays(this.currentWeekStart, 4);
    const from = format(this.currentWeekStart, 'yyyy-MM-dd');
    const to = format(weekEnd, 'yyyy-MM-dd');

    // Build full Mon-Fri date list manually
    const allWeekDays: string[] = [];
    for (let i = 0; i < 5; i++) {
      allWeekDays.push(format(addDays(this.currentWeekStart, i), 'yyyy-MM-dd'));
    }

    const DAY_NAMES: Record<number, string> = {
      0: 'Sonntag', 1: 'Montag', 2: 'Dienstag', 3: 'Mittwoch',
      4: 'Donnerstag', 5: 'Freitag', 6: 'Samstag',
    };

    this.api.getSlotsRange(from, to).subscribe({
      next: (response) => {
        try {
          const apiDays = response.data || [];
          // Build a lookup map from the API response
          const dayMap: Record<string, DaySlots> = {};
          for (const day of apiDays) {
            dayMap[day.date] = day;
          }

          // Fill in all 5 weekdays, using API data where available
          this.weekDays = allWeekDays.map((dateStr) => {
            if (dayMap[dateStr]) {
              return dayMap[dateStr];
            }
            const dayIndex = new Date(dateStr + 'T12:00:00').getDay();
            return {
              date: dateStr,
              dayOfWeek: DAY_NAMES[dayIndex] || '',
              slots: [],
              totalAvailable: 0,
            };
          });
        } catch (e) {
          console.error('Error processing slots response:', e);
          this.error = 'Fehler beim Verarbeiten der Termine.';
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = 'Termine konnten nicht geladen werden. Bitte versuchen Sie es erneut.';
        this.loading = false;
        this.cdr.markForCheck();
        console.error('Failed to load slots:', err);
      },
    });
  }
}
