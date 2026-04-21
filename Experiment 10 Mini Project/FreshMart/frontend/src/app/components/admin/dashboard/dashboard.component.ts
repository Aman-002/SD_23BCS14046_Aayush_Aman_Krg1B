import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService, OrderService, FeedbackService } from '../../../services/api.services';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page">
      <div class="dash-header">
        <div>
          <h1 class="page-title">&#128200; Admin Dashboard</h1>
          <p class="sub">Welcome back, <strong>{{ adminName }}</strong>! Here's today's overview.</p>
        </div>
        <div class="date-badge">{{ today | date:'EEEE, dd MMM yyyy' }}</div>
      </div>

      <!-- ── KPI Cards ─────────────────────────────────────────────── -->
      <div class="kpi-grid">
        <div class="kpi-card blue">
          <div class="kpi-icon">&#128230;</div>
          <div class="kpi-body">
            <div class="kpi-num">{{ totalOrders }}</div>
            <div class="kpi-label">Total Orders</div>
            <div class="kpi-sub">{{ paidOrders }} paid &bull; {{ codOrders }} COD</div>
          </div>
        </div>
        <div class="kpi-card green">
          <div class="kpi-icon">&#8377;</div>
          <div class="kpi-body">
            <div class="kpi-num">{{ totalRevenue | number:'1.0-0' }}</div>
            <div class="kpi-label">Total Revenue</div>
            <div class="kpi-sub">Avg order: &#8377;{{ avgOrderValue | number:'1.0-0' }}</div>
          </div>
        </div>
        <div class="kpi-card orange">
          <div class="kpi-icon">&#127807;</div>
          <div class="kpi-body">
            <div class="kpi-num">{{ totalProducts }}</div>
            <div class="kpi-label">Products</div>
            <div class="kpi-sub">{{ lowStock }} low stock</div>
          </div>
        </div>
        <div class="kpi-card purple">
          <div class="kpi-icon">&#11088;</div>
          <div class="kpi-body">
            <div class="kpi-num">{{ avgRating | number:'1.1-1' }}</div>
            <div class="kpi-label">Avg Rating</div>
            <div class="kpi-sub">{{ totalFeedback }} reviews</div>
          </div>
        </div>
      </div>

      <div class="dash-body">

        <!-- ── Recent Orders ─────────────────────────────────────── -->
        <div class="panel">
          <div class="panel-header">
            <h3>&#128203; Recent Orders</h3>
            <a routerLink="/admin/orders" class="see-all">See All &#8594;</a>
          </div>
          <table class="mini-tbl">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
            <tbody>
              <tr *ngFor="let o of recentOrders">
                <td><code>{{ o.orderId }}</code></td>
                <td>{{ o.customer?.name }}</td>
                <td>&#8377;{{ o.total | number:'1.2-2' }}</td>
                <td>
                  <span class="pay-tag" [class.cod]="o.paymentMethod==='COD'">
                    {{ o.paymentMethod }}
                  </span>
                </td>
                <td>
                  <span class="badge" [class.placed]="o.status==='Placed'" [class.cancelled]="o.status==='Cancelled'">
                    {{ o.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ── Right column ──────────────────────────────────────── -->
        <div class="right-col">

          <!-- Top Products by stock sold -->
          <div class="panel">
            <div class="panel-header">
              <h3>&#128293; Low Stock Alert</h3>
              <a routerLink="/admin/products" class="see-all">Manage &#8594;</a>
            </div>
            <div class="low-stock-list">
              <div class="ls-row" *ngFor="let p of lowStockProducts">
                <span class="ls-name">{{ p.productName }}</span>
                <span class="ls-stock" [class.critical]="p.stock < 5">{{ p.stock }} left</span>
              </div>
              <div class="ls-empty" *ngIf="lowStockProducts.length === 0">
                &#10003; All products well stocked!
              </div>
            </div>
          </div>

          <!-- Revenue by payment method -->
          <div class="panel">
            <h3 class="panel-title">&#128179; Revenue by Method</h3>
            <div class="method-bars">
              <div class="mb-row" *ngFor="let m of methodRevenue">
                <span class="mb-label">{{ m.method }}</span>
                <div class="mb-bar-bg">
                  <div class="mb-bar" [style.width.%]="m.percent" [class]="m.method.toLowerCase()"></div>
                </div>
                <span class="mb-val">&#8377;{{ m.amount | number:'1.0-0' }}</span>
              </div>
            </div>
          </div>

          <!-- Rating breakdown -->
          <div class="panel">
            <h3 class="panel-title">&#11088; Rating Breakdown</h3>
            <div class="rating-bars">
              <div class="rb-row" *ngFor="let r of [5,4,3,2,1]">
                <span class="rb-label">{{ r }}&#9733;</span>
                <div class="rb-bg">
                  <div class="rb-fill" [style.width.%]="getRatingPercent(r)"></div>
                </div>
                <span class="rb-count">{{ getRatingCount(r) }}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- ── Quick Links ─────────────────────────────────────────── -->
      <div class="quick-links">
        <a routerLink="/admin/products"  class="ql-card">&#127807; Products</a>
        <a routerLink="/admin/customers" class="ql-card">&#128100; Customers</a>
        <a routerLink="/admin/orders"    class="ql-card">&#128230; Orders</a>
        <a routerLink="/admin/coupons"   class="ql-card">&#127981; Coupons</a>
        <a routerLink="/admin/feedback"  class="ql-card">&#128172; Feedback</a>
      </div>
    </div>
  `,
  styles: [`
    .page { padding:32px 40px; }
    .dash-header { display:flex; justify-content:space-between; align-items:flex-start;
      margin-bottom:28px; flex-wrap:wrap; gap:12px; }
    .page-title { font-size:24px; color:#138535; margin:0 0 4px; }
    .sub { color:#888; margin:0; font-size:14px; }
    .date-badge { background:#fff; border-radius:10px; padding:10px 18px;
      font-size:13px; font-weight:600; color:#555; box-shadow:0 2px 8px rgba(0,0,0,0.07); }

    /* KPI */
    .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-bottom:28px; }
    .kpi-card { background:#fff; border-radius:14px; padding:20px 22px;
      box-shadow:0 2px 14px rgba(0,0,0,0.08); display:flex; gap:16px; align-items:center;
      border-left:5px solid #ccc; }
    .kpi-card.blue   { border-color:#1565c0; }
    .kpi-card.green  { border-color:#2e7d32; }
    .kpi-card.orange { border-color:#e65100; }
    .kpi-card.purple { border-color:#6a1b9a; }
    .kpi-icon { font-size:32px; }
    .kpi-num   { font-size:28px; font-weight:800; color:#138535; line-height:1; }
    .kpi-label { font-size:13px; color:#666; font-weight:600; margin:2px 0; }
    .kpi-sub   { font-size:11px; color:#aaa; }

    /* Dashboard body */
    .dash-body { display:grid; grid-template-columns:1.4fr 1fr; gap:20px; margin-bottom:24px; }

    /* Panels */
    .panel { background:#fff; border-radius:14px; padding:20px 22px;
      box-shadow:0 2px 12px rgba(0,0,0,0.07); margin-bottom:18px; }
    .panel-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
    .panel-header h3, .panel-title { font-size:15px; font-weight:700; color:#138535; margin:0 0 16px; }
    .see-all { font-size:12px; color:#FF8C00; text-decoration:none; font-weight:700; }

    /* Mini table */
    .mini-tbl { width:100%; border-collapse:collapse; }
    .mini-tbl th { font-size:11px; color:#888; text-align:left;
      padding:0 8px 10px; border-bottom:1.5px solid #f0f0f0; }
    .mini-tbl td { font-size:12px; padding:9px 8px; border-bottom:1px solid #f5f5f5; }
    .mini-tbl tr:last-child td { border-bottom:none; }
    code { background:#f0f0f0; padding:2px 5px; border-radius:4px; font-size:11px; }
    .pay-tag { background:#e3f2fd; color:#1565c0; padding:2px 8px;
      border-radius:50px; font-size:10px; font-weight:700; }
    .pay-tag.cod { background:#fff3e0; color:#e65100; }
    .badge { padding:2px 8px; border-radius:50px; font-size:10px; font-weight:700; }
    .badge.placed    { background:#FFF3C4; color:#2e7d32; }
    .badge.cancelled { background:#ffcdd2; color:#c62828; }

    /* Low stock */
    .low-stock-list { display:flex; flex-direction:column; gap:8px; }
    .ls-row { display:flex; justify-content:space-between; align-items:center;
      padding:6px 10px; background:#fff8e1; border-radius:8px; }
    .ls-name { font-size:13px; color:#555; font-weight:600; }
    .ls-stock { font-size:13px; color:#e65100; font-weight:700; }
    .ls-stock.critical { color:#c62828; }
    .ls-empty { font-size:13px; color:#2e7d32; text-align:center; padding:8px; }

    /* Method bars */
    .method-bars { display:flex; flex-direction:column; gap:10px; }
    .mb-row { display:flex; align-items:center; gap:10px; }
    .mb-label { font-size:12px; font-weight:700; color:#555; width:50px; }
    .mb-bar-bg { flex:1; height:10px; background:#f0f0f0; border-radius:50px; overflow:hidden; }
    .mb-bar { height:100%; border-radius:50px; transition:width 0.4s; background:#FF8C00; }
    .mb-bar.upi  { background:linear-gradient(90deg,#1565c0,#42a5f5); }
    .mb-bar.card { background:linear-gradient(90deg,#6a1b9a,#ab47bc); }
    .mb-bar.cod  { background:linear-gradient(90deg,#e65100,#ff8f00); }
    .mb-val { font-size:12px; color:#888; min-width:70px; text-align:right; }

    /* Rating bars */
    .rating-bars { display:flex; flex-direction:column; gap:8px; }
    .rb-row { display:flex; align-items:center; gap:8px; }
    .rb-label { font-size:12px; font-weight:600; color:#555; width:28px; }
    .rb-bg { flex:1; height:8px; background:#f0f0f0; border-radius:50px; overflow:hidden; }
    .rb-fill { height:100%; background:linear-gradient(90deg,#f9a825,#f57f17); border-radius:50px; }
    .rb-count { font-size:11px; color:#aaa; width:20px; text-align:right; }

    /* Quick links */
    .quick-links { display:flex; gap:12px; flex-wrap:wrap; }
    .ql-card { background:#fff; border-radius:10px; padding:14px 24px;
      text-decoration:none; color:#138535; font-weight:700; font-size:14px;
      box-shadow:0 2px 10px rgba(0,0,0,0.07); transition:all 0.2s;
      border:2px solid transparent; }
    .ql-card:hover { border-color:#FF8C00; background:#f0fdf4; }
    .right-col { }
  `]
})
export class DashboardComponent implements OnInit {
  today         = new Date();
  adminName     = '';
  totalOrders   = 0; paidOrders = 0; codOrders = 0;
  totalRevenue  = 0; avgOrderValue = 0;
  totalProducts = 0; lowStock = 0;
  totalFeedback = 0; avgRating = 0;

  recentOrders:      any[] = [];
  lowStockProducts:  any[] = [];
  methodRevenue:     any[] = [];
  feedbackData:      any[] = [];

  constructor(
    private productSvc: ProductService,
    private orderSvc:   OrderService,
    private feedbackSvc: FeedbackService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.adminName = this.auth.getSession()?.name || 'Admin';

    this.productSvc.getAll().subscribe((res: any) => {
      if (res.success) {
        this.totalProducts    = res.data.length;
        this.lowStock         = res.data.filter((p: any) => p.stock < 20).length;
        this.lowStockProducts = res.data.filter((p: any) => p.stock < 20)
          .sort((a: any, b: any) => a.stock - b.stock).slice(0, 5);
      }
    });

    this.orderSvc.getAllOrders().subscribe((res: any) => {
      if (res.success) {
        const orders = res.data;
        this.totalOrders  = orders.length;
        this.paidOrders   = orders.filter((o: any) => o.paymentStatus === 'Paid').length;
        this.codOrders    = orders.filter((o: any) => o.paymentStatus === 'COD').length;
        this.totalRevenue = orders.reduce((s: number, o: any) => s + (o.total || 0), 0);
        this.avgOrderValue = this.totalOrders ? this.totalRevenue / this.totalOrders : 0;
        this.recentOrders = [...orders].reverse().slice(0, 6);

        const rev: any = { UPI: 0, CARD: 0, COD: 0 };
        orders.forEach((o: any) => { if (o.paymentMethod) rev[o.paymentMethod] = (rev[o.paymentMethod] || 0) + o.total; });
        const maxRev = Math.max(...Object.values(rev) as number[], 1);
        this.methodRevenue = ['UPI','CARD','COD'].map(m => ({
          method: m, amount: rev[m] || 0, percent: ((rev[m] || 0) / maxRev) * 100
        }));
      }
    });

    this.feedbackSvc.getAll().subscribe((res: any) => {
      if (res.success) {
        this.feedbackData  = res.data;
        this.totalFeedback = res.data.length;
        this.avgRating     = res.data.length
          ? res.data.reduce((s: number, f: any) => s + f.rating, 0) / res.data.length : 0;
      }
    });
  }

  getRatingCount(r: number)   { return this.feedbackData.filter((f: any) => f.rating === r).length; }
  getRatingPercent(r: number) {
    return this.feedbackData.length ? (this.getRatingCount(r) / this.feedbackData.length) * 100 : 0;
  }
}
