import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <h1 class="page-title">👤 My Profile</h1>

      <div class="profile-grid">
        <!-- Update Profile -->
        <div class="card">
          <h2>Update Profile</h2>
          <form (ngSubmit)="updateProfile()">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" [(ngModel)]="profile.name" name="name" />
            </div>
            <div class="form-group">
              <label>Contact</label>
              <input type="text" [(ngModel)]="profile.contact" name="contact" />
            </div>
            <div class="form-group">
              <label>Address</label>
              <textarea [(ngModel)]="profile.address" name="address" rows="3"></textarea>
            </div>
            <div class="alert alert-success" *ngIf="profileMsg">{{ profileMsg }}</div>
            <div class="alert alert-error"   *ngIf="profileErr">{{ profileErr }}</div>
            <button type="submit" class="btn-primary">Update Profile</button>
          </form>
        </div>

        <!-- Change Password -->
        <div class="card">
          <h2>Change Password</h2>
          <form (ngSubmit)="changePassword()">
            <div class="form-group">
              <label>Old Password</label>
              <input type="password" [(ngModel)]="pwd.old" name="old" />
            </div>
            <div class="form-group">
              <label>New Password (8–13 chars)</label>
              <input type="password" [(ngModel)]="pwd.new" name="new" minlength="8" maxlength="13" />
            </div>
            <div class="form-group">
              <label>Confirm New Password</label>
              <input type="password" [(ngModel)]="pwd.confirm" name="confirm" />
            </div>
            <div class="alert alert-success" *ngIf="pwdMsg">{{ pwdMsg }}</div>
            <div class="alert alert-error"   *ngIf="pwdErr">{{ pwdErr }}</div>
            <button type="submit" class="btn-primary">Change Password</button>
          </form>
        </div>

        <!-- Danger Zone -->
        <div class="card danger-card">
          <h2>⚠️ Danger Zone</h2>
          <p>Deactivating your account will prevent you from logging in. You can restore it anytime.</p>
          <div class="alert alert-success" *ngIf="deactMsg">{{ deactMsg }}</div>
          <button class="btn-danger" (click)="deactivate()">Deactivate Account</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding:32px 40px; }
    .page-title { font-size:24px; color:#138535; margin-bottom:28px; }
    .profile-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(320px,1fr)); gap:24px; }
    .card { background:#fff; border-radius:14px; padding:28px;
      box-shadow:0 2px 14px rgba(0,0,0,0.08); }
    .card h2 { font-size:17px; color:#138535; margin:0 0 20px; font-weight:700; }
    .form-group { margin-bottom:16px; }
    .form-group label { display:block; font-size:13px; font-weight:600; color:#333; margin-bottom:6px; }
    .form-group input, .form-group textarea {
      width:100%; padding:10px 14px; border:1.5px solid #ddd;
      border-radius:8px; font-size:14px; box-sizing:border-box; outline:none; }
    .form-group input:focus, .form-group textarea:focus { border-color:#FF8C00; }
    .btn-primary { width:100%; padding:11px; background:linear-gradient(135deg,#FF8C00,#1b4332);
      color:#fff; border:none; border-radius:8px; font-weight:600; cursor:pointer; font-size:14px; }
    .btn-danger { width:100%; padding:11px; background:#e53935;
      color:#fff; border:none; border-radius:8px; font-weight:600; cursor:pointer; font-size:14px; }
    .danger-card { border:2px solid #ffcdd2; }
    .danger-card p { font-size:13px; color:#666; margin-bottom:20px; }
    .alert { padding:10px 14px; border-radius:8px; font-size:13px; margin-bottom:12px; }
    .alert-success { background:#e8f5e9; color:#2e7d32; border:1px solid #a5d6a7; }
    .alert-error   { background:#ffebee; color:#c62828; border:1px solid #ef9a9a; }
  `]
})
export class ProfileComponent implements OnInit {
  user: any;
  profile = { name: '', contact: '', address: '' };
  pwd = { old: '', new: '', confirm: '' };
  profileMsg = ''; profileErr = '';
  pwdMsg = '';     pwdErr = '';
  deactMsg = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.user = this.auth.getSession();
    this.profile.name = this.user.name || '';
  }

  updateProfile() {
    this.profileMsg = ''; this.profileErr = '';
    this.auth.updateCustomer(this.user.customerId, this.profile).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.profileMsg = 'Profile updated successfully!';
          const updated = { ...this.auth.getSession(), name: this.profile.name };
          this.auth.saveSession(updated);
        } else { this.profileErr = res.message; }
      },
      error: (err: any) => this.profileErr = err.error?.message || 'Update failed'
    });
  }

  changePassword() {
    this.pwdMsg = ''; this.pwdErr = '';
    if (this.pwd.new !== this.pwd.confirm) {
      this.pwdErr = 'Password fields are not matching !!!'; return;
    }
    this.auth.changePassword(this.user.loginId, {
      oldPassword: this.pwd.old, newPassword: this.pwd.new
    }).subscribe({
      next: (res: any) => {
        if (res.success) { this.pwdMsg = res.message; this.pwd = { old:'', new:'', confirm:'' }; }
        else { this.pwdErr = res.message; }
      },
      error: (err: any) => this.pwdErr = err.error?.message || 'Change failed'
    });
  }

  deactivate() {
    if (!confirm('Are you sure? You will be logged out.')) return;
    this.auth.deactivate(this.user.loginId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.deactMsg = 'Account deactivated. Logging out...';
          setTimeout(() => { this.auth.logout(); this.router.navigate(['/']); }, 2000);
        }
      },
      error: () => {}
    });
  }
}
