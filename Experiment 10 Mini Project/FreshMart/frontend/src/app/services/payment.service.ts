import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

const BASE = 'http://localhost:8080/api/payment';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  constructor(private http: HttpClient) {}

  /** Preview: get cart total & check if chosen method is allowed */
  preview(customerId: number, method: string) {
    const params = new HttpParams().set('method', method);
    return this.http.get<any>(`${BASE}/preview/${customerId}`, { params });
  }

  /** Process: validate details, place order, clear cart */
  process(payload: {
    customerId:    number;
    paymentMethod: string;
    upiId?:        string;
    cardNumber?:   string;
    cardHolder?:   string;
    expiry?:       string;
    cvv?:          string;
  }) {
    return this.http.post<any>(`${BASE}/process`, payload);
  }
}
