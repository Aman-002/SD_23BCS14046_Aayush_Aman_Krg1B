import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./components/landing/landing.component').then(m => m.LandingComponent),
    pathMatch: 'full' 
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin-login',
    loadComponent: () => import('./components/auth/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./components/auth/restore/restore.component').then(m => m.RestoreComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'products',
    loadComponent: () => import('./components/products/product-list/product-list.component').then(m => m.ProductListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'cart',
    loadComponent: () => import('./components/cart/cart.component').then(m => m.CartComponent),
    canActivate: [authGuard]
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./components/wishlist/wishlist.component').then(m => m.WishlistComponent),
    canActivate: [authGuard]
  },
  {
    path: 'payment',
    loadComponent: () => import('./components/payment/payment.component').then(m => m.PaymentComponent),
    canActivate: [authGuard]
  },
  {
    path: 'orders',
    loadComponent: () => import('./components/orders/order-history/order-history.component').then(m => m.OrderHistoryComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  // ── Admin Routes ──────────────────────────────────────────────────────────
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/products',
    loadComponent: () => import('./components/admin/manage-products/manage-products.component').then(m => m.ManageProductsComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/customers',
    loadComponent: () => import('./components/admin/manage-customers/manage-customers.component').then(m => m.ManageCustomersComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/orders',
    loadComponent: () => import('./components/admin/manage-orders/manage-orders.component').then(m => m.ManageOrdersComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/coupons',
    loadComponent: () => import('./components/admin/manage-coupons/manage-coupons.component').then(m => m.ManageCouponsComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/feedback',
    loadComponent: () => import('./components/admin/manage-feedback/manage-feedback.component').then(m => m.ManageFeedbackComponent),
    canActivate: [adminGuard]
  },
  { path: '**', redirectTo: '/home' }
];
