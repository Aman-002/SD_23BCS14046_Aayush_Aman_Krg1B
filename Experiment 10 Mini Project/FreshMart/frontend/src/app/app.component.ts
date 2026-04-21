import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-container">
      <nav class="navbar">
        <div class="nav-brand">
          <img src="assets/logo.png" style="height: 36px; vertical-align: middle; margin-right: 8px;" alt="Logo">
          <span class="brand-text">FreshMart</span>
        </div>
        <div class="nav-links">
          <ng-container *ngIf="!isLoggedIn()">
            <a routerLink="/"          routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
            <a routerLink="/login"     routerLinkActive="active">Login</a>
            <a routerLink="/register"  routerLinkActive="active">Register</a>
            <a routerLink="/admin-login" routerLinkActive="active" style="color: #FFF3C4;">Admin Login</a>
          </ng-container>
          <ng-container *ngIf="isCustomer()">
            <a routerLink="/home"      routerLinkActive="active">Home</a>
            <a routerLink="/products"  routerLinkActive="active">Products</a>
            <a routerLink="/wishlist"  routerLinkActive="active">Wishlist</a>
            <a routerLink="/cart"      routerLinkActive="active">Cart</a>
            <a routerLink="/orders"    routerLinkActive="active">My Orders</a>
            <a routerLink="/profile"   routerLinkActive="active">Profile</a>
          </ng-container>
          <ng-container *ngIf="isAdmin()">
            <a routerLink="/admin"           routerLinkActive="active">Dashboard</a>
            <a routerLink="/admin/products"  routerLinkActive="active">Products</a>
            <a routerLink="/admin/customers" routerLinkActive="active">Customers</a>
            <a routerLink="/admin/orders"    routerLinkActive="active">Orders</a>
            <a routerLink="/admin/coupons"   routerLinkActive="active">Coupons</a>
            <a routerLink="/admin/feedback"  routerLinkActive="active">Feedback</a>
          </ng-container>
          <span class="nav-user" *ngIf="isLoggedIn()">{{ userName() }}</span>
          <button class="btn-logout" *ngIf="isLoggedIn()" (click)="logout()">Logout</button>
        </div>
      </nav>
      <div class="page-wrapper">
        <router-outlet></router-outlet>
      </div>
      <footer class="site-footer">
          <p>© Copyright © 2026 FreshMart. All rights reserved.</p>
          <p>Designed by Aayush Aman</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container { display: flex; flex-direction: column; min-height: 100vh; }
    .navbar {
      background: linear-gradient(135deg, #138535, #FF8C00);
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      position: sticky; top: 0; z-index: 1000;
    }
    .nav-brand { display: flex; align-items: center; gap: 8px; }
    .brand-icon { font-size: 24px; }
    .brand-text { color: #fff; font-size: 20px; font-weight: 700; letter-spacing: 1px; }
    .nav-links { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
    .nav-links a {
      color: #FFF3C4; text-decoration: none; padding: 6px 10px;
      border-radius: 6px; font-size: 13px; font-weight: 500; transition: all 0.2s;
    }
    .nav-links a:hover, .nav-links a.active {
      background: rgba(255,255,255,0.15); color: #fff;
    }
    .nav-user { color: #a5d6a7; font-size: 13px; margin-left: 8px; font-weight: 600; }
    .btn-logout {
      background: #e53935; color: #fff; border: none;
      padding: 6px 14px; border-radius: 6px; cursor: pointer;
      font-size: 13px; font-weight: 600; margin-left: 8px;
    }
    .btn-logout:hover { background: #c62828; }
    .page-wrapper { flex: 1; background: #f5f5f5; }
    .site-footer { text-align: center; padding: 1.5rem; background-color: #fff; color: #666; font-size: 0.9rem; border-top: 1px solid #e0e0e0; }
    .site-footer p { margin-bottom: 0.2rem; }
  `]
})
export class AppComponent {
  constructor(private auth: AuthService, private router: Router) {}
  isLoggedIn() { return this.auth.isLoggedIn(); }
  isCustomer() { return this.auth.isCustomer(); }
  isAdmin()    { return this.auth.isAdmin(); }
  userName()   { return this.auth.getSession()?.name || this.auth.getSession()?.email || ''; }
  logout() { this.auth.logout(); this.router.navigate(['/']); }
}
