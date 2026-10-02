
import { Component, OnInit, signal } from '@angular/core';

import { Workout } from '../../workout/model/workout';
import { WorkoutService } from '../../workout/service/WorkoutService';
import { WorkoutForm } from '../../workout/components/workout-form/workout-form';
import { WorkoutHistory } from '../../workout/components/workout-history/workout-history';

@Component({
  selector: 'app-dashboard',
  imports: [WorkoutForm, WorkoutHistory],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  workouts = signal<Workout[]>([]);
  loading = signal(true);
  errorMessage = signal('');

  constructor(private workoutService: WorkoutService) {}

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
}
