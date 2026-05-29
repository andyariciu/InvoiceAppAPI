import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {


  private http = inject(HttpClient);

  private apiUrl = 'https://localhost:7195/api/Auth';

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }
  login(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/login`,
      data,
      {
        withCredentials: true
      }
    );
  }
  refreshToken(): Observable<any> {
  return this.http.post<any>(
    `${this.apiUrl}/refresh`,
    {},
      {
        withCredentials: true
      });
  }
  logout() {
  return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }
}
