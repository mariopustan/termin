import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  form: FormGroup;
  submitting = false;
  error: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/kontakte']);
    }

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting) return;

    this.submitting = true;
    this.error = null;

    const { email, password } = this.form.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.router.navigate(['/admin/kontakte']);
      },
      error: (err) => {
        this.submitting = false;
        if (err.status === 401) {
          this.error = 'E-Mail oder Passwort ist falsch.';
        } else {
          this.error = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
        }
      },
    });
  }
}
