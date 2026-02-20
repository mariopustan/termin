import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { Contact } from '../../../../core/models/contact.model';
import { AdminHeaderComponent } from '../../components/admin-header/admin-header.component';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AdminHeaderComponent],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss',
})
export class ContactFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  contactId: string | null = null;
  contact: Contact | null = null;
  loading = false;
  submitting = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly api: ApiService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      phone: ['', [Validators.required, Validators.maxLength(20)]],
      firstName: ['', [Validators.maxLength(100)]],
      lastName: ['', [Validators.maxLength(100)]],
      companyName: ['', [Validators.maxLength(200)]],
      email: ['', [Validators.email, Validators.maxLength(255)]],
    });

    this.contactId = this.route.snapshot.paramMap.get('id');

    if (this.contactId) {
      this.isEdit = true;
      this.loadContact(this.contactId);
    }
  }

  private loadContact(id: string): void {
    this.loading = true;
    this.api.getContact(id).subscribe({
      next: (contact) => {
        this.contact = contact;
        this.form.patchValue({
          phone: contact.phone,
          firstName: contact.firstName || '',
          lastName: contact.lastName || '',
          companyName: contact.companyName || '',
          email: contact.email || '',
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Kontakt konnte nicht geladen werden.';
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting) return;

    this.submitting = true;
    this.error = null;
    this.success = null;

    const data = this.form.value;

    const request$ = this.isEdit && this.contactId
      ? this.api.updateContact(this.contactId, data)
      : this.api.createContact(data);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/admin/kontakte']);
      },
      error: (err) => {
        this.submitting = false;
        if (err.status === 409) {
          this.error = 'Ein Kontakt mit dieser Telefonnummer existiert bereits.';
        } else if (err.status === 404) {
          this.error = 'Kontakt wurde nicht gefunden.';
        } else {
          this.error = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
        }
      },
    });
  }

  getFieldError(fieldName: string): string | null {
    const control = this.form.get(fieldName);
    if (!control || !control.errors || !control.touched) return null;

    const errors: Record<string, Record<string, string>> = {
      phone: {
        required: 'Telefonnummer ist erforderlich',
        maxlength: 'Maximal 20 Zeichen',
      },
      firstName: { maxlength: 'Maximal 100 Zeichen' },
      lastName: { maxlength: 'Maximal 100 Zeichen' },
      companyName: { maxlength: 'Maximal 200 Zeichen' },
      email: {
        email: 'Bitte eine g\u00fcltige E-Mail-Adresse eingeben',
        maxlength: 'Maximal 255 Zeichen',
      },
    };

    const fieldErrors = errors[fieldName] || {};
    const firstErrorKey = Object.keys(control.errors)[0];
    return fieldErrors[firstErrorKey] || 'Ung\u00fcltiger Wert';
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '\u2014';
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
