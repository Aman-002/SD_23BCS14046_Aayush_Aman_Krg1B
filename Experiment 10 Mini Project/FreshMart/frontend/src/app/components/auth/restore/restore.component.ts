import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-restore',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <span class="logo">🔐</span>
          <h2>Forgot Password</h2>
          <p>Reset your password to regain access</p>
        </div>
        
        <!-- Step 1: Request OTP -->
        <form (ngSubmit)="onRequestOtp()" *ngIf="step === 1" #f1="ngForm">
          <div class="form-group">
            <label>Registered Email</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="you@email.com" required pattern="^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,4}$" #emailRef="ngModel" />
            <div class="validation-error" *ngIf="emailRef.invalid && (emailRef.dirty || emailRef.touched)">
              <small *ngIf="emailRef.errors?.['required']">Email is required.</small>
              <small *ngIf="emailRef.errors?.['pattern']">Please enter a valid email address.</small>
            </div>
          </div>
          <div class="alert alert-success" *ngIf="success">{{ success }}</div>
          <div class="alert alert-error"   *ngIf="error">{{ error }}</div>
          <button type="submit" class="btn-primary" [disabled]="loading || f1.invalid">
            {{ loading ? 'Sending OTP...' : 'Send OTP' }}
          </button>
        </form>

        <!-- Step 2: Verify OTP and set New Password -->
        <form (ngSubmit)="onResetPassword()" *ngIf="step === 2" #f2="ngForm">
          <div class="form-group">
            <label>Email</label>
            <input type="email" [value]="email" disabled />
          </div>
          <div class="form-group">
            <label>Enter 6-Digit OTP</label>
            <input type="text" [(ngModel)]="otp" name="otp" placeholder="123456" required pattern="^[0-9]{6}$" #otpRef="ngModel" />
            <div class="validation-error" *ngIf="otpRef.invalid && (otpRef.dirty || otpRef.touched)">
              <small *ngIf="otpRef.errors?.['required']">OTP is required.</small>
              <small *ngIf="otpRef.errors?.['pattern']">OTP must be 6 digits.</small>
            </div>
          </div>
          <div class="form-group">
            <label>New Password</label>
            <input type="password" [(ngModel)]="newPassword" name="newPassword" placeholder="8-13 characters" required minlength="8" maxlength="13" #pwdRef="ngModel" />
            <div class="validation-error" *ngIf="pwdRef.invalid && (pwdRef.dirty || pwdRef.touched)">
               <small *ngIf="pwdRef.errors?.['required']">Password is required.</small>
               <small *ngIf="pwdRef.errors?.['minlength']">Password must be at least 8 characters.</small>
            </div>
          </div>
          <div class="alert alert-success" *ngIf="success">{{ success }}</div>
          <div class="alert alert-error"   *ngIf="error">{{ error }}</div>
          <button type="submit" class="btn-primary" [disabled]="loading || f2.invalid">
            {{ loading ? 'Resetting...' : 'Verify & Reset Password' }}
          </button>
        </form>

        <div class="auth-footer">
          <a routerLink="/login">Back to Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper { min-height:100vh; display:flex; align-items:center;
      justify-content:center; background:linear-gradient(135deg,#e8f5e9,#FFF3C4); }
    .auth-card { background:#fff; border-radius:16px; padding:40px 36px;
      width:100%; max-width:400px; box-shadow:0 8px 32px rgba(0,0,0,0.12); }
    .auth-header { text-align:center; margin-bottom:28px; }
    .logo { font-size:48px; }
    .auth-header h2 { margin:8px 0 4px; color:#138535; font-size:24px; }
    .auth-header p { color:#666; font-size:14px; }
    .form-group { margin-bottom:18px; }
    .form-group label { display:block; font-size:13px; font-weight:600; color:#333; margin-bottom:6px; }
    .form-group input { width:100%; padding:10px 14px; border:1.5px solid #ddd;
      border-radius:8px; font-size:14px; box-sizing:border-box; outline:none; }
    .form-group input:focus { border-color:#FF8C00; }
    .form-group input:disabled { background:#f5f5f5; color:#888; cursor:not-allowed; }
    .validation-error { color: #d32f2f; margin-top: 4px; display: block; }
    .validation-error small { display: block; font-size: 11px; }
    .btn-primary { width:100%; padding:12px; background:linear-gradient(135deg,#FF8C00,#1b4332);
      color:#fff; border:none; border-radius:8px; font-size:16px; font-weight:600; cursor:pointer; }
    .btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
    .alert { padding:10px 14px; border-radius:8px; font-size:13px; margin-bottom:12px; }
    .alert-success { background:#e8f5e9; color:#2e7d32; border:1px solid #a5d6a7; }
    .alert-error   { background:#ffebee; color:#c62828; border:1px solid #ef9a9a; }
    .auth-footer { text-align:center; margin-top:20px; font-size:14px; }
    .auth-footer a { color:#FF8C00; font-weight:600; text-decoration:none; }
  `]
})
export class RestoreComponent {
  step = 1;
  email = '';
  otp = '';
  newPassword = '';
  loading = false;
  success = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onRequestOtp() {
    this.error = ''; this.success = ''; this.loading = true;
    this.auth.sendOtp({ email: this.email, name: 'Customer' }).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.success) {
          this.success = res.message;
          this.step = 2;
          setTimeout(() => this.success = '', 3000);
        } else {
          this.error = res.message;
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to send OTP';
      }
    });
  }

  onResetPassword() {
    this.error = ''; this.success = ''; this.loading = true;
    this.auth.forgotPassword({ email: this.email, otp: this.otp, newPassword: this.newPassword }).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.success) {
          this.success = res.message;
          setTimeout(() => this.router.navigate(['/login']), 1800);
        } else {
          this.error = res.message;
        }
      },
      error: (err: any) => {
        this.loading = false;
        console.error("Forgot Password Error:", err);
        if (err.status === 404) {
          this.error = 'API endpoint not found. Please RESTART your Spring Boot backend so it loads the new code!';
        } else {
          this.error = err.error?.message || `Password reset failed (Status: ${err.status})`;
        }
      }
    });
  }
}
