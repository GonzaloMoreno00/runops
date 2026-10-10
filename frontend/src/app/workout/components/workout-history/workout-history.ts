import { Component, EventEmitter, Output, input } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Workout } from '../../model/workout';

@Component({
  selector: 'app-workout-history',
  imports: [DatePipe],
  templateUrl: './workout-history.html',
  styleUrl: './workout-history.css',
})
export class WorkoutHistory {

  workouts = input<Workout[]>([]);
  loading = input(false);
  errorMessage = input('');

  @Output()
  workoutDeleted = new EventEmitter<number>();

  formatSeconds(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  deleteWorkout(id: number): void {

    const confirmed = window.confirm('¿Seguro que quieres eliminar este entrenamiento?');

    if (!confirmed) {
      return;
    }

    this.workoutDeleted.emit(id);
  }
}