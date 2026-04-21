import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackService } from '../../../services/api.services';

@Component({
  selector: 'app-manage-feedback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h1 class="page-title">&#128172; Customer Feedback</h1>

      <!-- Stats row -->
      <div class="stats-row">
        <div class="stat-card">
          <span class="sn">{{ feedbacks.length }}</span>
          <span class="sl">Total Reviews</span>
        </div>
        <div class="stat-card g">
          <span class="sn">&#11088; {{ avgRating | number:'1.1-1' }}</span>
          <span class="sl">Average Rating</span>
        </div>
        <div class="stat-card go">
          <span class="sn">{{ fiveStars }}</span>
          <span class="sl">5-Star Reviews</span>
        </div>
        <div class="stat-card r">
          <span class="sn">{{ oneStars }}</span>
          <span class="sl">1-Star Reviews</span>
        </div>
      </div>

      <!-- Rating distribution -->
      <div class="dist-box">
        <h3>Rating Distribution</h3>
        <div class="dist-row" *ngFor="let r of [5,4,3,2,1]">
          <span class="dist-label">{{ r }} &#9733;</span>
          <div class="dist-bar-bg">
            <div class="dist-bar" [style.width.%]="getPercent(r)"></div>
          </div>
          <span class="dist-count">{{ getCount(r) }}</span>
        </div>
      </div>

      <!-- Feedback cards -->
      <div class="fb-empty" *ngIf="feedbacks.length === 0">
        No feedback submitted yet.
      </div>

      <div class="fb-card" *ngFor="let fb of feedbacks">
        <div class="fb-top">
          <div class="fb-avatar">{{ (fb.customerName || 'A')[0].toUpperCase() }}</div>
          <div class="fb-meta">
            <div class="fb-name">{{ fb.customerName || 'Anonymous' }}</div>
            <div class="fb-email">{{ fb.customerEmail }}</div>
          </div>
          <div class="fb-right">
            <div class="fb-stars">
              <span *ngFor="let s of getStars(fb.rating)" class="star filled">&#9733;</span>
              <span *ngFor="let s of getEmptyStars(fb.rating)" class="star">&#9733;</span>
            </div>
            <div class="fb-date">{{ fb.createdAt | date:'dd MMM yyyy, HH:mm' }}</div>
          </div>
        </div>
        <p class="fb-msg">{{ fb.message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .page { padding:32px 40px; }
    .page-title { font-size:24px; color:#138535; margin-bottom:24px; }

    /* Stats */
    .stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
    .stat-card { background:#fff; border-radius:12px; padding:18px 20px; text-align:center;
      box-shadow:0 2px 10px rgba(0,0,0,0.07); border-top:4px solid #ccc; }
    .stat-card.g  { border-color:#f9a825; }
    .stat-card.go { border-color:#2e7d32; }
    .stat-card.r  { border-color:#c62828; }
    .sn { display:block; font-size:26px; font-weight:800; color:#138535; }
    .sl { font-size:12px; color:#888; }

    /* Distribution */
    .dist-box { background:#fff; border-radius:14px; padding:24px 28px;
      box-shadow:0 2px 10px rgba(0,0,0,0.07); margin-bottom:24px; max-width:500px; }
    .dist-box h3 { font-size:15px; font-weight:700; color:#138535; margin:0 0 16px; }
    .dist-row { display:flex; align-items:center; gap:12px; margin-bottom:10px; }
    .dist-label { font-size:13px; font-weight:600; color:#555; width:36px; text-align:right; }
    .dist-bar-bg { flex:1; height:10px; background:#f0f0f0; border-radius:50px; overflow:hidden; }
    .dist-bar { height:100%; background:linear-gradient(90deg,#f9a825,#f57f17);
      border-radius:50px; transition:width 0.4s; }
    .dist-count { font-size:12px; color:#888; width:24px; }

    /* Feedback cards */
    .fb-empty { color:#aaa; font-size:15px; text-align:center; padding:60px; }
    .fb-card { background:#fff; border-radius:14px; padding:20px 24px;
      box-shadow:0 2px 12px rgba(0,0,0,0.07); margin-bottom:16px;
      border-left:4px solid #FFB300; }
    .fb-top { display:flex; align-items:center; gap:14px; margin-bottom:12px; }
    .fb-avatar { width:42px; height:42px; border-radius:50%; flex-shrink:0;
      background:linear-gradient(135deg,#FF8C00,#FFB300);
      color:#fff; font-weight:700; font-size:18px;
      display:flex; align-items:center; justify-content:center; }
    .fb-meta { flex:1; }
    .fb-name  { font-size:14px; font-weight:700; color:#222; }
    .fb-email { font-size:12px; color:#888; }
    .fb-right { text-align:right; }
    .fb-stars { display:flex; justify-content:flex-end; gap:2px; }
    .star       { font-size:15px; color:#ddd; }
    .star.filled{ color:#f9a825; }
    .fb-date  { font-size:11px; color:#aaa; margin-top:4px; }
    .fb-msg   { font-size:14px; color:#444; margin:0; line-height:1.6; }
  `]
})
export class ManageFeedbackComponent implements OnInit {
  feedbacks: any[] = [];

  constructor(private feedbackSvc: FeedbackService) {}

  ngOnInit() {
    this.feedbackSvc.getAll().subscribe((res: any) => {
      if (res.success) this.feedbacks = res.data;
    });
  }

  get avgRating(): number {
    if (!this.feedbacks.length) return 0;
    return this.feedbacks.reduce((s, f) => s + f.rating, 0) / this.feedbacks.length;
  }
  get fiveStars() { return this.feedbacks.filter(f => f.rating === 5).length; }
  get oneStars()  { return this.feedbacks.filter(f => f.rating === 1).length; }
  getCount(r: number) { return this.feedbacks.filter(f => f.rating === r).length; }
  getPercent(r: number) {
    return this.feedbacks.length ? (this.getCount(r) / this.feedbacks.length) * 100 : 0;
  }
  getStars(n: number)      { return Array(n).fill(0); }
  getEmptyStars(n: number) { return Array(5 - n).fill(0); }
}
