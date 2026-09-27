import { Component, OnInit, signal } from '@angular/core';

import { Workout } from './workout/model/workout';
import { WorkoutService } from './workout/service/WorkoutService';
import { WorkoutForm } from './workout/components/workout-form/workout-form';

@Component({
  selector: 'app-root',
  imports: [WorkoutForm],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
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