import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../service/auth.service';
import { LoginRequest } from '../../model/login-request';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Form fields and validation.
  form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  // Component state.
  loading = signal(false);
  errorMessage = signal('');

  submit(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.loading()) {
      return;
    }

    const values = this.form.getRawValue();

    const request: LoginRequest = {
      email: values.email ?? '',
      password: values.password ?? ''
    };

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login(request).subscribe({

      next: () => {
        this.loading.set(false);

        // Redirect to the dashboard after successful login.
        this.router.navigate(['/dashboard']);
      },

      error: (error) => {
        this.loading.set(false);

        if (error.status === 401) {
          this.errorMessage.set(
            'Correo electrónico o contraseña incorrectos.'
          );
        } else {
          this.errorMessage.set(
            'No se pudo iniciar sesión. Inténtalo de nuevo más tarde.'
          );
        }
      }
    });
  }
}
