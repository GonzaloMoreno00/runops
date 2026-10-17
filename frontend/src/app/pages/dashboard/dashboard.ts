import { Component, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
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
  formVisible = signal(false);
  workoutForm = viewChild(WorkoutForm);

  selectedMonth = signal(this.getCurrentMonth());

  monthlySummary = signal<MonthlyWorkoutSummary | null>(null);
  summaryLoading = signal(false);
  summaryError = signal('');

  loggingOut = signal(false);
  logoutError = signal('');

  private summarySubscription?: Subscription;
  private workoutsSubscription?: Subscription;
  private focusTimer?: ReturnType<typeof setTimeout>;

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
    this.workoutsSubscription?.unsubscribe();

    this.workouts.set([]);
    this.errorMessage.set('');
    this.loading.set(false);

    const period = this.getSelectedPeriod();

    if (!period) {
      this.errorMessage.set('Selecciona un mes válido para ver los entrenamientos.');
      return;
    }

    this.loading.set(true);

    this.workoutsSubscription = this.workoutService
      .getMonthlyWorkouts(period.year, period.month)
      .subscribe({
        next: (workouts) => {
          this.workouts.set(workouts);
          this.loading.set(false);
        },
        error: (error) => {
          this.loading.set(false);

          this.errorMessage.set(
            error.status === 401
              ? 'Tu sesión ha caducado. Vuelve a iniciar sesión.'
              : 'No se pudieron cargar los entrenamientos. Inténtalo de nuevo más tarde.'
          );
        }
      });
  }

  deleteWorkout(id: number): void {
    if (this.workoutForm()?.saving()) {
      return;
    }

    this.deleteErrorMessage.set('');
    this.successMessage.set('');

    this.workoutService.deleteWorkout(id).subscribe({
      next: () => {

        if (this.editingWorkout()?.id === id) {
          this.closeWorkoutForm();
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

  addWorkout(): void {
    if (this.workoutForm()?.saving()) {
      return;
    }

    this.editingWorkout.set(null);
    this.openWorkoutForm();
  }

  editWorkout(workout: Workout): void {
    if (this.workoutForm()?.saving()) {
      return;
    }

    this.editingWorkout.set(workout);
    this.openWorkoutForm();
  }

  private openWorkoutForm(): void {
    this.successMessage.set('');
    this.deleteErrorMessage.set('');
    this.formVisible.set(true);
    this.scheduleFocus('date');
  }

  closeWorkoutForm(): void {
    this.formVisible.set(false);
    this.editingWorkout.set(null);
    this.scheduleFocus('add-workout-button');
  }

  private scheduleFocus(id: string): void {
    clearTimeout(this.focusTimer);
    this.focusTimer = setTimeout(() => {
      const element = document.getElementById(id);
      element?.focus({ preventScroll: true });
      element?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
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
    this.closeWorkoutForm();
    this.successMessage.set('Entrenamiento guardado correctamente.');
    this.loadWorkouts();
    this.loadMonthlySummary();
  }

  onWorkoutUpdated(): void {
    this.closeWorkoutForm();
    this.successMessage.set('Entrenamiento actualizado correctamente.');
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

    this.successMessage.set('');
    this.deleteErrorMessage.set('');

    this.loadWorkouts();
    this.loadMonthlySummary();
  }

  loadMonthlySummary(): void {
    this.summarySubscription?.unsubscribe();

    this.monthlySummary.set(null);
    this.summaryError.set('');
    this.summaryLoading.set(false);

    const period = this.getSelectedPeriod();

    if (!period) {
      this.summaryError.set('Selecciona un mes válido.');
      return;
    }

    const { year, month } = period;

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
    clearTimeout(this.focusTimer);
    this.summarySubscription?.unsubscribe();
    this.workoutsSubscription?.unsubscribe();
  }

  private getSelectedPeriod(): { year: number; month: number } | null {
    const value = this.selectedMonth();

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
      return null;
    }

    const [year, month] = value.split('-').map(Number);

    if (year < 1 || year > 9999) {
      return null;
    }

    return { year, month };
  }
}
