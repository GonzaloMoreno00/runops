import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../service/auth.service';
import { RegisterRequest } from '../../model/register-request';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  form = this.formBuilder.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

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

    const request: RegisterRequest = {
      name: values.name ?? '',
      email: values.email ?? '',
      password: values.password ?? ''
    };

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.register(request).subscribe({

      next: () => {
        this.loading.set(false);

        // Registration does not automatically authenticate the user.
        this.router.navigate(['/login']);
      },

      error: (error) => {
        this.loading.set(false);

        if (error.status === 409) {
          this.errorMessage.set(
            'Ya existe una cuenta registrada con este correo electrónico.'
          );
        } else if (error.status === 400) {
          this.errorMessage.set(
            'Revisa los datos introducidos e inténtalo de nuevo.'
          );
        } else {
          this.errorMessage.set(
            'No se pudo completar el registro. Inténtalo de nuevo más tarde.'
          );
        }
      }
    });
  }
}
