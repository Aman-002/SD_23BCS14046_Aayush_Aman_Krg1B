package com.grocery.order.controller;

import com.grocery.order.dto.ApiResponse;
import com.grocery.order.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired private CartService cartService;

    // GET /api/cart/{customerId}
    @GetMapping("/{customerId}")
    public ResponseEntity<ApiResponse> getCart(@PathVariable Integer customerId) {
        try {
            return ResponseEntity.ok(cartService.getCart(customerId));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // POST /api/cart/add
    @PostMapping("/add")
    public ResponseEntity<ApiResponse> addToCart(@RequestBody Map<String, Integer> body) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(cartService.addToCart(
                            body.get("customerId"),
                            body.get("productId"),
                            body.get("quantity")));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // PUT /api/cart/update/{cartItemId}
    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<ApiResponse> updateItem(
            @PathVariable Integer cartItemId,
            @RequestBody Map<String, Integer> body) {
        try {
            return ResponseEntity.ok(
                    cartService.updateCartItem(cartItemId, body.get("quantity")));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // DELETE /api/cart/remove/{cartItemId}
    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<ApiResponse> removeItem(@PathVariable Integer cartItemId) {
        try {
            return ResponseEntity.ok(cartService.removeCartItem(cartItemId));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}
