import { Component, effect, input, output, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { WorkoutService } from '../../service/WorkoutService';
import { CreateWorkoutRequest } from '../../model/create-workout-request';
import { Workout } from '../../model/workout';

@Component({
  selector: 'app-workout-form',
  imports: [ReactiveFormsModule],
  templateUrl: './workout-form.html',
  styleUrl: './workout-form.css',
})
export class WorkoutForm {

  workoutCreated = output<void>();
  workoutUpdated = output<void>();
  cancelled = output<void>();

  workoutToEdit = input<Workout | null>(null);

  saving = signal(false);
  errorMessage = signal('');

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

  constructor(private workoutService: WorkoutService) {

    effect(() => {
      const workout = this.workoutToEdit();

      if (!workout) {
        this.form.reset();
        return;
      }

      this.form.patchValue({
        date: workout.date,
        distanceKm: workout.distanceKm,
        durationMinutes: workout.durationSeconds / 60,
        notes: workout.notes ?? ''
      });

      this.errorMessage.set('');
    });
  }

  submit(): void {

    if (this.saving()) {
      return;
    }

    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();

    if (
      values.distanceKm === null ||
      values.durationMinutes === null
    ) {
      return;
    }

    const workoutRequest: CreateWorkoutRequest = {
      date: values.date,
      distanceKm: Number(values.distanceKm),
      durationSeconds: Math.round(
        Number(values.durationMinutes) * 60
      ),
      notes: values.notes
    };

    const workoutToEdit = this.workoutToEdit();

    this.saving.set(true);

    if (workoutToEdit && workoutToEdit.id != null) {

      this.workoutService
        .updateWorkout(workoutToEdit.id, workoutRequest)
        .subscribe({
          next: () => {
            this.saving.set(false);
            this.form.reset();

            this.workoutUpdated.emit();
          },
          error: () => {
            this.saving.set(false);

            this.errorMessage.set(
              'No se pudo actualizar el entrenamiento. Comprueba los datos e inténtalo de nuevo.'
            );
          }
        });

      return;
    }

    this.workoutService
      .createWorkout(workoutRequest)
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.form.reset();

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

  cancel(): void {
    if (this.saving()) {
      return;
    }
    this.form.reset();
    this.errorMessage.set('');
    this.cancelled.emit();
  }
}
