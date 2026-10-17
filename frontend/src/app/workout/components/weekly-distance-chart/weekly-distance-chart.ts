import { Component, computed, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { Workout } from '../../model/workout';
import { calculateWeeklyDistances } from '../../utils/weekly-distance';

@Component({
  selector: 'app-weekly-distance-chart',
  imports: [DecimalPipe],
  templateUrl: './weekly-distance-chart.html',
  styleUrl: './weekly-distance-chart.css'
})
export class WeeklyDistanceChart {
  month = input.required<string>();
  workouts = input<Workout[]>([]);
  loading = input(false);
  errorMessage = input('');
  retry = output<void>();

  weeks = computed(() => calculateWeeklyDistances(this.month(), this.workouts()));
  maximumDistance = computed(() => Math.max(1, ...this.weeks().map(week => week.distanceKm)));
  hasDistance = computed(() => this.weeks().some(week => week.distanceKm > 0));
}
