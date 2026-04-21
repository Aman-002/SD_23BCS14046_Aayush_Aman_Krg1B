import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../services/api.services';

@Component({
  selector: 'app-manage-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h1 class="page-title">&#128230; Manage Orders</h1>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card"><span class="sn">{{ orders.length }}</span><span class="sl">Total</span></div>
        <div class="stat-card g"><span class="sn">{{ paidCount }}</span><span class="sl">Paid (UPI/Card)</span></div>
        <div class="stat-card o"><span class="sn">{{ codCount }}</span><span class="sl">Cash on Delivery</span></div>
        <div class="stat-card b"><span class="sn">&#8377;{{ totalRevenue | number:'1.0-0' }}</span><span class="sl">Revenue</span></div>
      </div>

      <table class="tbl">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Status</th>
            <th>Method</th>
            <th>Payment</th>
            <th>Txn ID</th>
            <th>Total</th>
            <th>Items</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let o of orders">
            <td><code>{{ o.orderId }}</code></td>
            <td>{{ o.customer?.name }}</td>
            <td>{{ o.orderDate | date:'dd MMM yy, HH:mm' }}</td>
            <td><span class="badge placed">{{ o.status }}</span></td>
            <td>
              <span class="method-tag" *ngIf="o.paymentMethod">
                {{ o.paymentMethod }}
              </span>
            </td>
            <td>
              <span class="pay-s" [class.paid]="o.paymentStatus==='Paid'" [class.cod]="o.paymentStatus==='COD'">
                {{ o.paymentStatus || '-' }}
              </span>
            </td>
            <td><code class="txn" *ngIf="o.transactionId">{{ o.transactionId }}</code>
                <span class="na" *ngIf="!o.transactionId">&#8212;</span></td>
            <td class="tot">&#8377;{{ o.total | number:'1.2-2' }}</td>
            <td>
              <div class="chips">
                <span class="chip" *ngFor="let item of o.items">
                  {{ item.product?.productName }} &times;{{ item.quantity }}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .page { padding:32px 40px; }
    .page-title { font-size:24px; color:#138535; margin-bottom:24px; }
    .stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
    .stat-card { background:#fff; border-radius:12px; padding:18px 20px; text-align:center;
      box-shadow:0 2px 10px rgba(0,0,0,0.07); border-top:4px solid #ccc; }
    .stat-card.g { border-color:#2e7d32; } .stat-card.o { border-color:#e65100; }
    .stat-card.b { border-color:#1565c0; }
    .sn { display:block; font-size:26px; font-weight:800; color:#138535; }
    .sl { font-size:12px; color:#888; }
    .tbl { width:100%; border-collapse:collapse; background:#fff; border-radius:12px;
      overflow:hidden; box-shadow:0 2px 14px rgba(0,0,0,0.08); }
    th { background:#138535; color:#fff; padding:12px 12px; text-align:left; font-size:12px; }
    td { padding:11px 12px; border-bottom:1px solid #f0f0f0; font-size:12px; vertical-align:top; }
    tr:last-child td { border-bottom:none; }
    tr:hover td { background:#f9fbe7; }
    code { background:#f0f0f0; padding:2px 5px; border-radius:4px; font-size:11px; }
    .badge.placed { background:#FFF3C4; color:#2e7d32; padding:3px 8px;
      border-radius:50px; font-size:10px; font-weight:700; }
    .method-tag { background:#e8f5e9; color:#FF8C00; padding:3px 8px;
      border-radius:50px; font-size:10px; font-weight:700; }
    .pay-s { padding:3px 8px; border-radius:50px; font-size:10px; font-weight:700; background:#eee; }
    .pay-s.paid { background:#e3f2fd; color:#1565c0; }
    .pay-s.cod  { background:#fff3e0; color:#e65100; }
    .txn { color:#1565c0 !important; } .na { color:#ccc; }
    .tot { font-weight:700; color:#138535; }
    .chips { display:flex; flex-direction:column; gap:3px; }
    .chip { font-size:11px; background:#f1f8e9; color:#FF8C00; padding:2px 7px;
      border-radius:50px; display:inline-block; width:fit-content; }
  `]
})
export class ManageOrdersComponent implements OnInit {
  orders: any[] = [];
  constructor(private orderSvc: OrderService) {}
  ngOnInit() {
    this.orderSvc.getAllOrders().subscribe((res: any) => {
      if (res.success) this.orders = res.data;
    });
  }
  get paidCount()     { return this.orders.filter(o => o.paymentStatus === 'Paid').length; }
  get codCount()      { return this.orders.filter(o => o.paymentStatus === 'COD').length; }
  get totalRevenue()  { return this.orders.reduce((s, o) => s + (o.total || 0), 0); }
}
