package com.grocery.order.controller;

import com.grocery.order.dto.ApiResponse;
import com.grocery.order.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired private OrderService orderService;

    // POST /api/orders/place/{customerId}
    @PostMapping("/place/{customerId}")
    public ResponseEntity<ApiResponse> placeOrder(@PathVariable Integer customerId) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(orderService.placeOrder(customerId));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // GET /api/orders/history/{customerId}
    @GetMapping("/history/{customerId}")
    public ResponseEntity<ApiResponse> history(@PathVariable Integer customerId) {
        try {
            return ResponseEntity.ok(orderService.getOrderHistory(customerId));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // GET /api/orders/all  (Admin)
    @GetMapping("/all")
    public ResponseEntity<ApiResponse> allOrders() {
        try {
            return ResponseEntity.ok(orderService.getAllOrders());
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // PUT /api/orders/cancel/{orderId}?customerId=1
    @PutMapping("/cancel/{orderId}")
    public ResponseEntity<ApiResponse> cancel(@PathVariable String orderId,
                                              @RequestParam Integer customerId) {
        try {
            return ResponseEntity.ok(orderService.cancelOrder(orderId, customerId));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}
