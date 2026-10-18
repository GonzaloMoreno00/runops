import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';

import { LoginRequest } from '../model/login-request';
import { RegisterRequest } from '../model/register-request';
import { AuthUser } from '../model/auth-user';

// Structure returned by Spring Security's CSRF endpoint.
interface CsrfResponse {
  headerName: string;
  parameterName: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = '/api/auth';

  register(request: RegisterRequest): Observable<AuthUser> {
    return this.http.post<AuthUser>(
      `${this.apiUrl}/register`,
      request,
      { withCredentials: true }
    );
  }

  login(request: LoginRequest): Observable<AuthUser> {

    return this.getCsrfToken().pipe(
      switchMap(csrf => {

        return this.http.post<AuthUser>(
          `${this.apiUrl}/login`,
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

  getCurrentUser(): Observable<AuthUser> {
    return this.http.get<AuthUser>(
      `${this.apiUrl}/me`,
      { withCredentials: true }
    );
  }

  logout(): Observable<void> {

    return this.getCsrfToken().pipe(
      switchMap(csrf => {

        return this.http.post<void>(
          `${this.apiUrl}/logout`,
          {},
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

  private getCsrfToken(): Observable<CsrfResponse> {
    return this.http.get<CsrfResponse>(
      `${this.apiUrl}/csrf`,
      { withCredentials: true }
    );
  }
}
