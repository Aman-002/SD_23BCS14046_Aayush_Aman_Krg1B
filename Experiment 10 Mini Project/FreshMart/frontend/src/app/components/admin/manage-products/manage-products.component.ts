import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/api.services';

@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>📦 Manage Products</h1>
        <div class="header-actions">
          <button class="btn-primary" (click)="toggleForm()">
            {{ showForm ? '✕ Cancel' : '+ Add Product' }}
          </button>
          <label class="btn-upload">
            📤 Bulk CSV Upload
            <input type="file" accept=".csv" (change)="onCsvSelect($event)" hidden />
          </label>
        </div>
      </div>

      <div class="toast toast-success" *ngIf="toast">{{ toast }}</div>
      <div class="toast toast-error"   *ngIf="toastErr">{{ toastErr }}</div>

      <!-- Add / Edit Form -->
      <div class="form-card" *ngIf="showForm">
        <h2>{{ editMode ? 'Edit Product' : 'Add New Product' }}</h2>
        <form (ngSubmit)="saveProduct()">
          <div class="form-row">
            <div class="form-group">
              <label>Product Name *</label>
              <input type="text" [(ngModel)]="form.productName" name="productName" required />
            </div>
            <div class="form-group">
              <label>Company Name</label>
              <input type="text" [(ngModel)]="form.companyName" name="companyName" />
            </div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="form.description" name="description" rows="2"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Price (max ₹10000) *</label>
              <input type="number" [(ngModel)]="form.price" name="price" min="0" max="10000" required />
            </div>
            <div class="form-group">
              <label>Stock *</label>
              <input type="number" [(ngModel)]="form.stock" name="stock" min="0" required />
            </div>
            <div class="form-group">
              <label>Discount %</label>
              <input type="number" [(ngModel)]="form.discount" name="discount" min="0" max="100" />
            </div>
          </div>
          <div class="form-group">
            <label>Image URL (optional)</label>
            <input type="text" [(ngModel)]="form.imageUrl" name="imageUrl" placeholder="https://..." />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary">{{ editMode ? 'Update' : 'Add Product' }}</button>
            <button type="button" class="btn-cancel" (click)="cancelForm()">Cancel</button>
          </div>
        </form>
      </div>

      <!-- CSV Info -->
      <div class="csv-hint">
        <strong>CSV Format:</strong>
        ProductName, Description, CompanyName, Price, Stock, Discount(optional)
      </div>

      <!-- Products Table -->
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Company</th>
              <th>Price</th><th>Stock</th><th>Discount</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of products">
              <td>{{ p.productId }}</td>
              <td><strong>{{ p.productName }}</strong></td>
              <td>{{ p.companyName }}</td>
              <td>₹{{ p.price }}</td>
              <td [class.low-stock]="p.stock < 10">{{ p.stock }}</td>
              <td><span class="disc" *ngIf="p.discount > 0">{{ p.discount }}%</span>
                  <span *ngIf="!p.discount">—</span></td>
              <td class="actions">
                <button class="btn-edit" (click)="editProduct(p)">✏️ Edit</button>
                <button class="btn-del"  (click)="deleteProduct(p.productId)">🗑️ Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page { padding:32px 40px; }
    .page-header { display:flex; justify-content:space-between; align-items:center;
      margin-bottom:24px; flex-wrap:wrap; gap:12px; }
    .page-header h1 { font-size:24px; color:#138535; margin:0; }
    .header-actions { display:flex; gap:12px; }
    .btn-primary { padding:10px 20px; background:linear-gradient(135deg,#FF8C00,#1b4332);
      color:#fff; border:none; border-radius:8px; font-weight:600; cursor:pointer; font-size:14px; }
    .btn-upload { padding:10px 18px; background:#1565c0; color:#fff;
      border-radius:8px; font-weight:600; cursor:pointer; font-size:14px; }
    .form-card { background:#fff; border-radius:14px; padding:28px;
      margin-bottom:24px; box-shadow:0 2px 14px rgba(0,0,0,0.08); }
    .form-card h2 { font-size:17px; color:#138535; margin:0 0 20px; }
    .form-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:16px; }
    .form-group { margin-bottom:16px; }
    .form-group label { display:block; font-size:13px; font-weight:600; color:#333; margin-bottom:6px; }
    .form-group input, .form-group textarea {
      width:100%; padding:10px 14px; border:1.5px solid #ddd;
      border-radius:8px; font-size:14px; box-sizing:border-box; outline:none; }
    .form-group input:focus, .form-group textarea:focus { border-color:#FF8C00; }
    .form-actions { display:flex; gap:12px; }
    .btn-cancel { padding:10px 20px; background:#888; color:#fff;
      border:none; border-radius:8px; font-weight:600; cursor:pointer; }
    .csv-hint { background:#fff8e1; border:1px solid #ffe082; border-radius:8px;
      padding:10px 16px; font-size:13px; color:#5d4037; margin-bottom:20px; }
    .table-wrap { background:#fff; border-radius:12px; overflow:hidden;
      box-shadow:0 2px 14px rgba(0,0,0,0.07); }
    table { width:100%; border-collapse:collapse; }
    th { background:#f1f8e9; color:#2e7d32; font-size:13px; padding:12px 16px; text-align:left; }
    td { padding:12px 16px; font-size:13px; border-top:1px solid #f0f0f0; color:#333; }
    tr:hover td { background:#fafffe; }
    .low-stock { color:#e53935; font-weight:700; }
    .disc { background:#e8f5e9; color:#2e7d32; font-size:11px;
      font-weight:700; padding:2px 8px; border-radius:50px; }
    .actions { display:flex; gap:8px; }
    .btn-edit { padding:5px 12px; background:#e3f2fd; color:#1565c0;
      border:none; border-radius:6px; cursor:pointer; font-size:12px; font-weight:600; }
    .btn-del  { padding:5px 12px; background:#ffebee; color:#c62828;
      border:none; border-radius:6px; cursor:pointer; font-size:12px; font-weight:600; }
    .toast { position:fixed; top:80px; right:24px; padding:12px 20px;
      border-radius:10px; font-weight:600; font-size:14px; z-index:9999;
      box-shadow:0 4px 16px rgba(0,0,0,0.15); }
    .toast-success { background:#1b5e20; color:#fff; }
    .toast-error   { background:#b71c1c; color:#fff; }
  `]
})
export class ManageProductsComponent implements OnInit {
  products: any[] = [];
  showForm = false; editMode = false;
  editId: number | null = null;
  toast = ''; toastErr = '';
  form = { productName:'', companyName:'', description:'', price:0, stock:0, discount:0, imageUrl:'' };

  constructor(private productSvc: ProductService) {}

  ngOnInit() { this.load(); }

  load() {
    this.productSvc.getAll().subscribe((r: any) => { if (r.success) this.products = r.data; });
  }

  toggleForm() { this.showForm = !this.showForm; if (!this.showForm) this.cancelForm(); }

  cancelForm() {
    this.showForm = false; this.editMode = false; this.editId = null;
    this.form = { productName:'', companyName:'', description:'', price:0, stock:0, discount:0, imageUrl:'' };
  }

  editProduct(p: any) {
    this.editMode = true; this.editId = p.productId; this.showForm = true;
    this.form = { productName:p.productName, companyName:p.companyName,
      description:p.description, price:p.price, stock:p.stock,
      discount:p.discount, imageUrl:p.imageUrl || '' };
  }

  saveProduct() {
    const call = this.editMode
      ? this.productSvc.update(this.editId!, this.form)
      : this.productSvc.add(this.form);
    call.subscribe({
      next: (r: any) => {
        if (r.success) { this.showToast(r.message); this.cancelForm(); this.load(); }
        else { this.showErr(r.message); }
      },
      error: (e: any) => this.showErr(e.error?.message || 'Error saving product')
    });
  }

  deleteProduct(id: number) {
    if (!confirm('Delete this product?')) return;
    this.productSvc.delete(id).subscribe({
      next: (r: any) => { if (r.success) { this.showToast(r.message); this.load(); } },
      error: (e: any) => this.showErr(e.error?.message || 'Delete failed')
    });
  }

  onCsvSelect(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;
    this.productSvc.bulkUpload(file).subscribe({
      next: (r: any) => { if (r.success) { this.showToast(r.message); this.load(); } },
      error: (e: any) => this.showErr(e.error?.message || 'Upload failed')
    });
    event.target.value = '';
  }

  showToast(msg: string) { this.toast = msg; setTimeout(() => this.toast = '', 3000); }
  showErr(msg: string)   { this.toastErr = msg; setTimeout(() => this.toastErr = '', 3000); }
}
