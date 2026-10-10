import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../auth/service/auth.service';
import { Workout } from '../../workout/model/workout';
import { WorkoutService } from '../../workout/service/WorkoutService';
import { WorkoutForm } from '../../workout/components/workout-form/workout-form';
import { WorkoutHistory } from '../../workout/components/workout-history/workout-history';

@Component({
  selector: 'app-dashboard',
  imports: [WorkoutForm, WorkoutHistory, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  workouts = signal<Workout[]>([]);
  loading = signal(true);
  errorMessage = signal('');
  successMessage = signal('');

  loggingOut = signal(false);
  logoutError = signal('');

  constructor(
    private workoutService: WorkoutService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadWorkouts();
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

    this.errorMessage.set('');
    this.successMessage.set('');

    this.workoutService.deleteWorkout(id).subscribe({
      next: () => {
        this.successMessage.set(
          'Entrenamiento eliminado correctamente.'
        );

        this.loadWorkouts();
      },
      error: () => {
        this.errorMessage.set(
          'No se pudo eliminar el entrenamiento. Inténtalo de nuevo.'
        );
      }
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
}
