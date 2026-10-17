export interface MonthlyWorkoutSummary {
  year: number;
  month: number;
  workoutCount: number;
  totalDistanceKm: number;
  totalDurationSeconds: number;
  averagePaceSecondsPerKm: number | null;
}