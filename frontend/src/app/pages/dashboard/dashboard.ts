import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { DecimalPipe } from '@angular/common';
import { Subscription } from 'rxjs';

import { AuthService } from '../../auth/service/auth.service';
import { Workout } from '../../workout/model/workout';
import { WorkoutService } from '../../workout/service/WorkoutService';
import { WorkoutForm } from '../../workout/components/workout-form/workout-form';
import { WorkoutHistory } from '../../workout/components/workout-history/workout-history';
import { MonthlyWorkoutSummary } from '../../workout/model/monthly-workout-summary';

@Component({
  selector: 'app-dashboard',
  imports: [WorkoutForm, WorkoutHistory, RouterLink, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {

  workouts = signal<Workout[]>([]);
  loading = signal(true);
  errorMessage = signal('');
  successMessage = signal('');
  deleteErrorMessage = signal('');
  editingWorkout = signal<Workout | null>(null);

  selectedMonth = signal(this.getCurrentMonth());

  monthlySummary = signal<MonthlyWorkoutSummary | null>(null);
  summaryLoading = signal(false);
  summaryError = signal('');

  loggingOut = signal(false);
  logoutError = signal('');

  private summarySubscription?: Subscription;

  constructor(
    private workoutService: WorkoutService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadWorkouts();
    this.loadMonthlySummary();
  }

  loadWorkouts(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.workoutService.getAllWorkouts().subscribe({
      next: (workouts) => {
        this.workouts.set(workouts);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set(
          'No se pudieron cargar los entrenamientos. Inténtalo de nuevo más tarde.'
        );
        this.loading.set(false);
      }
    });
  }

  deleteWorkout(id: number): void {

    this.deleteErrorMessage.set('');
    this.successMessage.set('');

    this.workoutService.deleteWorkout(id).subscribe({
      next: () => {

        if (this.editingWorkout()?.id === id) {
          this.editingWorkout.set(null);
        }

        this.successMessage.set(
          'Entrenamiento eliminado correctamente.'
        );

        this.loadWorkouts();
        this.loadMonthlySummary();
      },
      error: () => {
        this.deleteErrorMessage.set(
          'No se pudo eliminar el entrenamiento. Inténtalo de nuevo.'
        );
      }
    });
  }

  editWorkout(workout: Workout): void {
    this.editingWorkout.set(workout);

    setTimeout(() => {
      document
        .getElementById('workout-form-section')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
    });
  }

  logout(): void {

    if (this.loggingOut()) {
      return;
    }

    this.loggingOut.set(true);
    this.logoutError.set('');

    this.authService.logout().subscribe({
      next: () => {
        this.loggingOut.set(false);
        this.router.navigate(['/']);
      },
      error: () => {
        this.loggingOut.set(false);
        this.logoutError.set(
          'No se pudo cerrar la sesión. Inténtalo de nuevo.'
        );
      }
    });
  }

  onWorkoutCreated(): void {
    this.editingWorkout.set(null);
    this.loadWorkouts();
    this.loadMonthlySummary();
  }

  onWorkoutUpdated(): void {
    this.editingWorkout.set(null);
    this.loadWorkouts();
    this.loadMonthlySummary();
  }

  private getCurrentMonth(): string {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');

    return `${year}-${month}`;
  }

  onMonthChange(value: string): void {
    this.selectedMonth.set(value);
    this.loadMonthlySummary();
  }

  loadMonthlySummary(): void {
    this.summarySubscription?.unsubscribe();

    this.monthlySummary.set(null);
    this.summaryError.set('');
    this.summaryLoading.set(false);

    const selectedMonth = this.selectedMonth();

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(selectedMonth)) {
      this.summaryError.set('Selecciona un mes válido.');
      return;
    }

    const [year, month] = selectedMonth.split('-').map(Number);

    if (year < 1 || year > 9999) {
      this.summaryError.set('El año debe estar entre 1 y 9999.');
      return;
    }

    this.summaryLoading.set(true);

    this.summarySubscription = this.workoutService
      .getMonthlySummary(year, month)
      .subscribe({
        next: (summary) => {
          this.monthlySummary.set(summary);
          this.summaryLoading.set(false);
        },
        error: (error) => {
          this.summaryLoading.set(false);

          this.summaryError.set(
            error.status === 401
              ? 'Tu sesión ha caducado. Vuelve a iniciar sesión.'
              : 'No se pudo cargar el resumen. Inténtalo de nuevo.'
          );
        }
      });
  }

  formatDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours} h ${minutes} min ${seconds} s`;
  }

  formatPace(secondsPerKm: number | null): string {
    if (secondsPerKm === null) {
      return '—';
    }

    const minutes = Math.floor(secondsPerKm / 60);
    const seconds = secondsPerKm % 60;

    return `${minutes}:${String(seconds).padStart(2, '0')} min/km`;
  }

  ngOnDestroy(): void {
    this.summarySubscription?.unsubscribe();
  }
}
