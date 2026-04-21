import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CouponService } from '../../../services/api.services';

@Component({
  selector: 'app-manage-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <h1 class="page-title">&#127981; Manage Coupons</h1>

      <div class="toast toast-success" *ngIf="toast">{{ toast }}</div>
      <div class="toast toast-error"   *ngIf="toastErr">{{ toastErr }}</div>

      <!-- ── Add Coupon Form ─────────────────────────────────────── -->
      <div class="add-form">
        <h3>&#43; Create New Coupon</h3>
        <div class="form-grid">
          <div class="field">
            <label>Code</label>
            <input [(ngModel)]="newCode" placeholder="e.g. SAVE20" class="inp"
                   style="text-transform:uppercase" />
          </div>
          <div class="field">
            <label>Discount %</label>
            <input [(ngModel)]="newDiscount" type="number" min="1" max="90"
                   placeholder="e.g. 20" class="inp" />
          </div>
          <div class="field">
            <label>Min Order (&#8377;)</label>
            <input [(ngModel)]="newMinOrder" type="number" min="0"
                   placeholder="0" class="inp" />
          </div>
          <div class="field">
            <label>Max Uses</label>
            <input [(ngModel)]="newMaxUses" type="number" min="1"
                   placeholder="100" class="inp" />
          </div>
          <div class="field">
            <label>Expiry Date</label>
            <input [(ngModel)]="newExpiry" type="date" class="inp" />
          </div>
        </div>
        <div class="err-box" *ngIf="formErr">&#9888; {{ formErr }}</div>
        <button class="btn-create" (click)="create()" [disabled]="creating">
          {{ creating ? 'Creating...' : '&#10003; Create Coupon' }}
        </button>
      </div>

      <!-- ── Coupon Table ──────────────────────────────────────────── -->
      <div class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Min Order</th>
              <th>Used / Max</th>
              <th>Expiry</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of coupons">
              <td><code class="code-tag">{{ c.code }}</code></td>
              <td><span class="disc-badge">{{ c.discountPercent }}% off</span></td>
              <td>{{ c.minOrderAmount > 0 ? '&#8377;' + c.minOrderAmount : 'None' }}</td>
              <td>
                <div class="usage-bar-bg">
                  <div class="usage-bar" [style.width.%]="getUsagePercent(c)"></div>
                </div>
                <span class="usage-txt">{{ c.usedCount }} / {{ c.maxUses }}</span>
              </td>
              <td [class.expired]="isExpired(c)">
                {{ c.expiryDate ? (c.expiryDate | date:'dd MMM yyyy') : 'No expiry' }}
                <span class="exp-tag" *ngIf="isExpired(c)">Expired</span>
              </td>
              <td>
                <span class="status-badge" [class.active]="c.isActive" [class.inactive]="!c.isActive">
                  {{ c.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <div class="action-btns">
                  <button class="btn-toggle"
                    [class.deactivate]="c.isActive"
                    (click)="toggle(c)">
                    {{ c.isActive ? 'Deactivate' : 'Activate' }}
                  </button>
                  <button class="btn-del" (click)="deleteCoupon(c.id)">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page { padding:32px 40px; }
    .page-title { font-size:24px; color:#138535; margin-bottom:24px; }

    /* Add form */
    .add-form { background:#fff; border-radius:14px; padding:24px 28px;
      box-shadow:0 2px 14px rgba(0,0,0,0.08); margin-bottom:28px; }
    .add-form h3 { font-size:16px; font-weight:700; color:#138535; margin:0 0 18px; }
    .form-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(170px,1fr)); gap:14px; margin-bottom:16px; }
    .field { display:flex; flex-direction:column; gap:5px; }
    label { font-size:12px; font-weight:700; color:#555; }
    .inp { padding:10px 12px; border:1.5px solid #ddd; border-radius:8px;
      font-size:13px; outline:none; }
    .inp:focus { border-color:#FF8C00; }
    .err-box { background:#ffebee; border:1px solid #ef9a9a; border-radius:8px;
      padding:8px 14px; color:#c62828; font-size:13px; margin-bottom:12px; }
    .btn-create { padding:11px 24px; background:linear-gradient(135deg,#FF8C00,#1b4332);
      color:#fff; border:none; border-radius:8px; font-size:14px;
      font-weight:700; cursor:pointer; }
    .btn-create:disabled { opacity:0.5; cursor:not-allowed; }

    /* Table */
    .table-wrap { background:#fff; border-radius:14px; overflow:hidden;
      box-shadow:0 2px 14px rgba(0,0,0,0.08); }
    .tbl { width:100%; border-collapse:collapse; }
    th { background:#138535; color:#fff; padding:12px 14px; text-align:left; font-size:12px; }
    td { padding:12px 14px; border-bottom:1px solid #f0f0f0; font-size:13px; vertical-align:middle; }
    tr:last-child td { border-bottom:none; }
    tr:hover td { background:#f9fbe7; }
    code.code-tag { background:#f0fdf4; color:#FF8C00; padding:3px 8px;
      border-radius:6px; font-size:13px; font-weight:700; letter-spacing:1px; }
    .disc-badge { background:#e8f5e9; color:#2e7d32; padding:3px 10px;
      border-radius:50px; font-size:12px; font-weight:700; }

    /* Usage bar */
    .usage-bar-bg { height:6px; background:#f0f0f0; border-radius:50px;
      overflow:hidden; width:80px; margin-bottom:3px; }
    .usage-bar { height:100%; background:linear-gradient(90deg,#FF8C00,#FFB300);
      border-radius:50px; transition:width 0.3s; }
    .usage-txt { font-size:11px; color:#888; }

    /* Expiry */
    .expired { color:#e53935; }
    .exp-tag { font-size:10px; background:#ffebee; color:#c62828; padding:1px 6px;
      border-radius:50px; font-weight:700; margin-left:4px; }

    /* Status */
    .status-badge { padding:3px 10px; border-radius:50px; font-size:11px; font-weight:700; }
    .status-badge.active   { background:#FFF3C4; color:#2e7d32; }
    .status-badge.inactive { background:#f5f5f5; color:#aaa; }

    /* Action buttons */
    .action-btns { display:flex; gap:6px; }
    .btn-toggle { padding:5px 12px; border:none; border-radius:6px; font-size:11px;
      font-weight:700; cursor:pointer; background:#e3f2fd; color:#1565c0; }
    .btn-toggle.deactivate { background:#fff3e0; color:#e65100; }
    .btn-del { padding:5px 10px; border:none; border-radius:6px; font-size:11px;
      font-weight:700; cursor:pointer; background:#ffebee; color:#c62828; }

    /* Toast */
    .toast { position:fixed; top:80px; right:24px; padding:12px 20px;
      border-radius:10px; font-weight:600; font-size:14px; z-index:9999;
      box-shadow:0 4px 16px rgba(0,0,0,0.15); }
    .toast-success { background:#1b5e20; color:#fff; }
    .toast-error   { background:#b71c1c; color:#fff; }
  `]
})
export class ManageCouponsComponent implements OnInit {
  coupons: any[] = [];
  toast = ''; toastErr = '';
  creating = false; formErr = '';

  newCode = ''; newDiscount: any = ''; newMinOrder: any = 0;
  newMaxUses: any = 100; newExpiry = '';

  constructor(private couponSvc: CouponService) {}

  ngOnInit() { this.load(); }

  load() {
    this.couponSvc.getAll().subscribe((res: any) => {
      if (res.success) this.coupons = res.data;
    });
  }

  create() {
    this.formErr = '';
    if (!this.newCode.trim()) { this.formErr = 'Code is required.'; return; }
    if (!this.newDiscount || this.newDiscount < 1) { this.formErr = 'Discount % is required.'; return; }

    this.creating = true;
    const payload: any = {
      code:            this.newCode.toUpperCase(),
      discountPercent: +this.newDiscount,
      minOrderAmount:  +this.newMinOrder || 0,
      maxUses:         +this.newMaxUses || 100,
      isActive:        true
    };
    if (this.newExpiry) payload.expiryDate = this.newExpiry;

    this.couponSvc.create(payload).subscribe({
      next: (res: any) => {
        this.creating = false;
        if (res.success) {
          this.showToast('Coupon created!');
          this.newCode = ''; this.newDiscount = ''; this.newMinOrder = 0;
          this.newMaxUses = 100; this.newExpiry = '';
          this.load();
        } else this.formErr = res.message;
      },
      error: (err: any) => { this.creating = false; this.formErr = err.error?.message || 'Error.'; }
    });
  }

  toggle(c: any) {
    this.couponSvc.toggle(c.id).subscribe((res: any) => {
      if (res.success) { c.isActive = !c.isActive; this.showToast('Coupon updated.'); }
    });
  }

  deleteCoupon(id: number) {
    if (!confirm('Delete this coupon?')) return;
    this.couponSvc.delete(id).subscribe((res: any) => {
      if (res.success) { this.coupons = this.coupons.filter(c => c.id !== id); this.showToast('Deleted.'); }
    });
  }

  isExpired(c: any): boolean {
    return c.expiryDate && new Date(c.expiryDate) < new Date();
  }

  getUsagePercent(c: any): number {
    return c.maxUses > 0 ? (c.usedCount / c.maxUses) * 100 : 0;
  }

  showToast(msg: string) { this.toast = msg; setTimeout(() => this.toast = '', 3000); }
  showErr(msg: string)   { this.toastErr = msg; setTimeout(() => this.toastErr = '', 3000); }
}
