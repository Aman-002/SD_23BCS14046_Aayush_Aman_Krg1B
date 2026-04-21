package com.grocery.order.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private Integer customerId;
    private String  paymentMethod;  // UPI | CARD | COD
    private String  couponCode;     // optional

    // UPI fields
    private String upiId;

    // Card fields
    private String cardNumber;
    private String cardHolder;
    private String expiry;
    private String cvv;
}
