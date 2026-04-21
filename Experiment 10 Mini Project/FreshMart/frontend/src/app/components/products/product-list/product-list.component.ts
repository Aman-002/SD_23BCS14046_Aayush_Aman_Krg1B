import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, CartService, WishlistService } from '../../../services/api.services';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">

      <!-- ── Header ───────────────────────────────────────────────── -->
      <div class="page-header">
        <h1>Product Catalog</h1>
        <div class="search-box">
          <input type="text" [(ngModel)]="searchTerm" placeholder="Search products..."
            (keyup.enter)="search()" />
          <button (click)="search()">Search</button>
          <button class="btn-clear" (click)="clearSearch()">Clear</button>
        </div>
      </div>

      <div class="toast toast-success" *ngIf="toast">{{ toast }}</div>
      <div class="toast toast-error"   *ngIf="toastErr">{{ toastErr }}</div>

      <!-- ── Category Filter ──────────────────────────────────────── -->
      <div class="category-strip">
        <button class="cat-btn" [class.active]="activeCategory === 'All'"
                (click)="filterCategory('All')">All</button>
        <button class="cat-btn" *ngFor="let cat of categories"
                [class.active]="activeCategory === cat"
                (click)="filterCategory(cat)">
          {{ getCatEmoji(cat) }} {{ cat }}
        </button>
      </div>

      <!-- ── Results count ─────────────────────────────────────────── -->
      <div class="results-bar" *ngIf="filtered.length > 0">
        Showing <strong>{{ filtered.length }}</strong> product{{ filtered.length !== 1 ? 's' : '' }}
        <span *ngIf="activeCategory !== 'All'"> in <strong>{{ activeCategory }}</strong></span>
        <span *ngIf="searchTerm"> matching "<strong>{{ searchTerm }}</strong>"</span>
      </div>

      <!-- ── Grid ──────────────────────────────────────────────────── -->
      <div class="product-grid" *ngIf="filtered.length > 0; else empty">
        <div class="product-card" *ngFor="let p of filtered">

          <!-- Discount badge -->
          <div class="discount-badge" *ngIf="p.discount > 0">{{ p.discount }}% OFF</div>

          <!-- Wishlist button -->
          <button class="btn-wish" (click)="toggleWish(p)"
                  [class.wished]="isWished(p.productId)"
                  [title]="isWished(p.productId) ? 'Remove from wishlist' : 'Add to wishlist'">
            &#10084;
          </button>

          <div class="product-img">{{ getEmoji(p.productName) }}</div>

          <div class="product-body">
            <div class="cat-tag">{{ p.category || 'General' }}</div>
            <h3>{{ p.productName }}</h3>
            <p class="desc">{{ p.description }}</p>
            <p class="company">&#127981; {{ p.companyName }}</p>

            <div class="price-row">
              <span class="price">&#8377;{{ getEffectivePrice(p) | number:'1.2-2' }}</span>
              <span class="original" *ngIf="p.discount > 0">&#8377;{{ p.price }}</span>
            </div>

            <p class="stock" [class.out]="p.stock === 0">
              {{ p.stock > 0 ? '&#10003; In Stock (' + p.stock + ')' : '&#9888; Out of Stock' }}
            </p>

            <div class="qty-row">
              <button class="qty-btn" (click)="decrement(p)">&#8722;</button>
              <span class="qty">{{ getQty(p.productId) }}</span>
              <button class="qty-btn" (click)="increment(p)">+</button>
            </div>

            <button class="btn-add"
                    [disabled]="p.stock === 0 || getQty(p.productId) === 0"
                    (click)="addToCart(p)">
              &#128722; Add to Cart
            </button>
          </div>
        </div>
      </div>

      <ng-template #empty>
        <div class="empty-state">
          <span>&#128269;</span>
          <p>No products found</p>
          <button class="btn-clear-f" (click)="clearAll()">Clear Filters</button>
        </div>
      </ng-template>

    </div>
  `,
  styles: [`
    .page { padding:32px 40px; }

    /* Header */
    .page-header { display:flex; align-items:center; justify-content:space-between;
      margin-bottom:20px; flex-wrap:wrap; gap:16px; }
    .page-header h1 { font-size:24px; color:#138535; margin:0; }
    .search-box { display:flex; gap:8px; }
    .search-box input { padding:10px 16px; border:1.5px solid #ddd; border-radius:8px;
      font-size:14px; width:240px; outline:none; }
    .search-box input:focus { border-color:#FF8C00; }
    .search-box button { padding:10px 18px; background:#FF8C00; color:#fff;
      border:none; border-radius:8px; cursor:pointer; font-weight:600; }
    .btn-clear { background:#888 !important; }

    /* Category strip */
    .category-strip { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px; }
    .cat-btn { padding:7px 16px; border:2px solid #e0e0e0; border-radius:50px;
      background:#fff; color:#666; font-size:13px; font-weight:600; cursor:pointer;
      transition:all 0.2s; }
    .cat-btn:hover { border-color:#FF8C00; color:#FF8C00; }
    .cat-btn.active { background:#FF8C00; border-color:#FF8C00; color:#fff; }

    /* Results bar */
    .results-bar { font-size:13px; color:#888; margin-bottom:20px; }

    /* Grid */
    .product-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:24px; }
    .product-card { background:#fff; border-radius:14px; overflow:hidden; position:relative;
      box-shadow:0 2px 16px rgba(0,0,0,0.09); transition:transform 0.2s; }
    .product-card:hover { transform:translateY(-5px); }

    /* Badges */
    .discount-badge { position:absolute; top:12px; left:12px; background:#e53935;
      color:#fff; font-size:11px; font-weight:700; padding:3px 8px; border-radius:50px; }

    /* Wishlist btn */
    .btn-wish { position:absolute; top:10px; right:10px; background:#fff;
      border:2px solid #ddd; border-radius:50%; width:32px; height:32px;
      font-size:15px; cursor:pointer; display:flex; align-items:center;
      justify-content:center; transition:all 0.2s; color:#ddd; z-index:1; }
    .btn-wish:hover { border-color:#e53935; color:#e53935; }
    .btn-wish.wished { background:#ffebee; border-color:#e53935; color:#e53935; }

    .product-img { font-size:56px; text-align:center; padding:28px 20px; background:#f9fbe7; }
    .product-body { padding:16px; }
    .cat-tag { display:inline-block; font-size:10px; font-weight:700; color:#FF8C00;
      background:#f0fdf4; border-radius:50px; padding:2px 8px; margin-bottom:6px; }
    .product-body h3 { font-size:15px; font-weight:700; color:#222; margin:0 0 4px; }
    .desc { font-size:12px; color:#888; margin:0 0 6px; line-height:1.4;
      display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .company { font-size:12px; color:#555; margin:0 0 10px; }
    .price-row { display:flex; align-items:baseline; gap:8px; margin-bottom:6px; }
    .price { font-size:20px; font-weight:800; color:#138535; }
    .original { font-size:13px; color:#aaa; text-decoration:line-through; }
    .stock { font-size:12px; margin:0 0 12px; color:#2e7d32; }
    .stock.out { color:#e53935; }
    .qty-row { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
    .qty-btn { width:28px; height:28px; border-radius:50%; border:2px solid #FF8C00;
      background:#fff; color:#FF8C00; font-size:18px; font-weight:700;
      cursor:pointer; display:flex; align-items:center; justify-content:center; }
    .qty { font-size:16px; font-weight:700; min-width:24px; text-align:center; }
    .btn-add { width:100%; padding:10px; background:linear-gradient(135deg,#FF8C00,#1b4332);
      color:#fff; border:none; border-radius:8px; font-weight:600; cursor:pointer;
      font-size:14px; transition:opacity 0.2s; }
    .btn-add:disabled { opacity:0.4; cursor:not-allowed; }

    /* Empty */
    .empty-state { text-align:center; padding:60px; color:#aaa; }
    .empty-state span { font-size:48px; }
    .empty-state p { font-size:18px; margin-top:12px; }
    .btn-clear-f { margin-top:16px; padding:10px 24px; background:#FF8C00; color:#fff;
      border:none; border-radius:8px; font-size:14px; cursor:pointer; font-weight:600; }

    /* Toast */
    .toast { position:fixed; top:80px; right:24px; padding:12px 20px;
      border-radius:10px; font-weight:600; font-size:14px; z-index:9999;
      box-shadow:0 4px 16px rgba(0,0,0,0.15); }
    .toast-success { background:#1b5e20; color:#fff; }
    .toast-error   { background:#b71c1c; color:#fff; }
  `]
})
export class ProductListComponent implements OnInit {
  products:       any[] = [];
  filtered:       any[] = [];
  categories:     string[] = [];
  activeCategory  = 'All';
  searchTerm      = '';
  quantities:     { [id: number]: number } = {};
  wishlisted:     Set<number> = new Set();
  toast = ''; toastErr = '';
  user: any;

  constructor(
    private productSvc: ProductService,
    private cartSvc: CartService,
    private wishSvc: WishlistService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.user = this.auth.getSession();
    this.load();
    this.loadWishlist();
  }

  load(name?: string) {
    this.productSvc.getAll(name).subscribe((res: any) => {
      if (res.success) {
        this.products = res.data;
        this.categories = [...new Set<string>(res.data.map((p: any) => p.category || 'General'))].sort();
        this.applyFilter();
      }
    });
  }

  loadWishlist() {
    this.wishSvc.get(this.user.customerId).subscribe((res: any) => {
      if (res.success)
        this.wishlisted = new Set(res.data.map((w: any) => w.product.productId));
    });
  }

  search()      { this.load(this.searchTerm); }
  clearSearch() { this.searchTerm = ''; this.load(); }
  clearAll()    { this.searchTerm = ''; this.activeCategory = 'All'; this.load(); }

  filterCategory(cat: string) {
    this.activeCategory = cat;
    this.applyFilter();
  }

  applyFilter() {
    this.filtered = this.activeCategory === 'All'
      ? this.products
      : this.products.filter(p => (p.category || 'General') === this.activeCategory);
  }

  isWished(id: number)  { return this.wishlisted.has(id); }

  toggleWish(p: any) {
    this.wishSvc.toggle(this.user.customerId, p.productId).subscribe((res: any) => {
      if (res.success) {
        if (res.data) { this.wishlisted.add(p.productId);    this.showToast('Added to wishlist ❤️'); }
        else          { this.wishlisted.delete(p.productId); this.showToast('Removed from wishlist'); }
      }
    });
  }

  getQty(id: number)  { return this.quantities[id] || 0; }
  increment(p: any)   { if (this.getQty(p.productId) < p.stock) this.quantities[p.productId] = this.getQty(p.productId) + 1; }
  decrement(p: any)   { if (this.getQty(p.productId) > 0) this.quantities[p.productId]--; }
  getEffectivePrice(p: any): number { return p.price * (1 - p.discount / 100); }

  addToCart(p: any) {
    const qty = this.getQty(p.productId);
    if (!qty) { this.showErr('Select a quantity first'); return; }
    this.cartSvc.addToCart({ customerId: this.user.customerId, productId: p.productId, quantity: qty })
      .subscribe({
        next: (res: any) => {
          if (res.success) { this.showToast('Added to cart!'); this.quantities[p.productId] = 0; }
        },
        error: (err: any) => this.showErr(err.error?.message || 'Error adding to cart')
      });
  }

  showToast(msg: string) { this.toast = msg; setTimeout(() => this.toast = '', 2500); }
  showErr(msg: string)   { this.toastErr = msg; setTimeout(() => this.toastErr = '', 2500); }

  getEmoji(name: string): string {
    const map: any = { milk:'🥛', rice:'🍚', bread:'🍞', juice:'🍊', egg:'🥚',
      oil:'🫙', butter:'🧈', yogurt:'🍶', chicken:'🍗', vegetable:'🥦',
      fruit:'🍎', water:'💧', coffee:'☕', tea:'🍵', sugar:'🍬', salt:'🧂' };
    const key = Object.keys(map).find(k => name.toLowerCase().includes(k));
    return key ? map[key] : '🛒';
  }

  getCatEmoji(cat: string): string {
    const map: any = { Dairy:'🥛', Grains:'🍚', Bakery:'🍞', Beverages:'🧃',
      Eggs:'🥚', Oils:'🫙', Poultry:'🍗', Frozen:'🧊', Fruits:'🍎',
      Vegetables:'🥦', General:'🛒' };
    return map[cat] || '🏷️';
  }
}
