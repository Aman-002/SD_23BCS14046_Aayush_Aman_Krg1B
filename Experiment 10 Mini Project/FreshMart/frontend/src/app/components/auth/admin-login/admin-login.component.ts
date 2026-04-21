import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <img src="assets/logo.png" style="height: 60px; margin-bottom: 10px;" alt="Logo">
          <h2>Admin Portal</h2>
          <p>Secure login for administrators</p>
        </div>
        <form (ngSubmit)="onSubmit()" #f="ngForm">
          <div class="form-group">
            <label>Admin Email</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="admin@grocery.com" required pattern="^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,4}$" #emailRef="ngModel" />
            <div class="validation-error" *ngIf="emailRef.invalid && (emailRef.dirty || emailRef.touched)">
              <small *ngIf="emailRef.errors?.['required']">Email is required.</small>
              <small *ngIf="emailRef.errors?.['pattern']">Please enter a valid email address.</small>
            </div>
          </div>
          <div class="form-group">
            <label>Master Password</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="Passphrase" required minlength="8" #passwordRef="ngModel" />
            <div class="validation-error" *ngIf="passwordRef.invalid && (passwordRef.dirty || passwordRef.touched)">
              <small *ngIf="passwordRef.errors?.['required']">Password is required.</small>
            </div>
          </div>
          <div class="alert alert-error" *ngIf="error">{{ error }}</div>
          <button type="submit" class="btn-primary" [disabled]="loading || f.invalid">
            {{ loading ? 'Authenticating...' : 'Login as Admin' }}
          </button>
        </form>
        <div class="auth-footer">
          <a routerLink="/login">&#8592; Back to User Login</a>
        </div>
        <div class="demo-box">
          <strong>Secure Credentials</strong><br>
          admin&#64;grocery.com / Admin&#64;123
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper { min-height:100vh; display:flex; align-items:center;
      justify-content:center; 
      background: linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('/assets/universal.jpg');
      background-size: cover; background-position: center; background-attachment: fixed; }
    .auth-card { background:#fff; border-radius:16px; padding:40px 36px;
      width:100%; max-width:400px; box-shadow:0 8px 32px rgba(0,0,0,0.3); border-top: 5px solid #d32f2f; }
    .auth-header { text-align:center; margin-bottom:28px; }
    .auth-header h2 { margin:8px 0 4px; color:#d32f2f; font-size:24px; }
    .auth-header p { color:#666; font-size:14px; }
    .form-group { margin-bottom:18px; }
    .form-group label { display:block; font-size:13px; font-weight:600; color:#333; margin-bottom:6px; }
    .form-group input { width:100%; padding:10px 14px; border:1.5px solid #ddd;
      border-radius:8px; font-size:14px; box-sizing:border-box; outline:none; transition:border-color 0.2s; }
    .form-group input:focus { border-color:#d32f2f; }
    .form-group input.ng-invalid.ng-touched { border-color:#d32f2f; }
    .validation-error { color: #d32f2f; margin-top: 4px; display: block; }
    .validation-error small { display: block; font-size: 11px; }
    .btn-primary { width:100%; padding:12px; background:linear-gradient(135deg,#e53935,#c62828);
      color:#fff; border:none; border-radius:8px; font-size:16px;
      font-weight:600; cursor:pointer; transition:opacity 0.2s; }
    .btn-primary:hover { opacity:0.9; }
    .btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
    .alert-error { background:#ffebee; color:#c62828; border:1px solid #ef9a9a;
      padding:10px 14px; border-radius:8px; font-size:13px; margin-bottom:12px; }
    .auth-footer { text-align:center; margin-top:20px; font-size:14px; }
    .auth-footer a { color:#c62828; font-weight:600; text-decoration:none; margin:0 4px; }
    .demo-box { margin-top:16px; background:#fafafa; border-radius:8px;
      padding:12px; font-size:12px; color:#555; text-align:center; line-height:1.6; border: 1px dashed #ccc; }
  `]
})
export class AdminLoginComponent {
  email = ''; password = ''; loading = false; error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.error = ''; this.loading = true;
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.success) {
          if (res.data.userType !== 'Admin') {
            this.error = 'Access denied. You do not have administrator privileges.';
            return;
          }
          this.auth.saveSession(res.data);
          this.router.navigate(['/admin']);
        } else { this.error = res.message; }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed';
      }
    });
  }
}
