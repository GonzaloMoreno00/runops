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

  @Output()
  workoutEdited = new EventEmitter<Workout>();

  formatSeconds(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  editWorkout(workout: Workout): void {
    this.workoutEdited.emit(workout);
  }

  deleteWorkout(id: number): void {

    const confirmed = window.confirm('¿Seguro que quieres eliminar este entrenamiento?');

    if (!confirmed) {
      return;
    }

    this.workoutDeleted.emit(id);
  }
}