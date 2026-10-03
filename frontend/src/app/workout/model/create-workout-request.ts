export interface CreateWorkoutRequest {
  date: string;
  distanceKm: number;
  durationSeconds: number;
  notes?: string | null;
}
