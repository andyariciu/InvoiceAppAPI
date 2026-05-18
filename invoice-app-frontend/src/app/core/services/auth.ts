import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {


  private http = inject(HttpClient);

  private apiUrl = 'https://localhost:7195/api/Auth';

  register(data: any) {
    return this.http.post(`${this.apiUrl}/register`, data);
  }
  login(data: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, data)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('refreshToken', response.refreshToken);
        })
      );
  }
  refreshToken(data: any) {
  return this.http.post<any>(
    `${this.apiUrl}/refresh`,
    data
  );
  }
}
