export interface Workout {
  id?: number;
  date: string;
  distanceKm: number;
  durationSeconds: number;
  averagePaceSecondsPerKm?: number;
  notes?: string;
}