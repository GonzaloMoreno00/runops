import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Workout } from '../model/workout';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {

  private readonly apiUrl = 'http://localhost:8080/api/workouts';

  constructor(private http: HttpClient) {
  }

  getAllWorkouts(): Observable<Workout[]> {
    return this.http.get<Workout[]>(this.apiUrl);
  }

  getWorkoutById(id: number): Observable<Workout> {
    return this.http.get<Workout>(`${this.apiUrl}/${id}`);
  }

  createWorkout(workout: Workout): Observable<Workout> {
    return this.http.post<Workout>(this.apiUrl, workout);
  }
}