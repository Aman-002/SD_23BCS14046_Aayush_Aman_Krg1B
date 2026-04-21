import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = 'http://localhost:8080/api/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private http: HttpClient) {}

  register(data: any): Observable<any> {
    return this.http.post(`${BASE}/register`, data);
  }

  sendOtp(data: {email: string, name: string}): Observable<any> {
    return this.http.post(`${BASE}/send-otp`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${BASE}/login`, data);
  }

  changePassword(loginId: number, body: any): Observable<any> {
    return this.http.put(`${BASE}/change-password/${loginId}`, body);
  }

  updateCustomer(customerId: number, body: any): Observable<any> {
    return this.http.put(`${BASE}/customer/${customerId}`, body);
  }

  deactivate(loginId: number): Observable<any> {
    return this.http.put(`${BASE}/deactivate/${loginId}`, {});
  }

  forgotPassword(body: any): Observable<any> {
    return this.http.put(`${BASE}/forgot-password`, body);
  }

  restore(email: string): Observable<any> {
    return this.http.put(`${BASE}/restore`, { email });
  }

  getAllCustomers(): Observable<any> {
    return this.http.get(`${BASE}/customers`);
  }

  // ── Session helpers ───────────────────────────────────────────────────────
  saveSession(user: any): void {
    localStorage.setItem('grocery_user', JSON.stringify(user));
  }

  getSession(): any {
    const s = localStorage.getItem('grocery_user');
    return s ? JSON.parse(s) : null;
  }

  logout(): void {
    localStorage.removeItem('grocery_user');
  }

  isLoggedIn(): boolean {
    return !!this.getSession();
  }

  isAdmin(): boolean {
    const u = this.getSession();
    return u && u.userType === 'Admin';
  }

  isCustomer(): boolean {
    const u = this.getSession();
    return u && u.userType === 'Customer';
  }
}
