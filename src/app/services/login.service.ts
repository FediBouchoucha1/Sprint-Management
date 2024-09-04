import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private http: HttpClient) {}

  login(userName: string, password: string): Observable<any> {
    const loginData = new URLSearchParams();
    loginData.set('grant_type', 'password');
    loginData.set('username', userName);
    loginData.set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<any>('https://enterprise.barthauer.cloud/KAOS_stage/Token', loginData.toString(), { headers });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.clear();
  }
}
