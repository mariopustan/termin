import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { CancellationInfo, PRODUCT_LABELS, ProductInterest } from '../../../../core/models/booking.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-cancellation',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './cancellation.component.html',
  styleUrl: './cancellation.component.scss',
})
export class CancellationComponent implements OnInit {
  token = '';
  loading = true;
  cancelling = false;
  cancelled = false;
  error: string | null = null;
  bookingInfo: CancellationInfo['data'] | null = null;
  productLabel = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiService,
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.params['token'];
    this.loadBookingInfo();
  }

  confirmCancellation(): void {
    this.cancelling = true;
    this.error = null;

    this.api.cancelBooking(this.token).subscribe({
      next: () => {
        this.cancelled = true;
        this.cancelling = false;
      },
      error: (err) => {
        this.cancelling = false;
        this.error = err.error?.error?.message || 'Stornierung fehlgeschlagen. Bitte versuchen Sie es erneut.';
      },
    });
  }

  private loadBookingInfo(): void {
    this.api.getCancellationInfo(this.token).subscribe({
      next: (response) => {
        this.bookingInfo = response.data;
        this.productLabel = PRODUCT_LABELS[response.data.productInterest] || response.data.productInterest;
        this.loading = false;
      },
      error: () => {
        this.error = 'Buchung nicht gefunden oder bereits storniert.';
        this.loading = false;
      },
    });
  }
}
