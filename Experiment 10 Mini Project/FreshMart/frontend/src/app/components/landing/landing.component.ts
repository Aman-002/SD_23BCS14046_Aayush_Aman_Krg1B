import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `

    <!-- First Scroll Window: Hero Section -->
    <header class="hero-section">
        <h1 style="color: white !important;">Fresh Grocery Delivered</h1>
        <p style="color: white !important;">Shop the finest, freshest ingredients directly from farm to your door. Experience premium quality at unbeatable prices.</p>
        <div>
            <a routerLink="/login" class="btn btn-secondary" style="margin-right: 1rem;">Shop Now</a>
            <a href="#about" class="btn btn-primary" style="background-color: rgba(255,255,255,0.2); border: 2px solid white; color: white;">Learn More</a>
        </div>
    </header>

    <!-- Second Scroll Window: About Section -->
    <section id="about" class="about-section">
        <div class="about-content">
            <h2>Why Choose FreshMart?</h2>
            <p>Welcome to your premier online grocery destination. We understand the value of fresh food for a healthy lifestyle. That's why we source our products daily to ensure you receive only the highest quality fruits, vegetables, dairy, and pantry staples.</p>
            <p>Skip the long supermarket lines and let us do the heavy lifting. With a seamless ordering process and prompt delivery, fresh groceries are just a click away.</p>
            
            <div class="features-grid">
                <div class="feature-box">
                    <h3>Farm Fresh</h3>
                    <p>Locally sourced produce that goes straight from the farm to your kitchen table.</p>
                </div>
                <div class="feature-box">
                    <h3>Fast Delivery</h3>
                    <p>Get your groceries delivered to your doorstep within hours of placing your order.</p>
                </div>
                <div class="feature-box">
                    <h3>Secure Payment</h3>
                    <p>Multiple secure payment methods including UPI, Cards, and Cash on Delivery.</p>
                </div>
            </div>
            
            <div style="margin-top: 3rem;">
                <a routerLink="/register" class="btn btn-primary">Create Your Account Today</a>
            </div>
        </div>
    </section>


  `,
  styles: [`
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    :host {
        display: block;
        --primary-color: #2e7d32;
        --secondary-color: #ffb300;
        --bg-color: #f4f6f8;
        --card-bg: #ffffff;
        --text-main: #333333;
        --text-muted: #666666;
        --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        --border-radius: 12px;
        --border-color: #e0e0e0;
    }
    a { text-decoration: none; color: var(--text-main); }
    .navbar {
        display: flex; justify-content: space-between; align-items: center;
        padding: 1rem 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .nav-brand { font-size: 1.5rem; font-weight: 700; color: var(--primary-color); }
    .nav-links { display: flex; gap: 2rem; }
    .nav-links a { font-weight: 500; transition: color 0.3s; cursor: pointer; }
    .nav-links a:hover { color: var(--primary-color); }

    .hero-section {
        height: 100vh;
        background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/assets/hero.jpg');
        background-size: cover; background-position: center; background-repeat: no-repeat;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        color: white; text-align: center; padding: 0 2rem;
    }
    .hero-section h1 { font-size: 4rem; font-weight: 800; margin-bottom: 1rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
    .hero-section p { font-size: 1.5rem; max-width: 800px; margin-bottom: 2rem; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); }

    .btn { display: inline-block; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; text-align: center; transition: all 0.3s ease; }
    .btn-primary { background-color: var(--primary-color); color: white; }
    .btn-primary:hover { background-color: #1b5e20; transform: translateY(-1px); }
    .btn-secondary { background-color: var(--secondary-color); color: var(--text-main); }
    .btn-secondary:hover { background-color: #ff9800; }

    .about-section { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 4rem 2rem; background-color: var(--bg-color); }
    .about-content { max-width: 900px; text-align: center; }
    .about-content h2 { font-size: 2.5rem; color: var(--primary-color); margin-bottom: 1.5rem; }
    .about-content p { font-size: 1.2rem; color: var(--text-muted); margin-bottom: 1rem; line-height: 1.8; }

    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-top: 3rem; }
    .feature-box { background: var(--card-bg); padding: 2rem; border-radius: var(--border-radius); box-shadow: var(--shadow); }
    .feature-box h3 { margin-bottom: 1rem; color: var(--primary-color); }

    .site-footer { text-align: center; padding: 1.5rem; margin-top: auto; background-color: rgba(255, 255, 255, 0.95); color: var(--text-muted); font-size: 0.9rem; border-top: 1px solid var(--border-color); }
    .site-footer p { margin-bottom: 0.2rem; }
  `]
})
export class LandingComponent {
}
