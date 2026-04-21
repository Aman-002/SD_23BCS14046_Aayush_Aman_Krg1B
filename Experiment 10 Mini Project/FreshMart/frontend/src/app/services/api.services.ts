import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = 'http://localhost:8080/api';

// ── ProductService ─────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private http: HttpClient) {}

  getAll(name?: string): Observable<any> {
    const q = name ? `?name=${encodeURIComponent(name)}` : '';
    return this.http.get(`${BASE}/products${q}`);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${BASE}/products/${id}`);
  }

  add(product: any): Observable<any> {
    return this.http.post(`${BASE}/products`, product);
  }

  bulkUpload(file: File): Observable<any> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post(`${BASE}/products/bulk-upload`, fd);
  }

  update(id: number, product: any): Observable<any> {
    return this.http.put(`${BASE}/products/${id}`, product);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${BASE}/products/${id}`);
  }
}

// ── CartService ────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class CartService {
  constructor(private http: HttpClient) {}

  getCart(customerId: number): Observable<any> {
    return this.http.get(`${BASE}/cart/${customerId}`);
  }

  addToCart(payload: { customerId: number; productId: number; quantity: number }): Observable<any> {
    return this.http.post(`${BASE}/cart/add`, payload);
  }

  updateItem(cartItemId: number, quantity: number): Observable<any> {
    return this.http.put(`${BASE}/cart/update/${cartItemId}`, { quantity });
  }

  removeItem(cartItemId: number): Observable<any> {
    return this.http.delete(`${BASE}/cart/remove/${cartItemId}`);
  }
}

// ── OrderService ───────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private http: HttpClient) {}

  placeOrder(customerId: number): Observable<any> {
    return this.http.post(`${BASE}/orders/place/${customerId}`, {});
  }

  getHistory(customerId: number): Observable<any> {
    return this.http.get(`${BASE}/orders/history/${customerId}`);
  }

  getAllOrders(): Observable<any> {
    return this.http.get(`${BASE}/orders/all`);
  }

  cancel(orderId: string, customerId: number): Observable<any> {
    return this.http.put(`${BASE}/orders/cancel/${orderId}?customerId=${customerId}`, {});
  }
}

// ── FeedbackService ────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class FeedbackService {
  constructor(private http: HttpClient) {}

  submit(payload: { customerName: string; customerEmail: string; rating: number; message: string }): Observable<any> {
    return this.http.post(`${BASE}/feedback`, payload);
  }

  getAll(): Observable<any> {
    return this.http.get(`${BASE}/feedback/all`);
  }
}

// ── WishlistService ────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class WishlistService {
  constructor(private http: HttpClient) {}
  get(customerId: number): Observable<any>                          { return this.http.get(`${BASE}/wishlist/${customerId}`); }
  toggle(customerId: number, productId: number): Observable<any>   { return this.http.post(`${BASE}/wishlist/toggle?customerId=${customerId}&productId=${productId}`, {}); }
}

// ── CouponService ──────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class CouponService {
  constructor(private http: HttpClient) {}
  validate(code: string, total: number): Observable<any>  { return this.http.post(`${BASE}/coupons/validate?code=${code}&total=${total}`, {}); }
  getAll(): Observable<any>                               { return this.http.get(`${BASE}/coupons/all`); }
  create(coupon: any): Observable<any>                    { return this.http.post(`${BASE}/coupons`, coupon); }
  toggle(id: number): Observable<any>                     { return this.http.put(`${BASE}/coupons/toggle/${id}`, {}); }
  delete(id: number): Observable<any>                     { return this.http.delete(`${BASE}/coupons/${id}`); }
}
