import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProductService, FeedbackService } from '../../services/api.services';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="home">

      <!-- ── Hero ─────────────────────────────────────────────────── -->
      <div class="hero">
        <div class="hero-content">
          <h1>Fresh Groceries, Delivered</h1>
          <p>Shop from hundreds of fresh products. Best quality, best price.</p>
          <a routerLink="/products" class="btn-hero">Shop Now &#8594;</a>
        </div>
      </div>

      <!-- ── Stats ────────────────────────────────────────────────── -->
      <div class="stats">
        <div class="stat-card">
          <span class="stat-num">{{ totalProducts }}</span>
          <span class="stat-label">Products</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">100%</span>
          <span class="stat-label">Fresh Quality</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">Fast</span>
          <span class="stat-label">Delivery</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">4.8</span>
          <span class="stat-label">Customer Rating</span>
        </div>
      </div>

      <!-- ── Featured Products ─────────────────────────────────────── -->
      <div class="section">
        <h2 class="section-title">Featured Products</h2>
        <div class="product-grid">
          <div class="product-card" *ngFor="let p of featured">
            <div class="product-emoji">{{ getEmoji(p.productName) }}</div>
            <div class="product-info">
              <h3>{{ p.productName }}</h3>
              <p class="company">{{ p.companyName }}</p>
              <div class="price-row">
                <span class="price">&#8377;{{ p.price }}</span>
                <span class="discount" *ngIf="p.discount > 0">{{ p.discount }}% off</span>
              </div>
              <span class="stock" [class.low]="p.stock < 20">
                {{ p.stock > 0 ? 'In Stock (' + p.stock + ')' : 'Out of Stock' }}
              </span>
            </div>
          </div>
        </div>
        <div class="view-all">
          <a routerLink="/products" class="btn-outline">View All Products</a>
        </div>
      </div>

      <!-- ── Quick Actions ─────────────────────────────────────────── -->
      <div class="quick-actions">
        <a routerLink="/cart" class="qa-card">
          <span>My Cart</span>
        </a>
        <a routerLink="/orders" class="qa-card">
          <span>My Orders</span>
        </a>
        <a routerLink="/profile" class="qa-card">
          <span>My Profile</span>
        </a>
      </div>

      <!-- ── Help / FAQ ─────────────────────────────────────────────── -->
      <div class="section help-section">
        <h2 class="section-title">Help &amp; FAQ</h2>
        <div class="faq-grid">

          <div class="faq-card" *ngFor="let faq of faqs" (click)="faq.open = !faq.open">
            <div class="faq-q">
              <span>{{ faq.q }}</span>
              <span class="faq-arrow" [class.rotated]="faq.open">&#9660;</span>
            </div>
            <div class="faq-a" *ngIf="faq.open">{{ faq.a }}</div>
          </div>

        </div>

        <!-- Contact strip -->
        <div class="help-strip">
          <div class="help-item">
            <span class="hi-icon"></span>
            <div>
              <div class="hi-label">Call Us</div>
              <div class="hi-val">1800-123-4567 (Mon–Sat, 9am–6pm)</div>
            </div>
          </div>
          <div class="help-item">
            <span class="hi-icon"></span>
            <div>
              <div class="hi-label">Email Us</div>
              <div class="hi-val">support&#64;freshmart.com</div>
            </div>
          </div>
          <div class="help-item">
            <span class="hi-icon"></span>
            <div>
              <div class="hi-label">Live Chat</div>
              <div class="hi-val">Available inside the app (9am–9pm)</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Customer Feedback ──────────────────────────────────────── -->
      <div class="section feedback-section">
        <h2 class="section-title">Share Your Feedback</h2>
        <p class="section-sub">We read every single message. Help us serve you better!</p>

        <!-- Success msg -->
        <div class="fb-success" *ngIf="fbSuccess">
          &#10003; Thank you, {{ user?.name }}! Your feedback has been submitted.
        </div>

        <div class="fb-layout" *ngIf="!fbSuccess">
          <!-- Form -->
          <div class="fb-form">
            <!-- Star rating -->
            <div class="rating-row">
              <span class="rating-label">Your Rating</span>
              <div class="stars">
                <span *ngFor="let s of [1,2,3,4,5]"
                      class="star"
                      [class.filled]="s <= fbRating"
                      (click)="fbRating = s"
                      (mouseover)="fbHover = s"
                      (mouseleave)="fbHover = 0"
                      [class.hover]="s <= fbHover">
                  &#9733;
                </span>
              </div>
              <span class="rating-txt">{{ ratingLabel }}</span>
            </div>

            <div class="field">
              <label>Your Message</label>
              <textarea [(ngModel)]="fbMessage" rows="4"
                        placeholder="Tell us what you loved or what we can improve..."
                        class="inp" [class.inp-err]="fbErr"></textarea>
              <span class="ferr" *ngIf="fbErr">{{ fbErr }}</span>
            </div>

            <button class="btn-submit" (click)="submitFeedback()" [disabled]="fbLoading">
              {{ fbLoading ? 'Submitting...' : 'Submit Feedback' }}
            </button>
          </div>

          <!-- Recent feedback display -->
          <div class="fb-recent">
            <h3>What Others Are Saying</h3>
            <div class="review-card" *ngFor="let r of sampleReviews">
              <div class="rc-top">
                <span class="rc-avatar">{{ r.initial }}</span>
                <div>
                  <div class="rc-name">{{ r.name }}</div>
                  <div class="rc-stars">
                    <span *ngFor="let s of getStars(r.rating)" class="rs filled">&#9733;</span>
                  </div>
                </div>
              </div>
              <p class="rc-msg">{{ r.message }}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .home { padding-bottom:40px; }

    /* Hero */
    .hero { background:linear-gradient(135deg,#138535,#FF8C00);
      padding:60px 40px; text-align:center; color:#fff; }
    .hero h1 { font-size:36px; margin:0 0 12px; }
    .hero p { font-size:18px; color:#FFF3C4; margin-bottom:28px; }
    .btn-hero { background:#FFB300; color:#fff; padding:14px 32px;
      border-radius:50px; text-decoration:none; font-size:16px; font-weight:700; }
    .btn-hero:hover { background:#E67A00; }

    /* Stats */
    .stats { display:flex; justify-content:center; gap:20px; padding:24px 40px;
      background:#fff; box-shadow:0 2px 8px rgba(0,0,0,0.08); flex-wrap:wrap; }
    .stat-card { text-align:center; padding:16px 32px; }
    .stat-num { display:block; font-size:26px; font-weight:800; color:#138535; }
    .stat-label { font-size:13px; color:#666; }

    /* Section */
    .section { padding:40px; }
    .section-title { font-size:22px; font-weight:700; color:#138535; margin-bottom:8px; }
    .section-sub { color:#888; font-size:14px; margin-bottom:28px; }

    /* Products */
    .product-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:20px; }
    .product-card { background:#fff; border-radius:12px; overflow:hidden;
      box-shadow:0 2px 12px rgba(0,0,0,0.08); transition:transform 0.2s; }
    .product-card:hover { transform:translateY(-4px); }
    .product-emoji { font-size:48px; text-align:center; padding:24px; background:#f1f8e9; }
    .product-info { padding:16px; }
    .product-info h3 { font-size:15px; font-weight:700; color:#222; margin:0 0 4px; }
    .company { font-size:12px; color:#888; margin:0 0 8px; }
    .price-row { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
    .price { font-size:18px; font-weight:700; color:#138535; }
    .discount { background:#e8f5e9; color:#2e7d32; font-size:11px;
      font-weight:700; padding:2px 8px; border-radius:50px; }
    .stock { font-size:11px; color:#666; }
    .stock.low { color:#e65100; }
    .view-all { text-align:center; margin-top:28px; }
    .btn-outline { border:2px solid #FF8C00; color:#FF8C00; padding:10px 28px;
      border-radius:8px; text-decoration:none; font-weight:600; transition:all 0.2s; }
    .btn-outline:hover { background:#FF8C00; color:#fff; }

    /* Quick actions */
    .quick-actions { display:flex; justify-content:center; gap:20px;
      padding:0 40px 20px; flex-wrap:wrap; }
    .qa-card { display:flex; flex-direction:column; align-items:center; gap:8px;
      background:#fff; border-radius:12px; padding:24px 40px;
      box-shadow:0 2px 12px rgba(0,0,0,0.08); text-decoration:none;
      color:#333; font-weight:600; transition:transform 0.2s; }
    .qa-card:hover { transform:translateY(-4px); color:#138535; }
    .qa-icon { font-size:32px; }

    /* ── Help / FAQ ────────────────────────────────────────────────── */
    .help-section { background:#f9fdf9; }
    .faq-grid { display:flex; flex-direction:column; gap:10px; margin-bottom:32px; max-width:760px; }
    .faq-card { background:#fff; border-radius:10px; padding:16px 20px;
      box-shadow:0 1px 8px rgba(0,0,0,0.06); cursor:pointer;
      border-left:4px solid #FF8C00; }
    .faq-q { display:flex; justify-content:space-between; align-items:center;
      font-weight:600; color:#138535; font-size:14px; }
    .faq-arrow { font-size:12px; color:#aaa; transition:transform 0.2s; }
    .faq-arrow.rotated { transform:rotate(180deg); }
    .faq-a { margin-top:12px; font-size:13px; color:#555; line-height:1.6;
      padding-top:12px; border-top:1px solid #f0f0f0; }
    .help-strip { display:flex; gap:20px; flex-wrap:wrap; }
    .help-item { display:flex; align-items:center; gap:14px; background:#fff;
      border-radius:12px; padding:18px 24px; flex:1; min-width:200px;
      box-shadow:0 1px 8px rgba(0,0,0,0.06); }
    .hi-icon { font-size:28px; }
    .hi-label { font-size:11px; color:#888; text-transform:uppercase; font-weight:700; }
    .hi-val { font-size:13px; color:#333; font-weight:600; margin-top:2px; }

    /* ── Feedback ──────────────────────────────────────────────────── */
    .feedback-section { background:#fff; }
    .fb-success { background:#e8f5e9; border:1px solid #a5d6a7; border-radius:12px;
      padding:20px 24px; color:#2e7d32; font-size:15px; font-weight:600;
      text-align:center; max-width:600px; margin:0 auto; }
    .fb-layout { display:grid; grid-template-columns:1fr 1fr; gap:32px;
      align-items:start; max-width:900px; }
    .fb-form { background:#f9fdf9; border-radius:14px; padding:28px; }
    .rating-row { display:flex; align-items:center; gap:12px; margin-bottom:20px; flex-wrap:wrap; }
    .rating-label { font-size:13px; font-weight:700; color:#444; }
    .stars { display:flex; gap:4px; }
    .star { font-size:28px; color:#ddd; cursor:pointer; transition:color 0.15s; }
    .star.filled { color:#f9a825; }
    .star.hover  { color:#fbc02d; }
    .rating-txt { font-size:13px; color:#888; font-style:italic; }
    .field { margin-bottom:18px; }
    label { display:block; font-size:12px; font-weight:700; color:#444; margin-bottom:6px; }
    .inp { width:100%; padding:11px 14px; border:1.5px solid #ddd; border-radius:8px;
      font-size:14px; outline:none; box-sizing:border-box; transition:border 0.2s;
      font-family:inherit; resize:vertical; }
    .inp:focus { border-color:#FF8C00; }
    .inp-err { border-color:#e53935 !important; }
    .ferr { font-size:11px; color:#e53935; margin-top:4px; display:block; }
    .btn-submit { width:100%; padding:13px; background:linear-gradient(135deg,#FF8C00,#1b4332);
      color:#fff; border:none; border-radius:10px; font-size:15px;
      font-weight:700; cursor:pointer; transition:opacity 0.2s; }
    .btn-submit:disabled { opacity:0.6; cursor:not-allowed; }

    /* Review cards */
    .fb-recent h3 { font-size:16px; font-weight:700; color:#138535; margin:0 0 16px; }
    .review-card { background:#f9fdf9; border-radius:12px; padding:18px 20px;
      margin-bottom:14px; border-left:3px solid #FFB300; }
    .rc-top { display:flex; align-items:center; gap:12px; margin-bottom:10px; }
    .rc-avatar { width:36px; height:36px; border-radius:50%;
      background:linear-gradient(135deg,#FF8C00,#FFB300);
      color:#fff; font-weight:700; font-size:16px;
      display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .rc-name { font-weight:700; font-size:14px; color:#222; }
    .rc-stars { display:flex; gap:2px; }
    .rs { font-size:13px; color:#ddd; }
    .rs.filled { color:#f9a825; }
    .rc-msg { font-size:13px; color:#555; margin:0; line-height:1.5; }
  `]
})
export class HomeComponent implements OnInit {
  featured:      any[] = [];
  totalProducts  = 0;
  user:          any;

  // Feedback form
  fbRating  = 0;
  fbHover   = 0;
  fbMessage = '';
  fbErr     = '';
  fbLoading = false;
  fbSuccess = false;

  faqs = [
    { q: 'How do I track my order?',
      a: 'Go to "My Orders" page. Each order shows a live tracking timeline — from Order Placed all the way to Delivered.',
      open: false },
    { q: 'Can I cancel an order after placing it?',
      a: 'Orders can only be cancelled before they are packed. Please contact support within 30 minutes of placing the order.',
      open: false },
    { q: 'Is Cash on Delivery available?',
      a: 'Yes! COD is available for orders up to ₹1,000. For orders above ₹1,000 please use UPI or Card.',
      open: false },
    { q: 'How do I change my delivery address?',
      a: 'You can update your address anytime from the Profile page. Changes apply to future orders only.',
      open: false },
    { q: 'What if I receive a damaged or wrong item?',
      a: 'We\'re sorry! Please email us or call within 24 hours of delivery and we\'ll arrange a replacement or refund.',
      open: false },
    { q: 'How long does delivery take?',
      a: 'Most orders are delivered within 2–4 hours. Orders placed after 8pm are delivered the next morning.',
      open: false },
  ];

  sampleReviews = [
    { initial:'R', name:'Rahul M.', rating:5,
      message:'Superb quality! The vegetables were incredibly fresh and delivery was on time.' },
    { initial:'P', name:'Priya S.', rating:4,
      message:'Great selection of products and the app is very easy to use. Will order again!' },
    { initial:'A', name:'Amit K.', rating:5,
      message:'Best online grocery experience. Love the discount offers on daily items.' },
  ];

  constructor(
    private auth: AuthService,
    private productSvc: ProductService,
    private feedbackSvc: FeedbackService
  ) {}

  ngOnInit() {
    this.user = this.auth.getSession();
    this.productSvc.getAll().subscribe((res: any) => {
      if (res.success) {
        this.totalProducts = res.data.length;
        this.featured = res.data.slice(0, 6);
      }
    });
  }

  get ratingLabel(): string {
    const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];
    return labels[this.fbHover || this.fbRating] || 'Click to rate';
  }

  getStars(n: number): number[] { return Array(n).fill(0); }

  submitFeedback() {
    this.fbErr = '';
    if (this.fbRating === 0) { this.fbErr = 'Please select a star rating.'; return; }
    if (!this.fbMessage.trim()) { this.fbErr = 'Please write a message.'; return; }

    this.fbLoading = true;
    this.feedbackSvc.submit({
      customerName:  this.user?.name  || 'Anonymous',
      customerEmail: this.user?.email || '',
      rating:        this.fbRating,
      message:       this.fbMessage.trim()
    }).subscribe({
      next: (res: any) => {
        this.fbLoading = false;
        if (res.success) this.fbSuccess = true;
        else this.fbErr = res.message || 'Submission failed.';
      },
      error: () => {
        this.fbLoading = false;
        this.fbErr = 'Could not submit. Please try again.';
      }
    });
  }

  getEmoji(name: string): string {
    const map: any = { milk:'🥛', rice:'🍚', bread:'🍞', juice:'🍊', egg:'🥚',
      oil:'🫙', butter:'🧈', yogurt:'🍶', chicken:'🍗', vegetable:'🥦' };
    const key = Object.keys(map).find(k => name.toLowerCase().includes(k));
    return key ? map[key] : '🛒';
  }
}
