import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WishlistService, CartService } from '../../services/api.services';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h1 class="page-title">&#10084; My Wishlist</h1>

      <div class="toast toast-success" *ngIf="toast">{{ toast }}</div>
      <div class="toast toast-error"   *ngIf="toastErr">{{ toastErr }}</div>

      <div class="empty-state" *ngIf="items.length === 0">
        <span>&#10084;&#65039;</span>
        <p>Your wishlist is empty</p>
        <button class="btn-shop" (click)="goShop()">Browse Products</button>
      </div>

      <div class="wish-grid" *ngIf="items.length > 0">
        <div class="wish-card" *ngFor="let item of items">
          <button class="btn-remove-wish" (click)="remove(item)" title="Remove from wishlist">&#10005;</button>

          <div class="wish-emoji">{{ getEmoji(item.product.productName) }}</div>

          <div class="wish-info">
            <div class="wish-category">{{ item.product.category }}</div>
            <h3>{{ item.product.productName }}</h3>
            <p class="wish-company">{{ item.product.companyName }}</p>
            <p class="wish-desc">{{ item.product.description }}</p>

            <div class="price-row">
              <span class="price">&#8377;{{ getEffective(item.product) | number:'1.2-2' }}</span>
              <span class="original" *ngIf="item.product.discount > 0">
                &#8377;{{ item.product.price | number:'1.2-2' }}
              </span>
              <span class="badge-discount" *ngIf="item.product.discount > 0">
                {{ item.product.discount }}% off
              </span>
            </div>

            <div class="stock-row">
              <span class="stock-ok"  *ngIf="item.product.stock > 0">
                &#10003; In Stock ({{ item.product.stock }})
              </span>
              <span class="stock-out" *ngIf="item.product.stock === 0">
                &#9888; Out of Stock
              </span>
            </div>
          </div>

          <div class="wish-actions">
            <button class="btn-cart" (click)="addToCart(item)"
                    [disabled]="item.product.stock === 0 || item._adding">
              {{ item._adding ? 'Adding...' : '&#128722; Add to Cart' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding:32px 40px; }
    .page-title { font-size:24px; color:#138535; margin-bottom:28px; }

    .wish-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:20px; }

    .wish-card { background:#fff; border-radius:16px; padding:24px; position:relative;
      box-shadow:0 2px 14px rgba(0,0,0,0.08); transition:transform 0.2s;
      display:flex; flex-direction:column; gap:12px; }
    .wish-card:hover { transform:translateY(-4px); }

    .btn-remove-wish { position:absolute; top:14px; right:14px; background:#ffebee;
      border:none; color:#e53935; width:28px; height:28px; border-radius:50%;
      cursor:pointer; font-size:14px; font-weight:700; transition:background 0.2s; }
    .btn-remove-wish:hover { background:#e53935; color:#fff; }

    .wish-emoji { font-size:52px; text-align:center; }
    .wish-category { font-size:11px; font-weight:700; color:#FF8C00;
      background:#f0fdf4; border-radius:50px; padding:2px 10px; display:inline-block; }
    .wish-info h3 { font-size:16px; font-weight:700; color:#222; margin:6px 0 2px; }
    .wish-company { font-size:12px; color:#888; margin:0 0 4px; }
    .wish-desc { font-size:12px; color:#aaa; margin:0; line-height:1.4;
      display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }

    .price-row { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-top:8px; }
    .price { font-size:20px; font-weight:800; color:#138535; }
    .original { font-size:13px; color:#bbb; text-decoration:line-through; }
    .badge-discount { background:#e8f5e9; color:#2e7d32; font-size:11px;
      font-weight:700; padding:2px 8px; border-radius:50px; }

    .stock-row { margin:4px 0; }
    .stock-ok  { font-size:12px; color:#2e7d32; font-weight:600; }
    .stock-out { font-size:12px; color:#e53935; font-weight:600; }

    .wish-actions { margin-top:auto; }
    .btn-cart { width:100%; padding:11px; background:linear-gradient(135deg,#FF8C00,#1b4332);
      color:#fff; border:none; border-radius:10px; font-size:14px;
      font-weight:700; cursor:pointer; transition:opacity 0.2s; }
    .btn-cart:disabled { opacity:0.5; cursor:not-allowed; }

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
export class WishlistComponent implements OnInit {
  items: any[] = [];
  toast = ''; toastErr = '';
  user: any;

  constructor(
    private wishSvc: WishlistService,
    private cartSvc: CartService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.auth.getSession();
    this.load();
  }

  load() {
    this.wishSvc.get(this.user.customerId).subscribe((res: any) => {
      if (res.success) this.items = res.data.map((i: any) => ({ ...i, _adding: false }));
    });
  }

  remove(item: any) {
    this.wishSvc.toggle(this.user.customerId, item.product.productId).subscribe(() => {
      this.items = this.items.filter(i => i.id !== item.id);
      this.showToast('Removed from wishlist');
    });
  }

  addToCart(item: any) {
    item._adding = true;
    this.cartSvc.addToCart({ customerId: this.user.customerId, productId: item.product.productId, quantity: 1 })
      .subscribe({
        next: (res: any) => {
          item._adding = false;
          if (res.success) this.showToast('Added to cart!');
          else this.showErr(res.message);
        },
        error: () => { item._adding = false; this.showErr('Could not add to cart.'); }
      });
  }

  getEffective(p: any): number { return p.price * (1 - p.discount / 100); }
  goShop() { this.router.navigate(['/products']); }
  showToast(msg: string) { this.toast = msg; setTimeout(() => this.toast = '', 3000); }
  showErr(msg: string)   { this.toastErr = msg; setTimeout(() => this.toastErr = '', 3000); }

  getEmoji(name: string): string {
    const map: any = { milk:'🥛', rice:'🍚', bread:'🍞', juice:'🍊', egg:'🥚',
      oil:'🫙', butter:'🧈', yogurt:'🍶', chicken:'🍗', vegetable:'🥦',
      fruit:'🍎', sugar:'🍬', salt:'🧂', tea:'🍵', coffee:'☕' };
    const key = Object.keys(map).find(k => name?.toLowerCase().includes(k));
    return key ? map[key] : '🛒';
  }
}
