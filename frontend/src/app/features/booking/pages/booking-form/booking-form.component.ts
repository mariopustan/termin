import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ApiService } from '../../../../core/services/api.service';
import {
  ProductInterest,
  PRODUCT_LABELS,
  BookingRequest,
} from '../../../../core/models/booking.model';


@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.scss',
})
export class BookingFormComponent implements OnInit {
  form!: FormGroup;
  selectedProduct: ProductInterest | null = null;
  selectedSlotStart: string | null = null;
  productLabel = '';
  dateFormatted = '';
  timeFormatted = '';
  submitting = false;
  error: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly api: ApiService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.selectedProduct = params['product'] as ProductInterest;
    this.selectedSlotStart = params['slot'];

    if (!this.selectedProduct || !this.selectedSlotStart) {
      this.router.navigate(['/']);
      return;
    }

    this.productLabel = PRODUCT_LABELS[this.selectedProduct];

    const slotDate = new Date(this.selectedSlotStart);
    this.dateFormatted = format(slotDate, 'EEEE, dd. MMMM yyyy', { locale: de });
    this.timeFormatted = format(slotDate, 'HH:mm');

    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      companyName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      phone: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50), Validators.pattern(/^\+?[\d\s\-()]+$/)]],
      message: ['', [Validators.maxLength(1000)]],
      consentGiven: [false, [Validators.requiredTrue]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting) return;

    this.submitting = true;
    this.error = null;

    const booking: BookingRequest = {
      ...this.form.value,
      productInterest: this.selectedProduct,
      slotStart: this.selectedSlotStart,
    };

    this.api.createBooking(booking).subscribe({
      next: (response) => {
        this.router.navigate(['/bestaetigung'], {
          queryParams: {
            bookingId: response.data.bookingId,
            product: this.selectedProduct,
            slot: response.data.slotStart,
            zoom: response.data.zoomJoinUrl,
          },
        });
      },
      error: (err) => {
        this.submitting = false;
        if (err.status === 409) {
          this.error =
            'Dieser Termin ist leider nicht mehr verfuegbar. Bitte waehlen Sie einen anderen Zeitpunkt.';
        } else if (err.status === 429) {
          this.error = 'Zu viele Anfragen. Bitte warten Sie einen Moment.';
        } else {
          this.error = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
        }
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  getFieldError(fieldName: string): string | null {
    const control = this.form.get(fieldName);
    if (!control || !control.errors || !control.touched) return null;

    const errors: Record<string, Record<string, string>> = {
      firstName: {
        required: 'Vorname ist erforderlich',
        minlength: 'Mindestens 2 Zeichen',
      },
      lastName: {
        required: 'Nachname ist erforderlich',
        minlength: 'Mindestens 2 Zeichen',
      },
      companyName: {
        required: 'Unternehmen ist erforderlich',
        minlength: 'Mindestens 2 Zeichen',
      },
      email: {
        required: 'E-Mail ist erforderlich',
        email: 'Bitte geben Sie eine gueltige E-Mail ein',
      },
      phone: {
        required: 'Telefonnummer ist erforderlich',
        minlength: 'Mindestens 6 Zeichen',
        pattern: 'Bitte geben Sie eine gueltige Nummer ein',
      },
      consentGiven: {
        required: 'Bitte stimmen Sie der Datenschutzerklaerung zu',
      },
    };

    const fieldErrors = errors[fieldName] || {};
    const firstErrorKey = Object.keys(control.errors)[0];
    return fieldErrors[firstErrorKey] || 'Ungueltiger Wert';
  }
}
