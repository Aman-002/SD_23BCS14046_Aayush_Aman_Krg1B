import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService, CartService } from '../../../services/api.services';
import { AuthService } from '../../../services/auth.service';

interface TrackingStep {
  label:    string;
  icon:     string;
  detail:   string;
  done:     boolean;
  active:   boolean;
}

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h1 class="page-title">My Orders</h1>

      <div class="toast toast-success" *ngIf="toast">{{ toast }}</div>
      <div class="toast toast-error"   *ngIf="toastErr">{{ toastErr }}</div>

      <div class="empty-state" *ngIf="orders.length === 0">
        <span>No Orders Found</span>
        <p>No orders yet. Start shopping!</p>
      </div>

      <div class="order-card" *ngFor="let order of orders">

        <!-- ── Order header ────────────────────────────────────────── -->
        <div class="order-header">
          <div>
            <span class="order-id">{{ order.orderId }}</span>
            <span class="order-date">{{ order.orderDate | date:'dd MMM yyyy, HH:mm' }}</span>
          </div>
          <div class="order-right">
            <span class="badge placed"
              [class.cancelled]="order.status === 'Cancelled'">
              {{ order.status }}
            </span>
            <span class="pay-method" *ngIf="order.paymentMethod">
              {{ order.paymentMethod }}
            </span>
            <span class="pay-status"
              [class.paid]="order.paymentStatus === 'Paid'"
              [class.cod]="order.paymentStatus === 'COD'">
              {{ order.paymentStatus === 'COD' ? 'Pay on Delivery' : 'Paid' }}
            </span>
            <span class="order-total">&#8377;{{ order.total | number:'1.2-2' }}</span>
            <button class="btn-track"
              (click)="order._trackOpen = !order._trackOpen">
              {{ order._trackOpen ? 'Hide Tracking' : 'Track Order' }}
            </button>
            <button class="btn-reorder" (click)="reorder(order)" [disabled]="order._reordering">
              {{ order._reordering ? '...' : 'Reorder' }}
            </button>
            <button class="btn-cancel-order"
              *ngIf="canCancel(order) && order.status !== 'Cancelled'"
              (click)="cancelOrder(order)" [disabled]="order._cancelling">
              {{ order._cancelling ? '...' : 'Cancel' }}
            </button>
          </div>
        </div>

        <!-- ── Dummy Tracking Timeline ─────────────────────────────── -->
        <div class="tracking-panel" *ngIf="order._trackOpen">
          <div class="track-header">
            <span class="track-title">Order Tracking</span>
            <span class="track-eta">{{ getEta(order) }}</span>
          </div>

          <div class="timeline">
            <div class="tl-step" *ngFor="let step of getTracking(order); let last = last">
              <div class="tl-left">
                <div class="tl-dot"
                  [class.done]="step.done"
                  [class.active]="step.active">
                  <span *ngIf="step.done">&#10003;</span>
                  <span *ngIf="step.active && !step.done">&#9679;</span>
                </div>
                <div class="tl-line" *ngIf="!last" [class.done]="step.done"></div>
              </div>
              <div class="tl-body" [class.active]="step.active" [class.done]="step.done">
                <div class="tl-icon">{{ step.icon }}</div>
                <div class="tl-text">
                  <div class="tl-label">{{ step.label }}</div>
                  <div class="tl-detail">{{ step.detail }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Current status banner -->
          <div class="status-banner" [class.delivered]="isDelivered(order)">
            <span *ngIf="!isDelivered(order)">
              {{ getCurrentStepLabel(order) }} — Estimated: {{ getEta(order) }}
            </span>
            <span *ngIf="isDelivered(order)">
              Your order has been delivered! Enjoy your groceries.
            </span>
          </div>
        </div>

        <!-- ── Order items ─────────────────────────────────────────── -->
        <div class="order-items">
          <div class="order-item" *ngFor="let item of order.items">
            <span class="item-name">{{ item.product.productName }}</span>
            <span class="item-detail">&times; {{ item.quantity }} &#64; &#8377;{{ item.price | number:'1.2-2' }}</span>
            <span class="item-sub">&#8377;{{ item.price * item.quantity | number:'1.2-2' }}</span>
          </div>
        </div>

        <div class="txn-row" *ngIf="order.transactionId">
          Txn ID: <code>{{ order.transactionId }}</code>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .page { padding:32px 40px; max-width:900px; }
    .page-title { font-size:24px; color:#138535; margin-bottom:28px; }

    /* Order card */
    .order-card { background:#fff; border-radius:14px; margin-bottom:24px;
      box-shadow:0 2px 14px rgba(0,0,0,0.08); overflow:hidden; }

    /* Header */
    .order-header { display:flex; justify-content:space-between; align-items:center;
      padding:16px 24px; background:#f1f8e9; flex-wrap:wrap; gap:10px; }
    .order-id   { font-size:14px; font-weight:700; color:#138535; display:block; }
    .order-date { font-size:12px; color:#888; }
    .order-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
    .badge.placed { background:#FFF3C4; color:#2e7d32; padding:3px 10px;
      border-radius:50px; font-size:11px; font-weight:700; }
    .pay-method { background:#e8f5e9; color:#FF8C00; padding:3px 10px;
      border-radius:50px; font-size:11px; font-weight:700; }
    .pay-status { padding:3px 10px; border-radius:50px; font-size:11px; font-weight:700; }
    .pay-status.paid { background:#e3f2fd; color:#1565c0; }
    .pay-status.cod  { background:#fff3e0; color:#e65100; }
    .order-total { font-size:17px; font-weight:800; color:#138535; }
    .btn-track { background:#138535; color:#fff; border:none; padding:6px 14px;
      border-radius:20px; font-size:12px; font-weight:700; cursor:pointer;
      transition:background 0.2s; white-space:nowrap; }
    .btn-track:hover { background:#FF8C00; }

    /* ── Tracking panel ──────────────────────────────────────────── */
    .tracking-panel { background:#f9fdf9; border-top:1px solid #e8f5e9;
      border-bottom:1px solid #e8f5e9; padding:24px 28px; }
    .track-header { display:flex; justify-content:space-between; align-items:center;
      margin-bottom:24px; }
    .track-title { font-size:15px; font-weight:700; color:#138535; }
    .track-eta   { font-size:13px; color:#888; background:#fff; padding:4px 12px;
      border-radius:50px; border:1px solid #ddd; }

    /* Timeline */
    .timeline { display:flex; flex-direction:column; gap:0; margin-bottom:20px; }
    .tl-step  { display:flex; gap:0; }
    .tl-left  { display:flex; flex-direction:column; align-items:center; width:40px; flex-shrink:0; }
    .tl-dot   { width:28px; height:28px; border-radius:50%; border:3px solid #ddd;
      background:#fff; display:flex; align-items:center; justify-content:center;
      font-size:13px; font-weight:700; color:#ccc; z-index:1; flex-shrink:0; }
    .tl-dot.done   { background:#FF8C00; border-color:#FF8C00; color:#fff; }
    .tl-dot.active { background:#fff; border-color:#FF8C00; color:#FF8C00; border-width:3px; animation:pulse 1.4s infinite; }
    @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(45,106,79,0.4)} 50%{box-shadow:0 0 0 8px rgba(45,106,79,0)} }
    .tl-line { flex:1; width:3px; background:#ddd; min-height:36px; margin:2px 0; }
    .tl-line.done { background:#FF8C00; }

    .tl-body  { display:flex; align-items:flex-start; gap:12px; padding:0 16px 28px; flex:1; }
    .tl-icon  { font-size:22px; margin-top:2px; }
    .tl-text  { }
    .tl-label { font-size:14px; font-weight:700; color:#bbb; }
    .tl-detail{ font-size:12px; color:#ccc; margin-top:2px; }
    .tl-body.done   .tl-label { color:#138535; }
    .tl-body.done   .tl-detail{ color:#666; }
    .tl-body.active .tl-label { color:#FF8C00; }
    .tl-body.active .tl-detail{ color:#555; }

    /* Status banner */
    .status-banner { background:#fff3e0; border-radius:10px; padding:12px 18px;
      font-size:13px; color:#e65100; font-weight:600; text-align:center; }
    .status-banner.delivered { background:#e8f5e9; color:#2e7d32; }

    /* Order items */
    .order-items { padding:16px 24px; }
    .order-item  { display:flex; align-items:center; gap:12px;
      padding:8px 0; border-bottom:1px solid #f0f0f0; font-size:14px; }
    .order-item:last-child { border-bottom:none; }
    .item-name   { flex:1; font-weight:600; color:#222; }
    .item-detail { color:#666; min-width:140px; }
    .item-sub    { font-weight:700; color:#138535; min-width:80px; text-align:right; }
    .txn-row { padding:8px 24px 14px; font-size:12px; color:#888; }
    .txn-row code { background:#f5f5f5; padding:2px 6px; border-radius:4px;
      font-size:11px; color:#1565c0; }
    .btn-reorder { background:#1565c0; color:#fff; border:none; padding:5px 12px;
      border-radius:20px; font-size:11px; font-weight:700; cursor:pointer; white-space:nowrap; }
    .btn-reorder:disabled { opacity:0.5; cursor:not-allowed; }
    .btn-cancel-order { background:#e53935; color:#fff; border:none; padding:5px 12px;
      border-radius:20px; font-size:11px; font-weight:700; cursor:pointer; white-space:nowrap; }
    .btn-cancel-order:disabled { opacity:0.5; cursor:not-allowed; }
    .badge.cancelled { background:#ffcdd2 !important; color:#c62828 !important; }
    .toast { position:fixed; top:80px; right:24px; padding:12px 20px;
      border-radius:10px; font-weight:600; font-size:14px; z-index:9999;
      box-shadow:0 4px 16px rgba(0,0,0,0.15); }
    .toast-success { background:#1b5e20; color:#fff; }
    .toast-error   { background:#b71c1c; color:#fff; }
    .empty-state { text-align:center; padding:80px 40px; }
    .empty-state span { font-size:64px; }
    .empty-state p { font-size:18px; color:#aaa; margin-top:16px; }
  `]
})
export class OrderHistoryComponent implements OnInit {
  orders: any[] = [];
  user: any;

  // Tracking stages config
  private stages = [
    { label: 'Order Placed',      icon: '📋', detail: 'We have received your order.',              minutesFrom: 0   },
    { label: 'Order Confirmed',   icon: '✅', detail: 'Your order has been confirmed.',             minutesFrom: 5   },
    { label: 'Being Packed',      icon: '📦', detail: 'Our team is packing your items.',            minutesFrom: 20  },
    { label: 'Out for Delivery',  icon: '🚴', detail: 'Your order is on the way.',                  minutesFrom: 60  },
    { label: 'Delivered',         icon: '🏠', detail: 'Your order has been delivered. Enjoy!',      minutesFrom: 180 },
  ];

  constructor(private orderSvc: OrderService, private cartSvc: CartService, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.user = this.auth.getSession();
    this.orderSvc.getHistory(this.user.customerId).subscribe((res: any) => {
      if (res.success) this.orders = res.data.map((o: any) => ({ ...o, _trackOpen: false }));
    });
  }

  /** Returns how many minutes have passed since order was placed */
  private minutesSince(order: any): number {
    const placed = new Date(order.orderDate).getTime();
    return (Date.now() - placed) / 60000;
  }

  getTracking(order: any): TrackingStep[] {
    const elapsed = this.minutesSince(order);
    let activeSet = false;

    return this.stages.map((stage, i) => {
      const reached = elapsed >= stage.minutesFrom;
      const nextReached = i < this.stages.length - 1
        ? elapsed >= this.stages[i + 1].minutesFrom
        : true;

      const done   = reached && nextReached;
      const active = reached && !nextReached && !activeSet;
      if (active) activeSet = true;

      // Build time label for completed steps
      const stepTime = new Date(new Date(order.orderDate).getTime() + stage.minutesFrom * 60000);
      const timeStr  = done || active
        ? stepTime.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true })
        : '';

      return {
        label:  stage.label,
        icon:   stage.icon,
        detail: done || active ? `${stage.detail}${timeStr ? ' · ' + timeStr : ''}` : stage.detail,
        done,
        active
      };
    });
  }

  isDelivered(order: any): boolean {
    return this.minutesSince(order) >= 180;
  }

  getCurrentStepLabel(order: any): string {
    const steps = this.getTracking(order);
    const active = steps.find(s => s.active);
    return active?.label || steps.filter(s => s.done).pop()?.label || 'Processing';
  }

  getEta(order: any): string {
    if (this.isDelivered(order)) return 'Delivered';
    const placed  = new Date(order.orderDate).getTime();
    const eta     = new Date(placed + 180 * 60000);
    return eta.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true });
  }

  canCancel(order: any): boolean {
    const placed = new Date(order.orderDate).getTime();
    const mins   = (Date.now() - placed) / 60000;
    return mins <= 30 && order.status !== 'Cancelled';
  }

  cancelOrder(order: any) {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    order._cancelling = true;
    this.orderSvc.cancel(order.orderId, this.user.customerId).subscribe({
      next: (res: any) => {
        order._cancelling = false;
        if (res.success) { order.status = 'Cancelled'; this.showToast('Order cancelled successfully.'); }
        else this.showErr(res.message);
      },
      error: (err: any) => { order._cancelling = false; this.showErr(err.error?.message || 'Could not cancel.'); }
    });
  }

  reorder(order: any) {
    order._reordering = true;
    const calls = order.items.map((item: any) =>
      this.cartSvc.addToCart({ customerId: this.user.customerId, productId: item.product.productId, quantity: item.quantity })
    );
    let done = 0;
    calls.forEach((obs: any) => obs.subscribe({
      next: () => { done++; if (done === calls.length) { order._reordering = false; this.showToast('Items added to cart!'); setTimeout(() => this.router.navigate(['/cart']), 1200); } },
      error: () => { order._reordering = false; this.showErr('Some items could not be added.'); }
    }));
  }

  toast = ''; toastErr = '';
  showToast(msg: string) { this.toast = msg; setTimeout(() => this.toast = '', 3000); }
  showErr(msg: string)   { this.toastErr = msg; setTimeout(() => this.toastErr = '', 3000); }

  getMethodIcon(m: string): string {
    return m === 'UPI' ? '🏦' : m === 'CARD' ? '💳' : '💵';
  }
}
