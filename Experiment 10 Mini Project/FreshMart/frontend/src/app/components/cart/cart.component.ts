import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/api.services';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h1 class="page-title">My Cart</h1>

      <div class="toast toast-success" *ngIf="toast">{{ toast }}</div>
      <div class="toast toast-error"   *ngIf="toastErr">{{ toastErr }}</div>

      <div class="cart-layout" *ngIf="cartItems.length > 0; else emptyCart">
        <!-- Items -->
        <div class="cart-items">
          <div class="cart-row" *ngFor="let item of cartItems">
            <div class="item-icon">{{ getEmoji(item.product.productName) }}</div>
            <div class="item-info">
              <h3>{{ item.product.productName }}</h3>
              <p class="item-company">{{ item.product.companyName }}</p>
              <p class="item-price">&#8377;{{ getEffective(item.product) | number:'1.2-2' }} each</p>
            </div>
            <div class="item-qty">
              <button (click)="updateQty(item, item.quantity - 1)">&#8722;</button>
              <span>{{ item.quantity }}</span>
              <button (click)="updateQty(item, item.quantity + 1)">+</button>
            </div>
            <div class="item-subtotal">&#8377;{{ getEffective(item.product) * item.quantity | number:'1.2-2' }}</div>
            <button class="btn-remove" (click)="remove(item.id)">Remove</button>
          </div>
        </div>

        <!-- Summary -->
        <div class="cart-summary">
          <h2>Order Summary</h2>
          <div class="summary-row" *ngFor="let item of cartItems">
            <span>{{ item.product.productName }} &times; {{ item.quantity }}</span>
            <span>&#8377;{{ getEffective(item.product) * item.quantity | number:'1.2-2' }}</span>
          </div>
          <hr>
          <div class="summary-total">
            <span>Total</span>
            <span>&#8377;{{ grandTotal | number:'1.2-2' }}</span>
          </div>

          <!-- COD notice -->
          <div class="cod-notice" *ngIf="grandTotal > 1000">
            COD not available for orders above &#8377;1,000
          </div>

          <!-- Payment method icons -->
          <div class="payment-badges">
            <span class="badge">UPI</span>
            <span class="badge">Card</span>
            <span class="badge" [class.muted]="grandTotal > 1000">COD</span>
          </div>

          <button class="btn-order" (click)="goPayment()">
            Proceed to Payment
          </button>
          <p class="secure-note">Safe &amp; Secure Checkout</p>
        </div>
      </div>

      <ng-template #emptyCart>
        <div class="empty-state">
          <span>Empty</span>
          <p>Your cart is empty</p>
          <button class="btn-shop" (click)="goShop()">Start Shopping</button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .page { padding:32px 40px; }
    .page-title { font-size:24px; color:#138535; margin-bottom:28px; }
    .cart-layout { display:grid; grid-template-columns:1fr 340px; gap:28px; align-items:start; }
    .cart-items { display:flex; flex-direction:column; gap:16px; }
    .cart-row { background:#fff; border-radius:12px; padding:16px 20px;
      display:flex; align-items:center; gap:16px; box-shadow:0 2px 10px rgba(0,0,0,0.07); }
    .item-icon { font-size:40px; min-width:56px; text-align:center; }
    .item-info { flex:1; }
    .item-info h3 { font-size:15px; font-weight:700; margin:0 0 4px; color:#222; }
    .item-company { font-size:12px; color:#888; margin:0 0 2px; }
    .item-price { font-size:13px; color:#FF8C00; font-weight:600; margin:0; }
    .item-qty { display:flex; align-items:center; gap:10px; }
    .item-qty button { width:28px; height:28px; border-radius:50%;
      border:2px solid #FF8C00; background:#fff; color:#FF8C00;
      font-size:18px; font-weight:700; cursor:pointer; }
    .item-qty span { font-size:16px; font-weight:700; min-width:20px; text-align:center; }
    .item-subtotal { font-size:16px; font-weight:800; color:#138535; min-width:80px; text-align:right; }
    .btn-remove { background:none; border:none; font-size:20px; cursor:pointer;
      color:#e53935; padding:4px 8px; border-radius:6px; transition:background 0.2s; }
    .btn-remove:hover { background:#ffebee; }
    .cart-summary { background:#fff; border-radius:14px; padding:24px;
      box-shadow:0 2px 16px rgba(0,0,0,0.09); position:sticky; top:80px; }
    .cart-summary h2 { font-size:18px; color:#138535; margin:0 0 20px; }
    .summary-row { display:flex; justify-content:space-between;
      font-size:13px; color:#555; margin-bottom:8px; }
    hr { border:none; border-top:1.5px solid #eee; margin:16px 0; }
    .summary-total { display:flex; justify-content:space-between;
      font-size:18px; font-weight:800; color:#138535; margin-bottom:14px; }
    .cod-notice { background:#fff3e0; border-radius:8px; padding:8px 12px;
      font-size:12px; color:#e65100; margin-bottom:12px; }
    .payment-badges { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:16px; }
    .badge { font-size:11px; background:#f0fdf4; color:#FF8C00;
      border:1px solid #bbf7d0; border-radius:20px; padding:3px 10px; font-weight:600; }
    .badge.muted { background:#f5f5f5; color:#bbb; border-color:#eee; }
    .btn-order { width:100%; padding:14px;
      background:linear-gradient(135deg,#FF8C00,#1b4332);
      color:#fff; border:none; border-radius:10px; font-size:16px;
      font-weight:700; cursor:pointer; transition:opacity 0.2s; }
    .secure-note { text-align:center; font-size:12px; color:#888; margin:10px 0 0; }
    .empty-state { text-align:center; padding:80px 40px; }
    .empty-state span { font-size:64px; }
    .empty-state p { font-size:20px; color:#aaa; margin:12px 0 24px; }
    .btn-shop { background:#FF8C00; color:#fff; border:none; padding:12px 28px;
      border-radius:8px; font-size:15px; font-weight:600; cursor:pointer; }
    .toast { position:fixed; top:80px; right:24px; padding:12px 20px;
      border-radius:10px; font-weight:600; font-size:14px; z-index:9999;
      box-shadow:0 4px 16px rgba(0,0,0,0.15); }
    .toast-success { background:#1b5e20; color:#fff; }
    .toast-error   { background:#b71c1c; color:#fff; }
  `]
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  toast = ''; toastErr = '';
  user: any;

  constructor(
    private cartSvc: CartService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.auth.getSession();
    this.loadCart();
  }

  loadCart() {
    this.cartSvc.getCart(this.user.customerId).subscribe((res: any) => {
      if (res.success) this.cartItems = res.data;
    });
  }

  get grandTotal(): number {
    return this.cartItems.reduce((sum, item) =>
      sum + this.getEffective(item.product) * item.quantity, 0);
  }

  getEffective(p: any): number { return p.price * (1 - p.discount / 100); }

  updateQty(item: any, qty: number) {
    if (qty < 0) return;
    this.cartSvc.updateItem(item.id, qty).subscribe((res: any) => {
      if (res.success) this.loadCart();
    });
  }

  remove(id: number) {
    this.cartSvc.removeItem(id).subscribe(() => this.loadCart());
  }

  goPayment() { this.router.navigate(['/payment']); }
  goShop()    { this.router.navigate(['/products']); }

  showToast(msg: string) { this.toast = msg; setTimeout(() => this.toast = '', 3000); }
  showErr(msg: string)   { this.toastErr = msg; setTimeout(() => this.toastErr = '', 3000); }

  getEmoji(name: string): string {
    const map: any = { milk:'🥛', rice:'🍚', bread:'🍞', juice:'🍊', egg:'🥚',
      oil:'🫙', butter:'🧈', yogurt:'🍶', chicken:'🍗', vegetable:'🥦' };
    const key = Object.keys(map).find(k => name?.toLowerCase().includes(k));
    return key ? map[key] : '🛒';
  }
}
