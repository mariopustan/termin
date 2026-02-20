import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SlotsResponse, SlotsRangeResponse } from '../models/time-slot.model';
import {
  BookingRequest,
  BookingResponse,
  CancellationInfo,
} from '../models/booking.model';
import { Contact, ContactListResponse, ContactRequest } from '../models/contact.model';

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

  // ─── Contact Admin API ──────────────────────

  getContacts(search?: string, page = 1, limit = 20): Observable<ContactListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<ContactListResponse>(`${this.baseUrl}/contacts`, { params });
  }

  getContact(id: string): Observable<Contact> {
    return this.http.get<Contact>(`${this.baseUrl}/contacts/${id}`);
  }

  createContact(data: ContactRequest): Observable<Contact> {
    return this.http.post<Contact>(`${this.baseUrl}/contacts/create`, data);
  }

  updateContact(id: string, data: Partial<ContactRequest>): Observable<Contact> {
    return this.http.patch<Contact>(`${this.baseUrl}/contacts/${id}`, data);
  }

  deleteContact(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/contacts/${id}`);
  }
}
