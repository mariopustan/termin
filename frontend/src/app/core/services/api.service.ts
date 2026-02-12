import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SlotsResponse, SlotsRangeResponse } from '../models/time-slot.model';
import {
  BookingRequest,
  BookingResponse,
  CancellationInfo,
} from '../models/booking.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = '/api/v1';

  constructor(private readonly http: HttpClient) {}

  getSlots(date: string): Observable<SlotsResponse> {
    const params = new HttpParams().set('date', date);
    return this.http.get<SlotsResponse>(`${this.baseUrl}/slots`, { params });
  }

  getSlotsRange(from: string, to: string): Observable<SlotsRangeResponse> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<SlotsRangeResponse>(`${this.baseUrl}/slots/range`, {
      params,
    });
  }

  createBooking(booking: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(
      `${this.baseUrl}/bookings`,
      booking,
    );
  }

  getCancellationInfo(token: string): Observable<CancellationInfo> {
    return this.http.get<CancellationInfo>(
      `${this.baseUrl}/bookings/cancel/${token}`,
    );
  }

  cancelBooking(token: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/bookings/cancel/${token}`,
      {},
    );
  }
}
