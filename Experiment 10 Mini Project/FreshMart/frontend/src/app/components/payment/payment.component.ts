import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { CouponService } from '../../services/api.services';
import { CartService } from '../../services/api.services';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pay-page">

      <!-- ── Success screen ─────────────────────────────────────────── -->
      <div class="success-screen" *ngIf="step === 'success'">
        <div class="success-card">
          <div class="success-icon">&#10003;</div>
          <h2>{{ successTitle }}</h2>
          <p class="success-msg">{{ successMsg }}</p>
          <div class="success-details">
            <div class="sd-row"><span>Order ID</span><strong>{{ result.orderId }}</strong></div>
            <div class="sd-row" *ngIf="result.transactionId && selectedMethod !== 'COD'">
              <span>Transaction ID</span><strong>{{ result.transactionId }}</strong>
            </div>
            <div class="sd-row"><span>Amount</span>
              <strong>&#8377;{{ result.total | number:'1.2-2' }}</strong>
            </div>
            <div class="sd-row"><span>Payment</span>
              <strong>{{ result.paymentMethod }}</strong>
            </div>
          </div>
          <button class="btn-primary" (click)="goOrders()">View My Orders</button>
        </div>
      </div>

      <!-- ── Main payment flow ──────────────────────────────────────── -->
      <div class="pay-layout" *ngIf="step !== 'success'">

        <!-- Left: method selector + form -->
        <div class="pay-left">
          <h1 class="pay-title">&#128179; Checkout</h1>

          <!-- Step indicator -->
          <div class="steps">
            <div class="step" [class.active]="step === 'method'" [class.done]="step === 'form' || step === 'processing'">
              <span class="step-num">1</span><span class="step-label">Method</span>
            </div>
            <div class="step-line"></div>
            <div class="step" [class.active]="step === 'form'" [class.done]="step === 'processing'">
              <span class="step-num">2</span><span class="step-label">Details</span>
            </div>
            <div class="step-line"></div>
            <div class="step" [class.active]="step === 'processing'">
              <span class="step-num">3</span><span class="step-label">Confirm</span>
            </div>
          </div>

          <!-- ── STEP 1: Choose method ─────────────────────────────── -->
          <div class="section" *ngIf="step === 'method'">
            <h3 class="section-title">Select Payment Method</h3>

            <div class="method-cards">

              <!-- UPI -->
              <div class="method-card" [class.selected]="selectedMethod === 'UPI'"
                   (click)="selectMethod('UPI')">
                <div class="mc-left">
                  <span class="mc-icon">&#127970;</span>
                  <div>
                    <div class="mc-name">UPI</div>
                    <div class="mc-sub">Google Pay, PhonePe, Paytm &amp; more</div>
                  </div>
                </div>
                <div class="mc-radio" [class.on]="selectedMethod === 'UPI'"></div>
              </div>

              <!-- Card -->
              <div class="method-card" [class.selected]="selectedMethod === 'CARD'"
                   (click)="selectMethod('CARD')">
                <div class="mc-left">
                  <span class="mc-icon">&#128179;</span>
                  <div>
                    <div class="mc-name">Credit / Debit Card</div>
                    <div class="mc-sub">Visa, Mastercard, RuPay</div>
                  </div>
                </div>
                <div class="mc-radio" [class.on]="selectedMethod === 'CARD'"></div>
              </div>

              <!-- COD -->
              <div class="method-card" [class.selected]="selectedMethod === 'COD'"
                   [class.disabled]="!codAvailable"
                   (click)="selectMethod('COD')">
                <div class="mc-left">
                  <span class="mc-icon">&#128181;</span>
                  <div>
                    <div class="mc-name">Cash on Delivery</div>
                    <div class="mc-sub" *ngIf="codAvailable">Pay when your order arrives</div>
                    <div class="mc-sub cod-blocked" *ngIf="!codAvailable">
                      &#9888; Not available for orders above &#8377;1,000
                    </div>
                  </div>
                </div>
                <div class="mc-radio" [class.on]="selectedMethod === 'COD'" *ngIf="codAvailable"></div>
                <div class="lock-icon" *ngIf="!codAvailable">&#128274;</div>
              </div>
            </div>

            <div class="err-box" *ngIf="errMsg">&#9888; {{ errMsg }}</div>
            <button class="btn-primary" (click)="goToForm()"
                    [disabled]="!selectedMethod || (!codAvailable && selectedMethod === 'COD')">
              Continue &#8594;
            </button>
          </div>

          <!-- ── STEP 2: Enter details ──────────────────────────────── -->
          <div class="section" *ngIf="step === 'form'">

            <!-- UPI form -->
            <div *ngIf="selectedMethod === 'UPI'">
              <h3 class="section-title">&#127970; Enter UPI ID</h3>
              <div class="upi-logos">
                <span class="upi-brand">GPay</span>
                <span class="upi-brand">PhonePe</span>
                <span class="upi-brand">Paytm</span>
                <span class="upi-brand">BHIM</span>
              </div>
              <div class="field">
                <label>UPI ID</label>
                <input [(ngModel)]="upiId" placeholder="yourname&#64;upi"
                       class="inp" [class.inp-err]="fieldErr.upiId" />
                <span class="hint">Example: mobilenumber&#64;paytm, name&#64;gpay</span>
                <span class="ferr" *ngIf="fieldErr.upiId">{{ fieldErr.upiId }}</span>
              </div>
              <div class="upi-mock-notice">
                &#128161; This is a simulated payment. No real transaction occurs.
              </div>
            </div>

            <!-- Card form -->
            <div *ngIf="selectedMethod === 'CARD'">
              <h3 class="section-title">&#128179; Card Details</h3>
              <div class="card-preview" [class.flipped]="showCvv">
                <div class="card-front" *ngIf="!showCvv">
                  <div class="card-chip">&#9632;</div>
                  <div class="card-num">{{ maskedCard }}</div>
                  <div class="card-row-bottom">
                    <div><div class="card-lbl">Card Holder</div>
                      <div class="card-val">{{ cardHolder || 'YOUR NAME' }}</div></div>
                    <div><div class="card-lbl">Expires</div>
                      <div class="card-val">{{ expiry || 'MM/YY' }}</div></div>
                  </div>
                </div>
                <div class="card-back" *ngIf="showCvv">
                  <div class="card-stripe"></div>
                  <div class="card-cvv-box">
                    <span class="card-lbl">CVV</span>
                    <span class="card-cvv-val">{{ cvv || '***' }}</span>
                  </div>
                </div>
              </div>

              <div class="field">
                <label>Card Number</label>
                <input [(ngModel)]="cardNumber" placeholder="1234 5678 9012 3456"
                       maxlength="19" class="inp" [class.inp-err]="fieldErr.cardNumber"
                       (input)="formatCard($event)" />
                <span class="ferr" *ngIf="fieldErr.cardNumber">{{ fieldErr.cardNumber }}</span>
              </div>
              <div class="field">
                <label>Cardholder Name</label>
                <input [(ngModel)]="cardHolder" placeholder="Name on card"
                       class="inp" [class.inp-err]="fieldErr.cardHolder"
                       (input)="cardHolder = cardHolder.toUpperCase()" />
                <span class="ferr" *ngIf="fieldErr.cardHolder">{{ fieldErr.cardHolder }}</span>
              </div>
              <div class="two-col">
                <div class="field">
                  <label>Expiry (MM/YY)</label>
                  <input [(ngModel)]="expiry" placeholder="MM/YY" maxlength="5"
                         class="inp" [class.inp-err]="fieldErr.expiry"
                         (input)="formatExpiry($event)" />
                  <span class="ferr" *ngIf="fieldErr.expiry">{{ fieldErr.expiry }}</span>
                </div>
                <div class="field">
                  <label>CVV</label>
                  <input [(ngModel)]="cvv" placeholder="***" maxlength="3" type="password"
                         class="inp" [class.inp-err]="fieldErr.cvv"
                         (focus)="showCvv=true" (blur)="showCvv=false" />
                  <span class="ferr" *ngIf="fieldErr.cvv">{{ fieldErr.cvv }}</span>
                </div>
              </div>
              <div class="upi-mock-notice">
                &#128161; This is a simulated payment. Enter any 16-digit card number.
              </div>
            </div>

            <!-- COD -->
            <div *ngIf="selectedMethod === 'COD'">
              <h3 class="section-title">&#128181; Cash on Delivery</h3>
              <div class="cod-info">
                <div class="cod-row">&#10003; Pay when your order arrives at the door</div>
                <div class="cod-row">&#10003; Keep exact change ready</div>
                <div class="cod-row">&#10003; Available only for orders up to &#8377;1,000</div>
                <div class="cod-row warn">&#9888; Your order total: <strong>&#8377;{{ cartTotal | number:'1.2-2' }}</strong></div>
              </div>
            </div>

            <div class="err-box" *ngIf="errMsg">&#9888; {{ errMsg }}</div>
            <div class="form-actions">
              <button class="btn-secondary" (click)="step = 'method'">&#8592; Back</button>
              <button class="btn-primary" (click)="submitPayment()" [disabled]="processing">
                {{ processing ? 'Processing...' : (selectedMethod === 'COD' ? 'Place Order (COD)' : 'Pay &#8377;' + (cartTotal | number:'1.2-2')) }}
              </button>
            </div>
          </div>

          <!-- ── STEP 3: Processing animation ──────────────────────── -->
          <div class="section processing-sec" *ngIf="step === 'processing'">
            <div class="spinner"></div>
            <h3>Processing your payment...</h3>
            <p>Please do not close this window.</p>
          </div>

        </div>

        <!-- Right: order summary -->
        <div class="pay-right">
            <div class="summary-box">
            <h3 style="margin-bottom: 1rem; color: var(--text-main);">Final Pricing Details</h3>
            <div class="sum-items" style="display:none;">
              <div class="sum-row" *ngFor="let item of cartItems">
                <span>{{ item.product.productName }} &times; {{ item.quantity }}</span>
                <span>&#8377;{{ getEffective(item.product) * item.quantity | number:'1.2-2' }}</span>
              </div>
            </div>
            <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 14px;">
              <span>Total Product Price:</span>
              <span>&#8377;{{ rawTotal | number:'1.2-2' }}</span>
            </div>
            <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 14px;">
              <span>Total Discount:</span>
              <span style="color: #d32f2f;">- &#8377;{{ totalDiscount | number:'1.2-2' }}</span>
            </div>
            <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 14px;">
              <span>Extra Charges (GST/Delivery):</span>
              <span>&#8377;0.00</span>
            </div>
            <hr>
            <div class="sum-total" style="display: flex; justify-content: space-between; font-size: 17px; font-weight: 800; color: #2e7d32; margin-bottom: 16px;">
              <span>Order Total:</span>
              <span>&#8377;{{ cartTotal | number:'1.2-2' }}</span>
            </div>

            <!-- Coupon input -->
            <div class="coupon-box" *ngIf="step === 'form' || step === 'method'">
              <div class="coupon-row">
                <input [(ngModel)]="couponCode" placeholder="Enter coupon code"
                       class="coupon-inp" [disabled]="couponApplied" />
                <button class="btn-coupon" (click)="applyCoupon()"
                        [disabled]="couponApplied || !couponCode.trim()">
                  {{ couponApplied ? '&#10003;' : 'Apply' }}
                </button>
              </div>
              <div class="coupon-ok"  *ngIf="couponMsg">&#10003; {{ couponMsg }}</div>
              <div class="coupon-err" *ngIf="couponErr">&#9888; {{ couponErr }}</div>
              <button class="btn-remove-coupon" *ngIf="couponApplied" (click)="removeCoupon()">
                Remove coupon
              </button>
            </div>

            <!-- Savings row -->
            <div class="savings-row" *ngIf="couponApplied">
              <span>Coupon Discount</span>
              <span class="savings-amt">&#8722;&#8377;{{ discountAmount | number:'1.2-2' }}</span>
            </div>
            <div class="sum-total" *ngIf="couponApplied">
              <span>Final Total</span>
              <span class="final-price">&#8377;{{ finalTotal | number:'1.2-2' }}</span>
            </div>

            <div class="cod-warning" *ngIf="!codAvailable">
              &#9888; COD unavailable — total exceeds &#8377;1,000
            </div>

            <div class="secure-strip">
              &#128274; 100% Secure &nbsp;|&nbsp; &#9989; Encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── Page layout ─────────────────────────────────────────────── */
    .pay-page { min-height:100vh; background:#f4f6f8; padding:32px 40px; }
    .pay-layout { display:grid; grid-template-columns:1fr 320px; gap:28px; max-width:960px; margin:0 auto; }
    .pay-title { font-size:22px; font-weight:800; color:#138535; margin-bottom:24px; }

    /* ── Steps ───────────────────────────────────────────────────── */
    .steps { display:flex; align-items:center; margin-bottom:28px; }
    .step { display:flex; flex-direction:column; align-items:center; gap:4px; }
    .step-num { width:30px; height:30px; border-radius:50%; background:#ddd; color:#aaa;
      font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center; }
    .step.active .step-num { background:#FF8C00; color:#fff; }
    .step.done   .step-num { background:#81c784; color:#fff; }
    .step-label { font-size:11px; color:#999; }
    .step.active .step-label { color:#FF8C00; font-weight:700; }
    .step-line { flex:1; height:2px; background:#ddd; margin:0 8px; margin-bottom:14px; }

    /* ── Section wrapper ─────────────────────────────────────────── */
    .section { background:#fff; border-radius:16px; padding:28px;
      box-shadow:0 2px 14px rgba(0,0,0,0.07); }
    .section-title { font-size:16px; font-weight:700; color:#138535; margin:0 0 20px; }

    /* ── Method cards ────────────────────────────────────────────── */
    .method-cards { display:flex; flex-direction:column; gap:12px; margin-bottom:24px; }
    .method-card { display:flex; align-items:center; justify-content:space-between;
      padding:16px 20px; border:2px solid #e0e0e0; border-radius:12px;
      cursor:pointer; transition:all 0.2s; }
    .method-card:hover:not(.disabled) { border-color:#FF8C00; background:#f9fdf9; }
    .method-card.selected { border-color:#FF8C00; background:#f0fdf4; }
    .method-card.disabled { opacity:0.55; cursor:not-allowed; background:#fafafa; }
    .mc-left { display:flex; align-items:center; gap:14px; }
    .mc-icon { font-size:28px; }
    .mc-name { font-size:15px; font-weight:700; color:#222; }
    .mc-sub  { font-size:12px; color:#888; margin-top:2px; }
    .cod-blocked { color:#e53935 !important; }
    .mc-radio { width:18px; height:18px; border-radius:50%; border:2px solid #ccc; }
    .mc-radio.on { border-color:#FF8C00; background:#FF8C00;
      box-shadow:inset 0 0 0 3px #fff; }
    .lock-icon { font-size:20px; color:#bbb; }

    /* ── UPI ─────────────────────────────────────────────────────── */
    .upi-logos { display:flex; gap:8px; margin-bottom:20px; }
    .upi-brand { padding:4px 12px; border:1px solid #ddd; border-radius:6px;
      font-size:12px; font-weight:700; color:#555; background:#fafafa; }

    /* ── Card preview ────────────────────────────────────────────── */
    .card-preview { height:160px; border-radius:14px; margin-bottom:20px; perspective:1000px; }
    .card-front, .card-back {
      background: linear-gradient(135deg, #138535 0%, #FF8C00 50%, #E67A00 100%);
      border-radius:14px; padding:20px 24px; height:100%; color:#fff;
      box-sizing:border-box; display:flex; flex-direction:column; justify-content:space-between; }
    .card-back { justify-content:flex-end; }
    .card-chip { font-size:22px; color:#f0c040; }
    .card-num  { font-size:19px; letter-spacing:3px; font-family:monospace; font-weight:700; }
    .card-row-bottom { display:flex; gap:32px; }
    .card-lbl  { font-size:9px; opacity:0.7; text-transform:uppercase; margin-bottom:2px; }
    .card-val  { font-size:13px; font-weight:700; }
    .card-stripe { height:36px; background:#000; margin:-20px -24px 16px; border-radius:0; }
    .card-cvv-box { background:#f5f5f5; border-radius:6px; padding:8px 16px;
      display:flex; justify-content:space-between; }
    .card-cvv-val { color:#222; font-weight:700; letter-spacing:4px; }

    /* ── COD info ────────────────────────────────────────────────── */
    .cod-info { background:#f9fbe7; border-radius:12px; padding:20px 24px; margin-bottom:20px; }
    .cod-row { padding:6px 0; font-size:14px; color:#333; }
    .cod-row.warn { color:#e65100; font-size:15px; margin-top:8px; }

    /* ── Form fields ─────────────────────────────────────────────── */
    .field { margin-bottom:16px; }
    label { display:block; font-size:12px; font-weight:700; color:#444; margin-bottom:6px; }
    .inp { width:100%; padding:11px 14px; border:1.5px solid #ddd; border-radius:8px;
      font-size:14px; outline:none; box-sizing:border-box; transition:border 0.2s; }
    .inp:focus { border-color:#FF8C00; }
    .inp-err    { border-color:#e53935 !important; }
    .hint { font-size:11px; color:#aaa; margin-top:4px; display:block; }
    .ferr { font-size:11px; color:#e53935; margin-top:4px; display:block; }
    .two-col { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

    .upi-mock-notice { background:#e3f2fd; border-radius:8px; padding:10px 14px;
      font-size:12px; color:#1565c0; margin-bottom:20px; }

    /* ── Buttons ─────────────────────────────────────────────────── */
    .btn-primary { padding:13px 28px; background:linear-gradient(135deg,#FF8C00,#1b4332);
      color:#fff; border:none; border-radius:10px; font-size:15px;
      font-weight:700; cursor:pointer; transition:opacity 0.2s; width:100%; }
    .btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
    .btn-secondary { padding:13px 20px; background:#f0f0f0; color:#555;
      border:none; border-radius:10px; font-size:14px; cursor:pointer;
      font-weight:600; }
    .form-actions { display:flex; gap:12px; }
    .form-actions .btn-primary { flex:1; }

    /* ── Error box ───────────────────────────────────────────────── */
    .err-box { background:#ffebee; border:1px solid #ef9a9a; border-radius:8px;
      padding:10px 14px; color:#c62828; font-size:13px; margin-bottom:16px; }

    /* ── Processing ──────────────────────────────────────────────── */
    .processing-sec { text-align:center; padding:60px 28px; }
    .spinner { width:50px; height:50px; border:5px solid #e0e0e0;
      border-top-color:#FF8C00; border-radius:50%; animation:spin 0.8s linear infinite;
      margin:0 auto 24px; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .processing-sec h3 { color:#138535; font-size:18px; margin:0 0 8px; }
    .processing-sec p  { color:#888; font-size:13px; }

    /* ── Summary box ─────────────────────────────────────────────── */
    .pay-right { }
    .summary-box { background:#fff; border-radius:16px; padding:24px;
      box-shadow:0 2px 14px rgba(0,0,0,0.07); position:sticky; top:80px; }
    .summary-box h3 { font-size:16px; font-weight:700; color:#138535; margin:0 0 16px; }
    .sum-items { display:flex; flex-direction:column; gap:8px; margin-bottom:4px; }
    .sum-row { display:flex; justify-content:space-between; font-size:13px; color:#555; }
    hr { border:none; border-top:1.5px solid #eee; margin:14px 0; }
    .sum-total { display:flex; justify-content:space-between;
      font-size:17px; font-weight:800; color:#138535; margin-bottom:16px; }
    .coupon-box { margin:12px 0; }
    .coupon-row { display:flex; gap:8px; }
    .coupon-inp { flex:1; padding:9px 12px; border:1.5px solid #ddd; border-radius:8px;
      font-size:13px; outline:none; text-transform:uppercase; }
    .coupon-inp:focus { border-color:#FF8C00; }
    .coupon-inp:disabled { background:#f5f5f5; color:#aaa; }
    .btn-coupon { padding:9px 14px; background:#FF8C00; color:#fff;
      border:none; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; }
    .btn-coupon:disabled { opacity:0.5; cursor:not-allowed; }
    .coupon-ok  { font-size:12px; color:#2e7d32; margin-top:6px; font-weight:600; }
    .coupon-err { font-size:12px; color:#c62828; margin-top:6px; }
    .btn-remove-coupon { background:none; border:none; color:#e53935; font-size:11px;
      cursor:pointer; padding:2px 0; text-decoration:underline; margin-top:4px; }
    .savings-row { display:flex; justify-content:space-between; font-size:13px;
      color:#2e7d32; margin-bottom:8px; font-weight:600; }
    .savings-amt { font-weight:800; }
    .final-price { color:#1565c0; }
    .cod-warning { background:#fff3e0; border-radius:8px; padding:10px 12px;
      font-size:12px; color:#e65100; margin-bottom:12px; }
    .secure-strip { text-align:center; font-size:12px; color:#aaa;
      border-top:1px solid #f0f0f0; padding-top:14px; margin-top:4px; }

    /* ── Success ─────────────────────────────────────────────────── */
    .success-screen { display:flex; justify-content:center; align-items:center;
      min-height:80vh; }
    .success-card { background:#fff; border-radius:20px; padding:48px 40px;
      max-width:460px; width:100%; text-align:center;
      box-shadow:0 4px 30px rgba(0,0,0,0.1); }
    .success-icon { width:72px; height:72px; border-radius:50%;
      background:#2e7d32; color:#fff; font-size:36px; font-weight:700;
      display:flex; align-items:center; justify-content:center; margin:0 auto 20px; }
    .success-card h2 { font-size:22px; color:#138535; margin:0 0 8px; }
    .success-msg { color:#666; font-size:14px; margin:0 0 28px; line-height:1.5; }
    .success-details { background:#f9fdf9; border-radius:12px; padding:16px 20px;
      margin-bottom:24px; text-align:left; }
    .sd-row { display:flex; justify-content:space-between; font-size:13px;
      padding:6px 0; border-bottom:1px solid #eee; }
    .sd-row:last-child { border-bottom:none; }
    .sd-row span { color:#888; }
    .sd-row strong { color:#138535; font-size:13px; }
  `]
})
export class PaymentComponent implements OnInit {
  step: 'method' | 'form' | 'processing' | 'success' = 'method';

  selectedMethod = '';
  codAvailable   = true;
  cartTotal      = 0;
  rawTotal       = 0;
  totalDiscount  = 0;
  cartItems: any[] = [];

  // UPI
  upiId = '';
  // Card
  cardNumber = ''; cardHolder = ''; expiry = ''; cvv = '';
  showCvv = false;

  processing = false;
  errMsg     = '';
  fieldErr: any = {};

  // Coupon
  couponCode    = '';
  couponApplied = false;
  couponMsg     = '';
  couponErr     = '';
  discountAmount = 0;
  get finalTotal(): number { return this.cartTotal - this.discountAmount; }

  result: any = {};
  successTitle = '';
  successMsg   = '';

  user: any;

  constructor(
    private paymentSvc: PaymentService,
    private couponSvc: CouponService,
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
      if (res.success) {
        this.cartItems = res.data;
        this.rawTotal = this.cartItems.reduce((s, i) => s + (i.product.price * i.quantity), 0);
        this.cartTotal = this.cartItems.reduce((s, i) => s + (this.getEffective(i.product) * i.quantity), 0);
        this.totalDiscount = this.rawTotal - this.cartTotal;
        this.codAvailable = this.cartTotal <= 1000;
      }
    });
  }

  getEffective(p: any): number { return p.price * (1 - p.discount / 100); }

  selectMethod(m: string) {
    if (m === 'COD' && !this.codAvailable) return;
    this.selectedMethod = m;
    this.errMsg = '';
  }

  goToForm() {
    if (!this.selectedMethod) { this.errMsg = 'Please select a payment method.'; return; }
    this.errMsg = '';
    this.step = 'form';
  }

  /* ── Card number auto-format ── */
  formatCard(e: any) {
    let v = e.target.value.replace(/\D/g, '').substring(0, 16);
    this.cardNumber = v.replace(/(.{4})/g, '$1 ').trim();
  }

  /* ── Expiry auto-format ── */
  formatExpiry(e: any) {
    let v = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 3) v = v.substring(0,2) + '/' + v.substring(2);
    this.expiry = v;
  }

  get maskedCard(): string {
    const raw = this.cardNumber.replace(/\s/g, '');
    if (!raw) return '**** **** **** ****';
    const padded = raw.padEnd(16, '*');
    return padded.replace(/(.{4})/g, '$1 ').trim();
  }

  /* ── Client-side validation ── */
  private validate(): boolean {
    this.fieldErr = {};
    if (this.selectedMethod === 'UPI') {
      if (!this.upiId.trim()) { this.fieldErr.upiId = 'UPI ID is required'; return false; }
      if (!/^[\w.-]+@[\w.-]+$/.test(this.upiId)) {
        this.fieldErr.upiId = 'Invalid UPI ID. Example: name@upi'; return false; }
    }
    if (this.selectedMethod === 'CARD') {
      const num = this.cardNumber.replace(/\s/g,'');
      if (!/^\d{16}$/.test(num)) { this.fieldErr.cardNumber = 'Must be exactly 16 digits'; return false; }
      if (!this.cardHolder.trim() || !/^[a-zA-Z\s]+$/.test(this.cardHolder)) { this.fieldErr.cardHolder = 'Valid name is required'; return false; }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(this.expiry)) {
        this.fieldErr.expiry = 'Use MM/YY format'; return false; }
      if (!/^\d{3}$/.test(this.cvv)) { this.fieldErr.cvv = 'Must be 3 digits'; return false; }
    }
    return true;
  }

  submitPayment() {
    this.errMsg = '';
    if (!this.validate()) return;

    this.processing = true;
    this.step = 'processing';

    const payload: any = {
      customerId:    this.user.customerId,
      paymentMethod: this.selectedMethod,
      couponCode:    this.couponApplied ? this.couponCode : ''
    };
    if (this.selectedMethod === 'UPI')  payload.upiId = this.upiId;
    if (this.selectedMethod === 'CARD') {
      payload.cardNumber  = this.cardNumber.replace(/\s/g,'');
      payload.cardHolder  = this.cardHolder;
      payload.expiry      = this.expiry;
      payload.cvv         = this.cvv;
    }

    // Simulate 2-second processing delay for realism
    setTimeout(() => {
      this.paymentSvc.process(payload).subscribe({
        next: (res: any) => {
          this.processing = false;
          if (res.success) {
            this.result = res.data;
            if (this.selectedMethod === 'COD') {
              this.successTitle = 'Order Placed!';
              this.successMsg   = 'Your order has been placed with Cash on Delivery. ' +
                                  'Please keep the exact amount ready.';
            } else {
              this.successTitle = 'Payment Successful!';
              this.successMsg   = 'Your payment was processed and your order has been placed.';
            }
            this.step = 'success';
          } else {
            this.step = 'form';
            this.errMsg = res.message || 'Payment failed. Please try again.';
          }
        },
        error: (err: any) => {
          this.processing = false;
          this.step = 'form';
          this.errMsg = err.error?.message || 'Payment failed. Please try again.';
        }
      });
    }, 2000);
  }

  applyCoupon() {
    this.couponErr = ''; this.couponMsg = '';
    const total = this.cartTotal;
    this.couponSvc.validate(this.couponCode, total).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.couponApplied  = true;
          this.discountAmount = res.data.discountAmount;
          this.couponMsg = res.message;
        } else {
          this.couponErr = res.message;
        }
      },
      error: (err: any) => { this.couponErr = err.error?.message || 'Invalid coupon'; }
    });
  }

  removeCoupon() {
    this.couponCode = ''; this.couponApplied = false;
    this.discountAmount = 0; this.couponMsg = ''; this.couponErr = '';
  }

  goOrders() { this.router.navigate(['/orders']); }
}
