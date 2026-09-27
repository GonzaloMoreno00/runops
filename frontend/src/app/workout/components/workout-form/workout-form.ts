import { Component, output, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Workout } from '../../model/workout';
import { WorkoutService } from '../../service/WorkoutService';

@Component({
  selector: 'app-workout-form',
  imports: [ReactiveFormsModule],
  templateUrl: './workout-form.html',
  styleUrl: './workout-form.css',
})
export class WorkoutForm {
  workoutCreated = output<void>();

  saving = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  form = new FormGroup({
    date: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    distanceKm: new FormControl<number | null>(null, {
      validators: [
        Validators.required,
        Validators.min(0.01)
      ]
    }),
    durationMinutes: new FormControl<number | null>(null, {
      validators: [
        Validators.required,
        Validators.min(1)
      ]
    }),
    notes: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(1000)]
    })
  });

  constructor(private workoutService: WorkoutService) {}

  submit(): void {
    if (this.saving()) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();

    if (values.distanceKm === null || values.durationMinutes === null) {
      return;
    }

    const workout: Workout = {
      date: values.date,
      distanceKm: values.distanceKm,
      durationSeconds: Math.round(values.durationMinutes * 60),
      notes: values.notes.trim()
    };

    this.saving.set(true);

    this.workoutService.createWorkout(workout).subscribe({
      next: () => {
        this.saving.set(false);
        this.form.reset();
        this.successMessage.set('Entrenamiento guardado correctamente.');
        this.workoutCreated.emit();
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set(
          'No se pudo guardar el entrenamiento. Comprueba los datos e inténtalo de nuevo.'
        );
      }
    });
  }
}