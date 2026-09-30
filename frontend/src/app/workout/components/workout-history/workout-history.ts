import { Component, input } from '@angular/core';

import { Workout } from '../../model/workout';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-workout-history',
  imports: [DatePipe],
  templateUrl: './workout-history.html',
  styleUrl: './workout-history.css',
})
export class WorkoutHistory {
  formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

  workouts = input<Workout[]>([]);
  loading = input(false);
  errorMessage = input('');
}