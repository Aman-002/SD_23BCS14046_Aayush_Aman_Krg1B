import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <span class="logo">🛒</span>
          <h2>Create Account</h2>
          <p>Join FreshMart today</p>
        </div>
        <form *ngIf="!otpMode" (ngSubmit)="sendOtpTrigger()" #f="ngForm">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" [(ngModel)]="form.name" name="name" placeholder="John Doe" required pattern="^[a-zA-Z]+(?: [a-zA-Z]+)*$" #nameRef="ngModel" />
            <div class="validation-error" *ngIf="nameRef.invalid && (nameRef.dirty || nameRef.touched)">
              <small *ngIf="nameRef.errors?.['required']">Full name is required.</small>
              <small *ngIf="nameRef.errors?.['pattern']">Only letters and single spaces between names allowed (no leading/trailing space).</small>
            </div>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="form.email" name="email" placeholder="john@email.com" required pattern="^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.com$" #emailRef="ngModel" />
            <div class="validation-error" *ngIf="emailRef.invalid && (emailRef.dirty || emailRef.touched)">
              <small *ngIf="emailRef.errors?.['required']">Email is required.</small>
              <small *ngIf="emailRef.errors?.['pattern']">Valid email ending in .com is required.</small>
            </div>
          </div>
          <div class="form-group">
            <label>Password (8–13 chars)</label>
            <input type="password" [(ngModel)]="form.password" name="password"
              placeholder="@123Aa format" minlength="8" required pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$" #passwordRef="ngModel" />
            <div class="validation-error" *ngIf="passwordRef.invalid && (passwordRef.dirty || passwordRef.touched)">
              <small *ngIf="passwordRef.errors?.['required']">Password is required.</small>
              <small *ngIf="passwordRef.errors?.['pattern']">Must contain uppercase, lowercase, number, and special character (e.g. &#64;123Aa).</small>
              <small *ngIf="passwordRef.errors?.['minlength']">Minimum 8 characters required.</small>
            </div>
          </div>
          <div class="form-group">
            <label>Contact Number</label>
            <input type="text" [(ngModel)]="form.contact" name="contact" placeholder="9876543210" required pattern="^(?!.*(\\d)\\1{5})[6-9]\\d{9}$" #contactRef="ngModel" />
            <div class="validation-error" *ngIf="contactRef.invalid && (contactRef.dirty || contactRef.touched)">
              <small *ngIf="contactRef.errors?.['required']">Contact number is required.</small>
              <small *ngIf="contactRef.errors?.['pattern']">Must be 10 digits starting with 6-9, without 6 consecutively repeating digits.</small>
            </div>
          </div>
          <div class="form-group">
            <label>Address</label>
            <textarea [(ngModel)]="form.addressLine" name="addressLine" rows="2" placeholder="Your street address" required pattern="^[a-zA-Z0-9\\s.,/]+$" #addressLineRef="ngModel"></textarea>
            <div class="validation-error" *ngIf="addressLineRef.invalid && (addressLineRef.dirty || addressLineRef.touched)">
              <small *ngIf="addressLineRef.errors?.['required']">Address is required.</small>
              <small *ngIf="addressLineRef.errors?.['pattern']">No special chars except . , / allowed.</small>
            </div>
          </div>
          <div class="form-group">
            <label>Pincode</label>
            <input type="text" [(ngModel)]="form.pincode" name="pincode" placeholder="6 digit pincode" required pattern="^[0-9]{6}$" #pincodeRef="ngModel" />
            <div class="validation-error" *ngIf="pincodeRef.invalid && (pincodeRef.dirty || pincodeRef.touched)">
              <small *ngIf="pincodeRef.errors?.['required']">Pincode is required.</small>
              <small *ngIf="pincodeRef.errors?.['pattern']">Pincode must be exactly 6 digits (no characters).</small>
            </div>
          </div>
          <div class="alert alert-success" *ngIf="success">{{ success }}</div>
          <div class="alert alert-error"   *ngIf="error">{{ error }}</div>
          <button type="submit" class="btn-primary" [disabled]="loading || f.invalid">
            {{ loading ? 'Sending OTP...' : 'Send Verification Code' }}
          </button>
        </form>

        <div class="otp-container" *ngIf="otpMode">
           <h3 style="color: #138535; text-align: center; margin-bottom: 12px;">Email Verification</h3>
           <p style="text-align: center; font-size: 13px; color: #666; margin-bottom: 20px;">
             We dispatched a 6-digit verification code to <strong>{{ form.email }}</strong>.
           </p>
           <div class="form-group">
             <input type="text" [(ngModel)]="form.otp" placeholder="Enter 6-digit OTP" required pattern="^[0-9]{6}$" style="text-align: center; font-size: 20px; letter-spacing: 4px;" />
           </div>
           
           <div class="alert alert-success" *ngIf="success">{{ success }}</div>
           <div class="alert alert-error"   *ngIf="error">{{ error }}</div>

           <button type="button" class="btn-primary" (click)="verifyAndRegister()" [disabled]="loading || !form.otp || form.otp.length !== 6">
             {{ loading ? 'Verifying...' : 'Complete Registration' }}
           </button>
           <div style="text-align: center; margin-top: 15px;">
             <a href="javascript:void(0)" (click)="otpMode = false" style="color: #FF8C00; font-size: 13px;">Modify Details</a>
           </div>
        </div>

        <div class="auth-footer" *ngIf="!otpMode">
          Already have an account? <a routerLink="/login">Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper { min-height:100vh; display:flex; align-items:center;
      justify-content:center; background:linear-gradient(135deg,#e8f5e9,#FFF3C4); padding:20px; }
    .auth-card { background:#fff; border-radius:16px; padding:40px 36px;
      width:100%; max-width:440px; box-shadow:0 8px 32px rgba(0,0,0,0.12); }
    .auth-header { text-align:center; margin-bottom:28px; }
    .logo { font-size:48px; }
    .auth-header h2 { margin:8px 0 4px; color:#138535; font-size:24px; }
    .auth-header p { color:#666; font-size:14px; }
    .form-group { margin-bottom:16px; }
    .form-group label { display:block; font-size:13px; font-weight:600;
      color:#333; margin-bottom:6px; }
    .form-group input, .form-group textarea {
      width:100%; padding:10px 14px; border:1.5px solid #ddd;
      border-radius:8px; font-size:14px; box-sizing:border-box;
      transition:border-color 0.2s; outline:none; }
    .form-group input:focus, .form-group textarea:focus { border-color:#FF8C00; }
    .form-group input.ng-invalid.ng-touched, .form-group textarea.ng-invalid.ng-touched { border-color:#d32f2f; }
    .validation-error { color: #d32f2f; margin-top: 4px; display: block; }
    .validation-error small { display: block; font-size: 11px; }
    .btn-primary { width:100%; padding:12px; background:linear-gradient(135deg,#FF8C00,#1b4332);
      color:#fff; border:none; border-radius:8px; font-size:16px;
      font-weight:600; cursor:pointer; margin-top:8px; transition:opacity 0.2s; }
    .btn-primary:hover { opacity:0.9; }
    .btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
    .alert { padding:10px 14px; border-radius:8px; font-size:13px; margin-bottom:12px; }
    .alert-success { background:#e8f5e9; color:#2e7d32; border:1px solid #a5d6a7; }
    .alert-error   { background:#ffebee; color:#c62828; border:1px solid #ef9a9a; }
    .auth-footer { text-align:center; margin-top:20px; font-size:14px; color:#666; }
    .auth-footer a { color:#FF8C00; font-weight:600; text-decoration:none; }
  `]
})
export class RegisterComponent {
  form = { name:'', email:'', password:'', contact:'', addressLine:'', pincode:'', otp: '' };
  loading = false; success = ''; error = '';
  otpMode = false;

  constructor(private auth: AuthService, private router: Router) {}

  sendOtpTrigger() {
    this.error = ''; this.success = ''; this.loading = true;
    this.auth.sendOtp({ email: this.form.email, name: this.form.name }).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.success) {
          this.otpMode = true;
          this.success = res.message;
        } else { this.error = res.message; }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to dispatch email';
      }
    });
  }

  verifyAndRegister() {
    this.error = ''; this.success = ''; this.loading = true;
    
    const payload = {
      name: this.form.name,
      email: this.form.email,
      password: this.form.password,
      contact: this.form.contact,
      address: this.form.addressLine + ' - ' + this.form.pincode,
      otp: this.form.otp
    };

    this.auth.register(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.success) {
          this.success = 'Account created successfully! Redirecting...';
          setTimeout(() => this.router.navigate(['/login']), 1500);
        } else { this.error = res.message; }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Invalid OTP';
      }
    });
  }
}
