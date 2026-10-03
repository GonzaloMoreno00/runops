export interface Workout {
  id: number;
  date: string;
  distanceKm: number;
  durationSeconds: number;
  averagePaceSecondsPerKm: number | null;
  notes: string | null;
}
