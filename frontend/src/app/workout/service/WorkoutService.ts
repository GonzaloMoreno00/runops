import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';

import { Workout } from '../model/workout';
import { CreateWorkoutRequest } from '../model/create-workout-request';
import { MonthlyWorkoutSummary } from '../model/monthly-workout-summary';
interface CsrfResponse {
  headerName: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {

  private readonly apiUrl = '/api/workouts';
  private readonly authUrl = '/api/auth';

  constructor(private http: HttpClient) {
  }

  getAllWorkouts(): Observable<Workout[]> {
    return this.http.get<Workout[]>(
      this.apiUrl,
      { withCredentials: true }
    );
  }

  getWorkoutById(id: number): Observable<Workout> {
    return this.http.get<Workout>(
      `${this.apiUrl}/${id}`,
      { withCredentials: true }
    );
  }

  createWorkout(request: CreateWorkoutRequest): Observable<Workout> {
    return this.http.get<CsrfResponse>(
      `${this.authUrl}/csrf`,
      { withCredentials: true }
    ).pipe(
      switchMap(csrf => {
        return this.http.post<Workout>(
          this.apiUrl,
          request,
          {
            withCredentials: true,
            headers: {
              [csrf.headerName]: csrf.token
            }
          }
        );
      })
    );
  }

  deleteWorkout(id: number): Observable<void> {
    return this.http.get<CsrfResponse>(
      `${this.authUrl}/csrf`,
      { withCredentials: true }
    ).pipe(
      switchMap(csrf => {
        return this.http.delete<void>(
          `${this.apiUrl}/${id}`,
          {
            withCredentials: true,
            headers: {
              [csrf.headerName]: csrf.token
            }
          }
        );
      })
    );
  }

  updateWorkout(
    id: number,
    request: CreateWorkoutRequest
  ): Observable<Workout> {

    return this.http
      .get<CsrfResponse>(
        `${this.authUrl}/csrf`,
        { withCredentials: true }
      )
      .pipe(
        switchMap(csrf =>
          this.http.put<Workout>(
            `${this.apiUrl}/${id}`,
            request,
            {
              withCredentials: true,
              headers: {
                [csrf.headerName]: csrf.token
              }
            }
          )
        )
      );
  }

  getMonthlySummary(
    year: number,
    month: number
  ): Observable<MonthlyWorkoutSummary> {
    return this.http.get<MonthlyWorkoutSummary>(
      `${this.apiUrl}/summary`,
      {
        params: {
          year,
          month
        },
        withCredentials: true
      }
    );
  }

  getMonthlyWorkouts(
    year: number,
    month: number
  ): Observable<Workout[]> {
    return this.http.get<Workout[]>(
      this.apiUrl,
      {
        params: {
          year,
          month
        },
        withCredentials: true
      }
    );
  }
}
