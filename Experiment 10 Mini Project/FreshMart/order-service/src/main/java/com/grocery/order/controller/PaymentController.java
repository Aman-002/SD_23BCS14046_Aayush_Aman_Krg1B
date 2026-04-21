package com.grocery.order.controller;

import com.grocery.order.dto.ApiResponse;
import com.grocery.order.dto.PaymentRequest;
import com.grocery.order.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired private PaymentService paymentService;

    /**
     * GET /api/payment/preview/{customerId}?method=UPI
     * Returns cart total and validates if the chosen method is allowed.
     * Specifically blocks COD when total > ₹1000.
     */
    @GetMapping("/preview/{customerId}")
    public ResponseEntity<ApiResponse> preview(
            @PathVariable Integer customerId,
            @RequestParam(defaultValue = "UPI") String method) {
        try {
            return ResponseEntity.ok(paymentService.previewOrder(customerId, method));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * POST /api/payment/process
     * Validates payment details, places order, deducts stock, clears cart.
     * Body: { customerId, paymentMethod, upiId? | cardNumber/cardHolder/expiry/cvv? }
     */
    @PostMapping("/process")
    public ResponseEntity<ApiResponse> process(@RequestBody PaymentRequest req) {
        try {
            ApiResponse res = paymentService.processPayment(req);
            return ResponseEntity.status(HttpStatus.CREATED).body(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}
