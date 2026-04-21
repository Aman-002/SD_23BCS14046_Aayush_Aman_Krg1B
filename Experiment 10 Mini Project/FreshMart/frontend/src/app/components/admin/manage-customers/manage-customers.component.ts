import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-manage-customers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h1 class="page-title">👥 Manage Customers</h1>

      <div class="toast toast-success" *ngIf="toast">{{ toast }}</div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th><th>Name</th><th>Email</th>
              <th>Contact</th><th>Address</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of customers; let i = index">
              <td>{{ i + 1 }}</td>
              <td><strong>{{ c.name }}</strong></td>
              <td>{{ c.email }}</td>
              <td>{{ c.contact || '—' }}</td>
              <td class="addr">{{ c.address || '—' }}</td>
              <td>
                <span class="badge" [class.active]="c.login.status === 'Active'"
                  [class.inactive]="c.login.status === 'Inactive'">
                  {{ c.login.status }}
                </span>
              </td>
              <td>
                <button class="btn-act danger"
                  *ngIf="c.login.status === 'Active'"
                  (click)="deactivate(c)">Deactivate</button>
                <button class="btn-act success"
                  *ngIf="c.login.status === 'Inactive'"
                  (click)="restore(c)">Restore</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page { padding:32px 40px; }
    .page-title { font-size:24px; color:#138535; margin-bottom:28px; }
    .table-wrap { background:#fff; border-radius:12px; overflow:hidden;
      box-shadow:0 2px 14px rgba(0,0,0,0.07); }
    table { width:100%; border-collapse:collapse; }
    th { background:#f1f8e9; color:#2e7d32; font-size:13px; padding:12px 16px; text-align:left; }
    td { padding:12px 16px; font-size:13px; border-top:1px solid #f0f0f0; color:#333; }
    tr:hover td { background:#fafffe; }
    .addr { max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .badge { font-size:11px; font-weight:700; padding:3px 10px; border-radius:50px; }
    .badge.active   { background:#FFF3C4; color:#2e7d32; }
    .badge.inactive { background:#ffcdd2; color:#c62828; }
    .btn-act { padding:6px 14px; border:none; border-radius:6px;
      font-size:12px; font-weight:600; cursor:pointer; }
    .btn-act.danger  { background:#ffebee; color:#c62828; }
    .btn-act.success { background:#e8f5e9; color:#2e7d32; }
    .toast { position:fixed; top:80px; right:24px; padding:12px 20px;
      border-radius:10px; font-weight:600; font-size:14px; z-index:9999;
      background:#1b5e20; color:#fff; box-shadow:0 4px 16px rgba(0,0,0,0.15); }
  `]
})
export class ManageCustomersComponent implements OnInit {
  customers: any[] = [];
  toast = '';

  constructor(private authSvc: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.authSvc.getAllCustomers().subscribe((r: any) => {
      if (r.success) this.customers = r.data;
    });
  }

  deactivate(c: any) {
    if (!confirm(`Deactivate ${c.name}?`)) return;
    this.authSvc.deactivate(c.login.loginId).subscribe(() => {
      this.showToast(`${c.name} deactivated`); this.load();
    });
  }

  restore(c: any) {
    this.authSvc.restore(c.email).subscribe(() => {
      this.showToast(`${c.name} restored`); this.load();
    });
  }

  showToast(msg: string) { this.toast = msg; setTimeout(() => this.toast = '', 3000); }
}
