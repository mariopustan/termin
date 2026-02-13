import { Routes } from '@angular/router';

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
  {
    path: '**',
    redirectTo: '',
  },
];
