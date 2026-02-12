import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ProductInterest, PRODUCT_LABELS } from '../../../../core/models/booking.model';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.scss',
})
export class ConfirmationComponent implements OnInit {
  bookingId = '';
  productLabel = '';
  dateFormatted = '';
  timeFormatted = '';
  zoomJoinUrl = '';

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.bookingId = params['bookingId'] || '';
    this.zoomJoinUrl = params['zoom'] || '';

    const product = params['product'] as ProductInterest;
    this.productLabel = PRODUCT_LABELS[product] || product;

    const slotStart = params['slot'];
    if (slotStart) {
      const date = new Date(slotStart);
      this.dateFormatted = format(date, 'EEEE, dd. MMMM yyyy', { locale: de });
      this.timeFormatted = format(date, 'HH:mm');
    }
  }
}
