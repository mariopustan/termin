import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/booking/pages/slot-picker/slot-picker.component').then(
        (m) => m.SlotPickerComponent,
      ),
  },
  {
    path: 'buchen',
    loadComponent: () =>
      import('./features/booking/pages/booking-form/booking-form.component').then(
        (m) => m.BookingFormComponent,
      ),
  },
  {
    path: 'bestaetigung',
    loadComponent: () =>
      import('./features/booking/pages/confirmation/confirmation.component').then(
        (m) => m.ConfirmationComponent,
      ),
  },
  {
    path: 'stornierung/:token',
    loadComponent: () =>
      import('./features/booking/pages/cancellation/cancellation.component').then(
        (m) => m.CancellationComponent,
      ),
  },
  {
    path: 'datenschutz',
    loadComponent: () =>
      import('./features/booking/pages/privacy-policy/privacy-policy.component').then(
        (m) => m.PrivacyPolicyComponent,
      ),
  },
  // ─── Admin Routes ──────────────────────
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./features/admin/pages/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'admin/kontakte',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/pages/contact-list/contact-list.component').then(
        (m) => m.ContactListComponent,
      ),
  },
  {
    path: 'admin/kontakte/neu',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/pages/contact-form/contact-form.component').then(
        (m) => m.ContactFormComponent,
      ),
  },
  {
    path: 'admin/kontakte/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/pages/contact-form/contact-form.component').then(
        (m) => m.ContactFormComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
